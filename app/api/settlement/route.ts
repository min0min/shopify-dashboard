import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const type = body.type === "DEPOSIT" || body.type === "WITHDRAWAL" ? body.type : undefined;
  const date = body.date as string | undefined;
  const amount = Number(body.amount);
  const memo = typeof body.memo === "string" && body.memo.trim() ? body.memo.trim() : null;

  if (!type || !date || !DATE_RE.test(date) || Number.isNaN(amount)) {
    return NextResponse.json(
      { error: "type (DEPOSIT|WITHDRAWAL), date (YYYY-MM-DD) and amount are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.settlementEntry.create({
    data: { type, date, amount, memo },
  });
  return NextResponse.json(entry, { status: 201 });
}
