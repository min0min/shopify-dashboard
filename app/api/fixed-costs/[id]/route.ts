import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; amount?: number } = {};
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (Number.isNaN(amount)) {
      return NextResponse.json({ error: "invalid amount" }, { status: 400 });
    }
    data.amount = amount;
  }
  const item = await prisma.fixedCostItem.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.fixedCostItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
