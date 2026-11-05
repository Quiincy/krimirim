import { NextRequest, NextResponse } from "next/server";
import { pool, ensureDbInitialized } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const { password } = await req.json();
    const envPassword = process.env.ADMIN_PASSWORD || "krymirome";

    let valid = password === envPassword;
    if (!valid) {
      const { rows } = await pool.query(
        "SELECT value FROM settings WHERE key = 'admin_password'"
      );
      if (rows.length > 0 && rows[0].value === password) {
        valid = true;
      }
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Невірний пароль адміністратора" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("krimirim_admin", password, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}

