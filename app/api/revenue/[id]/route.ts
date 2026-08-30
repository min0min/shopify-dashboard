import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: { date?: string; amount?: number; orderCost?: number; memo?: string | null } = {};

  if (typeof body.date === "string") {
    if (!DATE_RE.test(body.date)) {
      return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
    }
    data.date = body.date;
  }
  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (Number.isNaN(amount)) {
      return NextResponse.json({ error: "invalid amount" }, { status: 400 });
    }
    data.amount = amount;
  }
  if (body.orderCost !== undefined) {
    const orderCost = Number(body.orderCost);
    if (Number.isNaN(orderCost)) {
      return NextResponse.json({ error: "invalid orderCost" }, { status: 400 });
    }
    data.orderCost = orderCost;
  }
  if (typeof body.memo === "string") {
    data.memo = body.memo.trim() ? body.memo.trim() : null;
  }

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
