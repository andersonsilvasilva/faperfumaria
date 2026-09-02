import { NextResponse } from "next/server";
import { getFavoriteProductIds } from "@/modules/favorites/queries";

export async function GET() {
  const productIds = await getFavoriteProductIds();
  return NextResponse.json({ productIds });
}
