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

  // Select appropriate config based on type
  const getTypeConfig = () => {
    const iconClass = isDark ? "w-5 h-5 text-indigo-400" : "w-5 h-5 text-indigo-600";
    const successClass = isDark ? "w-5 h-5 text-emerald-400" : "w-5 h-5 text-emerald-600";
    const warningClass = isDark ? "w-5 h-5 text-amber-400" : "w-5 h-5 text-amber-600";
    const dangerClass = isDark ? "w-5 h-5 text-[#EF4444]" : "w-5 h-5 text-rose-600";
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
        return {
          icon: <ShieldCheck className={successClass} />,
          fallbackColor: "#22C55E",
          iconBg: `rgba(34,197,94,${iconBgTint})`,
        };
      case "warning":
        return {
          icon: <Activity className={warningClass} />,
          fallbackColor: "#F59E0B",
          iconBg: `rgba(245,158,11,${iconBgTint})`,
        };
      case "danger":
        return {
          icon: <EyeOff className={dangerClass} />,
          fallbackColor: "#EF4444",
          iconBg: `rgba(239,68,68,${iconBgTint})`,
        };
      case "local":
        return {
          icon: <MapPin className={localClass} />,
          fallbackColor: "#F59E0B",
          iconBg: `rgba(245,158,11,${iconBgTint})`,
        };
      case "central":
        return {
          icon: <Cpu className={centralClass} />,
          fallbackColor: "#3B82F6",
          iconBg: `rgba(59,130,246,${iconBgTint})`,
        };
      case "dual":
        return {
          icon: <Activity className={dualClass} />,
          fallbackColor: "#22C55E",
          iconBg: `rgba(34,197,94,${iconBgTint})`,
        };
      case "legacy_system":
      case "legacy":
        return {
          icon: <HardDrive className={legacyClass} />,
          fallbackColor: "#64748B",
          iconBg: `rgba(100,116,139,${iconBgTint})`,
        };
      case "issues":
      default:
        return {
          icon: <AlertTriangle className={defaultClass} />,
          fallbackColor: "#DC2626",
          iconBg: `rgba(220,38,38,${iconBgTint})`,
        };
    }
  };

  const config = getTypeConfig();
  // Ensure we prioritize color from props, fallback to our default type color mapping
  const activeColor = color || config.fallbackColor;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.015, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        height: "118px",
        borderRadius: "18px",
        padding: "18px",
        borderWidth: "1.5px",
        borderColor: isActive 
          ? activeColor 
          : (isDark ? `${activeColor}2d` : "#E2E8F0"),
      }}
      className={`relative overflow-hidden text-start transition-all cursor-pointer w-full flex flex-col justify-between select-none shadow-lg ${
        isDark 
          ? isActive 
            ? "bg-gradient-to-br from-[#1b2640] via-[#121a2d] to-[#0a101d] ring-1 ring-white/10" 
            : "bg-gradient-to-br from-[#121c30] to-[#0a101d] border-transparent hover:from-[#15213a] hover:to-[#0c1425]"
          : isActive
            ? "bg-[#FFFFFF] ring-2 ring-indigo-500/10 shadow-md"
            : "bg-[#FFFFFF] border-transparent hover:shadow-xl hover:translate-y-[-1px]"
      }`}
    >
      {/* Top row containing Title and Spacious Premium Icon Badge */}
      <div className="flex justify-between items-start w-full gap-2 mb-1">
        <span 
          className="text-[14px] font-bold line-clamp-1 leading-snug tracking-tight font-sans transition-colors duration-150"
          style={{ fontSize: "14px", fontWeight: 700, color: isDark ? "#E5E7EB" : "#0F172A" }}
        >
          {title}
        </span>
        <div 
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${isDark ? "border-white/5" : "border-slate-100"}`}
          style={{ backgroundColor: config.iconBg }}
        >
          {config.icon}
        </div>
      </div>

      {/* Bottom row containing the executive styled Main Number & Percentage indicator */}
      <div className="flex justify-between items-end w-full mt-auto">
        <span 
          className="text-[32px] font-black font-mono tracking-tight leading-none transition-colors duration-150"
          style={{ fontSize: "32px", fontWeight: 900, color: isDark ? "#FFFFFF" : "#0F172A" }}
        >
          {value}
        </span>
        
        {percentage !== undefined && (
          <span 
            className="text-[11px] font-bold px-2 py-0.5 rounded-full font-mono text-white flex items-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] bg-opacity-95"
            style={{ 
              backgroundColor: activeColor, 
              fontSize: "11px", 
              fontWeight: 700,
            }}
          >
            {percentage}%
          </span>
        )}

        {percentage === undefined && isActive && (
          <span 
            className="text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 animate-pulse text-white font-sans"
            style={{ backgroundColor: activeColor }}
          >
            {lang === "ar" ? "نشط" : "Active"}
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
