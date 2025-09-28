import { 
  getInsuranceAccounts, 
  addInsuranceAccount, 
  updateInsuranceAccount, 
  deleteInsuranceAccount,
  shareInsurance
} from '../apiConfig';
import { InsuranceAccountData, InsuranceAccountResponse, SharingResponse } from './types';

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

// ==================== INSURANCE SHARING FUNCTIONS ====================

// Share insurance account with family members and/or via email
export async function shareInsuranceWithMembers(
  emails: string | string[],
  insuranceAccount: InsuranceAccountData,
  taggedMembers?: string[]
): Promise<SharingResponse> {
  try {
    const response = await shareInsurance({
      email: emails,
      insurance_account: {
        id: insuranceAccount.id,
        provider_name: insuranceAccount.providerName, // Changed to snake_case
        plan_name: insuranceAccount.planName, // Changed to snake_case
        account_type: insuranceAccount.accountType, // Changed to snake_case
        details: insuranceAccount.details,
        contact_info: insuranceAccount.contactInfo, // Changed to snake_case
        logo_text: insuranceAccount.logoText, // Changed to snake_case
        gradient_style: insuranceAccount.gradientStyle, // Changed to snake_case
        notes: insuranceAccount.notes,
      },
      tagged_members: taggedMembers,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Share with family members only (extract emails from tagged members)
export async function shareInsuranceWithFamilyMembers(
  insuranceAccount: InsuranceAccountData,
  familyMemberEmails: string[]
): Promise<SharingResponse> {
  return shareInsuranceWithMembers(
    familyMemberEmails,
    insuranceAccount,
    familyMemberEmails
  );
}

// Share via email only (no family member tagging)
export async function shareInsuranceViaEmail(
  insuranceAccount: InsuranceAccountData,
  emails: string | string[]
): Promise<SharingResponse> {
  return shareInsuranceWithMembers(emails, insuranceAccount);
}

// ==================== HELPER FUNCTIONS ====================

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
    tagged_ids: insurance.tagged_ids || [],
  };
}

// Transform frontend data for API calls (with tagging support)
export function prepareInsuranceForSubmission(insurance: InsuranceAccountData): InsuranceAccountData {
  return {
    id: insurance.id,
    providerName: insurance.providerName,
    planName: insurance.planName,
    accountType: insurance.accountType,
    details: insurance.details,
    contactInfo: insurance.contactInfo,
    logoText: insurance.logoText,
    gradientStyle: insurance.gradientStyle,
    notes: insurance.notes,
    tagged_members: insurance.tagged_members || [],
    editing: insurance.editing,
  };
}

// Check if insurance account has family member tags
export function hasTaggedMembers(insurance: InsuranceAccountData): boolean {
  return !!(insurance.tagged_ids && insurance.tagged_ids.length > 0);
}

// Get tagged member count
export function getTaggedMemberCount(insurance: InsuranceAccountData): number {
  return insurance.tagged_ids?.length || 0;
}

// Get insurance display name (provider + plan)
export function getDisplayName(insurance: InsuranceAccountData): string {
  return `${insurance.providerName}${insurance.planName ? ` - ${insurance.planName}` : ''}`;
}

// Check if insurance account has contact information
export function hasContactInfo(insurance: InsuranceAccountData): boolean {
  return !!(insurance.contactInfo && insurance.contactInfo.trim());
}

// Get formatted details for display
export function getFormattedDetails(insurance: InsuranceAccountData): string[] {
  if (!insurance.details || insurance.details.length === 0) return [];
  
  return insurance.details.map(detail => 
    `${detail.label}: ${detail.value}`
  );
}

// Check if insurance account has custom styling
export function hasCustomStyling(insurance: InsuranceAccountData): boolean {
  const defaultGradient = 'linear-gradient(135deg, #dbeafe, #e0e7ff)';
  const defaultLogo = 'INS';
  
  return insurance.gradientStyle !== defaultGradient || insurance.logoText !== defaultLogo;
}

// Generate insurance card preview
export function generateInsurancePreview(insurance: InsuranceAccountData): {
  backgroundColor: string;
  logoText: string;
  primaryText: string;
  secondaryText: string;
} {
  return {
    backgroundColor: insurance.gradientStyle || 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
    logoText: insurance.logoText || 'INS',
    primaryText: insurance.providerName,
    secondaryText: insurance.planName || insurance.accountType || 'Insurance Plan',
  };
}