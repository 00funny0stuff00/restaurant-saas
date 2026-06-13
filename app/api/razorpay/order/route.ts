import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Forces Next.js to skip static build-time evaluation
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Graceful fallback for testing/onboarding without active keys
    if (!keyId || !keySecret) {
      console.warn("Razorpay credentials missing. Generating a sandbox mock order ID.");
      return NextResponse.json({ 
        id: "mock_order_" + Math.random().toString(36).substring(7),
        isMock: true 
      });
    }

    // Instantiating Razorpay inside the handler prevents build-time failures
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { amount, orderId } = await req.json();

    if (!amount || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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