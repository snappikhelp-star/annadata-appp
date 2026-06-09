import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Package, Tag, Lightbulb, Phone,
  Search, ChevronRight, X, Star, MapPin,
  MessageCircle, Clock, CheckCircle, Leaf,
  Bug, Droplets, Sprout, Wheat, ChevronDown, ChevronUp
} from "lucide-react";
import { FaWhatsapp, FaGoogle } from "react-icons/fa";
import logoPath from "@assets/163488e5-17d0-4da4-b57e-f1336b17431e_1780987508727.png";
import bannerPath from "@assets/gfjhj_1780987573210.jpg";

const PHONE = "916261737388";
const PHONE_SHORT = "6261737388";
const MAPS_LINK = "https://maps.app.goo.gl/42WDXZz6qG67UkQY7?g_st=ic";
const GOOGLE_REVIEW_LINK = "https://g.page/r/Cc8Vg4qNog9QEBM/review";
function waLink(msg: string) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

type Tab = "home" | "products" | "offers" | "advice" | "contact";

const TABS: { id: Tab; label: string; labelHi: string; icon: React.ReactNode }[] = [
  { id: "home",     label: "Home",     labelHi: "होम",      icon: <Home className="w-5 h-5" /> },
  { id: "products", label: "Products", labelHi: "उत्पाद",   icon: <Package className="w-5 h-5" /> },
  { id: "offers",   label: "Offers",   labelHi: "ऑफर",     icon: <Tag className="w-5 h-5" /> },
  { id: "advice",   label: "Advice",   labelHi: "सलाह",    icon: <Lightbulb className="w-5 h-5" /> },
  { id: "contact",  label: "Contact",  labelHi: "संपर्क",   icon: <Phone className="w-5 h-5" /> },
];

const PRODUCTS = [
  { id: 1, name: "1886 हाइब्रिड धान", nameEn: "1886 Hybrid Dhan", category: "Seeds", crop: "Dhan", emoji: "🌾", badge: "BESTSELLER", badgeColor: "#16a34a", desc: "उच्च उत्पादन • कम समय • रोग प्रतिरोधी", price: "₹ On Request" },
  { id: 2, name: "PB1 धान बीज", nameEn: "PB1 Dhan Seed", category: "Seeds", crop: "Dhan", emoji: "🌾", badge: "HOT", badgeColor: "#ef4444", desc: "लोकप्रिय किस्म • अधिक उपज", price: "₹ On Request" },
  { id: 3, name: "JS-335 सोयाबीन", nameEn: "JS-335 Soyabean", category: "Seeds", crop: "Soyabean", emoji: "🌿", badge: "NEW", badgeColor: "#f59e0b", desc: "प्रमाणित बीज • जल्दी अंकुरण", price: "₹ On Request" },
  { id: 4, name: "JS-9305 सोयाबीन", nameEn: "JS-9305 Soyabean", category: "Seeds", crop: "Soyabean", emoji: "🌿", badge: null, badgeColor: "", desc: "NRC-86 • RKS-45 भी उपलब्ध", price: "₹ On Request" },
  { id: 5, name: "गेहूं बीज (रबी)", nameEn: "Wheat Seed (Rabi)", category: "Seeds", crop: "Gehu", emoji: "🌾", badge: null, badgeColor: "", desc: "प्रमाणित किस्म • सभी वेराइटी", price: "₹ On Request" },
  { id: 6, name: "चना बीज", nameEn: "Chana Seed", category: "Seeds", crop: "Chana", emoji: "🟡", badge: null, badgeColor: "", desc: "देसी चना • काबुली चना", price: "₹ On Request" },
  { id: 7, name: "धान Fungicide", nameEn: "Dhan Fungicide", category: "Pesticides", crop: "Dhan", emoji: "🧴", badge: "MUST", badgeColor: "#7c3aed", desc: "ब्लास्ट • शीथ ब्लाइट से सुरक्षा", price: "₹ On Request" },
  { id: 8, name: "धान Insecticide", nameEn: "Dhan Insecticide", category: "Pesticides", crop: "Dhan", emoji: "🐛", badge: null, badgeColor: "", desc: "स्टेम बोरर • BPH कीट नाशक", price: "₹ On Request" },
  { id: 9, name: "सोयाबीन Spray Pack", nameEn: "Soyabean Spray Pack", category: "Pesticides", crop: "Soyabean", emoji: "💊", badge: "COMBO", badgeColor: "#0891b2", desc: "Fungicide + Insecticide कॉम्बो", price: "₹ On Request" },
  { id: 10, name: "खरपतवार नाशक", nameEn: "Weedicide", category: "Pesticides", crop: "Soyabean", emoji: "🌱", badge: null, badgeColor: "", desc: "सोयाबीन / धान — सभी खरपतवार नाशक", price: "₹ On Request" },
  { id: 11, name: "DAP खाद", nameEn: "DAP Fertilizer", category: "Fertilizers", crop: "All", emoji: "🌱", badge: null, badgeColor: "", desc: "बुवाई के समय सर्वोत्तम", price: "₹ On Request" },
  { id: 12, name: "यूरिया खाद", nameEn: "Urea Fertilizer", category: "Fertilizers", crop: "All", emoji: "🌿", badge: null, badgeColor: "", desc: "नाइट्रोजन — फसल की बढ़त", price: "₹ On Request" },
];

