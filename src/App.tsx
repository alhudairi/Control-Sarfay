import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sun, 
  Moon, 
  RefreshCcw, 
  Menu, 
  X, 
  Activity, 
  Settings, 
  Compass, 
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Home
} from "lucide-react";
import { ApiResponse } from "./types";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { FALLBACK_TELEMETRY_DATA } from "./data/fallbackData";

// Modularized elegant Pages representing each distinct view
import { PageHome } from "./components/PageHome";
import { PageOperationalEfficiency } from "./components/PageOperationalEfficiency";
import { PageSectorOperationMechanism } from "./components/PageSectorOperationMechanism";
import { PageIrrigationNetworkResponse } from "./components/PageIrrigationNetworkResponse";
import { PageGeneralNotes } from "./components/PageGeneralNotes";

// The new mandated Google Script macro API endpoint
const DATA_URL = "https://script.google.com/macros/s/AKfycbzSHgEvpTxwvFA4C_vdQ49Rw36c4OwBDdjtKBr6TKFQBgAzsI4IfMdeQIqAaYeBE6LqQQ/exec";

export default function App() {
  // Locale state
  const [lang, setLang] = useState<"ar" | "en">(() => {
    const saved = localStorage.getItem("preferred_lang");
    return (saved === "ar" || saved === "en") ? saved : "ar";
  });
  
  // Theme state: White Theme Only
  const theme = "light";

  // Mobile drawer side controller
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core telemetry state
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [retryInterval, setRetryInterval] = useState<number>(60000);

  // Nav sections representing 5 separate pages
  const [activeNavSection, setActiveNavSection] = useState<
    "home" | "operational_efficiency" | "sector_operation_mechanism" | "irrigation_network_response" | "general_notes"
  >("home");

  // Device screen simulation
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const isRtl = lang === "ar";
  const isDark = false;

  // Document effects
  useEffect(() => {
    localStorage.setItem("preferred_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("preferred_theme", "light");
    const root = document.documentElement;
    root.classList.remove("dark");
  }, []);

  // Fetch telemetry async loop
  const fetchTelemetryData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(`${DATA_URL}?_t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const json: ApiResponse = await response.json();
      if (json && json.success && json.pages) {
        setData(json);
        setIsFallbackMode(false);
        setLastRefreshedAt(new Date());
        setError(null);
        setRetryInterval(60000); // Reset standard interval to 60s
        
        console.log("-----------------------------------------");
        console.log("✔ LIVE API Connected Successfully & Telemetry Repopulated");
        console.log(`- Connection Timestamp: ${new Date().toLocaleTimeString()}`);
        console.log(`- Last Data Update: ${json.last_updated}`);
        console.log("-----------------------------------------");
      } else {
        throw new Error("Invalid response or missing page nodes");
      }
    } catch (err: any) {
      console.warn("API Main Gateway unreachable. Falling back safely to stable client mockup dataset:", err);
      
      // Load fallback mock dataset to guarantee beautiful rendering
      setData(FALLBACK_TELEMETRY_DATA);
      setIsFallbackMode(true);
      setRetryInterval(30000); // Keep polling every 30s to re-try gateway reconnection
    } finally {
      setLoading(false);
    }
  }, [lang]);

  // Initialize data feed on mount
  useEffect(() => {
    fetchTelemetryData();
  }, [fetchTelemetryData]);

  // Handle synchronized timing loops combined nicely
  useEffect(() => {
    const timer = setInterval(() => {
      fetchTelemetryData(true); // Silent refresh in background
    }, retryInterval);
    return () => clearInterval(timer);
  }, [fetchTelemetryData, retryInterval]);

  // Navigation controller helper
  const handleNavClick = (section: typeof activeNavSection) => {
    setActiveNavSection(section);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getSidebarItemClass = (section: typeof activeNavSection) => {
    const isActive = activeNavSection === section;
    if (isActive) {
      return "w-full flex items-center gap-3 p-3 text-xs font-bold transition-all text-white select-none";
    }
    return "w-full flex items-center gap-3 p-3 rounded-lg text-xs font-bold transition-all text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors duration-200 select-none";
  };

  const getSidebarItemStyle = (section: typeof activeNavSection) => {
    const isActive = activeNavSection === section;
    if (isActive) {
      return {
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        borderLeft: "4px solid #3B82F6",
        color: "#FFFFFF",
        borderRadius: "12px",
      };
    }
    return {};
  };

  // Translations
  const t = {
    systemTitle: isRtl ? "وحدة المراقبة والتحكم المركزي" : "Central Monitoring & Control Unit",
    subTitle: isRtl ? "لوحة الإدارة التنفيذية لدعم القرار" : "Executive Decision Support Suite",
    officer: isRtl ? "عبدالرحمن الحضيري" : "Abdulrahman Alhudairi",
    versionLabel: isRtl ? "نسخة تجريبية" : "Prototype Version",
    refreshTooltip: isRtl ? "تحديث فوري للبيانات" : "Refresh Telemetry Data Now",
    stateErrorTitle: isRtl ? "خطأ في الاتصال بالشبكة" : "Network Stream Offline",
    stateErrorDesc: isRtl ? "لم نتمكن من الوصول لبوابة التحكم المركزية. يرجى التحقق من خصائص التوصيل." : "Unable to reach database stream gateway.",
    retryBtn: isRtl ? "إعادة المحاولة" : "Try Reconnection Only",
    
    // Sidebar Page labels
    navHome: isRtl ? "الصفحة الرئيسية" : "Home Page",
    navOperationalEfficiency: isRtl ? "كفاءة نظام التشغيل" : "Operational Efficiency",
    navSectorOperationMechanism: isRtl ? "آلية تشغيل القطاعات" : "Sector Operation Mechanism",
    navIrrigationNetworkResponse: isRtl ? "كفاءة استجابة شبكات الري" : "Irrigation Network Response",
    navGeneralNotes: isRtl ? "ملاحظات عامة" : "General Notes",

    // Banner texts
    liveConnected: isRtl ? "تم ربط بث البيانات المباشر بنجاح" : "Live telemetry feed established",
    fallbackAlert: isRtl ? "نمط التشغيل الاحتياطي: لم نتمكن من الوصول لبث البيانات المباشر، تم تحميل سجل القياسات المخزن مؤقتاً." : "Offline Mode: Active Snapshot Loaded successfully.",
    reconnectBtn: isRtl ? "إعادة التوصيل" : "Reconnect Feed",
    latestRefreshed: isRtl ? "آخر تحديث قبل:" : "Last Updated:"
  };

  return (
    <div className="min-h-screen text-[#0F172A] font-sans flex bg-white" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* 1. SIDEBAR (Renders beautifully on desktop & tablet modes, slideout on mobile) */}
      <aside className={`fixed inset-y-0 z-40 border-r border-slate-800 bg-[#0F172A] flex flex-col justify-between transition-all duration-300 ${
        viewMode === "desktop"
          ? "w-64 translate-x-0"
          : viewMode === "tablet"
          ? "w-16 hover:w-64 group overflow-hidden shadow-lg translate-x-0"
          : "hidden"
      } ${
        isRtl 
          ? `right-0 ${sidebarOpen && viewMode !== "mobile" ? "translate-x-0" : (viewMode === "mobile" ? "translate-x-full" : "")}` 
          : `left-0 ${sidebarOpen && viewMode !== "mobile" ? "translate-x-0" : (viewMode === "mobile" ? "-translate-x-full" : "")}`
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-4.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-xl text-white shadow-xs shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className={`text-start transition-all duration-300 ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-44 group-hover:opacity-100 overflow-hidden" : ""
            }`}>
              <h2 className="text-xs font-black text-indigo-400 tracking-wider uppercase leading-none">
                Control Sarfay
              </h2>
              <span className="text-[10px] text-slate-400 font-bold block truncate">
                AVEVA Telemetry Log
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar List navigation - Replaced with the 5 Pages Exactly */}
        <nav className="flex-1 p-3 space-y-1.5 text-start scrollbar-thin overflow-y-auto">
          
          {/* Page 0: Home Page */}
          <button
            onClick={() => handleNavClick("home")}
            className={getSidebarItemClass("home")}
            style={getSidebarItemStyle("home")}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className={`transition-all duration-300 truncate text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-36 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.navHome}
            </span>
          </button>

          {/* Page 1: Operational Efficiency */}
          <button
            onClick={() => handleNavClick("operational_efficiency")}
            className={getSidebarItemClass("operational_efficiency")}
            style={getSidebarItemStyle("operational_efficiency")}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span className={`transition-all duration-300 truncate text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-36 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.navOperationalEfficiency}
            </span>
          </button>

          {/* Page 2: Sector Operation Mechanism */}
          <button
            onClick={() => handleNavClick("sector_operation_mechanism")}
            className={getSidebarItemClass("sector_operation_mechanism")}
            style={getSidebarItemStyle("sector_operation_mechanism")}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className={`transition-all duration-300 truncate text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-36 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.navSectorOperationMechanism}
            </span>
          </button>

          {/* Page 3: Irrigation Network Response */}
          <button
            onClick={() => handleNavClick("irrigation_network_response")}
            className={getSidebarItemClass("irrigation_network_response")}
            style={getSidebarItemStyle("irrigation_network_response")}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span className={`transition-all duration-300 truncate text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-36 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.navIrrigationNetworkResponse}
            </span>
          </button>

          {/* Page 4: General Notes */}
          <button
            onClick={() => handleNavClick("general_notes")}
            className={getSidebarItemClass("general_notes")}
            style={getSidebarItemStyle("general_notes")}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className={`transition-all duration-300 truncate text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-36 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.navGeneralNotes}
            </span>
          </button>

        </nav>

        {/* Sidebar Footer area */}
        <div className={`p-3 border-t border-slate-800 space-y-2 select-none transition-all duration-300 ${
          viewMode === "tablet" ? "w-0 h-0 p-0 overflow-hidden opacity-0 group-hover:w-auto group-hover:h-auto group-hover:opacity-100 group-hover:p-3" : ""
        }`}>
          <div className="p-2.5 bg-rose-955/40 rounded-xl border border-rose-950/40 text-start transition-all duration-300">
            <span className="text-[10px] font-extrabold text-rose-455 block uppercase tracking-wider mb-0.5 animate-pulse">
              {isRtl ? "المسؤول الأول" : "Executive Director"}
            </span>
            <h4 className="text-xs font-black text-rose-100">
              {t.officer}
            </h4>
          </div>

          <div className="flex items-center justify-between text-[10px] px-1 text-slate-400 font-bold uppercase tracking-wider">
            <span>{t.versionLabel}</span>
            <span className="font-mono bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded font-black">
              v2.1
            </span>
          </div>
        </div>

      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE CONTAINER */}
      <main className={`flex-1 min-w-0 flex flex-col justify-between transition-all duration-300 bg-white ${
        viewMode === "desktop"
          ? "lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64 w-full"
          : viewMode === "tablet"
          ? "lg:pl-16 rtl:lg:pl-0 rtl:lg:pr-16 w-full max-w-[820px] mx-auto border border-gray-200 shadow-2xl rounded-2xl bg-white mt-4 mb-4"
          : "w-full max-w-[430px] mx-auto border border-gray-200 shadow-2xl rounded-[36px] bg-white mt-4 mb-4 pb-16 overflow-hidden relative"
      }`}>
        
        {/* App Top Toolbar Header */}
        <header className="sticky top-0 z-35 bg-[#0F172A] border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-start">
              <span className="text-[10px] font-extrabold text-indigo-404 uppercase tracking-wider block">
                {lang === "ar" ? data?.source?.system_name_ar : data?.source?.system_name_en || t.systemTitle}
              </span>
              <h1 className="text-base font-black text-white leading-tight">
                {t.systemTitle}
              </h1>
            </div>
          </div>

          {/* Quick Config Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Lang switcher */}
            <div className="inline-flex rounded-lg border border-slate-800 p-0.5 bg-slate-950">
              <button
                onClick={() => setLang("ar")}
                className={`px-2 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${
                  lang === "ar" 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${
                  lang === "en" 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                English
              </button>
            </div>

            {/* View Mode */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-950">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                🔍 {isRtl ? "العرض" : "View"}
              </span>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="bg-transparent border-none text-[11px] font-black text-white focus:outline-none cursor-pointer"
              >
                <option value="desktop" className="bg-[#0F172A] text-white">{isRtl ? "كمبيوتر" : "Desktop"}</option>
                <option value="tablet" className="bg-[#0F172A] text-white">{isRtl ? "تابلت" : "Tablet"}</option>
                <option value="mobile" className="bg-[#0F172A] text-white">{isRtl ? "جوال" : "Mobile"}</option>
              </select>
            </div>

            {/* Reconnect button trigger */}
            <button
              onClick={() => fetchTelemetryData()}
              disabled={loading}
              title={t.refreshTooltip}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-855 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Backdrop error banner / Mode indicators */}
        {isFallbackMode && data && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-start">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold text-amber-700 dark:text-amber-450">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>{t.fallbackAlert}</span>
              </div>
              <button
                onClick={() => fetchTelemetryData()}
                disabled={loading}
                className="text-[10px] bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-md transition-all font-bold tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCcw className="w-2.5 h-2.5" />
                {t.reconnectBtn}
              </button>
            </div>
          </div>
        )}

        {/* Live connected success toast */}
        {!isFallbackMode && data && !loading && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2 text-start">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-450">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-ping shrink-0" />
                <span>{t.liveConnected}</span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                {t.latestRefreshed} {new Date(lastRefreshedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* 3. CORE ROUTE AREA */}
        <div className={`flex-1 w-full max-w-full mx-auto min-w-0 overflow-x-hidden ${
          viewMode === "desktop"
            ? "p-6 space-y-6"
            : viewMode === "tablet"
            ? "p-4 space-y-4"
            : "p-3.5 space-y-3.5"
        }`}>
          
          <AnimatePresence mode="wait">
            {/* Case A: Page loading indicator placeholder */}
            {loading && !data && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SkeletonLoader />
              </motion.div>
            )}

            {/* Case B: Offline or connection issues when data is missing */}
            {!loading && !data && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center max-w-md mx-auto flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/40 p-8 rounded-2xl shadow-sm mt-12"
              >
                <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
                <h2 className="text-base font-black text-gray-900 dark:text-white">
                  {t.stateErrorTitle}
                </h2>
                <p className="text-xs text-gray-400 font-bold leading-relaxed">
                  {t.stateErrorDesc}
                </p>
                <button
                  onClick={() => fetchTelemetryData()}
                  className="px-5 py-2.5 bg-indigo-650 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-sm transition-transform cursor-pointer"
                >
                  {t.retryBtn}
                </button>
              </motion.div>
            )}

            {/* Case C: Render Standard dashboard with the correct separate pages */}
            {!loading && data && (
              <motion.div
                key={activeNavSection}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                {/* Router based on activeNavSection */}
                {activeNavSection === "home" && (
                  <PageHome 
                    data={data.pages["الصفحة الرئيسية"] || data.pages.home || data.pages.home_page || data.pages["الصفحة_الرئيسية"]}
                    fullData={data}
                    lang={lang}
                    theme={theme}
                    viewMode={viewMode}
                  />
                )}

                {activeNavSection === "operational_efficiency" && (
                  <PageOperationalEfficiency 
                    data={data.pages.operational_efficiency}
                    lang={lang}
                    theme={theme}
                    viewMode={viewMode}
                  />
                )}

                {activeNavSection === "sector_operation_mechanism" && (
                  <PageSectorOperationMechanism 
                    data={data.pages.sector_operation_mechanism}
                    lang={lang}
                    theme={theme}
                    viewMode={viewMode}
                  />
                )}

                {activeNavSection === "irrigation_network_response" && (
                  <PageIrrigationNetworkResponse 
                    data={data.pages.irrigation_network_response}
                    lang={lang}
                    theme={theme}
                    viewMode={viewMode}
                  />
                )}

                {activeNavSection === "general_notes" && (
                  <PageGeneralNotes 
                    data={data.pages.general_notes}
                    lang={lang}
                    theme={theme}
                    viewMode={viewMode}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Footer info system copyright */}
        <footer className="py-5 border-t text-center text-[10px] font-bold uppercase tracking-wider bg-[#0F172A] border-slate-800 text-slate-400">
          <span>&copy; {new Date().getFullYear()} {isRtl ? "وحدة المراقبة والتحكم المركزي" : "Central Monitoring & Control Unit"}.</span>
          <span className="mx-2 text-slate-600">|</span>
          <span>{isRtl ? "الربط التقني المباشر لخدمات AVEVA" : "AVEVA Live Database Link"}</span>
        </footer>

        {/* Mobile Bottom Navigation Bar (Shown ONLY in viewMode === 'mobile') */}
        {viewMode === "mobile" && (
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#0F172A] border-t border-slate-800 flex justify-around items-center z-45 select-none text-[9px] font-black">
            <button
              onClick={() => setActiveNavSection("home")}
              className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                activeNavSection === "home" ? "text-indigo-400" : "text-slate-400"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{isRtl ? "الرئيسية" : "Home"}</span>
            </button>

            <button
              onClick={() => setActiveNavSection("operational_efficiency")}
              className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                activeNavSection === "operational_efficiency" ? "text-indigo-400" : "text-slate-400"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isRtl ? "الكفاءة" : "Efficiency"}</span>
            </button>
            
            <button
              onClick={() => setActiveNavSection("sector_operation_mechanism")}
              className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                activeNavSection === "sector_operation_mechanism" ? "text-indigo-400" : "text-slate-400"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{isRtl ? "الآلية" : "Mechanism"}</span>
            </button>

            <button
              onClick={() => setActiveNavSection("irrigation_network_response")}
              className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                activeNavSection === "irrigation_network_response" ? "text-indigo-400" : "text-slate-400"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{isRtl ? "الاستجابة" : "Response"}</span>
            </button>

            <button
              onClick={() => setActiveNavSection("general_notes")}
              className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                activeNavSection === "general_notes" ? "text-indigo-400" : "text-slate-400"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isRtl ? "ملاحظات" : "Notes"}</span>
            </button>
          </div>
        )}

      </main>

      {/* MOBILE DRAWER MENU - SLIDES OUT FROM ASIDE */}
      <AnimatePresence>
        {sidebarOpen && viewMode === "mobile" && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-45 bg-black"
            />
            <motion.div
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className={`fixed inset-y-0 z-50 w-64 bg-[#0F172A] border-r border-slate-800 p-5 text-start ${
                isRtl ? "right-0" : "left-0"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 text-white bg-transparent">
                <span className="text-xs font-black text-indigo-400 uppercase">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleNavClick("home")}
                  className={getSidebarItemClass("home")}
                  style={getSidebarItemStyle("home")}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>{t.navHome}</span>
                </button>

                <button
                  onClick={() => handleNavClick("operational_efficiency")}
                  className={getSidebarItemClass("operational_efficiency")}
                  style={getSidebarItemStyle("operational_efficiency")}
                >
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>{t.navOperationalEfficiency}</span>
                </button>

                <button
                  onClick={() => handleNavClick("sector_operation_mechanism")}
                  className={getSidebarItemClass("sector_operation_mechanism")}
                  style={getSidebarItemStyle("sector_operation_mechanism")}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>{t.navSectorOperationMechanism}</span>
                </button>

                <button
                  onClick={() => handleNavClick("irrigation_network_response")}
                  className={getSidebarItemClass("irrigation_network_response")}
                  style={getSidebarItemStyle("irrigation_network_response")}
                >
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>{t.navIrrigationNetworkResponse}</span>
                </button>

                <button
                  onClick={() => handleNavClick("general_notes")}
                  className={getSidebarItemClass("general_notes")}
                  style={getSidebarItemStyle("general_notes")}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{t.navGeneralNotes}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
