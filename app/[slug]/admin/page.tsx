// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function AdminPage() {
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [tenant, setTenant] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("menu");

  // Tenant edit fields
  const [tName, setTName] = useState("");
  const [tTagline, setTTagline] = useState("");
  const [tColor, setTColor] = useState("");

  // New item fields
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPhoto, setNewPhoto] = useState("");

  useEffect(() => {
    if (!authed) return;
    loadData();
    const interval = setInterval(loadMenu, 8000);
    return () => clearInterval(interval);
  }, [authed]);

  async function loadData() {
    setLoading(true);
    const { data: t } = await supabase.from("tenants").select("*").eq("slug", slug).single();
    const { data: m } = await supabase.from("menu_items").select("*").eq("tenant_slug", slug).order("category");
    setTenant(t);
    setItems(m ?? []);
    setTName(t?.name ?? "");
    setTTagline(t?.tagline ?? "");
    setTColor(t?.primary_color ?? "#ff4d00");
    setLoading(false);
  }
  
  async function loadMenu() {
    const { data: m } = await supabase.from("menu_items").select("*").eq("tenant_slug", slug).order("category");
    setItems(m ?? []);
  }

  async function saveTenant() {
    await supabase.from("tenants").update({ name: tName, tagline: tTagline, primary_color: tColor }).eq("slug", slug);
    alert("Saved!");
    loadData();
  }

  async function addItem() {
    if (!newName || !newPrice || !newCategory) return alert("Name, price and category are required.");
    await supabase.from("menu_items").insert([{ name: newName, price: parseFloat(newPrice), category: newCategory, photo_url: newPhoto, in_stock: true, tenant_slug: slug }]);
    setNewName(""); setNewPrice(""); setNewCategory(""); setNewPhoto("");
    loadData();
  }

  async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    loadData();
  }

  async function toggleStock(id, current) {
    await supabase.from("menu_items").update({ in_stock: !current }).eq("id", id);
    loadData();
  }

  const primary = tenant?.primary_color ?? "#ff4d00";

  const s = {
    page: { fontFamily: "sans-serif", maxWidth: 520, margin: "0 auto", padding: 20, background: "white", minHeight: "100vh", color: "#111" },
    input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 10, boxSizing: "border-box" },
    btn: (color) => ({ padding: "10px 20px", background: color, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }),
    tab: (active) => ({ padding: "10px 20px", border: "none", borderBottom: active ? `3px solid ${primary}` : "3px solid transparent", background: "none", cursor: "pointer", fontWeight: active ? 700 : 400, color: active ? primary : "#555", fontSize: 14 }),
    card: { border: "1px solid #eee", borderRadius: 10, padding: 12, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  };

  if (!authed) return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Admin Login</h2>
      <input style={{ ...s.input, maxWidth: 200, textAlign: "center", letterSpacing: 6, fontSize: 20 }} type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && pin === "1234") setAuthed(true); }} />
      <button style={s.btn("#111")} onClick={() => { if (pin === "1234") setAuthed(true); else alert("Wrong PIN"); }}>Enter</button>
    </div>
  );

  if (loading) return <div style={{ ...s.page, paddingTop: 60, textAlign: "center", color: "#888" }}>Loading...</div>;

  return (
    <div style={s.page}>
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Admin — {tenant?.name}</h2>
      <a href={`/${slug}`} style={{ fontSize: 13, color: "#888" }}>← View live menu</a>

      <div style={{ display: "flex", borderBottom: "1px solid #eee", margin: "20px 0 24px" }}>
        <button style={s.tab(tab === "menu")} onClick={() => setTab("menu")}>Menu Items</button>
        <button style={s.tab(tab === "restaurant")} onClick={() => setTab("restaurant")}>Restaurant Info</button>
      </div>

      {tab === "restaurant" && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Restaurant Name</label>
          <input style={s.input} value={tName} onChange={e => setTName(e.target.value)} />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Tagline</label>
          <input style={s.input} value={tTagline} onChange={e => setTTagline(e.target.value)} />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Brand Colour</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <input type="color" value={tColor} onChange={e => setTColor(e.target.value)} style={{ width: 48, height: 40, border: "none", cursor: "pointer", borderRadius: 6 }} />
            <span style={{ fontSize: 14, color: "#555" }}>{tColor}</span>
          </div>
          <button style={s.btn(primary)} onClick={saveTenant}>Save changes</button>
        </div>
      )}

      {tab === "menu" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Add new item</h3>
          <input style={s.input} placeholder="Item name" value={newName} onChange={e => setNewName(e.target.value)} />
          <input style={s.input} placeholder="Price (e.g. 120)" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
          <input style={s.input} placeholder="Category (e.g. Starters)" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <input style={s.input} placeholder="Photo URL (optional)" value={newPhoto} onChange={e => setNewPhoto(e.target.value)} />
          <button style={{ ...s.btn(primary), marginBottom: 28 }} onClick={addItem}>Add item</button>

          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Current menu</h3>
          {items.map(item => (
            <div key={item.id} style={s.card}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>{item.category} · ₹{item.price}</p>
              </div>
              <button style={s.btn(item.in_stock ? "#16a34a" : "#888")} onClick={() => toggleStock(item.id, item.in_stock)}>
                {item.in_stock ? "In stock" : "Out of stock"}
              </button>
              <button style={s.btn("#ef4444")} onClick={() => deleteItem(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}