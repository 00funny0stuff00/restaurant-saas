// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// SECURE CO-BUILDER FIX: Use Service Role Key on backend to bypass RLS locks on state writes
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      tenantSlug,
    } = await req.json();

    if (!tenantSlug || !orderId) {
      return NextResponse.json({ error: "Missing tracking keys" }, { status: 400 });
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("razorpay_key_id, razorpay_key_secret")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Failed to resolve merchant configuration" }, { status: 500 });
    }

    const keyId = tenant.razorpay_key_id;
    const keySecret = tenant.razorpay_key_secret;

    // Sandbox check matching the Order API rule
    const isCredentialsConfigured = 
      keyId && 
      keySecret && 
      (keyId.startsWith("rzp_test_") || keyId.startsWith("rzp_live_"));

    if (!isCredentialsConfigured) {
      console.warn("Dynamic Key Secret is missing or invalid. Processing Sandbox transaction.");
      if (razorpay_order_id?.startsWith("mock_order_")) {
        const { data: updatedOrder, error: updateError } = await supabase
          .from("orders")
          .update({ status: "new" })
          .eq("id", orderId)
          .select()
          .single();

        if (updateError) {
          console.error("Sandbox update error under RLS:", updateError.message);
          return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
        }
        return NextResponse.json({ success: true, order: updatedOrder });
      }
      return NextResponse.json({ error: "Credentials not configured on server" }, { status: 500 });
    }

    // Cryptographical signature check using merchant's private secret
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    const isVerified = expectedSignature === razorpay_signature;

    if (!isVerified) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update order status to 'new' in Supabase - Bypasses RLS safely on backend
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status: "new" })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Production update error under RLS:", updateError.message);
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    // Trigger kitchen notification securely
    try {
      await fetch("https://iklseexyzfqkgfuyvfjg.supabase.co/functions/v1/notify-kitchen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbHNlZXh5emZxa2dmdXl2ZmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjU3NzEsImV4cCI6MjA2MDY0MTc3MX0.DP3T5lxoGGOdTYbKMUHQBqpBrBvjpFEEGBTHzRrqAkg"
        },
        body: JSON.stringify({
          tenant_slug: tenantSlug,
          order_id: updatedOrder.id,
          customer_name: updatedOrder.customer_name,
          items: updatedOrder.items,
          total: updatedOrder.total,
          order_type: updatedOrder.order_type,
          table_number: updatedOrder.table_number || null,
        }),
      });
    } catch (e) {
      console.error("Kitchen notification failed:", e);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 });
  }
}