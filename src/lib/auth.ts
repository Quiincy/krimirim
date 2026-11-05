import { NextRequest } from "next/server";
import { pool, ensureDbInitialized } from "./db";

export async function verifyAdminRequest(req: NextRequest): Promise<boolean> {
  await ensureDbInitialized();
  const headerToken = req.headers.get("x-admin-password") || "";
  const cookieToken = req.cookies.get("krimirim_admin")?.value || "";
  const candidate = headerToken || cookieToken;

  if (!candidate) return false;

  const envPassword = process.env.ADMIN_PASSWORD || "krymirome";
  if (candidate === envPassword) return true;

  try {
    const { rows } = await pool.query(
      "SELECT value FROM settings WHERE key = 'admin_password'"
    );
    if (rows.length > 0 && rows[0].value === candidate) {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

