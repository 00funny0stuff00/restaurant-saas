// @ts-nocheck
"use client";

export default function RefundPolicy() {
  const s = {
    wrap: { maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif", color: "#333", lineHeight: 1.6 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 24 },
    logo: { fontSize: 20, fontWeight: 900, color: "#ff4d00", textDecoration: "none" },
    title: { fontSize: 28, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 },
    sub: { fontSize: 13, color: "#888", margin: 0 },
    h2: { fontSize: 18, fontWeight: 700, margin: "24px 0 8px" }
  };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <a href="/" style={s.logo}>EchoTakeout</a>
        <a href="/" style={{ color: "#555", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to home</a>
      </header>

      <h1 style={s.title}>Cancellation & Refund Policy</h1>
      <p style={s.sub}>Last updated: June 14, 2026</p>

      <p>This policy outlines the guidelines regarding cancellations and refunds. Because EchoTakeout provides services to two distinct user groups, this policy is separated into two clear categories.</p>

      <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ff4d00" }}>Category 1: EchoTakeout SaaS Subscriptions (For Restaurants)</h2>
      <p>This section applies to restaurant merchants who purchase software access plans from EchoTakeout.</p>

      <h3 style={s.h2}>1.1 SaaS Refund Thresholds</h3>
      <p>We do not offer partial or prorated refunds for software subscriptions that have been actively used. If a payment is double-debited due to an operational glitch, our support desk will verify the log files and refund the duplicate charge back to the original source within <strong>5 to 7 business days</strong>.</p>

      <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ff4d00" }}>Category 2: Restaurant Customer Food Orders (For Consumers)</h2>
      <p>This section applies to dining customers who place food orders through dynamic restaurant menus powered by EchoTakeout.</p>

      <h3 style={s.h2}>2.1 Processing Refunds</h3>
      <p>customer funds settle directly into the restaurant's payment account configured by the restaurant through its chosen payment service provider.</p>
    </div>
  );
}