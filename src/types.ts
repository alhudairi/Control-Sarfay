export interface StatusDist {
  label_ar: string;
  label_en: string;
  value: number;
  color: string;
}

export interface ControlDist {
  label_ar: string;
  label_en: string;
  value: number;
  color: string;
}

export interface ZoneHealth {
  zone: string;
  health_score: number;
  status: string;
  control_type: string;
  severity: string;
  color: string;
}

export interface Alert {
  zone: string;
  status_ar: string;
  status_en: string;
  message_ar: string;
  message_en: string;
  severity: string;
}

export interface MajorIssue {
  id: number | string;
  zone: string;
  issue_ar?: string;
  issue_en?: string;
  issue?: string;
  problem_ar?: string;
  problem_en?: string;
  severity_ar?: string;
  severity_en?: string;
  severity?: string;
  status_ar?: string;
  status_en?: string;
  status?: string;
}

export interface Row {
  id: number;
  date: string;
  day_ar: string;
  zone: string;
  status_ar: string;
  status_en: string;
  status_value: string;
  status_color: string;
  icon: string;
  control_type_ar: string;
  control_value: string;
  control_color: string;
  notes: string;
  health_score: number;
  severity: string;
}

export interface ApiResponse {
  success: boolean;
  source: {
    spreadsheet_id: string;
    spreadsheet_name: string;
    main_sheet_name: string;
    issues_sheet_name: string;
    system_name_ar: string;
    system_name_en: string;
  };
  owner: {
    name_ar: string;
    name_en: string;
  };
  version: {
    label_ar: string;
    label_en: string;
  };
  last_updated: string;
  last_updated_ar: string;
  last_data_entry: {
    date: string;
    day_ar: string;
  };
  summary: {
    total_zones: number;
    stable_zones: number;
    fluctuating_zones: number;
    out_of_service_zones: number;
    unknown_zones: number;
    stable_rate_percent: number;
    out_of_service_rate_percent: number;
    local_only_count: number;
    central_only_count: number;
    dual_count: number;
    partial_local_count: number;
    local_rate_percent: number;
    central_rate_percent: number;
    major_issues_count: number;
    overall_status: string;
    overall_status_ar: string;
  };
  kpis: Array<{
    title_ar: string;
    title_en: string;
    value: number;
    percentage?: number;
    type: string;
  }>;
  chart_data: {
    status_distribution: StatusDist[];
    control_distribution: ControlDist[];
    zones_health: ZoneHealth[];
  };
  alerts: Alert[];
  major_issues: MajorIssue[];
  rows: Row[];
  general_notes?: any[];
  fluctuations?: any[];
}
