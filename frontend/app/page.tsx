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
    try {
      const res = await fetch("https://nutrisync-backend-428451287285.asia-south1.run.app/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deficiency, user_email: session?.user?.email }),
      });
      const data = await res.json();
      setFoods(JSON.parse(data.result).foods);
    } catch {
      setFoods(["Error parsing response. Try again."]);
    }
    setLoading(false);
  };

  const createTasks = async () => {
    setTaskStatus("Syncing...");
    try{
      const res = await fetch("/api/tasks",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foods }),
    });
    const data = await res.json();

    if(!res.ok || data.error){
      console.error("Task creation failed:",data);
      setTaskStatus("Error: " + (data.error || "Failed to sync"));
        return;
    }
    setTaskStatus("Added to Google Tasks! ✓");
    }catch (error) {
      console.error(error);
      setTaskStatus("Error linking to tasks!");
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-crimson p-10 font-body overflow-x-hidden">
      <div className="max-w-5xl mx-auto mt-20 relative">
        {/* Header Section */}
        <header className="mb-20">
          <h1 className="text-7xl font-heading font-extrabold tracking-tight mb-4 drop-shadow-sm">
            NutriSync
          </h1>
          <p className="text-xl text-brand-rose max-w-lg leading-relaxed">
            AI-powered clinical nutrition assistant, seamlessly synced to your workspace.
          </p>
        </header>

        {/* The "Audience Guide" - Randomized Soft Boxes */}
        <div className="relative h-[450px] md:h-[400px] mb-24 w-full">
          {/* Box 1: Identify */}
          <div className="absolute top-0 left-0 bg-brand-soft-pink p-8 rounded-3xl shadow-md rotate-[-3deg] max-w-xs transition-all hover:rotate-0 hover:shadow-lg z-10">
            <span className="text-xs font-heading font-bold uppercase tracking-widest opacity-60">Step 01</span>
            <h3 className="font-heading text-2xl text-brand-crimson mt-1 mb-2">Identify</h3>
            <p className="text-sm leading-relaxed opacity-90 font-medium">
              Pinpoint nutritional gaps using clinical AI trained on the latest dietary frameworks.
            </p>
          </div>

          {/* Box 2: Sync - Main Highlight */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-brand-crimson p-10 rounded-[2.5rem] shadow-2xl rotate-[2deg] text-brand-cream max-w-sm z-20 border-4 border-brand-peach/20">
            <span className="text-xs font-heading font-bold uppercase tracking-widest opacity-70">Step 02</span>
            <h3 className="font-heading text-3xl mt-1 mb-3">Sync to Tasks</h3>
            <p className="text-lg leading-relaxed font-light">
              Transform your personalized nutrition protocol into an actionable grocery checklist automatically.
            </p>
          </div>

          {/* Box 3: Heal */}
          <div className="absolute bottom-0 right-0 bg-brand-peach p-8 rounded-3xl shadow-md rotate-[-2deg] max-w-xs transition-all hover:rotate-0 hover:shadow-lg z-10">
            <span className="text-xs font-heading font-bold uppercase tracking-widest opacity-60">Step 03</span>
            <h3 className="font-heading text-2xl text-brand-crimson mt-1 mb-2">Heal</h3>
            <p className="text-sm leading-relaxed opacity-90 font-medium">
              Follow your dietitian-approved protocol to address deficiencies and optimize performance.
            </p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col items-center">
          {!session ? (
            <button 
              onClick={() => signIn("google")} 
              className="px-12 py-5 bg-brand-crimson text-brand-cream font-heading text-lg font-bold rounded-full hover:bg-brand-rose transition-all transform hover:scale-105 shadow-xl"
            >
              Log In with Google to Start
            </button>
          ) : (
            <button 
              onClick={() => setIsOpen(true)} 
              className="px-12 py-5 bg-brand-crimson text-brand-cream font-heading text-lg font-bold rounded-full hover:bg-brand-rose transition-all transform hover:scale-105 shadow-xl"
            >
              Launch Dietitian Agent
            </button>
          )}
        </div>
      </div>

      {/* Slide-out Panel (Drawer) */}
<div className={`fixed inset-y-0 right-0 w-full md:w-2/5 bg-brand-cream border-l border-brand-soft-pink shadow-2xl transform transition-transform duration-700 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col z-50`}>

  {/* Header (NON-SCROLLABLE) */}
  <div className="p-10 pb-4 shrink-0">
    <button 
      onClick={() => setIsOpen(false)} 
      className="self-end font-bold text-brand-rose hover:text-brand-crimson mb-8 flex items-center gap-2"
    >
      CLOSE <span className="text-2xl">✕</span>
    </button>

    <div className="bg-brand-soft-pink/30 rounded-3xl p-6 border border-brand-soft-pink">
      <p className="text-brand-crimson font-bold text-sm uppercase tracking-widest mb-2">
        Dietitian Agent
      </p>
      <p className="text-lg font-medium">
        Hi! What nutritional deficiency are you looking to address today?
      </p>
    </div>
  </div>

  {/* SCROLLABLE CONTENT */}
  <div className="flex-1 overflow-y-auto px-10 pb-10">

    <div className="flex flex-col gap-4 mb-10">
      <input
        type="text"
        placeholder="e.g., Iron, Vitamin D..."
        className="bg-white/50 border-2 border-brand-soft-pink rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-peach text-lg"
        value={deficiency}
        onChange={(e) => setDeficiency(e.target.value)}
      />

      <button 
        onClick={handleConsult} 
        className="bg-brand-rose py-4 rounded-2xl font-bold text-white hover:bg-brand-crimson transition-all"
      >
        {loading ? "Consulting..." : "Analyze"}
      </button>
    </div>

    {foods.length > 0 && (
      <div className="bg-white/40 border border-brand-soft-pink rounded-3xl p-8">
        <h4 className="text-xl text-brand-crimson mb-6 font-bold">
          Recommended Protocol:
        </h4>

        <ul className="space-y-4 mb-8">
          {foods.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-brand-crimson/80">
              <span className="w-2 h-2 bg-brand-peach rounded-full" />
              {f}
            </li>
          ))}
        </ul>

        <button 
          onClick={createTasks} 
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
        >
          {taskStatus || "Create Google Tasks Checklist"}
        </button>
      </div>
    )}
  </div>
</div> 

    </div>
  );
}

