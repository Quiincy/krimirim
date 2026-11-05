import { Pool } from "pg";
import {
  INITIAL_CATEGORIES,
  INITIAL_GALLERY,
  INITIAL_MENU_ITEMS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from "./seed-data";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var _dbInitialized: Promise<void> | undefined;
}

const connectionString =
  process.env.DATABASE_URL || "postgresql://quincy@localhost:5432/krimirim";

export const pool: Pool =
  global._pgPool ||
  new Pool({
    connectionString,
    max: 15,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export async function ensureDbInitialized(): Promise<void> {
  if (global._dbInitialized) {
    return global._dbInitialized;
  }

  global._dbInitialized = (async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(200) NOT NULL,
          subtitle VARCHAR(300) DEFAULT '',
          culinary_group VARCHAR(50) NOT NULL DEFAULT 'rome',
          banner_image TEXT DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_visible BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS menu_items (
          id SERIAL PRIMARY KEY,
          category_slug VARCHAR(100) NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE CASCADE,
          name VARCHAR(300) NOT NULL,
          quote_badge VARCHAR(200) DEFAULT '',
          badge_color VARCHAR(50) DEFAULT '',
          description TEXT DEFAULT '',
          weight VARCHAR(100) DEFAULT '',
          price VARCHAR(100) NOT NULL,
          image_url TEXT DEFAULT '',
          is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
          is_popular BOOLEAN NOT NULL DEFAULT FALSE,
          is_available BOOLEAN NOT NULL DEFAULT TRUE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS gallery_photos (
          id SERIAL PRIMARY KEY,
          title VARCHAR(300) NOT NULL,
          category VARCHAR(100) NOT NULL DEFAULT 'interior',
          image_url TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_visible BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          author_name VARCHAR(200) NOT NULL,
          author_avatar VARCHAR(300) DEFAULT '',
          rating INTEGER NOT NULL DEFAULT 5,
          relative_time VARCHAR(100) DEFAULT 'нещодавно',
          text TEXT NOT NULL,
          source VARCHAR(100) DEFAULT 'google_maps',
          google_review_id VARCHAR(200) UNIQUE,
          is_visible BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reservations (
          id SERIAL PRIMARY KEY,
          customer_name VARCHAR(200) NOT NULL,
          customer_phone VARCHAR(100) NOT NULL,
          guests_count INTEGER NOT NULL DEFAULT 2,
          reservation_date VARCHAR(100) NOT NULL,
          reservation_time VARCHAR(100) NOT NULL,
          hall_preference VARCHAR(100) DEFAULT 'any',
          comment TEXT DEFAULT '',
          status VARCHAR(50) DEFAULT 'new',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Check if categories table is empty
      const { rows: catRows } = await client.query(
        "SELECT COUNT(*)::int AS cnt FROM categories"
      );
      if (catRows[0].cnt === 0) {
        for (const cat of INITIAL_CATEGORIES) {
          await client.query(
            `INSERT INTO categories (slug, name, subtitle, culinary_group, banner_image, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (slug) DO NOTHING`,
            [
              cat.slug,
              cat.name,
              cat.subtitle || "",
              cat.culinary_group,
              cat.banner_image || "",
              cat.sort_order,
            ]
          );
        }

        for (const item of INITIAL_MENU_ITEMS) {
          await client.query(
            `INSERT INTO menu_items (
               category_slug, name, quote_badge, badge_color, description,
               weight, price, image_url, is_spicy, is_popular, sort_order
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              item.category_slug,
              item.name,
              item.quote_badge || "",
              item.badge_color || "",
              item.description || "",
              item.weight || "",
              item.price,
              item.image_url || "",
              Boolean(item.is_spicy),
              Boolean(item.is_popular),
              item.sort_order,
            ]
          );
        }
      }

      // Check gallery
      const { rows: galRows } = await client.query(
        "SELECT COUNT(*)::int AS cnt FROM gallery_photos"
      );
      if (galRows[0].cnt === 0) {
        for (const photo of INITIAL_GALLERY) {
          await client.query(
            `INSERT INTO gallery_photos (title, category, image_url, sort_order)
             VALUES ($1, $2, $3, $4)`,
            [photo.title, photo.category, photo.image_url, photo.sort_order]
          );
        }
      }

      // Check reviews
      const { rows: revRows } = await client.query(
        "SELECT COUNT(*)::int AS cnt FROM reviews"
      );
      if (revRows[0].cnt === 0) {
        for (let i = 0; i < INITIAL_REVIEWS.length; i++) {
          const rev = INITIAL_REVIEWS[i];
          await client.query(
            `INSERT INTO reviews (author_name, author_avatar, rating, relative_time, text, source, google_review_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (google_review_id) DO NOTHING`,
            [
              rev.author_name,
              rev.author_avatar,
              rev.rating,
              rev.relative_time,
              rev.text,
              rev.source,
              `seed_review_${i + 1}`,
            ]
          );
        }
      }

      // Check settings
      const { rows: setRows } = await client.query(
        "SELECT COUNT(*)::int AS cnt FROM settings"
      );
      if (setRows[0].cnt === 0) {
        for (const [k, v] of Object.entries(INITIAL_SETTINGS)) {
          await client.query(
            `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
            [k, v]
          );
        }
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      global._dbInitialized = undefined;
      console.error("Database initialization error:", err);
      throw err;
    } finally {
      client.release();
    }
  })();

  return global._dbInitialized;
}

export async function getAllSiteData(includeHidden = false) {
  try {
    await ensureDbInitialized();

    const catQuery = includeHidden
      ? "SELECT * FROM categories ORDER BY sort_order ASC, id ASC"
      : "SELECT * FROM categories WHERE is_visible = TRUE ORDER BY sort_order ASC, id ASC";

    const itemQuery = includeHidden
      ? "SELECT * FROM menu_items ORDER BY sort_order ASC, id ASC"
      : "SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY sort_order ASC, id ASC";

    const galQuery = includeHidden
      ? "SELECT * FROM gallery_photos ORDER BY sort_order ASC, id ASC"
      : "SELECT * FROM gallery_photos WHERE is_visible = TRUE ORDER BY sort_order ASC, id ASC";

    const revQuery = includeHidden
      ? "SELECT * FROM reviews ORDER BY id DESC"
      : "SELECT * FROM reviews WHERE is_visible = TRUE ORDER BY id DESC";

    const [catsRes, itemsRes, galRes, revRes, setRes] = await Promise.all([
      pool.query(catQuery),
      pool.query(itemQuery),
      pool.query(galQuery),
      pool.query(revQuery),
      pool.query("SELECT key, value FROM settings"),
    ]);

    const settings: Record<string, string> = {};
    for (const row of setRes.rows) {
      settings[row.key] = row.value;
    }

    return {
      categories: catsRes.rows,
      menuItems: itemsRes.rows,
      gallery: galRes.rows,
      reviews: revRes.rows,
      settings,
      dbConnected: true,
    };
  } catch (error) {
    console.warn("PostgreSQL connection failed, serving fallback seed data:", error);
    // Graceful fallback for serverless / Vercel before DATABASE_URL is linked
    return {
      categories: INITIAL_CATEGORIES.map((c, idx) => ({
        id: idx + 1,
        slug: c.slug,
        name: c.name,
        subtitle: c.subtitle || "",
        culinary_group: c.culinary_group,
        banner_image: c.banner_image || "",
        sort_order: c.sort_order,
        is_visible: true,
      })),
      menuItems: INITIAL_MENU_ITEMS.map((m, idx) => ({
        id: idx + 1,
        category_slug: m.category_slug,
        name: m.name,
        quote_badge: m.quote_badge || "",
        badge_color: m.badge_color || "",
        description: m.description || "",
        weight: m.weight || "",
        price: m.price,
        image_url: m.image_url || "",
        is_spicy: Boolean(m.is_spicy),
        is_popular: Boolean(m.is_popular),
        is_available: true,
        sort_order: m.sort_order,
      })),
      gallery: INITIAL_GALLERY.map((g, idx) => ({
        id: idx + 1,
        title: g.title,
        category: g.category,
        image_url: g.image_url,
        sort_order: g.sort_order,
      })),
      reviews: INITIAL_REVIEWS.map((r, idx) => ({
        id: idx + 1,
        author_name: r.author_name,
        author_avatar: r.author_avatar,
        rating: r.rating,
        relative_time: r.relative_time,
        text: r.text,
        source: r.source,
      })),
      settings: INITIAL_SETTINGS,
      dbConnected: false,
    };
  }
}

