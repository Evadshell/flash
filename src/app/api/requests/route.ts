import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

// GET: Fetch sent and received requests for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("zenlarn");

    // Fetch sent requests
    const sentRequests = await db
      .collection("channel_requests")
      .find({ senderId: userId })
      .toArray();

    // Fetch received requests (where the user is the target)
    const receivedRequests = await db
      .collection("channel_requests")
      .find({ targetId: userId })
      .toArray();

    return NextResponse.json({ sentRequests, receivedRequests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Send a channel request
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { channelId, targetId } = await req.json();
    if (!channelId || !targetId) return NextResponse.json({ error: "Missing channelId or targetId" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("zenlarn");

    // Check if the channel exists and the user is a participant
    const channel = await db.collection("channels").findOne({ _id: channelId, participants: userId });
    if (!channel) return NextResponse.json({ error: "Channel not found or unauthorized" }, { status: 404 });

    // Check if request already exists
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
      status: "pending", // "pending", "accepted", "rejected"
      createdAt: new Date(),
    };

    const result = await db.collection("channel_requests").insertOne(newRequest);
    return NextResponse.json({ ...newRequest, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error sending request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Accept or reject a request
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { requestId, action } = await req.json(); // action: "accept" or "reject"
    if (!requestId || !action) return NextResponse.json({ error: "Missing requestId or action" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("zenlarn");

    const request = await db.collection("channel_requests").findOne({ _id: requestId, targetId: userId });
    if (!request) return NextResponse.json({ error: "Request not found or unauthorized" }, { status: 404 });

    if (action === "accept") {
      // Update request status
      await db.collection("channel_requests").updateOne(
        { _id: requestId },
        { $set: { status: "accepted", updatedAt: new Date() } }
      );

      // Add targetId to channel participants
      await db.collection("channels").updateOne(
        { _id: request.channelId },
        { $addToSet: { participants: request.targetId } }
      );

      return NextResponse.json({ message: "Request accepted", channelId: request.channelId });
    } else if (action === "reject") {
      await db.collection("channel_requests").updateOne(
        { _id: requestId },
        { $set: { status: "rejected", updatedAt: new Date() } }
      );
      return NextResponse.json({ message: "Request rejected" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}