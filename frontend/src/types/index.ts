export interface User {
  id: string;
  username: string;
  email: string | null;
  role: "ADMIN" | "USER";
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  employee?: {
    fullName: string;
  } | null;
}

export interface Employee {
  id: string;
  userId: string | null;
  payrollType: string;
  payrollCode: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    mustChangePassword: boolean;
  } | null;
}

export interface EmployeeMonthlyRecord {
  id: string;
  employeeId: string;
  periodDate: string;
  employeeContribution: number;
  totalContributions: number;
  yields: number;
  withdrawals: number;
  totalBalance: number;
  loanBalance: number;
  finalBalance: number;
  createdAt: string;
}

export interface UploadLog {
  id: string;
  adminId: string;
  filename: string;
  periodDate: string;
  status: "SUCCESS" | "FAILED" | "PARTIAL" | "WARNING";
  recordsProcessed: number;
  newUsersCreated: number;
  errorMessage: string | null;
  createdAt: string;
  admin?: {
    username: string;
  };
}

export interface DashboardStats {
  employeeCount: number;
  totalBalance: number;
  totalYields: number;
  totalContributions: number;
  monthlyGrowth: {
    period: string;
    total: number;
  }[];
}

export interface UserSummary {
  currentBalance: number;
  totalYields: number;
  totalContributions: number;
  loanBalance: number;
  employeeName: string;
}

export interface ExcelCredential {
  username: string;
  tempPassword?: string;
}
