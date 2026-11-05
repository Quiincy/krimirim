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
      slug,
      name,
      subtitle = "",
      culinary_group = "rome",
      banner_image = "",
      sort_order = 0,
      is_visible = true,
    } = body;

    const cleanSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
        .replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const { rows } = await pool.query(
      `INSERT INTO categories (slug, name, subtitle, culinary_group, banner_image, sort_order, is_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        cleanSlug,
        name,
        subtitle,
        culinary_group,
        banner_image,
        Number(sort_order) || 0,
        Boolean(is_visible),
      ]
    );
    return NextResponse.json({ category: rows[0] });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Помилка створення категорії" },
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
      name,
      subtitle = "",
      culinary_group = "rome",
      banner_image = "",
      sort_order = 0,
      is_visible = true,
    } = body;

    const { rows } = await pool.query(
      `UPDATE categories SET
        name = $1,
        subtitle = $2,
        culinary_group = $3,
        banner_image = $4,
        sort_order = $5,
        is_visible = $6
       WHERE id = $7
       RETURNING *`,
      [
        name,
        subtitle,
        culinary_group,
        banner_image,
        Number(sort_order) || 0,
        Boolean(is_visible),
        Number(id),
      ]
    );
    return NextResponse.json({ category: rows[0] });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Помилка оновлення категорії" },
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
    await pool.query("DELETE FROM categories WHERE id = $1", [Number(id)]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Помилка видалення категорії" },
      { status: 500 }
    );
  }
}

