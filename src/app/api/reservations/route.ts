import { NextRequest, NextResponse } from "next/server";
import { pool, ensureDbInitialized } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await ensureDbInitialized();
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      guests_count = 2,
      reservation_date,
      reservation_time,
      hall_preference = "any",
      comment = "",
    } = body;

    if (!customer_name || !customer_phone || !reservation_date || !reservation_time) {
      return NextResponse.json(
        { error: "Будь ласка, заповніть ім'я, телефон, дату та час" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO reservations (
        customer_name, customer_phone, guests_count, reservation_date,
        reservation_time, hall_preference, comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        customer_name,
        customer_phone,
        Number(guests_count) || 2,
        reservation_date,
        reservation_time,
        hall_preference,
        comment,
      ]
    );

    return NextResponse.json({ reservation: rows[0] });
  } catch (error) {
    console.error("Reservation error:", error);
    return NextResponse.json(
      { error: "Помилка бронювання столика" },
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
    const { id, status } = await req.json();
    const { rows } = await pool.query(
      "UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *",
      [status, Number(id)]
    );
    return NextResponse.json({ reservation: rows[0] });
  } catch (error) {
    console.error("Update reservation error:", error);
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
    await pool.query("DELETE FROM reservations WHERE id = $1", [Number(id)]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete reservation error:", error);
    return NextResponse.json({ error: "Помилка видалення" }, { status: 500 });
  }
}

