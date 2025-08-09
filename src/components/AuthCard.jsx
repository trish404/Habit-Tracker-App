export default function AuthCard({ title, subtitle, footer, children }) {
    return (
      <div style={{
        width: 380,
        background: "var(--card)",
        border: "1px solid var(--ring)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 10px 30px rgba(0,0,0,.25)"
      }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="dot" />
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>
          {subtitle && <div className="subtle">{subtitle}</div>}
        </div>
  
        <div className="row" style={{ flexDirection: "column", gap: 10 }}>
          {children}
        </div>
  
        {footer && <div style={{ marginTop: 14 }} className="subtle">{footer}</div>}
      </div>
    );
  }
  