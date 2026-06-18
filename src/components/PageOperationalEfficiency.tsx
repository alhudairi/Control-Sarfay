import React, { useState, useMemo } from "react";
import { 
  Search, 
  Download, 
  ArrowUpDown, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { OperationalEfficiencyPage } from "../types";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface PageProps {
  data: OperationalEfficiencyPage;
  lang: "ar" | "en";
  theme: "light" | "dark";
  viewMode: "desktop" | "tablet" | "mobile";
}

export function PageOperationalEfficiency({ data, lang, theme, viewMode }: PageProps) {
  const isRtl = lang === "ar";
  const isDark = theme === "dark";

  // Filter state
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");

  // Sorting state
  const [sortField, setSortField] = useState<"date" | "zone" | "status" | "health">("zone");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const t = {
    title: isRtl ? "كفاءة نظام التشغيل" : "Operational System Efficiency",
    searchPlaceholder: isRtl ? "بحث في هذا الجدول..." : "Search this table...",
    allZones: isRtl ? "جميع القطاعات" : "All Sectors",
    allStatuses: isRtl ? "جميع الحالات" : "All Statuses",
    colDate: isRtl ? "التاريخ" : "Date",
    colDay: isRtl ? "اليوم" : "Day",
    colZone: isRtl ? "القطاع" : "Sector",
    colStatus: isRtl ? "الحالة" : "Status",
    colHealth: isRtl ? "مؤشر الصحة" : "Health Index",
    colNotes: isRtl ? "الملاحظات" : "Notes",
    exportBtnExcel: isRtl ? "تصدير Excel" : "Export Excel",
    exportBtnPdf: isRtl ? "تصدير PDF" : "Export PDF",
    noRecords: isRtl ? "لا توجد سجلات مطابقة" : "No matching records found",
    totalCount: isRtl ? "إجمالي السجلات: " : "Total Records: ",
    statusDist: isRtl ? "توزيع حالات القطاعات" : "Sectors Status Distribution",
    healthChart: isRtl ? "تفاصيل مؤشر الصحة للقطاعات" : "Sectors Health Score Details",
    healthLabel: isRtl ? "مؤشر الصحة (%)" : "Health Score (%)"
  };

  // Helper to normalize and get status value robustly from live or mock row
  const getStatusNormalized = (row: any): string => {
    if (row.status_value) {
      const sv = String(row.status_value).toLowerCase();
      if (sv === "stable" || sv === "fluctuating" || sv === "out_of_service" || sv === "unknown") {
        return sv;
      }
    }
    const statusStr = (row.status_ar || row.status_en || row.status || row["الحالة"] || "").toLowerCase();
    if (statusStr.includes("مستقر") || statusStr.includes("stable") || statusStr.includes("green")) return "stable";
    if (statusStr.includes("متذبذب") || statusStr.includes("fluctuating") || statusStr.includes("yellow")) return "fluctuating";
    if (statusStr.includes("خارج") || statusStr.includes("out") || statusStr.includes("تعطل") || statusStr.includes("red")) return "out_of_service";
    return "unknown";
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
    const stable = latestRows.filter(r => getStatusNormalized(r) === "stable").length;
    const fluctuating = latestRows.filter(r => getStatusNormalized(r) === "fluctuating").length;
    const outOfService = latestRows.filter(r => getStatusNormalized(r) === "out_of_service").length;
    const unknown = latestRows.filter(r => getStatusNormalized(r) === "unknown").length;
    
    const efficiency = total > 0 ? Math.round((stable / total) * 100) : 86;
    const risk = total > 0 ? Math.round(((outOfService + fluctuating) / total) * 100) : 14;

    return {
      total_zones: total,
      stable_zones: stable,
      fluctuating_zones: fluctuating,
      out_of_service_zones: outOfService,
      unknown_zones: unknown,
      efficiency_rate_percent: efficiency,
      risk_rate_percent: risk,
      overall_status_ar: efficiency >= 90 ? "مستقر وممتاز" : efficiency >= 70 ? "يتطلب الانتباه" : "خطر / صيانة طارئة",
      overall_status_en: efficiency >= 90 ? "Stable & Excellent" : efficiency >= 70 ? "Attention Required" : "Critical / High Risk"
    };
  }, [latestRows]);

  // Dynamically compute KPIs
  const computedKpis = useMemo(() => {
    const s = computedSummary;
    return [
      { title_ar: "إجمالي القطاعات", title_en: "Total Zones", value: s.total_zones, type: "total" },
      { title_ar: "مستقر", title_en: "Stable", value: s.stable_zones, percentage: Math.round((s.stable_zones / (s.total_zones || 1)) * 100), color: "#22C55E", type: "stable" },
      { title_ar: "متذبذب", title_en: "Fluctuating", value: s.fluctuating_zones, percentage: Math.round((s.fluctuating_zones / (s.total_zones || 1)) * 100), color: "#EAB308", type: "fluctuating" },
      { title_ar: "خارج الخدمة", title_en: "Out of Service", value: s.out_of_service_zones, percentage: Math.round((s.out_of_service_zones / (s.total_zones || 1)) * 100), color: "#EF4444", type: "out_of_service" }
    ];
  }, [computedSummary]);

  // Dynamically compute Charts data
  const computedChartData = useMemo(() => {
    const s = computedSummary;
    const statusDistribution = [
      { label_ar: "مستقر", label_en: "Stable", value: s.stable_zones, color: "#22C55E" },
      { label_ar: "متذبذب", label_en: "Fluctuating", value: s.fluctuating_zones, color: "#EAB308" },
      { label_ar: "خارج الخدمة", label_en: "Out of Service", value: s.out_of_service_zones, color: "#EF4444" },
      { label_ar: "غير معروف", label_en: "Unknown", value: s.unknown_zones, color: "#94A3B8" }
    ];

    const zonesHealth = latestRows.map(r => ({
      zone: r.zone,
      health_score: r.health_score ?? 100,
      status: isRtl ? (r.status_ar || "مستقر") : (r.status_en || "Stable"),
      color: r.color || "#22C55E",
      severity: r.severity || "low"
    }));

    return {
      status_distribution: statusDistribution,
      zones_health: zonesHealth
    };
  }, [computedSummary, latestRows, isRtl]);

  // Extract unique filter options
  const uniqueZones = useMemo(() => {
    const list = (data.rows || []).map(r => r.zone);
    return Array.from(new Set(list)).sort();
  }, [data.rows]);

  const uniqueStatuses = useMemo(() => {
    const list = (data.rows || []).map(r => getStatusNormalized(r));
    return Array.from(new Set(list));
  }, [data.rows]);

  // Handle KPI click - filters table
  const handleKpiClick = (type: string | undefined) => {
    if (!type || type === "total") {
      setActiveKpiFilter(null);
    } else {
      setActiveKpiFilter(prev => prev === type ? null : type);
    }
  };

  // Filter rows using all records to show full history
  const filteredRows = useMemo(() => {
    return (data.rows || []).filter(row => {
      // Search Box filter (fields: date, day_ar, zone, status_ar, status_en, notes)
      const matchesSearch = searchQuery === "" || 
        [row.date, row.day_ar, row.zone, row.status_ar, row.status_en, row.notes]
          .some(field => (field || "").toString().toLowerCase().includes(searchQuery.toLowerCase()));

      // KPI card filter
      let matchesKpi = true;
      if (activeKpiFilter) {
        matchesKpi = getStatusNormalized(row).toLowerCase() === activeKpiFilter.toLowerCase();
      }

      // Status dropdown filter
      const matchesStatus = selectedStatus === "all" || getStatusNormalized(row) === selectedStatus;

      // Sector dropdown filter
      const matchesZone = selectedZone === "all" || row.zone === selectedZone;

      return matchesSearch && matchesKpi && matchesStatus && matchesZone;
    });
  }, [data.rows, searchQuery, activeKpiFilter, selectedStatus, selectedZone]);

  // Sort rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField === "health" ? "health_score" : sortField];
      let bVal: any = b[sortField === "health" ? "health_score" : sortField];

      if (sortField === "status") {
        aVal = isRtl ? a.status_ar : a.status_en;
        bVal = isRtl ? b.status_ar : b.status_en;
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

  // Sort toggle handler
  const handleSort = (field: "date" | "zone" | "status" | "health") => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Export visible rows to Excel
  const handleExportExcel = () => {
    const payload = sortedRows.map(r => ({
      [t.colDate]: r.date,
      [t.colDay]: r.day_ar,
      [t.colZone]: r.zone,
      [t.colStatus]: isRtl ? r.status_ar : r.status_en,
      [t.colHealth]: `${r.health_score}%`,
      [t.colNotes]: r.notes
    }));
    const worksheet = XLSX.utils.json_to_sheet(payload);
    if (isRtl) {
      worksheet["!views"] = [{ RTL: true }];
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t.title.substring(0, 31));
    XLSX.writeFile(workbook, `${t.title.replace(/\s+/g, "_")}_Export.xlsx`);
  };

  // Export visible rows to PDF
  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const headers = [[t.colDate, t.colDay, t.colZone, t.colStatus, t.colHealth, t.colNotes]];
    const body = sortedRows.map(r => [
      r.date,
      r.day_ar,
      r.zone,
      isRtl ? r.status_ar : r.status_en,
      `${r.health_score}%`,
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

  return (
    <div style={{ backgroundColor: "#FFFFFF" }} className="space-y-6 p-6 min-h-screen text-[#1E293B]">
      {/* 1. Page Header Info Box */}
      <div style={{ backgroundColor: "#FFFFFF" }} className="p-4 border border-gray-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "#334155" }}>
            {isRtl ? `البيانات الفنية الحالية لكفاءة نظام التشغيل لآخر يوم مسجل (${latestDate || "-"})` : `Operational Efficiency Telemetry for last registered day (${latestDate || "-"})`}
          </span>
          <h2 className="text-base font-extrabold leading-none" style={{ color: "#0F172A" }}>
            {data.title_ar && lang === "ar" ? data.title_ar : data.title_en || t.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 font-extrabold rounded-lg border" style={{ backgroundColor: "#DCFCE7", color: "#166534", borderColor: "#BBF7D0" }}>
            {isRtl ? "معدل الكفاءة العام: " : "Global Efficiency: "} {computedSummary.efficiency_rate_percent}%
          </span>
          <span className="px-3 py-1 font-extrabold rounded-lg border" style={{ backgroundColor: "#FEE2E2", color: "#991B1B", borderColor: "#FECACA" }}>
            {isRtl ? "نسبة المخاطر: " : "Risk: "} {computedSummary.risk_rate_percent}%
          </span>
        </div>
      </div>

      {/* 2. KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {computedKpis.map((kpi, idx) => (
          <MetricCard
            key={idx}
            title={isRtl ? kpi.title_ar : kpi.title_en}
            value={kpi.value}
            percentage={kpi.percentage}
            type={kpi.type || "total"}
            color={kpi.color}
            isActive={activeKpiFilter === kpi.type}
            onClick={() => handleKpiClick(kpi.type)}
            lang={lang}
            theme="light"
          />
        ))}
      </div>

      {/* 3. Analytics Charts Grid */}
      <div style={{ backgroundColor: "#FFFFFF" }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 border border-gray-200 rounded-2xl">
        {/* Chart A: Donut Status Distribution */}
        <div style={{ backgroundColor: "#FFFFFF" }} className="border border-gray-200 p-5 rounded-2xl flex flex-col justify-between">
          <div className="text-start pb-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-600 rounded"></div>
            <h3 className="text-sm font-extrabold" style={{ color: "#0F172A" }}>
              {t.statusDist}
            </h3>
          </div>
          <div className="h-64 mt-4 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={computedChartData.status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {computedChartData.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => [val, isRtl ? "مجموع الوحدات" : "Total Units"]}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#0F172A",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                  itemStyle={{ color: "#FFFFFF" }}
                  labelStyle={{ color: "#FFFFFF" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xs font-bold tracking-wider" style={{ color: "#475569" }}>
                {isRtl ? "إجمالي القطاعات" : "Total Zones"}
              </span>
              <span className="text-2xl font-black mt-0.5" style={{ color: "#0F172A" }}>
                {computedSummary.total_zones}
              </span>
            </div>
          </div>
          {/* Legend indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-gray-100 text-xs">
            {computedChartData.status_distribution.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="font-semibold" style={{ color: "#334155" }}>
                  {isRtl ? entry.label_ar : entry.label_en}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart B: Horizontal Bar Chart - Zones Health Scores */}
        <div style={{ backgroundColor: "#FFFFFF" }} className="border border-gray-200 p-5 rounded-2xl flex flex-col justify-between">
          <div className="text-start pb-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-600 rounded"></div>
            <h3 className="text-sm font-extrabold" style={{ color: "#0F172A" }}>
              {t.healthChart}
            </h3>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={computedChartData.zones_health}
                layout="vertical"
                margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#CBD5E1" opacity={0.3} />
                <XAxis type="number" domain={[0, 100]} stroke="#334155" fontSize={10} tick={{ fill: "#334155", fontWeight: "bold" }} />
                <YAxis dataKey="zone" type="category" stroke="#334155" fontSize={9} width={90} tick={{ fill: "#334155", fontWeight: "bold" }} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, t.healthLabel]}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#0F172A",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                  itemStyle={{ color: "#FFFFFF" }}
                  labelStyle={{ color: "#FFFFFF" }}
                />
                <Bar dataKey="health_score" radius={[0, 4, 4, 0]}>
                  {computedChartData.zones_health.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#4F46E5"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-center pt-2" style={{ color: "#475569" }}>
            * {isRtl ? "مؤشر 100 يعني كفاءة واستقرار كامل." : "Score of 100 means high performance."}
          </div>
        </div>
      </div>

      {/* 4. Table Controls and List */}
      <div style={{ backgroundColor: "#FFFFFF" }} className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Header Filter controls */}
        <div style={{ backgroundColor: "#FFFFFF" }} className="p-5 border-b border-gray-200 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute top-1/2 left-3 rtl:left-auto rtl:right-3 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ backgroundColor: "#FFFFFF", color: "#1E293B", borderColor: "#CBD5E1" }}
                className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 placeholder-[#64748B] transition-colors"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ backgroundColor: "#FFFFFF", color: "#1E293B", borderColor: "#CBD5E1" }}
              className="px-3 py-1.5 border text-xs font-semibold rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
            >
              <option value="all">{t.allStatuses}</option>
              {uniqueStatuses.map((st, i) => (
                <option key={i} value={st}>
                  {isRtl ? (st === "stable" ? "مستقر" : st === "fluctuating" ? "متذبذب" : "خارج الخدمة") : st}
                </option>
              ))}
            </select>

            {/* Zone Dropdown */}
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              style={{ backgroundColor: "#FFFFFF", color: "#1E293B", borderColor: "#CBD5E1" }}
              className="px-3 py-1.5 border text-xs font-semibold rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
            >
              <option value="all">{t.allZones}</option>
              {uniqueZones.map((z, i) => (
                <option key={i} value={z}>{z}</option>
              ))}
            </select>

            {/* KPI active link reset */}
            {activeKpiFilter && (
              <button
                onClick={() => setActiveKpiFilter(null)}
                style={{ backgroundColor: "#F1F5F9", color: "#1E293B" }}
                className="px-2.5 py-1 text-[10px] font-bold rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {isRtl ? "مسح فلتر البطاقات" : "Clear card filter"}
              </button>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <span className="text-[11px] font-bold px-2" style={{ color: "#475569" }}>
              {t.totalCount} <strong className="font-mono text-xs" style={{ color: "#0F172A" }}>{sortedRows.length}</strong>
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

        {/* Scrollable table container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
          <table className="w-full border-collapse text-center text-xs min-w-[700px]" style={{ borderColor: "#CBD5E1" }}>
            <thead className="sticky top-0 sticky-header text-gray-450 dark:text-gray-400 font-black border-b z-10 select-none" style={{ backgroundColor: "#F8FAFC", borderBottomColor: "#CBD5E1" }}>
              <tr>
                <th onClick={() => handleSort("date")} className="p-4 text-center hover:text-indigo-650 cursor-pointer" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>
                  <div className="flex items-center justify-center gap-1">
                    {t.colDate} <ArrowUpDown className="w-3 h-3 shrink-0" />
                  </div>
                </th>
                <th className="p-4 text-center" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>{t.colDay}</th>
                <th onClick={() => handleSort("zone")} className="p-4 text-center hover:text-indigo-650 cursor-pointer" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>
                  <div className="flex items-center justify-center gap-1">
                    {t.colZone} <ArrowUpDown className="w-3 h-3 shrink-0" />
                  </div>
                </th>
                <th onClick={() => handleSort("status")} className="p-4 text-center hover:text-indigo-650 cursor-pointer" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>
                  <div className="flex items-center justify-center gap-1">
                    {t.colStatus} <ArrowUpDown className="w-3 h-3 shrink-0" />
                  </div>
                </th>
                <th onClick={() => handleSort("health")} className="p-4 text-center hover:text-indigo-650 cursor-pointer" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>
                  <div className="flex items-center justify-center gap-1">
                    {t.colHealth} <ArrowUpDown className="w-3 h-3 shrink-0" />
                  </div>
                </th>
                <th className="p-4 text-center max-w-sm" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>{t.colNotes}</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium whitespace-nowrap" style={{ borderColor: "#CBD5E1" }}>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-bold" style={{ color: "#475569" }}>
                    {t.noRecords}
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, rIdx) => {
                  const normStatus = getStatusNormalized(row);
                  let badgeBg = "#DCFCE7";
                  let badgeText = "#166534";
                  if (normStatus === "fluctuating") {
                    badgeBg = "#FEF3C7";
                    badgeText = "#92400E";
                  } else if (normStatus === "out_of_service") {
                    badgeBg = "#FEE2E2";
                    badgeText = "#991B1B";
                  } else if (normStatus === "unknown") {
                    badgeBg = "#F1F5F9";
                    badgeText = "#475569";
                  }

                  return (
                    <tr 
                      key={row.id || rIdx} 
                      className="hover:bg-slate-50/50 transition-colors"
                      style={{ borderBottom: "1px solid #CBD5E1" }}
                    >
                      <td className="p-4 text-center font-mono font-semibold" style={{ color: "#1E293B" }}>{row.date}</td>
                      <td className="p-4 text-center" style={{ color: "#1E293B" }}>{row.day_ar}</td>
                      <td className="p-4 text-center font-bold" style={{ color: "#1E293B" }}>
                        <span className="px-2 py-0.5 rounded" style={{ backgroundColor: "#F1F5F9", color: "#1E293B" }}>{row.zone}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black mx-auto"
                          style={{ backgroundColor: badgeBg, color: badgeText }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: badgeText }} />
                          {isRtl ? row.status_ar : row.status_en}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 bg-gray-200 h-1.5 rounded-full overflow-hidden shrink-0">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${row.health_score}%`,
                                backgroundColor: badgeText
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs font-extrabold" style={{ color: badgeText }}>
                            {row.health_score}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-xs max-w-sm font-medium leading-relaxed truncate hover:text-clip hover:whitespace-normal" style={{ color: "#475569" }}>
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
