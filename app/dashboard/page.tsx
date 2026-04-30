"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { calculateBMI, getBMICategory, getTodayName } from "@/lib/utils";
import {
  NUTRIENT_DISPLAY_NAMES,
  NUTRIENT_LABELS,
  type Consultation,
  type GroceryList,
  type HealthProfile,
  type MealPlan,
  type NutrientScores,
  type SymptomLog,
} from "@/types";

function calculateHealthScore(scores: NutrientScores | null | undefined) {
  if (!scores) return 0;

  const values = NUTRIENT_LABELS
    .map((key) => scores[key])
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getLowestNutrients(scores: NutrientScores | null | undefined) {
  if (!scores) return [];

  return NUTRIENT_LABELS
    .map((key) => ({
      key,
      label: NUTRIENT_DISPLAY_NAMES[key],
      score: scores[key],
    }))
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [latestConsultation, setLatestConsultation] = useState<Consultation | null>(null);
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [recentSymptoms, setRecentSymptoms] = useState<SymptomLog[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setHealthProfile((userSnap.data().healthProfile || null) as HealthProfile | null);
        }

        const consultSnap = await getDocs(
          query(collection(db, "users", user.uid, "consultations"), orderBy("createdAt", "desc"), limit(4))
        );
        if (!consultSnap.empty) {
          const consultations = consultSnap.docs.map((snap) => ({
            id: snap.id,
            ...snap.data(),
          })) as Consultation[];
          setRecentConsultations(consultations);
          setLatestConsultation(consultations[0]);
        }

        const planSnap = await getDocs(
          query(collection(db, "users", user.uid, "mealPlans"), orderBy("createdAt", "desc"), limit(1))
        );
        if (!planSnap.empty) {
          setMealPlan({ id: planSnap.docs[0].id, ...planSnap.docs[0].data() } as MealPlan);
        }

        const grocerySnap = await getDocs(
          query(collection(db, "users", user.uid, "groceryLists"), orderBy("createdAt", "desc"), limit(1))
        );
        if (!grocerySnap.empty) {
          setGroceryList({ id: grocerySnap.docs[0].id, ...grocerySnap.docs[0].data() } as GroceryList);
        }

        const symptomSnap = await getDocs(
          query(collection(db, "users", user.uid, "symptomLogs"), orderBy("createdAt", "desc"), limit(4))
        );
        setRecentSymptoms(symptomSnap.docs.map((snap) => ({ id: snap.id, ...snap.data() } as SymptomLog)));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const todayPlan = useMemo(() => {
    const today = getTodayName();
    return mealPlan?.days?.find((day) => day.day.toLowerCase() === today.toLowerCase());
  }, [mealPlan]);

  const groceryProgress = useMemo(() => {
    if (!groceryList?.items?.length) return 0;
    const checked = groceryList.items.filter((item) => item.checked).length;
    return Math.round((checked / groceryList.items.length) * 100);
  }, [groceryList]);

  const avgScore = calculateHealthScore(latestConsultation?.nutrientScores);
  const previousScore = calculateHealthScore(recentConsultations[1]?.nutrientScores);
  const scoreDelta = avgScore && previousScore ? avgScore - previousScore : 0;
  const lowestNutrients = getLowestNutrients(latestConsultation?.nutrientScores);
  const scoredNutrientCount = latestConsultation?.nutrientScores
    ? NUTRIENT_LABELS.filter((key) => Number.isFinite(latestConsultation.nutrientScores?.[key])).length
    : 0;

  const bmi = healthProfile ? calculateBMI(healthProfile.height, healthProfile.weight) : 0;
  const bmiCategory = getBMICategory(bmi);

  if (loading) {
    return (
      <div className="app-shell space-y-5">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-[640px] w-full" />
      </div>
    );
  }

  return (
    <div className="app-shell animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.8fr)_360px] gap-6">
        <main className="space-y-6 min-w-0">
          <section className="surface-panel p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
              <div className="rounded-[1.75rem] bg-white p-5 sm:p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
                  Welcome back
                </p>
                <h1 className="text-4xl mb-4">
                  {user?.displayName?.split(" ")[0] || "Your"} nutrition command center
                </h1>
                <p className="max-w-2xl mb-6">
                  Start with an AI dietitian analysis, save the analyzed grocery list, then generate a meal plan from the same source.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard/consult" className="btn-primary">
                    New analysis
                  </Link>
                  <Link href="/dashboard/grocery-list" className="btn-secondary">
                    Open checklist
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-[var(--bg-ink)] text-white p-5 sm:p-6">
                <p className="text-white/50 text-sm mb-3">Body profile</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-white/50 text-xs">Weight</p>
                    <strong className="text-2xl text-white">{healthProfile?.weight || "--"}</strong>
                    <span className="text-white/50 text-sm"> kg</span>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-white/50 text-xs">BMI</p>
                    <strong className="text-2xl text-white">{bmi || "--"}</strong>
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-4">
                  {bmi ? bmiCategory.label : "Add your body details for better plans."}
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Link href="/dashboard/consult" className="card min-h-44 bg-white">
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)] mb-4">Diagnosis agent</p>
              <h2 className="text-2xl mb-3">{latestConsultation?.result?.deficiency || "Run analysis"}</h2>
              <p className="text-sm">{latestConsultation ? `${latestConsultation.result.severity} severity logged` : "Known gap or symptom consultation"}</p>
            </Link>

            <Link href="/dashboard/grocery-list" className="card min-h-44 bg-white">
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)] mb-4">Checklist</p>
              <h2 className="text-2xl mb-3">{groceryList ? `${groceryProgress}% complete` : "No list yet"}</h2>
              <p className="text-sm">{groceryList ? `${groceryList.items.length} analyzed grocery items` : "Save AI output to your grocery page"}</p>
            </Link>

            <Link href="/dashboard/meal-planner" className="card min-h-44 bg-white">
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)] mb-4">Today&apos;s meals</p>
              <h2 className="text-2xl mb-3">{todayPlan ? todayPlan.day : "No plan"}</h2>
              <p className="text-sm">{todayPlan ? `${todayPlan.breakfast.items[0]} starts the day` : "Generate from the logged analysis"}</p>
            </Link>
          </section>

          <section className="surface-panel p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">Schedule</p>
                <h2 className="text-3xl mt-1">Current day plan</h2>
              </div>
              <Link href="/dashboard/meal-planner" className="btn-secondary">
                View planner
              </Link>
            </div>

            {todayPlan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => {
                  const mealData = todayPlan[meal];
                  if (!mealData) return null;
                  return (
                    <div key={meal} className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent-warm)] mb-2">
                        {meal}
                      </p>
                      <h3 className="text-xl mb-3">{mealData.calories} cal</h3>
                      <p className="text-sm">{mealData.items.slice(0, 2).join(", ")}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.75rem] bg-[var(--bg-panel)] p-8 text-center">
                <h3 className="text-2xl mb-2">No meal plan active</h3>
                <p className="mb-5">Generate one after logging an AI analysis.</p>
                <Link href="/dashboard/meal-planner" className="btn-primary">
                  Generate meals
                </Link>
              </div>
            )}
          </section>
        </main>

        <aside className="surface-panel p-5 sm:p-6 h-fit xl:sticky xl:top-0">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
              Health score
            </p>
            <div className="mx-auto my-6 h-40 w-40 rounded-full bg-[conic-gradient(var(--bg-ink)_0deg,var(--bg-ink)_calc(var(--score)*3.6deg),#d9deea_0deg)] p-4" style={{ "--score": avgScore } as CSSProperties}>
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                <strong className="text-4xl">{avgScore || "--"}{avgScore ? "%" : ""}</strong>
              </div>
            </div>
            <p className="text-center text-sm">
              {avgScore ? "Based on your latest nutrient scorecard." : "Run a consultation to calculate this."}
            </p>
            {avgScore > 0 && (
              <div className="mt-5 space-y-3 rounded-[1.5rem] bg-white p-4 text-sm shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-[var(--text-primary)]">Trend</span>
                  <span
                    className={`badge ${
                      scoreDelta > 0
                        ? "badge-success"
                        : scoreDelta < 0
                        ? "badge-warning"
                        : "badge-lavender"
                    }`}
                  >
                    {previousScore
                      ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta} vs last`
                      : "First score"}
                  </span>
                </div>

                {lowestNutrients.length > 0 && (
                  <div>
                    <p className="mb-2 font-semibold text-[var(--text-primary)]">Lowest markers</p>
                    <div className="space-y-2">
                      {lowestNutrients.map((nutrient) => (
                        <div key={nutrient.key} className="flex items-center justify-between gap-3">
                          <span className="text-[var(--text-secondary)]">{nutrient.label}</span>
                          <span className="font-bold">{nutrient.score}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="border-t border-[var(--border-subtle)] pt-3 text-xs leading-5 text-[var(--text-secondary)]">
                  Scored from {scoredNutrientCount} AI-estimated nutrient markers in your latest analysis. Progress appears when a new analysis changes these scores; checklist completion is tracked separately.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-6">
            <h2 className="text-2xl mb-4">Recent Logs</h2>
            {recentSymptoms.length > 0 ? (
              <div className="space-y-3">
                {recentSymptoms.map((log) => (
                  <div key={log.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <h3 className="text-base">{log.symptoms[0] || "Symptom log"}</h3>
                    <p className="text-sm">Severity {log.severity}/5</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm">
                <p className="text-sm">No recent symptom logs.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
