import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/AuthCard";

export default function Login() {
  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Log in to continue tracking your habits"
        footer={<span>New here? <Link to="/signup">Create an account</Link></span>}
      >
        <input className="input" type="email" placeholder="Email" />
        <input className="input" type="password" placeholder="Password" />
        <button className="btn" style={{ width: "100%" }}>Log In</button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ height: 1, background: "var(--ring)", flex: 1 }} />
          <span className="subtle">or</span>
          <div style={{ height: 1, background: "var(--ring)", flex: 1 }} />
        </div>

        <button className="btn" style={{ width: "100%" }}>
          Continue with Google
        </button>

        <label className="switch" style={{ marginTop: 6 }}>
          <input type="checkbox" />
          <span>Remember me</span>
        </label>

        <Link to="/reset" className="subtle" style={{ marginTop: 2 }}>
          Forgot password?
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}
