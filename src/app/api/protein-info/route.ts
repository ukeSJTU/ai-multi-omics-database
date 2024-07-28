import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const alias = searchParams.get("alias");

  if (!id && !alias) {
    return NextResponse.json(
      { error: "Either id or alias is required" },
      { status: 400 }
    );
  }

  try {
    let protein;

    if (id) {
      protein = await prisma.protein.findUnique({
        where: { id: id },
        select: { alias: true },
      });

      if (protein) {
        return NextResponse.json({ alias: protein.alias });
      }
    } else if (alias) {
      protein = await prisma.protein.findFirst({
        where: { alias },
        select: { id: true },
      });

      if (protein) {
        return NextResponse.json({ id: protein.id });
      }
    }

    return NextResponse.json({ error: "Protein not found" }, { status: 404 });
  } catch (error) {
    console.error("Request error", error);
    return NextResponse.json(
      { error: "Error fetching protein information" },
      { status: 500 }
    );
  }
}
