import { Link } from "react-router-dom";

export default function WelcomeAuth() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-black to-pink-200">
      {/* header */}
      <header className="absolute top-6 left-0 right-0 flex items-center justify-between px-6 md:px-10">
        <Link to="/" className="text-base md:text-lg font-semibold text-pink-200">
          Blush & Bloom
        </Link>
      </header>

      {/* auth card */}
      <div className="w-[92%] max-w-md rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md shadow-2xl p-6 md:p-8 text-white">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-semibold">Let’s get you in</h1>
          <p className="mt-1 text-sm text-pink-200">Choose an option to continue</p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl border border-pink-200 bg-transparent px-5 py-3 text-sm font-medium text-pink-200 hover:bg-pink-200 hover:text-black active:scale-[0.99] transition"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-xl border border-transparent px-5 py-3 text-sm font-medium bg-pink-200 text-black hover:bg-black hover:text-pink-200 hover:border-pink-200 shadow-lg active:scale-[0.99] transition"
          >
            Sign up
          </Link>
        </div>

        <p className="mt-5 text-center text-xs text-pink-200">
          By continuing, you agree to the{" "}
          <span className="text-pink-200">Terms</span> &{" "}
          <span className="text-pink-200">Privacy</span>
        </p>
      </div>
    </div>
  );
}
