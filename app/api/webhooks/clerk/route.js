import { Webhook } from "svix";
import { headers } from "next/headers";
import User from "@/models/User";
import connectDB from "@/lib/connectDB";

export async function POST(req) {
  const body = await req.text();

  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  await connectDB();

  if (evt.type === "user.created") {
    const user = evt.data;

    await User.create({
      _id: user.id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      email: user.email_addresses[0].email_address,
    });
  }

  return Response.json({ success: true });
}