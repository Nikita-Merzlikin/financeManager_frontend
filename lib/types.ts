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

export type Account = {
  id: string;
  name: string;
  source: "manual" | "monobank" | "privat";
  type: "cash" | "card" | "bank" | "jar" | "fop" | "other";
  currency: string;
  balance: number;
  iban: string | null;
  isActive: boolean;
  bankConnectionId: string | null;
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

export type ApiErrorBody = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};
