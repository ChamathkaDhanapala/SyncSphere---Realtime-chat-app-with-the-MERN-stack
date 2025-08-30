import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const nav = useNavigate();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    
    if (!formData.username || !formData.email || !formData.password) {
      return;
    }
    
    try {
      const result = await register(formData.username, formData.email, formData.password);
      
      if (result.success) {
        nav("/"); 
      }
    } catch (e) {
      console.error("Registration error:", e);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input 
            name="username"
            value={formData.username} 
            onChange={handleChange} 
            placeholder="Username" 
            className="w-full p-3 rounded-xl outline-none" 
            disabled={loading}
          />
          <input 
            name="email"
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="Email" 
            className="w-full p-3 rounded-xl outline-none" 
            disabled={loading}
          />
          <input 
            name="password"
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Password" 
            className="w-full p-3 rounded-xl outline-none" 
            disabled={loading}
          />
          <button 
            type="submit"
            className="w-full p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-emerald-400">Log in</Link>
        </p>
      </div>
    </div>
  );
}