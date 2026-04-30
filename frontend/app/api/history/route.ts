import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://nutrisync-backend-428451287285.asia-south1.run.app/api/history");
  const data = await res.json();
  return NextResponse.json(data);
}
