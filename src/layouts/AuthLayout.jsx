import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background:
        "radial-gradient(1000px 600px at 100% -200px, rgba(255,110,168,.08), transparent)"
    }}>
      <div style={{ position: "absolute", top: 18, left: 18, color: "#8a8aa0" }}>
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          ← Back to app
        </Link>
      </div>
      {children}
    </div>
  );
}
