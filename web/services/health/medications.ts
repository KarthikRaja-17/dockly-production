import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  getRefillAlerts,
} from "../apiConfig";

// ✅ Use this in BOTH types.ts and services/medications.ts
export interface MedicationData {
  id?: number;
  name: string;
  dosage: string;
  conditionTreated: string;
  prescribingDoctor?: string;  // optional
  schedule: string;
  refillDaysLeft: number;
  icon?: string;               // optional
  isRefillSoon?: boolean;      // optional
  editing?: boolean;
}



export interface MedicationResponse {
  id: number;
  name: string;
  dosage: string;
  conditionTreated: string;
  prescribingDoctor: string;
  schedule: string;
  refillDaysLeft: number;
  icon: string;
  isRefillSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  };
}
