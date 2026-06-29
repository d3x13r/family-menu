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
      background: "#EAF2EC",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "2rem",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "380px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{ color: "#4A7C59", marginBottom: "0.25rem" }}>
          🍽️ Семейно Меню
        </h1>
        <p style={{ color: "#888", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          {isRegister ? "Създай акаунт" : "Влез в акаунта си"}
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
          <p style={{ color: "red", fontSize: "0.8rem", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        <button onClick={handleSubmit} style={btnStyle}>
          {isRegister ? "Регистрация" : "Вход"}
        </button>

        <p
          onClick={() => setIsRegister(!isRegister)}
          style={{ textAlign: "center", color: "#4A7C59", cursor: "pointer", fontSize: "0.85rem", marginTop: "1rem" }}
        >
          {isRegister ? "Вече имам акаунт → Вход" : "Нямам акаунт → Регистрация"}
        </p>
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
  cursor: "pointer"
};