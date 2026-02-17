import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createListSchema = z.object({
  name: z.string().trim().min(1).max(100)
});

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lists = await prisma.customList.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: {
          listWords: true,
          userWords: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ lists });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = createListSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const list = await prisma.customList.create({
    data: {
      name: parsed.data.name,
      userId: session.user.id
    }
  });

  return NextResponse.json({ list }, { status: 201 });
}
