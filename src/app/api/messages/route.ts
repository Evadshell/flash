// api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerk = await clerkClient();
    if (!userId) throw new Error("User ID is null");
    const user = await clerk.users.getUser(userId); 
        const email = user.emailAddresses[0].emailAddress;

    const client = await clientPromise;
    const db = client.db("zenlarn");
    const channelId = req.nextUrl.searchParams.get("channelId") || "general";

    const messages = await db
      .collection("messages")
      .find({ channelId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Remove POST since WebSocket handles message sending