import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  getRefillAlerts,
  shareMedication,
} from "../apiConfig";
import { MedicationData, MedicationResponse, SharingResponse } from "./types";

// Get all medications for the user
export async function fetchMedications() {
  return getMedications({});
}

// Add a new medication
export async function createMedication(medicationData: MedicationData) {
  return addMedication(medicationData);
}

// Update an existing medication
export async function editMedication(
  id: number,
  medicationData: MedicationData
) {
  return updateMedication(id, { ...medicationData, editing: true });
}

// Delete a medication
export async function removeMedication(id: number) {
  return deleteMedication(id);
}

// Get medications that need refills
export async function fetchRefillAlerts() {
  return getRefillAlerts({});
}

// ==================== MEDICATION SHARING FUNCTIONS ====================

// Share medication with family members and/or via email
export async function shareMedicationWithMembers(
  emails: string | string[],
  medication: MedicationData,
  taggedMembers?: string[]
): Promise<SharingResponse> {
  try {
    const response = await shareMedication({
      email: emails,
      medication: {
        id: medication.id,
        name: medication.name,
        dosage: medication.dosage,
        conditionTreated: medication.conditionTreated,
        prescribingDoctor: medication.prescribingDoctor,
        schedule: medication.schedule,
        refillDaysLeft: medication.refillDaysLeft,
        icon: medication.icon,
        isRefillSoon: medication.isRefillSoon,
      },
      tagged_members: taggedMembers,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Share with family members only (extract emails from tagged members)
export async function shareMedicationWithFamilyMembers(
  medication: MedicationData,
  familyMemberEmails: string[]
): Promise<SharingResponse> {
  return shareMedicationWithMembers(
    familyMemberEmails,
    medication,
    familyMemberEmails
  );
}

// Share via email only (no family member tagging)
export async function shareMedicationViaEmail(
  medication: MedicationData,
  emails: string | string[]
): Promise<SharingResponse> {
  return shareMedicationWithMembers(emails, medication);
}

// ==================== HELPER FUNCTIONS ====================

// Transform backend response to frontend format
export function transformMedicationData(
  medication: MedicationResponse
): MedicationData {
  return {
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    conditionTreated: medication.conditionTreated,
    prescribingDoctor: medication.prescribingDoctor,
    schedule: medication.schedule,
    refillDaysLeft: medication.refillDaysLeft,
    icon: medication.icon || "💊",
    isRefillSoon: medication.isRefillSoon,
    tagged_ids: medication.tagged_ids || [],
  };
}

// Transform frontend data for API calls (with tagging support)
export function prepareMedicationForSubmission(medication: MedicationData): MedicationData {
  return {
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    conditionTreated: medication.conditionTreated,
    prescribingDoctor: medication.prescribingDoctor,
    schedule: medication.schedule,
    refillDaysLeft: medication.refillDaysLeft,
    icon: medication.icon,
    isRefillSoon: medication.isRefillSoon,
    tagged_members: medication.tagged_members || [],
    editing: medication.editing,
  };
}

// Check if medication has family member tags
export function hasTaggedMembers(medication: MedicationData): boolean {
  return !!(medication.tagged_ids && medication.tagged_ids.length > 0);
}

// Get tagged member count
export function getTaggedMemberCount(medication: MedicationData): number {
  return medication.tagged_ids?.length || 0;
}

// Check if medication needs refill soon
export function needsRefillSoon(medication: MedicationData): boolean {
  return medication.isRefillSoon || medication.refillDaysLeft <= 7;
}

// Get refill urgency level
export function getRefillUrgency(medication: MedicationData): 'critical' | 'warning' | 'normal' {
  if (medication.refillDaysLeft <= 3) return 'critical';
  if (medication.refillDaysLeft <= 7) return 'warning';
  return 'normal';
}

// Format medication display name with dosage
export function getDisplayName(medication: MedicationData): string {
  return `${medication.name}${medication.dosage ? ` (${medication.dosage})` : ''}`;
}