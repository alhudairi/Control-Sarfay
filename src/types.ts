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
  color: string;
  severity: string;
}

export interface OperationalEfficiencyPage {
  title_ar: string;
  title_en: string;
  summary: {
    total_zones: number;
    stable_zones: number;
    fluctuating_zones: number;
    out_of_service_zones: number;
    unknown_zones: number;
    efficiency_rate_percent: number;
    risk_rate_percent: number;
    overall_status_ar: string;
    overall_status_en: string;
  };
  kpis: Array<{
    title_ar: string;
    title_en: string;
    value: number;
    percentage?: number;
    color?: string;
    type?: string;
  }>;
  chart_data: {
    status_distribution: StatusDist[];
    zones_health: ZoneHealth[];
  };
  rows: Array<{
    id: number;
    date: string;
    day_ar: string;
    zone: string;
    status_ar: string;
    status_en: string;
    status_value: string;
    icon: string;
    color: string;
    health_score: number;
    severity: string;
    notes: string;
  }>;
}

export interface SectorOperationMechanismPage {
  title_ar: string;
  title_en: string;
  summary: {
    total_records: number;
    local_operation_only_count: number;
    monitoring_only_count: number;
    monitoring_and_control_count: number;
    central_partial_local_count: number;
    legacy_operation_count: number;
  };
  kpis: Array<{
    title_ar: string;
    title_en: string;
    value: number;
    percentage?: number;
    color?: string;
  }>;
  chart_data: {
    control_distribution: ControlDist[];
  };
  rows: Array<{
    id: number;
    date: string;
    day_ar: string;
    zone: string;
    control_type_ar: string;
    control_value: string;
    control_en: string;
    control_color: string;
    notes: string;
  }>;
}

export interface IrrigationLineResponse {
  line_name: string;
  zone: string;
  line_size: string;
  response_score: number;
  color: string;
}

export interface IrrigationNetworkResponsePage {
  title_ar: string;
  title_en: string;
  summary: {
    total_lines: number;
    open_response_success_count: number;
    close_response_success_count: number;
    full_response_success_count: number;
    non_responsive_count: number;
    response_efficiency_percent: number;
  };
  kpis: Array<{
    title_ar: string;
    title_en: string;
    value: number;
    percentage?: number;
    color?: string;
    type?: string;
  }>;
  chart_data: {
    response_distribution: Array<{
      label_ar: string;
      label_en: string;
      value: number;
      color: string;
    }>;
    lines_response: IrrigationLineResponse[];
  };
  rows: Array<{
    id: number;
    date: string;
    day_ar: string;
    day_en?: string;
    line_name: string;
    line_size: string;
    zone: string;
    open_response_ar: string;
    open_response_en: string;
    open_response_value: string;
    close_response_ar: string;
    close_response_en: string;
    close_response_value: string;
    response_score: number;
    action: string;
    fault_reason: string;
    maintenance_status: string;
    treatment_date: string;
    period: string;
  }>;
}

export interface GeneralNotesPage {
  title_ar: string;
  title_en: string;
  summary: {
    total_notes: number;
    open_notes: number;
    resolved_notes: number;
    high_severity_count: number;
  };
  rows: Array<{
    id: number;
    statement: string;
    sector_or_site: string;
    action: string;
    last_update: string;
    severity: string;
    status: string;
  }>;
}

export interface ApiResponse {
  success: boolean;
  source: {
    spreadsheet_id: string;
    spreadsheet_name: string;
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
  pages: {
    operational_efficiency: OperationalEfficiencyPage;
    sector_operation_mechanism: SectorOperationMechanismPage;
    irrigation_network_response: IrrigationNetworkResponsePage;
    general_notes: GeneralNotesPage;
    "الصفحة الرئيسية"?: any;
    home?: any;
    [key: string]: any;
  };
}

export interface Row {
  id: number;
  date: string;
  day_ar: string;
  zone: string;
  status_ar: string;
  status_en: string;
  status_value: string;
  icon: string;
  color: string;
  health_score: number;
  severity: string;
  notes: string;
  control_type_ar?: string;
  control_value?: string;
  control_en?: string;
  control_color?: string;
}

export interface Alert {
  id: number;
  type: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  color: string;
  timestamp: string;
  severity?: string;
  zone?: string;
  status_ar?: string;
  status_en?: string;
  message_ar?: string;
  message_en?: string;
}

export interface MajorIssue {
  id: number;
  title_ar: string;
  title_en: string;
  type: string;
  status_ar: string;
  status_en: string;
  status_value: string;
}

