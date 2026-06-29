import { useState } from "react";
import { db, auth } from "../firebase/config";
import {
  doc, setDoc, getDoc, updateDoc, arrayUnion,
} from "firebase/firestore";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Family({ onFamilyJoined }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createFamily = async () => {
    setLoading(true); setError("");
    try {
      const newCode = generateCode();
      await setDoc(doc(db, "families", newCode), {
        code: newCode,
        members: [auth.currentUser.uid],
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      });
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        email: auth.currentUser.email,
        familyCode: newCode,
      });
      onFamilyJoined(newCode);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const joinFamily = async () => {
    setLoading(true); setError("");
    try {
      const familyRef = doc(db, "families", code.toUpperCase());
      const familySnap = await getDoc(familyRef);
      if (!familySnap.exists()) {
        setError("Невалиден код. Опитай отново.");
        setLoading(false); return;
      }
      await updateDoc(familyRef, { members: arrayUnion(auth.currentUser.uid) });
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        email: auth.currentUser.email,
        familyCode: code.toUpperCase(),
      });
      onFamilyJoined(code.toUpperCase());
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F6F4EF",
      fontFamily: "'Manrope', sans-serif",
      padding: "1rem",
    }}>
      <div style={{
        background: "white",
        border: "1px solid #ECE8DF",
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 4px 24px rgba(30,42,36,0.08)",
      }}>
        {/* Лого */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#2E6B4F" strokeWidth="2"/>
            <circle cx="14" cy="14" r="6" stroke="#2E6B4F" strokeWidth="2"/>
          </svg>
          <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 22, color: "#1E2A24" }}>
            Семейно Меню
          </span>
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, color: "#1E2A24", marginBottom: 6 }}>
          Вашето семейство
        </h2>
        <p style={{ color: "#6F7B73", fontSize: 14, marginBottom: 32 }}>
          Създай ново семейство или се присъедини към съществуващо
        </p>

        <button onClick={createFamily} disabled={loading} style={{
          width: "100%", padding: "12px",
          background: "#2E6B4F", color: "white",
          border: "none", borderRadius: 11,
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700, fontSize: 15,
          cursor: "pointer", marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Създай ново семейство
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "#ECE8DF" }} />
          <span style={{ color: "#B6BAB2", fontSize: 13, fontWeight: 500 }}>или</span>
          <div style={{ flex: 1, height: 1, background: "#ECE8DF" }} />
        </div>

        <input
          type="text"
          placeholder="Въведи код на семейство"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: "100%", padding: "11px 14px", marginBottom: 12,
            borderRadius: 10, border: "1.5px solid #E2DDD3",
            fontFamily: "'Manrope', sans-serif", fontSize: 14,
            color: "#1E2A24", outline: "none", boxSizing: "border-box",
            background: "white", letterSpacing: "0.05em",
          }}
        />

        <button onClick={joinFamily} disabled={loading} style={{
          width: "100%", padding: "12px",
          background: "white", color: "#2E6B4F",
          border: "2px solid #2E6B4F", borderRadius: 11,
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700, fontSize: 15,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Присъедини се
        </button>

        {error && (
          <p style={{ color: "#A0432E", fontSize: 13, marginTop: 16, background: "#F7ECE8", padding: "10px 14px", borderRadius: 8 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}