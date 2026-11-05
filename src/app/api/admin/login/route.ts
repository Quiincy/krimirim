import { NextRequest, NextResponse } from "next/server";
import { pool, ensureDbInitialized } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = body.password || "";
    const envPassword = process.env.ADMIN_PASSWORD || "krymirome";

    let valid = password === envPassword;
    if (!valid) {
      try {
        await ensureDbInitialized();
        const { rows } = await pool.query(
          "SELECT value FROM settings WHERE key = 'admin_password'"
        );
        if (rows.length > 0 && rows[0].value === password) {
          valid = true;
        }
      } catch {
        // ignore DB connection error
      }
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Невірний пароль адміністратора" },
        { status: 401 }
      );
    }

    // Try initializing DB in background if available
    ensureDbInitialized().catch(() => {});

    const res = NextResponse.json({ ok: true });
    res.cookies.set("krimirim_admin", password, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
