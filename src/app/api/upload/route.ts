import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Файл не обрано" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };
    const mime = mimeMap[ext] || "image/jpeg";

    // Try saving to public/uploads (local development or VPS Docker)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `upload_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        url: `/api/uploads/${fileName}`,
        fileName,
      });
    } catch {
      // Vercel serverless environment has a read-only filesystem (/var/task)
      // Graceful fallback to Data URI so uploaded images display instantly anywhere
      const base64 = buffer.toString("base64");
      const dataUri = `data:${mime};base64,${base64}`;
      return NextResponse.json({
        url: dataUri,
        fileName: file.name,
      });
    }
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Помилка завантаження файлу" },
      { status: 500 }
    );
  }
}
