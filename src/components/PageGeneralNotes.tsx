import React, { useState, useMemo } from "react";
import { 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  Inbox,
  FileSpreadsheet, 
  FileText
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { GeneralNotesPage } from "../types";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface PageProps {
  data: GeneralNotesPage;
  lang: "ar" | "en";
  theme: "light" | "dark";
  viewMode: "desktop" | "tablet" | "mobile";
}

export function PageGeneralNotes({ data, lang, theme, viewMode }: PageProps) {
  const isRtl = lang === "ar";

  // State
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Sorting
  const [sortField, setSortField] = useState<"id" | "last_update" | "severity">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const t = {
    title: isRtl ? "ملاحظات عامة" : "General Notes & Observations Table",
    searchPlaceholder: isRtl ? "بحث في الملاحظات والبيانات..." : "Search statements & sites...",
    allSeverities: isRtl ? "جميع مستويات الأهمية" : "All Importance Levels",
    allStatuses: isRtl ? "جميع الحالات" : "All Statuses",
    colId: isRtl ? "رقم" : "No.",
    colStatement: isRtl ? "البيان" : "Statement",
    colSector: isRtl ? "القطاع / الموقع" : "Sector / Site",
    colAction: isRtl ? "الإجراء" : "Action",
    colLastUpdate: isRtl ? "آخر تحديث" : "Last Update",
    colSeverity: isRtl ? "مستوى الأهمية" : "Importance Level",
    colStatus: isRtl ? "حالة الملاحظة" : "Note Status",
    exportBtnExcel: isRtl ? "تصدير Excel" : "Export Excel",
    exportBtnPdf: isRtl ? "تصدير PDF" : "Export PDF",
    noRecords: isRtl ? "لا توجد ملاحظات مطابقة" : "No notes match active filters",
    totalCount: isRtl ? "إجمالي الملاحظات: " : "Total Notes: ",
    openStatus: isRtl ? "جديدة / مفتوحة" : "Open / Active",
    resolvedStatus: isRtl ? "معالجة" : "Resolved",
    highSev: isRtl ? "عالية الأهمية" : "High Severity",
    medSev: isRtl ? "متوسطة" : "Medium",
    lowSev: isRtl ? "منخفضة" : "Low"
  };

  // Find the latest registered date from rows
  const latestDate = useMemo(() => {
    if (!data.rows || data.rows.length === 0) return null;
    const dates = data.rows.map(r => r.last_update).filter(Boolean);
    if (dates.length === 0) return null;
    dates.sort((a, b) => b.localeCompare(a));
    return dates[0];
  }, [data.rows]);

  // Keep only rows belonging to the latest date
  const latestRows = useMemo(() => {
    if (!latestDate) return data.rows;
    return data.rows.filter(r => r.last_update === latestDate);
  }, [data.rows, latestDate]);

  // Dynamically compute summary indicators based on the latest day's rows only
  const computedSummary = useMemo(() => {
    const total = latestRows.length;
    const open_notes = latestRows.filter(r => r.status === "open").length;
    const resolved_notes = latestRows.filter(r => r.status === "resolved").length;
    const high_severity_count = latestRows.filter(r => r.severity === "high").length;

    return {
      total_notes: total,
      open_notes: open_notes,
      resolved_notes: resolved_notes,
      high_severity_count: high_severity_count
    };
  }, [latestRows]);

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
      // Search Box filter
      const matchesSearch = searchQuery === "" || 
        [row.statement, row.sector_or_site, row.action, (row.last_update || (row as any).date), row.status, row.severity]
          .some(field => (field || "").toString().toLowerCase().includes(searchQuery.toLowerCase()));

      // KPI filter (choices: open, resolved, high)
      let matchesKpi = true;
      if (activeKpiFilter) {
        const norm = activeKpiFilter.toLowerCase();
        if (norm === "open") {
          matchesKpi = (row.status || "").toLowerCase().includes("open") || (row.status || "").includes("لم يعالج") || (row.status || "").includes("مفتو") || (row.status || "").includes("نشط");
        } else if (norm === "resolved") {
          matchesKpi = (row.status || "").toLowerCase().includes("resolved") || (row.status || "").includes("معالج") || (row.status || "").toLowerCase().includes("closed");
        } else if (norm === "high") {
          matchesKpi = (row.severity || "").toLowerCase() === "high" || (row.severity || "").toLowerCase() === "عالية";
        }
      }

      // Dropdown severity filter
      const matchesSeverity = selectedSeverity === "all" || row.severity === selectedSeverity;

      // Dropdown status filter
      const matchesStatus = selectedStatus === "all" || row.status === selectedStatus;

      return matchesSearch && matchesKpi && matchesSeverity && matchesStatus;
    });
  }, [data.rows, searchQuery, activeKpiFilter, selectedSeverity, selectedStatus]);

  // Sort rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

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
  }, [filteredRows, sortField, sortDirection]);

  // Sort toggle handler
  const handleSort = (field: "id" | "last_update" | "severity") => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExportExcel = () => {
    const payload = sortedRows.map(r => ({
      [t.colId]: r.id,
      [t.colStatement]: r.statement,
      [t.colSector]: r.sector_or_site,
      [t.colAction]: r.action,
      [t.colLastUpdate]: r.last_update,
      [t.colSeverity]: r.severity === "high" ? t.highSev : r.severity === "medium" ? t.medSev : t.lowSev,
      [t.colStatus]: r.status === "open" ? t.openStatus : t.resolvedStatus
    }));
    const worksheet = XLSX.utils.json_to_sheet(payload);
    if (isRtl) worksheet["!views"] = [{ RTL: true }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "General_Notes");
    XLSX.writeFile(workbook, "General_Observations_Export.xlsx");
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const headers = [[t.colId, t.colStatement, t.colSector, t.colAction, t.colLastUpdate, t.colSeverity, t.colStatus]];
    const body = sortedRows.map(r => [
      r.id,
      r.statement,
      r.sector_or_site,
      r.action,
      r.last_update,
      r.severity === "high" ? t.highSev : r.severity === "medium" ? t.medSev : t.lowSev,
      r.status === "open" ? t.openStatus : t.resolvedStatus
    ]);

    doc.text(t.title, 14, 15);
    (doc as any).autoTable({
      head: headers,
      body: body,
      startY: 22,
      styles: { font: "Helvetica", halign: isRtl ? "right" : "left", fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }
    });
    doc.save("General_Observations_Export.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            {isRtl ? `الملاحظات الإستراتيجية والرقابية للشبكة لآخر يوم مسجل (${latestDate || "-"})` : `Active Strategic Observations for last registered day (${latestDate || "-"})`}
          </span>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-none border-b border-indigo-500 pb-1">
            {isRtl ? data.title_ar : data.title_en || t.title}
          </h2>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total notes card */}
        <MetricCard
          title={isRtl ? "إجمالي الملاحظات" : "Total Notes"}
          value={computedSummary.total_notes}
          type="total"
          isActive={activeKpiFilter === null}
          onClick={() => handleKpiClick("total")}
          lang={lang}
          theme={theme}
        />
        {/* Open notes card */}
        <MetricCard
          title={isRtl ? "الملاحظات المفتوحة" : "Open Notes"}
          value={computedSummary.open_notes}
          type="out_of_service"
          percentage={computedSummary.total_notes > 0 ? Math.round((computedSummary.open_notes / computedSummary.total_notes) * 100) : 0}
          isActive={activeKpiFilter === "open"}
          onClick={() => handleKpiClick("open")}
          lang={lang}
          theme={theme}
        />
        {/* Resolved notes card */}
        <MetricCard
          title={isRtl ? "الملاحظات المعالجة" : "Resolved Notes"}
          value={computedSummary.resolved_notes}
          type="stable"
          percentage={computedSummary.total_notes > 0 ? Math.round((computedSummary.resolved_notes / computedSummary.total_notes) * 100) : 0}
          isActive={activeKpiFilter === "resolved"}
          onClick={() => handleKpiClick("resolved")}
          lang={lang}
          theme={theme}
        />
        {/* High severity notes card */}
        <MetricCard
          title={isRtl ? "ملاحظات عالية الأهمية" : "High Severity"}
          value={computedSummary.high_severity_count}
          type="fluctuating"
          percentage={computedSummary.total_notes > 0 ? Math.round((computedSummary.high_severity_count / computedSummary.total_notes) * 100) : 0}
          isActive={activeKpiFilter === "high"}
          onClick={() => handleKpiClick("high")}
          lang={lang}
          theme={theme}
        />
      </div>

      {/* Table observations list */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-2xl overflow-hidden shadow-xs">
        {/* Header toolbar */}
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
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
            >
              <option value="all">{t.allSeverities}</option>
              <option value="high">{t.highSev}</option>
              <option value="medium">{t.medSev}</option>
              <option value="low">{t.lowSev}</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="open">{t.openStatus}</option>
              <option value="resolved">{t.resolvedStatus}</option>
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
              {t.totalCount} <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-xs">{sortedRows.length}</strong>
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

        {/* Table representation */}
        <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
          <table className="w-full border-collapse text-center text-xs min-w-[750px]">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-950 text-gray-550 dark:text-gray-400 font-black border-b border-gray-100 dark:border-gray-800 z-10 select-none">
              <tr>
                <th onClick={() => handleSort("id")} className="p-4 text-center w-16 hover:text-indigo-550 cursor-pointer">
                  <div className="flex items-center justify-center gap-1">{t.colId} <ArrowUpDown className="w-3 h-3 shrink-0" /></div>
                </th>
                <th className="p-4 text-center max-w-lg">{t.colStatement}</th>
                <th className="p-4 text-center">{t.colSector}</th>
                <th className="p-4 text-center">{t.colAction}</th>
                <th onClick={() => handleSort("last_update")} className="p-4 text-center hover:text-indigo-550 cursor-pointer">
                  <div className="flex items-center justify-center gap-1">{t.colLastUpdate} <ArrowUpDown className="w-3 h-3 shrink-0" /></div>
                </th>
                <th onClick={() => handleSort("severity")} className="p-4 text-center hover:text-indigo-550 cursor-pointer">
                  <div className="flex items-center justify-center gap-1">{t.colSeverity} <ArrowUpDown className="w-3 h-3 shrink-0" /></div>
                </th>
                <th className="p-4 text-center">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-850 font-medium leading-relaxed whitespace-nowrap">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-bold">
                    {t.noRecords}
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="p-4 text-center font-mono font-black text-slate-400">{row.id}</td>
                    <td className="p-4 text-center max-w-lg text-gray-800 dark:text-gray-200 font-bold font-sans hover:text-clip hover:whitespace-normal">
                      {row.statement}
                    </td>
                    <td className="p-4 text-center font-black text-[#4F46E5] dark:text-[#818CF8]">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40">{row.sector_or_site}</span>
                    </td>
                    <td className="p-4 text-center font-medium text-gray-500 dark:text-gray-400 hover:text-clip hover:whitespace-normal">
                      {row.action || "-"}
                    </td>
                    <td className="p-4 text-center font-mono font-semibold text-slate-400">{row.last_update}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black mx-auto ${
                        row.severity === "high" 
                          ? "bg-rose-500/10 text-rose-500" 
                          : row.severity === "medium" 
                          ? "bg-amber-500/10 text-amber-500" 
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {row.severity === "high" ? t.highSev : row.severity === "medium" ? t.medSev : t.lowSev}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black mx-auto ${
                        row.status === "open" 
                          ? "bg-amber-55 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40" 
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                      }`}>
                        {row.status === "open" ? t.openStatus : t.resolvedStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
