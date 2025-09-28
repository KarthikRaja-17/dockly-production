// Enhanced healthSummary.ts - Updated to match new backend architecture
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
  getFamilyMembersForHealth,
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

// ==================== NEW: FAMILY MEMBER INTERFACES ====================

// Family member interface for health context (dropdown selection)
export interface FamilyMemberForHealth {
  user_id: string;
  name: string;
  relationship: string;
  email: string;
}

// Enhanced family members API response
export interface FamilyMembersForHealthResponse {
  familyMembers: FamilyMemberForHealth[];
  count: number;
  hasMembers: boolean;
}

// ==================== ENHANCED FAMILY MEDICAL HISTORY INTERFACES ====================

// Enhanced Family Medical History Interfaces with permissions
export interface FamilyMedicalHistoryData {
  id?: number;
  familyMemberUserId?: string;
  familyMemberName?: string;
  familyMemberRelation?: string;
  conditionName: string;
  ageOfOnset?: number;
  status?: string;
  notes?: string;
  editing?: boolean;
  
  // NEW: Permission fields from backend
  canEdit?: boolean;
  canDelete?: boolean;
  addedBy?: string;
}

// Enhanced backend response structure
export interface FamilyMedicalHistoryResponse {
  id: number;
  familyMemberUserId: string;
  familyMemberName: string;
  familyMemberRelation: string;
  conditionName: string;
  ageOfOnset: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  addedBy: string;
  canEdit: boolean;
  canDelete: boolean;
}

// Enhanced API response with stats and family members
export interface FamilyMedicalHistoryApiResponse {
  familyHistory: FamilyMedicalHistoryResponse[];
  familyMembers: FamilyMemberForHealth[];
  stats: {
    totalRecords: number;
    editableRecords: number;
    readOnlyRecords: number;
    familyMembersCount: number;
  };
}

