import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized - No access token found in session" }, { status: 401 });
  }

  const { buy_list } = await req.json();

  try {
    const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: "NutriSync" }),
    });

    const listData = await listRes.json();
    const listId = listData.id;

    const sections = Object.entries(buy_list);

    for (const [category, items] of sections) {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: `--- ${category.toUpperCase()} ---` }),
      });

      for (const item of items as string[]) {
         const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: item as string }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Google Tasks API Error:", errorText);
          return NextResponse.json({ error: `Tasks API Failed: ${res.status} - ${errorText}` }, { status: res.status });
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Internal Server Error during task creation:", error);
    return NextResponse.json({ error: error.message || "Failed to create tasks" }, { status: 500 });
  }
}

