import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../../components/AuthCard";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault(); // prevent page reload
    navigate("/dashboard"); // go straight to dashboard
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-black to-pink-200">
      {/* Back link */}
      <header className="absolute top-6 left-6 md:left-10">
        <Link to="/" className="text-pink-200 hover:text-pink-300 transition">
          ← Back to app
        </Link>
      </header>

      <AuthCard>
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Create account</h1>
          <p className="text-pink-200 mt-2">Start fresh—habits, streaks, and more</p>
        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-4" onSubmit={handleSignup}>
          <input
            className="w-full rounded-lg border border-pink-200 bg-transparent px-4 py-2 text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-200"
            type="text"
            placeholder="Name"
          />
          <input
            className="w-full rounded-lg border border-pink-200 bg-transparent px-4 py-2 text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-200"
            type="email"
            placeholder="Email"
          />
          <input
            className="w-full rounded-lg border border-pink-200 bg-transparent px-4 py-2 text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-200"
            type="password"
            placeholder="Password"
          />

          {/* Sign Up Button */}
          <button
            className="w-full rounded-xl border border-pink-200 bg-pink-200 text-black hover:bg-black hover:text-pink-200 hover:border-pink-200 px-5 py-3 text-sm font-medium shadow-lg transition"
            type="submit"
          >
            Sign Up
          </button>

          {/* Terms & Privacy */}
          <div className="text-xs text-pink-200 text-center mt-1">
            By continuing, you agree to the{" "}
            <span className="text-pink-300">Terms</span> and{" "}
            <span className="text-pink-300">Privacy</span>.
          </div>
        </form>

        {/* Footer Section */}
        <div className="mt-6 text-center text-xs text-pink-200">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-300 hover:underline">
            Log in
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
