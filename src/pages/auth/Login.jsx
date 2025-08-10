import { Link } from "react-router-dom";
import AuthCard from "../../components/AuthCard";

export default function Login() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome back</h1>
          <p className="text-pink-200 mt-2">Log in to continue tracking your habits</p>
        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-4">
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

          {/* Log In Button */}
          <button
            className="w-full rounded-xl border border-pink-200 bg-transparent px-5 py-3 text-sm font-medium text-pink-200 hover:bg-pink-200 hover:text-black transition"
            type="submit"
          >
            Log In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px bg-pink-200/40 flex-1" />
            <span className="text-xs text-pink-200">or</span>
            <div className="h-px bg-pink-200/40 flex-1" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full rounded-xl px-5 py-3 text-sm font-medium bg-pink-200 text-black hover:bg-black hover:text-pink-200 hover:border-pink-200 border border-transparent transition"
          >
            Continue with Google
          </button>

          {/* Options Row */}
          <div className="flex items-center justify-between text-xs text-pink-200">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-pink-200" />
              Remember me
            </label>
            <Link to="/reset" className="text-pink-300 hover:underline">
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Footer Section */}
        <div className="mt-6 text-center text-xs text-pink-200">
          New here?{" "}
          <Link to="/signup" className="text-pink-300 hover:underline">
            Create an account
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
