import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  FileSpreadsheet, 
  Inbox,
  AlertOctagon,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle,
  BellRing
} from "lucide-react";

export interface ColumnDef {
  id: string;   
  label: string; 
  type: string;
}

export interface RowData {
  id: number;
  [key: string]: any;
}

interface MajorIssuesTableProps {
  lang: "ar" | "en";
  theme?: "light" | "dark";
  generalNotes?: any[];
  majorIssues?: any[];
  fluctuations?: any[];
  alerts?: any[];
}

export function MajorIssuesTable({ 
  lang, 
  theme = "light",
  generalNotes = [],
  majorIssues = [],
  fluctuations = [],
  alerts = []
}: MajorIssuesTableProps) {
  const isRtl = lang === "ar";
  const isDark = theme === "dark";

  // Tab State
  const [activeTab, setActiveTab] = useState<"general_notes" | "major_issues" | "fluctuations" | "alerts">("general_notes");

  // Filter, search & sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Resolve active dataset based on selection
  const activeDataset = useMemo(() => {
    switch (activeTab) {
      case "general_notes":
        return generalNotes;
      case "major_issues":
        return majorIssues;
      case "fluctuations":
        return fluctuations;
      case "alerts":
        return alerts;
      default:
        return [];
    }
  }, [activeTab, generalNotes, majorIssues, fluctuations, alerts]);

  // Translation text
  const t = {
    title: isRtl ? "المستندات والملاحظات التشغيلية" : "Operational Records & Logs",
    subtitle: isRtl 
      ? "استعراض ومراقبة شاملة لكافة الملاحظات والمخاطر والإنذارات الواردة في الأنظمة" 
      : "Comprehensive inspection of all operational records, risks, and alarms logged in systems",
    searchPlaceholder: isRtl ? "البحث في الجدول المحدد..." : "Search in selected log...",
    allSectors: isRtl ? "تصفية: كل القطاعات" : "Filter: All Sectors",
    filterLabel: isRtl ? "القطاع / الموقع:" : "Sector / Location:",
    noIssues: isRtl ? "لا توجد سجلات مسجلة حالياً في هذا القسم" : "No records registered currently under this section",
    noFilteredIssues: isRtl 
      ? "لا توجد نتائج مطابقة لخيارات البحث والتصفية" 
      : "No records found matching search query and filters",
    totalRows: isRtl ? "إجمالي السجلات المعروضة:" : "Total Filtered Records:",
    idCol: isRtl ? "م" : "No."
  };

  // Dynamically map and translate columns based on structural keys
  const cols = useMemo(() => {
    if (activeDataset.length === 0) return [];
    
    // Find all unique keys present in the objects except ID/id/idCol
    const keys = new Set<string>();
    activeDataset.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== "id" && key !== "idCol" && key !== "#") {
          keys.add(key);
        }
      });
    });

    const list = Array.from(keys);
    
    return list.map(key => {
      let label = key;
      if (key === "issue" || key === "issue_ar") {
        label = isRtl ? "الملاحظة / المشكلة" : "Issue / Details";
      } else if (key === "sector" || key === "اسم القطاع / الموقع") {
        label = isRtl ? "القطاع / الموقع" : "Sector / Location";
      } else if (key === "action" || key === "الملاحظات والإجراءات التي تمت") {
        label = isRtl ? "الإجراء المتخذ" : "Action Taken / Notes";
      } else if (key === "last_update" || key === "التاريخ") {
        label = isRtl ? "تاريخ التحديث" : "Last Update";
      } else if (key === "severity") {
        label = isRtl ? "مستوى الخطورة" : "Severity";
      } else if (key === "status") {
        label = isRtl ? "الحالة" : "Status";
      } else if (key === "zone") {
        label = isRtl ? "القطاع الفني" : "Technical Zone";
      } else if (key === "status_ar") {
        label = isRtl ? "مؤشر الرصد" : "Telemetry Status (AR)";
      } else if (key === "status_en") {
        label = isRtl ? "الحالة" : "Telemetry Status (EN)";
      } else if (key === "message_ar") {
        label = isRtl ? "التنبيه والإنذار الوارد" : "Alert Detail (AR)";
      } else if (key === "message_en") {
        label = isRtl ? "تفاصيل التنبيه" : "Alert Detail (EN)";
      } else if (key === "اليوم") {
        label = isRtl ? "اليوم" : "Day";
      }

      return {
        id: key,
        label: label,
        type: typeof activeDataset[0][key] === "number" ? "number" : "string"
      };
    });
  }, [activeDataset, isRtl]);

  // Set default sort column automatically when dataset changes
  React.useEffect(() => {
    if (cols.length > 0) {
      setSortField(cols[0].id);
    } else {
      setSortField("");
    }
    setSearchQuery("");
    setSectorFilter("all");
  }, [activeTab, cols]);

  // Sector classification locator key
  const sectorColId = useMemo(() => {
    const found = cols.find(c => 
      c.id.includes("sector") || 
      c.id.includes("zone") || 
      c.id === "اسم القطاع / الموقع"
    );
    return found ? found.id : null;
  }, [cols]);

  // Unique sector choices for dropdown filter selection
  const uniqueSectors = useMemo(() => {
    if (!sectorColId || activeDataset.length === 0) return [];
    const vals = activeDataset
      .map(r => String(r[sectorColId] || "").trim())
      .filter(v => v !== "" && v !== "-");
    return Array.from(new Set(vals));
  }, [activeDataset, sectorColId]);

  // Handles column heading sorts
  const handleSort = (fieldId: string) => {
    if (sortField === fieldId) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(fieldId);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (fieldId: string) => {
    if (sortField !== fieldId) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 shrink-0 transition-opacity group-hover:opacity-100" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" /> 
      : <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
  };

  // Perform filtering & sorting in memory
  const processedRows = useMemo(() => {
    let dataset = [...activeDataset];

    // 1. Dropdown Sector Filtering
    if (sectorColId && sectorFilter !== "all") {
      dataset = dataset.filter(r => 
        String(r[sectorColId] || "").trim() === sectorFilter.trim()
      );
    }

    // 2. Search Text Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      dataset = dataset.filter(row => 
        Object.keys(row).some(key => {
          if (key === "id" || key === "idCol") return false;
          return String(row[key] || "").toLowerCase().includes(q);
        })
      );
    }

    // 3. Multi-type column sorting
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
  }, [activeDataset, sectorColId, sectorFilter, searchQuery, sortField, sortDirection, lang]);

  // Formatted state badges for severity, status, actions
  const renderCellWithBadges = (key: string, val: any) => {
    const textVal = String(val || "").trim();
    if (textVal === "" || textVal === "-") return <span className="text-gray-400">—</span>;

    // Severity mapping
    if (key === "severity") {
      const cleanSev = textVal.toLowerCase();
      if (cleanSev === "high" || cleanSev === "critical" || cleanSev === "حرجة") {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-450 dark:border-rose-500/15 animate-pulse">
            <AlertOctagon className="w-3 h-3" />
            {isRtl ? "عالية الخطورة" : "High Risk"}
          </span>
        );
      } else if (cleanSev === "medium" || cleanSev === "warning" || cleanSev === "متوسطة") {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/15">
            <AlertTriangle className="w-3 h-3" />
            {isRtl ? "متوسطة" : "Medium"}
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/15">
            <Info className="w-3 h-3" />
            {isRtl ? "منخفضة" : "Low"}
          </span>
        );
      }
    }

    // Status mapping
    if (key === "status") {
      const cleanStat = textVal.toLowerCase();
      if (cleanStat === "open" || cleanStat === "نشط" || cleanStat === "معلق") {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-600 dark:border-amber-500/20">
            <Clock className="w-3 h-3" />
            {isRtl ? "قيد المعالجة" : "Active"}
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            {isRtl ? "مغلقة / مكتملة" : "Resolved"}
          </span>
        );
      }
    }

    // Zone & Location formatting
    if (key === "sector" || key === "zone" || key === "اسم القطاع / الموقع" || key === "القطاع / الموقع") {
      if (textVal.includes("جميع القطاعات") || textVal === "Global" || textVal === "All") {
        return (
          <span className="inline-flex items-center font-extrabold px-2.5 py-0.5 rounded-md text-[10.5px] bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/15">
            🌍 {textVal}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center font-bold px-2 py-0.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
          📍 {textVal}
        </span>
      );
    }

    const isPrimary = key === "issue" || key === "issue_ar" || key === "message_ar" || key === "message_en" || key === "الملاحظات والإجراءات التي تمت";
    return (
      <span className={`leading-relaxed text-xs block ${isPrimary ? "font-bold text-[#1E293B] dark:text-white max-w-sm xl:max-w-md break-words" : "font-semibold text-[#64748B] dark:text-slate-350"}`}>
        {textVal}
      </span>
    );
  };

  return (
    <div className={`w-full max-w-7xl mx-auto rounded-xl border shadow-lg overflow-hidden transition-all ${
      isDark 
        ? "bg-[#0F172A] border-slate-800 text-slate-100" 
        : "bg-white border-[#E2E8F0] text-[#0F172A]"
    }`}>
      
      {/* A. Title Segment with Icon */}
      <div className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${
        isDark ? "border-slate-800 bg-[#1e293b]/40" : "border-[#E2E8F0] bg-[#F8FAFC]"
      }`}>
        <div className="flex items-start gap-3 text-start">
          <div className={`p-2.5 rounded-lg shrink-0 ${
            isDark ? "bg-[#312E81] text-[#A5B4FC]" : "bg-[#EEF2F6] text-indigo-600"
          }`}>
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
              <span>{t.title}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </h3>
            <p className={`text-xs mt-1 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Records Metric */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-[11px] font-black px-2.5 py-1 rounded-md ${
            isDark ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-slate-100 text-slate-700 border border-slate-200"
          }`}>
            {t.totalRows} <span className="font-mono text-indigo-600 dark:text-indigo-400">{processedRows.length}</span> {isRtl ? "سجل" : "entries"}
          </span>
        </div>
      </div>

      {/* B. Multi-Tab Navigation for the 4 separate sheets */}
      <div className={`p-3 border-b flex flex-wrap gap-2 items-center ${
        isDark ? "border-slate-800 bg-[#0d1425]" : "border-slate-150 bg-slate-50/50"
      }`}>
        <button
          onClick={() => setActiveTab("general_notes")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "general_notes"
              ? "bg-indigo-650 text-white shadow-md shadow-indigo-650/15"
              : isDark ? "bg-slate-900 hover:bg-slate-800 text-slate-400" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-205"
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>{isRtl ? "الملاحظات العامة" : "General Notes"} <span className="font-mono bg-black/10 px-1 py-0.2 rounded text-[10px]">{generalNotes.length}</span></span>
        </button>

        <button
          onClick={() => setActiveTab("major_issues")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "major_issues"
              ? "bg-red-650 text-white shadow-md shadow-red-650/15"
              : isDark ? "bg-slate-900 hover:bg-slate-800 text-slate-400" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-205"
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>{isRtl ? "أبرز المشاكل التشغيلية" : "Major Issues"} <span className="font-mono bg-black/10 px-1 py-0.2 rounded text-[10px]">{majorIssues.length}</span></span>
        </button>

        <button
          onClick={() => setActiveTab("fluctuations")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "fluctuations"
              ? "bg-amber-600 text-white shadow-md shadow-amber-650/15"
              : isDark ? "bg-slate-900 hover:bg-slate-800 text-slate-400" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-205"
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5 animate-pulse" />
          <span>{isRtl ? "سجل تذبذب نظام التشغيل" : "Fluctuation Log"} <span className="font-mono bg-black/10 px-1 py-0.2 rounded text-[10px]">{fluctuations.length}</span></span>
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "alerts"
              ? "bg-rose-500 text-white shadow-md shadow-rose-650/15"
              : isDark ? "bg-slate-900 hover:bg-slate-800 text-slate-400" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-205"
          }`}
        >
          <BellRing className="w-3.5 h-3.5 animate-bounce-slow" />
          <span>{isRtl ? "التنبيهات الفورية" : "Instant Alerts"} <span className="font-mono bg-black/10 px-1 py-0.2 rounded text-[10px]">{alerts.length}</span></span>
        </button>
      </div>

      {/* C. Interactive Controls Panel (Search + Sector Filter) */}
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
            className={`w-full h-11 text-xs ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-extrabold ${
              isDark 
                ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500" 
                : "bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] focus:bg-white focus:border-indigo-650"
            }`}
          />
        </div>

        {/* Dynamic Sector Selector filter */}
        {sectorColId && uniqueSectors.length > 0 && (
          <div className="flex items-center gap-2 min-w-[210px]">
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

      {/* D. Data Presentation Area */}
      {processedRows.length === 0 ? (
        // High fidelity empty state representation
        <div className="p-20 text-center flex flex-col items-center justify-center gap-4 bg-slate-50/10 dark:bg-slate-950/20">
          <Inbox className="w-10 h-10 text-slate-400 animate-bounce" />
          <h4 className="text-sm font-bold">{t.noIssues}</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed mx-auto">
            {t.noFilteredIssues}
          </p>
        </div>
      ) : (
        <div className="w-full">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-sm text-start font-sans min-w-[800px]">
              
              <thead className={`sticky top-0 z-10 border-b shadow-sm uppercase text-xs font-bold ${
                isDark 
                  ? "bg-[#1E293B] border-slate-800 text-slate-200" 
                  : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]"
              }`}>
                <tr>
                  <th scope="col" className="px-4 py-4 text-center w-12 border-r border-slate-200/20">{t.idCol}</th>
                  {cols.map((col) => (
                    <th 
                      key={col.id} 
                      scope="col" 
                      onClick={() => handleSort(col.id)}
                      className={`px-6 py-4 cursor-pointer select-none group transition-colors text-start whitespace-nowrap`}
                    >
                      <div className="flex items-center gap-1.5 justify-start">
                        <span>{col.label}</span>
                        {getSortIcon(col.id)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className={`divide-y ${isDark ? "divide-slate-800/80 bg-slate-950/25" : "divide-[#E2E8F0] bg-white"}`}>
                {processedRows.map((row, index) => (
                  <tr 
                    key={row.id ?? index}
                    className={`transition-colors ${
                      isDark 
                        ? "bg-transparent hover:bg-white/[0.015]" 
                        : "bg-white hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {/* Continuous continuous ID index */}
                    <td className={`px-4 py-3.5 font-mono text-center text-xs font-bold ${
                      isDark ? "text-slate-500 border-r border-slate-850" : "text-slate-450 bg-slate-50/50 border-r border-[#E2E8F0]"
                    }`}>
                      {index + 1}
                    </td>

                    {/* Columns iteration */}
                    {cols.map((col) => {
                      const cellVal = row[col.id];
                      return (
                        <td key={col.id} className="px-6 py-3.5 text-xs text-start">
                          {renderCellWithBadges(col.id, cellVal)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default MajorIssuesTable;
