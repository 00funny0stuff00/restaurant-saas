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
      <p style={s.sub}>Last updated: June 13, 2026</p>

      <p>This policy outlines the guidelines regarding cancellations and refunds. Because EchoTakeout provides services to two distinct user groups, this policy is separated into two clear categories.</p>

      <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ff4d00" }}>Category 1: EchoTakeout SaaS Subscriptions (For Restaurants)</h2>
      <p>This section applies to restaurant merchants who purchase software access plans from EchoTakeout.</p>
      
      <h3 style={s.h2}>1.1 SaaS Trial & Billing</h3>
      <p>We provide standard trial options to help merchants evaluate our software before committing to paid subscription plans. Once a subscription invoice is generated and processed, the transaction is considered final.</p>

      <h3 style={s.h2}>1.2 Subscription Cancellation</h3>
      <p>Subscribers can cancel their SaaS recurring plans at any time directly through their administrator panel. Upon cancellation, the software terminal will remain active until the end of the current billing cycle. No further recurring charges will be generated.</p>

      <h3 style={s.h2}>1.3 SaaS Refund Thresholds</h3>
      <p>We do not offer partial or prorated refunds for software subscriptions that have been actively used. If a payment is double-debited due to an operational glitch, our support desk will verify the log files and refund the duplicate charge back to the original source within <strong>5 to 7 business days</strong>.</p>

      <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ff4d00" }}>Category 2: Restaurant Customer Food Orders (For Consumers)</h2>
      <p>This section applies to dining customers who place food orders through dynamic restaurant menus powered by EchoTakeout.</p>

      <h3 style={s.h2}>2.1 EchoTakeout Non-Party Disclaimer</h3>
      <p>EchoTakeout is strictly a software provider. We do not sell food, handle food preparation, manage deliveries, or hold diner payments. When online payment is selected, customer funds settle directly into the merchant's connected payment account (Razorpay).</p>

      <h3 style={s.h2}>2.2 Food Cancellations and Disputes</h3>
      <p>All cancellations, refund requests, and order modification requests must be directed entirely to the restaurant management where you placed the order. The restaurant's internal cancellation rules apply:</p>
      <ul>
        <li>Diners cannot modify or cancel orders once the restaurant kitchen has accepted and started preparing the food.</li>
        <li>For issues such as receiving the wrong order, food quality discrepancies, or delayed preparation, you must speak directly with the restaurant's operational staff. EchoTakeout has no authority to issue refunds for food transactions.</li>
      </ul>

      <h3 style={s.h2}>2.3 Processing Refunds</h3>
      <p>If a restaurant management approves a refund for a transaction paid online, they will process it directly through their own Razorpay dashboard. Once initiated, the payment gateway will credit your original payment source within <strong>5 to 7 business days</strong>.</p>
    </div>
  );
}