import React, { useState, useMemo } from "react";
import { 
  Search, 
  ArrowUpDown, 
  Settings, 
  Activity, 
  FileSpreadsheet, 
  FileText
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { SectorOperationMechanismPage } from "../types";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface PageProps {
  data: SectorOperationMechanismPage;
  lang: "ar" | "en";
  theme: "light" | "dark";
  viewMode: "desktop" | "tablet" | "mobile";
}

// Colors mandated:
// Local Operation Only = #F59E0B
// Monitoring Only = #3B82F6
// Monitoring & Control = #22C55E
// CENTRAL_PARTIAL_LOCAL = #8B5CF6
// LEGACY_OPERATION = #64748B
const getMechanismColor = (controlValue?: string, controlEn?: string) => {
  const norm = (controlValue || controlEn || "").toLowerCase();
  if (norm.includes("local_only") || norm.includes("local operation only") || norm.includes("local_operation_only")) return "#F59E0B";
  if (norm.includes("monitoring_only") || norm.includes("monitoring only")) return "#3B82F6";
  if (norm.includes("monitoring_and_control") || norm.includes("monitoring & control") || norm.includes("monitoring_control")) return "#22C55E";
  if (norm.includes("central_partial_local") || norm.includes("central + partial local") || norm.includes("partial")) return "#8B5CF6";
  if (norm.includes("legacy_operation") || norm.includes("legacy operation") || norm.includes("legacy")) return "#64748B";
  return "#64748B"; // default
};

export function PageSectorOperationMechanism({ data, lang, theme, viewMode }: PageProps) {
  const isRtl = lang === "ar";
  const isDark = theme === "dark";

  // Filter state
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMechanism, setSelectedMechanism] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");

  // Sorting state
  const [sortField, setSortField] = useState<"date" | "zone" | "mechanism">("zone");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const t = {
    title: isRtl ? "آلية تشغيل القطاعات" : "Sector Operation Mechanism",
    searchPlaceholder: isRtl ? "بحث في هذا الجدول..." : "Search this table...",
    allZones: isRtl ? "جميع القطاعات" : "All Sectors",
    allMechanisms: isRtl ? "جميع الآليات" : "All Mechanisms",
    colDate: isRtl ? "التاريخ" : "Date",
    colDay: isRtl ? "اليوم" : "Day",
    colZone: isRtl ? "القطاع" : "Sector",
    colMechanism: isRtl ? "آلية التشغيل" : "Operation Mechanism",
    colStatVal: isRtl ? "القيمة الإحصائية" : "Statistical Value",
    colNotes: isRtl ? "الملاحظات" : "Notes",
    exportBtnExcel: isRtl ? "تصدير Excel" : "Export Excel",
    exportBtnPdf: isRtl ? "تصدير PDF" : "Export PDF",
    noRecords: isRtl ? "لا توجد سجلات مطابقة" : "No matching records found",
    totalCount: isRtl ? "إجمالي السجلات: " : "Total Records: ",
    distTitle: isRtl ? "توزيع قنوات التحكم وآليات العمل" : "Control Distribution Framework"
  };

  // Helper to obtain standardized mechanism values robustly
  const getMechanismNormalized = (row: any): string => {
    if (row.control_value) {
      const cv = String(row.control_value).toUpperCase();
      if (["LOCAL_OPERATION_ONLY", "MONITORING_ONLY", "MONITORING_AND_CONTROL", "CENTRAL_PARTIAL_LOCAL", "LEGACY_OPERATION"].includes(cv)) {
        return cv;
      }
    }
    const val = (row.control_type_ar || row.control_en || row["آلية التشغيل"] || row.control_type || "").toLowerCase();
    if (val.includes("محلي") || val.includes("local")) return "LOCAL_OPERATION_ONLY";
    if (val.includes("مراقبة وتحكم") || val.includes("monitoring & control") || val.includes("monitoring_and_control") || val.includes("كامل")) return "MONITORING_AND_CONTROL";
    if (val.includes("مراقبة فقط") || val.includes("monitoring only") || val.includes("monitoring_only")) return "MONITORING_ONLY";
    if (val.includes("مركزي") || val.includes("central")) return "CENTRAL_PARTIAL_LOCAL";
    if (val.includes("قديم") || val.includes("legacy")) return "LEGACY_OPERATION";
    return "LEGACY_OPERATION";
  };

  // Find the latest registered date from rows
  const latestDate = useMemo(() => {
    if (!data.rows || data.rows.length === 0) return null;
    const dates = data.rows.map(r => r.date).filter(Boolean);
    if (dates.length === 0) return null;
    dates.sort((a, b) => b.localeCompare(a));
    return dates[0];
  }, [data.rows]);

  // Keep only rows belonging to the latest date
  const latestRows = useMemo(() => {
    if (!latestDate) return data.rows;
    return data.rows.filter(r => r.date === latestDate);
  }, [data.rows, latestDate]);

  // Dynamically compute summary indicators based on the latest day's rows only
  const computedSummary = useMemo(() => {
    const total = latestRows.length;
    
    const local_only = latestRows.filter(r => getMechanismNormalized(r) === "LOCAL_OPERATION_ONLY").length;
    const monitoring_only = latestRows.filter(r => getMechanismNormalized(r) === "MONITORING_ONLY").length;
    const monitoring_and_control = latestRows.filter(r => getMechanismNormalized(r) === "MONITORING_AND_CONTROL").length;
    const legacy_operation = latestRows.filter(r => getMechanismNormalized(r) === "LEGACY_OPERATION").length;
    const central_partial_local = latestRows.filter(r => getMechanismNormalized(r) === "CENTRAL_PARTIAL_LOCAL").length;

    return {
      total_records: total,
      local_operation_only_count: local_only,
      monitoring_only_count: monitoring_only,
      monitoring_and_control_count: monitoring_and_control,
      legacy_operation_count: legacy_operation,
      central_partial_local_count: central_partial_local
    };
  }, [latestRows]);

  // Dynamically compute KPIs
  const computedKpis = useMemo(() => {
    const s = computedSummary;
    const total = s.total_records || 1;
    return [
      {
        title_ar: "تشغيل محلي فقط",
        title_en: "Local Operation Only",
        value: s.local_operation_only_count,
        percentage: Math.round((s.local_operation_only_count / total) * 100)
      },
      {
        title_ar: "مراقبة فقط",
        title_en: "Monitoring Only",
        value: s.monitoring_only_count,
        percentage: Math.round((s.monitoring_only_count / total) * 100)
      },
      {
        title_ar: "مراقبة وتحكم",
        title_en: "Monitoring & Control",
        value: s.monitoring_and_control_count,
        percentage: Math.round((s.monitoring_and_control_count / total) * 100)
      },
      {
        title_ar: "تشغيل عبر النظام القديم",
        title_en: "Legacy Operation",
        value: s.legacy_operation_count,
        percentage: Math.round((s.legacy_operation_count / total) * 100)
      }
    ];
  }, [computedSummary]);

  // Dynamically compute Charts data
  const computedChartData = useMemo(() => {
    const s = computedSummary;
    return {
      control_distribution: [
        { label_ar: "تشغيل محلي فقط", label_en: "Local Operation Only", value: s.local_operation_only_count },
        { label_ar: "مراقبة فقط", label_en: "Monitoring Only", value: s.monitoring_only_count },
        { label_ar: "مراقبة وتحكم", label_en: "Monitoring & Control", value: s.monitoring_and_control_count },
        { label_ar: "تشغيل مركزي مع دعم محلي جزئي", label_en: "Central + Partial Local", value: s.central_partial_local_count },
        { label_ar: "تشغيل عبر النظام القديم", label_en: "Legacy Operation", value: s.legacy_operation_count }
      ]
    };
  }, [computedSummary]);

  // Extract unique options
  const uniqueZones = useMemo(() => {
    const list = (data.rows || []).map(r => r.zone);
    return Array.from(new Set(list)).sort();
  }, [data.rows]);

  const uniqueMechanisms = useMemo(() => {
    const list = (data.rows || []).map(r => r.control_type_ar);
    return Array.from(new Set(list));
  }, [data.rows]);

  // Handle KPI interaction
  const handleKpiClick = (type: string | undefined) => {
    if (!type) {
      setActiveKpiFilter(null);
    } else {
      setActiveKpiFilter(prev => prev === type ? null : type);
    }
  };

  // Filter rows using all records to show full history
  const filteredRows = useMemo(() => {
    return (data.rows || []).filter(row => {
      // Search
      const matchesSearch = searchQuery === "" || 
        [row.date, row.day_ar, row.zone, row.control_type_ar, row.control_en, row.control_value, row.notes]
          .some(field => (field || "").toString().toLowerCase().includes(searchQuery.toLowerCase()));

      // KPI card filter (matching control_type_ar or control_en closely)
      let matchesKpi = true;
      if (activeKpiFilter) {
        matchesKpi = row.control_type_ar.includes(activeKpiFilter) || 
                     row.control_en.toLowerCase().includes(activeKpiFilter.toLowerCase()) ||
                     row.control_value.toLowerCase().includes(activeKpiFilter.toLowerCase());
      }

      // Mechanism dropdown filter
      const matchesMechanism = selectedMechanism === "all" || row.control_type_ar === selectedMechanism;

      // Zone filter
      const matchesZone = selectedZone === "all" || row.zone === selectedZone;

      return matchesSearch && matchesKpi && matchesMechanism && matchesZone;
    });
  }, [data.rows, searchQuery, activeKpiFilter, selectedMechanism, selectedZone]);

  // Sort rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "mechanism") {
        aVal = isRtl ? a.control_type_ar : a.control_en;
        bVal = isRtl ? b.control_type_ar : b.control_en;
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === "asc"
          ? (aVal || 0) - (bVal || 0)
          : (bVal || 0) - (aVal || 0);
      }
    });
    return sorted;
  }, [filteredRows, sortField, sortDirection, isRtl]);

  // Sort handler
  const handleSort = (field: "date" | "zone" | "mechanism") => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Exports
  const handleExportExcel = () => {
    const payload = sortedRows.map(r => ({
      [t.colDate]: r.date,
      [t.colDay]: r.day_ar,
      [t.colZone]: r.zone,
      [t.colMechanism]: isRtl ? r.control_type_ar : r.control_en,
      [t.colStatVal]: r.control_value,
      [t.colNotes]: r.notes
    }));
    const worksheet = XLSX.utils.json_to_sheet(payload);
    if (isRtl) worksheet["!views"] = [{ RTL: true }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t.title.substring(0, 31));
    XLSX.writeFile(workbook, `${t.title.replace(/\s+/g, "_")}_Export.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const headers = [[t.colDate, t.colDay, t.colZone, t.colMechanism, t.colStatVal, t.colNotes]];
    const body = sortedRows.map(r => [
      r.date,
      r.day_ar,
      r.zone,
      isRtl ? r.control_type_ar : r.control_en,
      r.control_value,
      r.notes
    ]);

    doc.text(t.title, 14, 15);
    (doc as any).autoTable({
      head: headers,
      body: body,
      startY: 22,
      styles: { font: "Helvetica", halign: isRtl ? "right" : "left" },
      headStyles: { fillColor: [79, 70, 229] }
    });
    doc.save(`${t.title.replace(/\s+/g, "_")}_Export.pdf`);
  };

  // Remap distribution colors if preset
  const finalDistribution = computedChartData.control_distribution.map(item => {
    return {
      ...item,
      color: getMechanismColor(undefined, item.label_en)
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
            {isRtl ? `قنوات التشغيل وآليات الرصد الميداني لآخر يوم مسجل (${latestDate || "-"})` : `Operational Pathways Framework for last registered day (${latestDate || "-"})`}
          </span>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-none">
            {data.title_ar && lang === "ar" ? data.title_ar : data.title_en || t.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-amber-55/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 font-extrabold rounded-lg border border-amber-500/20 text-[11px]">
            {isRtl ? "سجلات قنوات التحكم: " : "Control Channels: "} {computedSummary.total_records}
          </span>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {computedKpis.map((kpi, idx) => {
          const mandatedColor = getMechanismColor(undefined, kpi.title_en);
          return (
            <MetricCard
              key={idx}
              title={isRtl ? kpi.title_ar : kpi.title_en}
              value={kpi.value}
              percentage={kpi.percentage}
              type="custom"
              isActive={activeKpiFilter === kpi.title_en || activeKpiFilter === kpi.title_ar}
              onClick={() => handleKpiClick(kpi.title_en)}
              lang={lang}
              theme={theme}
              color={mandatedColor}
            />
          );
        })}
      </div>

      {/* Chart and distribution info */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-5 rounded-2xl flex flex-col justify-between">
          <div className="text-start pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-amber-500 rounded"></div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
              {t.distTitle}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-4">
            {/* Left Donut */}
            <div className="md:col-span-6 h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finalDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {finalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [val, isRtl ? "الوحدات" : "Units"]}
                    contentStyle={{
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      borderColor: isDark ? "#1E293B" : "#E2E8F0"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {isRtl ? "تشغيل محلي" : "Local Count"}
                </span>
                <span className="text-2xl font-black text-amber-500 mt-0.5">
                  {data.summary.local_operation_only_count} / {data.summary.total_records}
                </span>
              </div>
            </div>

            {/* Right Side list details */}
            <div className="md:col-span-6 space-y-3">
              {finalDistribution.map((entry, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-800 dark:text-gray-200">
                      {isRtl ? entry.label_ar : entry.label_en}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900 dark:text-white font-extrabold text-sm">{entry.value}</span>
                    <span className="text-[10px] text-gray-400 font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800">
                      {data.summary.total_records > 0 ? Math.round((entry.value / data.summary.total_records) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-2xl overflow-hidden shadow-xs">
        {/* Filter controls */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute top-1/2 left-3 rtl:left-auto rtl:right-3 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 text-gray-800 dark:text-gray-100 placeholder-gray-450 dark:placeholder-gray-550 transition-colors"
              />
            </div>

            <select
              value={selectedMechanism}
              onChange={(e) => setSelectedMechanism(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
            >
              <option value="all">{t.allMechanisms}</option>
              {uniqueMechanisms.map((mech, i) => (
                <option key={i} value={mech}>{mech}</option>
              ))}
            </select>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
            >
              <option value="all">{t.allZones}</option>
              {uniqueZones.map((z, i) => (
                <option key={i} value={z}>{z}</option>
              ))}
            </select>

            {activeKpiFilter && (
              <button
                onClick={() => setActiveKpiFilter(null)}
                className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-350 text-[10px] font-bold rounded-md hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                {isRtl ? "مسح فلتر البطاقات" : "Clear card filter"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <span className="text-[11px] font-bold text-gray-450 px-2">
              {t.totalCount} <strong className="text-amber-500 font-mono text-xs">{sortedRows.length}</strong>
            </span>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all cursor-pointer"
              title={t.exportBtnExcel}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRtl ? "إكسل" : "Excel"}</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all cursor-pointer"
              title={t.exportBtnPdf}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRtl ? "بي دي إف" : "PDF"}</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
          <table className="w-full border-collapse text-center text-xs min-w-[700px]">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-950 text-gray-550 dark:text-gray-400 font-black border-b border-gray-100 dark:border-gray-800 z-10 select-none">
              <tr>
                <th onClick={() => handleSort("date")} className="p-4 text-center hover:text-amber-500 cursor-pointer">
                  <div className="flex items-center justify-center gap-1">
                    {t.colDate} <ArrowUpDown className="w-3 h-3 shrink-0" />
                  </div>
                </th>
                <th className="p-4 text-center">{t.colDay}</th>
                <th onClick={() => handleSort("zone")} className="p-4 text-center hover:text-amber-500 cursor-pointer">
                  <div className="flex items-center justify-center gap-1">
                    {t.colZone} <ArrowUpDown className="w-3 h-3 shrink-0" />
                  </div>
                </th>
                <th onClick={() => handleSort("mechanism")} className="p-4 text-center hover:text-amber-500 cursor-pointer">
                  <div className="flex items-center justify-center gap-1">
                    {t.colMechanism} <ArrowUpDown className="w-3 h-3 shrink-0" />
                  </div>
                </th>
                <th className="p-4 text-center">{t.colStatVal}</th>
                <th className="p-4 text-center max-w-sm">{t.colNotes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-850 font-medium whitespace-nowrap">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-bold">
                    {t.noRecords}
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => {
                  const itemColor = getMechanismColor(row.control_value, row.control_en);
                  return (
                    <tr 
                      key={row.id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="p-4 text-center font-mono font-semibold text-slate-500 dark:text-slate-400">{row.date}</td>
                      <td className="p-4 text-center text-slate-500 dark:text-slate-400">{row.day_ar}</td>
                      <td className="p-4 text-center font-bold text-gray-900 dark:text-white">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800/70">{row.zone}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black mx-auto"
                          style={{ backgroundColor: `${itemColor}15`, color: itemColor }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: itemColor }} />
                          {isRtl ? row.control_type_ar : row.control_en}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-xs text-gray-450 dark:text-gray-500 font-bold">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-black max-w-xs">{row.control_value}</code>
                      </td>
                      <td className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 max-w-sm font-medium leading-relaxed truncate hover:text-clip hover:whitespace-normal">
                        {row.notes}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
