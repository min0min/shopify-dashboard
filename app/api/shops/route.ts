import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const googleAccountId = body.googleAccountId as string | undefined;
  if (!name || !googleAccountId) {
    return NextResponse.json(
      { error: "name and googleAccountId are required" },
      { status: 400 }
    );
  }
  const count = await prisma.shop.count({ where: { googleAccountId } });
  const shop = await prisma.shop.create({
    data: { name, googleAccountId, order: count },
  });
  return NextResponse.json(shop, { status: 201 });
}
