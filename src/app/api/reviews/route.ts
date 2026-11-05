import { NextRequest, NextResponse } from "next/server";
import { pool, ensureDbInitialized } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDbInitialized();

  try {
    const body = await req.json();
    const {
      author_name,
      author_avatar = "",
      rating = 5,
      relative_time = "нещодавно",
      text,
      source = "google_maps",
      is_visible = true,
    } = body;

    if (!author_name || !text) {
      return NextResponse.json(
        { error: "Ім'я автора та текст відгуку обов'язкові" },
        { status: 400 }
      );
    }

    const initials =
      author_avatar ||
      author_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const { rows } = await pool.query(
      `INSERT INTO reviews (
        author_name, author_avatar, rating, relative_time, text, source, google_review_id, is_visible
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        author_name,
        initials,
        Number(rating) || 5,
        relative_time,
        text,
        source,
        `manual_${Date.now()}`,
        Boolean(is_visible),
      ]
    );

    return NextResponse.json({ review: rows[0] });
  } catch (error) {
    console.error("Add review error:", error);
    return NextResponse.json(
      { error: "Помилка додавання відгуку" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDbInitialized();

  try {
    const body = await req.json();
    const {
      id,
      author_name,
      rating = 5,
      relative_time = "нещодавно",
      text,
      is_visible = true,
    } = body;

    const { rows } = await pool.query(
      `UPDATE reviews SET
        author_name = $1,
        rating = $2,
        relative_time = $3,
        text = $4,
        is_visible = $5
      WHERE id = $6
      RETURNING *`,
      [
        author_name,
        Number(rating) || 5,
        relative_time,
        text,
        Boolean(is_visible),
        Number(id),
      ]
    );

    return NextResponse.json({ review: rows[0] });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { error: "Помилка оновлення відгуку" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDbInitialized();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await pool.query("DELETE FROM reviews WHERE id = $1", [Number(id)]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { error: "Помилка видалення відгуку" },
      { status: 500 }
    );
  }
}

