import { useState } from "react";
import { db, auth } from "../firebase/config";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Family({ onFamilyJoined }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createFamily = async () => {
    setLoading(true);
    setError("");
    try {
      const newCode = generateCode();
      const familyRef = doc(db, "families", newCode);
      await setDoc(familyRef, {
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
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const joinFamily = async () => {
    setLoading(true);
    setError("");
    try {
      const familyRef = doc(db, "families", code.toUpperCase());
      const familySnap = await getDoc(familyRef);
      if (!familySnap.exists()) {
        setError("Невалиден код. Опитай отново.");
        setLoading(false);
        return;
      }
      await updateDoc(familyRef, {
        members: arrayUnion(auth.currentUser.uid),
      });
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        email: auth.currentUser.email,
        familyCode: code.toUpperCase(),
      });
      onFamilyJoined(code.toUpperCase());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#EAF2EC",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "2rem",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{ color: "#4A7C59", marginBottom: "0.25rem" }}>🏠 Семейство</h2>
        <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Създай ново семейство или се присъедини към съществуващо
        </p>

        <button onClick={createFamily} disabled={loading} style={btnStyle}>
          ➕ Създай ново семейство
        </button>

        <div style={{ textAlign: "center", color: "#aaa", margin: "1.25rem 0", fontSize: "0.85rem" }}>
          — или —
        </div>

        <input
          type="text"
          placeholder="Въведи код на семейство"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={inputStyle}
        />
        <button onClick={joinFamily} disabled={loading} style={btnOutlineStyle}>
          🔗 Присъедини се
        </button>

        {error && (
          <p style={{ color: "red", fontSize: "0.8rem", marginTop: "1rem" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "1rem",
  borderRadius: "8px",
  border: "1.5px solid #D8E4DA",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box"
};

const btnStyle = {
  width: "100%",
  padding: "0.75rem",
  background: "#4A7C59",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  marginBottom: "0.5rem"
};

const btnOutlineStyle = {
  width: "100%",
  padding: "0.75rem",
  background: "white",
  color: "#4A7C59",
  border: "2px solid #4A7C59",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer"
};