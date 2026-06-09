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
const DATA_URL = "https://script.google.com/macros/s/AKfycbwoUMackMZ0b5WFdi5VfGtCM6kRh6HvTRhBrKRcxEiP5Mccj2NVvXKL0wnzW-iXcOnDow/exec";

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
  const [retryInterval, setRetryInterval] = useState<number>(60000);
  
  // KPI card selection filter for Zones detail table
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);

  // Active navigation section (Operational Status / Issues & Challenges)
  const [activeNavSection, setActiveNavSection] = useState<"operational" | "issues" | "stability">("operational");

  // View mode simulation selection ("desktop" | "tablet" | "mobile")
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const kpiGridClass = 
    viewMode === "desktop"
      ? "grid grid-cols-5 gap-4"
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
  const fetchTelemetryData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
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
        setError(null);
        setRetryInterval(60000); // success, reset standard interval to 60s
        
        // Print detailed verification metric reports in console log precisely as requested (Rule 16)
        console.log("-----------------------------------------");
        console.log("✔ API Connected Successfully - Dashboard Synchronized");
        console.log(`- Connection Timestamp: ${new Date().toLocaleTimeString()}`);
        console.log(`- System Last Update: ${json.last_updated_ar || json.last_updated}`);
        console.log(`- Received Telemetry Log Rows: ${json.rows ? json.rows.length : 0}`);
        console.log(`- Active Instant Alerts Count: ${json.alerts ? json.alerts.length : 0}`);
        console.log(`- General Notes List Summary: ${json.general_notes ? json.general_notes.length : 0}`);
        console.log(`- Critical Operational Issues Count: ${json.major_issues ? json.major_issues.length : 0}`);
        console.log("-----------------------------------------");
      } else {
        throw new Error("Invalid response status or empty API payload");
      }
    } catch (err: any) {
      console.error("API Connection failure occurred - Attempting retry in 30 seconds:", err);
      // DO NOT clear current data displays so they are preserved intact (Rule 6)
      setError(
        lang === "ar" 
          ? "فشل الاتصال بـ API الرئيسي للتحكم. سيتم المحاولة تلقائياً كل 30 ثانية..." 
          : "Failed to connect to the main control API. Auto-reconnection scheduled in 30 seconds..."
      );
      setRetryInterval(30000); // failure, trigger immediate 30s retry sequence
    } finally {
      setLoading(false);
    }
  }, [lang]);

  // Initialize data feed on viewport mount
  useEffect(() => {
    fetchTelemetryData();
  }, [fetchTelemetryData]);

  // Handle synchronized timing loops combining 60s/30s sequences nicely
  useEffect(() => {
    const timer = setInterval(() => {
      fetchTelemetryData(true); // silent refresh inside interval so dashboard doesn't flicker white templates
    }, retryInterval);
    return () => clearInterval(timer);
  }, [fetchTelemetryData, retryInterval]);

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
    if (type === "total") {
      setActiveKpiFilter(null);
      const tableElem = document.getElementById("zones-table-container");
      if (tableElem) {
        tableElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
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

  // Dynamic KPIs calculations from API row arrays (or falls back to summary)
  const rows = data?.rows || [];
  const totalCount = rows.length || (data?.summary?.total_zones) || 12;

  const stableCount = rows.length > 0 
    ? rows.filter(r => r.status_value?.toLowerCase() === "stable").length 
    : (data?.summary?.stable_zones || 0);

  const outOfServiceCount = rows.length > 0 
    ? rows.filter(r => r.status_value?.toLowerCase() === "out_of_service" || r.status_value?.toLowerCase().includes("out")).length 
    : (data?.summary?.out_of_service_zones || 0);

  const fluctuatingCount = rows.length > 0 
    ? rows.filter(r => r.status_value?.toLowerCase() === "fluctuating").length 
    : (data?.summary?.fluctuating_zones || 0);

  const localCount = rows.length > 0 
    ? rows.filter(r => (r.control_value || "").toLowerCase().includes("local")).length 
    : (data?.summary?.local_only_count || 0);

  const monitoringOnlyCount = rows.length > 0 
    ? rows.filter(r => {
        const val = (r.control_value || "").toLowerCase();
        return val.includes("monitoring only") || val === "monitoring_only";
      }).length 
    : 1;

  const monitoringControlCount = rows.length > 0 
    ? rows.filter(r => {
        const val = (r.control_value || "").toLowerCase();
        return val.includes("monitoring & control") || val.includes("monitoring and control") || val === "monitoring_control";
      }).length 
    : 4;

  const legacyCount = rows.length > 0 
    ? rows.filter(r => {
        const val = (r.control_value || "").toLowerCase();
        const ar = r.control_type_ar || "";
        return val.includes("legacy") || val.includes("traditional") || ar.includes("تقليدي") || ar.includes("النظام القديم");
      }).length 
    : 0;

  const majorIssuesCount = data?.major_issues ? data.major_issues.length : (data?.summary?.major_issues_count || 0);

  const row1Kpis = data ? [
    {
      title_ar: "إجمالي القطاعات",
      title_en: "Total Sectors",
      value: totalCount,
      type: "total"
    },
    {
      title_ar: "القطاعات المستقرة",
      title_en: "Stable Sectors",
      value: stableCount,
      percentage: totalCount > 0 ? Math.round((stableCount / totalCount) * 100) : 0,
      type: "stable"
    },
    {
      title_ar: "خارج الخدمة",
      title_en: "Out of Service",
      value: outOfServiceCount,
      percentage: totalCount > 0 ? Math.round((outOfServiceCount / totalCount) * 100) : 0,
      type: "out_of_service"
    },
    {
      title_ar: "القطاعات المتذبذبة",
      title_en: "Fluctuating Sectors",
      value: fluctuatingCount,
      percentage: totalCount > 0 ? Math.round((fluctuatingCount / totalCount) * 100) : 0,
      type: "fluctuating"
    }
  ] : [];

  const row2Kpis = data ? [
    {
      title_ar: "تشغيل محلي فقط",
      title_en: "Local Operation Only",
      value: localCount,
      percentage: totalCount > 0 ? Math.round((localCount / totalCount) * 100) : 0,
      type: "local_only"
    },
    {
      title_ar: "مراقبة فقط",
      title_en: "Monitoring Only",
      value: monitoringOnlyCount,
      percentage: totalCount > 0 ? Math.round((monitoringOnlyCount / totalCount) * 100) : 0,
      type: "monitoring_only"
    },
    {
      title_ar: "مراقبة وتحكم",
      title_en: "Monitoring & Control",
      value: monitoringControlCount,
      percentage: totalCount > 0 ? Math.round((monitoringControlCount / totalCount) * 100) : 0,
      type: "monitoring_control"
    },
    {
      title_ar: "تشغيل عبر النظام القديم",
      title_en: "Legacy System Operation",
      value: legacyCount,
      percentage: totalCount > 0 ? Math.round((legacyCount / totalCount) * 100) : 0,
      type: "legacy_system"
    },
    {
      title_ar: "الملاحظات العامة",
      title_en: "General Notes & Issues",
      value: majorIssuesCount,
      percentage: totalCount > 0 ? Math.round((majorIssuesCount / totalCount) * 100) : 0,
      type: "major_issues"
    }
  ] : [];

  const isTabletState = viewMode === "tablet";
  const isMobileState = viewMode === "mobile";

  const gridStyle1 = viewMode === "desktop"
    ? { gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }
    : undefined;

  const gridStyle2 = viewMode === "desktop"
    ? { gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }
    : undefined;

  const responsiveGrid1Class = isMobileState
    ? "grid grid-cols-1 gap-[18px]"
    : isTabletState
    ? "grid grid-cols-2 gap-[18px]"
    : "grid gap-[20px] w-full max-w-full";

  const responsiveGrid2Class = isMobileState
    ? "grid grid-cols-1 gap-[18px]"
    : isTabletState
    ? "grid grid-cols-2 gap-[18px]"
    : "grid gap-[20px] w-full max-w-full";

  return (
    <div className={`min-h-screen text-gray-800 dark:text-gray-100 font-sans flex transition-colors duration-300 ${
      theme === "dark" ? "bg-gray-950" : "bg-gray-50/50"
    }`} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* 1. SIDEBAR (Desktop & Mobile Slideout Panel) */}
      <aside className={`fixed inset-y-0 z-40 border-r dark:border-l dark:border-r-0 border-[#1E293B] bg-[#0F172A] flex flex-col justify-between transition-all duration-300 ${
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
        <div className="p-4.5 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-650 rounded text-[#F8FAFC] shadow-xs shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className={`text-start transition-all duration-300 ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-36 group-hover:opacity-100 overflow-hidden" : ""
            }`}>
              <h2 className="text-xs font-extrabold text-indigo-400 tracking-wider uppercase leading-none">
                Control sarfay
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold block truncate">
                AVEVA Telemetry
              </span>
            </div>
          </div>
          {/* Mobile close sidebar trigger */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-800 text-slate-400"
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
                ? "bg-[#1E293B] text-[#F8FAFC] border-l-[3.5px] rtl:border-l-0 rtl:border-r-[3.5px] border-indigo-500"
                : "text-slate-300 hover:bg-[#1E293B]/50"
            }`}
          >
            <Activity className="w-4 h-4 shrink-0 text-slate-400" />
            <span className={`transition-all duration-300 text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-32 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.sectionOperational}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] transition-all duration-300">
              01
            </span>
          </button>

          {/* Section 2: Issues & Challenges */}
          <button
            onClick={() => handleNavClick("issues")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
              activeNavSection === "issues"
                ? "bg-[#1E293B] text-[#F8FAFC] border-l-[3.5px] rtl:border-l-0 rtl:border-r-[3.5px] border-red-500"
                : "text-slate-300 hover:bg-[#1E293B]/50"
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-400" />
            <span className={`transition-all duration-300 text-start ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-32 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.sectionIssues}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] transition-all duration-300">
              02
            </span>
          </button>

          {/* Section 3: Stability Center */}
          <button
            onClick={() => handleNavClick("stability")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
              activeNavSection === "stability"
                ? "bg-[#1E293B] text-[#F8FAFC] border-l-[3.5px] rtl:border-l-0 rtl:border-r-[3.5px] border-indigo-500"
                : "text-slate-300 hover:bg-[#1E293B]/50"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
            <span className={`transition-all duration-300 text-start truncate ${
              viewMode === "tablet" ? "w-0 opacity-0 group-hover:w-32 group-hover:opacity-100 overflow-hidden" : "flex-1"
            }`}>
              {t.sectionStability}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] transition-all duration-300">
              03
            </span>
          </button>
        </nav>

        {/* Sidebar Footer Area (Abdulrahman Alhudairi & Prototype Label ONLY) */}
        <div className={`p-3 border-t border-[#1E293B] space-y-2 select-none transition-all duration-300 ${
          viewMode === "tablet" ? "w-0 h-0 p-0 overflow-hidden opacity-0 group-hover:w-auto group-hover:h-auto group-hover:opacity-100 group-hover:p-3" : ""
        }`}>
          <div className="p-2.5 bg-[#1E293B] rounded-xl border border-[#1E293B] text-start">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block leading-none mb-1">
              {isRtl ? "المسؤول التنفيذي" : "Executive Lead"}
            </span>
            <h4 className="text-xs font-bold text-[#F8FAFC]">
              {t.officer}
            </h4>
          </div>

          <div className="flex items-center justify-between text-[10px] px-1 text-slate-400 font-semibold uppercase tracking-wider">
            <span>{t.versionLabel}</span>
            <span className="font-mono bg-[#1E293B] text-indigo-400 px-1.5 py-0.5 rounded font-bold">
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
        <header className="sticky top-0 z-20 bg-[#0F172A] border-b border-[#1E293B] px-6 py-4.5 text-[#F8FAFC]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Sidebar toggle and system state text title */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-[#1E293B] text-[#F8FAFC] hover:bg-slate-800 cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <div className="text-start">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block leading-none mb-1">
                  {t.systemTitle}
                </span>
                <h1 className="text-[15px] sm:text-[17px] font-extrabold text-[#F8FAFC] leading-tight">
                  {lang === "ar" ? data?.source?.system_name_ar : data?.source?.system_name_en || t.systemTitle}
                </h1>
              </div>
            </div>

            {/* Quick action triggers (Language - Mode - Sync Actions) */}
            <div className="flex items-center gap-2">
              
              {/* Language toggle Arabic btn and English btn */}
              <div className="inline-flex rounded-lg border border-[#1E293B] p-0.5 bg-[#1E293B]">
                <button
                  onClick={() => setLang("ar")}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    lang === "ar" 
                      ? "bg-[#0F172A] text-[#F8FAFC] shadow-2xs" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    lang === "en" 
                      ? "bg-[#0F172A] text-[#F8FAFC] shadow-2xs" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Theme toggle segment (Dark and Light btns) */}
              <div className="inline-flex rounded-lg border border-[#1E293B] p-0.5 bg-[#1E293B]">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    theme === "light" 
                      ? "bg-[#0F172A] text-yellow-500 shadow-2xs" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={isRtl ? "الوضع المضيء" : "Light Mode"}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    theme === "dark" 
                      ? "bg-[#0F172A] text-indigo-300 shadow-2xs" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={isRtl ? "الوضع الداكن" : "Dark Mode"}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* View Mode simulation toggler dropdown select */}
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg border border-[#1E293B] bg-[#1E293B]">
                <span className="text-[10px] font-extrabold text-slate-400 shrink-0 select-none">
                  🔍 {isRtl ? "العرض" : "View"}
                </span>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as any)}
                  className="bg-transparent border-none text-[11px] font-bold text-[#F8FAFC] focus:outline-none cursor-pointer p-0.5"
                >
                  <option value="desktop" className="bg-[#0F172A] text-[#F8FAFC]">{isRtl ? "كمبيوتر" : "Desktop"}</option>
                  <option value="tablet" className="bg-[#0F172A] text-[#F8FAFC]">{isRtl ? "تابلت" : "Tablet"}</option>
                  <option value="mobile" className="bg-[#0F172A] text-[#F8FAFC]">{isRtl ? "جوال" : "Mobile"}</option>
                </select>
              </div>

              {/* Live manual refresh action trigger button */}
              <button
                onClick={fetchTelemetryData}
                disabled={loading}
                title={t.refreshTooltip}
                className="p-1.5 rounded-lg border border-[#1E293B] hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
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
            {data && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 w-full block"
              >
                
                {/* Connection Success / Live Status Banner (Rule 20) */}
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 font-black text-emerald-700 dark:text-emerald-450">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>API Connected Successfully</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-500 dark:text-slate-400 font-bold">
                    <span>
                      {isRtl ? "حالة الاتصال:" : "Connection Status:"} <span className="text-emerald-600 dark:text-emerald-450 uppercase">{isRtl ? "نشط ومباشر" : "Live & Synchronized"}</span>
                    </span>
                    <span>
                      {isRtl ? "السجلات التشغيلية:" : "Telemetry Records:"} <span className="text-slate-800 dark:text-slate-200">{data.rows?.length || 0}</span>
                    </span>
                    <span>
                      {isRtl ? "آخر تحديث:" : "Last Updated:"} <span className="text-indigo-650 dark:text-indigo-400 font-mono">{data.last_updated_ar}</span>
                    </span>
                  </div>
                </motion.div>

                {/* Sub-refresh warning indicator for connection loss while showing cache (Rule 6) */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

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



                    {/* KPI calculations split into two executive-styled rows */}
                    <div className="w-full space-y-6">
                      {/* Row 1: Core Sector Status Indicators */}
                      <div className="space-y-2 text-start">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                          {isRtl ? "المؤشرات الأساسية للقطاعات" : "Core Sector Indicators"}
                        </span>
                        <div 
                          className={responsiveGrid1Class}
                          style={gridStyle1}
                        >
                          {row1Kpis.map((kpi, idx) => (
                            <MetricCard 
                              key={`r1-${idx}`}
                              title={isRtl ? kpi.title_ar : kpi.title_en}
                              value={kpi.value}
                              percentage={kpi.percentage}
                              type={kpi.type}
                              isActive={activeKpiFilter === kpi.type}
                              onClick={() => handleKpiClick(kpi.type)}
                              lang={lang}
                              theme={theme}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Row 2: Control Mode & Operation Path Indicators */}
                      <div className="space-y-2 text-start pt-1">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                          {isRtl ? "مؤشرات وطرق التحكم ونوع التشغيل" : "Control Mode & Operation Pathway Indicators"}
                        </span>
                        <div 
                          className={responsiveGrid2Class}
                          style={gridStyle2}
                        >
                          {row2Kpis.map((kpi, idx) => (
                            <MetricCard 
                              key={`r2-${idx}`}
                              title={isRtl ? kpi.title_ar : kpi.title_en}
                              value={kpi.value}
                              percentage={kpi.percentage}
                              type={kpi.type}
                              isActive={activeKpiFilter === kpi.type}
                              onClick={() => handleKpiClick(kpi.type)}
                              lang={lang}
                              theme={theme}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

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
                      activeKpiFilter={activeKpiFilter}
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


                    {/* Major Issues Log Table Component */}
                    <MajorIssuesTable 
                      lang={lang}
                      theme={theme}
                      generalNotes={data.general_notes}
                      majorIssues={data.major_issues}
                      fluctuations={data.fluctuations}
                      alerts={data.alerts}
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
        <footer className="py-6 border-t text-center text-[10px] font-semibold uppercase tracking-wider bg-[#0F172A] border-[#1E293B] text-[#F8FAFC]">
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
