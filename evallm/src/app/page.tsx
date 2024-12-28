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
  //const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async () => {
    if (!message.trim()) return;

    // Add user message to the conversation
    const userMessage = { role: "user" as const, content: message };
    //setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    console.log("Query:", userMessage);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      console.log("response:", response);
      // Retrieve MULTIPLE LLM responses

      //const data = await response.json();
      
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
    <div className="min-h-screen flex bg-stone-800">
      
      <div className="flex-1 flex flex-col justify-between p-8">
        <h1 className="text-xl font-semibold text-white text-center"> Evallm </h1>

        <div className="fixed top-3 right-10 space-y-4 bg-emerald-700  p-3 rounded-xl">
          <button>Login</button>
        </div>

      </div>
        
        
      {/* Input Area */}
      <div className="fixed bottom-0 w-full bg-stone-900 border-t border-gray-950 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSubmit()}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-transparent placeholder-stone-400"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-emerald-700 text-white px-5 py-3 rounded-xl hover:bg-emerald-800 transition-all disabled:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
}
