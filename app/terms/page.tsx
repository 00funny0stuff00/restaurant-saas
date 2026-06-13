// @ts-nocheck
"use client";

export default function TermsOfService() {
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

      <h1 style={s.title}>Terms of Service</h1>
      <p style={s.sub}>Last updated: June 13, 2026</p>

      <p>Welcome to EchoTakeout. By accessing or using our software platform, you agree to comply with and be bound by these Terms of Service. These Terms are a binding agreement between you and <strong>A SUGUNA ATHIVEERAPERUMAL</strong> ("we", "us", "our"), the sole operator of EchoTakeout.</p>

      <h2 style={s.h2}>1. The Software Platform Services</h2>
      <p>EchoTakeout is a cloud-hosted software-as-a-service (SaaS) provider. We build and provide software infrastructure that helps independent restaurants convert their operational workflows (such as menu presentation, table selections, and kitchen alerts) into digital workflows. We are strictly a software infrastructure provider.</p>

      <h2 style={s.h2}>2. Separation of Merchant and Platform Relationships</h2>
      <p>Restaurants using EchoTakeout are completely independent commercial entities. EchoTakeout is not a party to any transactions between a dining customer and a restaurant:</p>
      <ul>
        <li><strong>Food Preparation & Fulfillment:</strong> The respective restaurant is solely responsible for preparing, packing, pricing, delivering, and handling orders.</li>
        <li><strong>Customer Service:</strong> Any complaints, cancellations, allergen queries, or quality disputes concerning food orders must be addressed directly with the restaurant management.</li>
      </ul>

      <h2 style={s.h2}>3. Merchant Responsibilities</h2>
      <p>Restaurant operators utilizing our software agree to:</p>
      <ul>
        <li>Provide accurate and lawful descriptions, pricing, and allergen parameters in their digital menus.</li>
        <li>Protect their administrator credentials and local kitchen pins from unauthorized access.</li>
        <li>Maintain valid compliance and bank credentials when integrating third-party payment gateways like Razorpay.</li>
      </ul>

      <h2 style={s.h2}>4. Service Limitations & Acceptable Usage</h2>
      <p>While we target continuous system uptime, we do not guarantee uninterrupted operational availability of our hosted dynamic menus. Subscribers are prohibited from using our services to list illegal, prohibited, or restricted items under Indian law.</p>

      <h2 style={s.h2}>5. Governing Law</h2>
      <p>These terms shall be governed by, interpreted, and construed in accordance with the laws of India, with legal disputes subject to the exclusive jurisdiction of courts in Coimbatore, Tamil Nadu.</p>
    </div>
  );
}