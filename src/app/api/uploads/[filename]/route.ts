import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const cleanName = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", cleanName);

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(cleanName).toLowerCase();

    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeMap[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