const CATEGORIES = ["All", "Seeds", "Pesticides", "Fertilizers"];
const CROPS = ["All", "Dhan", "Soyabean", "Gehu", "Chana"];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "30%" : "-30%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-30%" : "30%", opacity: 0 }),
};

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [prevTab, setPrevTab] = useState<Tab>("home");

  const tabOrder: Tab[] = ["home", "products", "offers", "advice", "contact"];
  const direction = tabOrder.indexOf(activeTab) - tabOrder.indexOf(prevTab);

  const switchTab = (tab: Tab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0d1f0d] flex flex-col overflow-hidden" style={{ fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif" }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {activeTab === "home"     && <HomeTab onTabChange={switchTab} />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "offers"   && <OffersTab />}
          {activeTab === "advice"   && <AdviceTab />}
          {activeTab === "contact"  && <ContactTab />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 bg-[#0d1f0d] border-t border-white/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="grid grid-cols-5 h-16">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className="flex flex-col items-center justify-center gap-0.5 transition-all relative"
              >
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#F9A825]"
                  />
                )}
                <span className={`transition-colors ${active ? "text-[#F9A825]" : "text-white/40"}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-bold transition-colors leading-tight ${active ? "text-[#F9A825]" : "text-white/40"}`}>
                  {tab.labelHi}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOME TAB
