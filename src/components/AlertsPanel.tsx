import React from "react";
import { motion } from "motion/react";
import { AlertOctagon, AlertTriangle, Info, BellRing } from "lucide-react";
import { Alert } from "../types";

interface AlertsPanelProps {
  alerts: Alert[];
  lang: "ar" | "en";
  viewMode?: "desktop" | "tablet" | "mobile";
  title?: string;
}

export function AlertsPanel({ alerts, lang, viewMode = "desktop", title }: AlertsPanelProps) {
  const isRtl = lang === "ar";

  const gridClass = 
    viewMode === "desktop"
      ? "grid grid-cols-3 gap-6"
      : viewMode === "tablet"
      ? "grid grid-cols-2 gap-[18px]"
      : "grid grid-cols-1 gap-[14px]";

  const t = {
    title: title || (isRtl ? "التنبيهات والملاحظات الاستثنائية" : "Exceptional Technical Alerts & Notes"),
    noAlerts: isRtl ? "لا توجد ملاحظات استثنائية حالية" : "No critical notes found in the spreadsheet",
    severity: isRtl ? "مستوى الخطورة" : "Severity",
    zone: isRtl ? "القطاع" : "Zone",
    status: isRtl ? "الحالة" : "Status",
    high: isRtl ? "حرجة" : "Critical (High)",
    medium: isRtl ? "متوسطة" : "Medium",
    low: isRtl ? "منخفضة" : "Low",
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
      case "critical":
        return {
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-900",
          text: "text-red-900 dark:text-red-200",
          accentColor: "#EF4444",
          icon: <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
          label: t.high,
        };
      case "medium":
      case "warning":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          border: "border-amber-200 dark:border-amber-900",
          text: "text-amber-900 dark:text-amber-200",
          accentColor: "#F59E0B",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          label: t.medium,
        };
      case "low":
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/20",
          border: "border-blue-200 dark:border-blue-900",
          text: "text-blue-900 dark:text-blue-200",
          accentColor: "#3B82F6",
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
          label: t.low,
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <BellRing className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {t.title}
        </h3>
        {alerts.length > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-850 dark:bg-red-950/50 dark:text-red-200 font-mono font-bold animate-pulse">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-center text-sm text-gray-500 dark:text-gray-400">
          {t.noAlerts}
        </div>
      ) : (
        <div className={gridClass}>
          {alerts.map((alert, idx) => {
            const styles = getSeverityStyle(alert.severity);
            const borderAccentClass = isRtl 
              ? "border-r-[4.5px] border-l border-y" 
              : "border-l-[4.5px] border-r border-y";
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                style={{ borderColor: styles.accentColor }}
                className={`p-4 rounded-lg flex flex-col justify-between relative overflow-hidden ${borderAccentClass} ${styles.bg} ${styles.border}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {styles.icon}
                  </div>
                  <div className="space-y-1 text-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {t.zone} {alert.zone}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold border" style={{ borderColor: styles.accentColor, color: styles.accentColor }}>
                        {isRtl ? alert.status_ar : alert.status_en}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-bold">
                      {isRtl ? alert.message_ar : alert.message_en}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-250 dark:border-slate-700/60 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.severity}:
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold ${styles.text}`}>
                    {styles.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AlertsPanel;
