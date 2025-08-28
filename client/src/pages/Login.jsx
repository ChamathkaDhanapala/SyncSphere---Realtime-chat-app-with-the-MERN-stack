import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/");
    } catch (e) {
      setError(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-6">Welcome back</h1>
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded-xl outline-none" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full p-3 rounded-xl outline-none" />
          <button className="w-full p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition">Log in</button>
        </form>
        <p className="mt-4 text-sm text-slate-400">No account? <Link to="/register" className="text-emerald-400">Create one</Link></p>
      </div>
    </div>
  );
}