═══════════════════════════════════════════════ */
function HomeTab({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-full bg-[#0d1f0d]">
      {/* App Header */}
      <div className="sticky top-0 z-10 bg-[#0d1f0d] border-b border-white/8 px-4 pt-3 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img src={logoPath} alt="Logo" className="w-11 h-11 rounded-2xl object-cover shadow-lg" style={{ border: "1.5px solid rgba(249,168,37,0.5)" }} />
            <div>
              <div className="text-[#F9A825] font-bold text-sm leading-tight">Annadata Agri & Seeds</div>
              <div className="text-white/50 text-[10px]">Salamatpur, Raisen • 6261737388</div>
            </div>
          </div>
          <a href={waLink("नमस्ते Keshav Bhai!")} target="_blank" rel="noreferrer"
            className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
            <FaWhatsapp className="w-4 h-4 text-white" />
          </a>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="बेज, दवा, खाद सर्च करें..."
            className="w-full bg-white/8 border border-white/12 rounded-2xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-[#F9A825]/50 transition-colors"
          />
        </div>
      </div>

      <div className="px-4 pb-6 space-y-5 pt-4">
        {/* Hero Banner Image */}
        <a href={waLink("नमस्ते Keshav Bhai! मुझे जानकारी चाहिए।")} target="_blank" rel="noreferrer">
          <motion.img
            src={bannerPath}
            alt="Annadata Agri & Seeds — Keshav Bhai"
            className="w-full rounded-2xl object-cover shadow-xl"
            style={{ maxHeight: 180, objectPosition: "center top", border: "1px solid rgba(249,168,37,0.2)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          />
        </a>

        {/* Today's Offer Banner */}
        <motion.div
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative rounded-2xl overflow-hidden p-4"
          style={{ background: "linear-gradient(135deg, #16532d 0%, #1a6b38 50%, #0f3d1f 100%)", border: "1px solid rgba(249,168,37,0.3)" }}
        >
          <div className="absolute top-2 right-3">
            <span className="bg-[#F9A825] text-black text-[9px] font-black px-2 py-0.5 rounded-full">🔥 HOT</span>
          </div>
          <div className="text-[#F9A825] text-[11px] font-bold uppercase tracking-widest mb-1">आज का ऑफर</div>
          <div className="text-white font-bold text-base leading-tight mb-2">खरीफ सीजन 2026 — धान & सोयाबीन बीज उपलब्ध!</div>
          <div className="text-white/60 text-xs mb-3">⚡ सीमित स्टॉक — 1886 हाइब्रिड धान • JS-335 सोयाबीन</div>
          <a href={waLink("नमस्ते Keshav Bhai! खरीफ सीजन ऑफर के बारे में जानकारी चाहिए।")} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-xl">
            <FaWhatsapp className="w-3.5 h-3.5" /> अभी Order करें
          </a>
        </motion.div>

        {/* Quick Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold text-sm">🗂️ Quick Category</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "बीज", labelEn: "Seeds", emoji: "🌱", color: "#16a34a", tab: "products" as Tab },
              { label: "कीटनाशक", labelEn: "Pesticides", emoji: "🧴", color: "#7c3aed", tab: "products" as Tab },
              { label: "खाद", labelEn: "Fertilizers", emoji: "🌿", color: "#0891b2", tab: "products" as Tab },
              { label: "फसल दवा", labelEn: "Crop Med.", emoji: "💊", color: "#ef4444", tab: "products" as Tab },
            ].map((cat) => (
              <button key={cat.label} onClick={() => onTabChange(cat.tab)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95"
                style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-[10px] font-bold text-white/80 leading-tight text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Crop Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold text-sm">🌾 फसल चुनें</span>
            <button onClick={() => onTabChange("products")} className="text-[#F9A825] text-xs font-bold flex items-center gap-0.5">
              सभी <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { name: "धान", nameEn: "Dhan", emoji: "🌾", desc: "1886 • PB1 • बासमती • हाइब्रिड", color: "#16a34a", badge: "खरीफ 2026" },
              { name: "गेहूं", nameEn: "Gehu", emoji: "🌾", desc: "सभी प्रमाणित किस्में उपलब्ध", color: "#f59e0b", badge: "रबी सीजन" },
              { name: "सोयाबीन", nameEn: "Soyabean", emoji: "🌿", desc: "JS-335 • JS-9305 • NRC-86", color: "#a3e635", badge: "खरीफ HOT" },
              { name: "चना", nameEn: "Chana", emoji: "🟡", desc: "देसी चना • काबुली चना", color: "#fb923c", badge: "रबी सीजन" },
            ].map((crop) => (
              <button key={crop.name}
                onClick={() => onTabChange("products")}
                className="text-left p-3.5 rounded-2xl transition-all active:scale-95 relative overflow-hidden"
                style={{ background: `${crop.color}15`, border: `1px solid ${crop.color}30` }}>
                <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: crop.color }}>{crop.badge}</span>
                <div className="text-2xl mb-1">{crop.emoji}</div>
                <div className="text-white font-bold text-sm">{crop.name}</div>
                <div className="text-white/50 text-[10px] mt-0.5 leading-tight">{crop.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Ghar Tak Mangaye Section ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0a2a1a 0%, #0f3520 100%)", border: "1.5px solid rgba(249,168,37,0.35)" }}>
          {/* Header strip */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(249,168,37,0.15)" }}>
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2 }}
                className="text-2xl">🏠</motion.span>
              <div>
                <div className="text-[#F9A825] font-black text-sm leading-tight">घर तक मँगाएं!</div>
                <div className="text-white/50 text-[10px]">FREE Home Delivery — Order करें</div>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 0px rgba(249,168,37,0)", "0 0 14px rgba(249,168,37,0.7)", "0 0 0px rgba(249,168,37,0)"] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="bg-[#F9A825] text-black text-[9px] font-black px-2.5 py-1 rounded-full">
              🚚 FREE
            </motion.div>
          </div>

          {/* Delivery features row */}
          <div className="grid grid-cols-3 gap-0 px-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { icon: "✅", text: "असली बीज\nगारंटी" },
              { icon: "⚡", text: "तुरंत\nConfirm" },
              { icon: "📦", text: "सुरक्षित\nPacking" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1 text-center">
                <span className="text-xl">{f.icon}</span>
                <span className="text-white/60 text-[10px] leading-tight whitespace-pre-line">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Product chips */}
          <div className="px-4 pt-3 pb-2">
            <div className="text-white/40 text-[10px] mb-2 uppercase tracking-wider font-bold">उपलब्ध उत्पाद</div>
            <div className="flex flex-wrap gap-1.5">
              {["🌾 1886 हाइब्रिड धान", "🌿 JS-335 सोयाबीन", "🧴 Fungicide Pack", "💊 Spray Combo", "🌱 गेहूं बीज", "🌿 खरपतवार नाशक"].map(item => (
                <span key={item} className="text-[10px] text-white/70 font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(249,168,37,0.12)", border: "1px solid rgba(249,168,37,0.2)" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="px-4 pb-4 pt-3 flex gap-2">
            <a href={waLink("नमस्ते Keshav Bhai! 🏠 *घर तक Delivery* चाहिए। कृपया product और price बताएं।")}
              target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-[#25D366] text-white font-black text-sm rounded-xl"
              style={{ boxShadow: "0 4px 18px rgba(37,211,102,0.4)" }}>
              <FaWhatsapp className="w-4 h-4" /> Order on WhatsApp
            </a>
            <a href={`tel:${PHONE_SHORT}`}
              className="w-12 flex items-center justify-center rounded-xl bg-white/8 border border-white/12">
              <Phone className="w-4 h-4 text-[#F9A825]" />
            </a>
          </div>
        </div>

        {/* Keshav Bhai Salah Button */}
        <button onClick={() => onTabChange("advice")}
          className="w-full py-4 rounded-2xl flex items-center justify-between px-5 transition-all active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #1a3a1a 0%, #0f2a0f 100%)", border: "1px solid rgba(249,168,37,0.3)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F9A825]/20 rounded-full flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#F9A825]" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">Keshav Bhai से सलाह लो</div>
              <div className="text-white/50 text-[10px]">फसल • दवाई • बीज की पूरी जानकारी</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#F9A825]" />
        </button>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: "200+", label: "किसान", icon: "👨‍🌾" },
            { val: "4.9★", label: "Rating", icon: "⭐" },
            { val: "10+", label: "वर्ष अनुभव", icon: "🏆" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-3 text-center border border-white/8">
              <div className="text-xl mb-0.5">{s.icon}</div>
              <div className="text-[#F9A825] font-black text-base">{s.val}</div>
              <div className="text-white/50 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div>
          <div className="text-white/50 text-xs mb-2 text-center">सोशल मीडिया पर Follow करें</div>
          <div className="flex gap-2 justify-center">
            {[
              { label: "46K+ Insta", color: "#e1306c", href: "https://www.instagram.com/lifeofkeshavmeena?igsh=MXc0emJjanFrbzluOQ%3D%3D", emoji: "📸" },
              { label: "31K+ FB", color: "#1877f2", href: "https://www.facebook.com/share/1NNq1tBFvf/", emoji: "👍" },
              { label: "8K+ YT", color: "#ff0000", href: "https://youtube.com", emoji: "▶️" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-white text-[10px] font-bold"
                style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                <span>{s.emoji}</span> {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Developed by credit */}
        <div className="pt-1 pb-2 flex flex-col items-center gap-1">
          <div className="w-16 h-px bg-white/10 rounded-full mb-1" />
          <a href="https://www.instagram.com/priyamxmedia" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-white/30 text-[10px] hover:text-white/50 transition-colors">
            <span>⚡</span>
            <span>Developed by</span>
            <span className="text-[#e1306c]/60 font-bold">@priyamxmedia</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PRODUCTS TAB
═══════════════════════════════════════════════ */
function ProductsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [crop, setCrop] = useState("All");
  const [selected, setSelected] = useState<typeof PRODUCTS[0] | null>(null);

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    const matchCrop = crop === "All" || p.crop === crop || p.crop === "All";
    return matchSearch && matchCat && matchCrop;
  });

  return (
    <div className="min-h-full bg-[#0d1f0d]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1f0d] border-b border-white/8 px-4 pt-3 pb-3 space-y-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <div className="flex items-center gap-2">
          <div className="text-[#F9A825] font-bold text-lg">🌿 उत्पाद</div>
          <span className="ml-auto text-white/40 text-xs">{filtered.length} products</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="उत्पाद खोजें..."
            className="w-full bg-white/8 border border-white/12 rounded-2xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-[#F9A825]/50" />
        </div>
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${category === c ? "bg-[#16a34a] text-white" : "bg-white/8 text-white/50 border border-white/10"}`}>
              {c === "All" ? "सभी" : c}
            </button>
          ))}
        </div>
        {/* Crop Filter */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {CROPS.map(c => (
            <button key={c} onClick={() => setCrop(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${crop === c ? "bg-[#F9A825] text-black" : "bg-white/8 text-white/50 border border-white/10"}`}>
              {c === "All" ? "सभी फसल" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {filtered.map(p => (
          <button key={p.id} onClick={() => setSelected(p)}
            className="text-left p-3.5 rounded-2xl bg-white/5 border border-white/10 transition-all active:scale-95 relative overflow-hidden">
            {p.badge && (
              <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                style={{ background: p.badgeColor }}>{p.badge}</span>
            )}
            <div className="text-2xl mb-2">{p.emoji}</div>
            <div className="text-white font-bold text-xs leading-tight mb-1">{p.name}</div>
            <div className="text-white/40 text-[10px] leading-tight mb-2">{p.desc}</div>
            <div className="flex items-center justify-between">
              <span className="text-[#F9A825] text-[10px] font-bold">{p.price}</span>
              <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{p.category}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-10 text-white/40 text-sm">
            <div className="text-3xl mb-2">🔍</div>
            कोई उत्पाद नहीं मिला
          </div>
        )}
      </div>

      {/* Product Detail Bottom Sheet */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
              style={{ background: "#0f2a0f", borderTop: "1px solid rgba(249,168,37,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/8 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    {selected.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg leading-tight">{selected.name}</div>
                    <div className="text-white/50 text-xs mt-0.5">{selected.nameEn}</div>
                    {selected.badge && (
                      <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                        style={{ background: selected.badgeColor }}>{selected.badge}</span>
                    )}
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/40 mt-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                  <div className="text-white/70 text-sm leading-relaxed">{selected.desc}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-white/40">
                    <span className="bg-white/8 px-2 py-1 rounded-lg">{selected.category}</span>
                    <span className="bg-white/8 px-2 py-1 rounded-lg">{selected.crop}</span>
                  </div>
                </div>
                <a href={waLink(`नमस्ते Keshav Bhai! मुझे "${selected.name}" के बारे में जानकारी चाहिए। कीमत और उपलब्धता बताएं।`)}
                  target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-bold text-base rounded-2xl"
                  style={{ boxShadow: "0 6px 20px rgba(37,211,102,0.35)" }}>
                  <FaWhatsapp className="w-5 h-5" /> WhatsApp पर Enquiry करें
                </a>
                <a href={`tel:${PHONE_SHORT}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-white/8 text-white font-bold text-sm rounded-2xl border border-white/12">
                  <Phone className="w-4 h-4 text-[#F9A825]" /> Call: {PHONE_SHORT}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   OFFERS TAB
═══════════════════════════════════════════════ */
function OffersTab() {
  const offers = [
    {
      title: "🔥 खरीफ 2026 — New Stock",
      subtitle: "नई स्टॉक आई है",
      items: ["1886 हाइब्रिड धान — नई लॉट", "JS-335 सोयाबीन — ताज़ा स्टॉक", "धान First Spray Pack", "सोयाबीन Combo Spray"],
      color: "#16a34a", badge: "NEW STOCK"
    },
    {
      title: "⭐ Seasonal Best Sellers",
      subtitle: "इस सीजन की सबसे लोकप्रिय",
      items: ["1886 हाइब्रिड धान बीज", "Fungicide + Insecticide Combo", "DAP + यूरिया खाद पैक", "खरपतवार नाशक — Dhan & Soya"],
      color: "#F9A825", badge: "POPULAR"
    },
    {
      title: "🚀 Special Deals",
      subtitle: "सीमित समय के लिए",
      items: ["Combo Spray Pack — बचत के साथ", "घर तक FREE Delivery — Order पर", "2+ पैकेट पर विशेष छूट", "किसान Club Members को Extra Benefit"],
      color: "#7c3aed", badge: "LIMITED"
    },
  ];

  return (
    <div className="min-h-full bg-[#0d1f0d]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="text-[#F9A825] font-bold text-lg mb-1">🏷️ ऑफर & स्टॉक</div>
        <div className="text-white/40 text-xs">आज के सबसे अच्छे ऑफर</div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Offer Banner */}
        <motion.div
          animate={{ borderColor: ["rgba(249,168,37,0.2)", "rgba(249,168,37,0.6)", "rgba(249,168,37,0.2)"] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #16532d, #0f3d1f)", border: "1px solid rgba(249,168,37,0.3)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold">LIVE OFFER</span>
          </div>
          <div className="text-white font-bold text-base mb-1">🌾 खरीफ सीजन SALE चल रहा है!</div>
          <div className="text-white/60 text-xs mb-3">धान & सोयाबीन बीज पर विशेष छूट — आज ही Order करें</div>
          <a href={waLink("नमस्ते Keshav Bhai! खरीफ सीजन के best offers बताएं।")} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-xl">
            <FaWhatsapp className="w-3 h-3" /> ऑफर के बारे में पूछें
          </a>
        </motion.div>

        {/* Offer Cards */}
        {offers.map((offer, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: `${offer.color}10`, border: `1px solid ${offer.color}25` }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${offer.color}15` }}>
              <div>
                <div className="text-white font-bold text-sm">{offer.title}</div>
                <div className="text-white/50 text-[10px]">{offer.subtitle}</div>
              </div>
              <span className="text-[9px] font-black px-2 py-1 rounded-full text-white" style={{ background: offer.color }}>
                {offer.badge}
              </span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {offer.items.map((item, j) => (
                <div key={j} className="flex items-center gap-2 text-white/70 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: offer.color }} />
                  {item}
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <a href={waLink(`नमस्ते Keshav Bhai! "${offer.title}" के बारे में जानना चाहता हूँ।`)}
                target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-bold"
                style={{ background: offer.color }}>
                <FaWhatsapp className="w-3.5 h-3.5" /> Enquiry करें
              </a>
            </div>
          </motion.div>
        ))}

        {/* Season Calendar */}
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
          <div className="text-white font-bold text-sm mb-3">📅 फसल कैलेंडर 2026</div>
          <div className="space-y-2">
            {[
              { season: "खरीफ", months: "जून–अक्टूबर", crops: "धान • सोयाबीन • मक्का", color: "#16a34a" },
              { season: "रबी", months: "अक्टूबर–मार्च", crops: "गेहूं • चना • सरसों", color: "#F9A825" },
              { season: "ज़ायद", months: "मार्च–जून", crops: "मूंग • तरबूज़ • उड़द", color: "#0891b2" },
            ].map(s => (
              <div key={s.season} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-xs">{s.season} सीजन</div>
                  <div className="text-white/40 text-[10px]">{s.months}</div>
                  <div className="text-white/60 text-[10px] truncate">{s.crops}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADVICE TAB
═══════════════════════════════════════════════ */
function AdviceTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const cropAdvice = [
    {
      crop: "🌾 धान (Dhan)", color: "#16a34a",
      tips: ["बुवाई से पहले बीज उपचार जरूर करें", "First Spray — 15-20 दिन बाद", "ब्लास्ट रोग: Fungicide Spray करें", "BPH कीट: Insecticide + पानी का छिड़काव"]
    },
    {
      crop: "🌿 सोयाबीन", color: "#a3e635",
      tips: ["बुवाई — जून मध्य के बाद करें", "Rhizobium Culture से उपज 20% बढ़ती है", "Yellow Mosaic Virus: रोगग्रस्त पौधे हटाएं", "Stem Fly: Systemic Insecticide लगाएं"]
    },
    {
      crop: "🌾 गेहूं (Gehu)", color: "#f59e0b",
      tips: ["अक्टूबर-नवंबर में बुवाई उत्तम", "पहली सिंचाई 20-25 दिन में", "गेरुआ रोग पर Fungicide जरूरी", "कटाई से पहले खेत सूखा रखें"]
    },
    {
      crop: "🟡 चना (Chana)", color: "#fb923c",
      tips: ["अक्टूबर-नवंबर में बुवाई", "Pod Borer से बचाव: Lambda Spray", "उकठा रोग: Resistant Variety चुनें", "कटाई — फलियां पक जाने पर"]
    },
  ];

  const faqs = [
    { q: "कौन सा धान बीज सबसे अच्छा है?", a: "1886 हाइब्रिड धान सबसे ज्यादा लोकप्रिय है — उच्च उपज, रोग प्रतिरोधी। PB1 भी अच्छा विकल्प है। अपने खेत की मिट्टी और पानी के हिसाब से Keshav Bhai से सलाह लें।" },
    { q: "First Spray कब और क्या दें?", a: "धान में रोपाई के 15-20 दिन बाद First Spray करें। Fungicide + Insecticide का Combo दें। सही दवाई और मात्रा के लिए WhatsApp करें।" },
    { q: "सोयाबीन में पीली पत्ती क्यों आती है?", a: "Yellow Mosaic Virus, आयरन की कमी, या Whitefly के कारण पत्तियां पीली होती हैं। तुरंत नमूना लेकर Keshav Bhai को दिखाएं।" },
    { q: "खाद कितनी डालें?", a: "DAP — 50 kg/एकड़ बुवाई पर। यूरिया — 25-30 kg/एकड़ दो बार में। फसल और मिट्टी के अनुसार मात्रा बदल सकती है।" },
    { q: "घर तक डिलीवरी मिलती है?", a: "हां! WhatsApp पर Order करें — Keshav Bhai आपके घर तक बीज, दवाई और खाद पहुंचाते हैं।" },
  ];

  return (
    <div className="min-h-full bg-[#0d1f0d]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="text-[#F9A825] font-bold text-lg mb-1">💡 कृषि सलाह</div>
        <div className="text-white/40 text-xs">Keshav Bhai की expert guidance</div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Photo Bhejo CTA */}
        <a href={waLink("नमस्ते Keshav Bhai! मेरी फसल में समस्या है। फोटो भेज रहा हूँ — कृपया सलाह दें।")}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #0f2a1a, #16532d)", border: "1px solid rgba(37,211,102,0.3)" }}>
          <div className="w-12 h-12 bg-[#25D366]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📸</span>
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">फोटो भेजकर सलाह लो</div>
            <div className="text-white/50 text-xs mt-0.5">फसल की फोटो WhatsApp पर भेजें — तुरंत जवाब</div>
          </div>
          <FaWhatsapp className="w-6 h-6 text-[#25D366] flex-shrink-0" />
        </a>

        {/* Crop-wise Advice */}
        <div>
          <div className="text-white font-bold text-sm mb-3">🌱 फसल-वार सुझाव</div>
          <div className="space-y-3">
            {cropAdvice.map((ca, i) => (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ background: `${ca.color}10`, border: `1px solid ${ca.color}20` }}>
                <button className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => setOpenFaq(openFaq === -i - 1 ? null : -i - 1)}>
                  <span className="text-white font-bold text-sm">{ca.crop}</span>
                  {openFaq === -i - 1
                    ? <ChevronUp className="w-4 h-4 text-white/40" />
                    : <ChevronDown className="w-4 h-4 text-white/40" />}
                </button>
                <AnimatePresence>
                  {openFaq === -i - 1 && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      style={{ overflow: "hidden" }}>
                      <div className="px-4 pb-3 space-y-2">
                        {ca.tips.map((tip, j) => (
                          <div key={j} className="flex items-start gap-2 text-white/70 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: ca.color }} />
                            {tip}
                          </div>
                        ))}
                        <a href={waLink(`नमस्ते Keshav Bhai! ${ca.crop} के बारे में सलाह चाहिए।`)}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 mt-2 text-[#25D366] text-xs font-bold">
                          <FaWhatsapp className="w-3 h-3" /> और जानकारी के लिए WhatsApp करें
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-white font-bold text-sm mb-3">❓ अक्सर पूछे जाने वाले सवाल</div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/8 overflow-hidden">
                <button className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-white/80 text-xs font-bold flex-1">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      style={{ overflow: "hidden" }}>
                      <div className="px-4 pb-3 text-white/60 text-xs leading-relaxed border-t border-white/8 pt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="flex gap-2">
          <a href={waLink("नमस्ते Keshav Bhai! मुझे फसल की सलाह चाहिए।")} target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-bold text-sm rounded-2xl">
            <FaWhatsapp className="w-4 h-4" /> WhatsApp सलाह
          </a>
          <a href={`tel:${PHONE_SHORT}`}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/8 text-white font-bold text-sm rounded-2xl border border-white/12">
            <Phone className="w-4 h-4 text-[#F9A825]" /> Call करें
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CONTACT TAB
═══════════════════════════════════════════════ */
function ContactTab() {
  return (
    <div className="min-h-full bg-[#0d1f0d]">
      {/* Header */}
      <div className="px-4 pt-4 pb-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="text-[#F9A825] font-bold text-lg mb-1">📞 संपर्क करें</div>
        <div className="text-white/40 text-xs">Keshav Bhai से सीधे बात करें</div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {/* Big Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Call करें", sublabel: PHONE_SHORT, emoji: "📞", href: `tel:${PHONE_SHORT}`, bg: "#16a34a", textColor: "white" },
            { label: "WhatsApp", sublabel: "तुरंत जवाब", emoji: "💬", href: waLink("नमस्ते Keshav Bhai!"), bg: "#25D366", textColor: "white" },
            { label: "Google Maps", sublabel: "दुकान का रास्ता", emoji: "📍", href: MAPS_LINK, bg: "rgba(255,255,255,0.07)", textColor: "white", border: "rgba(255,255,255,0.12)" },
            { label: "Review दें", sublabel: "Google Rating", emoji: "⭐", href: GOOGLE_REVIEW_LINK, bg: "rgba(255,255,255,0.07)", textColor: "white", border: "rgba(255,255,255,0.12)" },
          ].map((btn) => (
            <a key={btn.label} href={btn.href} target={btn.href.startsWith("tel") ? undefined : "_blank"} rel="noreferrer"
              className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all active:scale-95"
              style={{
                background: btn.bg,
                border: btn.border ? `1px solid ${btn.border}` : undefined,
              }}>
              <span className="text-2xl">{btn.emoji}</span>
              <div className="text-center">
                <div className="text-white font-bold text-sm">{btn.label}</div>
                <div className="text-white/50 text-[10px]">{btn.sublabel}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Shop Info Card */}
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-3">
          <div className="text-white font-bold text-sm">🏪 दुकान की जानकारी</div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#F9A825] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-white text-sm font-bold">Annadata Agri & Seeds</div>
              <div className="text-white/60 text-xs mt-0.5 leading-relaxed">
                Raisen Road, Trimurti Chouraha<br />
                Salamatpur, Dist. Raisen, M.P.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#F9A825] flex-shrink-0" />
            <div>
              <div className="text-white text-sm font-bold">दुकान समय</div>
              <div className="text-white/60 text-xs">सोम–शनि: सुबह 8 बजे – शाम 8 बजे</div>
              <div className="text-white/40 text-[10px]">रविवार: सुबह 10 बजे – दोपहर 2 बजे</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-[#F9A825] flex-shrink-0" />
            <div>
              <div className="text-white text-sm font-bold">Google Rating: 4.9 ⭐</div>
              <div className="text-white/60 text-xs">200+ Happy Farmers</div>
            </div>
          </div>
        </div>

        {/* WhatsApp Enquiry Form */}
        <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          <div className="bg-[#25D366]/15 px-4 py-3 border-b border-white/8">
            <div className="text-white font-bold text-sm">📝 Quick Enquiry</div>
            <div className="text-white/50 text-xs">WhatsApp पर सीधे भेजें</div>
          </div>
          <EnquiryForm />
        </div>

        {/* Social Media */}
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
          <div className="text-white font-bold text-sm mb-3">📱 Social Media</div>
          <div className="space-y-2">
            {[
              { label: "Instagram", handle: "@ANNADATA_AGRI_AND_SEEDS", followers: "46K+ followers", emoji: "📸", color: "#e1306c", href: "https://www.instagram.com/lifeofkeshavmeena?igsh=MXc0emJjanFrbzluOQ%3D%3D" },
              { label: "Facebook", handle: "Annadata Agri & Seeds", followers: "31K+ followers", emoji: "👍", color: "#1877f2", href: "https://www.facebook.com/share/1NNq1tBFvf/" },
              { label: "YouTube", handle: "Annadata Channel", followers: "8K+ subscribers", emoji: "▶️", color: "#ff0000", href: "https://youtube.com" },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all active:scale-95"
                style={{ background: `${s.color}12` }}>
                <span className="text-xl">{s.emoji}</span>
                <div className="flex-1">
                  <div className="text-white text-xs font-bold">{s.label}</div>
                  <div className="text-white/50 text-[10px]">{s.handle}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: s.color }}>
                  {s.followers}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EnquiryForm() {
  const [form, setForm] = useState({ name: "", mobile: "", crop: "", message: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const send = () => {
    const msg = `🌾 *Annadata App — Quick Enquiry*\n\n👤 नाम: ${form.name || "-"}\n📱 मोबाइल: ${form.mobile || "-"}\n🌱 फसल: ${form.crop || "-"}\n💬 सवाल: ${form.message || "-"}`;
    window.open(waLink(msg), "_blank");
  };
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-white/50 text-[10px] font-bold mb-1 block">नाम</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="आपका नाम"
            className="w-full bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/25 outline-none focus:border-[#F9A825]/50" />
        </div>
        <div>
          <label className="text-white/50 text-[10px] font-bold mb-1 block">मोबाइल</label>
          <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="नंबर"
            className="w-full bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/25 outline-none focus:border-[#F9A825]/50" />
        </div>
      </div>
      <div>
        <label className="text-white/50 text-[10px] font-bold mb-1 block">फसल</label>
        <select name="crop" value={form.crop} onChange={handleChange}
          className="w-full bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#F9A825]/50">
          <option value="" className="bg-gray-900">फसल चुनें</option>
          {["धान", "सोयाबीन", "गेहूं", "चना", "अन्य"].map(c => (
            <option key={c} value={c} className="bg-gray-900">{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-white/50 text-[10px] font-bold mb-1 block">सवाल / समस्या</label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={2} placeholder="यहाँ लिखें..."
          className="w-full bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/25 outline-none focus:border-[#F9A825]/50 resize-none" />
      </div>
      <button onClick={send}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white font-bold text-sm rounded-xl"
        style={{ boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}>
        <FaWhatsapp className="w-4 h-4" /> WhatsApp पर भेजें
      </button>
    </div>
  );
}
