"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { getCurrentWeekId, getTodayName } from "@/lib/utils";
import type { Consultation, MealPlan, DayPlan } from "@/types";

const mealLabels = [
  { key: "breakfast", label: "Breakfast", time: "08:00" },
  { key: "lunch", label: "Lunch", time: "13:00" },
  { key: "dinner", label: "Dinner", time: "19:00" },
  { key: "snack", label: "Snack", time: "16:30" },
] as const;

interface FridgePlan {
  id: string;
  weekId: string;
  days: DayPlan[];
  identifiedIngredients: string[];
  deficiencies: string[];
}

export default function MealPlannerPage() {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [latestConsultation, setLatestConsultation] = useState<Consultation | null>(null);
  const [fridgePlans, setFridgePlans] = useState<FridgePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getTodayName());
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const weekId = getCurrentWeekId();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const planRef = collection(db, "users", user.uid, "mealPlans");
        const planSnap = await getDocs(query(planRef, orderBy("createdAt", "desc"), limit(1)));
        if (!planSnap.empty) {
          setMealPlan({ id: planSnap.docs[0].id, ...planSnap.docs[0].data() } as MealPlan);
        }

        const consultRef = collection(db, "users", user.uid, "consultations");
        const consultSnap = await getDocs(query(consultRef, orderBy("createdAt", "desc"), limit(1)));
        if (!consultSnap.empty) {
          setLatestConsultation({
            id: consultSnap.docs[0].id,
            ...consultSnap.docs[0].data(),
          } as Consultation);
        }

        const fridgeRef = collection(db, "users", user.uid, "fridgePlans");
        const fridgeSnap = await getDocs(query(fridgeRef, orderBy("createdAt", "desc"), limit(3)));
        if (!fridgeSnap.empty) {
          setFridgePlans(fridgeSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FridgePlan)));
        }
      } catch (err) {
        console.error("Error fetching meal planner data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  async function handleGenerate() {
    if (!latestConsultation?.result) {
      setError("Run and log an AI consultation before generating a meal plan.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          consultationId: latestConsultation.id,
          deficiency: latestConsultation.result.deficiency,
          foods: latestConsultation.result.foods,
          constraints: latestConsultation.constraints,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate meal plan");

      setMealPlan({
        id: "generated",
        uid: user?.uid || "",
        weekId: data.weekId,
        days: data.days,
        consultationId: latestConsultation.id,
        sourceDeficiency: data.sourceDeficiency || latestConsultation.result.deficiency,
        sourceFoods: data.sourceFoods || latestConsultation.result.foods,
        createdAt: new Date(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate meal plan");
    } finally {
      setGenerating(false);
    }
  }

  async function handleFridgeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      setError("Must be logged in to scan fridge.");
      return;
    }

    setScanning(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        
        // Pass past deficiency if we have one
        const deficiencies = latestConsultation?.result?.deficiency ? [latestConsultation.result.deficiency] : [];

        const res = await fetch("/api/fridge-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            imageBase64: base64Data,
            mimeType: file.type,
            deficiencies,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to scan fridge");

        setFridgePlans([{
          id: "generated",
          weekId: data.weekId,
          days: data.days,
          identifiedIngredients: data.identifiedIngredients,
          deficiencies
        }, ...fridgePlans]);
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const selectedPlan = useMemo(
    () => mealPlan?.days?.find((day) => day.day.toLowerCase() === selectedDay.toLowerCase()),
    [mealPlan, selectedDay]
  );

  const totalCalories = selectedPlan
    ? mealLabels.reduce((sum, meal) => sum + (selectedPlan[meal.key]?.calories || 0), 0)
    : 0;

  if (loading) {
    return (
      <div className="app-shell space-y-5">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-[520px] w-full" />
      </div>
    );
  }

  return (
    <div className="app-shell animate-fade-in space-y-6">
      <section className="surface-panel p-5 sm:p-8">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
              Planner for {weekId}
            </p>
            <h1 className="text-4xl mt-2 mb-3">Meal Schedule</h1>
            <p>
              Generate a seven-day plan from the latest logged AI analysis. The plan is smart enough to <b>merge</b> with your existing weekly plan so all your deficiencies are covered!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 min-w-[260px]">
            {/* Standard Planner Generation */}
            <div className="rounded-[1.5rem] bg-[var(--bg-panel)] p-4 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
                Standard Planner
              </p>
              <h2 className="text-xl mb-2">
                {latestConsultation?.result?.deficiency || "No analysis yet"}
              </h2>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary w-full"
                id="generate-plan-btn"
              >
                {generating ? "Merging..." : "Generate plan"}
              </button>
            </div>

            {/* Fridge Scanner Upload */}
            <div className="rounded-[1.5rem] bg-[var(--accent-soft)] p-4 flex-1 text-center border border-[var(--border-strong)]">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent-warm)] mb-2">
                Got ingredients?
              </p>
              <h2 className="text-xl mb-3">Fridge Scanner</h2>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFridgeUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="btn-secondary w-full"
              >
                {scanning ? "Scanning..." : "Upload Photo"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-[var(--error)] mb-6">
            {error}
          </div>
        )}

        {!mealPlan ? (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)] text-3xl">
                🍽️
              </div>
              <h3 className="text-2xl mb-2">No active plan</h3>
              <p className="text-sm mb-5">Create one from your latest logged analysis.</p>
              <Link href="/dashboard/consult" className="btn-secondary w-full">
                Open dietitian agent
              </Link>
            </div>

            <div className="rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--bg-panel)] p-8 flex items-center justify-center text-center min-h-[280px]">
              <div>
                {generating || scanning ? (
                  <>
                    <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-[var(--accent-warm)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="text-2xl mb-2">{generating ? "Generating Plan..." : "Scanning Fridge..."}</h3>
                    <p>Our dietitian agent is crunching the numbers. This will take just a moment.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl mb-2">Planner is waiting</h3>
                    <p>Your recommended meals and nutrition values will appear here.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
            <aside className="rounded-[1.75rem] bg-[var(--bg-ink)] p-4 text-white">
              <div className="p-3 mb-4">
                <p className="text-white/50 text-sm">Selected day</p>
                <h2 className="text-3xl text-white mt-1">{selectedDay}</h2>
                <p className="text-white/60 text-sm mt-2">{totalCalories || "No"} calories planned</p>
              </div>

              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = day === selectedDay;
                  const date = DAYS_OF_WEEK.indexOf(day) + 12;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`w-full rounded-2xl p-3 flex items-center gap-3 text-left transition ${isSelected ? "bg-white text-black" : "bg-white/8 text-white hover:bg-white/14"}`}
                    >
                      <strong className="text-2xl leading-none">{date}</strong>
                      <span className="text-sm font-bold">{day}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="min-w-0">
              {selectedPlan ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {mealLabels.map(({ key, label, time }) => {
                    const meal = selectedPlan[key];
                    if (!meal) return null;

                    return (
                      <article key={key} className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div>
                            <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent-warm)]">
                              {label}
                            </p>
                            <h3 className="text-2xl mt-1">{time}</h3>
                          </div>
                          <span className="badge badge-lavender">{meal.calories} cal</span>
                        </div>

                        <ul className="space-y-3 mb-5">
                          {meal.items.map((item) => (
                            <li key={item} className="rounded-2xl bg-[var(--bg-panel)] p-3 text-sm font-semibold text-[var(--text-secondary)]">
                              {item}
                            </li>
                          ))}
                        </ul>

                        {meal.keyNutrients?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {meal.keyNutrients.map((nutrient) => (
                              <span key={nutrient} className="badge badge-success">
                                {nutrient}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.75rem] bg-[var(--bg-panel)] p-8 text-center">
                  <h3 className="text-2xl mb-2">No meals for {selectedDay}</h3>
                  <p>Generate a new plan from the latest analysis.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Fridge Plans Collection */}
      {fridgePlans.length > 0 && (
        <section className="surface-panel p-5 sm:p-8">
          <h2 className="text-3xl mb-5">Fridge Scanner Plans</h2>
          <p className="mb-6 text-[var(--text-secondary)]">
            These are alternative meal plans built entirely from the photos of your fridge.
          </p>
          <div className="grid grid-cols-1 gap-6">
            {fridgePlans.map((plan, i) => (
              <details key={plan.id} className="rounded-[1.75rem] bg-white shadow-sm border border-[var(--border-subtle)] open:pb-5">
                <summary className="p-5 cursor-pointer font-bold text-lg outline-none select-none flex items-center justify-between">
                  <span>Fridge Scan - {plan.weekId} {i === 0 && "(Latest)"}</span>
                  <span className="text-sm text-[var(--accent-warm)]">View ingredients & plan ↓</span>
                </summary>
                
                <div className="px-5">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
                      Identified Ingredients
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plan.identifiedIngredients?.map((ing) => (
                        <span key={ing} className="badge badge-success">{ing}</span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[var(--bg-panel)] p-4 mt-4">
                    <p className="font-bold mb-3">{selectedDay} Sample (from Fridge)</p>
                    {(() => {
                      const dayPlan = plan.days?.find(d => d.day.toLowerCase() === selectedDay.toLowerCase());
                      if (!dayPlan) return <p>No data for this day.</p>;
                      return (
                        <ul className="space-y-3">
                          {mealLabels.map(({ key, label }) => {
                            const meal = dayPlan[key];
                            if (!meal) return null;
                            return (
                              <li key={key} className="text-sm">
                                <strong className="text-[var(--accent-warm)]">{label}:</strong> {meal.items.join(", ")}
                              </li>
                            );
                          })}
                        </ul>
                      );
                    })()}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
