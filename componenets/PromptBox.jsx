"use client";
import React, { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    e.preventDefault();

    if (!user) return toast.error("Login to send message");
    if (isLoading) return toast.error("Wait for previous response");
    if (!prompt.trim()) return;

    let chatId = selectedChat?._id;

    // 🔥 if no chat → create one
    if (!chatId) {
      console.log("No chat found → creating new one");

      const { data } = await axios.post("/api/chat/create");

      if (data.success) {
        setSelectedChat(data.data);
        setChats((prev) => [data.data, ...prev]);

        chatId = data.data._id; // ✅ CRITICAL
      } else {
        return toast.error("Failed to create chat");
      }
    }

    const promptCopy = prompt;

    try {
      setIsLoading(true);
      setPrompt("");

      const userPrompt = {
        role: "user",
        content: promptCopy,
        timestamp: Date.now(),
      };

      // ✅ update chats list safely
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? {
                ...chat,
                messages: [...(chat.messages || []), userPrompt],
              }
            : chat,
        ),
      );

      // ✅ update selected chat safely
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), userPrompt],
      }));

      // 🔥 API CALL
      console.log("Final chatId being sent:", chatId);
      console.log("Prompt:", promptCopy);
      const { data } = await axios.post("/api/chat/ai", {
        chatId: chatId,
        prompt: promptCopy,
      });

      if (data.success) {
        const message = data.data.content;
        const messageTokens = message.split(" ");

        let assistantMessage = {
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        // add empty assistant message
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), assistantMessage],
        }));

        // typing effect
        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessage = {
              ...assistantMessage,
              content: messageTokens.slice(0, i + 1).join(" "),
            };

            setSelectedChat((prev) => {
              const updatedMessages = [...(prev?.messages || [])];
              updatedMessages[updatedMessages.length - 1] = assistantMessage;

              return { ...prev, messages: updatedMessages };
            });
          }, i * 80);
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message);
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${(selectedChat?.messages?.length || 0 ) > 0 ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepSeek"
        required
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full">
            <Image className="h-5" alt="" src={assets.deepthink_icon} />
            Deepthink(R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full">
            <Image className="h-5" alt="" src={assets.search_icon} />
            Search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" alt="" src={assets.pin_icon} />
          <button
            type="submit"
            className={`${prompt ? "bg-primary" : "bg-[#71717a]"} rounded-full p-2`}
          >
            <Image
              className="w-3.5 aspect-square"
              alt=""
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
