import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
export async function GET() {
    try {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
      const client = await clientPromise;
      const db = client.db("zenlarn");
      const channels = await db.collection("channels").find({ participants: userId }).toArray();
  
      return NextResponse.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();// Double cast
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("zenlarn");
    const newChannel = {
      name,
      participants: [userId],
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