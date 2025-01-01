"use client";
import React, { useState, useRef, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
//import { Chart, ChartConfiguration, ChartData, ChartOptions } from 'chart.js';

export default function Home() {

  const [message, setMessage] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  
  //const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);

  
  //const chartRef = useRef<HTMLCanvasElement>(null);

  const { data: session } = useSession();
  const defaultUser = 'Seth DeWhitt';
  

  if (!session) {
    return (
      <div>
        <h1>Welcome to Evallm!</h1>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </div>
    );
  }

  // Handle user input and retrieve LLM responses + evaluations
  const handleSubmit = async () => {
    // Clear the input field
    setMessage("");
    setExpectedOutput("");
    setIsLoading(true);
    try {
      if (!message.trim() || !expectedOutput.trim()) throw new Error("Please enter a user prompt and an expected output.");

      // Track the user prompt and expected output
      //const prompt = { role: "user" as const, content: message };
      //const expected = { role: "user" as const, content: !expectedOutput.trim() ? expectedOutput : "N/A" };


      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, expectedOutput, defaultUser }),
      });
      
      // Retrieve MULTIPLE LLM responses

      const data = await response.json();
      
      
      // Display each LLM response
      //const aiMessage: Message = { role: 'ai', content: data.message };
      //setMessages((prev) => [...prev, aiMessage]);


    } catch (error) {
      //console.error("Error:", error instanceof Error ? error.message : "unknown");
      setError(`${error instanceof Error ? error.message : "unknown"}`);
    } finally {
      setIsLoading(false);
    }
  };





  /* ========================== Bar Chart Generation ========================== *

  useEffect(() => {
    if (chartRef.current) {
      const data = [12, 19, 3, 5, 2, 3];
      const labels = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
      createBarChart(data, labels, chartRef.current);
    }
  }, []);

  const createBarChart = (data: number[], labels: string[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const chartData: ChartData<'bar'> = {
      labels: labels,
      datasets: [{
        label: 'Dataset',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    const chartOptions: ChartOptions<'bar'> = {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: chartData,
      options: chartOptions
    };

    new Chart(ctx, config);
  }; */


  /* ================================= UI functions ================================= */

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="min-h-screen flex bg-stone-800">
      
      <div className="flex-1 flex flex-col justify-between p-8">
        <h1 className="text-xl font-semibold text-white text-center"> Evallm </h1>

        <div className="fixed top-3 left-10 space-y-4 bg-emerald-700 hover:bg-emerald-800 transition-all p-3 rounded-xl">
          <button onClick={toggleSidebar}>Prompts</button>
        </div>

        <div className="fixed top-3 right-10 space-y-4 bg-emerald-700 hover:bg-emerald-800 transition-all p-3 rounded-xl">
          <button  onClick={() => signOut()} >Sign Out</button>
        </div>

      </div>

      {/* Sidebar */}
      {isSidebarVisible && (
        <div>


          <div className="fixed inset-y-0 left-0 w-64 bg-stone-700 p-4 shadow-lg">
          {/* Display Prompts:*/}

          </div>

          <div className = "fixed top-0 left-0 w-64 bg-emerald-900 p-4">
            <button className="text-xl font-semibold text-white hover:bg-emerald-950 transition-all p-2 rounded-xl" onClick={toggleSidebar}>Prompts</button>
            <p className="text-white">Click a below prompt to view its responses + evaluations.</p>
          </div>
        </div>

      )}

      {/* Error Box */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-stone-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="text-s text-red-600">{error}</p>
            
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-stone-900 rounded-xl hover:bg-red-800 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

        
      {/* Bottom Bar */}
      <div className="fixed bottom-0 w-full bg-stone-900 border-t border-gray-950 p-4">

        {/* Input Area */}
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSubmit()}
              placeholder="User Prompt..."
              className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-transparent placeholder-stone-400"
            />
            <input
              type="text"
              value={expectedOutput}
              onChange={e => setExpectedOutput(e.target.value)}
              onKeyPress={e => e.key === "Enter" && message && handleSubmit()}
              placeholder="Expected Output..."
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
