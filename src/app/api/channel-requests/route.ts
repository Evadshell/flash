import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const clerk = await clerkClient();
        if (!userId) throw new Error("User ID is null");
        const user = await clerk.users.getUser(userId);        const email = user.emailAddresses[0].emailAddress;
        
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { channelId, targetEmail } = await req.json();
        if (!channelId || !targetEmail) {
            return NextResponse.json({ error: "Missing channelId or targetEmail" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("zenlarn");
        const channelObjectId = new ObjectId(channelId);

        const channel = await db.collection("channels").findOne({ 
            _id: channelObjectId, 
            participants: email 
        });

        if (!channel) {
            return NextResponse.json({ error: "Channel not found or unauthorized" }, { status: 404 });
        }

        const existingRequest = await db.collection("channel_requests").findOne({
            senderEmail: email,
            targetEmail,
            channelId: channelObjectId,
        });

        if (existingRequest) {
            return NextResponse.json({ error: "Request already sent" }, { status: 400 });
        }

        const newRequest = {
            senderEmail: email,
            targetEmail,
            channelId: channelObjectId,
            status: "pending",
            createdAt: new Date(),
        };

        const result = await db.collection("channel_requests").insertOne(newRequest);
        return NextResponse.json(
            { ...newRequest, _id: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error sending request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Add new PATCH endpoint for accepting/rejecting requests
export async function PATCH(req: NextRequest) {
    try {
        const { userId } = await auth();
        const clerk = await clerkClient();
        if (!userId) throw new Error("User ID is null");
        const user = await clerk.users.getUser(userId);        const email = user.emailAddresses[0].emailAddress;
        
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { requestId, action } = await req.json();
        const client = await clientPromise;
        const db = client.db("zenlarn");

        const request = await db.collection("channel_requests").findOne({
            _id: new ObjectId(requestId),
            targetEmail: email,
            status: "pending"
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found or already processed" }, { status: 404 });
        }

        if (action === "accept") {
            // Update channel participants
            await db.collection("channels").updateOne(
                { _id: request.channelId },
                { $addToSet: { participants: email } }
            );
            
            // Update request status
            await db.collection("channel_requests").updateOne(
                { _id: new ObjectId(requestId) },
                { $set: { status: "accepted" } }
            );
            
            return NextResponse.json({ 
                message: "Request accepted",
                channelId: request.channelId 
            });
        } else {
            // Reject request
            await db.collection("channel_requests").updateOne(
                { _id: new ObjectId(requestId) },
                { $set: { status: "rejected" } }
            );
            return NextResponse.json({ message: "Request rejected" });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
