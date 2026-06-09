import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle,
  AlertCircle,
  Inbox
} from "lucide-react";

const SHEET_DATA_URL = "https://docs.google.com/spreadsheets/d/1gogs_l2vk3ztn0k6j5ethA8XVUTTMDl10nUi8Uxc198/gviz/tq?tqx=out:json&sheet=%D9%85%D9%84%D8%A7%D8%AD%D8%B8%D8%A7%D8%AA%20%D8%B9%D8%A7%D9%85%D8%A9";

export interface ColumnDef {
  id: string;   // Column letter (e.g., "A", "B", "C", "D")
  label: string; // Dynamic header (e.g., "البيان", "القطاع / الموقع", etc.)
  type: string;
}

export interface RowData {
  id: number;
  [key: string]: any;
}

interface MajorIssuesTableProps {
  issues?: any[]; // Keep for prop-compatibility
  lang: "ar" | "en";
  theme?: "light" | "dark";
}

export function MajorIssuesTable({ lang, theme = "light" }: MajorIssuesTableProps) {
  const isRtl = lang === "ar";
  const isDark = theme === "dark";

  // Data states
  const [cols, setCols] = useState<ColumnDef[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter, search & sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Translation text
  const t = {
    title: isRtl ? "ملاحظات عامة" : "General Notes",
    subtitle: isRtl 
      ? "استعراض مباشر ومؤتمت لجدول الملاحظات العامة (item) من ورقة عمل جوجل شيتس" 
      : "Automated live view of the general notes table (item) directly from Google Sheets",
    searchPlaceholder: isRtl ? "البحث في جدول الملاحظات..." : "Search general notes...",
    allSectors: isRtl ? "تصفية: كل القطاعات" : "Filter: All Sectors",
    filterLabel: isRtl ? "القطاع / الموقع:" : "Sector / Location:",
    loadingText: isRtl ? "جاري جلب الملاحظات من Google Sheets..." : "Fetching active sheet logs from Google Sheets...",
    noIssues: isRtl ? "لا توجد ملاحظات عامة مسجلة في ورقة العمل حالياً" : "No general notes recorded in the worksheet at this time",
    noFilteredIssues: isRtl 
      ? "لا توجد نتائج مطابقة لخيارات البحث والتصفية" 
      : "No records found matching search query and filters",
    refreshBtn: isRtl ? "تحديث الآن" : "Refresh Logs",
    retryBtn: isRtl ? "إعادة المحاولة" : "Retry Connection",
    totalRows: isRtl ? "إجمالي السجلات:" : "Total Records:",
    idCol: isRtl ? "م" : "No."
  };

  // Primary fetch implementation from Google Sheet JSON visualization endpoint
  const fetchWorksheet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(SHEET_DATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const rawText = await response.text();
      
      // Gviz returns google.visualization.Query.setResponse({...})
      const startIdx = rawText.indexOf("google.visualization.Query.setResponse(");
      if (startIdx === -1) {
        throw new Error("Invalid Gviz response structure");
      }
      
      const jsonStr = rawText.substring(
        startIdx + "google.visualization.Query.setResponse(".length, 
        rawText.lastIndexOf(")")
      );
      
      const json = JSON.parse(jsonStr);
      if (json.status !== "ok" || !json.table) {
        throw new Error("Unable to parse smart sheet data");
      }
      
      // Parse columns dynamically to adhere to instructions:
      // "وإذا تمت إضافة أعمدة جديدة مستقبلاً: يجب أن تظهر تلقائياً داخل الجدول دون الحاجة لتعديل الكود."
      const responseCols: ColumnDef[] = json.table.cols.map((col: any, idx: number) => ({
        id: col.id || String.fromCharCode(65 + idx),
        label: col.label || `Column ${idx + 1}`,
        type: col.type || "string"
      }));
      
      // Map row attributes dynamically
      const responseRows: RowData[] = json.table.rows.map((row: any, rIdx: number) => {
        const rowData: RowData = { id: rIdx + 1 };
        responseCols.forEach((col, cIdx) => {
          const cell = row.c && row.c[cIdx];
          let val = "";
          if (cell) {
            if (cell.f !== undefined && cell.f !== null) {
              val = String(cell.f);
            } else if (cell.v !== undefined && cell.v !== null) {
              val = String(cell.v);
            }
          }
          rowData[col.id] = val;
        });
        return rowData;
      });
      
      setCols(responseCols);
      setRows(responseRows);
      
      // Set default sort to first column
      if (responseCols.length > 0 && !sortField) {
        setSortField(responseCols[0].id);
      }
    } catch (err: any) {
      console.error("Error loading Google Sheet notes sheet:", err);
      setError(
        lang === "ar" 
          ? "فشل تأمين اتصال بجوجل شيت لجلب الملاحظات العامة. يرجى التحقق ثم إعادة المحاولة." 
          : "Failed to establish live connection to Google Sheet. Check parameters and retry."
      );
    } finally {
      setLoading(false);
    }
  }, [lang, sortField]);

  // Initial load and periodic synchronization (auto refresh on Sheet updates)
  useEffect(() => {
    fetchWorksheet();
    const interval = setInterval(() => {
      fetchWorksheet();
    }, 60000); // Live sync every 60 seconds
    return () => clearInterval(interval);
  }, [fetchWorksheet]);

  // Dynamically find which column represents Sector/Location to filter dynamically
  const sectorCol = useMemo(() => {
    return cols.find(c => 
      c.label.includes("القطاع") || 
      c.label.toLowerCase().includes("sector") || 
      c.label.toLowerCase().includes("location") || 
      c.label.includes("الموقع")
    ) || cols[1]; // fallback to index 1 (second column) if not found
  }, [cols]);

  // Find all unique values in the Sector column for our filter selector dropdown
  const uniqueSectors = useMemo(() => {
    if (!sectorCol) return [];
    const vals = rows
      .map(r => String(r[sectorCol.id] || "").trim())
      .filter(v => v !== "");
    return Array.from(new Set(vals));
  }, [rows, sectorCol]);

  // Interactive sorting trigger
  const handleSort = (fieldId: string) => {
    if (sortField === fieldId) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(fieldId);
      setSortDirection("asc");
    }
  };

  // Sort indicator helper
  const getSortIcon = (fieldId: string) => {
    if (sortField !== fieldId) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 shrink-0 transition-opacity group-hover:opacity-100" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" /> 
      : <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
  };

  // Main filtered and sorted dataset calculation
  const processedRows = useMemo(() => {
    let dataset = [...rows];

    // 1. Sector filter
    if (sectorCol && sectorFilter !== "all") {
      dataset = dataset.filter(r => 
        String(r[sectorCol.id] || "").trim() === sectorFilter.trim()
      );
    }

    // 2. Search Query filter (matches in any cell, case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      dataset = dataset.filter(row => 
        cols.some(col => String(row[col.id] || "").toLowerCase().includes(q))
      );
    }

    // 3. Dynamic multi-type sort (handles numerical and string values)
    if (sortField) {
      dataset.sort((a, b) => {
        const aVal = String(a[sortField] || "").trim();
        const bVal = String(b[sortField] || "").trim();

        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }

        return sortDirection === "asc"
          ? aVal.localeCompare(bVal, lang === "ar" ? "ar" : "en")
          : bVal.localeCompare(aVal, lang === "ar" ? "ar" : "en");
      });
    }

    return dataset;
  }, [rows, cols, sectorCol, sectorFilter, searchQuery, sortField, sortDirection, lang]);

  return (
    <div className={`w-full max-w-7xl mx-auto rounded-xl border shadow-sm overflow-hidden transition-colors ${
      isDark 
        ? "bg-[#0F172A] border-slate-800 text-slate-100" 
        : "bg-white border-slate-200 text-[#0F172A]"
    }`}>
      
      {/* 1. Header Toolbar with Sheet Status */}
      <div className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${
        isDark ? "border-slate-850 bg-[#1e293b]/40" : "border-slate-150 bg-[#F8FAFC]"
      }`}>
        <div className="flex items-start gap-3 text-start">
          <div className={`p-2 rounded-lg shrink-0 ${
            isDark ? "bg-[#312E81] text-[#A5B4FC]" : "bg-[#EEF2F6] text-indigo-600"
          }`}>
            <FileSpreadsheet className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              {t.title}
            </h3>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Dynamic Records Metric */}
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
            isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
          }`}>
            {t.totalRows} {processedRows.length} {isRtl ? "ملاحظة" : "entries"}
          </span>

          <button
            onClick={fetchWorksheet}
            disabled={loading}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              isDark 
                ? "bg-[#1E293B] border-slate-700 hover:bg-slate-800 text-slate-200 disabled:opacity-50" 
                : "bg-white border-slate-200 hover:bg-[#F1F5F9] text-[#1E293B] disabled:opacity-50"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t.refreshBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. Intelligent Dynamic Filters & Interactive controls */}
      <div className={`p-4 flex flex-col md:flex-row gap-3 border-b ${
        isDark ? "border-slate-800 bg-[#141b2e]" : "border-slate-150 bg-white"
      }`}>
        
        {/* Dynamic Search Box */}
        <div className="relative flex-1">
          <span className={`absolute inset-y-0 ${isRtl ? "right-3" : "left-3"} flex items-center pointer-events-none text-slate-400`}>
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full h-11 text-xs ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold ${
              isDark 
                ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500" 
                : "bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] focus:bg-white focus:border-indigo-600"
            }`}
          />
        </div>

        {/* Dynamic Location / Sector Selector Filter Dropdown (Drawn directly from raw spreadsheet data column!) */}
        {sectorCol && (
          <div className="flex items-center gap-2 min-w-[200px]">
            <span className={`text-xs font-bold shrink-0 hidden sm:inline ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <Filter className="w-3.5 h-3.5 inline mr-1" />
            </span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className={`w-full h-11 text-xs px-3 rounded-xl border cursor-pointer font-bold transition-all ${
                isDark 
                  ? "bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                  : "bg-white border-[#CBD5E1] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              }`}
            >
              <option value="all">{t.allSectors}</option>
              {uniqueSectors.map((sect, i) => (
                <option key={sect || i} value={sect}>{sect}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Core Interactive Sheet Data Table */}
      {loading && rows.length === 0 ? (
        // High fidelity shimmering loading indicator
        <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {t.loadingText}
          </p>
        </div>
      ) : error && rows.length === 0 ? (
        // Graceful Connectivity Error state
        <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-12 h-12 text-[#EF4444]" />
          <p className="text-xs font-bold text-[#EF4444] max-w-md">
            {error}
          </p>
          <button 
            onClick={fetchWorksheet}
            className="mt-2 text-xs font-extrabold px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-sm"
          >
            {t.retryBtn}
          </button>
        </div>
      ) : rows.length === 0 ? (
        // Real empty state (shown only if raw table 'item' in Google sheet is actually blank)
        <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
          <Inbox className="w-10 h-10 text-slate-400" />
          <h4 className="text-sm font-bold">{t.noIssues}</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
            {isRtl 
              ? "ورقة العمل الذكية (ملاحظات عامة) فارغة بالكامل حالياً على خادم Google Sheets." 
              : "The smart table 'item' in Google Sheets has empty rows or no content."}
          </p>
        </div>
      ) : (
        <div className="w-full">
          {/* Main scrollable body with Sticky Headers */}
          <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
            <table className="w-full text-sm text-start font-sans min-w-[700px]">
              
              {/* STICKY HEADER */}
              <thead className={`sticky top-0 z-10 select-none border-b shadow-xs uppercase text-xs font-bold ${
                isDark 
                  ? "bg-[#1E293B] border-slate-800 text-slate-200" 
                  : "bg-[#F1F5F9] border-slate-200 text-[#334155]"
              }`}>
                <tr>
                  {/* Fixed ID counter column */}
                  <th scope="col" className="px-4 py-4 text-start w-12 border-r border-slate-200/20">{t.idCol}</th>
                  
                  {/* Dynamic Columns headers generated on the fly */}
                  {cols.map((col) => {
                    const isNotesCol = col.label.includes("البيان") || col.label.toLowerCase().includes("detail") || col.label.toLowerCase().includes("note");
                    return (
                      <th 
                        key={col.id} 
                        scope="col" 
                        onClick={() => handleSort(col.id)}
                        className={`px-6 py-4 cursor-pointer select-none group transition-colors text-start whitespace-nowrap ${
                          isNotesCol ? "w-2/5" : "w-auto"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 justify-start">
                          <span>{col.label}</span>
                          {getSortIcon(col.id)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* TABLE BODY DECORATION */}
              <tbody className={`divide-y ${isDark ? "divide-slate-800/80" : "divide-slate-100"}`}>
                {processedRows.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length + 1} className="py-12 bg-white/5 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="w-8 h-8 text-amber-500 opacity-60" />
                        <p className="text-xs font-bold text-slate-400">
                          {t.noFilteredIssues}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedRows.map((row, index) => (
                    <tr 
                      key={row.id ?? index}
                      className={`transition-colors ${
                        isDark 
                          ? "bg-transparent border-b border-slate-800/60 hover:bg-slate-800/30" 
                          : "bg-white border-b border-slate-100 hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {/* Formatted absolute numerical ID */}
                      <td className={`px-4 py-3.5 font-mono text-center text-xs font-bold ${
                        isDark ? "text-slate-500 border-r border-slate-800/50" : "text-slate-400 bg-slate-50/50 border-r border-slate-150"
                      }`}>
                        {index + 1}
                      </td>

                      {/* Display cells dynamically according to sheet's active response values */}
                      {cols.map((col) => {
                        const cellVal = String(row[col.id] || "");
                        
                        // Check if it's "البيان" or "Detail" to make its text styling prominent
                        const isPrimary = col.label.includes("البيان") || col.label.toLowerCase().includes("detail") || col.label.toLowerCase().includes("note");
                        
                        // Dynamic styling for badges (e.g. Zone badges, stable states)
                        const isZone = col.label.includes("القطاع") || col.label.toLowerCase().includes("sector") || col.label.toLowerCase().includes("zone");
                        const isUpdated = col.label.includes("تحديث") || col.label.toLowerCase().includes("update") || col.label.toLowerCase().includes("date");
                        
                        return (
                          <td 
                            key={col.id} 
                            className={`px-6 py-3.5 text-xs text-start`}
                          >
                            {isZone && cellVal.toLowerCase() !== "جميع القطاعات" && cellVal ? (
                              <span className={`inline-flex items-center font-extrabold px-2 py-0.5 rounded text-[10.5px] border ${
                                isDark 
                                  ? "bg-slate-800/80 text-indigo-400 border-slate-700" 
                                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
                              }`}>
                                {cellVal}
                              </span>
                            ) : isZone && cellVal.toLowerCase() === "جميع القطاعات" ? (
                              <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-[10.5px] border ${
                                isDark 
                                  ? "bg-[#065F46]/30 text-[#34D399] border-[#047857]/40" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}>
                                {cellVal}
                              </span>
                            ) : isUpdated ? (
                              <span className={`font-mono text-[11px] font-bold ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}>
                                {cellVal}
                              </span>
                            ) : (
                              <span className={`leading-relaxed ${
                                isPrimary 
                                  ? (isDark ? "text-[#E2E8F0] font-bold text-xs" : "text-[#1E293B] font-bold text-xs") 
                                  : (isDark ? "text-slate-350" : "text-[#475569] font-medium")
                              }`}>
                                {cellVal || "—"}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default MajorIssuesTable;
