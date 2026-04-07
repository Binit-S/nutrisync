import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized - No access token found in session" }, { status: 401 });
  }

  const { foods } = await req.json();
  try {
    for (const food of foods) {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: `Buy ${food} for diet prep` }),
      });
        if (!res.ok) {
        const errorText = await res.text();
        console.error("Google Tasks API Error:", errorText);
        return NextResponse.json({ error: `Tasks API Failed: ${res.status} - ${errorText}` }, { status: res.status });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Internal Server Error during task creation:", error);
    return NextResponse.json({ error: error.message || "Failed to create tasks" }, { status: 500 });
  }
}
