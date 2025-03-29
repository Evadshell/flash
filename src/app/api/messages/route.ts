import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth(); // Double cast
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("zenlarn");
    const messages = await db
      .collection("messages")
      .find({ channelId: req.nextUrl.searchParams.get("channelId") || "general" })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth() ; // Double cast
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text, channelId } = await req.json();
    if (!text || !channelId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("zenlarn");
    const newMessage = {
      userId,
      channelId,
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(newMessage);
    const savedMessage = { ...newMessage, _id: result.insertedId };
    return NextResponse.json(savedMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}