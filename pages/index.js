export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Elli Beans Dashboard
      </h1>

      <p style={{ marginTop: "1rem", color: "#555" }}>
        Welcome to your internal shop dashboard.
      </p>

      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <a href="/inventory" style={linkStyle}>📦 Inventory</a>
        <a href="/recipes" style={linkStyle}>📘 Recipes</a>
        <a href="/products" style={linkStyle}>🛍 Products</a>
        <a href="/KDS" style={linkStyle}>🍳 Kitchen Display System</a>
      </div>
    </div>
  );
}

const linkStyle = {
  padding: "1rem",
  background: "#f5f5f5",
  borderRadius: "8px",
  textDecoration: "none",
  color: "#333",
  fontWeight: "600",
  width: "200px",
};
