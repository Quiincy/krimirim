import { NextRequest, NextResponse } from "next/server";
import { pool, ensureDbInitialized } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbInitialized();
    const body = await req.json();
    const {
      title,
      category = "interior",
      image_url,
      sort_order = 0,
      is_visible = true,
    } = body;

    if (!image_url) {
      return NextResponse.json(
        { error: "Зображення обов'язкове" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO gallery_photos (title, category, image_url, sort_order, is_visible)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        title || "Фото Крим & Рим",
        category,
        image_url,
        Number(sort_order) || 0,
        Boolean(is_visible),
      ]
    );
    return NextResponse.json({ photo: rows[0] });
  } catch (error) {
    console.error("Create gallery photo error:", error);
    return NextResponse.json(
      {
        error:
          "База даних PostgreSQL не підключена. Додайте змінну DATABASE_URL у налаштуваннях Vercel.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbInitialized();
    const body = await req.json();
    const {
      id,
      title,
      category = "interior",
      image_url,
      sort_order = 0,
      is_visible = true,
    } = body;

    const { rows } = await pool.query(
      `UPDATE gallery_photos SET
        title = $1,
        category = $2,
        image_url = $3,
        sort_order = $4,
        is_visible = $5
       WHERE id = $6
       RETURNING *`,
      [
        title,
        category,
        image_url,
        Number(sort_order) || 0,
        Boolean(is_visible),
        Number(id),
      ]
    );
    return NextResponse.json({ photo: rows[0] });
  } catch (error) {
    console.error("Update gallery photo error:", error);
    return NextResponse.json(
      {
        error:
          "База даних PostgreSQL не підключена. Додайте змінну DATABASE_URL у налаштуваннях Vercel.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await pool.query("DELETE FROM gallery_photos WHERE id = $1", [Number(id)]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete gallery photo error:", error);
    return NextResponse.json(
      {
        error:
          "База даних PostgreSQL не підключена. Додайте змінну DATABASE_URL у налаштуваннях Vercel.",
      },
      { status: 500 }
    );
  }
}
