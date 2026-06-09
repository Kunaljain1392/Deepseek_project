import connectDB from "@/config/db";
import Chat from "@/model/Chat";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Chat ID required" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}