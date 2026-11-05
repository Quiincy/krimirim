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
      category_slug,
      name,
      quote_badge = "",
      badge_color = "",
      description = "",
      weight = "",
      price,
      image_url = "",
      is_spicy = false,
      is_popular = false,
      is_available = true,
      sort_order = 0,
    } = body;

    if (!category_slug || !name || !price) {
      return NextResponse.json(
        { error: "Назва, категорія та ціна обов'язкові" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO menu_items (
        category_slug, name, quote_badge, badge_color, description,
        weight, price, image_url, is_spicy, is_popular, is_available, sort_order
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        category_slug,
        name,
        quote_badge,
        badge_color,
        description,
        weight,
        String(price),
        image_url,
        Boolean(is_spicy),
        Boolean(is_popular),
        Boolean(is_available),
        Number(sort_order) || 0,
      ]
    );

    return NextResponse.json({ item: rows[0] });
  } catch (error) {
    console.error("Create menu item error:", error);
    return NextResponse.json({ error: "Помилка збереження" }, { status: 500 });
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
      category_slug,
      name,
      quote_badge = "",
      badge_color = "",
      description = "",
      weight = "",
      price,
      image_url = "",
      is_spicy = false,
      is_popular = false,
      is_available = true,
      sort_order = 0,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID обов'язковий" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `UPDATE menu_items SET
        category_slug = $1,
        name = $2,
        quote_badge = $3,
        badge_color = $4,
        description = $5,
        weight = $6,
        price = $7,
        image_url = $8,
        is_spicy = $9,
        is_popular = $10,
        is_available = $11,
        sort_order = $12
      WHERE id = $13
      RETURNING *`,
      [
        category_slug,
        name,
        quote_badge,
        badge_color,
        description,
        weight,
        String(price),
        image_url,
        Boolean(is_spicy),
        Boolean(is_popular),
        Boolean(is_available),
        Number(sort_order) || 0,
        Number(id),
      ]
    );

    return NextResponse.json({ item: rows[0] });
  } catch (error) {
    console.error("Update menu item error:", error);
    return NextResponse.json({ error: "Помилка оновлення" }, { status: 500 });
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
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    await pool.query("DELETE FROM menu_items WHERE id = $1", [Number(id)]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete menu item error:", error);
    return NextResponse.json({ error: "Помилка видалення" }, { status: 500 });
  }
}

