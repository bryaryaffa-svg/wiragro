import { NextResponse } from "next/server";

import { searchGlobalContent } from "@/lib/global-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const results = await searchGlobalContent(query, { limitPerGroup: 6 });

  return NextResponse.json(results);
}
