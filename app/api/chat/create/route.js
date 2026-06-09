import connectDB from "@/config/db";
import Chat from "@/model/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const newChat = await Chat.create({
      userId,
      messages: [],   // ✅ correct field
      name: "New Chat",
    });

    return NextResponse.json({
      success: true,
      data: newChat,
    });

  } catch (error) {
    console.error("Create Chat Error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}