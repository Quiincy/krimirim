import { NextRequest, NextResponse } from "next/server";
import { pool, ensureDbInitialized } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

interface ParsedGoogleReview {
  author_name: string;
  author_avatar: string;
  rating: number;
  relative_time: string;
  text: string;
  google_review_id: string;
}

async function fetchViaPlacesApi(
  apiKey: string,
  placeId: string
): Promise<{
  reviews: ParsedGoogleReview[];
  rating?: number;
  userRatingCount?: number;
}> {
  const cleanPlaceId = placeId.startsWith("0x")
    ? "ChIJ2beS9OvF1EARn6h16WR3frs"
    : placeId;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    cleanPlaceId
  )}&fields=name,rating,user_ratings_total,reviews&language=uk&reviews_sort=newest&key=${encodeURIComponent(
    apiKey
  )}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (data.status === "OK" && data.result) {
    const rawReviews = data.result.reviews || [];
    const parsed: ParsedGoogleReview[] = rawReviews
      .filter(
        (r: Record<string, unknown>) =>
          r.text && String(r.text).trim().length > 0
      )
      .map((r: Record<string, unknown>) => ({
        author_name: String(r.author_name || "Гість"),
        author_avatar: String(r.profile_photo_url || ""),
        rating: Number(r.rating) || 5,
        relative_time: String(r.relative_time_description || "нещодавно"),
        text: String(r.text || ""),
        google_review_id: `gplaces_${r.time || Date.now()}_${String(
          r.author_name || ""
        ).slice(0, 10)}`,
      }));

    return {
      reviews: parsed,
      rating: data.result.rating,
      userRatingCount: data.result.user_ratings_total,
    };
  }

  throw new Error(data.error_message || `Places API status: ${data.status}`);
}

