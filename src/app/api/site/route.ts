import { NextRequest, NextResponse } from "next/server";
import { getAllSiteData, pool } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    const data = await getAllSiteData(isAdmin);

    let reservations = [];
    if (isAdmin) {
      const res = await pool.query(
        "SELECT * FROM reservations ORDER BY created_at DESC LIMIT 100"
      );
      reservations = res.rows;
    }

    return NextResponse.json({
      ...data,
      reservations,
      isAdmin,
    });
  } catch (error) {
    console.error("Error fetching site data:", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити дані сайту" },
      { status: 500 }
    );
  }
}

