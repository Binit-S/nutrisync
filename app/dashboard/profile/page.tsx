/* 
 * NutriSync v2 — Profile Page
 * User health profile management:
 *   - Edit height, weight, age, sex, goals, dietary restrictions
 *   - BMI calculation and display
 *   - Save to Firestore
*/

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { calculateBMI, getBMICategory } from "@/lib/utils";
import type { HealthProfile } from "@/types";

export default function ProfilePage() {
  const { user } = useAuth();

  /* Form state */
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<HealthProfile["sex"]>("male");
  const [goals, setGoals] = useState("");
  const [restrictions, setRestrictions] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  /* Load existing profile */
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data().healthProfile) {
          const hp = snap.data().healthProfile as HealthProfile;
          setHeight(String(hp.height || ""));
          setWeight(String(hp.weight || ""));
          setAge(String(hp.age || ""));
          setSex(hp.sex || "male");
          setGoals(hp.goals || "");
          setRestrictions(hp.dietaryRestrictions?.join(", ") || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  /**
   * Save profile to Firestore.
   */
  async function handleSave() {
    if (!user) return;

    setSaving(true);
    setSaved(false);

    try {
      const userRef = doc(db, "users", user.uid);
      const healthProfile: HealthProfile = {
        height: Number(height) || 0,
        weight: Number(weight) || 0,
        age: Number(age) || 0,
        sex,
        goals,
        dietaryRestrictions: restrictions
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
      };

      await setDoc(userRef, { healthProfile, updatedAt: new Date() }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  }

  /* Calculate BMI */
  const bmi = calculateBMI(Number(height), Number(weight));
  const bmiCategory = getBMICategory(bmi);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="app-shell space-y-6 animate-fade-in">
      {/* Header */}
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Your health profile helps the AI provide better recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <aside className="space-y-6">
          {/* User info card */}
          <div className="card flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--bg-ink)] text-white flex items-center justify-center text-2xl font-bold">
                {user?.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate">{user?.displayName || "User"}</h2>
              <p className="text-sm text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>

          {/* BMI Card */}
          <div className="card bg-[var(--bg-ink)] text-white">
            <p className="text-sm text-white/55 mb-2">Body Mass Index</p>
            <div className="text-5xl font-bold mt-1">{bmi || "--"}</div>
            <p className="text-sm text-white/65 mt-2">
              {bmi > 0 ? bmiCategory.label : "Add height and weight"}
            </p>
            <div className="mt-6 flex h-3 rounded-full overflow-hidden">
              <div className="w-1/4" style={{ background: "rgba(250,204,21,0.7)" }} />
              <div className="w-1/4" style={{ background: "rgba(74,222,128,0.7)" }} />
              <div className="w-1/4" style={{ background: "rgba(232,168,124,0.7)" }} />
              <div className="w-1/4" style={{ background: "rgba(248,113,113,0.7)" }} />
            </div>
          </div>
        </aside>

        {/* Health Profile Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Health Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Height (cm)
              </label>
              <input
                id="height-input"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 175"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Weight (kg)
              </label>
              <input
                id="weight-input"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 70"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Age
              </label>
              <input
                id="age-input"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 25"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Sex
              </label>
              <select
                id="sex-input"
                value={sex}
                onChange={(e) => setSex(e.target.value as HealthProfile["sex"])}
                className="input-field"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Health Goals
            </label>
            <input
              id="goals-input"
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., Lose weight, Improve energy, Build muscle"
              className="input-field"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Dietary Restrictions (comma-separated)
            </label>
            <input
              id="restrictions-input"
              type="text"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="e.g., Vegan, Gluten-free, Lactose intolerant"
              className="input-field"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full mt-6"
            id="save-profile-btn"
          >
            {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
