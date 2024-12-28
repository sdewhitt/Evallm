"use client";
import { useState } from "react";
/*
type Link = {
  summary: string; // The AI-generated summary
  url: string;     // The corresponding hyperlink
};
type Message = {
  role: "user" | "ai";
  content: string;
  links?: Link[];
};
*/

export default function Home() {

  const [message, setMessage] = useState("");
  //const [messages, setMessages] = useState<Message[]>([{ role: "ai", content: "Hello! How can I help you today?" },]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async () => {
    if (!message.trim()) return;

    // Add user message to the conversation
    const userMessage = { role: "user" as const, content: message };
    //setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      // Retrieve MULTIPLE LLM responses

      const data = await response.json();

      // Display each LLM response
      //const aiMessage: Message = { role: 'ai', content: data.message };
      //setMessages((prev) => [...prev, aiMessage]);


    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex bg-indigo-950">
      
      <div className="flex-1 flex flex-col justify-between p-8">
        <h1 className="text-xl font-semibold text-white text-center"> 
          Evallm
        </h1>

        <div className="fixed top-3 right-10 space-y-4 bg-indigo-900  p-3 rounded-xl">
        <button>Login</button>
        
      </div>
        {/* Prompt and Sumbit Boxes */}
        <footer className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                placeholder="Type your prompt here..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}
