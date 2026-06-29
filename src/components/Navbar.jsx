export default function Navbar({ activePage, setActivePage, familyCode }) {
  return (
    <nav style={{
      background: "white",
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      fontFamily: "sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.4rem" }}>🍽️</span>
        <span style={{ fontWeight: "700", color: "#4A7C59", fontSize: "1.1rem" }}>
          Семейно Меню
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[
          { id: "menu", label: "📅 Меню" },
          { id: "create", label: "✏️ Създай" },
          { id: "dishes", label: "🍲 Ястия" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              background: activePage === item.id ? "#4A7C59" : "#EAF2EC",
              color: activePage === item.id ? "white" : "#4A7C59",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{
        fontSize: "0.75rem",
        color: "#888",
        background: "#EAF2EC",
        padding: "0.3rem 0.7rem",
        borderRadius: "6px"
      }}>
        Код: <strong style={{ color: "#4A7C59" }}>{familyCode}</strong>
      </div>
    </nav>
  );
}