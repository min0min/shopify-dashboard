import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const account = await prisma.googleAccount.findUnique({
    where: { id },
    include: {
      shops: {
        orderBy: { order: "asc" },
        include: { fixedCostItems: true, revenueEntries: true },
      },
    },
  });
  if (!account) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(account);
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
  const account = await prisma.googleAccount.update({
    where: { id },
    data: { name },
  });
  return NextResponse.json(account);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.googleAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
