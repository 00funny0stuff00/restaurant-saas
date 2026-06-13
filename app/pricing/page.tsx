// @ts-nocheck
"use client";

export default function Pricing() {
  const s = {
    wrap: { maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif", color: "#333", lineHeight: 1.6 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 24 },
    logo: { fontSize: 20, fontWeight: 900, color: "#ff4d00", textDecoration: "none" },
    title: { fontSize: 28, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 },
    sub: { fontSize: 13, color: "#888", margin: 0 },
    card: { border: "2px solid #ff4d00", borderRadius: 20, padding: 36, maxWidth: 360, margin: "32px auto 0", textAlign: "center" },
    pricingAmount: { fontSize: 52, fontWeight: 900, color: "#ff4d00", letterSpacing: -2 },
    pricingPer: { fontSize: 16, color: "#888", marginBottom: 24 },
    pricingFeature: { fontSize: 14, color: "#444", marginBottom: 10, textAlign: "left" },
  };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <a href="/" style={s.logo}>EchoTakeout</a>
        <a href="/" style={{ color: "#555", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to home</a>
      </header>

      <h1 style={s.title}>SaaS Pricing</h1>
      <p style={s.sub}>Simple, flat-rate monthly licensing with zero commission fees.</p>

      <div style={s.card}>
        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>SaaS Starter Plan</p>
        <p style={s.pricingAmount}>₹999</p>
        <p style={s.pricingPer}>per month</p>
        {[
          "Multi-tenant menu builder", 
          "KOT kitchen terminal access", 
          "Active order tracking", 
          "Stock status controller", 
          "Operational reports & CSV exports", 
          "Unlimited table QR generation", 
          "Direct payment gateway integration support"
        ].map(f => (
          <p key={f} style={s.pricingFeature}>✅ {f}</p>
        ))}
        <a href="/signup" style={{ display: "block", background: "#ff4d00", color: "white", padding: 14, borderRadius: 10, fontWeight: 700, textDecoration: "none", marginTop: 24 }}>
          Subscribe now →
        </a>
      </div>
    </div>
  );
}