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
  const memo =
    typeof body.memo === "string" && body.memo.trim() ? body.memo.trim() : null;
  if (!date || !DATE_RE.test(date) || Number.isNaN(amount) || Number.isNaN(orderCost)) {
    return NextResponse.json(
      { error: "date (YYYY-MM-DD), amount and orderCost are required" },
      { status: 400 }
    );
  }
  const entry = await prisma.revenueEntry.create({
    data: { shopId, date, amount, orderCost, memo },
  });
  return NextResponse.json(entry, { status: 201 });
}
