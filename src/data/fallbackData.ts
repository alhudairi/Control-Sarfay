import { ApiResponse } from "../types";

export const FALLBACK_TELEMETRY_DATA: ApiResponse = {
  "success": true,
  "source": {
    "spreadsheet_id": "1gogs_l2vk3ztn0k6j5ethA8XVUTTMDl10nUi8Uxc198",
    "spreadsheet_name": "Control sarfay",
    "system_name_ar": "وحدة المراقبة والتحكم المركزي",
    "system_name_en": "Central Monitoring & Control Unit"
  },
  "owner": {
    "name_ar": "عبدالرحمن الحضيري",
    "name_en": "Abdulrahman Alhudairi"
  },
  "version": {
    "label_ar": "نسخة تجريبية",
    "label_en": "Prototype Version"
  },
  "last_updated": "2026-06-10T07:34:52.744Z",
  "last_updated_ar": "Wednesday، 2026/06/10 10:34:52",
  "pages": {
    "operational_efficiency": {
      "title_ar": "كفاءة نظام التشغيل",
      "title_en": "Operational System Efficiency",
      "summary": {
        "total_zones": 14,
        "stable_zones": 12,
        "fluctuating_zones": 0,
        "out_of_service_zones": 2,
        "unknown_zones": 0,
        "efficiency_rate_percent": 86,
        "risk_rate_percent": 14,
        "overall_status_ar": "يتطلب الانتباه",
        "overall_status_en": "Attention Required"
      },
      "kpis": [
        {"title_ar": "إجمالي القطاعات", "title_en": "Total Zones", "value": 14, "type": "total"},
        {"title_ar": "مستقر", "title_en": "Stable", "value": 12, "percentage": 86, "color": "#22C55E", "type": "stable"},
        {"title_ar": "متذبذب", "title_en": "Fluctuating", "value": 0, "percentage": 0, "color": "#EAB308", "type": "fluctuating"},
        {"title_ar": "خارج الخدمة", "title_en": "Out of Service", "value": 2, "percentage": 14, "color": "#EF4444", "type": "out_of_service"}
      ],
      "chart_data": {
        "status_distribution": [
          {"label_ar": "مستقر", "label_en": "Stable", "value": 12, "color": "#22C55E"},
          {"label_ar": "متذبذب", "label_en": "Fluctuating", "value": 0, "color": "#EAB308"},
          {"label_ar": "خارج الخدمة", "label_en": "Out of Service", "value": 2, "color": "#EF4444"},
          {"label_ar": "غير معروف", "label_en": "Unknown", "value": 0, "color": "#94A3B8"}
        ],
        "zones_health": [
          {"zone": "Zone 01", "health_score": 100, "status": "مستقر", "color": "#22C55E", "severity": "low"},
          {"zone": "Zone 02", "health_score": 100, "status": "مستقر", "color": "#22C55E", "severity": "low"},
          {"zone": "Zone 03", "health_score": 100, "status": "مستقر", "color": "#22C55E", "severity": "low"},
          {"zone": "Zone (4,5,7,8)", "health_score": 0, "status": "خارج الخدمة", "color": "#EF4444", "severity": "high"},
          {"zone": "Zone 06", "health_score": 100, "status": "مستقر", "color": "#22C55E", "severity": "low"},
          {"zone": "Zone 09", "health_score": 100, "status": "مستقر", "color": "#22C55E", "severity": "low"},
          {"zone": "Zone 10", "health_score": 100, "status": "مستقر", "color": "#22C55E", "severity": "low"}
        ]
      },
      "rows": [
        {"id": 1, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 01", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 2, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 02", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 3, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 03", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 4, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone (4,5,7,8)", "status_ar": "خارج الخدمة", "status_en": "Out of Service", "status_value": "out_of_service", "icon": "🔴", "color": "#EF4444", "health_score": 0, "severity": "high", "notes": "عدم رجوع النظام بعد انقطاع الكهرباء يتم التشغيل بالنظام القديم"},
        {"id": 5, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 06", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 6, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 09", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "تكرار عطل جهاز رقم (2)"},
        {"id": 7, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 10", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 8, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 01", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 9, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 02", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 10, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 03", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 11, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone (4,5,7,8)", "status_ar": "خارج الخدمة", "status_en": "Out of Service", "status_value": "out_of_service", "icon": "🔴", "color": "#EF4444", "health_score": 0, "severity": "high", "notes": "تم جدولة إعادة تشغيل النظام الموحد يوم الأثنين القادم بتاريخ 15-06-2026"},
        {"id": 12, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 06", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 13, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 09", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "-"},
        {"id": 14, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 10", "status_ar": "مستقر", "status_en": "Stable", "status_value": "stable", "icon": "🟢", "color": "#22C55E", "health_score": 100, "severity": "low", "notes": "تعطل جهاز قياس التدفق لقناة F1 والمنفذ من إدارة الحلول الفنية"}
      ]
    },
    "sector_operation_mechanism": {
      "title_ar": "آلية تشغيل القطاعات",
      "title_en": "Sector Operation Mechanism",
      "summary": {
        "total_records": 14,
        "local_operation_only_count": 10,
        "monitoring_only_count": 0,
        "monitoring_and_control_count": 2,
        "central_partial_local_count": 0,
        "legacy_operation_count": 2
      },
      "kpis": [
        {"title_ar": "تشغيل محلي فقط", "title_en": "Local Operation Only", "value": 10, "percentage": 71, "color": "#F59E0B"},
        {"title_ar": "مراقبة فقط", "title_en": "Monitoring Only", "value": 0, "percentage": 0, "color": "#3B82F6"},
        {"title_ar": "مراقبة وتحكم", "title_en": "Monitoring & Control", "value": 2, "percentage": 14, "color": "#22C55E"},
        {"title_ar": "تشغيل عبر النظام القديم", "title_en": "Legacy Operation", "value": 2, "percentage": 14, "color": "#64748B"}
      ],
      "chart_data": {
        "control_distribution": [
          {"label_ar": "تشغيل محلي فقط", "label_en": "Local Operation Only", "value": 10, "color": "#F59E0B"},
          {"label_ar": "مراقبة فقط", "label_en": "Monitoring Only", "value": 0, "color": "#3B82F6"},
          {"label_ar": "مراقبة وتحكم", "label_en": "Monitoring & Control", "value": 2, "color": "#22C55E"},
          {"label_ar": "تشغيل مركزي مع دعم محلي جزئي", "label_en": "Central + Partial Local", "value": 0, "color": "#8B5CF6"},
          {"label_ar": "تشغيل عبر النظام القديم", "label_en": "Legacy Operation", "value": 2, "color": "#64748B"}
        ]
      },
      "rows": [
        {"id": 1, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 01", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 2, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 02", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 3, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 03", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 4, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone (4,5,7,8)", "control_type_ar": "تشغيل عبر النظام القديم", "control_value": "LEGACY_OPERATION", "control_en": "Legacy Operation", "control_color": "#64748B", "notes": "عدم رجوع النظام بعد انقطاع الكهرباء يتم التشغيل بالنظام القديم"},
        {"id": 5, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 06", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 6, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 09", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "تكرار عطل جهاز رقم (2)"},
        {"id": 7, "date": "2026/06/08", "day_ar": "الاثنين", "zone": "Zone 10", "control_type_ar": "مراقبة وتحكم", "control_value": "MONITORING_AND_CONTROL", "control_en": "Monitoring & Control", "control_color": "#22C55E", "notes": "-"},
        {"id": 8, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 01", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 9, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 02", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 10, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 03", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 11, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone (4,5,7,8)", "control_type_ar": "تشغيل عبر النظام القديم", "control_value": "LEGACY_OPERATION", "control_en": "Legacy Operation", "control_color": "#64748B", "notes": "تم جدولة إعادة تشغيل النظام الموحد يوم الأثنين القادم بتاريخ 15-06-2026"},
        {"id": 12, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 06", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 13, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 09", "control_type_ar": "تشغيل محلي فقط", "control_value": "LOCAL_OPERATION_ONLY", "control_en": "Local Operation Only", "control_color": "#F59E0B", "notes": "-"},
        {"id": 14, "date": "2026/06/09", "day_ar": "الثلاثاء", "zone": "Zone 10", "control_type_ar": "مراقبة وتحكم", "control_value": "MONITORING_AND_CONTROL", "control_en": "Monitoring & Control", "control_color": "#22C55E", "notes": "-"}
      ]
    },
    "irrigation_network_response": {
      "title_ar": "كفاءة استجابة شبكات الري",
      "title_en": "Irrigation Network Response Efficiency",
      "summary": {
        "total_lines": 16,
        "open_response_success_count": 11,
        "close_response_success_count": 11,
        "full_response_success_count": 11,
        "non_responsive_count": 5,
        "response_efficiency_percent": 69
      },
      "kpis": [
        {"title_ar": "إجمالي الخطوط", "title_en": "Total Lines", "value": 16, "type": "total"},
        {"title_ar": "استجابة الفتح", "title_en": "Open Response", "value": 11, "percentage": 69, "color": "#22C55E", "type": "open"},
        {"title_ar": "استجابة الإغلاق", "title_en": "Close Response", "value": 11, "percentage": 69, "color": "#22C55E", "type": "close"},
        {"title_ar": "عدم استجابة", "title_en": "Non-Responsive", "value": 5, "percentage": 31, "color": "#EF4444", "type": "non_responsive"}
      ],
      "chart_data": {
        "response_distribution": [
          {"label_ar": "استجابة كاملة", "label_en": "Full Response", "value": 11, "color": "#22C55E"},
          {"label_ar": "عدم استجابة", "label_en": "Non-Responsive", "value": 5, "color": "#EF4444"}
        ],
        "lines_response": [
          {"line_name": "P1", "zone": "Zone 10", "line_size": "1000", "response_score": 100, "color": "#22C55E"},
          {"line_name": "H1", "zone": "Zone 10", "line_size": "800", "response_score": 100, "color": "#22C55E"},
          {"line_name": "P1G", "zone": "Zone 10", "line_size": "600", "response_score": 100, "color": "#22C55E"},
          {"line_name": "P1G -15", "zone": "Zone 10", "line_size": "250", "response_score": 100, "color": "#22C55E"},
          {"line_name": "P1G -16", "zone": "Zone 10", "line_size": "250", "response_score": 100, "color": "#22C55E"},
          {"line_name": "P1G -17", "zone": "Zone 10", "line_size": "250", "response_score": 100, "color": "#22C55E"},
          {"line_name": "P1G-18", "zone": "Zone 10", "line_size": "250", "response_score": 100, "color": "#22C55E"},
          {"line_name": "P1G-20", "zone": "Zone 10", "line_size": "250", "response_score": 100, "color": "#22C55E"},
          {"line_name": "P1G-22", "zone": "Zone 10", "line_size": "250", "response_score": 100, "color": "#22C55E"},
          {"line_name": "P1F-1", "zone": "Zone 10", "line_size": "250", "response_score": 100, "color": "#22C55E"},
          {"line_name": "PE-21", "zone": "Zone 10", "line_size": "250", "response_score": 0, "color": "#EF4444"},
          {"line_name": "PE-22", "zone": "Zone 10", "line_size": "250", "response_score": 0, "color": "#EF4444"},
          {"line_name": "P1F-7", "zone": "Zone 10", "line_size": "250", "response_score": 0, "color": "#EF4444"},
          {"line_name": "P1F-8", "zone": "Zone 10", "line_size": "250", "response_score": 0, "color": "#EF4444"},
          {"line_name": "P1F-9", "zone": "Zone 10", "line_size": "250", "response_score": 0, "color": "#EF4444"},
          {"line_name": "P1F-2", "zone": "Zone 10", "line_size": "800", "response_score": 100, "color": "#22C55E"}
        ]
      },
      "rows": [
        {"id": 1, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1", "line_size": "1000", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 2, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "H1", "line_size": "800", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 3, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1G", "line_size": "600", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 4, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1G -15", "line_size": "250", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 5, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1G -16", "line_size": "250", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 6, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1G -17", "line_size": "250", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 7, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1G-18", "line_size": "250", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 8, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1G-20", "line_size": "250", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 9, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1G-22", "line_size": "250", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 10, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1F-1", "line_size": "250", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"},
        {"id": 11, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "PE-21", "line_size": "250", "zone": "Zone 10", "open_response_ar": "لا يستجيب", "open_response_en": "Non-Responsive", "open_response_value": "non_responsive", "close_response_ar": "لا يستجيب", "close_response_en": "Non-Responsive", "close_response_value": "non_responsive", "response_score": 0, "action": "مرفوع للصيانة", "fault_reason": "لا يوجد تحكم في الفتح والاغلاق التحكم من الغرفة فقط", "maintenance_status": "لم يعالج", "treatment_date": "", "period": "-46182"},
        {"id": 12, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "PE-22", "line_size": "250", "zone": "Zone 10", "open_response_ar": "لا يستجيب", "open_response_en": "Non-Responsive", "open_response_value": "non_responsive", "close_response_ar": "لا يستجيب", "close_response_en": "Non-Responsive", "close_response_value": "non_responsive", "response_score": 0, "action": "مرفوع للصيانة", "fault_reason": "لا يوجد تحكم في الفتح والاغلاق التحكم من الغرفة فقط", "maintenance_status": "لم يعالج", "treatment_date": "", "period": "-46182"},
        {"id": 13, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1F-7", "line_size": "250", "zone": "Zone 10", "open_response_ar": "لا يستجيب", "open_response_en": "Non-Responsive", "open_response_value": "non_responsive", "close_response_ar": "لا يستجيب", "close_response_en": "Non-Responsive", "close_response_value": "non_responsive", "response_score": 0, "action": "مرفوع للصيانة", "fault_reason": "لا يوجد تحكم في الفتح والاغلاق التحكم من الغرفة فقط", "maintenance_status": "لم يعالج", "treatment_date": "", "period": "-46182"},
        {"id": 14, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1F-8", "line_size": "250", "zone": "Zone 10", "open_response_ar": "لا يستجيب", "open_response_en": "Non-Responsive", "open_response_value": "non_responsive", "close_response_ar": "لا يستجيب", "close_response_en": "Non-Responsive", "close_response_value": "non_responsive", "response_score": 0, "action": "مرفوع للصيانة", "fault_reason": "لا يوجد تحكم في الفتح والاغلاق التحكم من الغرفة فقط", "maintenance_status": "لم يعالج", "treatment_date": "", "period": "-46182"},
        {"id": 15, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1F-9", "line_size": "250", "zone": "Zone 10", "open_response_ar": "لا يستجيب", "open_response_en": "Non-Responsive", "open_response_value": "non_responsive", "close_response_ar": "لا يستجيب", "close_response_en": "Non-Responsive", "close_response_value": "non_responsive", "response_score": 0, "action": "مرفوع للصيانة", "fault_reason": "لا يوجد تحكم في الفتح والاغلاق التحكم من الغرفة فقط", "maintenance_status": "لم يعالج", "treatment_date": "", "period": "-46182"},
        {"id": 16, "date": "2026/06/09", "day_ar": "الثلاثاء", "line_name": "P1F-2", "line_size": "800", "zone": "Zone 10", "open_response_ar": "يستجيب", "open_response_en": "Responsive", "open_response_value": "responsive", "close_response_ar": "يستجيب", "close_response_en": "Responsive", "close_response_value": "responsive", "response_score": 100, "action": "مرفوع للصيانة", "fault_reason": "-", "maintenance_status": "-", "treatment_date": "", "period": "-46182"}
      ]
    },
    "general_notes": {
      "title_ar": "ملاحظات عامة",
      "title_en": "General Notes",
      "summary": {
        "total_notes": 5,
        "open_notes": 4,
        "resolved_notes": 1,
        "high_severity_count": 2
      },
      "rows": [
        {"id": 1, "statement": "عدم وجود آلية معتمدة لإدارة ورفع البلاغات الفنية الخاصة بالأعطال.", "sector_or_site": "جميع القطاعات", "action": "يتم التنسيق بشكل مباشر عن طريق الاتصالات الهاتفية", "last_update": "2026/06/10", "severity": "medium", "status": "open"},
        {"id": 2, "statement": " تكرار عطل جهاز رقم (2) في قطاع (9) وتم اصلاحة يوم الاثنين بتاريخ 8-06-2026", "sector_or_site": "Zone 09", "action": "تم الانتهاء من الاصلاح الأثنين 8-06-2026", "last_update": "2026/06/10", "severity": "medium", "status": "resolved"},
        {"id": 3, "statement": " عدم رجوع النظام بعد حدوث انقطاع الكهرباء في قطاع رقم (5).", "sector_or_site": "Zone 05", "action": "تم جدولة اعادة النظام القديم في يوم الاثنين القادم بتاريخ 15/06/2026", "last_update": "2026/06/10", "severity": "high", "status": "open"},
        {"id": 4, "statement": "الربط ومراقبة اشغيلة محطة الضخ بالخبر وبقيق عن طريق النظام الموحد AVEVA", "sector_or_site": "محطتي الضخ بالخبر وبقيق", "action": "-", "last_update": "2026/06/10", "severity": "low", "status": "open"},
        {"id": 5, "statement": "تعطل جهاز قياس التدفق لقناة F1 والمنفذ من إدارة الحلول الفنية", "sector_or_site": "Zone 10", "action": "تم الرفع وابلاغ المختصين", "last_update": "2026/06/10", "severity": "high", "status": "open"}
      ]
    },
    "الصفحة الرئيسية": {
      "title_ar": "الصفحة الرئيسية - لوحة الإدارة التنفيذية",
      "title_en": "Home Page - Unified Monitoring Panel",
      "summary": {
        "total_zones": 14,
        "efficiency_rate_percent": 86,
        "active_notes_count": 4,
        "system_status_ar": "مستقر جزئياً",
        "system_status_en": "Partially Stable"
      },
      "kpis": [
        {"title_ar": "كفاءة التشغيل الشاملة", "title_en": "Overall System Efficiency", "value": "86%", "percentage": 86, "color": "#22C55E", "type": "stable"},
        {"title_ar": "معدل استجابة الخطوط", "title_en": "Irrigation Line Response", "value": "69%", "percentage": 69, "color": "#EAB308", "type": "response"},
        {"title_ar": "القطاعات المتصلة", "title_en": "Sectors Online", "value": "12 / 14", "percentage": 86, "color": "#3B82F6", "type": "total"},
        {"title_ar": "بلاغات تتطلب معالجة", "title_en": "Open Issue Trackers", "value": "4", "percentage": 28, "color": "#EF4444", "type": "out_of_service"}
      ],
      "rows": [
        {"القطاع": "Zone 01", "الحالة": "مستقر / Stable", "آلية التشغيل": "محلي فقط / Local Operation Only", "مؤشر الصحة": "100%", "التاريخ": "2026/06/10", "اليوم": "الأربعاء / Wednesday", "ملاحظات": "يعمل بالنظام الموحد بكفاءة تامة"},
        {"القطاع": "Zone 02", "الحالة": "مستقر / Stable", "آلية التشغيل": "محلي فقط / Local Operation Only", "مؤشر الصحة": "100%", "التاريخ": "2026/06/10", "اليوم": "الأربعاء / Wednesday", "ملاحظات": "تغطية ممتازة ومؤشر الأداء مرتفع"},
        {"القطاع": "Zone 03", "الحالة": "مستقر / Stable", "آلية التشغيل": "محلي فقط / Local Operation Only", "مؤشر الصحة": "100%", "التاريخ": "2026/06/10", "اليوم": "الأربعاء / Wednesday", "ملاحظات": "ربط ميكانيكي وكهربائي كامل"},
        {"القطاع": "Zone (4,5,7,8)", "الحالة": "خارج الخدمة / Out of Service", "آلية التشغيل": "تشغيل قديم / Legacy Operating", "مؤشر الصحة": "0%", "التاريخ": "2026/06/10", "اليوم": "الأربعاء / Wednesday", "ملاحظات": "عدم رجوع الموحد بعد انقطاع كهربائي"},
        {"القطاع": "Zone 06", "الحالة": "مستقر / Stable", "آلية التشغيل": "محلي فقط / Local Operation Only", "مؤشر الصحة": "100%", "التاريخ": "2026/06/10", "اليوم": "الأربعاء / Wednesday", "ملاحظات": "ضخ مائي اعتيادي بدون انقطاع"},
        {"القطاع": "Zone 09", "الحالة": "مستقر / Stable", "آلية التشغيل": "محلي فقط / Local Operation Only", "مؤشر الصحة": "100%", "التاريخ": "2026/06/10", "اليوم": "الأربعاء / Wednesday", "ملاحظات": "اصلاح ناجح للجهاز رقم 2 الأسبوع الجاري"},
        {"القطاع": "Zone 10", "الحالة": "مستقر / Stable", "آلية التشغيل": "مراقبة وتحكم / Full Monitoring", "مؤشر الصحة": "100%", "التاريخ": "2026/06/10", "اليوم": "الأربعاء / Wednesday", "ملاحظات": "تكامل تام مع شاشات المراقبة بـ AVEVA"}
      ]
    }
  }
};
