import { NextRequest, NextResponse } from "next/server";
import { pool, ensureDbInitialized } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDbInitialized();

  try {
    const body = await req.json();
    const settingsObj = body.settings || body;

    for (const [key, value] of Object.entries(settingsObj)) {
      if (typeof value === "string") {
        await pool.query(
          `INSERT INTO settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [key, value]
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Помилка збереження налаштувань" },
      { status: 500 }
    );
  }
}

