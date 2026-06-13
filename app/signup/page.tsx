// @ts-nocheck
"use client";
import { useState } from "react";
import { supabase } from "../supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !password || !confirmPassword) {
      return alert("Please enter your email, password, and confirm password");
    }
    if (password.length < 6) {
      return alert("Password must be at least 6 characters");
    }
    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    setLoading(false);

    if (error) return alert(error.message);
    alert("Account created! Check your email to confirm your subscription, then sign in.");
    window.location.href = "/login";
  }

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 400, margin: "0 auto", padding: "60px 20px", background: "white", minHeight: "100vh", color: "#111" },
    title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
    sub: { color: "#888", fontSize: 14, marginBottom: 32 },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    btn: (bg) => ({ width: "100%", padding: 14, background: bg, color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }),
    link: { background: "none", border: "none", color: "#ff4d00", fontSize: 13, cursor: "pointer", padding: 0 },
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Create your account</h1>
      <p style={s.sub}>Get your restaurant online in minutes</p>

      <input style={s.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input style={s.input} placeholder="Password (min 6 characters)" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <input style={s.input} placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSignup(); }} />

      <button style={s.btn("#111")} onClick={handleSignup} disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      <div style={{ marginTop: 16 }}>
        <a href="/login" style={{ ...s.link, textDecoration: "none" }}>Already have an account? Sign in →</a>
      </div>
    </div>
  );
}