// Stats interface for family medical history
export interface FamilyMedicalHistoryStats {
  totalRecords: number;
  editableRecords: number;
  readOnlyRecords: number;
  membersWithHistory: number;
  familyMembersCount: number;
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

// ==================== ENHANCED FAMILY MEMBERS SERVICES ====================

// NEW: Get family members for health context
export async function fetchFamilyMembersForHealth() {
  return getFamilyMembersForHealth({});
}

// Transform family members response
export function transformFamilyMemberForHealth(
  member: any
): FamilyMemberForHealth {
  return {
    user_id: member.user_id,
    name: member.name,
    relationship: member.relationship,
    email: member.email,
  };
}

// ==================== ENHANCED FAMILY MEDICAL HISTORY SERVICES ====================

// Get all family medical history for the user with enhanced permissions
export async function fetchFamilyMedicalHistory() {
  return getFamilyMedicalHistory({});
}

// Add a new family medical history entry
export async function createFamilyMedicalHistory(historyData: FamilyMedicalHistoryData) {
  return addFamilyMedicalHistory({
    familyMemberUserId: historyData.familyMemberUserId,
    conditionName: historyData.conditionName,
    ageOfOnset: historyData.ageOfOnset,
    status: historyData.status,
    notes: historyData.notes,
  });
}

// Update an existing family medical history entry
export async function editFamilyMedicalHistory(
  id: number,
  historyData: FamilyMedicalHistoryData
) {
  return updateFamilyMedicalHistory(id, {
    familyMemberUserId: historyData.familyMemberUserId,
    conditionName: historyData.conditionName,
    ageOfOnset: historyData.ageOfOnset,
    status: historyData.status,
    notes: historyData.notes,
    editing: true
  });
}

// Delete a family medical history entry
export async function removeFamilyMedicalHistory(id: number) {
  return deleteFamilyMedicalHistory(id);
}

// Enhanced transform function for family medical history with permissions
export function transformFamilyMedicalHistoryData(
  history: FamilyMedicalHistoryResponse
): FamilyMedicalHistoryData {
  return {
    id: history.id,
    familyMemberUserId: history.familyMemberUserId,
    familyMemberName: history.familyMemberName,
    familyMemberRelation: history.familyMemberRelation,
    conditionName: history.conditionName,
    ageOfOnset: history.ageOfOnset,
    status: history.status,
    notes: history.notes,
    canEdit: history.canEdit,
    canDelete: history.canDelete,
    addedBy: history.addedBy,
  };
}

// ==================== NEW: PERMISSION HELPER FUNCTIONS ====================

// Check if user can edit family medical history record
export function canEditFamilyMedicalHistory(history: FamilyMedicalHistoryData): boolean {
  return history.canEdit === true;
}

// Check if user can delete family medical history record
export function canDeleteFamilyMedicalHistory(history: FamilyMedicalHistoryData): boolean {
  return history.canDelete === true;
}

// Check if family medical history record is read-only
export function isFamilyMedicalHistoryReadOnly(history: FamilyMedicalHistoryData): boolean {
  return history.canEdit === false;
}

// Get permission status display text
export function getFamilyMedicalHistoryPermissionText(history: FamilyMedicalHistoryData): string {
  if (history.addedBy === 'me') {
    return 'Added by you';
  }
  return `Added by ${history.addedBy}`;
}

// Get permission icon for family medical history
export function getFamilyMedicalHistoryPermissionIcon(history: FamilyMedicalHistoryData): 'lock' | 'unlock' {
  return history.canEdit ? 'unlock' : 'lock';
}

// ==================== UTILITY FUNCTIONS ====================

// Common family relations for dropdown options (DEPRECATED - now using actual family members)
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

// ==================== NEW: VALIDATION FUNCTIONS ====================

// Validate family member selection for new medical history
export function validateFamilyMedicalHistoryData(
  historyData: FamilyMedicalHistoryData,
  familyMembers: FamilyMemberForHealth[]
): string[] {
  const errors: string[] = [];

  if (!historyData.familyMemberUserId) {
    errors.push('Please select a family member');
  } else {
    const memberExists = familyMembers.some(
      member => member.user_id === historyData.familyMemberUserId
    );
    if (!memberExists) {
      errors.push('Selected family member is not valid');
    }
  }

  if (!historyData.conditionName || historyData.conditionName.trim() === '') {
    errors.push('Please enter a medical condition');
  }

  return errors;
}

// Check if family members are available for medical history
export function hasFamilyMembersForHistory(familyMembers: FamilyMemberForHealth[]): boolean {
  return familyMembers && familyMembers.length > 0;
}

// Get family member name by user ID
export function getFamilyMemberNameById(
  userId: string,
  familyMembers: FamilyMemberForHealth[]
): string {
  const member = familyMembers.find(m => m.user_id === userId);
  return member?.name || 'Unknown Member';
}

// Get family member relationship by user ID  
export function getFamilyMemberRelationshipById(
  userId: string,
  familyMembers: FamilyMemberForHealth[]
): string {
  const member = familyMembers.find(m => m.user_id === userId);
  return member?.relationship || 'Unknown';
}

// ==================== NEW: FAMILY MEDICAL HISTORY STATS HELPERS ====================

// Calculate family medical history stats
export function calculateFamilyMedicalHistoryStats(
  familyHistory: FamilyMedicalHistoryData[],
  familyMembers: FamilyMemberForHealth[]
): FamilyMedicalHistoryStats {
  const totalRecords = familyHistory.length;
  const editableRecords = familyHistory.filter(h => h.canEdit === true).length;
  const readOnlyRecords = familyHistory.filter(h => h.canEdit === false).length;
  const membersWithHistory = new Set(
    familyHistory.map(h => h.familyMemberUserId).filter(Boolean)
  ).size;

  return {
    totalRecords,
    editableRecords,
    readOnlyRecords,
    membersWithHistory,
    familyMembersCount: familyMembers.length,
  };
}

// Check if family medical history has meaningful data
export function hasMeaningfulFamilyMedicalHistory(
  familyHistory: FamilyMedicalHistoryData[],
  familyMembers: FamilyMemberForHealth[]
): boolean {
  return familyHistory.length > 0 && familyMembers.length > 0;
}