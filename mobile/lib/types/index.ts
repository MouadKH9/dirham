export interface User {
  id: string;
  email: string;
  preferred_language: 'fr' | 'ar' | 'en';
  preferred_currency: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'manual' | 'synced';
  currency: string;
  balance: string; // decimal string
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string; // localized
  name_fr: string;
  name_ar: string;
  name_en: string;
  icon: string;
  type?: 'income' | 'expense' | 'bill';
  is_system: boolean;
  is_archived: boolean;
}

export interface Transaction {
  id: string;
  account: string; // UUID
  category: string; // UUID
  type: 'income' | 'expense' | 'bill';
  amount: string; // decimal string
  currency: string;
  date: string; // YYYY-MM-DD
  notes: string | null;
  is_recurring: boolean;
  recurring_bill: string | null;
  external_id: string | null;
  source: 'manual' | 'auto_sync';
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MonthlySummary {
  income: string;
  expense: string;
  bill: string;
  net: string;
  month: string;
}

export interface BudgetProgress {
  category_id: string;
  category_ids?: string[];
  category_name: string;
  limit: string;
  spent: string;
  remaining: string;
}

export interface Budget {
  id: string;
  name: string;
  categories: string[];
  amount: string;
  month: string; // YYYY-MM-DD (first day of month)
  source_recurring_budget: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  name?: string;
  categories: string[];
  amount: string;
  month: string;
}

export interface UpdateBudgetInput {
  name?: string;
  categories?: string[];
  amount?: string;
  month?: string;
}

export interface RecurringBudget {
  id: string;
  name: string;
  categories: string[];
  amount: string;
  start_month: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringBudgetInput {
  name?: string;
  categories: string[];
  amount: string;
  start_month: string;
  is_active?: boolean;
}

export interface UpdateRecurringBudgetInput {
  name?: string;
  categories?: string[];
  amount?: string;
  start_month?: string;
  is_active?: boolean;
}

export type BillFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringBill {
  id: string;
  category: string;
  name: string;
  amount: string;
  frequency: BillFrequency;
  next_due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringBillInput {
  category: string;
  name: string;
  amount: string;
  frequency: BillFrequency;
  next_due_date: string;
  is_active?: boolean;
}

export interface UpdateRecurringBillInput {
  category?: string;
  name?: string;
  amount?: string;
  frequency?: BillFrequency;
  next_due_date?: string;
  is_active?: boolean;
}

export type InsightType = 'breakdown' | 'anomaly' | 'awareness';
export type InsightSeverity = 'info' | 'warning' | 'critical';

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  body: string;
  language: 'fr' | 'ar' | 'en';
  period_start: string;
  period_end: string;
  severity: InsightSeverity;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InsightFilters {
  is_read?: boolean;
  type?: InsightType;
  page?: number;
  page_size?: number;
}

export interface DashboardResponse {
  total_balance?: string;
  accounts: Account[];
  recent_transactions: Transaction[];
  monthly_summary: MonthlySummary;
  unread_insights_count: number;
  budget_progress: BudgetProgress[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface CreateTransactionInput {
  account: string;
  category: string;
  type: 'income' | 'expense' | 'bill';
  amount: string;
  date: string;
  currency?: string;
  notes?: string;
  is_recurring?: boolean;
  recurring_bill?: string | null;
}

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'bill';
  account?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CreateAccountInput {
  name: string;
  type?: 'manual' | 'synced';
  currency?: string;
  balance?: string;
}

export interface CreateCategoryInput {
  name_fr: string;
  name_ar?: string;
  name_en?: string;
  icon: string;
}
