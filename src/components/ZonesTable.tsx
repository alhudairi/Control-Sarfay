import React, { useState, useMemo, useRef } from "react";
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw,
  Cpu,
  Terminal,
  AlertOctagon
} from "lucide-react";
import { Row } from "../types";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface ZonesTableProps {
  rows: Row[];
  lang: "ar" | "en";
  activeKpiFilter: string | null;
  onClearKpiFilter: () => void;
  viewMode?: "desktop" | "tablet" | "mobile";
  theme?: "light" | "dark";
}

type SortField = "zone" | "status" | "control_type" | "health_score" | "date" | "day";
type SortDirection = "asc" | "desc";

export function ZonesTable({
  rows,
  lang,
  activeKpiFilter,
  onClearKpiFilter,
  viewMode = "desktop",
  theme = "light",
}: ZonesTableProps) {
  const isRtl = lang === "ar";
  const isDark = theme === "dark";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filterGridCols =
    viewMode === "desktop" || viewMode === "tablet"
      ? "grid-cols-4"
      : "grid-cols-1";

  const actionGridCols =
    viewMode === "desktop" || viewMode === "tablet"
      ? "grid-cols-2"
      : "grid-cols-1";

  const gridTemplateStyle = {
    display: "grid",
    gridTemplateColumns: "140px 90px 110px 130px 180px 140px minmax(200px, 1fr)",
    gap: "12px",
    alignItems: "center",
    width: "100%"
  };

  // Table local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [controlFilter, setControlFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [sortField, setSortField] = useState<SortField>("zone");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  // Clean translation dictionary corresponding strictly to SOC Dashboard / Operations Center concept
  const t = {
    boardTitle: isRtl ? "سجل كفاءة نظام التشغيل" : "System Operating Efficiency Log",
    boardDesc: isRtl 
      ? "مراقبة لحظية لقياس كفاءة واستقرار أنظمة التشغيل في القطاعات والمحطات، ومتابعة أداء النظم" 
      : "Real-time monitoring to measure the efficiency and stability of operating systems across sectors and stations, and tracking system performance.",
    searchPlaceholder: isRtl ? "تصفية الأنظمة أو قراءة السجلات..." : "Filter systems or audit stream logs...",
    allStatuses: isRtl ? "جميع الحالات" : "All Status Feeds",
    allControlTypes: isRtl ? "جميع قنوات التحكم" : "All Control Channels",
    colDate: isRtl ? "التاريخ" : "Date",
    colDay: isRtl ? "اليوم" : "Day",
    colZone: isRtl ? "النظام / القطاع" : "System / Zone",
    colStatus: isRtl ? "مؤشر الرصد" : "Telemetry State",
    colControl: isRtl ? "قناة التوجيه" : "Control Protocol",
    colHealth: isRtl ? "مستوى الاستجابة" : "Operating Efficiency",
    colNotes: isRtl ? "مستجدات التشخيص والنبض" : "Active Diagnostics Logs",
    noRecords: isRtl ? "لا توجد تدفقات تشغيلية مطابقة لبحثك" : "No synchronized operational streams match filters",
    clearFilters: isRtl ? "تصفير الرصد" : "Clear Active Filters",
    kpiFilterActive: isRtl ? "مسار الرصد المعجل:" : "Speedway KPI Link:",
    totalSegments: isRtl ? "إجمالي القطاعات المعروضة: " : "Total Monitored Segments: ",
    telemetryLive: isRtl ? "بث بيانات الأجهزة الحية نشط" : "SYSTEM RUNTIME ACTIVE",
    terminalStatus: isRtl ? "قاعدة بيانات الأنظمة الفرعية" : "CORE DATABASE DISPATCH",
  };

  // Extract unique status labels automatically from rows for dynamic robust filters
  const uniqueStatuses = useMemo(() => {
    const statusesMap = new Map<string, { ar: string; en: string }>();
    rows.forEach(r => {
      statusesMap.set(r.status_value.toLowerCase(), {
        ar: r.status_ar,
        en: r.status_en
      });
    });
    return Array.from(statusesMap.entries()).map(([value, labels]) => ({ value, ...labels }));
  }, [rows]);

  // Extract unique control values automatically from rows for dynamic robust filters
  const uniqueControlTypes = useMemo(() => {
    const controlMap = new Map<string, { ar: string; en: string }>();
    rows.forEach(r => {
      controlMap.set(r.control_value.toLowerCase(), {
        ar: r.control_type_ar,
        en: r.control_value
      });
    });
    return Array.from(controlMap.entries()).map(([value, labels]) => ({ value, ...labels }));
  }, [rows]);

  // Extract unique sectors automatically from rows for dynamic robust filters
  const uniqueSectors = useMemo(() => {
    const sectorsSet = new Set<string>();
    rows.forEach(r => {
      if (r.zone) sectorsSet.add(r.zone);
    });
    return Array.from(sectorsSet).sort();
  }, [rows]);

  // Extract unique dates automatically from rows for dynamic robust filters
  const uniqueDates = useMemo(() => {
    const datesSet = new Set<string>();
    rows.forEach(r => {
      if (r.date) {
        datesSet.add(r.date.trim());
      }
    });
    return Array.from(datesSet).sort((a, b) => {
      const timeA = new Date(a).getTime();
      const timeB = new Date(b).getTime();
      if (isNaN(timeA) || isNaN(timeB)) return a.localeCompare(b);
      return timeA - timeB;
    });
  }, [rows]);

  // Sort toggle handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter & Sort core business logic
  const processedRows = useMemo(() => {
    let result = [...rows];

    // 1. External KPI Filter Binding (Active on card click)
    if (activeKpiFilter) {
      const kpiLower = activeKpiFilter.toLowerCase();
      if (kpiLower === "stable") {
        result = result.filter(r => r.status_value.toLowerCase() === "stable");
      } else if (kpiLower === "fluctuating") {
        result = result.filter(r => r.status_value.toLowerCase() === "fluctuating");
      } else if (kpiLower === "out_of_service" || kpiLower === "out of service") {
        result = result.filter(r => r.status_value.toLowerCase() === "out_of_service" || r.status_value.toLowerCase().includes("out"));
      } else if (kpiLower === "local_only" || kpiLower === "local only" || kpiLower === "local_operation_only") {
        result = result.filter(r => r.control_value.toLowerCase().includes("local"));
      } else if (kpiLower === "central_only" || kpiLower === "central only") {
        result = result.filter(r => r.control_value.toLowerCase().includes("central") && !r.control_value.toLowerCase().includes("partial"));
      } else if (kpiLower === "dual" || kpiLower === "dual_mode") {
        result = result.filter(r => r.control_value.toLowerCase().includes("dual") || r.control_type_ar.includes("مزدوج"));
      } else if (kpiLower === "monitoring_only") {
        result = result.filter(r => r.control_value.toLowerCase().includes("monitoring only") || r.control_value.toLowerCase() === "monitoring_only");
      } else if (kpiLower === "monitoring_control" || kpiLower === "monitoring & control" || kpiLower === "monitoring and control") {
        result = result.filter(r => r.control_value.toLowerCase().includes("monitoring & control") || r.control_value.toLowerCase().includes("monitoring and control") || r.control_value.toLowerCase() === "monitoring_control");
      } else if (kpiLower === "central_partial_local" || kpiLower === "central partial local") {
        result = result.filter(r => r.control_value.toLowerCase().includes("partial") || r.control_type_ar.includes("جزئي"));
      } else if (kpiLower === "legacy_system" || kpiLower === "legacy" || kpiLower === "legacy system" || kpiLower === "legacy_operation" || kpiLower === "legacy operation") {
        result = result.filter(r => 
          r.control_value.toLowerCase().includes("legacy") || 
          r.control_value.toLowerCase().includes("traditional") || 
          r.control_type_ar.includes("تقليدي") ||
          r.control_type_ar.includes("النظام القديم")
        );
      } else if (kpiLower === "major_issues" || kpiLower === "major issues" || kpiLower === "issues") {
        result = result.filter(r => r.health_score < 100 || r.severity === "high");
      }
    }

    // 2. Search Box Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.zone.toLowerCase().includes(q) || 
        r.notes.toLowerCase().includes(q) ||
        (r.status_ar || "").toLowerCase().includes(q) ||
        (r.status_en || "").toLowerCase().includes(q) ||
        (r.control_type_ar || "").toLowerCase().includes(q) ||
        (r.control_value || "").toLowerCase().includes(q)
      );
    }

    // 3. Dropdown Manual Status Filter
    if (statusFilter !== "all") {
      result = result.filter(r => r.status_value.toLowerCase() === statusFilter.toLowerCase());
    }

    // 4. Dropdown Manual Control Type Filter
    if (controlFilter !== "all") {
      result = result.filter(r => r.control_value.toLowerCase() === controlFilter.toLowerCase());
    }

    // 5. Dropdown Sector Filter
    if (sectorFilter !== "all") {
      result = result.filter(r => r.zone === sectorFilter);
    }

    // 6. Date period and range filters
    const parseRowDateVal = (dateStr: any): Date | null => {
      if (!dateStr) return null;
      const str = String(dateStr).trim();
      const delimiterMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (delimiterMatch) {
        return new Date(parseInt(delimiterMatch[1], 10), parseInt(delimiterMatch[2], 10) - 1, parseInt(delimiterMatch[3], 10));
      }
      const usMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (usMatch) {
        return new Date(parseInt(usMatch[3], 10), parseInt(usMatch[1], 10) - 1, parseInt(usMatch[2], 10));
      }
      const parsed = new Date(str);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // Filter quick period based on current year
    if (periodFilter !== "all") {
      const cy = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      result = result.filter(r => {
        const rowDate = parseRowDateVal(r.date);
        if (!rowDate) return false;
        const ry = rowDate.getFullYear();
        const rm = rowDate.getMonth();
        
        switch (periodFilter) {
          case "this_month":
            return ry === cy && rm === currentMonth;
          case "this_year":
            return ry === cy;
          case "q1":
            return ry === cy && rm >= 0 && rm <= 2;
          case "q2":
            return ry === cy && rm >= 3 && rm <= 5;
          case "q3":
            return ry === cy && rm >= 6 && rm <= 8;
          case "q4":
            return ry === cy && rm >= 9 && rm <= 11;
          case "h1":
            return ry === cy && rm >= 0 && rm <= 5;
          case "h2":
            return ry === cy && rm >= 6 && rm <= 11;
          default:
            return true;
        }
      });
    }

    // Filter fromDate limit
    if (fromDate.trim()) {
      const fromLimit = parseRowDateVal(fromDate.trim());
      if (fromLimit) {
        fromLimit.setHours(0, 0, 0, 0);
        result = result.filter(r => {
          const rowDate = parseRowDateVal(r.date);
          if (!rowDate) return false;
          rowDate.setHours(0, 0, 0, 0);
          return rowDate >= fromLimit;
        });
      }
    }

    // Filter with date selected exactly from list
    if (toDate.trim() && toDate !== "all") {
      result = result.filter(r => r.date?.trim() === toDate.trim());
    }

    // 7. Dynamic Sorting Handler
    result.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      switch (sortField) {
        case "date":
          valA = a.date;
          valB = b.date;
          break;
        case "day":
          valA = a.day_ar;
          valB = b.day_ar;
          break;
        case "zone":
          valA = a.zone;
          valB = b.zone;
          break;
        case "status":
          valA = isRtl ? a.status_ar : a.status_en;
          valB = isRtl ? b.status_ar : b.status_en;
          break;
        case "control_type":
          valA = isRtl ? a.control_type_ar : a.control_value;
          valB = isRtl ? b.control_type_ar : b.control_value;
          break;
        case "health_score":
          valA = a.health_score;
          valB = b.health_score;
          break;
        default:
          valA = a.zone;
          valB = b.zone;
      }

      // Handle alphanumeric or numerical sorting
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      } else {
        const strA = String(valA);
        const strB = String(valB);
        return sortDirection === "asc" 
          ? strA.localeCompare(strB, lang) 
          : strB.localeCompare(strA, lang);
      }
    });

    return result;
  }, [rows, activeKpiFilter, searchQuery, statusFilter, controlFilter, sectorFilter, periodFilter, fromDate, toDate, sortField, sortDirection, isRtl, lang]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setControlFilter("all");
    setSectorFilter("all");
    setPeriodFilter("all");
    setFromDate("");
    setToDate("");
    onClearKpiFilter();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    handleResetFilters();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleExportExcel = () => {
    const excelData = processedRows.map((row) => {
      const bStyle = getStatusBadge(row.health_score, row.status_value);
      const ctrlStyle = getControlBadgeStyle(row.control_value);
      const displayDate = row.date ? String(row.date).replace(/-/g, "/") : "";
      
      return {
        [isRtl ? "النظام / القطاع" : "System / Zone"]: row.zone,
        [isRtl ? "اليوم" : "Day"]: row.day_ar,
        [isRtl ? "التاريخ" : "Date"]: displayDate,
        [isRtl ? "مؤشر الرصد" : "Telemetry State"]: bStyle.text.replace(/^[🟢🟡🔴]\s*/, ""),
        [isRtl ? "قناة التوجيه" : "Control Protocol"]: ctrlStyle.text,
        [isRtl ? "مستوى الاستجابة" : "Operating Efficiency"]: `${row.health_score}%`,
        [isRtl ? "مستجدات التشخيص والنبض" : "Active Diagnostics Logs"]: row.notes || "-"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, isRtl ? "البيانات التشغيلية" : "Operational Data");
    XLSX.writeFile(workbook, "operational-monitoring-data.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    doc.setProperties({
      title: "Operational Monitoring Report",
      author: "Abdulrahman Alhudairi",
      subject: "Sub-systems telemetries"
    });

    // Elegant Header Design (Aesthetic Slate Banner)
    doc.setFillColor(15, 23, 42); 
    doc.rect(10, 10, 277, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("OPERATIONAL MONITORING & STATUS REPORT", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Live Systems Status Summary & Control Metrics", 15, 25);

    doc.setFont("helvetica", "bold");
    doc.text("PREPARED FOR: Abdulrahman Alhudairi", 15, 32);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const exportDateStr = new Date().toLocaleString("en-US");
    doc.text(`Export Date: ${exportDateStr}`, 215, 22);
    doc.text(`Total Segments: ${processedRows.length}`, 215, 28);
    doc.text("Status: Verified Active", 215, 34);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 287, 45);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Prepared By: Abdulrahman Alhudairi", 12, 53);
    doc.text("System Level: Command Operations Center (SOC)", 180, 53);

    const tableHeaders = [
      "System / Zone",
      "Day",
      "Date",
      "Telemetry State",
      "Control Protocol",
      "Efficiency",
      "Active Diagnostics Log"
    ];

    const tableRows = processedRows.map((row) => {
      const bStyle = getStatusBadge(row.health_score, row.status_value);
      const ctrlStyle = getControlBadgeStyle(row.control_value);
      const displayDate = row.date ? String(row.date).replace(/-/g, "/") : "";
      
      let zoneEn = row.zone;
      if (row.zone.includes("الرياض")) zoneEn = "Riyadh Region";
      else if (row.zone.includes("مكة")) zoneEn = "Makkah Region";
      else if (row.zone.includes("المدينة")) zoneEn = "Madinah Region";
      else if (row.zone.includes("الشرقية")) zoneEn = "Eastern Province";
      else if (row.zone.includes("عسير")) zoneEn = "Asir Region";
      else if (row.zone.includes("تبوك")) zoneEn = "Tabuk Region";
      else if (row.zone.includes("حائل")) zoneEn = "Hail Region";
      else if (row.zone.includes("نجران")) zoneEn = "Najran Region";
      else if (row.zone.includes("جازان")) zoneEn = "Jazan Region";
      else if (row.zone.includes("الحدود")) zoneEn = "Northern Borders";
      
      let dayEn = "Monday";
      if (row.day_ar === "الاثنين") dayEn = "Monday";
      else if (row.day_ar === "الثلاثاء") dayEn = "Tuesday";
      else if (row.day_ar === "الأربعاء") dayEn = "Wednesday";
      else if (row.day_ar === "الخميس") dayEn = "Thursday";
      else if (row.day_ar === "الجمعة") dayEn = "Friday";
      else if (row.day_ar === "السبت") dayEn = "Saturday";
      else if (row.day_ar === "الأحد") dayEn = "Sunday";

      const statusEnText = bStyle.text.replace(/^[🟢🟡🔴]\s*/, "");
      
      return [
        `${zoneEn} (${row.zone})`,
        dayEn,
        displayDate,
        statusEnText,
        ctrlStyle.text,
        `${row.health_score}%`,
        row.notes || "-"
      ];
    });

    (doc as any).autoTable({
      startY: 60,
      head: [tableHeaders],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: {
        fontSize: 8.5,
        valign: "middle"
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { halign: "center", cellWidth: 22 },
        2: { halign: "center", cellWidth: 22 },
        3: { halign: "center", cellWidth: 32 },
        4: { halign: "center", cellWidth: 38 },
        5: { halign: "center", cellWidth: 22 },
        6: { cellWidth: "auto" }
      },
      styles: {
        font: "helvetica",
        lineWidth: 0.1,
        lineColor: [226, 232, 240]
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        const pageStr = `Page ${data.pageNumber} / ${doc.getNumberOfPages()}`;
        doc.text(pageStr, 280, 205, { align: "right" });
        doc.text("Operational Command Board © System Monitor", 10, 205);
      }
    });

    doc.save("operational-monitoring-report.pdf");
  };

  // Icon switcher helper for headers sorting indicator
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className={`w-4 h-4 shrink-0 transition-colors ${isDark ? "text-[#94A3B8]/60 group-hover:text-slate-200" : "text-slate-400 group-hover:text-slate-600"}`} />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4 text-emerald-500 shrink-0" /> 
      : <ArrowDown className="w-4 h-4 text-emerald-500 shrink-0" />;
  };

  // Professional Badge details according to detailed UX request
  const getStatusBadge = (health: number, statusVal: string) => {
    const val = (statusVal || "").toLowerCase();
    const isStable = val === "stable" || health >= 80;
    const isFluctuating = !isStable && val === "fluctuating" && health > 0;
    const isOffline = health === 0 || val === "out_of_service" || val.includes("offline") || val.includes("out");

    if (isOffline) {
      return {
        bg: "rgba(239,68,68,0.15)",
        color: "#EF4444",
        text: isRtl ? "🔴 خارج الخدمة" : "🔴 Out Of Service"
      };
    } else if (isFluctuating) {
      return {
        bg: "rgba(234,179,8,0.15)",
        color: "#EAB308",
        text: isRtl ? "🟡 متذبذب" : "🟡 Fluctuating"
      };
    } else {
      return {
        bg: "rgba(34,197,94,0.15)",
        color: "#22C55E",
        text: isRtl ? "🟢 مستقر" : "🟢 Stable"
      };
    }
  };

  // Premium Control Badges style resolver
  const getControlBadgeStyle = (controlValue: string) => {
    const val = (controlValue || "").toLowerCase();
    
    // تشغيل محلي فقط (#F59E0B)
    if (val.includes("local only") || val === "local_only" || val === "local") {
      return {
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.12)",
        borderColor: "rgba(245,158,11,0.25)",
        text: isRtl ? "تشغيل محلي فقط" : "Local Only"
      };
    }
    // تشغيل مركزي فقط (#3B82F6)
    if (val.includes("central only") || val === "central_only" || val === "central") {
      return {
        color: "#3B82F6",
        bg: "rgba(59,130,246,0.12)",
        borderColor: "rgba(59,130,246,0.25)",
        text: isRtl ? "تشغيل مركزي فقط" : "Central Only"
      };
    }
    // تشغيل مزدوج (#22C55E)
    if (val.includes("dual") || val === "dual_mode" || val.includes("dual mode") || val === "dual") {
      return {
        color: "#22C55E",
        bg: "rgba(34,197,94,0.12)",
        borderColor: "rgba(34,197,94,0.25)",
        text: isRtl ? "تشغيل مزدوج" : "Dual Mode"
      };
    }
    // تشغيل مركزي مع دعم محلي جزئي (#8B5CF6)
    if (val.includes("partial local") || val === "partial_local" || val === "partial") {
      return {
        color: "#8B5CF6",
        bg: "rgba(139,92,246,0.12)",
        borderColor: "rgba(139,92,246,0.25)",
        text: isRtl ? "تشغيل مركزي مع دعم محلي جزئي" : "Central with Partial Local"
      };
    }
    
    // تشغيل عبر النظام القديم (#64748B)
    return {
      color: "#64748B",
      bg: "rgba(100,116,139,0.12)",
      borderColor: "rgba(100,116,139,0.25)",
      text: isRtl ? "تشغيل عبر النظام القديم" : "Traditional System"
    };
  };

  const truncateText = (text: string, limit: number = 60) => {
    if (!text || text === "-") return "-";
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  return (
    <div 
      className="w-full max-w-7xl mx-auto space-y-6 antialiased"
      style={{ textRendering: "optimizeLegibility" }}
    >
      
      {/* Decoupled Command Dashboard Header & Controls Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 text-start space-y-6">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center justify-center p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Cpu className="w-6 h-6 animate-pulse" />
              </span>
              <h2 
                className="text-slate-900 dark:text-white leading-tight"
                style={{ fontSize: "28px", fontWeight: 800 }}
              >
                {t.boardTitle}
              </h2>
              <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/25 animate-pulse uppercase">
                {t.telemetryLive}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.boardDesc}
            </p>
          </div>
          
          {/* External KPI filter bubble badge */}
          {activeKpiFilter && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs uppercase font-extrabold px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900 self-start lg:self-auto shadow-sm">
              <span>{t.kpiFilterActive}</span>
              <span className="font-mono bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[11px]">{activeKpiFilter}</span>
              <button 
                onClick={onClearKpiFilter}
                className="hover:text-red-500 text-slate-400 focus:outline-none transition-colors ml-1.5 rtl:ml-0 rtl:mr-1.5 cursor-pointer font-bold text-sm"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Filters Control Panel */}
        <div 
          className="flex flex-col gap-3 w-full pt-1"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Row 1: Dropdown filters (distributed evenly) */}
          <div className={`grid ${filterGridCols} gap-4 w-full`}>
            {/* 2. Sector Filter Dropdown */}
            <div className="w-full">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full h-12 text-xs px-3 rounded-xl border border-[#CBD5E1] dark:border-slate-800 bg-white dark:bg-slate-950 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold cursor-pointer transition-colors"
              >
                <option value="all">{isRtl ? "القطاع: الكل" : "Sector: All"}</option>
                {uniqueSectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Telemetry Status Filter Dropdown */}
            <div className="w-full">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-12 text-xs px-3 rounded-xl border border-[#CBD5E1] dark:border-slate-800 bg-white dark:bg-slate-950 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold cursor-pointer transition-colors"
              >
                <option value="all">{isRtl ? "الحالة: الكل" : "Status: All"}</option>
                {uniqueStatuses.map((st) => (
                  <option key={st.value} value={st.value}>
                    {lang === "ar" ? st.ar : st.en}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Control Channel Filter Dropdown */}
            <div className="w-full">
              <select
                value={controlFilter}
                onChange={(e) => setControlFilter(e.target.value)}
                className="w-full h-12 text-xs px-3 rounded-xl border border-[#CBD5E1] dark:border-slate-800 bg-white dark:bg-slate-950 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold cursor-pointer transition-colors"
              >
                <option value="all">{isRtl ? "التحكم: الكل" : "Control: All"}</option>
                {uniqueControlTypes.map((ctrl) => (
                  <option key={ctrl.value} value={ctrl.value}>
                    {lang === "ar" ? ctrl.ar : ctrl.en}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Date Filter Dropdown */}
            <div className="w-full">
              <select
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-12 text-xs px-3 rounded-xl border border-[#CBD5E1] dark:border-slate-800 bg-white dark:bg-slate-950 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold cursor-pointer transition-colors"
              >
                <option value="all">{isRtl ? "التاريخ: الكل" : "Date: All"}</option>
                {uniqueDates.map((d) => (
                  <option key={d} value={d}>
                    {d.replace(/-/g, "/")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Action buttons (distributed evenly) */}
          <div className={`grid ${actionGridCols} gap-4 w-full`}>
            {/* 8. Export Excel Button (Professional dark-green) */}
            <button
              onClick={handleExportExcel}
              className="w-full h-12 px-3 text-xs font-bold rounded-xl text-white bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] border border-emerald-700 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title={isRtl ? "تعديل وتصدير إلى إكسل" : "Export to Excel"}
            >
              <span className="text-[13px] shrink-0 leading-none">📊</span>
              <span className="truncate">{isRtl ? "تصدير للبيانات (إكسل)" : "Export to Excel"}</span>
            </button>

            {/* 10. Refresh Button (Professional grey/blue) */}
            <button
              onClick={handleRefresh}
              className="w-full h-12 px-3 text-xs font-bold rounded-xl text-white bg-slate-600 hover:bg-slate-705 active:scale-[0.98] border border-slate-550 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title={isRtl ? "تحديث وتصفير الفلاتر" : "Refresh & Reset Filters"}
            >
              <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="truncate">{isRtl ? "إعادة تعيين وتحديث" : "Reset & Refresh"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Standalone Table Grid Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Dynamic Scroll Container incorporating sticky SOC headers and task strips */}
        <div className="relative overflow-x-auto w-full">
          <div className="min-w-[990px]">
          
          {/* Sticky Headers styled as SOC Glass Panel - Soft Premium Header */}
          <div 
            className={`sticky top-0 z-20 select-none shadow-md rounded-t-[16px] overflow-hidden ${
              isDark 
                ? "bg-gradient-to-r from-[#0F172A] to-[#111827] text-[#CBD5E1]" 
                : "bg-[#F8FAFC] text-[#0F172A] border-b border-[#E2E8F0]"
            }`}
            style={{ 
              height: "56px",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #E2E8F0"
            }}
          >
            <div 
              className="px-6 h-full"
              style={gridTemplateStyle}
            >
              
              {/* Column 3: Zone */}
              <div 
                onClick={() => handleSort("zone")} 
                className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-center h-full rounded-tl-[16px] rtl:rounded-tr-[16px]"
                style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#CBD5E1" : "#0F172A" }}
              >
                <span>{t.colZone}</span>
                {getSortIcon("zone")}
              </div>

              {/* Column 2: Day */}
              <div 
                onClick={() => handleSort("day")} 
                className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-center h-full"
                style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#CBD5E1" : "#0F172A" }}
              >
                <span>{t.colDay}</span>
                {getSortIcon("day")}
              </div>

              {/* Column 1: Date */}
              <div 
                onClick={() => handleSort("date")} 
                className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-center h-full"
                style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#CBD5E1" : "#0F172A" }}
              >
                <span>{t.colDate}</span>
                {getSortIcon("date")}
              </div>

              {/* Column 4: Status */}
              <div 
                onClick={() => handleSort("status")} 
                className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-center h-full"
                style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#CBD5E1" : "#0F172A" }}
              >
                <span>{t.colStatus}</span>
                {getSortIcon("status")}
              </div>

              {/* Column 5: Control Type */}
              <div 
                onClick={() => handleSort("control_type")} 
                className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-center h-full"
                style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#CBD5E1" : "#0F172A" }}
              >
                <span>{t.colControl}</span>
                {getSortIcon("control_type")}
              </div>

              {/* Column 6: Health Score */}
              <div 
                onClick={() => handleSort("health_score")} 
                className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-center h-full"
                style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#CBD5E1" : "#0F172A" }}
              >
                <span>{t.colHealth}</span>
                {getSortIcon("health_score")}
              </div>

              {/* Column 7: Notes */}
              <div 
                className="text-center flex items-center justify-center h-full rounded-tr-[16px] rtl:rounded-tl-[16px]"
                style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#CBD5E1" : "#0F172A" }}
              >
                <span>{t.colNotes}</span>
              </div>

            </div>
          </div>

          {/* Scrollable Container with standard high-performance infinite layout */}
          <div 
            ref={scrollContainerRef}
            className="max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-350 dark:scrollbar-thumb-slate-700 scroll-smooth"
          >
            {processedRows.length === 0 ? (
              <div className="py-24 text-center text-sm font-bold text-slate-400 dark:text-slate-550 flex flex-col items-center justify-center gap-2">
                <AlertOctagon className="w-10 h-10 text-amber-500 animate-bounce" />
                <span>{t.noRecords}</span>
              </div>
            ) : (
              processedRows.map((row) => {
                const bStyle = getStatusBadge(row.health_score, row.status_value);
                const ctrlStyle = getControlBadgeStyle(row.control_value);
                const displayDate = row.date ? String(row.date).replace(/-/g, "/") : "";
                
                return (
                  <div 
                    key={row.id}
                    className="px-6 items-center text-[#1E293B] dark:text-slate-150 hover:bg-[#F1F5F9] dark:hover:bg-white/[0.02] border-b border-[#E2E8F0] dark:border-white/[0.04] transition-colors duration-150 group"
                    style={{ 
                      ...gridTemplateStyle,
                      height: "54px",
                      minHeight: "54px",
                      maxHeight: "58px"
                    }}
                  >
                    
                    {/* Column 3: Zone Name */}
                    <div className="flex items-center justify-center text-center py-0.5">
                      <span 
                        className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-[#0f172a] dark:text-[#F8FAFC] transition-colors truncate block text-center"
                        style={{ 
                          fontSize: "15px", 
                          fontWeight: 650
                        }}
                      >
                        {row.zone}
                      </span>
                    </div>

                    {/* Column 2: Day */}
                    <div className="flex items-center justify-center text-center py-0.5">
                      <span 
                        className="px-2.5 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 bg-transparent select-none inline-flex items-center justify-center text-center"
                        style={{ fontSize: "12px", fontWeight: 600, height: "26px" }}
                      >
                        {row.day_ar}
                      </span>
                    </div>

                    {/* Column 1: Date */}
                    <div className="flex items-center justify-center text-center py-0.5 text-slate-600 dark:text-[#CBD5E1]">
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>
                        {displayDate}
                      </span>
                    </div>

                    {/* Column 4: Status Badge */}
                    <div className="flex items-center justify-center text-center py-0.5">
                      <span 
                        className="rounded-full inline-flex items-center justify-center gap-1.5 select-none"
                        style={{ 
                          backgroundColor: bStyle.bg, 
                          color: bStyle.color, 
                          borderColor: `${bStyle.color}25`,
                          borderWidth: "1px",
                          fontSize: "12px",
                          fontWeight: 600,
                          height: "30px",
                          padding: "0 10px"
                        }}
                      >
                        <span 
                          className="rounded-full shrink-0" 
                          style={{ 
                            width: "8px", 
                            height: "8px", 
                            backgroundColor: bStyle.color,
                            boxShadow: `0 0 6px ${bStyle.color}`
                          }} 
                        />
                        <span>
                          {bStyle.text.replace(/^[🟢🟡🔴]\s*/, "")}
                        </span>
                      </span>
                    </div>

                    {/* Column 5: Control Type */}
                    <div className="flex items-center justify-center text-center py-0.5">
                      <span 
                        className="uppercase tracking-normal block w-fit shrink-0 font-sans shadow-2xs text-center inline-flex items-center justify-center" 
                        style={{ 
                          borderColor: ctrlStyle.borderColor, 
                          color: ctrlStyle.color,
                          backgroundColor: ctrlStyle.bg,
                          borderWidth: "1px",
                          fontSize: "11px",
                          fontWeight: 600,
                          height: "28px",
                          borderRadius: "10px",
                          padding: "4px 10px"
                        }}
                      >
                        {ctrlStyle.text}
                      </span>
                    </div>

                    {/* Column 6: Health Score (Important Value) */}
                    <div className="flex items-center justify-center text-center py-0.5">
                      <div className="flex flex-col gap-1 w-full max-w-[110px] items-center justify-center">
                        <div className="flex justify-center items-center font-mono font-bold text-center">
                          <span style={{ color: row.status_color, fontSize: "14px", fontWeight: 700 }}>
                            {row.health_score}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden" style={{ height: "6px" }}>
                          <div 
                            className="rounded-full transition-all duration-700" 
                            style={{ 
                              height: "6px",
                              width: `${row.health_score}%`,
                              backgroundColor: row.status_color
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 7: Diagnosis Log (Notes) with wrap and custom tooltip */}
                    <div className="relative group flex items-center justify-center text-center py-0.5 w-full">
                      <span 
                        className="leading-normal font-sans cursor-help select-all text-center text-[#475569] dark:text-[#CBD5E1]"
                        style={{ 
                          fontSize: "12px", 
                          fontWeight: 400,
                          opacity: 0.8,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {truncateText(row.notes, 75)}
                      </span>
                      {row.notes && row.notes !== "-" && row.notes.length > 75 && (
                        <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 w-72 p-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs rounded-xl shadow-2xl border border-slate-800 dark:border-slate-200 pointer-events-none transition-all duration-200">
                          <div className="font-sans font-medium text-center leading-relaxed whitespace-normal break-words">
                            {row.notes}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950 dark:border-t-white" />
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
            
            {/* Signal end of feed panel */}
            {processedRows.length > 0 && (
              <div className="py-5 text-center bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 select-none">
                <span className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {isRtl ? "••• نهاية تدفق بث الرصد النشط •••" : "••• END OF ACTIVE LIVE SYSTEMS FEED •••"}
                </span>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modern High-Tech Terminal Footer displaying telemetry records totals strictly */}
      <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
        
        {/* Total segments stats readout */}
        <div className="flex items-center gap-2.5 text-slate-650 dark:text-slate-300 font-bold select-none">
          <Terminal className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-sm uppercase tracking-wider text-slate-500">
            {t.terminalStatus}:
          </span>
          <span className="bg-indigo-650 text-white px-3 py-0.5 rounded font-black text-[13px] shadow-sm animate-pulse">
            {processedRows.length}
          </span>
        </div>

        {/* Dynamic active notification reading count */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase select-none">
          <span>{isRtl ? "حالة البيانات: متزامنة" : "DATA STATUS: SYNCHRONIZED"}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

      </div>

    </div>

  </div>
);
}

export default ZonesTable;
