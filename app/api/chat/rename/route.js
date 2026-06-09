import connectDB from "@/config/db";
import Chat from "@/model/Chat";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { chatId, name } = await req.json();

    if (!chatId || !name) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { name },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chat renamed successfully",
      data: updatedChat,
    });

  } catch (error) {
    console.error("Rename Error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}