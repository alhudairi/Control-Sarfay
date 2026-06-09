import { ApiResponse } from "../types";

export const FALLBACK_TELEMETRY_DATA: ApiResponse = {
  success: true,
  source: {
    spreadsheet_id: "1M2Vv3_Xn9S8Xp7mHe_H_4D_Xy6z8V-example-sheet",
    spreadsheet_name: "Central Systems Telemetry Data",
    main_sheet_name: "القطاعات الفنية - الرئيسية",
    issues_sheet_name: "سجل المشاكل والأعطال",
    system_name_ar: "نظام مراقبة الأنظمة التشغيلية الفنية",
    system_name_en: "Technical Operating Systems Telemetry Console"
  },
  owner: {
    name_ar: "عبدالرحمن الحضيري",
    name_en: "Abdulrahman Alhudairi"
  },
  version: {
    label_ar: "النسخة التجريبية 3.2",
    label_en: "Prototype v3.2 (Resilient)"
  },
  last_updated: new Date().toISOString(),
  last_updated_ar: new Date().toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  last_data_entry: {
    date: new Date().toLocaleDateString("en-US"),
    day_ar: "الاثنين"
  },
  summary: {
    total_zones: 10,
    stable_zones: 7,
    fluctuating_zones: 2,
    out_of_service_zones: 1,
    unknown_zones: 0,
    stable_rate_percent: 70,
    out_of_service_rate_percent: 10,
    local_only_count: 2,
    central_only_count: 3,
    dual_count: 4,
    partial_local_count: 1,
    local_rate_percent: 20,
    central_rate_percent: 30,
    major_issues_count: 2,
    overall_status: "Operational Stability: Moderate Risk",
    overall_status_ar: "استقرار الأنظمة: مستوى مخاطر متوسط"
  },
  kpis: [
    {
      title_ar: "معدل استقرار القطاعات",
      title_en: "Global Stability Rate",
      value: 70,
      percentage: 70,
      type: "stable"
    },
    {
      title_ar: "القطاعات المتذبذبة",
      title_en: "Fluctuating Channels",
      value: 2,
      percentage: 20,
      type: "fluctuating"
    },
    {
      title_ar: "أنظمة خارج الخدمة",
      title_en: "Systems Offline",
      value: 1,
      percentage: 10,
      type: "out_of_service"
    },
    {
      title_ar: "قنوات تحكم محلي",
      title_en: "Local Control Feeds",
      value: 2,
      percentage: 20,
      type: "local_only"
    },
    {
      title_ar: "قنوات تحكم مركزي",
      title_en: "Central Control Feeds",
      value: 3,
      percentage: 30,
      type: "central_only"
    },
    {
      title_ar: "الأعطال الكبرى المسجلة",
      title_en: "Logged Major Failures",
      value: 2,
      percentage: 100,
      type: "major_issues"
    }
  ],
  chart_data: {
    status_distribution: [
      { label_ar: "مستقر", label_en: "Stable", value: 7, color: "#10B981" },
      { label_ar: "متذبذب", label_en: "Fluctuating", value: 2, color: "#F59E0B" },
      { label_ar: "خارج الخدمة", label_en: "Out of Service", value: 1, color: "#EF4444" }
    ],
    control_distribution: [
      { label_ar: "تحكم محلي فقط", label_en: "Local Only", value: 2, color: "#3B82F6" },
      { label_ar: "تحكم مركزي فقط", label_en: "Central Only", value: 3, color: "#8B5CF6" },
      { label_ar: "تحكم مزدوج", label_en: "Dual Mode", value: 3, color: "#10B981" },
      { label_ar: "تحكم محلي جزئي", label_en: "Partial Local", value: 1, color: "#F59E0B" },
      { label_ar: "تشغيل عبر النظام القديم", label_en: "Legacy System", value: 1, color: "#64748B" }
    ],
    zones_health: [
      { zone: "منطقة الرياض", health_score: 98, status: "Active System Normal", control_type: "Dual Mode", severity: "low", color: "#10B981" },
      { zone: "منطقة مكة المكرمة", health_score: 100, status: "Active System Normal", control_type: "Central Only", severity: "low", color: "#10B981" },
      { zone: "منطقة المدينة المنورة", health_score: 95, status: "Active System Normal", control_type: "Dual Mode", severity: "low", color: "#10B981" },
      { zone: "المنطقة الشرقية", health_score: 65, status: "Under Maintenance", control_type: "Partial Local", severity: "medium", color: "#F59E0B" },
      { zone: "منطقة عسير", health_score: 100, status: "Active System Normal", control_type: "Central Only", severity: "low", color: "#10B981" },
      { zone: "منطقة تبوك", health_score: 0, status: "Power Grid Disrupted", control_type: "Local Only", severity: "high", color: "#EF4444" },
      { zone: "منطقة حائل", health_score: 92, status: "Active System Normal", control_type: "Dual Mode", severity: "low", color: "#10B981" },
      { zone: "منطقة الحدود الشمالية", health_score: 100, status: "Active System Normal", control_type: "Central Only", severity: "low", color: "#10B981" },
      { zone: "منطقة جازان", health_score: 75, status: "Firmware Signal Fluctuation", control_type: "Local Only", severity: "medium", color: "#F59E0B" },
      { zone: "منطقة نجران", health_score: 94, status: "Active System Normal", control_type: "Dual Mode", severity: "low", color: "#10B981" }
    ]
  },
  alerts: [
    {
      zone: "منطقة تبوك",
      status_ar: "انقطاع كامل في الخدمة",
      status_en: "Complete Service Outage",
      message_ar: "فشل في تغذية التيار الكهربائي الرئيسي لوحدات التحكم ومحطات الرصد الفرعية وجاري العمل على الإصلاح.",
      message_en: "Primary power unit feed fault at monitoring node; active emergency dispatch dispatched to site.",
      severity: "high"
    },
    {
      zone: "المنطقة الشرقية",
      status_ar: "أعمال ترقية وصيانة متذبذبة",
      status_en: "Fluctuating Maintenance Upgrades",
      message_ar: "تذبذب مؤقت في استلام ومعالجة حزم الاتصالات والقياس عن بعد بسبب أعمال الصيانة الوقائية.",
      message_en: "Temporary packets drop detected on telemetry channels due to ongoing preventive maintenance protocols.",
      severity: "medium"
    }
  ],
  major_issues: [
    {
      id: "MI-209",
      zone: "منطقة تبوك",
      issue_ar: "فشل تيار خط التغذية الاحتياطي",
      issue_en: "Backup Mainline Feed Failure",
      issue: "Backup Mainline Feed Failure",
      problem_ar: "انقطاع الكابل الكهربائي الأرضي الممتد للوحدة رقم ٤ جراء أعمال حفر خارجية.",
      problem_en: "Excavation digging disrupted underground feed cables routing power to Central Receiver Node 4.",
      severity_ar: "حرج جداً",
      severity_en: "Critical Action Required",
      severity: "high",
      status_ar: "نشط جاري الإصلاح",
      status_en: "Active Site Fixing",
      status: "Active"
    },
    {
      id: "MI-210",
      zone: "منطقة جازان",
      issue_ar: "تداخل في إشارات الراديو اللاسلكية",
      issue_en: "Telemetry Frequency Interference",
      issue: "Telemetry Frequency Interference",
      problem_ar: "ارتفاع منسوب الضجيج الكهرومغناطيسي مما أدى لتأخير استجابة بث الصحة التشغيلية لـ ٧٥٪.",
      problem_en: "Electromagnetic signals overlaps caused operational reporting metrics delay down to 75%.",
      severity_ar: "متوسط",
      severity_en: "Medium Precautionary",
      severity: "medium",
      status_ar: "تحت المراقبة والتحسين",
      status_en: "Monitored / Tuning",
      status: "Pending"
    }
  ],
  rows: [
    {
      id: 1,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة الرياض",
      status_ar: "مستقر تشغيلياً",
      status_en: "Operational Stable",
      status_value: "stable",
      status_color: "#10B981",
      icon: "ShieldCheck",
      control_type_ar: "تحكم مزدوج",
      control_value: "Dual Mode",
      control_color: "#10B981",
      notes: "النظام ينبض بكفاءة عالية كامل القياسات التشغيلية ضمن النطاق الأخضر المعتمد.",
      health_score: 98,
      severity: "low"
    },
    {
      id: 2,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة مكة المكرمة",
      status_ar: "مستقر تشغيلياً",
      status_en: "Operational Stable",
      status_value: "stable",
      status_color: "#10B981",
      icon: "ShieldCheck",
      control_type_ar: "تحكم مركزي فقط",
      control_value: "Central Only",
      control_color: "#8B5CF6",
      notes: "قنوات التوجيه الرقمي المركزي نشطة ومؤشرات الوصول لجميع الخوادم الفرعية ١٠٠٪.",
      health_score: 100,
      severity: "low"
    },
    {
      id: 3,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة المدينة المنورة",
      status_ar: "مستقر تشغيلياً",
      status_en: "Operational Stable",
      status_value: "stable",
      status_color: "#10B981",
      icon: "ShieldCheck",
      control_type_ar: "تحكم مزدوج",
      control_value: "Dual Mode",
      control_color: "#10B981",
      notes: "ربط رقمي مستقر ومستمر مع مركز المعالجة الاحتياطي ووحدة الأمن السيبراني.",
      health_score: 95,
      severity: "low"
    },
    {
      id: 4,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "المنطقة الشرقية",
      status_ar: "متذبذب جزئياً",
      status_en: "Fluctuating Operational State",
      status_value: "fluctuating",
      status_color: "#F59E0B",
      icon: "AlertTriangle",
      control_type_ar: "تحكم محلي جزئي",
      control_value: "Partial Local",
      control_color: "#F59E0B",
      notes: "إعادة توجيه البيانات عبر خوادم محلية مؤقتاً بسبب ترقية الكابل الضوئي الرئيسي.",
      health_score: 65,
      severity: "medium"
    },
    {
      id: 5,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة عسير",
      status_ar: "مستقر تشغيلياً",
      status_en: "Operational Stable",
      status_value: "stable",
      status_color: "#10B981",
      icon: "ShieldCheck",
      control_type_ar: "تحكم مركزي فقط",
      control_value: "Central Only",
      control_color: "#8B5CF6",
      notes: "تغطية ممتازة لكافة محطات الضخ وتوليد الطاقة الفرعية دون توقف.",
      health_score: 100,
      severity: "low"
    },
    {
      id: 6,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة تبوك",
      status_ar: "خارج الخدمة",
      status_en: "Out of Service",
      status_value: "out_of_service",
      status_color: "#EF4444",
      icon: "WifiOff",
      control_type_ar: "تحكم محلي فقط",
      control_value: "Local Only",
      control_color: "#3B82F6",
      notes: "انقطاع كهربائي كامل في المحطة رقم ٤. تم إرسال فريق الصيانة و تشغيل المولد الاضطراري.",
      health_score: 0,
      severity: "high"
    },
    {
      id: 7,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة حائل",
      status_ar: "مستقر تشغيلياً",
      status_en: "Operational Stable",
      status_value: "stable",
      status_color: "#10B981",
      icon: "ShieldCheck",
      control_type_ar: "تحكم مزدوج",
      control_value: "Dual Mode",
      control_color: "#10B981",
      notes: "الأجهزة تقوم بمعايرة الاستهلاك والتدفق بدقة بالغة. لا إنذارات.",
      health_score: 92,
      severity: "low"
    },
    {
      id: 8,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة الحدود الشمالية",
      status_ar: "مستقر تشغيلياً",
      status_en: "Operational Stable",
      status_value: "stable",
      status_color: "#10B981",
      icon: "ShieldCheck",
      control_type_ar: "تحكم مركزي فقط",
      control_value: "Central Only",
      control_color: "#8B5CF6",
      notes: "البث التلفزي لتصحيح المسارات نشط ويعمل كالمعتاد وفق بروتوكولات الأمان.",
      health_score: 100,
      severity: "low"
    },
    {
      id: 9,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة جازان",
      status_ar: "متذبذب جزئياً",
      status_en: "Fluctuating Operational State",
      status_value: "fluctuating",
      status_color: "#F59E0B",
      icon: "AlertTriangle",
      control_type_ar: "تحكم محلي فقط",
      control_value: "Local Only",
      control_color: "#3B82F6",
      notes: "تقلب جودة الاتصال اللاسلكي من البرج الداعم ٢٠ بسبب رياح موسمية عالية.",
      health_score: 75,
      severity: "medium"
    },
    {
      id: 10,
      date: new Date().toLocaleDateString("en-US"),
      day_ar: "الاثنين",
      zone: "منطقة نجران",
      status_ar: "مستقر تشغيلياً",
      status_en: "Operational Stable",
      status_value: "stable",
      status_color: "#10B981",
      icon: "ShieldCheck",
      control_type_ar: "تشغيل عبر النظام القديم",
      control_value: "Legacy System",
      control_color: "#64748B",
      notes: "مستوى القياس ضمن الحد الطبيعي للمخزون الحراري والتشغيلي.",
      health_score: 94,
      severity: "low"
    }
  ]
};
