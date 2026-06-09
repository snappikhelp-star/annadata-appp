import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Plus, Search, Download, Share2, X, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface CartItem {
  product_id: string;
  name: string;
  unit: string;
  current_stock: number;
  quantity: number;
  selling_price: number;
  discount: number;
}

function makeInvoiceNumber() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000) + 1000}`;
}

export default function AdminBilling() {
  const [isNewRoute] = useRoute("/admin/billing/new");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"new" | "list">(isNewRoute ? "new" : "list");

  // Products list for search
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Invoice list
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [listLoading, setListLoading] = useState(false);

  // New bill form
  const [cart, setCart] = useState<CartItem[]>([]);
  const [prodSearch, setProdSearch] = useState("");
  const [showProdDropdown, setShowProdDropdown] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerVillage, setCustomerVillage] = useState("");
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [payStatus, setPayStatus] = useState<"paid" | "udhaar" | "partial">("paid");
  const [billNotes, setBillNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchInvoices();
    if (isNewRoute) setActiveTab("new");
  }, [isNewRoute]);

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("id, name, unit, selling_price, current_stock, low_stock_limit").eq("is_active", true).order("name");
    setAllProducts(data || []);
  }

  async function fetchInvoices() {
    setListLoading(true);
    const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
    if (error) console.error("Invoices fetch:", error);
    setInvoices(data || []);
    setListLoading(false);
  }

  // Cart helpers
  const prodDropdownList = allProducts.filter(p =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) &&
    !cart.find(c => c.product_id === p.id)
  );

  function addToCart(p: any) {
    setCart(c => [...c, {
      product_id: p.id, name: p.name, unit: p.unit,
      current_stock: Number(p.current_stock),
      quantity: 1, selling_price: Number(p.selling_price), discount: 0
    }]);
    setProdSearch(""); setShowProdDropdown(false);
  }

  function removeFromCart(pid: string) { setCart(c => c.filter(i => i.product_id !== pid)); }

  function updateCartItem(pid: string, field: keyof CartItem, val: number) {
    setCart(c => c.map(i => i.product_id === pid ? { ...i, [field]: Math.max(0, val) } : i));
  }

  const subtotal = cart.reduce((s, i) => s + (i.selling_price * i.quantity) - i.discount, 0);
  const finalAmount = Math.max(0, subtotal - extraDiscount);
  const actualPaid = payStatus === "paid" ? finalAmount : payStatus === "udhaar" ? 0 : paidAmount;
  const udhaarAmount = Math.max(0, finalAmount - actualPaid);

  async function saveBill() {
    if (!customerName.trim()) return setSaveError("ग्राहक का नाम लिखें!");
    if (cart.length === 0) return setSaveError("कम से कम एक प्रोडक्ट जोड़ें!");
    setSaveError("");
    setSaving(true);

    const invNum = makeInvoiceNumber();

    // 1. Create invoice
    const { data: inv, error: invErr } = await supabase.from("invoices").insert([{
      invoice_number: invNum,
      customer_name: customerName.trim(),
      customer_mobile: customerMobile.trim(),
      customer_village: customerVillage.trim(),
      total_amount: subtotal,
      discount: extraDiscount,
      final_amount: finalAmount,
      paid_amount: actualPaid,
      udhaar_amount: udhaarAmount,
      payment_status: payStatus,
      notes: billNotes || null,
      created_by: user?.email || "admin"
    }]).select().single();

    if (invErr || !inv) {
      setSaveError("बिल सेव नहीं हुआ: " + (invErr?.message || "Unknown error"));
      setSaving(false);
      return;
    }

    // 2. Insert invoice items
    await supabase.from("invoice_items").insert(
      cart.map(i => ({
        invoice_id: inv.id,
        product_id: i.product_id,
        product_name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        selling_price: i.selling_price,
        discount: i.discount,
        total: (i.selling_price * i.quantity) - i.discount
      }))
    );

    // 3. Update stock & log movements
    for (const item of cart) {
      const newStock = Math.max(0, item.current_stock - item.quantity);
      await supabase.from("products").update({
        current_stock: newStock, updated_at: new Date().toISOString()
      }).eq("id", item.product_id);

      await supabase.from("stock_movements").insert([{
        product_id: item.product_id, movement_type: "out",
        quantity: item.quantity, previous_stock: item.current_stock, new_stock: newStock,
        notes: `बिल: ${invNum}`, created_by: user?.email || "admin"
      }]);
    }

    // 4. Upsert customer
    if (customerMobile.trim()) {
      const { data: existing } = await supabase.from("customers")
        .select("id, total_purchase, total_udhaar")
        .eq("mobile", customerMobile.trim()).maybeSingle();

      if (existing) {
        await supabase.from("customers").update({
          total_purchase: Number(existing.total_purchase) + finalAmount,
          total_udhaar: Number(existing.total_udhaar) + udhaarAmount,
          updated_at: new Date().toISOString()
        }).eq("id", existing.id);
      } else {
        await supabase.from("customers").insert([{
          name: customerName.trim(), mobile: customerMobile.trim(),
          village: customerVillage.trim(),
          total_purchase: finalAmount, total_udhaar: udhaarAmount
        }]);
      }
    }

    // 5. Reset form
    setCart([]);
    setCustomerName(""); setCustomerMobile(""); setCustomerVillage("");
    setExtraDiscount(0); setPaidAmount(0); setBillNotes(""); setPayStatus("paid");
    setSaving(false);
    fetchInvoices();
    fetchProducts();
    setActiveTab("list");
    if (isNewRoute) setLocation("/admin/billing");
  }

  // PDF generation — fetches items from DB for historical bills
  async function generatePDF(inv: any) {
    // Fetch items from DB
    const { data: items } = await supabase
      .from("invoice_items").select("*").eq("invoice_id", inv.id);

    const doc = new jsPDF({ format: "a5", unit: "mm" });
    doc.setFontSize(15); doc.setFont("helvetica", "bold");
    doc.text("Annadata Agri & Seeds", 74, 14, { align: "center" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("Salamatpur, Raisen, MP | Ph: 6261737388 / 9691712455", 74, 19, { align: "center" });
    doc.setLineWidth(0.3); doc.line(10, 22, 138, 22);
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text(`Bill No: ${inv.invoice_number}`, 10, 28);
    doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString("en-IN")}`, 138, 28, { align: "right" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${inv.customer_name}`, 10, 34);
    if (inv.customer_mobile) doc.text(`Mobile: ${inv.customer_mobile}`, 10, 39);
    if (inv.customer_village) doc.text(`Village: ${inv.customer_village}`, 80, 39);

    autoTable(doc, {
      startY: 44,
      head: [["#", "Product", "Qty", "Unit", "Rate", "Disc", "Total"]],
      body: (items || []).map((item: any, i: number) => [
        i + 1,
        item.product_name,
        item.quantity,
        item.unit,
        `Rs.${item.selling_price}`,
        item.discount > 0 ? `Rs.${item.discount}` : "-",
        `Rs.${item.total}`
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 101, 52], textColor: 255 },
      columnStyles: { 1: { cellWidth: 45 } }
    });

    const y = (doc as any).lastAutoTable.finalY + 4;
    doc.setLineWidth(0.2); doc.line(10, y, 138, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(`Total:  Rs.${Number(inv.final_amount).toLocaleString("en-IN")}`, 138, y + 6, { align: "right" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Paid:   Rs.${Number(inv.paid_amount).toLocaleString("en-IN")}`, 138, y + 12, { align: "right" });
    if (Number(inv.udhaar_amount) > 0) {
      doc.setTextColor(180, 30, 30);
      doc.text(`Udhaar: Rs.${Number(inv.udhaar_amount).toLocaleString("en-IN")}`, 138, y + 18, { align: "right" });
      doc.setTextColor(0, 0, 0);
    }
    doc.setFontSize(7); doc.setFont("helvetica", "italic");
    doc.text("Thank you for shopping! Jai Kisan 🌾 — Annadata Agri & Seeds", 74, y + 26, { align: "center" });
    doc.save(`bill_${inv.invoice_number}.pdf`);
  }

  function shareWhatsApp(inv: any) {
    const lines = [
      `*अन्नदाता एग्री & सीड्स* 🌿`,
      `सलामतपुर, रायसेन | 📞 6261737388 / 9691712455`,
      ``,
      `*बिल नं: ${inv.invoice_number}*`,
      `👤 ग्राहक: ${inv.customer_name}`,
      inv.customer_village ? `🏘️ गांव: ${inv.customer_village}` : "",
      `📅 तारीख: ${new Date(inv.created_at).toLocaleDateString("hi-IN")}`,
      ``,
      `💰 *कुल राशि: ₹${Number(inv.final_amount).toLocaleString("en-IN")}*`,
      `✅ पेड: ₹${Number(inv.paid_amount).toLocaleString("en-IN")}`,
      Number(inv.udhaar_amount) > 0 ? `📒 उधार बकाया: ₹${Number(inv.udhaar_amount).toLocaleString("en-IN")}` : "",
      ``,
      `_धन्यवाद! जय किसान 🌾_`
    ].filter(l => l !== "").join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  }

  function exportSales() {
    const ws = XLSX.utils.json_to_sheet(invoices.map(i => ({
      बिल_नं: i.invoice_number, ग्राहक: i.customer_name,
      मोबाइल: i.customer_mobile, गांव: i.customer_village,
      कुल: i.final_amount, पेड: i.paid_amount, उधार: i.udhaar_amount,
      स्थिति: i.payment_status,
      तारीख: new Date(i.created_at).toLocaleDateString("hi-IN")
    })));
    XLSX.utils.book_append_sheet(XLSX.utils.book_new(), ws, "Sales");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "annadata_sales.xlsx");
  }

  const filteredInvoices = invoices.filter(inv =>
    !invoiceSearch ||
    inv.customer_name.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    inv.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    (inv.customer_village || "").toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    (inv.customer_mobile || "").includes(invoiceSearch)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 font-hindi">बिलिंग</h2>
        {activeTab === "list" && (
          <button onClick={exportSales} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-hindi hover:bg-gray-200">
            <Download className="w-4 h-4" /> एक्सपोर्ट
          </button>
        )}
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("new")}
          className={`px-4 py-2 rounded-lg text-sm font-hindi transition-all ${activeTab === "new" ? "bg-white text-green-700 font-bold shadow-sm" : "text-gray-600"}`}>
          + नया बिल
        </button>
        <button onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-lg text-sm font-hindi transition-all ${activeTab === "list" ? "bg-white text-green-700 font-bold shadow-sm" : "text-gray-600"}`}>
          बिल सूची ({invoices.length})
        </button>
      </div>

      {/* ─── NEW BILL TAB ─── */}
      {activeTab === "new" && (
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-bold text-gray-700 font-hindi text-base">👤 ग्राहक जानकारी</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="ग्राहक का नाम *"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi" />
              <input value={customerMobile} onChange={e => setCustomerMobile(e.target.value)}
                placeholder="मोबाइल नंबर" type="tel"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              <input value={customerVillage} onChange={e => setCustomerVillage(e.target.value)}
                placeholder="गांव का नाम"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi" />
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-700 font-hindi text-base">📦 प्रोडक्ट ({cart.length})</h3>
              <button onClick={() => setShowProdDropdown(v => !v)}
                className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-hindi hover:bg-green-700">
                <Plus className="w-4 h-4" /> जोड़ें
              </button>
            </div>

            {showProdDropdown && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input autoFocus value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                  placeholder="प्रोडक्ट खोजें..."
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-green-400 rounded-xl text-sm focus:outline-none font-hindi" />
                {prodSearch && (
                  <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 mt-1 max-h-52 overflow-y-auto z-30">
                    {prodDropdownList.length === 0
                      ? <p className="px-4 py-3 text-gray-400 text-sm font-hindi">कोई प्रोडक्ट नहीं मिला</p>
                      : prodDropdownList.map(p => (
                        <button key={p.id} onClick={() => addToCart(p)}
                          className="w-full text-left px-4 py-3 hover:bg-green-50 border-b last:border-0 transition-colors">
                          <span className="font-hindi font-semibold text-gray-800 text-sm">{p.name}</span>
                          <span className="text-gray-400 text-xs ml-2">₹{p.selling_price}/{p.unit}</span>
                          <span className={`text-xs ml-2 ${Number(p.current_stock) <= Number(p.low_stock_limit) ? "text-red-500" : "text-gray-300"}`}>
                            ({p.current_stock} {p.unit})
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {cart.length === 0
              ? <p className="text-center text-gray-400 font-hindi py-6">कोई प्रोडक्ट नहीं जोड़ा</p>
              : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.product_id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <p className="font-hindi font-semibold text-gray-800 text-sm flex-1">{item.name}</p>
                        <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <p className="text-xs text-gray-400 font-hindi mb-1">मात्रा ({item.unit})</p>
                          <input type="number" min="1" value={item.quantity}
                            onChange={e => updateCartItem(item.product_id, "quantity", Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-hindi mb-1">दाम (₹)</p>
                          <input type="number" min="0" value={item.selling_price}
                            onChange={e => updateCartItem(item.product_id, "selling_price", Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-hindi mb-1">डिस्काउंट (₹)</p>
                          <input type="number" min="0" value={item.discount}
                            onChange={e => updateCartItem(item.product_id, "discount", Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                        </div>
                      </div>
                      <p className="text-right text-sm font-bold text-green-700 mt-1 font-hindi">
                        = ₹{((item.selling_price * item.quantity) - item.discount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-bold text-gray-700 font-hindi text-base">💰 भुगतान</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="font-hindi text-gray-600">उप-कुल</span>
              <span className="font-bold text-gray-800">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-hindi text-gray-600">अतिरिक्त छूट (₹)</span>
              <input type="number" min="0" max={subtotal} value={extraDiscount}
                onChange={e => setExtraDiscount(Number(e.target.value))}
                className="w-28 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="font-hindi font-bold text-gray-800 text-lg">कुल राशि</span>
              <span className="font-bold text-green-700 text-2xl">₹{finalAmount.toLocaleString("en-IN")}</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 font-hindi mb-2">भुगतान स्थिति</p>
              <div className="flex gap-2">
                {[
                  { v: "paid" as const, l: "✅ पेड" },
                  { v: "udhaar" as const, l: "📒 उधार" },
                  { v: "partial" as const, l: "💰 आंशिक" }
                ].map(opt => (
                  <button key={opt.v} onClick={() => setPayStatus(opt.v)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-hindi font-bold border-2 transition-all ${payStatus === opt.v ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {payStatus === "partial" && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-hindi text-gray-600">पेड राशि (₹)</span>
                <input type="number" min="0" max={finalAmount} value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  className="w-28 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-500" />
              </div>
            )}

            {udhaarAmount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <span className="font-hindi text-orange-700 font-bold">
                  उधार बकाया: ₹{udhaarAmount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <input value={billNotes} onChange={e => setBillNotes(e.target.value)}
              placeholder="कोई नोट..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi" />

            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-hindi text-center">
                {saveError}
              </div>
            )}

            <button onClick={saveBill} disabled={saving}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-hindi font-bold text-lg hover:from-green-700 hover:to-green-800 disabled:opacity-60 shadow-lg transition-all">
              {saving ? "⏳ बिल बन रहा है..." : "✅ बिल सेव करें"}
            </button>
          </div>
        </div>
      )}

      {/* ─── BILL LIST TAB ─── */}
      {activeTab === "list" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)}
              placeholder="नाम, बिल नंबर, गांव, मोबाइल..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 font-hindi" />
          </div>

          {listLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInvoices.map((inv: any) => (
                <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 font-hindi truncate">{inv.customer_name}</p>
                      <p className="text-gray-400 text-xs font-hindi mt-0.5">
                        {inv.invoice_number} • {inv.customer_village || "—"} • {new Date(inv.created_at).toLocaleDateString("hi-IN")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-800">₹{Number(inv.final_amount).toLocaleString("en-IN")}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-hindi font-bold ${
                        inv.payment_status === "paid" ? "bg-green-100 text-green-700" :
                        inv.payment_status === "udhaar" ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {inv.payment_status === "paid" ? "पेड" : inv.payment_status === "udhaar" ? "उधार" : "आंशिक"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => generatePDF(inv)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-hindi font-semibold hover:bg-blue-100 transition-colors">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button onClick={() => shareWhatsApp(inv)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-600 py-2 rounded-xl text-xs font-hindi font-semibold hover:bg-green-100 transition-colors">
                      <Share2 className="w-3.5 h-3.5" /> WhatsApp
                    </button>
                  </div>
                </div>
              ))}
              {filteredInvoices.length === 0 && (
                <div className="text-center py-16 text-gray-400 font-hindi">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{invoiceSearch ? "कोई बिल नहीं मिला" : "अभी कोई बिल नहीं"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
