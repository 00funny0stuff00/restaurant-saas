// @ts-nocheck
"use client";
import { useState } from "react";
import { supabase } from "../supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return alert("Please enter email and password");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    window.location.href = "/dashboard";
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://restaurant-saas-vert.vercel.app/dashboard" }
    });
  }

  async function handleReset() {
    if (!email) return alert("Enter your email above first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://restaurant-saas-vert.vercel.app/reset-password"
    });
    if (error) return alert(error.message);
    alert("Password reset email sent!");
  }

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 400, margin: "0 auto", padding: "60px 20px", background: "white", minHeight: "100vh", color: "#111" },
    title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
    sub: { color: "#888", fontSize: 14, marginBottom: 32 },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    btn: (bg) => ({ width: "100%", padding: 14, background: bg, color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }),
    divider: { textAlign: "center", color: "#aaa", fontSize: 13, margin: "8px 0" },
    link: { background: "none", border: "none", color: "#ff4d00", fontSize: 13, cursor: "pointer", padding: 0, marginTop: 8 },
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Welcome back</h1>
      <p style={s.sub}>Sign in to your restaurant admin</p>

      <input style={s.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input style={s.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />

      <button style={s.btn("#111")} onClick={handleLogin} disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div style={s.divider}>or</div>

      <button style={{ ...s.btn("white"), color: "#111", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={handleGoogle}>
        <img src="https://www.google.com/favicon.ico" width={18} height={18} />
        Continue with Google
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button style={s.link} onClick={handleReset}>Forgot password?</button>
        <a href="/signup" style={{ ...s.link, textDecoration: "none" }}>No account? Sign up →</a>
      </div>
    </div>
  );
}