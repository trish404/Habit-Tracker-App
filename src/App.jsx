import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import WelcomeAuth from "./pages/auth/WelcomeAuth";
import Dashboard from "./pages/Dashboard";
import HabitsPage from "./pages/Habits";
import Weight from "./pages/Weight";
import EatOut from "./pages/EatOut";

// Later we’ll add:
// import Dashboard from "./pages/Dashboard";
// import Habits from "./pages/Habits";
// ...

import "./index.css";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/get-started" element={<WelcomeAuth />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/habits" element={<HabitsPage />} />
      <Route path="/weight" element={<Weight />} />
      <Route path="/eat" element={<EatOut />} />

      {/* Placeholder protected routes (we'll build these after auth) */}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
