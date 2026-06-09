import React, { useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const Message = ({ role, content }) => {
  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div
        className={`flex flex-col w-full mb-8 ${role === "user" && "items-end"} `}
      >
        <div
          className={`group relative flex max-w-2xl py-3 rounded-xl ${role === "user" ? "bg-[#414158] px-5 " : "gap-3"} `}
        >
          <div
            className={`opacity-0 group-hover:opacity-100 absolute ${role === "user" ? "-left-10 top-2.5" : "left-9 -bottom-6 "} transition-all `}
          >
            <div className="flex items-center gap-2 opacity-70">
              {role === "user" ? (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                  <Image
                    src={assets.pencil_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                </>
              ) : (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt=""
                    className="w-4.5 cursor-pointer"
                  />
                  <Image
                    src={assets.regenerate_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                  <Image
                    src={assets.like_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                  <Image
                    src={assets.dislike_icon}
                    alt=""
                    className="w-4.5 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
          {role === "user" ? (
            <span className="text-white/90">{content}</span>
          ) : (
            <>
              <Image
                src={assets.logo_icon}
                alt=""
                className="h-9 w-9 p-1 border border-white/15 rounded-full "
              />
              <div className="space-y-4 w-full overflow-scroll ">
                <Markdown
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");

                      if (!inline && match) {
                        return (
                          <div className="relative group">
                            {/* 🔥 Copy button */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                                toast.success("Code copied");
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-black/60 hover:bg-black px-2 py-1 rounded text-xs"
                            >
                              Copy
                            </button>

                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                background: "#0b0f19", // 🔥 deeper uniform dark
                                padding: "16px",
                                borderRadius: "12px",
                                fontSize: "13px",
                              }}
                              codeTagProps={{
                                style: {
                                  background: "transparent", // 🔥 removes inner highlight patches
                                },
                              }}
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }

                      // inline code
                      return (
                        <code className="bg-[#1f2937] px-1.5 py-0.5 rounded text-sm">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </Markdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
