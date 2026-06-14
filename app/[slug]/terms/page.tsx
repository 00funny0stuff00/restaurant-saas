// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = "force-dynamic";

export default async function TenantTerms({ params }) {
  const { slug } = params;
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

      <h1 style={s.title}>Terms & Conditions</h1>
      <p style={s.sub}>Last updated: June 14, 2026</p>

      <p>By scanning our QR codes and placing an order through this digital menu checkout, you agree to comply with and be bound by the following Terms and Conditions.</p>

      <h2 style={s.h2}>1. Order Placement and Accuracy</h2>
      <ul>
        <li>You are responsible for entering your correct table number (for dine-in orders) and contact details.</li>
        <li>Orders placed cannot be modified once they are sent to the kitchen for preparation.</li>
      </ul>

      <h2 style={s.h2}>2. Pricing and Payments</h2>
      <ul>
        <li>All prices listed on the digital menu are inclusive of applicable taxes unless specified otherwise.</li>
        <li>Payments can be made online via UPI, Cards, or Cash at the counter depending on configuration.</li>
      </ul>

      <h2 style={s.h2}>3. Contact Us</h2>
      <p>
        <strong>Email:</strong> {email}<br />
        <strong>Phone:</strong> {phone}<br />
        <strong>Address:</strong> {address}
      </p>
    </div>
  );
}