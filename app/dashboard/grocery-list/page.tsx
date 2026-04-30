"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { AISLE_CATEGORIES } from "@/lib/constants";
import { generateId, getCurrentWeekId } from "@/lib/utils";
import type { Consultation, GroceryCategory, GroceryItem, GroceryList } from "@/types";

const categoryKeys = Object.keys(AISLE_CATEGORIES) as GroceryCategory[];

function itemsFromConsultation(consultation: Consultation): GroceryItem[] {
  const items: GroceryItem[] = [];

  for (const category of categoryKeys) {
    const categoryItems = consultation.result?.buy_list?.[category] || [];

    for (const name of categoryItems) {
      items.push({
        id: generateId(),
        name,
        category,
        aisle: AISLE_CATEGORIES[category].label,
        checked: false,
        inMultipleWeeks: false,
      });
    }
  }

  return items;
}

export default function GroceryListPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [latestConsultation, setLatestConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const activeList = lists[0] || null;
  const items = activeList?.items || [];

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const listRef = collection(db, "users", user.uid, "groceryLists");
        const listSnap = await getDocs(query(listRef, orderBy("createdAt", "desc"), limit(6)));
        setLists(
          listSnap.docs.map((snap) => ({
            id: snap.id,
            ...snap.data(),
          })) as GroceryList[]
        );

        const consultRef = collection(db, "users", user.uid, "consultations");
        const consultSnap = await getDocs(query(consultRef, orderBy("createdAt", "desc"), limit(1)));
        if (!consultSnap.empty) {
          setLatestConsultation({
            id: consultSnap.docs[0].id,
            ...consultSnap.docs[0].data(),
          } as Consultation);
        }
      } catch (err) {
        console.error("Error fetching grocery data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    for (const item of items) {
      const category = item.category || "others";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    }

    return Object.entries(groups).sort((a, b) => {
      const orderA = AISLE_CATEGORIES[a[0] as GroceryCategory]?.order || 99;
      const orderB = AISLE_CATEGORIES[b[0] as GroceryCategory]?.order || 99;
      return orderA - orderB;
    });
  }, [items]);

  const checkedCount = items.filter((item) => item.checked).length;
  const progress = items.length ? Math.round((checkedCount / items.length) * 100) : 0;

  async function persistItems(nextItems: GroceryItem[]) {
    if (!user || !activeList) return;
    await updateDoc(doc(db, "users", user.uid, "groceryLists", activeList.id), {
      items: nextItems,
      updatedAt: serverTimestamp(),
    });
  }

  async function toggleItem(itemId: string) {
    if (!activeList) return;

    const nextItems = items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    setLists((prev) =>
      prev.map((list, index) => (index === 0 ? { ...list, items: nextItems } : list))
    );

    try {
      await persistItems(nextItems);
    } catch (err) {
      console.error("Failed to update item:", err);
      setStatus("Could not update the checklist item.");
    }
  }

  async function saveLatestAnalysis() {
    if (!user || !latestConsultation) return;

    const analyzedItems = itemsFromConsultation(latestConsultation);
    if (analyzedItems.length === 0) {
      setStatus("The latest analysis does not contain grocery items.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const created = await addDoc(collection(db, "users", user.uid, "groceryLists"), {
        uid: user.uid,
        weekId: getCurrentWeekId(),
        consultationId: latestConsultation.id,
        sourceDeficiency: latestConsultation.result.deficiency,
        sourceMode: latestConsultation.mode,
        items: analyzedItems,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newList: GroceryList = {
        id: created.id,
        uid: user.uid,
        weekId: getCurrentWeekId(),
        consultationId: latestConsultation.id,
        sourceDeficiency: latestConsultation.result.deficiency,
        sourceMode: latestConsultation.mode,
        items: analyzedItems,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setLists((prev) => [newList, ...prev]);
      setStatus(`${analyzedItems.length} analyzed items were logged into this checklist.`);
    } catch (err) {
      console.error("Failed to save latest analysis:", err);
      setStatus("Could not log the latest analysis.");
    } finally {
      setSaving(false);
    }
  }

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
      <section className="surface-panel overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <div className="bg-[var(--bg-ink)] text-white p-6 sm:p-8 flex flex-col justify-between gap-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3">
                To-buy list
              </p>
              <h1 className="text-4xl text-white mb-4">Grocery Checklist</h1>
              <p className="text-white/65">
                AI analyzed items live here now. Check them off while shopping and keep each analysis logged by week.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-5">
              <div className="flex items-end justify-between mb-3">
                <span className="text-sm text-white/60">Completed</span>
                <strong className="text-4xl text-white">{progress}%</strong>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-white/60 mt-3">
                {items.length ? `${checkedCount} of ${items.length} items checked` : "No active checklist yet"}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  {activeList?.weekId || getCurrentWeekId()}
                </p>
                <h2 className="text-2xl mt-1">
                  {activeList?.sourceDeficiency || "No analyzed list selected"}
                </h2>
              </div>

              {latestConsultation && (
                <button
                  onClick={saveLatestAnalysis}
                  disabled={saving}
                  className="btn-primary shrink-0"
                  id="save-latest-analysis-btn"
                >
                  {saving ? "Logging..." : "Log latest analysis"}
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--bg-panel)] p-8 text-center">
                <h3 className="text-2xl mb-3">No grocery items yet</h3>
                <p className="max-w-md mx-auto mb-5">
                  Run a dietitian analysis, then add the returned food list here as your shopping checklist.
                </p>
                <Link href="/dashboard/consult" className="btn-secondary">
                  Open dietitian agent
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {groupedItems.map(([category, categoryItems]) => {
                  const info = AISLE_CATEGORIES[category as GroceryCategory];
                  return (
                    <div key={category} className="rounded-[1.5rem] bg-[var(--bg-panel)] p-4">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                            {info?.emoji || "•"}
                          </span>
                          <div>
                            <h3 className="text-base">{info?.label || category}</h3>
                            <p className="text-xs">
                              {categoryItems.filter((item) => item.checked).length}/{categoryItems.length} done
                            </p>
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {categoryItems.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => toggleItem(item.id)}
                              className={`w-full rounded-2xl bg-white p-3 text-left flex items-center gap-3 transition ${item.checked ? "opacity-55" : "hover:shadow-sm"}`}
                            >
                              <span className={`h-5 w-5 rounded-md border flex items-center justify-center text-xs font-bold ${item.checked ? "bg-[var(--bg-ink)] border-[var(--bg-ink)] text-white" : "border-[var(--border-strong)]"}`}>
                                {item.checked ? "✓" : ""}
                              </span>
                              <span className={`flex-1 text-sm font-semibold ${item.checked ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
                                {item.name}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {status && (
              <p className="mt-5 rounded-2xl bg-[var(--bg-panel)] p-3 text-center text-sm font-semibold">
                {status}
              </p>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
