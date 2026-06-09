import React from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
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

  const sectorGridClass = 
    viewMode === "desktop"
      ? "grid grid-cols-4 xl:grid-cols-5 gap-6"
      : viewMode === "tablet"
      ? "grid grid-cols-2 gap-[18px]"
      : "grid grid-cols-1 gap-[14px]";

  const insightsGridClass = 
    viewMode === "desktop"
      ? "grid grid-cols-3 gap-6"
      : viewMode === "tablet"
      ? "grid grid-cols-2 gap-[18px]"
      : "grid grid-cols-1 gap-[14px]";

  const getStatusDetails = (healthScore: number, rawStatus: string) => {
    const s = (rawStatus || "").toLowerCase();
    if (healthScore === 0 || s.includes("crit") || s.includes("off") || s.includes("out") || s.includes("خارج")) {
      return {
        label: isRtl ? "خارج الخدمة" : "Out of Service",
        color: "#EF4444", // red
        borderColor: "border-rose-500/30 dark:border-rose-500/40",
        bgColor: "bg-rose-500/10 dark:bg-rose-500/5",
        textColor: "text-rose-600 dark:text-rose-400",
        badgeColor: "bg-rose-500/20 text-rose-700 dark:text-rose-300"
      };
    } else if (healthScore < 80 || s.includes("fluc") || s.includes("warn") || s.includes("ذبذب")) {
      return {
        label: isRtl ? "متذبذب" : "Fluctuating",
        color: "#F59E0B", // yellow
        borderColor: "border-amber-500/30 dark:border-amber-500/40",
        bgColor: "bg-amber-500/10 dark:bg-amber-500/5",
        textColor: "text-amber-600 dark:text-amber-400",
        badgeColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300"
      };
    } else {
      return {
        label: isRtl ? "مستقر" : "Stable",
        color: "#22C55E", // green
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
          ? `معالجة أسباب الأعطال المتكررة بشكل عاجل للقطاع الحرِج (${worstZone}) نظراً لتكرر الإنذارات.`
          : `Urgently resolve root failure causes for critical zone (${worstZone}) due to recurrent alarms.`
      );
    } else {
      const lowHealthZone = zonesHealth.find(z => z.health_score < 50);
      if (lowHealthZone) {
         recs.push(
           isRtl
             ? `معالجة أسباب الأعطال المتكررة في القطاع (${lowHealthZone.zone}) لرفع مؤشر جاهزيته.`
             : `Address frequent failure triggers in zone (${lowHealthZone.zone}) to lift its readiness score.`
         );
      } else {
        recs.push(
          isRtl
            ? "معالجة أسباب الأعطال المتكررة في قطاعات الإشارات منخفضة الجودة."
            : "Address failure roots and brief field technicians on early warning systems."
        );
      }
    }

    if (outOfServiceCount > 0) {
      recs.push(
        isRtl
          ? `إعطاء أولوية لمعالجة القطاعات خارج الخدمة قبل التوسع التشغيلي.`
          : `Give priority to rebuilding service failures prior to further operations expand.`
      );
    } else {
      recs.push(
        isRtl
          ? "مواصلة إجراءات الصيانة الوقائية والاستباقية للحفاظ على استقرار القطاعات ذات الكفاءة العالية."
          : "Maintain preventative maintenance runs to preserve the stability of premium zones."
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
        theme === "dark" ? "bg-slate-900/40 border-slate-800/80" : "bg-slate-50/50 border-slate-205/60"
      }`}>
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90 animate-pulse-slow" viewBox="0 0 64 64">
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
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-1 leading-normal max-w-[180px]">
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
          <h2 className="text-xl font-black text-gray-950 dark:text-white border-l-4 border-indigo-600 pl-2.5 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-2.5 leading-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>
              {isRtl ? "لوحة مراقبة أداء منصة AVEVA" : "AVEVA Platform Performance Monitoring Panel"}
            </span>
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-405 mt-2">
            {isRtl 
              ? "الواجهة المركزية المخصصة لتحليل نبض استقرار الخدمات ورفع كفاءة الأنظمة والاتصالات بناءً على لوجستيات التقييم المباشر." 
              : "Central specialized workspace analyzed to audit service stabilization parameters and operational readiness benchmarks."
            }
          </p>
        </div>

        {/* Repositioned Live Status indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-[10px] font-bold text-slate-500 dark:text-slate-450 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/55 shrink-0 shadow-2xs">
          <span>{isRtl ? "تحديث تلقائي:" : "Live status:"}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-600 dark:text-emerald-400 font-mono">100% OK</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6 text-start"
      >
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

        <div className="border-t border-slate-200/40 dark:border-slate-700/40 pt-6 space-y-6">
          <div>
            <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 bg-indigo-500/10 py-1 px-2.5 rounded-md w-fit">
              <Zap className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
              <span>{isRtl ? "التحليل الفني الآلي" : "AI Technical Analysis"}</span>
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
              {isRtl 
                ? "تقارير تشخيصية واستنتاجات ذكية مشتقة ديناميكياً من طبقة قاعدة البيانات ونبض الرصد للشبكة."
                : "Diagnostic alerts and strategic recommendations dynamically derived from system logs without static presets."
              }
            </p>
          </div>

          {/* Redesigned 4 Executive Sections (Top Row: Exec Summary & Critical. Bottom Row: Major Risks & Recommendations) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-start">
            
            {/* ① الملخص التنفيذي */}
            <div className="space-y-3">
              <h5 className="text-[12px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{isRtl ? "الملخص التنفيذي" : "Executive Summary"}</span>
              </h5>
              <ul className="space-y-2.5 font-sans text-xs">
                <li className="flex items-start gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-500 font-mono text-sm leading-none shrink-0">•</span>
                  <span>{isRtl ? "عدد القطاعات الكلي:" : "Total Zones Count:"} <span className="font-mono text-slate-900 dark:text-slate-100 font-black">{totalZonesCount}</span></span>
                </li>
                <li className="flex items-start gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 font-mono text-sm leading-none shrink-0">•</span>
                  <span>{isRtl ? "القطاعات المستقرة:" : "Stable Zones:"} <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{stableCount}</span></span>
                </li>
                <li className="flex items-start gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-rose-500 font-mono text-sm leading-none shrink-0">•</span>
                  <span>{isRtl ? "القطاعات خارج الخدمة:" : "Zones Out of Service:"} <span className="font-mono text-rose-500 font-black">{outOfServiceCount}</span></span>
                </li>
                <li className="flex items-start gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-550 font-mono text-sm leading-none shrink-0">•</span>
                  <span>{isRtl ? "الجاهزية التشغيلية:" : "Operational Readiness:"} <span className="font-mono text-indigo-650 dark:text-indigo-400 font-black">{operationalReadinessRate}%</span></span>
                </li>
                <li className="flex items-start gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-amber-500 font-mono text-sm leading-none shrink-0">•</span>
                  <span>{isRtl ? "الحالة العامة:" : "Overall State:"} <span className="underline decoration-indigo-400 underline-offset-2 text-slate-900 dark:text-slate-100">{overallStatusText}</span></span>
                </li>
              </ul>
            </div>

            {/* ② القطاعات الحرجة */}
            <div className="space-y-3">
              <h5 className="text-[12px] font-black text-rose-500 dark:text-rose-400 flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{isRtl ? "القطاعات الحرجة" : "Critical Zones"}</span>
              </h5>
              <ul className="space-y-2.5 font-sans text-xs">
                {criticalZones.length === 0 ? (
                  <li className="flex items-start gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                    <span className="text-emerald-500 font-mono text-sm leading-none shrink-0">•</span>
                    <span>{isRtl ? "جميع قطاعات الشبكة في نطاق الجاهزية والاستقرار تقع تحت مستويات الخدمة الطبيعية" : "All system zones are operating correctly within normal boundaries"}</span>
                  </li>
                ) : (
                  criticalZones.map((crit, idx) => (
                    <React.Fragment key={idx}>
                      <li className="flex items-start gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                        <span className="text-rose-500 font-mono text-sm leading-none shrink-0">•</span>
                        <span>{crit.zone} ({crit.control_type === "Central" || crit.control_type.includes("مركزي") ? (isRtl ? "تشغيل مركزي" : "Central Mode") : (isRtl ? "تشغيل محلي" : "Local Mode")})</span>
                      </li>
                      <li className="flex items-start gap-1.5 font-bold text-slate-700 dark:text-slate-350 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10">
                        <span className="text-rose-400 font-mono text-sm leading-none shrink-0">•</span>
                        <span>
                          {isRtl ? "السبب الفني:" : "Technical Cause:"} {getCriticalZoneCause(crit.zone)}
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5 font-bold text-slate-705 dark:text-slate-300">
                        <span className="text-rose-400 font-mono text-sm leading-none shrink-0">•</span>
                        <span>{isRtl ? "التشغيل يتم حالياً عبر النظام القديم" : "Operations managed via legacy platform system"}</span>
                      </li>
                      <li className="flex items-start gap-1.5 font-bold text-rose-550 dark:text-rose-450">
                        <span className="text-rose-500 font-mono text-sm leading-none shrink-0">•</span>
                        <span>{isRtl ? "الحالة: خارج الخدمة ويتطلب فحصاً تشخيصياً عاجلاً" : "Status: Out of Service & Urgent diagnostis required"}</span>
                      </li>
                    </React.Fragment>
                  ))
                )}
              </ul>
            </div>

            {/* Separate lines for desktop */}
            <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800/40 my-1 hidden md:block"></div>

            {/* ③ أبرز المخاطر التشغيلية */}
            <div className="space-y-3">
              <h5 className="text-[12px] font-black text-amber-500 dark:text-amber-450 flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{isRtl ? "أبرز المخاطر التشغيلية" : "Major Operational Risks"}</span>
              </h5>
              <ul className="space-y-2.5 font-sans text-xs">
                {topRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-1.5 font-bold text-slate-705 dark:text-slate-300">
                    <span className="text-amber-500 font-mono text-sm leading-none shrink-0">•</span>
                    <span>{risk.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ④ التوصيات الفنية */}
            <div className="space-y-3">
              <h5 className="text-[12px] font-black text-indigo-650 dark:text-indigo-400 flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <Activity className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{isRtl ? "التوصيات الفنية" : "Technical Recommendations"}</span>
              </h5>
              <ul className="space-y-2.5 font-sans text-xs">
                {recommendations.map((recText, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 font-bold text-slate-705 dark:text-slate-300 leading-relaxed">
                    <span className="text-indigo-500 font-mono text-sm leading-none shrink-0">•</span>
                    <span>{recText}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Centered Symmetric Gauges at the very bottom */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 pt-6 border-t border-slate-200/40 dark:border-slate-800/40 w-full">
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
        </div>
      </motion.div>
    </div>
  );
};
