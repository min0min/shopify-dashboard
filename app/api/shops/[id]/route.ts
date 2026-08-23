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

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; activeFrom?: string } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    data.name = name;
  }

  if (typeof body.activeFrom === "string") {
    if (!DATE_RE.test(body.activeFrom)) {
      return NextResponse.json({ error: "activeFrom must be YYYY-MM-DD" }, { status: 400 });
    }
    data.activeFrom = body.activeFrom;
  }

  const shop = await prisma.shop.update({ where: { id }, data });
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
