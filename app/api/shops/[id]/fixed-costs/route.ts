import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shopId } = await params;
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const amount = Number(body.amount);
  if (!name || Number.isNaN(amount)) {
    return NextResponse.json(
      { error: "name and amount are required" },
      { status: 400 }
    );
  }
  const item = await prisma.fixedCostItem.create({
    data: { name, amount, shopId },
  });
  return NextResponse.json(item, { status: 201 });
}
