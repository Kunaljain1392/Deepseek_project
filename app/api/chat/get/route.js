import connectDB from "@/config/db";
import chat from "@/model/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const chats = await chat.find({ userId }).sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      data: chats,
    });

  } catch (error) {
    console.error("Get Chats Error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}