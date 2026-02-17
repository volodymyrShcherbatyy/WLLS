import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createListSchema = z.object({
  name: z.string().trim().min(1).max(100)
});

type ListWithWordCounts = Prisma.CustomListGetPayload<{
  include: {
    _count: {
      select: {
        listWords: true;
        userWordLinks: true;
      };
    };
  };
}>;

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let lists: ListWithWordCounts[];

  try {
    lists = await prisma.customList.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            listWords: true,
            userWordLinks: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2021") {
      throw error;
    }

    const fallbackLists = await prisma.customList.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            listWords: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    lists = fallbackLists.map((list) => ({
      ...list,
      _count: {
        ...list._count,
        userWordLinks: 0
      }
    }));
  }

  return NextResponse.json({
    lists: lists.map((list) => ({
      ...list,
      _count: {
        ...list._count,
        userWords: list._count.userWordLinks
      }
    }))
  });
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
