export default function Navbar({ activePage, setActivePage, familyCode }) {
  const tabs = [
    {
      id: "menu", label: "Меню", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      id: "create", label: "Създай", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      )
    },
    {
      id: "dishes", label: "Ястия", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      )
    },
    {
      id: "list", label: "Списък", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      )
    },
  ];

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid #E8E4DB",
    }}>
      {/* Ред 1: Лого + Код */}
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "12px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#2E6B4F" strokeWidth="2"/>
            <circle cx="14" cy="14" r="6" stroke="#2E6B4F" strokeWidth="2"/>
          </svg>
          <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 20, color: "#1E2A24", letterSpacing: "-0.01em" }}>
            Семейно Меню
          </span>
        </div>
        <div style={{
          background: "#EDEAE2",
          borderRadius: 8,
          padding: "4px 12px",
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.08em",
          color: "#1E2A24",
        }}>
          КОД: {familyCode}
        </div>
      </div>

      {/* Ред 2: Табове */}
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "0 28px 10px",
        display: "flex",
        gap: 6,
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePage(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: "nowrap",
              transition: "background .15s, color .15s",
              background: activePage === tab.id ? "#2E6B4F" : "transparent",
              color: activePage === tab.id ? "white" : "#5E6B63",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}