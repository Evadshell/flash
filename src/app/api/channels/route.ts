import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth, clerkClient } from "@clerk/nextjs/server";
export async function GET() {
  try {
      const { userId } = await auth();
      const clerk = await clerkClient();
      if (!userId) throw new Error("User ID is null");
      const user = await clerk.users.getUser(userId);
      const email = user.emailAddresses[0].emailAddress;
      
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const client = await clientPromise;
      const db = client.db("zenlarn");
      const channels = await db.collection("channels")
          .find({ participants: email })
          .toArray();

      return NextResponse.json(channels);
  } catch (error) {
      console.error("Error fetching channels:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// api/channels POST
export async function POST(req: NextRequest) {
  try {
      const { userId } = await auth();
      const clerk = await clerkClient();
      if (!userId) throw new Error("User ID is null");
      const user = await clerk.users.getUser(userId);      const email = user.emailAddresses[0].emailAddress;
      
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { name } = await req.json();
      if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

      const client = await clientPromise;
      const db = client.db("zenlarn");
      const newChannel = {
          name,
          participants: [email],
          owner: email, // Add owner field
          createdAt: new Date(),
      };

      const result = await db.collection("channels").insertOne(newChannel);
      const savedChannel = { ...newChannel, _id: result.insertedId };
      return NextResponse.json(savedChannel, { status: 201 });
  } catch (error) {
      console.error("Error creating channel:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
