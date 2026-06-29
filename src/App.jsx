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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EAF2EC" }}>
      <p style={{ color: "#4A7C59", fontSize: "1.2rem" }}>Зареждане...</p>
    </div>
  );

  if (!user) return <Login />;

  if (!familyCode) return (
    <Family onFamilyJoined={(code) => setFamilyCode(code)} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#EAF2EC", fontFamily: "sans-serif" }}>
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        familyCode={familyCode}
      />
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem" }}>
        {activePage === "menu" && <MenuView familyCode={familyCode} />}
        {activePage === "create" && <MenuCreate familyCode={familyCode} />}
        {activePage === "dishes" && <Dishes familyCode={familyCode} />}
      </div>
    </div>
  );
}

export default App;