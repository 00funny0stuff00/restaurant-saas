// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../supabase";

export default function KitchenLogin() {
  const [slug, setSlug] = useState("");
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const s = window.location.pathname.split("/")[1];
    setSlug(s);
    async function fetchTenant() {
      const { data } = await supabase
        .from("tenants")
        .select("name, primary_color, kitchen_pin")
        .eq("slug", s)
        .single();
      setTenant(data);
      setLoading(false);
    }
    fetchTenant();
  }, []);

  function handlePinLogin() {
    setError("");
    if (!tenant?.kitchen_pin) {
      setError("No PIN set. Ask your admin to set a kitchen PIN.");
      return;
    }
    if (pin === tenant.kitchen_pin) {
      sessionStorage.setItem(`kitchen_auth_${slug}`, "true");
      window.location.href = `/${slug}/kitchen`;
    } else {
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  }

  async function handleGoogleLogin() {
    setLoggingIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://restaurant-saas-vert.vercel.app/${slug}/kitchen`,
      },
    });
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif", background: "#f9f9f9" }}>
      <p style={{ color: "#888" }}>Loading...</p>
    </div>
  );

  const primary = tenant?.primary_color || "#ff4d00";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      padding: 16,
    }}>
      <div style={{
        background: "white",
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 360,
        boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: primary, marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
        }}>🍳</div>

        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#111" }}>Kitchen Login</h2>
        <p style={{ margin: "0 0 32px", color: "#888", fontSize: 14 }}>{tenant?.name}</p>

        {/* PIN input */}
        <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 8 }}>
          KITCHEN PIN
        </label>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => { setPin(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handlePinLogin()}
          placeholder="Enter PIN"
          maxLength={8}
          style={{
            display: "block",
            width: "100%",
            padding: "13px 16px",
            fontSize: 22,
            letterSpacing: 6,
            textAlign: "center",
            border: error ? "2px solid #ef4444" : "2px solid #e5e5e5",
            borderRadius: 12,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 8,
            color: "#111",
          }}
          autoFocus
        />

        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>
        )}

        <button
          onClick={handlePinLogin}
          style={{
            width: "100%",
            padding: "14px 0",
            background: primary,
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 20,
            marginTop: error ? 0 : 8,
          }}
        >
          Login with PIN
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#eee" }} />
          <span style={{ color: "#aaa", fontSize: 13 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#eee" }} />
        </div>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loggingIn}
          style={{
            width: "100%",
            padding: "13px 0",
            background: "white",
            color: "#333",
            border: "2px solid #e5e5e5",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: loggingIn ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: loggingIn ? 0.6 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.8 40 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {loggingIn ? "Redirecting..." : "Continue with Google"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#bbb", marginTop: 24, marginBottom: 0 }}>
          Kitchen staff access only
        </p>
      </div>
    </div>
  );
}