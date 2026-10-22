export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterResponse = AuthTokens & {
  user: User;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type CreateUserDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type CurrencyCode = "UAH" | "USD" | "EUR";
export type AccountType = "cash" | "card" | "bank" | "jar" | "fop" | "other";
export type AccountSource = "manual" | "monobank" | "privat";
export type TxType = "income" | "expense";
export type PlanFrequency =
  | "daily"
  | "twice_a_week"
  | "weekly"
  | "twice_a_month"
  | "monthly";

export type Account = {
  id: string;
  name: string;
  source: AccountSource;
  type: AccountType;
  currency: string;
  balance: number;
  iban: string | null;
  isActive: boolean;
  bankConnectionId: string | null;
};

export type CreateAccountDto = {
  name: string;
  type?: AccountType;
  currency?: CurrencyCode;
  balance?: number;
  iban?: string;
};

export type UpdateAccountDto = {
  name?: string;
  type?: AccountType;
  balance?: number;
  isActive?: boolean;
  iban?: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: TxType;
  amount: number;
  currency: string;
  description: string | null;
  occurredAt: string;
  source: AccountSource;
};

export type CreateTransactionDto = {
  accountId: string;
  type: TxType;
  amount: number;
  currency?: CurrencyCode;
  categoryId?: string;
  description?: string;
  occurredAt?: string;
};

export type UpdateTransactionDto = {
  type?: TxType;
  amount?: number;
  categoryId?: string | null;
  description?: string;
  occurredAt?: string;
};

export type Category = {
  id: string;
  name: string;
  type: TxType;
  icon: string | null;
};

export type CreateCategoryDto = {
  name: string;
  type: TxType;
  icon?: string;
};

export type Dashboard = {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  net: number;
  currency: string;
  period: { from: string; to: string };
  accounts: Account[];
  dailySeries: Array<{ date: string; income: number; expense: number }>;
  byCategory: Array<{
    categoryId: string | null;
    name: string;
    type: string;
    total: number;
  }>;
};

export type BankConnection = {
  id: string;
  provider: "monobank" | "privat";
  label: string | null;
  lastSyncedAt: string | null;
  message?: string;
};

export type ConnectMonobankDto = {
  token: string;
  label?: string;
};

export type ConnectPrivatDto = {
  clientId: string;
  token: string;
  iban: string;
  label?: string;
};

export type FinancialPlanCategoryLimit = {
  categoryId: string;
  limit: number;
  isMandatory?: boolean;
};

export type CreateFinancialPlanDto = {
  income: number;
  averageExpenses: number;
  mandatoryExpenses: number;
  desiredSavings: number;
  goal: string;
  targetAmount: number;
  targetDate: string;
  frequency: PlanFrequency;
  currency?: CurrencyCode;
  categoryLimits?: FinancialPlanCategoryLimit[];
};

export type FinancialPlanProgress = {
  accumulated: number;
  targetAmount: number;
  remaining: number;
  percentageComplete: number;
  projectedCompletionDate: string | null;
};

export type FinancialPlanOverview = {
  income: number;
  plannedExpenses: number;
  actualExpenses: number;
  plannedSavings: number;
  actualSavings: number;
  goal: string;
  targetAmount: number;
  progress: FinancialPlanProgress;
};

export type FinancialPlan = {
  id: string;
  status: "active" | "archived";
  frequency: PlanFrequency;
  currency: CurrencyCode;
  startDate: string;
  targetDate: string;
  mandatoryExpenses: number;
  averageExpenses: number;
  overview: FinancialPlanOverview;
  currentPeriod: {
    from?: string;
    to?: string;
    [key: string]: unknown;
  };
  categories: Array<{
    categoryId?: string;
    name?: string;
    limit?: number;
    [key: string]: unknown;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type FinancialPlanDay = {
  date: string;
  planned: number;
  actual: number;
  remaining: number;
  variance: number;
  status: "under_budget" | "on_budget" | "over_budget" | "no_budget";
  locked: boolean;
};

export type FinancialPlanForecast = {
  dataStatus: "ok" | "insufficient_data";
  trackStatus: "ahead" | "on_track" | "behind" | "insufficient_data";
  expectedSpending: number | null;
  expectedSavings: number | null;
  expectedAccumulated: number | null;
  expectedCompletionDate: string | null;
  onTrack: boolean | null;
};

export type FinancialPlanAiRecommendDto = {
  income: number;
  averageExpenses: number;
  desiredSavings: number;
  goal: string;
  targetDate: string;
  targetAmount?: number;
};

export type FinancialPlanAiRecommendation = {
  recommendations: Array<{
    type: string;
    categoryId?: string;
    currentValue?: number;
    suggestedValue?: number;
    reason: string;
  }>;
  summary?: string;
  suggestedSavings?: number;
};

export type Profile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  description: string | null;
  dateOfBirth: string | null;
};

export type UpdateProfileDto = {
  firstName?: string;
  lastName?: string;
  description?: string;
  dateOfBirth?: string;
};

export type AiChatRequest = {
  message: string;
  conversationId?: string;
};

export type AiChatResponse = {
  reply: string;
  conversationId?: string;
  toolsUsed?: string[];
};

export type AiStreamEvent =
  | { type: "status"; message: string }
  | { type: "tool_start"; name: string }
  | { type: "tool_result"; name: string; result: { ok: boolean; data?: unknown; error?: string } }
  | { type: "text_delta"; text: string }
  | { type: "done"; reply: string; conversationId: string; toolsUsed?: string[] }
  | { type: "error"; message: string };

export type ApiErrorBody = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};
