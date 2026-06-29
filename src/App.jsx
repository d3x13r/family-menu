import { useState, useEffect } from "react";
import { auth, db } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Login from "./pages/Login";
import Family from "./pages/Family";
import Navbar from "./components/Navbar";
import MenuView from "./pages/MenuView";
import MenuCreate from "./pages/MenuCreate";
import Dishes from "./pages/Dishes";
import ShoppingList from "./pages/ShoppingList";

function App() {
  const [user, setUser] = useState(null);
  const [familyCode, setFamilyCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("menu");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setFamilyCode(userDoc.data().familyCode);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F4EF" }}>
      <p style={{ color: "#2E6B4F", fontSize: "1.2rem", fontFamily: "'Manrope', sans-serif" }}>Зареждане...</p>
    </div>
  );

  if (!user) return <Login />;

  if (!familyCode) return (
    <Family onFamilyJoined={(code) => setFamilyCode(code)} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F6F4EF" }}>
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        familyCode={familyCode}
      />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 28px" }}>
        {activePage === "menu" && <MenuView familyCode={familyCode} />}
        {activePage === "create" && <MenuCreate familyCode={familyCode} />}
        {activePage === "dishes" && <Dishes familyCode={familyCode} />}
        {activePage === "list" && <ShoppingList familyCode={familyCode} />}
      </main>
    </div>
  );
}

export default App;