import {
  getHealthSummaryInfo,
  addHealthSummaryInfo,
  updateHealthSummaryInfo,
  getUserAllergies,
  addUserAllergy,
  updateUserAllergy,
  deleteUserAllergy,
  getUserConditions,
  addUserCondition,
  updateUserCondition,
  deleteUserCondition,
  getFamilyMedicalHistory,
  addFamilyMedicalHistory,
  updateFamilyMedicalHistory,
  deleteFamilyMedicalHistory,
} from "../apiConfig";

// ==================== INTERFACES ====================

// Health Summary Info Interfaces
export interface HealthSummaryInfoData {
  id?: number;
  bloodType?: string;
  dateOfBirth?: string;
  height?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  primaryDoctor?: string;
  medicalRecordNumber?: string;
}

export interface HealthSummaryInfoResponse {
  id: number;
  bloodType: string;
  dateOfBirth: string;
  height: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  primaryDoctor: string;
  medicalRecordNumber: string;
  createdAt: string;
  updatedAt: string;
}

// User Allergies Interfaces
export interface UserAllergyData {
  id?: number;
  allergyName: string;
  severityLevel: 'mild' | 'moderate' | 'severe' | 'critical';
  allergyType?: string;
  reactionSymptoms?: string;
  notes?: string;
  editing?: boolean;
}

