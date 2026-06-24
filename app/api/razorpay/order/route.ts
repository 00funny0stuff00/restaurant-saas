// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// SECURE CO-BUILDER FIX: Use Service Role Key on backend to bypass RLS locks
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId, tenantSlug } = await req.json();

    if (!amount || !orderId || !tenantSlug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Reads securely bypassing RLS
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

    const isCredentialsConfigured = 
      keyId && 
      keySecret && 
      (keyId.startsWith("rzp_test_") || keyId.startsWith("rzp_live_"));

    if (!isCredentialsConfigured) {
      console.warn(`Merchant ${tenantSlug} has invalid or empty payment keys. Triggering Sandbox emulation.`);
      return NextResponse.json({ 
        id: "mock_order_" + Math.random().toString(36).substring(7),
        isMock: true 
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100), // convert INR to paise
      currency: "INR",
      receipt: `receipt_order_${orderId}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ id: order.id });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" }, 
      { status: 500 }
    );
  }
}