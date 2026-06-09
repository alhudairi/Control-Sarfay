import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sun, 
  Moon, 
  Globe, 
  RefreshCcw, 
  Menu, 
  X, 
  Activity, 
  AlertTriangle,
  Building2,
  WifiOff,
  Briefcase,
  CheckCircle2
} from "lucide-react";
import { ApiResponse } from "./types";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { MetricCard } from "./components/MetricCard";
import { Charts } from "./components/Charts";
import { AlertsPanel } from "./components/AlertsPanel";
import { MajorIssuesTable } from "./components/MajorIssuesTable";
import { ZonesTable } from "./components/ZonesTable";
import { StabilityCenter } from "./components/StabilityCenter";
import { FALLBACK_TELEMETRY_DATA } from "./data/fallbackData";

// API data URL
const DATA_URL = "https://script.google.com/macros/s/AKfycbx9k0eezA-FQfydnJK--Oy7HegOkJ81NX9o_U2BE4ObcBPgCDxal_OOyo-bRbfQfczNOw/exec";

export default function App() {
  // Locale & Theme configuration states
  const [lang, setLang] = useState<"ar" | "en">(() => {
    const saved = localStorage.getItem("preferred_lang");
    return (saved === "ar" || saved === "en") ? saved : "ar";
  });
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("preferred_theme");
    return (saved === "light" || saved === "dark") ? saved : "light";
  });

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core telemetry data states
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  // KPI card selection filter for Zones detail table
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);

  // Active navigation section (Operational Status / Issues & Challenges)
  const [activeNavSection, setActiveNavSection] = useState<"operational" | "issues" | "stability">("operational");

  // View mode simulation selection ("desktop" | "tablet" | "mobile")
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const kpiGridClass = 
    viewMode === "desktop"
      ? "grid grid-cols-4 gap-6"
      : viewMode === "tablet"
      ? "grid grid-cols-2 gap-[18px]"
      : "grid grid-cols-1 gap-[14px]";

  // Format direction and body classes globally on changes
  useEffect(() => {
    localStorage.setItem("preferred_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("preferred_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Core API loader callback
  const fetchTelemetryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const json: ApiResponse = await response.json();
      if (json && json.success) {
        setData(json);
        setIsFallbackMode(false);
        setLastRefreshedAt(new Date());
      } else {
        throw new Error("Invalid response or unsuccessful status");
      }
    } catch (err: any) {
      console.warn("Failed to fetch fresh data, activating resilient local fallback mode:", err);
      // Fallback gracefully to pre-packaged active telemetry data
      setData(FALLBACK_TELEMETRY_DATA);
      setIsFallbackMode(true);
      setError(null); // Clear error to allow standard dashboard to render fully
      setLastRefreshedAt(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up 60 seconds interval scheduler
  useEffect(() => {
    fetchTelemetryData();
    const interval = setInterval(() => {
      fetchTelemetryData();
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [fetchTelemetryData]);

  // Translations object
  const isRtl = lang === "ar";
  const t = {
    systemTitle: isRtl ? "وحدة المراقبة والتحكم المركزي" : "Central Monitoring & Control Unit",
    officer: isRtl ? "عبدالرحمن الحضيري" : "Abdulrahman Alhudairi",
    versionLabel: isRtl ? "نسخة تجريبية" : "Prototype Version",
    sectionOperational: isRtl ? "كفاءة نظام التشغيل" : "Operating System Efficiency",
    sectionIssues: isRtl ? "ملاحظات عامة" : "General Notes",
    sectionStability: isRtl ? "قسم مراقبة الأنظمة التشغيلية" : "Operational Systems Stability Center",
    statusText: isRtl ? "حالة النظام العامة:" : "Global System Status:",
    lastUpdatedLabel: isRtl ? "آخر تحديث للنظام:" : "Last Telemetry Update:",
    lastDataEntryLabel: isRtl ? "تاريخ آخر إدخال:" : "Latest Data Entry:",
    lastDataDayLabel: isRtl ? "يوم آخر إدخال:" : "Data Entry Day:",
    refreshButton: isRtl ? "تحديث" : "Refresh",
    refreshTooltip: isRtl ? "تحديث فوري للبيانات" : "Refresh Telemetry Data Now",
    daysMap: {
      "الاثنين": isRtl ? "الاثنين" : "Monday",
      "الثلاثاء": isRtl ? "الثلاثاء" : "Tuesday",
      "الأربعاء": isRtl ? "الأربعاء" : "Wednesday",
      "الخميس": isRtl ? "الخميس" : "Thursday",
      "الجمعة": isRtl ? "الجمعة" : "Friday",
      "السبت": isRtl ? "السبت" : "Saturday",
      "الأحد": isRtl ? "الأحد" : "Sunday",
    } as Record<string, string>,
    stateErrorTitle: isRtl ? "خطأ في جلب البيانات الحية" : "Live Feed Connection Error",
    stateErrorDesc: isRtl ? "حدث خطأ غير متوقع أثناء الاتصال بوحدة البيانات المركزية. يرجى مراجعة الشبكة والمحاولة مرة أخرى." : "We found a temporal failure connecting to the central data stream. Verify your connection parameters.",
    retryBtn: isRtl ? "إعادة المحاولة" : "Retry Connection",
    operationalHeader: isRtl ? "مؤشرات المراقبة الفنية العامة للقطاعات" : "Global Technical Telemetry Indicators",
    operationalDesc: isRtl ? "مؤشرات وتحليلات تشغيلية متطورة توضح كفاءة العمل في مختلف القطاعات" : "Real-time key statistics tracking, control allocations, and zones integrity metrics",
    issuesHeader: isRtl ? "سجل الملاحظات العامة" : "General Notes Log",
    issuesDesc: isRtl ? "استعراض ومتابعة الملاحظات التشغيلية العامة والتنبيهات المذكورة في شيت الملاحظات" : "Review general notes, exceptions, and telemetry remarks from the active spreadsheet"
  };

  // Scroll to key page start when switching views/pages
  const handleNavClick = (section: 'operational' | 'issues' | 'stability') => {
    setActiveNavSection(section);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Connect Metric Card click with filtering rows
  const handleKpiClick = (type: string) => {
    if (activeKpiFilter === type) {
      setActiveKpiFilter(null); // click again to clear
    } else {
      setActiveKpiFilter(type);
      // Automatically scroll down to the table to show the filtered result!
      const tableElem = document.getElementById("zones-table-container");
      if (tableElem) {
        tableElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className={`min-h-screen text-gray-800 dark:text-gray-100 font-sans flex transition-colors duration-300 ${
      theme === "dark" ? "bg-gray-950" : "bg-gray-50/50"
    }`} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* 1. SIDEBAR (Desktop & Mobile Slideout Panel) */}
      <aside className={`fixed inset-y-0 z-40 border-r dark:border-l dark:border-r-0 border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-900 flex flex-col justify-between transition-all duration-300 ${
        viewMode === "desktop"
          ? "w-64 translate-x-0 lg:translate-x-0"
          : viewMode === "tablet"
          ? "w-16 hover:w-64 group overflow-hidden shadow-lg translate-x-0 lg:translate-x-0"
          : "hidden translate-x-full" /* Mobile view: completely hidden side panel, interactive via bottom nav */
      } ${
        isRtl 
          ? `right-0 ${sidebarOpen && viewMode !== "mobile" ? "translate-x-0" : (viewMode === "mobile" ? "translate-x-full" : "translate-x-full lg:translate-x-0")}` 
          : `left-0 ${sidebarOpen && viewMode !== "mobile" ? "translate-x-0" : (viewMode === "mobile" ? "-translate-x-full" : "-translate-x-full lg:translate-x-0")}`
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-4.5 border-b border-gray-150 dark:border-gray-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-650 dark:bg-indigo-600 rounded text-white shadow-xs shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className={`text-start transition-all duration-300 ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-36 group-hover:opacity-100 overflow-hidden" : ""
            }`}>
              <h2 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase leading-none">
                Control sarfay
              </h2>
              <span className="text-[10px] text-gray-400 font-semibold block truncate">
                AVEVA Telemetry
              </span>
            </div>
          </div>
          {/* Mobile close sidebar trigger */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Main Sections List */}
        <nav className="flex-1 p-3 space-y-2 text-start">
          
          {/* Section 1: Operational Status */}
          <button
            onClick={() => handleNavClick("operational")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
              activeNavSection === "operational"
                ? "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 border-l-[3.5px] rtl:border-l-0 rtl:border-r-[3.5px] border-indigo-600"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-850"
            }`}
          >
            <Activity className="w-4 h-4 shrink-0 text-slate-500" />
            <span className={`transition-all duration-300 text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-32 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.sectionOperational}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 transition-all duration-300 ${
              viewMode === "tablet" ? "w-0 h-0 p-0 opacity-0 group-hover:w-auto group-hover:h-auto group-hover:p-1 group-hover:px-2 group-hover:opacity-100 overflow-hidden" : "shrink-0"
            }`}>
              01
            </span>
          </button>

          {/* Section 2: Issues & Challenges */}
          <button
            onClick={() => handleNavClick("issues")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
              activeNavSection === "issues"
                ? "bg-red-50 text-red-700 dark:bg-red-950/25 dark:text-red-300 border-l-[3.5px] rtl:border-l-0 rtl:border-r-[3.5px] border-red-500"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-850"
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-500" />
            <span className={`transition-all duration-300 text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-32 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.sectionIssues}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-150 dark:bg-gray-800 text-gray-500 transition-all duration-300 ${
              viewMode === "tablet" ? "w-0 h-0 p-0 opacity-0 group-hover:w-auto group-hover:h-auto group-hover:p-1 group-hover:px-2 group-hover:opacity-100 overflow-hidden" : "shrink-0"
            }`}>
              02
            </span>
          </button>

          {/* Section 3: Stability Center */}
          <button
            onClick={() => handleNavClick("stability")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
              activeNavSection === "stability"
                ? "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 border-l-[3.5px] rtl:border-l-0 rtl:border-r-[3.5px] border-indigo-650"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-850"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-500" />
            <span className={`transition-all duration-300 text-start truncate ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-32 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.sectionStability}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-150 dark:bg-gray-800 text-gray-500 transition-all duration-300 ${
              viewMode === "tablet" ? "w-0 h-0 p-0 opacity-0 group-hover:w-auto group-hover:h-auto group-hover:p-1 group-hover:px-2 group-hover:opacity-100 overflow-hidden" : "shrink-0"
            }`}>
              03
            </span>
          </button>
        </nav>

        {/* Sidebar Footer Area (Abdulrahman Alhudairi & Prototype Label ONLY) */}
        <div className={`p-3 border-t border-gray-150 dark:border-gray-850 space-y-2 select-none transition-all duration-300 ${
          viewMode === "tablet" ? "w-0 h-0 p-0 overflow-hidden opacity-0 group-hover:w-auto group-hover:h-auto group-hover:opacity-100 group-hover:p-3" : ""
        }`}>
          <div className="p-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-850 text-start">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">
              {isRtl ? "المسؤول التنفيذي" : "Executive Lead"}
            </span>
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t.officer}
            </h4>
          </div>

          <div className="flex items-center justify-between text-[10px] px-1 text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
            <span>{t.versionLabel}</span>
            <span className="font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">
              v1.0.0
            </span>
          </div>
        </div>

      </aside>

      {/* BACKDROP FOR MOBILE SIDEBAR ACTIVE STATE */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. PRIMARY MAIN CONTENT DRIVER (Compensated for sidebar space) */}
      <main className={`flex-1 min-w-0 flex flex-col justify-between transition-all duration-300 ${
        viewMode === "desktop"
          ? "lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64 w-full"
          : viewMode === "tablet"
          ? "lg:pl-16 rtl:lg:pl-0 rtl:lg:pr-16 w-full max-w-[800px] mx-auto border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl bg-white dark:bg-gray-950 mt-4 mb-4"
          : "w-full max-w-[430px] mx-auto border border-gray-200 dark:border-gray-800 shadow-2xl rounded-[36px] bg-white dark:bg-gray-950 mt-4 mb-4 pb-16 overflow-hidden relative"
      }`}>
        
        {/* Dynamic Navigation Header Segment */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 dark:bg-gray-955/70 border-b border-gray-200 dark:border-gray-850 px-6 py-4.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Sidebar toggle and system state text title */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <div className="text-start">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block leading-none mb-1">
                  {t.systemTitle}
                </span>
                <h1 className="text-[15px] sm:text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight">
                  {lang === "ar" ? data?.source?.system_name_ar : data?.source?.system_name_en || t.systemTitle}
                </h1>
              </div>
            </div>

            {/* Quick action triggers (Language - Mode - Sync Actions) */}
            <div className="flex items-center gap-2">
              
              {/* Language toggle Arabic btn and English btn */}
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 p-0.5 bg-gray-50 dark:bg-gray-950">
                <button
                  onClick={() => setLang("ar")}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    lang === "ar" 
                      ? "bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-300 shadow-2xs" 
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    lang === "en" 
                      ? "bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-300 shadow-2xs" 
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Theme toggle segment (Dark and Light btns) */}
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 p-0.5 bg-gray-50 dark:bg-gray-950">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    theme === "light" 
                      ? "bg-white text-yellow-500 shadow-2xs" 
                      : "text-gray-500 hover:text-gray-200"
                  }`}
                  title={isRtl ? "الوضع المضيء" : "Light Mode"}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    theme === "dark" 
                      ? "bg-gray-800 text-indigo-300 shadow-2xs" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title={isRtl ? "الوضع الداكن" : "Dark Mode"}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* View Mode simulation toggler dropdown select */}
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <span className="text-[10px] font-extrabold text-gray-450 dark:text-gray-500 shrink-0 select-none">
                  🔍 {isRtl ? "العرض" : "View"}
                </span>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as any)}
                  className="bg-transparent border-none text-[11px] font-bold text-indigo-660 dark:text-indigo-350 focus:outline-none cursor-pointer p-0.5"
                >
                  <option value="desktop" className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50">{isRtl ? "كمبيوتر" : "Desktop"}</option>
                  <option value="tablet" className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50">{isRtl ? "تابلت" : "Tablet"}</option>
                  <option value="mobile" className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50">{isRtl ? "جوال" : "Mobile"}</option>
                </select>
              </div>

              {/* Live manual refresh action trigger button */}
              <button
                onClick={fetchTelemetryData}
                disabled={loading}
                title={t.refreshTooltip}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-300 disabled:opacity-40 transition-all cursor-pointer"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>

            </div>

          </div>
        </header>

        {isFallbackMode && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 dark:bg-amber-950/20 border-b border-amber-500/20 px-6 py-2.5 text-start"
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>
                  {isRtl 
                    ? "نمط التشغيل الاحتياطي: لم نتمكن من الوصول لبث البيانات المباشر، تم تحميل سجل القياسات المخزن مؤقتاً." 
                    : "Backup Telemetry Mode: Unable to establish live stream link; active snapshot loaded."}
                </span>
              </div>
              <button
                onClick={fetchTelemetryData}
                disabled={loading}
                className="text-[10px] bg-amber-500/15 dark:bg-amber-500/20 hover:bg-amber-500/25 px-2.5 py-1 rounded-md transition-all font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCcw className={`w-2.5 h-2.5 ${loading ? "animate-spin" : ""}`} />
                {isRtl ? "تحديث التوصيل" : "Reconnect Feed"}
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. CORE DISPLAY CAROUSEL OR LOADING/FALLBACK SCENARIOS */}
        <div className={`flex-1 w-full max-w-7xl mx-auto min-w-0 overflow-x-hidden ${
          viewMode === "desktop"
            ? "p-6 space-y-6"
            : viewMode === "tablet"
            ? "p-[18px] space-y-[18px]"
            : "p-3 space-y-3.5"
        }`}>
          
          <AnimatePresence mode="wait">
            
            {/* Scenario A: Full page Loading indicator with clean skeletal structures */}
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

            {/* Scenario B: Error handling stream panel with manual reconnector */}
            {!loading && error && !data && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/30 p-8 rounded-2xl shadow-sm mt-12"
              >
                <div className="p-3 bg-red-100 rounded-full text-red-650 animate-bounce">
                  <WifiOff className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t.stateErrorTitle}
                </h2>
                <p className="text-xs text-gray-550 dark:text-gray-450 leading-relaxed">
                  {t.stateErrorDesc}
                </p>
                <code className="text-[10px] font-mono bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 p-2 rounded-md">
                  Error Code: {error}
                </code>
                <button
                  onClick={fetchTelemetryData}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  {t.retryBtn}
                </button>
              </motion.div>
            )}

            {/* Scenario C: Standard Dashboard Data Presentation Layout */}
            {!loading && data && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 w-full block"
              >
                
                {/* A: Header Metadata Area */}
                <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-250 dark:border-gray-850 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-xs">
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold">{t.statusText}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/25 text-amber-955 dark:text-amber-300 font-bold">
                        {isRtl ? data.summary.overall_status_ar : data.summary.overall_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-gray-450">{t.lastUpdatedLabel}</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">
                        {data.last_updated_ar}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:border-l lg:rtl:border-l-0 lg:rtl:border-r dark:border-gray-805 lg:pl-4 lg:rtl:pl-0 lg:rtl:pr-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-450">{t.lastDataEntryLabel}</span>
                      <span className="font-mono bg-gray-100 dark:bg-gray-850 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-bold">
                        {data.last_data_entry?.date || "-"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-gray-450">{t.lastDataDayLabel}</span>
                      <span className="font-semibold text-indigo-650 dark:text-indigo-400 font-mono">
                        {data.last_data_entry?.day_ar ? (t.daysMap[data.last_data_entry.day_ar] || data.last_data_entry.day_ar) : "-"}
                      </span>
                    </div>
                  </div>

                </div>

                {/* B: Conditional Router for independent pages based on activeNavSection */}
                {activeNavSection === "operational" && (
                  /* B1: Operational Status Section */
                  <section id="section-operational" className="space-y-6 pt-4">
                    <div className="text-start">
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white border-l-4 border-indigo-600 pl-2 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-2 leading-none">
                        {t.sectionOperational}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <p className="text-xs text-gray-550 font-medium">
                          {t.operationalDesc}
                        </p>
                        <span className="text-xs text-gray-305 dark:text-gray-700 hidden sm:inline">|</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 animate-pulse" />
                          {isRtl ? "الورقة المخصصة:" : "Dedicated Sheet:"} {data.source.main_sheet_name}
                        </span>
                      </div>
                    </div>

                    {/* KPI calculations for Dual and Legacy Systems */}
                    {(() => {
                      const totalZonesCount = data.summary.total_zones || data.rows.length || 0;

                      // compute legacy system count as requested
                      const legacySystemCount = (data.summary as any).legacy_system_count !== undefined
                        ? (data.summary as any).legacy_system_count
                        : data.rows.filter(r => 
                            (r.control_value || "").toLowerCase() === "legacy system" || 
                            (r.control_value || "").toLowerCase() === "traditional system" ||
                            (r.control_type_ar || "").includes("تشغيل عبر النظام التقليدي") ||
                            (r.control_type_ar || "").includes("تشغيل عبر النظام القديم") ||
                            (r.control_type_ar || "").includes("تقليدي")
                          ).length;

                      const legacyRatePercent = totalZonesCount > 0
                        ? Math.round((legacySystemCount / totalZonesCount) * 100)
                        : 0;

                      // compute dual count
                      const dualCount = data.summary.dual_count !== undefined
                        ? data.summary.dual_count
                        : data.rows.filter(r => 
                            (r.control_value || "").toLowerCase().includes("dual") || 
                            (r.control_type_ar || "").includes("مزدوج")
                          ).length;

                      const dualRatePercent = totalZonesCount > 0
                        ? Math.round((dualCount / totalZonesCount) * 100)
                        : 0;

                      // compute fluctuating percent (optional, for complete premium data)
                      const fluctuatingPercent = totalZonesCount > 0
                        ? Math.round((data.summary.fluctuating_zones / totalZonesCount) * 100)
                        : undefined;

                      return (
                        <div className={`w-full ${
                          viewMode === "desktop"
                            ? "space-y-6"
                            : viewMode === "tablet"
                            ? "space-y-[18px]"
                            : "space-y-3.5"
                        }`}>
                          {/* Row 1: Status & Scale Indicators */}
                          <div className={kpiGridClass}>
                            <MetricCard 
                              title={isRtl ? "إجمالي القطاعات" : "Total Zones"}
                              value={data.summary.total_zones}
                              type="total"
                              isActive={activeKpiFilter === "total"}
                              onClick={() => handleKpiClick("total")}
                              lang={lang}
                              theme={theme}
                            />
                            <MetricCard 
                              title={isRtl ? "القطاعات المستقرة" : "Stable Zones"}
                              value={data.summary.stable_zones}
                              percentage={data.summary.stable_rate_percent}
                              color="#22C55E"
                              type="success"
                              isActive={activeKpiFilter === "stable"}
                              onClick={() => handleKpiClick("stable")}
                              lang={lang}
                              theme={theme}
                            />
                            <MetricCard 
                              title={isRtl ? "القطاعات المتذبذبة" : "Fluctuating Zones"}
                              value={data.summary.fluctuating_zones}
                              percentage={fluctuatingPercent}
                              color="#F59E0B"
                              type="warning"
                              isActive={activeKpiFilter === "fluctuating"}
                              onClick={() => handleKpiClick("fluctuating")}
                              lang={lang}
                              theme={theme}
                            />
                            <MetricCard 
                              title={isRtl ? "القطاعات خارج الخدمة" : "Out of Service"}
                              value={data.summary.out_of_service_zones}
                              percentage={data.summary.out_of_service_rate_percent}
                              color="#EF4444"
                              type="danger"
                              isActive={activeKpiFilter === "out_of_service"}
                              onClick={() => handleKpiClick("out_of_service")}
                              lang={lang}
                              theme={theme}
                            />
                          </div>

                          {/* Row 2: Control Mode Allocations */}
                          <div className={kpiGridClass}>
                            <MetricCard 
                              title={isRtl ? "تشغيل محلي فقط" : "Local Only"}
                              value={data.summary.local_only_count}
                              percentage={data.summary.local_rate_percent}
                              color="#F59E0B"
                              type="local"
                              isActive={activeKpiFilter === "local_only"}
                              onClick={() => handleKpiClick("local_only")}
                              lang={lang}
                              theme={theme}
                            />
                            <MetricCard 
                              title={isRtl ? "تشغيل مركزي فقط" : "Central Only"}
                              value={data.summary.central_only_count}
                              percentage={data.summary.central_rate_percent}
                              color="#3B82F6"
                              type="central"
                              isActive={activeKpiFilter === "central_only"}
                              onClick={() => handleKpiClick("central_only")}
                              lang={lang}
                              theme={theme}
                            />
                            <MetricCard 
                              title={isRtl ? "تشغيل مزدوج" : "Dual Mode"}
                              value={dualCount}
                              percentage={dualRatePercent}
                              color="#22C55E"
                              type="dual"
                              isActive={activeKpiFilter === "dual"}
                              onClick={() => handleKpiClick("dual")}
                              lang={lang}
                              theme={theme}
                            />
                            <MetricCard 
                              title={isRtl ? "تشغيل عبر النظام القديم" : "Legacy System"}
                              value={legacySystemCount}
                              percentage={legacyRatePercent}
                              color="#64748B"
                              type="legacy_system"
                              isActive={activeKpiFilter === "legacy_system"}
                              onClick={() => handleKpiClick("legacy_system")}
                              lang={lang}
                              theme={theme}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2. Charts Allocation Grid */}
                    <Charts 
                      statusDistribution={data.chart_data.status_distribution}
                      controlDistribution={data.chart_data.control_distribution}
                      zonesHealth={data.chart_data.zones_health}
                      lang={lang}
                      theme={theme}
                      rows={data.rows}
                      alerts={data.alerts}
                      majorIssues={data.major_issues}
                      viewMode={viewMode}
                    />

                    {/* 3. Interactive Primary Zones Detail Table */}
                    <div id="zones-table-container">
                      <ZonesTable 
                        rows={data.rows}
                        lang={lang}
                        activeKpiFilter={activeKpiFilter}
                        onClearKpiFilter={() => setActiveKpiFilter(null)}
                        viewMode={viewMode}
                        theme={theme}
                      />
                    </div>
                  </section>
                )}

                {activeNavSection === "issues" && (
                  /* B2: Issues & Challenges Section */
                  <section id="section-issues" className="space-y-6 pt-4">
                    <div className="text-start">
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white border-l-4 border-rose-500 pl-2 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-2 leading-none">
                        {t.sectionIssues}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <p className="text-xs text-gray-550 font-medium">
                          {t.issuesDesc}
                        </p>
                        <span className="text-xs text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {isRtl ? "الورقة المخصصة:" : "Dedicated Sheet:"} {data.source.issues_sheet_name}
                        </span>
                      </div>
                    </div>

                    {/* Major Issues Log Table Component */}
                    <MajorIssuesTable 
                      lang={lang}
                      theme={theme}
                    />

                    {/* Alerts Container Alerts Panel */}
                    <AlertsPanel 
                      alerts={data.alerts}
                      lang={lang}
                      viewMode={viewMode}
                    />
                  </section>
                )}

                {activeNavSection === "stability" && (
                  /* B3: Operational Systems Stability Center Section */
                  <section id="section-stability" className="pt-4">
                    <StabilityCenter 
                      zonesHealth={data.chart_data.zones_health}
                      rows={data.rows}
                      alerts={data.alerts}
                      majorIssues={data.major_issues}
                      lang={lang}
                      theme={theme}
                      viewMode={viewMode}
                    />
                  </section>
                )}

              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* Footer info system copyright */}
        <footer className="py-6 border-t border-gray-200 dark:border-gray-850 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-white/30 dark:bg-gray-950/20">
          <span>&copy; {new Date().getFullYear()} {isRtl ? "وحدة المراقبة والتحكم المركزي" : "Central Monitoring & Control Unit"}.</span>
          <span className="mx-2">|</span>
          <span>{isRtl ? "تحليل البيانات المتقدمة وإحصائيات AVEVA" : "Advanced AV&V Data Transmission Log"}</span>
        </footer>

        {/* Mobile Bottom Navigation Bar (Shown ONLY in viewMode === 'mobile') */}
        {viewMode === "mobile" && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center z-45 select-none">
            <button
              onClick={() => setActiveNavSection("operational")}
              className={`flex flex-col items-center gap-1 py-1 px-4 cursor-pointer transition-all ${
                activeNavSection === "operational" 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-gray-450 dark:text-gray-500"
              }`}
            >
              <Activity className="w-4.5 h-4.5" />
              <span className="text-[10px] font-extrabold">{isRtl ? "كفاءة التشغيل" : "Operational"}</span>
            </button>
            
            <button
              onClick={() => setActiveNavSection("issues")}
              className={`flex flex-col items-center gap-1 py-1 px-4 cursor-pointer transition-all ${
                activeNavSection === "issues" 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-gray-450 dark:text-gray-500"
              }`}
            >
              <AlertTriangle className="w-4.5 h-4.5" />
              <span className="text-[10px] font-extrabold">{isRtl ? "ملاحظات عامة" : "General Notes"}</span>
            </button>

            <button
              onClick={() => setActiveNavSection("stability")}
              className={`flex flex-col items-center gap-1 py-1 px-4 cursor-pointer transition-all ${
                activeNavSection === "stability" 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-gray-450 dark:text-gray-500"
              }`}
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span className="text-[10px] font-extrabold">{isRtl ? "الاستقرار" : "Stability"}</span>
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
