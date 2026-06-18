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
    <div style={{ backgroundColor: "#FFFFFF" }} className="space-y-6 p-6 min-h-screen text-[#1E293B]">
      {/* Page Header */}
      <div style={{ backgroundColor: "#FFFFFF" }} className="p-4 border border-gray-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: "#334155" }}>
            {isRtl ? `الملاحظات الإستراتيجية والرقابية للشبكة لآخر يوم مسجل (${latestDate || "-"})` : `Active Strategic Observations for last registered day (${latestDate || "-"})`}
          </span>
          <h2 className="text-base font-extrabold pb-1 leading-none" style={{ color: "#0F172A", borderBottomColor: "#4F46E5" }}>
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
          theme="light"
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
          theme="light"
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
          theme="light"
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
          theme="light"
        />
      </div>

      {/* Table observations list */}
      <div style={{ backgroundColor: "#FFFFFF" }} className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Header toolbar */}
        <div style={{ backgroundColor: "#FFFFFF" }} className="p-5 border-b border-gray-200 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          <div className="flex flex-wrap items-center gap-3 flex-1">
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

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              style={{ backgroundColor: "#FFFFFF", color: "#1E293B", borderColor: "#CBD5E1" }}
              className="px-3 py-1.5 border text-xs font-semibold rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
            >
              <option value="all">{t.allSeverities}</option>
              <option value="high">{t.highSev}</option>
              <option value="medium">{t.medSev}</option>
              <option value="low">{t.lowSev}</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ backgroundColor: "#FFFFFF", color: "#1E293B", borderColor: "#CBD5E1" }}
              className="px-3 py-1.5 border text-xs font-semibold rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="open">{t.openStatus}</option>
              <option value="resolved">{t.resolvedStatus}</option>
            </select>

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

        {/* Table representation */}
        <div className="overflow-x-auto overflow-y-auto max-h-[480px]">
          <table className="w-full border-collapse text-center text-xs min-w-[750px]" style={{ borderColor: "#CBD5E1" }}>
            <thead className="sticky top-0 text-gray-550 font-black border-b z-10 select-none font-sans" style={{ backgroundColor: "#F8FAFC", borderBottomColor: "#CBD5E1" }}>
              <tr>
                <th onClick={() => handleSort("id")} className="p-4 text-center w-16 hover:text-indigo-650 cursor-pointer" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>
                  <div className="flex items-center justify-center gap-1">{t.colId} <ArrowUpDown className="w-3 h-3 shrink-0" /></div>
                </th>
                <th className="p-4 text-center max-w-lg" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>{t.colStatement}</th>
                <th className="p-4 text-center" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>{t.colSector}</th>
                <th className="p-4 text-center" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>{t.colAction}</th>
                <th onClick={() => handleSort("last_update")} className="p-4 text-center hover:text-indigo-650 cursor-pointer" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>
                  <div className="flex items-center justify-center gap-1">{t.colLastUpdate} <ArrowUpDown className="w-3 h-3 shrink-0" /></div>
                </th>
                <th onClick={() => handleSort("severity")} className="p-4 text-center hover:text-indigo-650 cursor-pointer" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>
                  <div className="flex items-center justify-center gap-1">{t.colSeverity} <ArrowUpDown className="w-3 h-3 shrink-0" /></div>
                </th>
                <th className="p-4 text-center" style={{ color: "#0F172A", borderBottom: "1px solid #CBD5E1" }}>{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium leading-relaxed whitespace-nowrap" style={{ borderColor: "#CBD5E1" }}>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-bold" style={{ color: "#475569" }}>
                    {t.noRecords}
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 text-center font-mono font-black border-b" style={{ color: "#475569", borderColor: "#CBD5E1" }}>{row.id}</td>
                    <td className="p-4 text-center max-w-lg font-bold font-sans hover:text-clip hover:whitespace-normal border-b" style={{ color: "#1E293B", borderColor: "#CBD5E1" }}>
                      {row.statement}
                    </td>
                    <td className="p-4 text-center font-black border-b" style={{ borderColor: "#CBD5E1" }}>
                      <span className="px-2 py-0.5 rounded text-indigo-700 font-bold" style={{ backgroundColor: "#EEF2F6" }}>{row.sector_or_site}</span>
                    </td>
                    <td className="p-4 text-center font-medium hover:text-clip hover:whitespace-normal border-b" style={{ color: "#475569", borderColor: "#CBD5E1" }}>
                      {row.action || "-"}
                    </td>
                    <td className="p-4 text-center font-mono font-semibold border-b" style={{ color: "#475569", borderColor: "#CBD5E1" }}>{row.last_update}</td>
                    <td className="p-4 text-center border-b" style={{ borderColor: "#CBD5E1" }}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black mx-auto ${
                        row.severity === "high" 
                          ? "bg-rose-100 text-rose-800" 
                          : row.severity === "medium" 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {row.severity === "high" ? t.highSev : row.severity === "medium" ? t.medSev : t.lowSev}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold border-b" style={{ borderColor: "#CBD5E1" }}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black mx-auto ${
                        row.status === "open" 
                          ? "bg-amber-100 text-amber-800 border border-amber-300" 
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
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
