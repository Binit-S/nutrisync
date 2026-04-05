"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [deficiency, setDeficiency] = useState("");
  const [foods, setFoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");

  const handleConsult = async () => {
    setLoading(true);
    setFoods([]);
    const res = await fetch("https://nutrisync-backend-428451287285.asia-south1.run.app/api/consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deficiency, user_email: session?.user?.email }),
    });
    const data = await res.json();
    try {
      setFoods(JSON.parse(data.result).foods);
    } catch {
      setFoods(["Error parsing response. Try again."]);
    }
    setLoading(false);
  };

  const createTasks = async () => {
    setTaskStatus("Syncing...");
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foods }),
    });
    setTaskStatus("Added to Google Tasks! ✓");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-10 font-sans">
      <div className="max-w-5xl mx-auto mt-20">
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6">NutriSync</h1>
        <p className="text-xl text-slate-400 mb-12">AI-powered clinical nutrition assistant, synced to your workspace.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {["Identify Deficiencies", "Generate Meal Plans", "Sync to Tasks"].map((title, i) => (
            <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/10 hover:border-indigo-500/50 cursor-default">
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">Automated workflow based on the latest clinical data frameworks.</p>
            </div>
          ))}
        </div>

        {!session ? (
          <button onClick={() => signIn("google")} className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition">
            Log In with Google to Start
          </button>
        ) : (
          <button onClick={() => setIsOpen(true)} className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/30">
            Launch Dietitian Agent
          </button>
        )}
      </div>

      <div className={`fixed inset-y-0 right-0 w-3/4 bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col p-8 z-50`}>
        <button onClick={() => setIsOpen(false)} className="self-end text-slate-400 hover:text-white mb-8">Close ✕</button>
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <p className="text-indigo-300 font-semibold mb-2">Dietitian Agent</p>
          <p>Hi! What nutritional deficiency are you looking to address today?</p>
        </div>
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="e.g., Iron, Vitamin D..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            value={deficiency}
            onChange={(e) => setDeficiency(e.target.value)}
          />
          <button onClick={handleConsult} className="bg-indigo-600 px-6 rounded-lg font-semibold hover:bg-indigo-500 transition">Analyze</button>
        </div>
        {loading && <p className="text-slate-400 animate-pulse">Consulting clinical data...</p>}
        {foods.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
            <h4 className="text-lg font-bold mb-4">Recommended Protocol:</h4>
            <ul className="list-disc list-inside mb-6 space-y-2 text-slate-300">
              {foods.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <button onClick={createTasks} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-500 transition">
              {taskStatus || "Create Google Tasks Checklist"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
