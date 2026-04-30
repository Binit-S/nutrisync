"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { ConsultationResult, GroceryItem } from "@/types";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCurrentWeekId } from "@/lib/utils";

export default function ConsultPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"known" | "consult">("known");
  const [deficiency, setDeficiency] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [constraints, setConstraints] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<(ConsultationResult & { consultationId?: string | null }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [savingList, setSavingList] = useState(false);
  const [status, setStatus] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");

  async function handleConsult() {
    if (!user) return;
    setErrorMsg("");
    setStatus("");
    setExplanation("");
    setResult(null);

    if (mode === "known" && !deficiency.trim()) {
      setErrorMsg("Please enter a deficiency (e.g., Vitamin D).");
      return;
    }
    if (mode === "consult" && !symptoms.trim()) {
      setErrorMsg("Please describe your symptoms.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          deficiency: mode === "known" ? deficiency : undefined,
          symptoms: mode === "consult" ? symptoms : undefined,
          constraints,
          uid: user.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Consultation failed");
      setResult(data);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Consultation failed");
    } finally {
      setIsLoading(false);
    }
  }

  const groceryCount = result?.buy_list
    ? Object.values(result.buy_list).reduce((acc, list) => acc + (list?.length || 0), 0)
    : 0;

  async function handleAddToGroceryList() {
    if (!user || !result || !result.buy_list) return;
    setSavingList(true);
    setStatus("");

    try {
      const items: GroceryItem[] = [];
      const categories = Object.keys(result.buy_list);
      for (const cat of categories) {
        const categoryItems = result.buy_list[cat as keyof typeof result.buy_list] || [];
        for (const item of categoryItems) {
          items.push({
            id: Math.random().toString(36).substr(2, 9),
            name: item,
            category: cat as GroceryItem["category"],
            aisle: cat,
            checked: false,
            inMultipleWeeks: false,
          });
        }
      }

      await addDoc(collection(db, "users", user.uid, "groceryLists"), {
        uid: user.uid,
        weekId: getCurrentWeekId(),
        consultationId: result.consultationId || "",
        sourceDeficiency: result.deficiency || "",
        sourceMode: mode,
        items,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setStatus(`Added ${items.length} items to your grocery list!`);
    } catch (e) {
      console.error(e);
      setStatus("Failed to add to grocery list.");
    } finally {
      setSavingList(false);
    }
  }

  async function handleExplain() {
    if (!result || !result.deficiency) return;
    setExplaining(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deficiency: result.deficiency, foods: result.foods || [] }),
      });
      const data = await res.json();
      setExplanation(data.explanation || "No explanation provided.");
    } catch {
      setExplanation("Failed to generate explanation.");
    } finally {
      setExplaining(false);
    }
  }

  return (
    <div className="app-shell animate-fade-in space-y-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold">Dietitian Agent</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Run an AI consultation to generate a personalized clinical protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
        <section className="card space-y-6 sticky top-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Consultation Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("known")}
                className={`flex-1 rounded-2xl py-2 px-3 text-sm font-semibold transition ${mode === "known" ? "bg-[var(--bg-ink)] text-white shadow-sm" : "bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"}`}
              >
                Known Gap
              </button>
              <button
                onClick={() => setMode("consult")}
                className={`flex-1 rounded-2xl py-2 px-3 text-sm font-semibold transition ${mode === "consult" ? "bg-[var(--bg-ink)] text-white shadow-sm" : "bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"}`}
              >
                Symptoms
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mode === "known" ? (
              <input
                id="deficiency-input"
                value={deficiency}
                onChange={(e) => setDeficiency(e.target.value)}
                className="input-field"
                placeholder="E.g., Iron, Vitamin D, Magnesium..."
              />
            ) : (
              <textarea
                id="symptoms-input"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="input-field min-h-32 resize-y"
                placeholder="Fatigue, brain fog, brittle nails..."
              />
            )}

            <input
              id="constraints-input"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="input-field"
              placeholder="Vegan, gluten-free, lactose-free..."
            />

            {errorMsg && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-[var(--error)]">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleConsult}
              disabled={isLoading}
              className="btn-primary w-full"
              id="analyze-btn"
            >
              {isLoading ? "Streaming Analysis..." : "Analyze"}
            </button>
          </div>
        </section>

        <section className="space-y-6 min-w-0">
          {!result && !isLoading ? (
            <div className="surface-panel min-h-[520px] p-8 flex items-center justify-center text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-5 h-20 w-20 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-3xl">
                  +
                </div>
                <h2 className="text-3xl font-bold mb-3">Diagnosis workspace</h2>
                <p>Your analyzed deficiency, food protocol, grocery list, and meal starter will appear here after the agent runs.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="surface-panel p-5 sm:p-6 transition-opacity duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      {isLoading ? "Analyzing..." : "Logged analysis"}
                    </p>
                    <h2 className={`text-3xl font-bold mt-1 ${!result?.deficiency ? 'animate-pulse bg-[var(--bg-panel)] text-transparent rounded' : ''}`}>
                      {result?.deficiency || "Identifying deficiency..."}
                    </h2>
                  </div>
                  {result?.severity && (
                    <span className={`badge badge-${result.severity === "severe" ? "error" : result.severity === "moderate" ? "warning" : "success"}`}>
                      {result.severity} severity
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card shadow-none bg-[var(--bg-panel)] min-h-[160px]">
                    <h3 className="text-lg mb-4">Recommended Protocol</h3>
                    <ul className="space-y-3">
                      {(result?.foods || []).map((food) => (
                        <li key={food} className="flex items-center gap-3 text-sm font-semibold text-[var(--text-secondary)] animate-fade-in">
                          <span className="h-2 w-2 rounded-full bg-[var(--accent-warm)]" />
                          {food}
                        </li>
                      ))}
                      {isLoading && (!result?.foods || result.foods.length === 0) && (
                        <li className="animate-pulse bg-black/5 h-4 w-3/4 rounded"></li>
                      )}
                    </ul>
                  </div>

                  <div className="card shadow-none bg-[var(--bg-panel)] min-h-[160px] flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg mb-4">Checklist Ready</h3>
                      <p className="text-sm mb-5 text-[var(--text-secondary)]">
                        {groceryCount} grocery items analyzed.
                      </p>
                    </div>
                    <button
                      onClick={handleAddToGroceryList}
                      disabled={savingList || isLoading}
                      className="btn-primary w-full disabled:opacity-50"
                      id="add-grocery-list-btn"
                    >
                      {savingList ? "Adding..." : "Add to Grocery List"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleExplain}
                    disabled={explaining || isLoading}
                    className="btn-secondary flex-1 disabled:opacity-50"
                    id="explain-btn"
                  >
                    {explaining ? "Explaining..." : "Explain the use case"}
                  </button>
                  <a href="/dashboard/meal-planner" className={`btn-secondary flex-1 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                    Build meal plan
                  </a>
                </div>

                {status && (
                  <p className="mt-4 rounded-2xl bg-white p-3 text-center text-sm font-semibold text-[var(--text-secondary)]">
                    {status}
                  </p>
                )}
              </div>

              {explanation && (
                <div className="surface-panel p-5 sm:p-6 animate-fade-in">
                  <h3 className="text-xl mb-3">Why this helps</h3>
                  <p className="leading-7">{explanation}</p>
                </div>
              )}

              {(result?.meal_plan && result.meal_plan.length > 0) && (
                <div className="surface-panel p-5 sm:p-6 animate-fade-in">
                  <h3 className="text-xl mb-4">Today&apos;s starter plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.meal_plan.map((meal, idx) => (
                      <div key={idx} className="rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent-warm)] mb-2">
                          {meal?.meal || "Meal"}
                        </p>
                        <ul className="space-y-2">
                          {(meal?.items || []).map((item, i) => (
                            <li key={i} className="text-sm text-[var(--text-secondary)]">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
