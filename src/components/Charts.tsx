import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "motion/react";
import { StatusDist, ControlDist, ZoneHealth, Row, Alert, MajorIssue } from "../types";
import { CheckCircle2, Sliders, Hash } from "lucide-react";

interface ChartsProps {
  statusDistribution: StatusDist[];
  controlDistribution: ControlDist[];
  zonesHealth: ZoneHealth[];
  lang: "ar" | "en";
  theme: "light" | "dark";
  rows?: Row[];
  alerts?: Alert[];
  majorIssues?: MajorIssue[];
  viewMode?: "desktop" | "tablet" | "mobile";
  activeKpiFilter?: string | null;
}

export function Charts({
  statusDistribution,
  controlDistribution,
  zonesHealth,
  lang,
  theme,
  rows = [],
  alerts = [],
  majorIssues = [],
  viewMode = "desktop",
  activeKpiFilter = null,
}: ChartsProps) {
  // Constants & Translation keys
  const isRtl = lang === "ar";
  const isDark = theme === "dark";

  const chartGridClass = 
    viewMode === "desktop"
      ? "grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full"
      : "grid grid-cols-1 gap-5 w-full max-w-full";

  // Filter rows by activeKpiFilter if provided
  let filteredRows = [...rows];
  if (activeKpiFilter) {
    const kpiLower = activeKpiFilter.toLowerCase();
    if (kpiLower === "stable") {
      filteredRows = filteredRows.filter(r => r.status_value.toLowerCase() === "stable");
    } else if (kpiLower === "fluctuating") {
      filteredRows = filteredRows.filter(r => r.status_value.toLowerCase() === "fluctuating");
    } else if (kpiLower === "out_of_service" || kpiLower === "out of service") {
      filteredRows = filteredRows.filter(r => r.status_value.toLowerCase() === "out_of_service" || r.status_value.toLowerCase().includes("out"));
    } else if (kpiLower === "local_only" || kpiLower === "local only" || kpiLower === "local_operation_only") {
      filteredRows = filteredRows.filter(r => r.control_value.toLowerCase().includes("local"));
    } else if (kpiLower === "central_only" || kpiLower === "central only") {
      filteredRows = filteredRows.filter(r => r.control_value.toLowerCase().includes("central") && !r.control_value.toLowerCase().includes("partial"));
    } else if (kpiLower === "dual" || kpiLower === "dual_mode") {
      filteredRows = filteredRows.filter(r => r.control_value.toLowerCase().includes("dual") || r.control_type_ar.includes("مزدوج"));
    } else if (kpiLower === "monitoring_only") {
      filteredRows = filteredRows.filter(r => r.control_value.toLowerCase().includes("monitoring only") || r.control_value.toLowerCase() === "monitoring_only");
    } else if (kpiLower === "monitoring_control" || kpiLower === "monitoring & control" || kpiLower === "monitoring and control") {
      filteredRows = filteredRows.filter(r => r.control_value.toLowerCase().includes("monitoring & control") || r.control_value.toLowerCase().includes("monitoring and control") || r.control_value.toLowerCase() === "monitoring_control");
    } else if (kpiLower === "central_partial_local" || kpiLower === "central partial local") {
      filteredRows = filteredRows.filter(r => r.control_value.toLowerCase().includes("partial") || r.control_type_ar.includes("جزئي"));
    } else if (kpiLower === "legacy_system" || kpiLower === "legacy" || kpiLower === "legacy system" || kpiLower === "legacy_operation" || kpiLower === "legacy operation") {
      filteredRows = filteredRows.filter(r => 
        r.control_value.toLowerCase().includes("legacy") || 
        r.control_value.toLowerCase().includes("traditional") || 
        r.control_type_ar.includes("تقليدي") ||
        r.control_type_ar.includes("النظام القديم")
      );
    } else if (kpiLower === "major_issues" || kpiLower === "major issues" || kpiLower === "issues") {
      filteredRows = filteredRows.filter(r => r.health_score < 100 || r.severity === "high");
    }
  }

  // Re-map statusDistribution dynamically if rows are available, otherwise fall back to prop
  let finalStatusDist = [...statusDistribution];
  if (rows && rows.length > 0) {
    let stableCount = 0;
    let fluctuatingCount = 0;
    let outOfServiceCount = 0;

    filteredRows.forEach((r) => {
      const val = r.status_value.toLowerCase();
      if (val === "stable") {
        stableCount += 1;
      } else if (val === "fluctuating") {
        fluctuatingCount += 1;
      } else if (val === "out_of_service" || val.includes("out")) {
        outOfServiceCount += 1;
      }
    });

    finalStatusDist = [
      {
        label_ar: "مستقر",
        label_en: "Stable",
        value: stableCount,
        color: "#22C55E"
      },
      {
        label_ar: "متذبذب",
        label_en: "Fluctuating",
        value: fluctuatingCount,
        color: "#EAB308"
      },
      {
        label_ar: "خارج الخدمة",
        label_en: "Out of Service",
        value: outOfServiceCount,
        color: "#EF4444"
      }
    ];
  }

  const mappedStatusDist = finalStatusDist.map((item) => {
    let color = item.color;
    const l_en = item.label_en.toLowerCase();
    if (l_en.includes("stable")) color = "#22C55E";
    else if (l_en.includes("fluctuating")) color = "#EAB308";
    else if (l_en.includes("out of service") || l_en.includes("offline") || l_en.includes("out_of_service")) color = "#EF4444";
    return { ...item, color };
  });

  const targetControlModes = [
    {
      label_ar: "تشغيل محلي فقط",
      label_en: "Local Only",
      color: "#F59E0B",
      matcher: (en: string, ar: string) =>
        en.includes("local only") || en === "local" || ar.includes("محلي فقط") || ar.includes("المحلي فقط"),
      value: 0
    },
    {
      label_ar: "تشغيل مركزي فقط",
      label_en: "Central Only",
      color: "#3B82F6",
      matcher: (en: string, ar: string) =>
        en.includes("central only") || en === "central" || ar.includes("مركزي فقط") || ar.includes("المركزي فقط"),
      value: 0
    },
    {
      label_ar: "تشغيل مزدوج",
      label_en: "Dual",
      color: "#22C55E",
      matcher: (en: string, ar: string) =>
        en.includes("dual") || ar.includes("مزدوج") || ar.includes("المزدوج"),
      value: 0
    },
    {
      label_ar: "تشغيل مركزي مع دعم محلي جزئي",
      label_en: "Central + Partial Local",
      color: "#8B5CF6",
      matcher: (en: string, ar: string) =>
        en.includes("partial") || ar.includes("جزئي") || ar.includes("الجزئي"),
      value: 0
    },
    {
      label_ar: "تشغيل عبر النظام القديم",
      label_en: "Legacy System",
      color: "#64748B",
      matcher: (en: string, ar: string) =>
        en.includes("legacy") || en.includes("traditional") || ar.includes("تقليدي") || ar.includes("التقليدي") || ar.includes("القديم") || ar.includes("قديم"),
      value: 0
    }
  ];

  // Aggregate values dynamically from rows (source of truth) if present, otherwise fallback to prop
  if (rows && rows.length > 0) {
    targetControlModes.forEach(t => t.value = 0);
    filteredRows.forEach((r) => {
      const val = (r.control_value || "").toLowerCase();
      const ar = r.control_type_ar || "";
      
      if (
        val === "legacy" ||
        val === "legacy system" || 
        val === "traditional system" || 
        val.includes("legacy") ||
        val.includes("traditional") ||
        ar.includes("تشغيل عبر النظام القديم") || 
        ar.includes("تشغيل عبر النظام التقليدي") ||
        ar.includes("القديم") ||
        ar.includes("تقليدي") ||
        ar.includes("التقليدي") ||
        ar.includes("قديم")
      ) {
        targetControlModes[4].value += 1; // Legacy System
      } else if (
        val.includes("partial") || 
        ar.includes("جزئي")
      ) {
        targetControlModes[3].value += 1; // Central + Partial Local
      } else if (
        val.includes("dual") || 
        ar.includes("مزدوج")
      ) {
        targetControlModes[2].value += 1; // Dual
      } else if (
        val.includes("central only") || 
        val === "central" || 
        ar.includes("مركزي فقط") || 
        ar.includes("المركزي فقط")
      ) {
        targetControlModes[1].value += 1; // Central Only
      } else if (
        val.includes("local only") || 
        val === "local" || 
        ar.includes("محلي فقط") || 
        ar.includes("المحلي فقط")
      ) {
        targetControlModes[0].value += 1; // Local Only
      }
    });
  } else {
    targetControlModes.forEach((target) => {
      controlDistribution.forEach((item) => {
        const l_en = (item.label_en || "").toLowerCase();
        const l_ar = item.label_ar || "";
        if (target.matcher(l_en, l_ar)) {
          target.value += item.value;
        }
      });
    });
  }

  const mappedControlDist = targetControlModes.map(({ label_ar, label_en, color, value }) => ({
    label_ar,
    label_en,
    color,
    value
  }));

  // Filter out any zero values for the actual chart pieces to avoid rendering empty wedges
  const activeStatusDist = mappedStatusDist.filter(x => x.value > 0);
  const activeControlDist = mappedControlDist.filter(x => x.value > 0);

  // Math totals
  const totalSectors = mappedStatusDist.reduce((acc, curr) => acc + curr.value, 0);
  const totalControlChannels = mappedControlDist.reduce((acc, curr) => acc + curr.value, 0);

  // States to keep track of hovered and clicked legendary slices
  const [hoveredIdx1, setHoveredIdx1] = useState<number | null>(null);
  const [selectedIdx1, setSelectedIdx1] = useState<number | null>(null);

  const [hoveredIdx2, setHoveredIdx2] = useState<number | null>(null);
  const [selectedIdx2, setSelectedIdx2] = useState<number | null>(null);

  // Math for central readings on Chart 1:
  const maxItem1 = activeStatusDist.length > 0 
    ? [...activeStatusDist].sort((a, b) => b.value - a.value)[0] 
    : null;
  const currentIdx1 = hoveredIdx1 !== null ? hoveredIdx1 : (selectedIdx1 !== null ? selectedIdx1 : null);
  const activeItem1 = currentIdx1 !== null ? activeStatusDist[currentIdx1] : maxItem1;
  const activeValue1 = activeItem1 ? activeItem1.value : 0;
  const activePercentage1 = totalSectors > 0 ? Math.round((activeValue1 / totalSectors) * 100) : 0;
  const activeLabel1 = activeItem1 ? (isRtl ? activeItem1.label_ar : activeItem1.label_en) : "";
  const activeColor1 = activeItem1 ? activeItem1.color : "#94A3B8";

  // Math for interactive tooltip configurations
  const maxItem2 = activeControlDist.length > 0 
    ? [...activeControlDist].sort((a, b) => b.value - a.value)[0] 
    : null;
  const currentIdx2 = hoveredIdx2 !== null ? hoveredIdx2 : (selectedIdx2 !== null ? selectedIdx2 : null);
  const activeItem2 = currentIdx2 !== null ? activeControlDist[currentIdx2] : maxItem2;
  const activeValue2 = activeItem2 ? activeItem2.value : 0;
  const activePercentage2 = totalControlChannels > 0 ? Math.round((activeValue2 / totalControlChannels) * 100) : 0;
  const activeLabel2 = activeItem2 ? (isRtl ? activeItem2.label_ar : activeItem2.label_en) : "";
  const activeColor2 = activeItem2 ? activeItem2.color : "#94A3B8";

  const t = {
    title1: isRtl ? "توزيع حالة تشغيل القطاعات" : "Operational Status Distribution",
    title2: isRtl ? "توزيع طرق التحكم ونظام التشغيل" : "Control Mode Distribution",
    indicator1: isRtl ? "إجمالي القطاعات" : "Total Sectors",
    indicator2: isRtl ? "قنوات التحكم" : "Control Channels",
    sectorsCount: isRtl ? "قطاعات" : "zones",
    ofSectors: isRtl ? "من المجموع" : "of active",
    tooltipTitle: isRtl ? "مؤشرات النظم" : "System Metrics",
    noData: isRtl ? "لا توجد تدفقات بيانات حالية" : "No active telemetry data stream available"
  };

  const tooltipContentStyle = {
    backgroundColor: theme === "dark" ? "#0f172a" : "#FFFFFF",
    borderColor: theme === "dark" ? "#1e293b" : "#E2E8F0",
    borderRadius: "12px",
    color: theme === "dark" ? "#f8fafc" : "#0f172a",
    fontFamily: "inherit",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
    textAlign: isRtl ? "right" : "left" as const,
    direction: isRtl ? "rtl" : "ltr" as const,
  };

  const getStatusEmoji = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("stable") || l.includes("مستقر")) return "🟢";
    if (l.includes("fluctuating") || l.includes("متذبذب")) return "🟡";
    if (l.includes("out of service") || l.includes("خارج الخدمة") || l.includes("offline")) return "🔴";
    return "🔵";
  };

  return (
    <div className={chartGridClass}>
      
      {/* Chart 1: Professional Status Distribution Donut */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ height: "520px" }}
        className="p-6 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col justify-between overflow-hidden"
      >
        {/* Header containing the Executive indicator */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-2 text-start shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-[#0F172A] dark:text-gray-100 text-sm">
                {t.title1}
              </h3>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-slate-500">
              {isRtl ? "مراقبة وتحليل كفاءة استقرار القطاعات" : "Critical analytics on telemetry and diagnostic states"}
            </p>
          </div>

          {/* Executive Indicator Bubble */}
          <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xs">
            <div className="flex flex-col text-right rtl:text-left">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                {t.indicator1}
              </span>
              <span className="text-[10px] font-bold text-[#334155] dark:text-slate-400 font-mono leading-none mt-0.5">
                Sectors
              </span>
            </div>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {totalSectors}
            </span>
          </div>
        </div>

        {/* 70% Height Donut Container */}
        <div className="relative w-full h-[65%] flex items-center justify-center py-2 shrink-0">
          {/* Centered Premium readouts display block */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10">
            <motion.span 
              key={activePercentage1}
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black font-mono tracking-tight" 
              style={{ color: activeColor1 }}
            >
              {activePercentage1}%
            </motion.span>
            <motion.span 
              key={activeLabel1}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-[14px] font-bold text-slate-800 dark:text-gray-200 mt-0.5 tracking-tight"
            >
              {activeLabel1}
            </motion.span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
              {isRtl 
                ? `${activeValue1} من أصل ${totalSectors} قطاعات` 
                : `${activeValue1} of ${totalSectors} zones`}
            </span>
          </div>

          {activeStatusDist.length === 0 ? (
            <div className="text-sm font-semibold text-slate-400">{t.noData}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeStatusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setHoveredIdx1(index)}
                  onMouseLeave={() => setHoveredIdx1(null)}
                >
                  {activeStatusDist.map((entry, index) => {
                    const isFocused = currentIdx1 === null || currentIdx1 === index;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        style={{
                          opacity: isFocused ? 1 : 0.3,
                          filter: isFocused ? `drop-shadow(0 0 6px ${entry.color}40)` : 'none',
                          transition: 'all 0.25s ease-out',
                          cursor: 'pointer'
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={tooltipContentStyle}
                  formatter={(value: any, name: any, props: any) => {
                    const label = lang === "ar" ? props.payload.label_ar : props.payload.label_en;
                    const percentSum = totalSectors > 0 ? Math.round((value / totalSectors) * 100) : 0;
                    return [
                      <div className="flex flex-col gap-1 text-xs" key={label}>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{getStatusEmoji(label)}</span>
                          <span>{label}</span>
                        </div>
                        <div className="font-semibold text-slate-500 dark:text-slate-400">
                          {value} {t.sectorsCount} ({percentSum}%)
                        </div>
                      </div>,
                      null
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 30% Height Interactive Legend Grid */}
        <div className="h-[30%] border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center shrink-0 w-full overflow-hidden">
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {mappedStatusDist.map((entry, idx) => {
              const activeIdx = activeStatusDist.findIndex(x => x.label_en === entry.label_en);
              const isSelected = selectedIdx1 === activeIdx && activeIdx !== -1;
              const isHovered = hoveredIdx1 === activeIdx && activeIdx !== -1;
              const pct = totalSectors > 0 ? Math.round((entry.value / totalSectors) * 100) : 0;
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (activeIdx !== -1) {
                      setSelectedIdx1(isSelected ? null : activeIdx);
                    }
                  }}
                  onMouseEnter={() => {
                    if (activeIdx !== -1) {
                      setHoveredIdx1(activeIdx);
                    }
                  }}
                  onMouseLeave={() => setHoveredIdx1(null)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-start w-full ${
                    isSelected || isHovered
                      ? "bg-slate-50 border-slate-300 dark:bg-slate-800/50 dark:border-slate-600 text-slate-900 dark:text-white"
                      : "bg-slate-50/40 border-slate-100 dark:bg-slate-950/20 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:border-slate-200 text-slate-600 dark:text-slate-450"
                  }`}
                  style={{
                    boxShadow: isSelected || isHovered ? `0 4px 12px ${entry.color}15` : "none"
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0 transition-transform duration-300" 
                      style={{ 
                        backgroundColor: entry.color,
                        transform: isSelected || isHovered ? "scale(1.2)" : "scale(1)",
                        boxShadow: `0 0 5px ${entry.color}50`
                      }} 
                    />
                    <span className="font-bold text-[10px] sm:text-xs truncate">
                      {lang === "ar" ? entry.label_ar : entry.label_en}
                    </span>
                  </div>
                  {entry.value > 0 && (
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 shrink-0">
                      {pct}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Chart 2: Control Mode Distribution Donut */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        style={{ height: "520px" }}
        className="p-6 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col justify-between overflow-hidden"
      >
        {/* Header containing the Executive indicator */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-2 text-start shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-[#0F172A] dark:text-gray-100 text-sm">
                {t.title2}
              </h3>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-slate-500">
              {isRtl ? "مستويات توزيع ونوع قنوات التحكم المتاحة" : "Active operational command pathways allocation map"}
            </p>
          </div>

          {/* Executive Indicator Bubble */}
          <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xs">
            <div className="flex flex-col text-right rtl:text-left">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                {t.indicator2}
              </span>
              <span className="text-[10px] font-bold text-[#334155] dark:text-slate-400 font-mono leading-none mt-0.5">
                Channels
              </span>
            </div>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {totalControlChannels}
            </span>
          </div>
        </div>

        {/* 70% Height Donut Container */}
        <div className="relative w-full h-[65%] flex items-center justify-center py-2 shrink-0">
          {/* Centered Premium readouts display block */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10">
            <motion.span 
              key={activePercentage2}
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black font-mono tracking-tight" 
              style={{ color: activeColor2 }}
            >
              {activePercentage2}%
            </motion.span>
            <motion.span 
              key={activeLabel2}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-[13px] font-bold text-slate-800 dark:text-gray-200 mt-0.5 max-w-[170px] truncate text-center leading-tight tracking-tight px-1"
            >
              {activeLabel2}
            </motion.span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
              {isRtl 
                ? `${activeValue2} من ${totalControlChannels} قنوات` 
                : `${activeValue2} of ${totalControlChannels} channels`}
            </span>
          </div>

          {activeControlDist.length === 0 ? (
            <div className="text-sm font-semibold text-slate-400">{t.noData}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeControlDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setHoveredIdx2(index)}
                  onMouseLeave={() => setHoveredIdx2(null)}
                >
                  {activeControlDist.map((entry, index) => {
                    const isFocused = currentIdx2 === null || currentIdx2 === index;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        style={{
                          opacity: isFocused ? 1 : 0.3,
                          filter: isFocused ? `drop-shadow(0 0 6px ${entry.color}40)` : 'none',
                          transition: 'all 0.25s ease-out',
                          cursor: 'pointer'
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={tooltipContentStyle}
                  formatter={(value: any, name: any, props: any) => {
                    const label = lang === "ar" ? props.payload.label_ar : props.payload.label_en;
                    const percentSum = totalControlChannels > 0 ? Math.round((value / totalControlChannels) * 100) : 0;
                    return [
                      <div className="flex flex-col gap-1 text-xs text-start font-sans" key={label}>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: props.payload.color }} />
                          <span>{label}</span>
                        </div>
                        <div className="font-semibold text-slate-550 dark:text-slate-400">
                          {value} {isRtl ? "قنوات" : "channels"} ({percentSum}%)
                        </div>
                      </div>,
                      null
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 30% Height Interactive Legend Grid */}
        <div className="h-[30%] border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center shrink-0 w-full overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 w-full">
            {mappedControlDist.map((entry, idx) => {
               const activeIdx = activeControlDist.findIndex(x => x.label_en === entry.label_en);
               const isSelected = selectedIdx2 === activeIdx && activeIdx !== -1;
               const isHovered = hoveredIdx2 === activeIdx && activeIdx !== -1;
               const pct = totalControlChannels > 0 ? Math.round((entry.value / totalControlChannels) * 100) : 0;
               
               return (
                 <button
                   key={idx}
                   onClick={() => {
                     if (activeIdx !== -1) {
                       setSelectedIdx2(isSelected ? null : activeIdx);
                     }
                   }}
                   onMouseEnter={() => {
                     if (activeIdx !== -1) {
                       setHoveredIdx2(activeIdx);
                     }
                   }}
                   onMouseLeave={() => setHoveredIdx2(null)}
                   className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer text-start ${
                    isSelected || isHovered
                      ? "bg-slate-50 border-slate-300 dark:bg-slate-800/50 dark:border-slate-600 text-slate-900 dark:text-white"
                      : "bg-slate-50/40 border-slate-100 dark:bg-slate-950/20 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:border-slate-200 text-slate-650 dark:text-slate-450"
                  }`}
                  style={{
                    boxShadow: isSelected || isHovered ? `0 4px 12px ${entry.color}15` : "none"
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                    <span 
                      className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-300" 
                      style={{ 
                        backgroundColor: entry.color, 
                        transform: isSelected || isHovered ? 'scale(1.2)' : 'scale(1)',
                        boxShadow: `0 0 4px ${entry.color}40`
                      }} 
                    />
                    <span className="font-bold text-[9px] sm:text-[10px] truncate leading-tight">
                      {lang === "ar" ? entry.label_ar : entry.label_en}
                    </span>
                  </div>
                  {entry.value > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 shrink-0 ml-1">
                      {pct}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

    </div>
  );
}

export default Charts;