export interface UserAllergyResponse {
  id: number;
  allergyName: string;
  severityLevel: string;
  allergyType: string;
  reactionSymptoms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// User Conditions Interfaces
export interface UserConditionData {
  id?: number;
  conditionName: string;
  status: 'active' | 'controlled' | 'resolved' | 'chronic';
  diagnosisDate?: string;
  treatingDoctor?: string;
  notes?: string;
  editing?: boolean;
}

export interface UserConditionResponse {
  id: number;
  conditionName: string;
  status: string;
  diagnosisDate: string;
  treatingDoctor: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Family Medical History Interfaces
export interface FamilyMedicalHistoryData {
  id?: number;
  familyMemberRelation: string;
  conditionName: string;
  ageOfOnset?: number;
  status?: string;
  notes?: string;
  editing?: boolean;
}

export interface FamilyMedicalHistoryResponse {
  id: number;
  familyMemberRelation: string;
  conditionName: string;
  ageOfOnset: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== HEALTH SUMMARY INFO SERVICES ====================

// Get health summary info for the user
export async function fetchHealthSummaryInfo() {
  return getHealthSummaryInfo({});
}

// Add or update health summary info
export async function saveHealthSummaryInfo(infoData: HealthSummaryInfoData) {
  return infoData.id 
    ? updateHealthSummaryInfo(infoData)
    : addHealthSummaryInfo(infoData);
}

// Transform backend response to frontend format for health info
export function transformHealthSummaryInfoData(
  info: HealthSummaryInfoResponse
): HealthSummaryInfoData {
  return {
    id: info.id,
    bloodType: info.bloodType,
    dateOfBirth: info.dateOfBirth,
    height: info.height,
    emergencyContactName: info.emergencyContactName,
    emergencyContactPhone: info.emergencyContactPhone,
    primaryDoctor: info.primaryDoctor,
    medicalRecordNumber: info.medicalRecordNumber,
  };
}

// ==================== USER ALLERGIES SERVICES ====================

// Get all allergies for the user
export async function fetchUserAllergies() {
  return getUserAllergies({});
}

// Add a new allergy
export async function createUserAllergy(allergyData: UserAllergyData) {
  return addUserAllergy(allergyData);
}

// Update an existing allergy
export async function editUserAllergy(
  id: number,
  allergyData: UserAllergyData
) {
  return updateUserAllergy(id, { ...allergyData, editing: true });
}

// Delete an allergy
export async function removeUserAllergy(id: number) {
  return deleteUserAllergy(id);
}

// Transform backend response to frontend format for allergies
export function transformUserAllergyData(
  allergy: UserAllergyResponse
): UserAllergyData {
  return {
    id: allergy.id,
    allergyName: allergy.allergyName,
    severityLevel: allergy.severityLevel as 'mild' | 'moderate' | 'severe' | 'critical',
    allergyType: allergy.allergyType,
    reactionSymptoms: allergy.reactionSymptoms,
    notes: allergy.notes,
  };
}

// Get allergy severity color mapping for frontend styling
export function getAllergySeverityColor(severity: string): string {
  const severityColors = {
    mild: '#fef3c7', // Light yellow
    moderate: '#fed7aa', // Light orange
    severe: '#fee2e2', // Light red
    critical: '#fecaca', // Dark red
  };
  return severityColors[severity as keyof typeof severityColors] || severityColors.mild;
}

// Get allergy severity text color mapping
export function getAllergySeverityTextColor(severity: string): string {
  const severityTextColors = {
    mild: '#92400e', // Dark yellow
    moderate: '#c2410c', // Dark orange
    severe: '#b91c1c', // Dark red
    critical: '#991b1b', // Darker red
  };
  return severityTextColors[severity as keyof typeof severityTextColors] || severityTextColors.mild;
}

// ==================== USER CONDITIONS SERVICES ====================

// Get all conditions for the user
export async function fetchUserConditions() {
  return getUserConditions({});
}

// Add a new condition
export async function createUserCondition(conditionData: UserConditionData) {
  return addUserCondition(conditionData);
}

// Update an existing condition
export async function editUserCondition(
  id: number,
  conditionData: UserConditionData
) {
  return updateUserCondition(id, { ...conditionData, editing: true });
}

// Delete a condition
export async function removeUserCondition(id: number) {
  return deleteUserCondition(id);
}

// Transform backend response to frontend format for conditions
export function transformUserConditionData(
  condition: UserConditionResponse
): UserConditionData {
  return {
    id: condition.id,
    conditionName: condition.conditionName,
    status: condition.status as 'active' | 'controlled' | 'resolved' | 'chronic',
    diagnosisDate: condition.diagnosisDate,
    treatingDoctor: condition.treatingDoctor,
    notes: condition.notes,
  };
}

// Get condition status color mapping for frontend styling
export function getConditionStatusColor(status: string): string {
  const statusColors = {
    active: '#fee2e2', // Light red
    controlled: '#fef3c7', // Light yellow
    resolved: '#d1fae5', // Light green
    chronic: '#fed7aa', // Light orange
  };
  return statusColors[status as keyof typeof statusColors] || statusColors.active;
}

// ==================== FAMILY MEDICAL HISTORY SERVICES ====================

// Get all family medical history for the user
export async function fetchFamilyMedicalHistory() {
  return getFamilyMedicalHistory({});
}

// Add a new family medical history entry
export async function createFamilyMedicalHistory(historyData: FamilyMedicalHistoryData) {
  return addFamilyMedicalHistory(historyData);
}

// Update an existing family medical history entry
export async function editFamilyMedicalHistory(
  id: number,
  historyData: FamilyMedicalHistoryData
) {
  return updateFamilyMedicalHistory(id, { ...historyData, editing: true });
}

// Delete a family medical history entry
export async function removeFamilyMedicalHistory(id: number) {
  return deleteFamilyMedicalHistory(id);
}

// Transform backend response to frontend format for family history
export function transformFamilyMedicalHistoryData(
  history: FamilyMedicalHistoryResponse
): FamilyMedicalHistoryData {
  return {
    id: history.id,
    familyMemberRelation: history.familyMemberRelation,
    conditionName: history.conditionName,
    ageOfOnset: history.ageOfOnset,
    status: history.status,
    notes: history.notes,
  };
}

// ==================== UTILITY FUNCTIONS ====================

// Common family relations for dropdown options
export const FAMILY_RELATIONS = [
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Paternal Grandfather',
  'Paternal Grandmother',
  'Maternal Grandfather',
  'Maternal Grandmother',
  'Uncle',
  'Aunt',
  'Cousin',
  'Other'
];

// Common allergy types
export const ALLERGY_TYPES = [
  'Food',
  'Drug/Medication',
  'Environmental',
  'Seasonal',
  'Insect',
  'Contact',
  'Other'
];

// Common condition statuses
export const CONDITION_STATUSES = [
  'active',
  'controlled',
  'resolved',
  'chronic'
];

// Common severity levels
export const SEVERITY_LEVELS = [
  'mild',
  'moderate', 
  'severe',
  'critical'
];
