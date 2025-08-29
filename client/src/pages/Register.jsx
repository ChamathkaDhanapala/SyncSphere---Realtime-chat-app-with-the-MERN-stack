import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      nav("/");
    } catch (e) {
      setError(e?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full p-3 rounded-xl outline-none" />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded-xl outline-none" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full p-3 rounded-xl outline-none" />
          <button className="w-full p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition">Sign up</button>
        </form>
        <p className="mt-4 text-sm text-slate-400">Already have an account? <Link to="/login" className="text-emerald-400">Log in</Link></p>
      </div>
    </div>
  );
}
