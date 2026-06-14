// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = "force-dynamic";

export default async function TenantRefund({ params }) {
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

      <h1 style={s.title}>Cancellation & Refund Policy</h1>
      <p style={s.sub}>Last updated: June 14, 2026</p>

      <h2 style={s.h2}>1. Cancellation Policy</h2>
      <ul>
        <li>Because food items are freshly prepared to order, orders cannot be cancelled once the kitchen has accepted and started preparing your food.</li>
        <li>You can request a cancellation only if the kitchen has not accepted or started preparing your order.</li>
      </ul>

      <h2 style={s.h2}>2. Refund Policy</h2>
      <ul>
        <li><strong>Failed Transactions:</strong> If your money is debited but the order is not placed due to a technical failure, the payment gateway (Razorpay) will initiate an automatic refund.</li>
        <li><strong>Incorrect / Damaged Orders:</strong> If you receive the wrong item or have issues with your order, please notify our counter staff immediately for a replacement or manual refund.</li>
        <li><strong>Refund Timeline:</strong> Approved refunds for online payments will be credited back to your original payment source (UPI, Card, or Netbanking) within <strong>5 to 7 business days</strong> as per standard banking procedures.</li>
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