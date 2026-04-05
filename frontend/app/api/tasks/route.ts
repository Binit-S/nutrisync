import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { foods } = await req.json();
  try {
    for (const food of foods) {
      await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: `Buy ${food} for diet prep` }),
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tasks" }, { status: 500 });
  }
}
