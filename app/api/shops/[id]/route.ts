import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const shop = await prisma.shop.findUnique({
    where: { id },
    include: {
      googleAccount: true,
      fixedCostItems: { orderBy: { createdAt: "asc" } },
      revenueEntries: { orderBy: { date: "desc" } },
    },
  });
  if (!shop) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(shop);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const shop = await prisma.shop.update({ where: { id }, data: { name } });
  return NextResponse.json(shop);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.shop.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
