import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/AuthCard";

export default function Signup() {
  return (
    <AuthLayout>
      <AuthCard
        title="Create account"
        subtitle="Start fresh—habits, streaks, and more"
        footer={<span>Already have an account? <Link to="/login">Log in</Link></span>}
      >
        <input className="input" type="text" placeholder="Name" />
        <input className="input" type="email" placeholder="Email" />
        <input className="input" type="password" placeholder="Password" />
        <button className="btn" style={{ width: "100%" }}>Sign Up</button>
        <div style={{ fontSize: 12 }} className="subtle">
          By continuing, you agree to the Terms and Privacy.
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
