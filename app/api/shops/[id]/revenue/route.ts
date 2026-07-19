import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shopId } = await params;
  const body = await req.json();
  const date = body.date as string | undefined;
  const amount = Number(body.amount);
  const orderCost = body.orderCost === undefined ? 0 : Number(body.orderCost);
  if (!date || !DATE_RE.test(date) || Number.isNaN(amount) || Number.isNaN(orderCost)) {
    return NextResponse.json(
      { error: "date (YYYY-MM-DD), amount and orderCost are required" },
      { status: 400 }
    );
  }
  const entry = await prisma.revenueEntry.upsert({
    where: { shopId_date: { shopId, date } },
    update: { amount, orderCost },
    create: { shopId, date, amount, orderCost },
  });
  return NextResponse.json(entry, { status: 201 });
}
