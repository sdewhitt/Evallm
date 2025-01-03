"use client";
import React, { useState, useEffect } from "react";
import './globals.css';

interface Experiment {
  prompt: string;
  expected: string;
  responsesAndEvaluations: {
    [model: string]: {
      response: string;
      evaluation: {
        responseTime: number;
        exactMatch: boolean;
        similarity: number;
        bleu: number;
        rouge: number[];
        perplexity: number;
      };
    };
  };
}

const models = ['llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
const defaultStatistics: { [key: string]: number} = {
  numResponses: 0,
  avgSimilarity: 0,
  avgBleu: 0,
  avgRouge: 0,
}
const defaultModelStatistics: { [key: string]: { [key: string]: number} } = models.reduce((acc: { [key: string]: { [key: string]: number } }, model) => {
  acc[model] = { ...defaultStatistics };
  return acc;
}, {});

export default function Home() {

  const [message, setMessage] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);


  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");


  
  const [experimentArray, setExperimentArray] = useState<Experiment[]>([]);
  const [experiment, setExperiment] = useState<Experiment | null>(null);

  const [isViewingLLMStats, setIsViewingLLMStats] = useState(false);
  const [llmStatistics, setLLMStatistics] = useState<{ [key: string]: { [key: string]: number} }>(defaultModelStatistics);


  /* ================================= Authentication ================================= */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) throw data.error; // If there is an error or incorrect password

      setIsLoggedIn(true);
      //user = email.toString();

      // Set the user history
      setExperimentArray(data.prompts.reverse());


      // Calculate/Update the LLM Statistics
      setIsViewingLLMStats(false);
      const fetchedStats = await fetchLLMStats(data.prompts);
      setLLMStatistics(fetchedStats);

    } catch (error) {
      setLoginError(`Please enter a valid email/password.`);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
  }




  // Handle user input and retrieve LLM responses + evaluations
  const handleSubmit = async () => {
    // Clear the input field
    setMessage("");
    setExpectedOutput("");
    setIsLoading(true);
    setExperiment(null);
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
        body: JSON.stringify({ message, expectedOutput, email }),
      });
      
      // Retrieve MULTIPLE LLM responses

      const data = await response.json();
      
      // Update Experiment Array:
      
      setExperimentArray(prevArray => [data.experiment, ...prevArray]);
      setExperiment(null);
      setIsViewingLLMStats(false);
      setExperiment(data.experiment);


      // Calculate/Update the LLM Statistics
      const fetchedStats = await fetchLLMStats();
      setLLMStatistics(fetchedStats);

    } catch (error) {
      //console.error("Error:", error instanceof Error ? error.message : "unknown");
      setError(`${error instanceof Error ? error.message : "unknown"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLLMStats = async (experiments = experimentArray) => {
    try {
      let llmStats: { [key: string]: any } = {};
      for (const LLM of models) {
        const stats = await calculateLLMStats(LLM, experiments);
        llmStats[LLM] = stats;
      }

      return llmStats;
    } catch (error) {
      setError(`${error instanceof Error ? error.message : "unknown"}`);
    }
    return defaultModelStatistics;
  }

  const calculateLLMStats = async (LLM: string, experiments: Experiment[]) => {

    let avgResponseTime = 0;
    let numResponses = 0;
    let avgSimilarity = 0;
    let avgBleu = 0;
    let avgRouge = 0;

    for (let i = 0; i < experiments.length; i++) {
      const curResponsesAndEvaluations = experiments[i].responsesAndEvaluations;
      if (!curResponsesAndEvaluations[LLM]) { continue; }
      const curEval = curResponsesAndEvaluations[LLM].evaluation;
      avgResponseTime += curEval.responseTime;
      numResponses++;
      avgSimilarity += curEval.similarity;
      avgBleu += curEval.bleu || 0;
      avgRouge += curEval.rouge.reduce((acc, score) => acc + (score || 0), 0);
    }

    if (numResponses !== 0) {
      avgResponseTime /= numResponses;
      avgSimilarity /= numResponses;
      avgBleu /= numResponses;
      avgRouge /= numResponses;
    }


    return {
      avgResponseTime: avgResponseTime.toFixed(0),
      numResponses: numResponses,
      avgSimilarity: (avgSimilarity * 100).toFixed(1),
      avgBleu: (avgBleu * 100).toFixed(1),
      avgRouge: (avgRouge * 100).toFixed(1),
    };

  }

  /* ================================= UI functions ================================= */

  const clearExperiment = async () => {
    setIsClearing(true);
    try {
      setExperiment(null);
    } catch (error) {
      setError(`${error instanceof Error ? error.message : "unknown"}`);
    } finally {
      setIsClearing(false);
    }
  }

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const switchDisplayPrompt = (index: number) => {
    setExperiment(experimentArray[index]);
    toggleSidebar();
    setIsViewingLLMStats(false);
  };

  const formatEvaluation = (evaluation: Experiment["responsesAndEvaluations"]["model"]["evaluation"]) => {
    const responseTime = `Reponse time: ${evaluation.responseTime.toFixed(0)}ms\n`;
    const similarityPercent = `Similarity: ${(evaluation.similarity * 100).toFixed(0)}%\n`;
    const bleuScore = `BLEU Score: ${((evaluation.bleu || 0) * 100).toFixed(0)}%\n`;

    const rougeAverage = evaluation.rouge.reduce((acc, score) => acc + (score || 0), 0) / evaluation.rouge.length;
    const rougeScore = `ROUGE Score: ${(rougeAverage * 100).toFixed(0)}%\n`;

    return responseTime + similarityPercent + bleuScore + rougeScore;
  }

  const toggleViewLLMStats = () => {
    setIsViewingLLMStats(!isViewingLLMStats);
    setIsSidebarVisible(false);
    clearExperiment();
  };
  

  return (
    <div className="min-h-screen flex bg-stone-700">
      
      {/* Top Bar */}
      <div className="fixed top-0 w-full justify-between">
        <div className="absolute inset-0 bg-stone-900  p-3 h-20 border-b border-gray-950">
          <img src="/EvallmLogo.png" alt="Evallm" className="mx-auto w-36 h-14" />
        </div> 
        

        <div className="fixed top-3 left-10 space-y-4 bg-emerald-700 hover:bg-emerald-800 transition-all p-3 rounded-xl ">
          <button onClick={toggleSidebar}>Prompt Analytics</button>
        </div>
        <div className="fixed top-3 left-60 space-y-4 bg-emerald-700 hover:bg-emerald-800 transition-all p-3 rounded-xl ">
          <button onClick={toggleViewLLMStats}>LLM Statistics</button>
        </div>

        <div className="fixed top-3 right-10 space-y-4 bg-emerald-700 hover:bg-emerald-800 transition-all p-3 rounded-xl">
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>


      {/* Responses & Evaluations */}
      {experiment && (
        <div className="flex-1 pt-20 pb-16 ">

          
          <div className="flex p-4  justify-center items-center space-x-96">
            <div className="flex-1 border-stone-900 bg-stone-800 rounded-xl p-4 m-6">
              <h2 className="text-2xl font-semibold text-emerald-500 text-center">User Prompt</h2>
              <p className="text-stone-100 text-center">{experiment.prompt}</p>
            </div>
            <div className="flex-1 border-stone-900 bg-stone-800 rounded-xl p-4 m-6">
              <h2 className="text-2xl font-semibold text-emerald-500 text-center">Expected Output</h2>
              <p className="text-stone-100 text-center">{experiment.expected}</p>
            </div>
          </div>

          <div className="p-4 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-semibold text-emerald-200 p-4">Responses & Evaluations</h2>
            <div className="flex overflow-x-auto space-x-4">
              {Object.entries(experiment.responsesAndEvaluations).map(([model, data]) => (
                <div key={model} className="flex-none border border-stone-900 bg-stone-800 p-4 rounded-xl mb-4 w-96 overflow-x-auto">
                  <div className="flex-1 p-2">
                    <h3 className="text-xl font-semibold text-emerald-500">{model}</h3>
                    <pre className="text-stone-100 whitespace-pre-wrap">{data.response /*JSON.stringify(data, null, 2)*/}</pre>
                  </div>

                  <div className="flex-1 p-2">
                    <h3 className="text-xl font-semibold text-emerald-500">Evaluation Metrics</h3>
                    <pre className="text-stone-100 whitespace-pre-wrap">{formatEvaluation(data.evaluation)}</pre>
                  </div>

                </div>
              ))}
            </div>
          </div>


          
        </div>
      )}
      
      {/* View LLM Stats llmStatistics*/}
      {isViewingLLMStats && (
      <div className="flex-1 pt-20 pb-16 ">

        <div className="p-4 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold text-emerald-200 p-4">LLM Statistics</h2>
          <div className="flex overflow-x-auto space-x-4">
            {Object.entries(llmStatistics).map(([model, data]) => (
                <div key={model} className="flex-none border border-stone-900 bg-stone-800 p-4 rounded-xl mb-4 w-96 overflow-x-auto">
                  <div className="flex-1 p-2">
                    <h3 className="text-xl font-semibold text-emerald-500">{model}</h3>
                    <pre className="text-stone-100 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                  </div>
                </div>
              ))}
          </div>
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

            <button
              onClick={clearExperiment}
              disabled={isClearing}
              className="bg-rose-800 text-white px-5 py-3 rounded-xl hover:bg-rose-900 transition-all disabled:bg-rose-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearing ? "Clearing..." : "Clear Output"}
            </button>

            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSubmit()}
              placeholder="User Prompt..."
              className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent placeholder-stone-400"
            />
            <input
              type="text"
              value={expectedOutput}
              onChange={e => setExpectedOutput(e.target.value)}
              onKeyPress={e => e.key === "Enter" && message && handleSubmit()}
              placeholder="Expected Output..."
              className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent placeholder-stone-400"
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


      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="flex flex-col fixed inset-y-0 left-0 w-64 bg-emerald-950 shadow-lg border-b border-stone-900">

          <div className = "bg-emerald-900 p-4 border-b border-emerald-950">
            <button className="text-xl font-semibold text-white hover:bg-emerald-950 transition-all p-2 rounded-xl" onClick={toggleSidebar}>
              Prompt Analytics
            </button>
          </div>

          {/* Display Prompts:*/}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
              {experimentArray.map((experiment, index) => (
                <button 
                  key={experiment.prompt} 
                  className="text-left p-2 bg-emerald-800 rounded-xl mb-2 hover:bg-emerald-900 transition-all"
                  onClick={() => switchDisplayPrompt(index)}>
                  <h2 className="text-lg text-stone-100">{experiment.prompt}</h2>
                </button>
              ))}

          </div>


        </div>

      )}

      {!isLoggedIn &&
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-85">
          <div className="bg-stone-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-emerald-500">Welcome to Evallm!</h2>

            {/* LOGIN FORM */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email..."
                  className="mt-1 block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-m text-black"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password..."
                  className="mt-1 block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-m text-black"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoginLoading ? "Logging in..." : "Login / Sign Up"}
                </button>
              </div>
            </form>
          </div>
        </div>  
      }

      {/* Login Error Box */}
      {loginError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-stone-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="text-s text-red-600">{loginError}</p>
            
            <button
              onClick={() => setLoginError(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-stone-900 rounded-xl hover:bg-red-800 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}