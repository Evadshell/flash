import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("zenlarn");

    const sentRequests = await db.collection("channel_requests").find({ senderId: userId }).toArray();
    const receivedRequests = await db.collection("channel_requests").find({ targetId: userId }).toArray();

    return NextResponse.json({ sentRequests, receivedRequests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { channelId, targetId } = await req.json();
    if (!channelId || !targetId) return NextResponse.json({ error: "Missing channelId or targetId" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("zenlarn");

    const channel = await db.collection("channels").findOne({ _id: channelId, participants: userId });
    if (!channel) return NextResponse.json({ error: "Channel not found or unauthorized" }, { status: 404 });

    const existingRequest = await db.collection("channel_requests").findOne({
      senderId: userId,
      targetId,
      channelId,
    });
    if (existingRequest) return NextResponse.json({ error: "Request already sent" }, { status: 400 });

    const newRequest = {
      senderId: userId,
      targetId,
      channelId,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("channel_requests").insertOne(newRequest);
    return NextResponse.json({ ...newRequest, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error sending request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
