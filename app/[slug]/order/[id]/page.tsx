// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../supabase";

export default function OrderTracking() {
  const parts = typeof window !== "undefined" ? window.location.pathname.split("/") : [];
  const slug = parts[1];
  const orderId = parts[3];

  const [order, setOrder] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [wrongRestaurant, setWrongRestaurant] = useState(false);
  
  // 2-Factor Verification states
  const [phoneInput, setPhoneInput] = useState("");
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  async function loadOrder() {
    const { data } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (data) {
      if (data.tenant_slug !== slug) {
        setWrongRestaurant(true);
        return;
      }
      setOrder(data);

      // Check if already verified via localStorage session
      const savedPhone = localStorage.getItem("track_phone_" + orderId);
      if (savedPhone === data.phone) {
        setVerified(true);
      }
    }
  }

  useEffect(() => {
    async function init() {
      const { data: tenantData } = await supabase.from("tenants").select("*").eq("slug", slug).single();
      if (tenantData) setTenant(tenantData);
      await loadOrder();
      setLoading(false);
    }
    init();
    const interval = setInterval(() => {
      if (verified) loadOrder(); // Only auto-refresh if they have successfully verified
    }, 6000);
    return () => clearInterval(interval);
  }, [verified]);

  function handleVerify(e) {
    e.preventDefault();
    setVerificationError("");
    if (!order) return;

    const cleanedInput = phoneInput.trim();
    // Verify entered digits match database or end-matched numbers
    if (cleanedInput === order.phone || (order.phone.endsWith(cleanedInput) && cleanedInput.length >= 10)) {
      localStorage.setItem("track_phone_" + orderId, order.phone);
      setVerified(true);
    } else {
      setVerificationError("Incorrect phone number. Please try again.");
    }
  }

  async function cancelOrder() {
    if (!confirm("Are you sure you want to cancel your order?")) return;
    setCancelling(true);
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    await loadOrder();
    setCancelling(false);
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p style={{ color: "#888" }}>Loading...</p>
    </div>
  );

  if (wrongRestaurant) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif", flexDirection: "column", textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
      <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Order not found</p>
      <p style={{ color: "#888", fontSize: 14 }}>This order doesn't belong to this restaurant.</p>
      <a href={`/${slug}`} style={{ marginTop: 20, color: "#ff4d00", fontWeight: 600, fontSize: 14 }}>← Back to menu</a>
    </div>
  );

  if (!order) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p>Order not found.</p>
    </div>
  );

  const primary = tenant?.primary_color || "#ff4d00";
  const isDineIn = order.order_type === "dine-in";
  const isCancelled = order.status === "cancelled";
  const isDone = order.status === "done";
  const isNew = order.status === "new";
  const canCancel = tenant?.edit_order_enabled && isNew;

  const steps = [
    { key: "new", label: "Order received", icon: "📋" },
    { key: "preparing", label: "Being prepared", icon: "👨‍🍳" },
    { key: "ready", label: isDineIn ? "Delivered to table" : "Ready for pickup!", icon: isDineIn ? "🪑" : "✅" },
  ];

  const currentStep = isCancelled || isDone ? -1 : steps.findIndex(s => s.key === order.status);

  const s = {
    wrap: { maxWidth: 420, margin: "0 auto", padding: "32px 16px", fontFamily: "sans-serif", minHeight: "100vh", background: "white", color: "#111" },
    tokenBox: { background: isCancelled ? "#ef4444" : primary, color: "white", borderRadius: 16, padding: "20px 32px", display: "inline-block", marginBottom: 8 },
    tokenLabel: { fontSize: 12, margin: "0 0 4px", opacity: 0.85 },
    tokenNum: { fontSize: 48, fontWeight: 900, margin: 0, letterSpacing: -2 },
    stepRow: { display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 },
    stepIcon: (active, done) => ({
      width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
      background: done ? primary : active ? primary : "#f3f4f6",
      opacity: done ? 1 : active ? 1 : 0.4,
    }),
    stepLabel: (active, done) => ({
      fontWeight: active || done ? 700 : 400, fontSize: 15, margin: "10px 0 4px",
      color: active || done ? "#111" : "#aaa",
    }),
    orderCard: { background: "#f9f9f9", borderRadius: 12, padding: 16, marginTop: 24 },
    cancelBtn: { width: "100%", padding: 12, background: "white", color: "#ef4444", border: "2px solid #ef4444", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 12 },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    btn: { width: "100%", padding: 14, background: primary, color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }
  };

  // ─── Verification Gate screen (Secure Barrier) ──────────────────────────
  if (!verified) {
    return (
      <div style={s.wrap}>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Secure Order Tracking</h2>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
            To view tracking details for Token <strong>#{order.token_number || order.id}</strong>, please verify the phone number used during checkout:
          </p>
          
          <form onSubmit={handleVerify}>
            <input 
              type="tel"
              style={s.input}
              placeholder="Enter 10-digit Phone Number"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              required
            />
            {verificationError ? <p style={{ color: "#ef4444", fontSize: 13, marginTop: -8, marginBottom: 12 }}>{verificationError}</p> : null}
            <button type="submit" style={s.btn}>Verify & Track Order →</button>
          </form>

          <a href={`/${slug}`} style={{ display: "block", marginTop: 20, color: "#888", textDecoration: "none", fontSize: 13 }}>← Back to menu</a>
        </div>
      </div>
    );
  }

  // ─── Standard Tracking screen (Unlocked) ──────────────────────────────────
  const trackingUrl = `https://www.echotakeout.com/${slug}/order/${order.id}`;
  const kotMessage = `🧾 *${tenant?.name} — Order Confirmed!*

Token: *#${order.token_number || order.id}*
${isDineIn && order.table_number ? `Table: ${order.table_number}\n` : ""}Items: ${order.items}
Total: ₹${order.total}

Track your order 👉 ${trackingUrl}`;

  function openWhatsApp() {
    window.open(`https://wa.me/?text={encodeURIComponent(kotMessage)}`, "_blank");
  }

  function openSMS() {
    window.open(`sms:?&body=${encodeURIComponent(kotMessage)}`, "_blank");
  }

  return (
    <div style={s.wrap}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 8px" }}>{tenant?.name}</p>
        <div style={s.tokenBox}>
          <p style={s.tokenLabel}>{isCancelled ? "Cancelled order" : "Your token"}</p>
          <p style={s.tokenNum}>#{order.token_number || order.id}</p>
        </div>
        {isCancelled && <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 16, marginTop: 8 }}>❌ Your order was cancelled. Please speak to staff.</p>}
        {isDone && <p style={{ color: "#16a34a", fontWeight: 700, fontSize: 16, marginTop: 8 }}>✅ {isDineIn ? "Enjoy your meal!" : "Order complete. Thank you!"}</p>}
        {order.status === "ready" && <p style={{ color: primary, fontWeight: 700, fontSize: 16, marginTop: 8 }}>🎉 {isDineIn ? "Your order is ready — enjoy your meal!" : "Your order is ready! Please collect it."}</p>}
      </div>

      {!isCancelled && !isDone && (
        <div>
          {steps.map((step, index) => {
            const done = index < currentStep;
            const active = index === currentStep;
            return (
              <div key={step.key} style={s.stepRow}>
                <div style={s.stepIcon(active, done)}>{done ? "✓" : step.icon}</div>
                <div>
                  <p style={s.stepLabel(active, done)}>{step.label}</p>
                  {active && <p style={{ fontSize: 12, color: "#888", margin: 0 }}>In progress...</p>}
                  {done && <p style={{ fontSize: 12, color: primary, margin: 0 }}>Done</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={s.orderCard}>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 8px", fontWeight: 600 }}>ORDER SUMMARY</p>
        {isDineIn && order.table_number && (
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 6px" }}>🪑 Dine-in · Table {order.table_number}</p>
        )}
        <p style={{ fontSize: 14, color: "#333", margin: "0 0 8px" }}>{order.items}</p>
        {order.notes && (
          <div style={{ background: "#fff3cd", border: "1px solid #f59e0b", borderRadius: 8, padding: "8px 12px", margin: "8px 0" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", margin: "0 0 2px" }}>📝 Special instructions</p>
            <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>{order.notes}</p>
          </div>
        )}
        <p style={{ fontSize: 15, fontWeight: 700, color: primary, margin: 0 }}>Total: ₹{order.total}</p>
      </div>

      {/* Share buttons */}
      {!isCancelled && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", margin: "0 0 10px" }}>Share your KOT</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={openWhatsApp}
              style={{ flex: 1, padding: "12px 0", background: "#25D366", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.541 5.875L0 24l6.294-1.518A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.006-1.371l-.36-.214-3.733.9.934-3.638-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
              WhatsApp
            </button>
            <button
              onClick={openSMS}
              style={{ flex: 1, padding: "12px 0", background: "#111", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              SMS
            </button>
          </div>
        </div>
      )}

      {canCancel && (
        <>
          <button style={s.cancelBtn} onClick={cancelOrder} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "✕ Cancel my order"}
          </button>
          <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 8 }}>You can only cancel while your order hasn't started preparing.</p>
        </>
      )}

      <a href={`/${slug}`} style={{ display: "block", textAlign: "center", marginTop: 16, padding: "12px 20px", background: "#f3f4f6", borderRadius: 10, color: "#111", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
        ← Back to menu
      </a>

      {!isCancelled && !isDone && (
        <p style={{ textAlign: "center", fontSize: 12, color: "#bbb", marginTop: 24 }}>Page refreshes automatically every 6 seconds</p>
      )}
    </div>
  );
}