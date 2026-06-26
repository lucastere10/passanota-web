export type InvoiceStatus = "pending" | "parsed" | "failed";
export type InvoiceSource = "photo_ai";

export type FuncionarioRole = "gestor" | "operador";

export type Period = "7d" | "30d" | "90d" | "year";

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string | null;
  pin: string | null;
  created_at: string;
  updated_at: string;
}

export interface Funcionario {
  id: string;
  empresa_id: string;
  user_id: string;
  role: FuncionarioRole;
  nome: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Emitter {
  id: string;
  cnpj: string | null;
  trade_name: string | null;
  legal_name: string | null;
  city: string | null;
  uf: string | null;
  address: Record<string, unknown> | null;
}

export interface InvoiceItem {
  id: string;
  line_number: number;
  product_code: string | null;
  description: string;
  ncm: string | null;
  ean: string | null;
  quantity: string | null;
  unit: string | null;
  unit_price: string | null;
  total_price: string | null;
  category_id: string | null;
}

export interface Invoice {
  id: string;
  empresa_id: string | null;
  source_type: InvoiceSource;
  access_key: string | null;
  uf: string | null;
  model: number;
  series: string | null;
  number: string | null;
  issued_at: string | null;
  total_amount: string | null;
  discount_amount: string | null;
  qr_url: string | null;
  protocol: string | null;
  photo_original_path: string | null;
  photo_processed_path: string | null;
  ai_model: string | null;
  extracted_at: string | null;
  status: InvoiceStatus;
  error_message: string | null;
  created_at: string;
  emitter: Emitter | null;
  items: InvoiceItem[];
}

export interface PaginatedInvoices {
  data: Invoice[];
  total: number;
  page: number;
  page_size: number;
}

export interface DashboardSummary {
  total_spend: string;
  invoice_count: number;
  avg_ticket: string;
  period_start: string;
  period_end: string;
  change_pct: number | null;
}

export interface TimeSeriesPoint {
  date: string;
  amount: string;
  count: number;
}

export interface SpendOverTime {
  points: TimeSeriesPoint[];
}

export interface BreakdownItem {
  label: string;
  amount: string;
  percentage: number;
  count: number;
}

export interface Breakdown {
  items: BreakdownItem[];
}

export interface TopProductItem {
  description: string;
  total_quantity: string;
  total_amount: string;
  purchase_count: number;
}

export interface TopProducts {
  items: TopProductItem[];
}

export interface RecentInvoices {
  data: Invoice[];
}

export interface SemanticSearchResult {
  item_id: string;
  invoice_id: string;
  description: string;
  total_price: string | null;
  similarity: number;
  issued_at: string | null;
  emitter_name: string | null;
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
}

export interface CaptureInvoiceResponse {
  invoice: Invoice;
  processed_image_url: string | null;
  preprocess_skipped: boolean;
  extraction_summary: {
    fornecedor: string | null;
    data: string | null;
    item_count: number;
  };
  processing_note?: string;
}

export interface UpdateInvoiceRequest {
  issued_at?: string | null;
  total_amount?: string | null;
  discount_amount?: string | null;
  emitter_name?: string | null;
}

export interface UpdateInvoiceItemRequest {
  description?: string | null;
  quantity?: string | null;
  unit_price?: string | null;
  total_price?: string | null;
  unit?: string | null;
}

export interface ApiError {
  detail?: string | { msg: string }[];
  error?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  nome: string | null;
}

export interface EmpresaMembership {
  id: string;
  nome: string;
  role: FuncionarioRole;
  funcionario_id: string;
  funcionario_nome: string | null;
}

export interface PendingInvite {
  id: string;
  empresa_id: string;
  empresa_nome: string;
  role: string;
}

export interface AuthMeResponse {
  user: UserProfile;
  is_platform_admin: boolean;
  empresas: EmpresaMembership[];
  pending_invite: PendingInvite | null;
  profile_complete: boolean;
}

export interface InterestRequest {
  email: string;
  nome?: string;
  mensagem?: string;
}

export interface AdminEmpresaCreate {
  nome: string;
  cnpj?: string;
  gestor_email: string;
}

export interface AdminEmpresaListItem {
  id: string;
  nome: string;
  cnpj: string | null;
  created_at: string;
  gestor_convite_pendente: boolean;
}

export interface EmpresaPinStatus {
  pin_configured: boolean;
}

export interface Device {
  id: string;
  empresa_id: string;
  nome: string | null;
  is_active: boolean;
  last_used_at: string | null;
  user_agent: string | null;
  created_at: string;
  invoice_count: number;
}

export interface PairingSession {
  token: string;
  expires_at: string;
  pairing_url: string;
}

export interface DevicePairResponse {
  device_token: string;
  device_id: string;
  empresa_nome: string;
}

export interface DeviceMe {
  id: string;
  empresa_id: string;
  empresa_nome: string;
  nome: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}
