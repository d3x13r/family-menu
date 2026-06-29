import { useState } from "react";
import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
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
        maxWidth: 400,
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
          {isRegister ? "Създай акаунт" : "Добре дошъл"}
        </h2>
        <p style={{ color: "#6F7B73", fontSize: 14, marginBottom: 28 }}>
          {isRegister ? "Регистрирай се за да започнеш" : "Влез в акаунта си"}
        </p>

        <input
          type="email"
          placeholder="Имейл"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Парола"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "#A0432E", fontSize: 13, marginBottom: 16, background: "#F7ECE8", padding: "10px 14px", borderRadius: 8 }}>
            {error}
          </p>
        )}

        <button onClick={handleSubmit} style={{
          width: "100%", padding: "12px",
          background: "#2E6B4F", color: "white",
          border: "none", borderRadius: 11,
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700, fontSize: 15,
          cursor: "pointer", marginBottom: 16,
        }}>
          {isRegister ? "Регистрация" : "Вход"}
        </button>

        <p
          onClick={() => setIsRegister(!isRegister)}
          style={{ textAlign: "center", color: "#2E6B4F", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          {isRegister ? "Вече имам акаунт → Вход" : "Нямам акаунт → Регистрация"}
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  marginBottom: 14,
  borderRadius: 10,
  border: "1.5px solid #E2DDD3",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 14,
  color: "#1E2A24",
  outline: "none",
  boxSizing: "border-box",
  background: "white",
};