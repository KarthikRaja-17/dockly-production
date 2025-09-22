import { 
  getInsuranceAccounts, 
  addInsuranceAccount, 
  updateInsuranceAccount, 
  deleteInsuranceAccount 
} from '../apiConfig';

export interface InsuranceAccountData {
  id?: number;
  providerName: string;
  planName: string;
  accountType?: string;  // optional (your UI allows it to be missing)
  details: Array<{
    label: string;
    value: string;
  }>;
  contactInfo?: string;
  logoText?: string;
  gradientStyle?: string;
  notes?: string;
  editing?: boolean; // for UI state only, safe as optional
}


export interface InsuranceAccountResponse {
  id: number;
  providerName: string;
  planName: string;
  accountType: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  contactInfo: string;
  logoText: string;
  gradientStyle: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Get all insurance accounts for the user
export async function fetchInsuranceAccounts() {
  return getInsuranceAccounts({});
}

// Add a new insurance account
export async function createInsuranceAccount(insuranceData: InsuranceAccountData) {
  return addInsuranceAccount(insuranceData);
}

// Update an existing insurance account
export async function editInsuranceAccount(id: number, insuranceData: InsuranceAccountData) {
  return updateInsuranceAccount(id, { ...insuranceData, editing: true });
}

// Delete an insurance account
export async function removeInsuranceAccount(id: number) {
  return deleteInsuranceAccount(id);
}

// Transform backend response to frontend format
export function transformInsuranceData(insurance: InsuranceAccountResponse): InsuranceAccountData {
  return {
    id: insurance.id,
    providerName: insurance.providerName,
    planName: insurance.planName,
    accountType: insurance.accountType,
    details: insurance.details || [],
    contactInfo: insurance.contactInfo,
    logoText: insurance.logoText || 'INS',
    gradientStyle: insurance.gradientStyle || 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
    notes: insurance.notes,
  };
}
