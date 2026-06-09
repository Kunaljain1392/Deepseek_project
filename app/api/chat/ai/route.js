export const maxDuration = 60;
import connectDB from "@/config/db";
import chat from "@/model/Chat";

import { getAuth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    // extract chatid and prompt from the request body

    const { chatId, prompt } = await req.json();

    console.log("Received chatId:", chatId);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json({
        Success: false,
        message: "User not authenticated",
      });
    }

    await connectDB();

    // find chat document in the database
    const data = await chat.findOne({ userId, _id: chatId });
    console.log("DB result:", data);

    if (!data) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // create a user message object

    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    let completion;

    try {
      completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
      });
    } catch (apiError) {
      console.error("Groq FULL ERROR:", JSON.stringify(apiError, null, 2));

      return NextResponse.json(
        { error: "Groq API failed", details: apiError.message },
        { status: 500 },
      );
    }

    const message = completion.choices[0].message;

    if (!message) {
      return NextResponse.json(
        { error: "Invalid response from Groq" },
        { status: 500 },
      );
    }

    console.log("Groq completion:", completion);
    console.log("Final message:", message);

    message.timestamp = Date.now();
    data.messages.push(message);
    await data.save();

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("Groq Error:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
