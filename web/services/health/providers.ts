import {
  getProviders,
  addProvider,
  updateProvider,
  deleteProvider,
  shareProvider,
} from "../apiConfig";
import { HealthcareProviderData, HealthcareProviderResponse, SharingResponse } from "./types";

// Get all healthcare providers for the user
export async function fetchProviders() {
  return getProviders({});
}

// Add a new healthcare provider
export async function createProvider(providerData: HealthcareProviderData) {
  return addProvider(providerData);
}

// Update an existing healthcare provider
export async function editProvider(
  id: number,
  providerData: HealthcareProviderData
) {
  return updateProvider(id, { ...providerData, editing: true });
}

// Delete a healthcare provider
export async function removeProvider(id: number) {
  return deleteProvider(id);
}

// ==================== HEALTHCARE PROVIDER SHARING FUNCTIONS ====================

// Share healthcare provider with family members and/or via email
export async function shareProviderWithMembers(
  emails: string | string[],
  provider: HealthcareProviderData,
  taggedMembers?: string[]
): Promise<SharingResponse> {
  try {
    const response = await shareProvider({
      email: emails,
      provider: {
        id: provider.id,
        name: provider.name,
        specialty: provider.specialty,
        phone: provider.phone,
        practiceName: provider.practiceName,
        address: provider.address,
        icon: provider.icon,
        notes: provider.notes,
      },
      tagged_members: taggedMembers,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Share with family members only (extract emails from tagged members)
export async function shareProviderWithFamilyMembers(
  provider: HealthcareProviderData,
  familyMemberEmails: string[]
): Promise<SharingResponse> {
  return shareProviderWithMembers(
    familyMemberEmails,
    provider,
    familyMemberEmails
  );
}

// Share via email only (no family member tagging)
export async function shareProviderViaEmail(
  provider: HealthcareProviderData,
  emails: string | string[]
): Promise<SharingResponse> {
  return shareProviderWithMembers(emails, provider);
}

// ==================== HELPER FUNCTIONS ====================

// Transform backend response to frontend format
export function transformProviderData(
  provider: HealthcareProviderResponse
): HealthcareProviderData {
  return {
    id: provider.id,
    name: provider.name,
    specialty: provider.specialty,
    phone: provider.phone,
    practiceName: provider.practiceName,
    address: provider.address,
    icon: provider.icon || "👨‍⚕️",
    notes: provider.notes,
    tagged_ids: provider.tagged_ids || [],
  };
}

// Transform frontend data for API calls (with tagging support)
export function prepareProviderForSubmission(provider: HealthcareProviderData): HealthcareProviderData {
  return {
    id: provider.id,
    name: provider.name,
    specialty: provider.specialty,
    phone: provider.phone,
    practiceName: provider.practiceName,
    address: provider.address,
    icon: provider.icon,
    notes: provider.notes,
    tagged_members: provider.tagged_members || [],
    editing: provider.editing,
  };
}

// Check if provider has family member tags
export function hasTaggedMembers(provider: HealthcareProviderData): boolean {
  return !!(provider.tagged_ids && provider.tagged_ids.length > 0);
}

// Get tagged member count
export function getTaggedMemberCount(provider: HealthcareProviderData): number {
  return provider.tagged_ids?.length || 0;
}

// Get provider display name (name + specialty)
export function getDisplayName(provider: HealthcareProviderData): string {
  return `${provider.name}${provider.specialty ? ` (${provider.specialty})` : ''}`;
}

// Check if provider has contact information
export function hasContactInfo(provider: HealthcareProviderData): boolean {
  return !!(provider.phone && provider.phone.trim()) || 
         !!(provider.address && provider.address.trim());
}

// Format provider contact information
export function getContactInfo(provider: HealthcareProviderData): {
  phone?: string;
  address?: string;
  practice?: string;
} {
  return {
    phone: provider.phone?.trim() || undefined,
    address: provider.address?.trim() || undefined,
    practice: provider.practiceName?.trim() || undefined,
  };
}

// Check if provider has complete information
export function hasCompleteInfo(provider: HealthcareProviderData): boolean {
  return !!(
    provider.name &&
    provider.specialty &&
    provider.phone
  );
}

// Get provider category based on specialty
export function getProviderCategory(provider: HealthcareProviderData): string {
  if (!provider.specialty) return 'General';
  
  const specialty = provider.specialty.toLowerCase();
  
  if (specialty.includes('cardio')) return 'Cardiology';
  if (specialty.includes('dermat')) return 'Dermatology';
  if (specialty.includes('orthop')) return 'Orthopedics';
  if (specialty.includes('pediatr')) return 'Pediatrics';
  if (specialty.includes('psych')) return 'Psychiatry';
  if (specialty.includes('dental') || specialty.includes('dentist')) return 'Dental';
  if (specialty.includes('eye') || specialty.includes('ophthal')) return 'Eye Care';
  if (specialty.includes('family') || specialty.includes('primary')) return 'Primary Care';
  
  return 'Specialty Care';
}

// Format phone number for display
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for 10-digit US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not a standard format
  return phone;
}

// Check if provider is emergency contact
export function isEmergencyProvider(provider: HealthcareProviderData): boolean {
  if (!provider.specialty && !provider.notes) return false;
  
  const text = `${provider.specialty || ''} ${provider.notes || ''}`.toLowerCase();
  return text.includes('emergency') || text.includes('urgent') || text.includes('911');
}