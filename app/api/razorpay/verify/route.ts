import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      tenantSlug,
    } = await req.json();

    // Verify cryptographic signature to prevent tampering
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    const isVerified = expectedSignature === razorpay_signature;

    if (!isVerified) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update order status to 'new' in Supabase securely on backend
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status: "new" })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    // Trigger kitchen notification securely from backend
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