"use client";
import { useState } from "react";

export default function Home() {
  const [cart, setCart] = useState([]);
  const [screen, setScreen] = useState("menu"); // "menu" | "cart" | "success"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const items = [
    { name: "Chicken Burger", price: 199, category: "Burgers", emoji: "🍔" },
    { name: "Veg Burger", price: 149, category: "Burgers", emoji: "🥬" },
    { name: "Masala Fries", price: 99, category: "Sides", emoji: "🍟" },
    { name: "Paneer Wrap", price: 179, category: "Wraps", emoji: "🌯" },
    { name: "Mango Shake", price: 129, category: "Drinks", emoji: "🥭" },
    { name: "Cold Coffee", price: 119, category: "Drinks", emoji: "☕" },
  ];

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) return prev.map((i) => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (name) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing.qty === 1) return prev.filter((i) => i.name !== name);
      return prev.map((i) => i.name === name ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const placeOrder = () => {
    if (!name || !phone) return alert("Please enter your name and phone number");
    setScreen("success");
  };

  const s = {
    wrap: { maxWidth: 480, margin: "0 auto", padding: "20px 16px", fontFamily: "sans-serif" },
    heading: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
    sub: { color: "#888", marginBottom: 24 },
    card: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, border: "1px solid #eee", borderRadius: 12, marginBottom: 12 },
    left: { display: "flex", gap: 12, alignItems: "center" },
    itemName: { fontWeight: 600, margin: 0 },
    itemCat: { color: "#888", fontSize: 13, margin: 0 },
    price: { fontWeight: 700, margin: 0, textAlign: "right" },
    addBtn: { marginTop: 6, background: "#ff4d00", color: "white", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 },
    qtyRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
    qtyBtn: { width: 26, height: 26, borderRadius: "50%", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" },
    cartBar: { position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#ff4d00", color: "white", padding: "14px 32px", borderRadius: 50, cursor: "pointer", fontWeight: 600, fontSize: 15, border: "none", boxShadow: "0 4px 20px rgba(255,77,0,0.4)", whiteSpace: "nowrap" },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    orderBtn: { width: "100%", padding: 14, background: "#ff4d00", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" },
    backBtn: { background: "none", border: "none", color: "#ff4d00", fontSize: 15, cursor: "pointer", marginBottom: 16, padding: 0 },
  };

  if (screen === "success") return (
    <main style={s.wrap}>
      <div style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>Order placed!</h2>
        <p style={{ color: "#888" }}>Thanks {name}, we'll have it ready soon.</p>
        <p style={{ fontWeight: 600, fontSize: 18 }}>Total: ₹{total}</p>
        <button style={{ ...s.orderBtn, marginTop: 24 }} onClick={() => { setCart([]); setScreen("menu"); setName(""); setPhone(""); }}>
          Order again
        </button>
      </div>
    </main>
  );

  if (screen === "cart") return (
    <main style={s.wrap}>
      <button style={s.backBtn} onClick={() => setScreen("menu")}>← Back to menu</button>
      <h2 style={s.heading}>Your order</h2>

      {cart.map((item) => (
        <div key={item.name} style={s.card}>
          <div style={s.left}>
            <span style={{ fontSize: 32 }}>{item.emoji}</span>
            <div>
              <p style={s.itemName}>{item.name}</p>
              <p style={s.itemCat}>₹{item.price} each</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={s.price}>₹{item.price * item.qty}</p>
            <div style={s.qtyRow}>
              <button style={s.qtyBtn} onClick={() => removeFromCart(item.name)}>−</button>
              <span style={{ fontWeight: 600 }}>{item.qty}</span>
              <button style={s.qtyBtn} onClick={() => addToCart(item)}>+</button>
            </div>
          </div>
        </div>
      ))}

      <div style={{ borderTop: "2px dashed #eee", paddingTop: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <input style={s.input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <input style={s.input} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button style={s.orderBtn} onClick={placeOrder}>Place order →</button>
    </main>
  );

  return (
    <main style={{ ...s.wrap, paddingBottom: 80 }}>
      <h1 style={s.heading}>🍽️ Vishal's Kitchen</h1>
      <p style={s.sub}>Fresh food, fast delivery</p>

      {items.map((item) => {
        const inCart = cart.find((i) => i.name === item.name);
        return (
          <div key={item.name} style={s.card}>
            <div style={s.left}>
              <span style={{ fontSize: 36 }}>{item.emoji}</span>
              <div>
                <p style={s.itemName}>{item.name}</p>
                <p style={s.itemCat}>{item.category}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={s.price}>₹{item.price}</p>
              {inCart ? (
                <div style={s.qtyRow}>
                  <button style={s.qtyBtn} onClick={() => removeFromCart(item.name)}>−</button>
                  <span style={{ fontWeight: 600 }}>{inCart.qty}</span>
                  <button style={s.qtyBtn} onClick={() => addToCart(item)}>+</button>
                </div>
              ) : (
                <button style={s.addBtn} onClick={() => addToCart(item)}>Add</button>
              )}
            </div>
          </div>
        );
      })}

      {cartCount > 0 && (
        <button style={s.cartBar} onClick={() => setScreen("cart")}>
          View order · {cartCount} item{cartCount > 1 ? "s" : ""} · ₹{total}
        </button>
      )}
    </main>
  );
}