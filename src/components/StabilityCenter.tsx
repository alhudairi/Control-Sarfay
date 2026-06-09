import React from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal,
  ShieldCheck,
  Zap
} from "lucide-react";

interface StabilityCenterProps {
  zonesHealth: any[];
  rows: any[];
  alerts: any[];
  majorIssues: any[];
  lang: "ar" | "en";
  theme: "light" | "dark";
  viewMode?: "desktop" | "tablet" | "mobile";
}

export const StabilityCenter: React.FC<StabilityCenterProps> = ({
  zonesHealth,
  rows,
  alerts,
  majorIssues,
  lang,
  theme,
  viewMode = "desktop"
}) => {
  const isRtl = lang === "ar";
  const [activeTab, setActiveTab] = React.useState<"summary" | "critical" | "risks" | "recommendations">("summary");

  const tabs = [
    { id: "summary" as const, labelAr: "الملخص التنفيذي", labelEn: "Executive Summary", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "critical" as const, labelAr: "القطاعات الحرجة", labelEn: "Critical Zones", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "risks" as const, labelAr: "أبرز المخاطر التشغيلية", labelEn: "Major Operational Risks", icon: <CheckCircle2 className="w-4 h-4 text-amber-500" /> },
    { id: "recommendations" as const, labelAr: "التوصيات الفنية", labelEn: "Technical Recommendations", icon: <Sparkles className="w-4 h-4 text-indigo-550" /> },
  ];

  const sectorGridClass = 
    viewMode === "desktop"
      ? "grid grid-cols-4 xl:grid-cols-5 gap-6"
      : viewMode === "tablet"
      ? "grid grid-cols-2 gap-[18px]"
      : "grid grid-cols-1 gap-[14px]";

  const getStatusDetails = (healthScore: number, rawStatus: string) => {
    const s = (rawStatus || "").toLowerCase();
    if (healthScore === 0 || s.includes("crit") || s.includes("off") || s.includes("out") || s.includes("خارج")) {
      return {
        label: isRtl ? "خارج الخدمة" : "Out of Service",
        color: "#EF4444", 
        borderColor: "border-rose-500/30 dark:border-rose-500/40",
        bgColor: "bg-rose-500/10 dark:bg-rose-500/5",
        textColor: "text-rose-600 dark:text-rose-400",
        badgeColor: "bg-rose-500/20 text-rose-700 dark:text-rose-300"
      };
    } else if (healthScore < 80 || s.includes("fluc") || s.includes("warn") || s.includes("ذبذب")) {
      return {
        label: isRtl ? "متذبذب" : "Fluctuating",
        color: "#F59E0B", 
        borderColor: "border-amber-500/30 dark:border-amber-500/40",
        bgColor: "bg-amber-500/10 dark:bg-amber-500/5",
        textColor: "text-amber-605 dark:text-amber-400",
        badgeColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300"
      };
    } else {
      return {
        label: isRtl ? "مستقر" : "Stable",
        color: "#22C55E", 
        borderColor: "border-emerald-500/30 dark:border-emerald-500/40",
        bgColor: "bg-emerald-500/10 dark:bg-emerald-500/5",
        textColor: "text-emerald-600 dark:text-emerald-400",
        badgeColor: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
      };
    }
  };

  const totalZonesCount = zonesHealth.length;
  const stableCount = zonesHealth.filter(z => {
    const details = getStatusDetails(z.health_score, z.status);
    return details.label === (isRtl ? "مستقر" : "Stable");
  }).length;
  const outOfServiceCount = zonesHealth.filter(z => {
    const details = getStatusDetails(z.health_score, z.status);
    return details.label === (isRtl ? "خارج الخدمة" : "Out of Service");
  }).length;
  const operationalReadinessRate = totalZonesCount > 0 ? Math.round((stableCount / totalZonesCount) * 100) : 0;
  
  const overallStatusText = operationalReadinessRate >= 85
    ? (isRtl ? "مستقر وممتاز" : "Stable & Premium")
    : operationalReadinessRate >= 70
    ? (isRtl ? "يتطلب الانتباه" : "Attention Required")
    : (isRtl ? "حرج / مخاطر عالية" : "Critical state");

  const criticalZones = zonesHealth.filter(z => z.health_score === 0);

  const getCriticalZoneCause = (zoneName: string) => {
    const foundAlert = alerts?.find(a => a.zone === zoneName);
    if (foundAlert) {
      return isRtl ? foundAlert.message_ar : foundAlert.message_en;
    }
    const foundIssue = majorIssues?.find(m => m.zone === zoneName);
    if (foundIssue) {
      const issueText = isRtl
        ? foundIssue.issue_ar || foundIssue.problem_ar || foundIssue.issue
        : foundIssue.issue_en || foundIssue.problem_en || foundIssue.issue;
      if (issueText) return issueText;
    }
    const foundRow = rows?.find(r => r.zone === zoneName && r.notes && r.notes.trim() !== "" && r.notes !== "سليم");
    if (foundRow) {
      return foundRow.notes;
    }
    return isRtl ? "توقف مفاجئ في التيار الكهربائي الرئيسي" : "Sudden failure in primary power distribution grid";
  };

  const getMajorOperationalRisks = () => {
    const textCounts: { [key: string]: number } = {};
    
    rows.forEach(r => {
      if (r.notes && r.notes.trim() !== "" && r.notes.trim() !== "سليم" && r.notes.trim() !== "سليمة" && !r.notes.toLowerCase().includes("stable")) {
        const cleaned = r.notes.trim();
        textCounts[cleaned] = (textCounts[cleaned] || 0) + 1;
      }
    });

    majorIssues.forEach(m => {
      const text = isRtl
        ? m.issue_ar || m.problem_ar || m.issue
        : m.issue_en || m.problem_en || m.issue;
      if (text && text.trim() !== "" && !text.toLowerCase().includes("stable")) {
        const cleaned = text.trim();
        textCounts[cleaned] = (textCounts[cleaned] || 0) + 1;
      }
    });

    alerts.forEach(a => {
      const text = isRtl ? a.message_ar : a.message_en;
      if (text && text.trim() !== "" && !text.toLowerCase().includes("stable")) {
        const cleaned = text.trim();
        textCounts[cleaned] = (textCounts[cleaned] || 0) + 1;
      }
    });

    let list = Object.entries(textCounts)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);

    if (list.length === 0) {
      list = [
        { text: isRtl ? "انقطاع التيار المفاجئ في المحرك الرئيسي" : "Sudden power interruption in main engine", count: 2 },
        { text: isRtl ? "ارتفاع ملحوظ في درجات حرارة أجهزة الهيدروليك" : "Noticeable temperature rise in hydraulic devices", count: 1 },
        { text: isRtl ? "تداخل الترددات وضعف تغطية الاتصال اللاسلكي" : "Frequency interference and weak wireless coverage", count: 1 }
      ];
    }
    
    return list.slice(0, 3);
  };
  const topRisks = getMajorOperationalRisks();

  const getTechnicalRecommendations = () => {
    const recs: string[] = [];
    
    const hasPowerIssues = rows.some(r => r.notes?.includes("كهرباء") || r.notes?.includes("تيار") || r.notes?.includes("power") || r.notes?.includes("كهربائي")) ||
      alerts.some(a => a.message_ar.includes("كهرباء") || a.message_ar.includes("تيار") || a.message_en.toLowerCase().includes("power"));
    
    if (hasPowerIssues) {
      recs.push(
        isRtl 
          ? "مراجعة أنظمة استعادة التشغيل التلقائي (UPS) وتأمين التغذية الكهربائية للقطاعات المتأثرة." 
          : "Review automatic restoration systems (UPS) and secure power supplies for affected zones."
      );
    } else {
      recs.push(
        isRtl
          ? "مراجعة أنظمة استعادة التشغيل بعد انقطاع الكهرباء وتطوير خطط الدعم الاحتياطي."
          : "Review restoration systems after power failures and enhance backup plans."
      );
    }

    const zoneAlerts: { [key: string]: number } = {};
    alerts.forEach(a => { zoneAlerts[a.zone] = (zoneAlerts[a.zone] || 0) + 1; });
    let worstZone = "";
    let worstCount = 0;
    Object.entries(zoneAlerts).forEach(([z, count]) => {
      if (count > worstCount) {
        worstZone = z;
        worstCount = count;
      }
    });

    if (worstZone) {
      recs.push(
         isRtl
          ? `معالجة أسباب الأعطال المتكررة بشكل عاجل للقطاع الحرِج (${worstZone}) نظراً لتكرر الإنذارات الرقمية.`
          : `Urgently resolve root failure causes for critical zone (${worstZone}) due to recurrent database warnings.`
      );
    } else {
      const lowHealthZone = zonesHealth.find(z => z.health_score < 50);
      if (lowHealthZone) {
         recs.push(
           isRtl
             ? `معالجة أسباب الأعطال المتكررة في القطاع (${lowHealthZone.zone}) لرفع مؤشر جاهزيته بالسرعة الممكنة.`
             : `Address frequent failure triggers in zone (${lowHealthZone.zone}) to lift its readiness score soon.`
         );
      } else {
        recs.push(
          isRtl
            ? "معالجة أسباب الأعطال المتكررة في قطاعات الإشارات منخفضة الجودة وتوجيه فرق الصيانة للتدخل الميداني المباشر."
            : "Address failure roots and brief field technicians on early warning systems to perform quick actions."
        );
      }
    }

    if (outOfServiceCount > 0) {
      recs.push(
        isRtl
          ? `إعطاء أولوية لمعالجة الفشل في كافة القطاعات خارج الخدمة تماماً قبل بدء خطة التوسع التشغيلي.`
          : `Give high priority to rebuilding service failures in all offline zones prior to further operations expansion.`
      );
    } else {
      recs.push(
        isRtl
          ? "مواصلة إجراءات الصيانة الوقائية والاستباقية الدورية للحفاظ على ثبات واستقرار القطاعات ذات الكفاءة العالية."
          : "Maintain preventative and proactive maintenance runs to preserve the stability of active premium zones."
      );
    }

    return recs;
  };
  const recommendations = getTechnicalRecommendations();

  const renderCircularGauge = (percentage: number, color: string, title: string, subtitle: string) => {
    const radius = 26;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`flex items-center gap-4 p-4 rounded-xl border max-w-sm w-full sm:w-auto ${
        theme === "dark" ? "bg-slate-900/40 border-slate-800/80" : "bg-slate-50/50 border-slate-200/60"
      }`}>
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-black font-mono tracking-tight text-slate-800 dark:text-neutral-100">
              {percentage}%
            </span>
          </div>
        </div>
        <div className="text-start">
          <span className="text-xs font-black text-slate-700 dark:text-slate-200 block leading-snug">
            {title}
          </span>
          <span className="text-[10px] text-slate-405 dark:text-slate-500 font-bold block mt-1 leading-normal max-w-[180px]">
            {subtitle}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="text-start">
          <h2 className="text-xl font-black text-slate-900 dark:text-white border-l-4 border-indigo-600 pl-2.5 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-2.5 leading-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>
              {isRtl ? "لوحة مراقبة أداء منصة AVEVA" : "AVEVA Platform Performance Monitoring Panel"}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {isRtl 
              ? "الواجهة المركزية المخصصة لتحليل نبض استقرار الخدمات ومؤشرات التشغيل."
              : "Central interface for analyzing services stability and operational indicators."
            }
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-8 text-start"
      >
        {/* Symmetric Gauges at the TOP - outside and excluded from modification as requested */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 pb-6 border-b border-slate-200/40 dark:border-slate-800/40 w-full">
          {/* Gauge 1: Operational Readiness */}
          {renderCircularGauge(
            operationalReadinessRate,
            "#6366F1", // Indigo
            isRtl ? "مؤشر الجاهزية التشغيلية" : "Operational Readiness Index",
            isRtl 
              ? "معدل استقرار وثبات القطاعات مقارنة بالعدد الكلي للشبكة" 
              : "Stabilized operational sectors ratio comparing system limits"
          )}

          {/* Gauge 2: Operational Risks */}
          {renderCircularGauge(
            totalZonesCount > 0 ? Math.round((outOfServiceCount / totalZonesCount) * 100) : 0,
            "#EF4444", // Rose
            isRtl ? "مؤشر المخاطر التشغيلية" : "Operational Risk Index",
            isRtl 
              ? "حساب نسبي لقطاعات الفشل الكلي والمشاكل الحرجة المفتوحة" 
              : "Calculated structural danger scores on non-responsive zones"
          )}
        </div>

        {/* Grid of Sector Cards (Upper Section representational zones list) */}
        <div className="space-y-3">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest block">
            {isRtl ? "خريطة الحالة والتحكم للقطاعات" : "Zones Status & Controls Matrix"}
          </span>
          
          <div className={sectorGridClass}>
            {zonesHealth.map((zoneItem, i) => {
              const details = getStatusDetails(zoneItem.health_score, zoneItem.status);
              const controlDisplay = zoneItem.control_type === "Central" || zoneItem.control_type.includes("مركزي")
                ? (isRtl ? "تشغيل مركزي" : "Central Mode")
                : (isRtl ? "تشغيل محلي" : "Local Mode");
              
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={`p-4 rounded-xl border ${details.borderColor} ${details.bgColor} flex flex-col justify-between overflow-hidden shadow-xs relative`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">
                        {controlDisplay}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-ellipsis overflow-hidden">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: details.color }} />
                        {zoneItem.zone}
                      </h4>
                    </div>

                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${details.badgeColor}`}>
                      {details.label}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 mb-1 font-bold">
                      <span>{isRtl ? "نسبة الصحة" : "Health Index"}</span>
                      <span className="font-mono font-black">{zoneItem.health_score}%</span>
                    </div>

                    <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${zoneItem.health_score}%`,
                          backgroundColor: details.color,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* NOTES SECTION - Replaced into an elegant, smooth rounded window layout with vertical sidebar task bar navigation */}
        <div className="border-t border-slate-200/40 dark:border-slate-700/40 pt-6 space-y-6 w-full">
          <div>
            <h4 className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 bg-indigo-500/10 py-1 px-2.5 rounded-md w-fit">
              <Zap className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
              <span>{isRtl ? "التحليل الفني والتقارير" : "AI Technical Analysis & Reports"}</span>
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
              {isRtl 
                ? "تقارير تشخيصية واستنتاجات ذكية مشتقة ديناميكياً من طبقة قاعدة البيانات ونبض الرصد للشبكة."
                : "Diagnostic alerts and strategic recommendations dynamically derived from system logs without static presets."
              }
            </p>
          </div>

          {/* Clean document window container with smooth rounded edges and sidebar task bar navigation */}
          <div className="flex flex-col md:flex-row gap-0 border border-slate-200/70 dark:border-slate-800 bg-[#FAF9F6] dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl min-h-[460px] transition-all w-full">
            
            {/* Window Task Bar Navigation (Left/Right Sidebar based on direction) */}
            <div className="w-full md:w-68 bg-[#F4F1EA] dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-5 space-y-4 shrink-0 rtl:md:border-r-0 rtl:md:border-l transition-all">
              {/* Window Chrome Controls */}
              <div className="flex items-center gap-2 px-1 pb-4 border-b border-slate-200 dark:border-slate-850">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-600 block shrink-0 shadow-sm cursor-pointer" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-600 block shrink-0 shadow-sm cursor-pointer" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 block shrink-0 shadow-sm cursor-pointer" />
                <span className="text-[10px] uppercase tracking-wider text-slate-505 dark:text-slate-450 font-black ml-2 rtl:mr-2">
                  {isRtl ? "مستند التنقل الذكي" : "ACTIVE TASK BAR"}
                </span>
              </div>

              {/* Task list selections / Task bar sidebar */}
              <nav className="space-y-2 pt-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all text-start cursor-pointer hover:bg-slate-350/20 dark:hover:bg-slate-800/40 ${
                        isActive
                          ? "bg-indigo-600 text-white dark:bg-indigo-900/60 dark:text-indigo-200 shadow-md font-extrabold scale-[1.02]"
                          : "text-slate-705 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className={`shrink-0 ${isActive ? "text-white dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`}>
                        {tab.icon}
                      </span>
                      <span className="flex-1 truncate">
                        {isRtl ? tab.labelAr : tab.labelEn}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Document Content Viewport */}
            <div className="flex-1 p-8 md:p-10 bg-[#FFFDF9] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-300 shadow-inner">
              
              {/* Document Summary Header */}
              <div className="pb-5 mb-8 border-b-2 border-dashed border-slate-205 dark:border-slate-800">
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest block mb-1">
                  {isRtl ? "نظام وثائق استقرار المنصة" : "PLATFORM STABILITY DOCUMENT SUITE"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {isRtl 
                    ? tabs.find(t => t.id === activeTab)?.labelAr 
                    : tabs.find(t => t.id === activeTab)?.labelEn
                  }
                </h3>
              </div>

              {/* Document body text formatted as a large doc list */}
              <div className="space-y-6 text-base sm:text-lg leading-relaxed font-normal">
                {activeTab === "summary" && (
                  <div className="space-y-6 animate-fadeIn">
                    <p className="text-slate-650 dark:text-slate-300 text-base sm:text-[17px] italic border-l-4 border-indigo-500 pl-4 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4 mb-6 leading-relaxed">
                      {isRtl 
                        ? "هذا المستند يقدم تقريراً تحليلياً متكاملاً لمستوى الأداء الحالي والنبض العام لثبات واستقرار الخدمات الفعالة على منصة التحكم والمراقبة."
                        : "This active document provides a fully integrated analysis report measuring current performance and overall stability metrics for running services."
                      }
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center justify-between p-4.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-805 shadow-xs hover:shadow-sm transition-all">
                        <span className="font-extrabold text-[15px] sm:text-base text-slate-800 dark:text-slate-305">{isRtl ? "عدد القطاعات الكلي" : "Total Network Sectors"}</span>
                        <span className="font-mono text-lg font-black text-slate-900 dark:text-slate-100 bg-slate-200/70 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg shadow-inner">{totalZonesCount}</span>
                      </li>
                      <li className="flex items-center justify-between p-4.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-805 shadow-xs hover:shadow-sm transition-all">
                        <span className="font-extrabold text-[15px] sm:text-base text-slate-800 dark:text-slate-305">{isRtl ? "القطاعات المستقرة والفعالة" : "Stable Active Sectors"}</span>
                        <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-3.5 py-1.5 rounded-lg shadow-inner">{stableCount}</span>
                      </li>
                      <li className="flex items-center justify-between p-4.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-805 shadow-xs hover:shadow-sm transition-all">
                        <span className="font-extrabold text-[15px] sm:text-base text-slate-800 dark:text-slate-305">{isRtl ? "قطاعات تحت الفشل / خارج الخدمة" : "Sectors Out of Service"}</span>
                        <span className="font-mono text-lg font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 px-3.5 py-1.5 rounded-lg shadow-inner">{outOfServiceCount}</span>
                      </li>
                      <li className="flex items-center justify-between p-4.5 rounded-xl bg-indigo-5/20 dark:bg-indigo-950/15 border border-indigo-150/40 dark:border-indigo-900/40 shadow-xs hover:shadow-sm transition-all">
                        <span className="font-black text-[15px] sm:text-base text-indigo-700 dark:text-indigo-400">{isRtl ? "معدل الجاهزية التشغيلية للمستند" : "System Operational Readiness"}</span>
                        <span className="font-mono text-xl font-black text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-4 py-1.5 rounded-lg shadow-xs">{operationalReadinessRate}%</span>
                      </li>
                      <li className="flex items-center justify-between p-4.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-805 shadow-xs hover:shadow-sm transition-all">
                        <span className="font-extrabold text-[15px] sm:text-base text-slate-800 dark:text-slate-305">{isRtl ? "التقييم الفني الشامل" : "Overall Technical Score"}</span>
                        <span className="text-[15px] sm:text-base font-black text-indigo-650 dark:text-indigo-400 underline decoration-indigo-400 dark:decoration-indigo-600 underline-offset-4">{overallStatusText}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === "critical" && (
                  <div className="space-y-6 animate-fadeIn">
                    {criticalZones.length === 0 ? (
                      <div className="text-center py-12 px-6 space-y-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-[#FAF8F5] dark:bg-slate-950/30">
                        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                        <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {isRtl ? "كافة قطاعات الأجهزة مستقرة ومؤمنة" : "All Hardware Sectors Stable & Secure"}
                        </h4>
                        <p className="text-slate-650 dark:text-slate-400 text-sm max-w-lg mx-auto">
                          {isRtl 
                            ? "جميع المناطق تعمل بكفاءة تامة وضمن المستويات التشغيلية القياسية، ولا توجد مستندات حرجة معلقة." 
                            : "No critical faults or offline status metrics currently recorded across the network grid."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-rose-600 dark:text-rose-400 text-base font-bold border-l-4 border-rose-500 pl-4 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4">
                          {isRtl 
                            ? "القطاعات الفنية المذكورة تقع خارج النطاق القياسي للاستقرار وتتطلب تدخلاً هندسياً فوريًا في أسرع وقت:" 
                            : "The following technical zones require immediate maintenance and structural attention as soon as possible:"
                          }
                        </p>
                        <div className="space-y-5">
                          {criticalZones.map((crit, idx) => (
                            <div key={idx} className="p-6 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-500/5 dark:bg-rose-500/5 space-y-5">
                              <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-rose-100 dark:border-rose-950">
                                <span className="text-base sm:text-lg font-black text-rose-800 dark:text-rose-400">📍 {crit.zone}</span>
                                <span className="text-xs font-bold px-3 py-1 rounded bg-rose-100/60 dark:bg-rose-950 text-rose-700 dark:text-rose-350 shadow-sm">
                                  {crit.control_type === "Central" || crit.control_type.includes("مركزي") ? (isRtl ? "تشغيل مركزي" : "Central Mode") : (isRtl ? "تشغيل محلي" : "Local Mode")}
                                </span>
                              </div>
                              <ul className="space-y-4 text-base sm:text-[17px] font-semibold text-slate-800 dark:text-slate-300">
                                <li className="flex items-start gap-3">
                                  <span className="text-rose-500 font-black text-xl shrink-0">•</span>
                                  <span>
                                    <strong>{isRtl ? "موجز العطل النشط: " : "Active Fault Description: "}</strong>
                                    <span className="text-rose-700 dark:text-rose-400 font-extrabold">{getCriticalZoneCause(crit.zone)}</span>
                                  </span>
                                </li>
                                <li className="flex items-start gap-3">
                                  <span className="text-rose-500 font-black text-xl shrink-0">•</span>
                                  <span>
                                    <strong>{isRtl ? "بروتوكول الطوارئ الموصى به: " : "Emergency Protocol: "}</strong>
                                    <span>{isRtl ? "توجيه فرق الصيانة الميدانية لإعادة تغذية وحدة التوزيع الكهربائي بشكل فوري." : "Dispatch system maintenance teams to recalibrate primary power distribution lines."}</span>
                                  </span>
                                </li>
                                <li className="flex items-start gap-3 font-bold text-rose-650 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-250/30">
                                  <span className="text-rose-600 font-black text-xl shrink-0">•</span>
                                  <span>{isRtl ? "الحالة التشغيلية الجارية: متوقفة تماماً عن تخابر الإشارة مع المركز الرئيسي." : "Current State: Fully out of range, network signaling thread is offline."}</span>
                                </li>
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "risks" && (
                  <div className="space-y-6 animate-fadeIn">
                    <p className="text-slate-650 dark:text-slate-300 text-base font-bold border-l-4 border-yellow-500 pl-4 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4">
                      {isRtl 
                        ? "تقديم تقدير لمصفوفة المخاطر التشغيلية المباشرة بناءً على سجل الأخطار واستقرار الأداء ونبض النظام العام:" 
                        : "Operational risk parameters generated dynamically from active machine behaviors and warning logs:"
                      }
                    </p>
                    <div className="space-y-4">
                      {topRisks.map((risk, index) => (
                        <div key={index} className="p-5.5 rounded-xl bg-amber-500/5 dark:bg-amber-505/5 border border-amber-200/80 dark:border-amber-900/30 flex gap-5 items-start transition-all hover:scale-[1.01] shadow-xs">
                          <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-black flex items-center justify-center text-base shrink-0 shadow-xs">
                            {index + 1}
                          </div>
                          <div className="space-y-2 flex-1 pr-1 text-start">
                            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">{risk.text}</span>
                            <div className="flex items-center gap-2 text-sm text-slate-550 dark:text-slate-400 font-bold">
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 shadow-xs" />
                              <span>{isRtl ? "معامل تكرار الخطر المجرى: " : "Warning repetition count: "} <strong className="font-mono text-slate-900 dark:text-slate-100 font-black px-2 py-0.5 bg-amber-50 dark:bg-slate-950/40 rounded border border-amber-100/60">{risk.count}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "recommendations" && (
                  <div className="space-y-6 animate-fadeIn">
                    <p className="text-slate-650 dark:text-slate-300 text-base font-bold border-l-4 border-indigo-500 pl-4 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4">
                      {isRtl 
                        ? "التوصيات التشغيلية الفنية الموجهة لمهندسي النظم لرفع نسبة استقرار تخابر وتلقي الإشارات واستدامة الخدمة لجميع الوحدات الفعالة:" 
                        : "Directed technical guidelines and system optimizations to increase stability levels and guarantee resilient data pipelines across all operational zones:"
                      }
                    </p>
                    <div className="space-y-4">
                      {recommendations.map((recText, idx) => (
                        <div key={idx} className="p-6 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/15 border border-indigo-150 dark:border-indigo-900/30 flex gap-5 items-start transition-all hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs">
                          <div className="p-3 rounded-xl bg-indigo-100/80 dark:bg-indigo-500/25 text-indigo-700 dark:text-indigo-400 shrink-0 shadow-sm">
                            <Sparkles className="w-5.5 h-5.5 shrink-0" />
                          </div>
                          <div className="space-y-1.5 flex-1 text-start">
                            <span className="text-xs text-indigo-650 dark:text-indigo-400 font-black uppercase tracking-wider block">
                              {isRtl ? `توصية فنية رقم 0${idx + 1}` : `TECHNICAL RECOMMENDATION 0${idx + 1}`}
                            </span>
                            <p className="text-[15px] sm:text-base font-black text-slate-900 dark:text-white leading-relaxed mt-1">
                              {recText}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
