"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    title: "Dietitian Agent",
    text: "Analyze a known deficiency or symptoms and get a focused nutrition protocol.",
    image: "/dietitian_agent.webp",
  },
  {
    title: "Analyzed Grocery Log",
    text: "Save AI-recommended foods into an in-app checklist instead of sending them elsewhere.",
    image: "/Grocerylog.webp",
  },
  {
    title: "Meal Schedule",
    text: "Generate a seven-day meal plan from the exact analysis that created your checklist.",
    image: "/Meal Schedule.webp",
  },
];

const faqs = [
  {
    question: "Can I use symptom-based analysis?",
    answer: "Yes! NutriSync's dietitian agent analyzes your symptoms and creates a focused nutrition protocol tailored to your specific needs.",
  },
  {
    question: "Can I keep vegan or allergy constraints?",
    answer: "Absolutely. You can set dietary preferences and allergies during your analysis, and all recommendations will respect your constraints.",
  },
  {
    question: "Can I track grocery completion?",
    answer: "Yes, you can check off items as you shop. The grocery checklist updates in real-time to help you stay organized.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] || "User";
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <nav className="sticky top-0 z-50 border-b border-white/80 bg-[rgba(248,250,252,0.88)] backdrop-blur-xl">
        <div className="content-shell h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-ink)] text-white font-black">
              N
            </span>
            <span className="font-black text-xl">NutriSync</span>
          </Link>

          {loading ? (
            <div className="skeleton h-11 w-32" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm font-semibold text-[var(--text-secondary)]">
                Welcome back, <strong className="text-[var(--text-primary)]">{firstName}</strong>
              </span>
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-secondary">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary hidden sm:inline-flex">
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section className="content-shell py-8 sm:py-10">
        <div className="surface-panel p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5">
            <div className="rounded-[1.75rem] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-center min-h-[360px]">
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent-warm)] mb-5">
                AI nutrition workspace
              </p>
              <h1 className="text-4xl sm:text-5xl max-w-3xl mb-6 leading-[1.04]">
                Your dietitian agent, grocery log, and meal planner in one place.
              </h1>
              <p className="text-base sm:text-lg max-w-2xl mb-8 text-[var(--text-secondary)]">
                NutriSync turns deficiency analysis into practical next steps: food protocol, checklist, and a daily meal schedule.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={user ? "/dashboard/consult" : "/register"} className="btn-primary">
                  Let&apos;s get started
                </Link>
                <Link href={user ? "/dashboard" : "/login"} className="btn-secondary">
                  {user ? "Open dashboard" : "Sign in"}
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[var(--bg-ink)] p-5 sm:p-6 text-white min-h-[360px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Signed in state</span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
                  {user ? firstName : "Guest"}
                </span>
              </div>
              <div>
                <h2 className="text-4xl text-white mb-4">Welcome back</h2>
                <p className="text-white/65 mb-6">
                  Continue from your latest nutrition analysis and keep the day moving.
                </p>
                <Link href={user ? "/dashboard" : "/login"} className="btn-secondary">
                  Back on track
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-shell py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <article key={feature.title} className="card min-h-[210px]">
              <img src={feature.image} alt={feature.title} className="h-40 w-full rounded-2xl mb-6 object-contain" />
              <h2 className="text-2xl mb-3">{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-shell py-6">
        <div className="surface-panel p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)] mb-4">Flow</p>
              <h2 className="text-3xl mb-5">From analysis to dinner</h2>
              <div className="space-y-3">
                {["Analyze", "Add to checklist", "Generate meals"].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-2xl bg-[var(--bg-panel)] p-3">
                    <strong className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-ink)] text-white">
                      {index + 1}
                    </strong>
                    <span className="font-bold">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[var(--bg-panel)] p-4 sm:p-5">
              <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-2xl">Dashboard preview</h3>
                  <span className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">Active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
                  <div className="space-y-3">
                    {["Vitamin K analysis", "Grocery checklist", "Meal schedule"].map((row, index) => (
                      <div key={row} className={`rounded-2xl p-4 flex items-center justify-between ${index === 1 ? "bg-black text-white" : "bg-[var(--bg-panel)]"}`}>
                        <span className="font-bold">{row}</span>
                        <span className={index === 1 ? "text-white/60" : "text-[var(--text-muted)]"}>••</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-ink)] p-5 text-white">
                    <p className="text-white/50 text-sm mb-6">Account progress</p>
                    <strong className="text-5xl text-white">70%</strong>
                    <div className="mt-6 h-2 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full w-[70%] rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-shell py-6 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
          <div className="card">
            <h2 className="text-3xl mb-5">FAQ</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-2xl bg-[var(--bg-panel)] overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full p-4 font-bold text-left flex items-center justify-between hover:bg-[var(--bg-panel)]/80 transition-colors focus:outline-none focus:ring-0"
                  >
                    <span>{faq.question}</span>
                    <span className="ml-2 text-xl transition-transform" style={{
                      transform: openFAQ === index ? "rotate(180deg)" : "rotate(0deg)",
                    }}>
                      ▼
                    </span>
                  </button>
                  {openFAQ === index && (
                    <div className="p-4 pt-0 text-[var(--text-secondary)]">
                      <p className="text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <footer className="card flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <h2 className="text-3xl mb-3">Ready to build your nutrition plan?</h2>
              <p>Start with the dietitian agent and save your first analyzed grocery checklist.</p>
            </div>
            <Link href={user ? "/dashboard/consult" : "/register"} className="btn-primary shrink-0">
              Start now
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
