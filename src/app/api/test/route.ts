import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
export async function GET() {
    const { userId } = await auth();
    const clerk = await clerkClient();
    if (!userId) throw new Error("User ID is null");
    const user = await clerk.users.getUser(userId);       const email = user.emailAddresses[0].emailAddress;
    
    const client = await clientPromise;
    const db = client.db("zenlarn");
    
    const sentRequests = await db.collection("channel_requests")
        .find({ senderEmail: email })
        .toArray();
    
    const receivedRequests = await db.collection("channel_requests")
        .find({ targetEmail: email })
        .toArray();
        
    return NextResponse.json({
        sentRequests,
        receivedRequests
    });
}
export async function POST(req: NextRequest) {
    try {
        // Authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse and validate request body
        const body = await req.json();
        const { channelId, targetId } = body;

        if (!channelId || !targetId) {
            return NextResponse.json({ error: "Missing channelId or targetId" }, { status: 400 });
        }

        // Connect to database
        const client = await clientPromise;
        const db = client.db("zenlarn");

        // Validate channelId is a valid ObjectId if needed
        let channelObjectId;
        try {
            channelObjectId = new ObjectId(channelId);
        } catch (e) {
            return NextResponse.json({ error: "Invalid channelId format" }, { status: 400 });
        }

        // Check channel exists and user is participant
        const channel = await db.collection("channels").findOne({ 
            _id: channelObjectId, 
            participants: userId 
        });

        if (!channel) {
            return NextResponse.json({ error: "Channel not found or unauthorized" }, { status: 404 });
        }

        // Check for existing request
        const existingRequest = await db.collection("channel_requests").findOne({
            senderId: userId,
            targetId,
            channelId: channelObjectId,
        });

        if (existingRequest) {
            return NextResponse.json({ error: "Request already sent" }, { status: 400 });
        }

        // Create new request
        const newRequest = {
            senderId: userId,
            targetId,
            channelId: channelObjectId,
            status: "pending" as const,
            createdAt: new Date(),
        };

        const result = await db.collection("channel_requests").insertOne(newRequest);

        return NextResponse.json(
            { ...newRequest, _id: result.insertedId },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error sending request:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}