async function parseGoogleMapsPlaceStream(): Promise<{
  reviews: ParsedGoogleReview[];
  rating?: number;
  userRatingCount?: number;
}> {
  const pbUrl =
    "https://www.google.com/maps/preview/place?authuser=0&hl=uk&gl=ua&pb=!1m14!1s0x40d4c5ebf4a2b7d9%3A0xbb7e7764e975a89f!3m9!1m3!1d3000!2d30.656502!3d50.406378!2m0!3m2!1i1024!2i768!4f13.1!4m2!3d50.406378!4d30.656502";

  const resp = await fetch(pbUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Accept-Language": "uk-UA,uk;q=0.9,en-US;q=0.8",
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new Error(`Google Maps HTTP ${resp.status}`);
  }

  const rawText = await resp.text();
  const cleanJson = rawText.replace(/^\)\]\}'\n?/, "");

  const parsedReviews: ParsedGoogleReview[] = [];
  let rating: number | undefined;
  let userRatingCount: number | undefined;

  const ratingMatch = cleanJson.match(/\[4\.([5-9]),\s*(\d{2,4})\]/);
  if (ratingMatch) {
    rating = parseFloat(`4.${ratingMatch[1]}`);
    userRatingCount = parseInt(ratingMatch[2], 10);
  }

  try {
    const data = JSON.parse(cleanJson);
    const walk = (node: unknown) => {
      if (!Array.isArray(node)) return;

      // In Google Maps place stream, actual user review nodes have a review ID starting with "ChdDSUhN" or "ChZDSUhN"
      if (
        typeof node[0] === "string" &&
        (node[0].startsWith("ChdDSUhN") || node[0].startsWith("ChZDSUhN"))
      ) {
        const revId = node[0];
        const rawStr = JSON.stringify(node);
        // Extract author name and review text if present
        const strings: string[] = [];
        const collectStrings = (n: unknown) => {
          if (typeof n === "string") strings.push(n);
          else if (Array.isArray(n)) n.forEach(collectStrings);
        };
        collectStrings(node);

        const textCandidates = strings.filter(
          (s) =>
            s.length > 35 &&
            !s.startsWith("http") &&
            !s.startsWith("Ch") &&
            /[а-яіїєґА-ЯІЇЄҐ]/.test(s)
        );
        const authorCandidate =
          strings.find(
            (s) =>
              s.length >= 3 &&
              s.length <= 35 &&
              !s.startsWith("http") &&
              !s.startsWith("Ch") &&
              /^[А-ЯІЇЄҐA-Z][а-яіїєґa-zА-ЯІЇЄҐA-Z\s'-]+$/.test(s)
          ) || "Гість закладу";

        if (textCandidates.length > 0 && rawStr) {
          parsedReviews.push({
            author_name: authorCandidate,
            author_avatar: authorCandidate
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            rating: 5,
            relative_time: "нещодавно",
            text: textCandidates[textCandidates.length - 1],
            google_review_id: revId,
          });
        }
        return;
      }

      for (const child of node) {
        if (Array.isArray(child)) walk(child);
      }
    };

    walk(data);
  } catch {
    // ignore parse error
  }

  return {
    reviews: parsedReviews,
    rating,
    userRatingCount,
  };
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDbInitialized();

  try {
    const { rows: setRows } = await pool.query(
      "SELECT key, value FROM settings WHERE key IN ('google_places_api_key', 'google_place_id')"
    );
    const settingsMap: Record<string, string> = {};
    for (const r of setRows) settingsMap[r.key] = r.value;

    const apiKey =
      settingsMap.google_places_api_key ||
      process.env.GOOGLE_PLACES_API_KEY ||
      "";
    const placeId =
      settingsMap.google_place_id ||
      process.env.GOOGLE_PLACE_ID ||
      "ChIJ2beS9OvF1EARn6h16WR3frs";

    let result: {
      reviews: ParsedGoogleReview[];
      rating?: number;
      userRatingCount?: number;
    } = { reviews: [] };
    let methodUsed = "google_maps_parser";

    if (apiKey.trim()) {
      try {
        result = await fetchViaPlacesApi(apiKey.trim(), placeId);
        methodUsed = "google_places_api";
      } catch (apiErr) {
        console.warn("Places API fallback to direct parser:", apiErr);
        result = await parseGoogleMapsPlaceStream();
      }
    } else {
      try {
        result = await parseGoogleMapsPlaceStream();
      } catch (parseErr) {
        console.warn("Direct parser warning:", parseErr);
      }
    }

    let insertedCount = 0;
    for (const rev of result.reviews) {
      const res = await pool.query(
        `INSERT INTO reviews (
          author_name, author_avatar, rating, relative_time, text, source, google_review_id
        ) VALUES ($1, $2, $3, $4, $5, 'google_maps', $6)
        ON CONFLICT (google_review_id) DO UPDATE SET
          relative_time = EXCLUDED.relative_time,
          rating = EXCLUDED.rating,
          text = EXCLUDED.text
        RETURNING id`,
        [
          rev.author_name,
          rev.author_avatar,
          rev.rating,
          rev.relative_time,
          rev.text,
          rev.google_review_id,
        ]
      );
      if (res.rowCount && res.rowCount > 0) insertedCount++;
    }

    if (result.rating) {
      await pool.query(
        `INSERT INTO settings (key, value, updated_at) VALUES ('google_rating', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [String(result.rating)]
      );
    }
    if (result.userRatingCount) {
      await pool.query(
        `INSERT INTO settings (key, value, updated_at) VALUES ('google_reviews_count', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [String(result.userRatingCount)]
      );
    }

    const nowStr = new Date().toLocaleString("uk-UA");
    await pool.query(
      `INSERT INTO settings (key, value, updated_at) VALUES ('last_reviews_sync', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [nowStr]
    );

    const { rows: allReviews } = await pool.query(
      "SELECT * FROM reviews ORDER BY id DESC"
    );

    return NextResponse.json({
      ok: true,
      methodUsed,
      syncedCount: insertedCount,
      totalReviews: allReviews.length,
      lastSync: nowStr,
      reviews: allReviews,
    });
  } catch (error) {
    console.error("Sync reviews error:", error);
    return NextResponse.json(
      { error: "Не вдалося синхронізувати відгуки з Google Maps" },
      { status: 500 }
    );
  }
}
