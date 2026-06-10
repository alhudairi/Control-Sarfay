import React from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  MapPin, 
  Cpu, 
  EyeOff,
  HardDrive
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  percentage?: number;
  type: string;
  color?: string;
  isActive: boolean;
  onClick: () => void;
  lang: "ar" | "en";
  theme?: "light" | "dark";
  key?: any;
}

export function MetricCard({
  title,
  value,
  percentage,
  type,
  color,
  isActive,
  onClick,
  lang,
  theme = "light",
}: MetricCardProps) {
  const isDark = theme === "dark";
  const isRtl = lang === "ar";

  // Select appropriate config based on type
  const getTypeConfig = () => {
    const iconClass = isDark ? "w-5 h-5 text-indigo-400" : "w-5 h-5 text-indigo-600";
    const successClass = isDark ? "w-5 h-5 text-emerald-400" : "w-5 h-5 text-emerald-600";
    const warningClass = isDark ? "w-5 h-5 text-amber-400" : "w-5 h-5 text-amber-600";
    const dangerClass = isDark ? "w-5 h-5 text-[#EF4444]" : "w-5 h-5 text-[#EF4444]";
    const localClass = isDark ? "w-5 h-5 text-amber-500" : "w-5 h-5 text-amber-600";
    const centralClass = isDark ? "w-5 h-5 text-blue-400" : "w-5 h-5 text-blue-600";
    const dualClass = isDark ? "w-5 h-5 text-emerald-400" : "w-5 h-5 text-emerald-600";
    const legacyClass = isDark ? "w-5 h-5 text-slate-400" : "w-5 h-5 text-slate-600";
    const defaultClass = isDark ? "w-5 h-5 text-[#EF4444]" : "w-5 h-5 text-rose-600";

    const iconBgTint = isDark ? 0.15 : 0.08;

    switch (type) {
      case "total":
        return {
          icon: <Building2 className={iconClass} />,
          fallbackColor: "#6366F1",
          iconBg: `rgba(99,102,241,${iconBgTint})`,
        };
      case "success":
      case "stable":
        return {
          icon: <ShieldCheck className={successClass} />,
          fallbackColor: "#22C55E",
          iconBg: `rgba(34,197,94,${iconBgTint})`,
        };
      case "warning":
      case "fluctuating":
        return {
          icon: <Activity className={warningClass} />,
          fallbackColor: "#EAB308",
          iconBg: `rgba(234,179,8,${iconBgTint})`,
        };
      case "danger":
      case "out_of_service":
      case "out of service":
        return {
          icon: <EyeOff className={dangerClass} />,
          fallbackColor: "#EF4444",
          iconBg: `rgba(239,68,68,${iconBgTint})`,
        };
      case "local":
      case "local_only":
      case "local_operation_only":
        return {
          icon: <MapPin className={localClass} />,
          fallbackColor: "#F59E0B",
          iconBg: `rgba(245,158,11,${iconBgTint})`,
        };
      case "central":
      case "monitoring_control":
        return {
          icon: <Cpu className={centralClass} />,
          fallbackColor: "#3B82F6",
          iconBg: `rgba(59,130,246,${iconBgTint})`,
        };
      case "monitoring_only":
        return {
          icon: <Cpu className={isDark ? "w-5 h-5 text-purple-400" : "w-5 h-5 text-purple-650"} />,
          fallbackColor: "#8B5CF6",
          iconBg: `rgba(139,92,246,${iconBgTint})`,
        };
      case "dual":
      case "central_partial_local":
        return {
          icon: <Activity className={dualClass} />,
          fallbackColor: "#10B981",
          iconBg: `rgba(16,185,129,${iconBgTint})`,
        };
      case "legacy_system":
      case "legacy":
      case "legacy_operation":
        return {
          icon: <HardDrive className={legacyClass} />,
          fallbackColor: "#64748B",
          iconBg: `rgba(100,116,139,${iconBgTint})`,
        };
      case "issues":
      case "major_issues":
      default:
        return {
          icon: <AlertTriangle className={defaultClass} />,
          fallbackColor: "#DC2626",
          iconBg: `rgba(220,38,38,${iconBgTint})`,
        };
    }
  };

  const config = getTypeConfig();
  const activeColor = color || config.fallbackColor;

  // Highlights check
  const isOutOfService = type === "out_of_service" || type === "danger" || type === "out of service";
  
  // Custom border color
  let borderColorString = "#E2E8F0";
  if (isDark) {
    borderColorString = isActive ? activeColor : "rgba(255,255,255,0.08)";
  } else {
    if (isActive) {
      borderColorString = activeColor;
    } else if (isOutOfService) {
      borderColorString = "#FCA5A5"; // Soft red border
    } else {
      borderColorString = "#E2E8F0";
    }
  }

  // Dynamic background color matching the table status styles
  const cardBgColor = isDark
    ? isActive
      ? `${activeColor}1F` // ~12% opacity tint
      : `${activeColor}0A` // ~4% opacity tint on dark mode background
    : isActive
      ? `${activeColor}1A` // ~10% opacity tint
      : `${activeColor}06`; // ~2.5% opacity tint

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.015, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        height: "135px",
        borderRadius: "20px",
        padding: "20px",
        borderWidth: "1px",
        borderColor: borderColorString,
        backgroundColor: cardBgColor,
        boxShadow: isDark 
          ? "0 8px 24px rgba(0, 0, 0, 0.4)" 
          : "0 8px 24px rgba(15, 23, 42, 0.08)",
      }}
      className={`relative overflow-hidden text-start transition-all cursor-pointer w-full flex flex-col justify-between select-none ${
        isDark 
          ? isActive 
            ? "border-transparent" 
            : "border-transparent text-[#F8FAFC]"
          : isActive
            ? "ring-2 ring-indigo-500/10 text-[#0F172A]"
            : "text-[#1E293B]"
      }`}
    >
      {/* 1. Top row containing Icon & Title */}
      <div className="flex items-center gap-3 w-full min-w-0 text-start">
        <div 
          className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5"
          style={{ backgroundColor: config.iconBg }}
        >
          {config.icon}
        </div>
        <span 
          className="truncate leading-snug tracking-tight font-sans transition-colors"
          style={{ 
            fontSize: "15px", 
            fontWeight: 700, 
            color: isDark ? "#FFFFFF" : "#1E293B" 
          }}
        >
          {title}
        </span>
      </div>

      {/* 2. Middle row containing the main counter number */}
      <div className="flex items-center w-full my-1 justify-start">
        <span 
          className="font-black font-mono tracking-tight leading-none"
          style={{ 
            fontSize: "36px", 
            fontWeight: 800, 
            color: isDark ? "#FFFFFF" : "#0F172A" 
          }}
        >
          {value}
        </span>
      </div>

      {/* 3. Bottom row containing the Percentage Pill */}
      <div className="flex justify-between items-center w-full">
        {percentage !== undefined ? (
          <span 
            className="rounded-full px-2.5 py-0.5 font-mono text-white flex items-center shrink-0 tracking-tight shadow-xs text-xs font-bold"
            style={{ 
              backgroundColor: activeColor, 
              fontSize: "12px", 
              fontWeight: 700,
            }}
          >
            {percentage}%
          </span>
        ) : (
          <span 
            className="px-2 py-0.5 rounded-full font-bold shrink-0 text-white font-sans text-[11px] shadow-xs"
            style={{ 
              backgroundColor: activeColor,
              fontSize: "11px",
              fontWeight: 700
            }}
          >
            {isActive ? (isRtl ? "نشط" : "Active") : (isRtl ? "عرض" : "View")}
          </span>
        )}
      </div>

      {/* Color-coded bottom accent bar representing the indicator category - Gradient styled */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[4px]" 
        style={{ 
          background: `linear-gradient(90deg, ${activeColor}, ${activeColor}88)`
        }}
      />
    </motion.button>
  );
}

export default MetricCard;
