// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function RestaurantPage() {
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const [cart, setCart] = useState([]);
  const [screen, setScreen] = useState("menu");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState([]);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!tenantData) {
        setLoading(false);
        return;
      }
      setTenant(tenantData);

      const { data: menuData } = await supabase
        .from("menu_items")
        .select("*")
        .eq("tenant_slug", slug)
        .eq("in_stock", true);

      if (menuData) setItems(menuData);
      setLoading(false);
    }
    loadData();
  }, [slug]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) return prev.map((i) => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (name: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing.qty === 1) return prev.filter((i) => i.name !== name);
      return prev.map((i) => i.name === name ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const placeOrder = async () => {
    if (!name || !phone) return alert("Please enter your name and phone number");
    const itemsSummary = cart.map(i => `${i.name} x${i.qty}`).join(", ");
    const { error } = await supabase
      .from("orders")
      .insert([{
        customer_name: name,
        phone: phone,
        items: itemsSummary,
        total: total,
        status: "new",
        tenant_slug: slug
      }]);
    if (error) { alert("Something went wrong."); return; }
    setScreen("success");
  };

  const color = tenant?.primary_color || "#ff4d00";

  const s = {
    wrap: { maxWidth: 480, margin: "0 auto", padding: "20px 16px", fontFamily: "sans-serif" },
    heading: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
    sub: { color: "#888", marginBottom: 24 },
    card: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, border: "1px solid #eee", borderRadius: 12, marginBottom: 12 },
    left: { display: "flex", gap: 12, alignItems: "center" },
    itemName: { fontWeight: 600, margin: 0 },
    itemCat: { color: "#888", fontSize: 13, margin: 0 },
    price: { fontWeight: 700, margin: 0, textAlign: "right" },
    addBtn: { marginTop: 6, background: color, color: "white", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 },
    qtyRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
    qtyBtn: { width: 26, height: 26, borderRadius: "50%", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 16 },
    cartBar: { position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: color, color: "white", padding: "14px 32px", borderRadius: 50, cursor: "pointer", fontWeight: 600, fontSize: 15, border: "none", boxShadow: `0 4px 20px ${color}66`, whiteSpace: "nowrap" },
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, marginBottom: 12, boxSizing: "border-box" },
    orderBtn: { width: "100%", padding: 14, background: color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" },
    backBtn: { background: "none", border: "none", color: color, fontSize: 15, cursor: "pointer", marginBottom: 16, padding: 0 },
    photo: { width: 56, height: 56, borderRadius: 8, objectFit: "cover" },
  };

  if (loading) return <main style={s.wrap}><p style={{ color: "#888", textAlign: "center", marginTop: 60 }}>Loading...</p></main>;
  if (!tenant) return <main style={s.wrap}><p style={{ textAlign: "center", marginTop: 60 }}>Restaurant not found.</p></main>;

  if (screen === "success") return (
    <main style={s.wrap}>
      <div style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>Order placed!</h2>
        <p style={{ color: "#888" }}>Thanks {name}, we'll have it ready soon.</p>
        <p style={{ fontWeight: 600, fontSize: 18 }}>Total: ₹{total}</p>
        <button style={{ ...s.orderBtn, marginTop: 24 }} onClick={() => { setCart([]); setScreen("menu"); setName(""); setPhone(""); }}>Order again</button>
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
            {item.photo_url && <img src={item.photo_url} style={s.photo} alt={item.name} />}
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
          <span>Total</span><span>₹{total}</span>
        </div>
      </div>
      <input style={s.input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <input style={s.input} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button style={s.orderBtn} onClick={placeOrder}>Place order →</button>
    </main>
  );

  return (
    <main style={{ ...s.wrap, paddingBottom: 80 }}>
      <h1 style={s.heading}>{tenant.name}</h1>
      <p style={s.sub}>{tenant.tagline}</p>
      {items.map((item) => {
        const inCart = cart.find((i) => i.name === item.name);
        return (
          <div key={item.name} style={s.card}>
            <div style={s.left}>
              {item.photo_url && <img src={item.photo_url} style={s.photo} alt={item.name} />}
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