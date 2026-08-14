import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: { memo: string | null } = {
    memo: typeof body.memo === "string" && body.memo.trim() ? body.memo.trim() : null,
  };
  const entry = await prisma.revenueEntry.update({ where: { id }, data });
  return NextResponse.json(entry);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.revenueEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
