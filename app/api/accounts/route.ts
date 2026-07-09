import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const accounts = await prisma.googleAccount.findMany({
    orderBy: { order: "asc" },
    include: {
      shops: {
        orderBy: { order: "asc" },
        include: { fixedCostItems: true, revenueEntries: true },
      },
    },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const count = await prisma.googleAccount.count();
  const account = await prisma.googleAccount.create({
    data: { name, order: count },
  });
  return NextResponse.json(account, { status: 201 });
}
