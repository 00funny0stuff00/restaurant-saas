// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = "force-dynamic";

export default async function TenantPrivacy({ params }) {
  // Next.js 15 asynchronous unwrap constraint
  const { slug } = await params;
  
  const { data: tenant } = await supabase.from("tenants").select("*").eq("slug", slug).single();
  if (!tenant) notFound();

  const email = tenant.support_email || tenant.owner_email || "support@echotakeout.com";
  const phone = tenant.support_phone || "+91 XXXXXXXXXX";
  const address = tenant.physical_address || "Our Physical Location, India";

  const s = {
    wrap: { maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif", color: "#333", lineHeight: 1.6 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${tenant.primary_color || "#ff4d00"}`, paddingBottom: 16, marginBottom: 24 },
    logo: { fontSize: 20, fontWeight: 900, color: tenant.primary_color || "#ff4d00", textDecoration: "none" },
    title: { fontSize: 28, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 },
    sub: { fontSize: 13, color: "#888", margin: 0 },
    h2: { fontSize: 18, fontWeight: 700, margin: "24px 0 8px" }
  };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <span style={s.logo}>{tenant.name}</span>
        <a href={`/${slug}`} style={{ color: "#555", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to menu</a>
      </header>

      <h1 style={s.title}>Privacy Policy</h1>
      <p style={s.sub}>Last updated: June 14, 2026</p>

      <p>We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect and manage your information when you use our digital checkout menu.</p>

      <h2 style={s.h2}>1. Information We Collect</h2>
      <p>When you place an order, we collect only the necessary details to process your request:</p>
      <ul>
        <li><strong>Customer Name:</strong> To identify your order ticket.</li>
        <li><strong>Phone Number:</strong> To contact you regarding order updates, payment issues, or delivery.</li>
        <li><strong>Order Details & Table Number:</strong> To prepare and deliver the correct items.</li>
      </ul>

      <h2 style={s.h2}>2. How We Use Your Information</h2>
      <p>We use your information strictly to process, verify, and complete your food order. We do not sell or share your personal data with third-party advertisers.</p>

      <h2 style={s.h2}>3. Payment Security</h2>
      <p>All online payments are securely processed through our certified payment partner, Razorpay. We do not store your credit card, debit card, or UPI credentials on our servers.</p>

      <h2 style={s.h2}>4. Contact Details</h2>
      <p>If you have questions regarding this policy or our data practices, please contact us at:</p>
      <p>
        <strong>Email:</strong> {email}<br />
        <strong>Phone:</strong> {phone}<br />
        <strong>Address:</strong> {address}
      </p>
    </div>
  );
}