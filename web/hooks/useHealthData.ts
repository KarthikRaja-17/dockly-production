// Enhanced useHealthData.ts - Updated with date validation for wellness tasks
import { useState, useEffect } from "react";
import { message } from "antd";

// Import types - Enhanced with new family medical history types
import {
  MedicationData,
  WellnessTaskData,
  HealthcareProviderData,
  InsuranceAccountData,
  HealthDataState,
  HealthDataActions,
  FamilyMemberForHealth,
  FamilyMedicalHistoryStats,
} from "../services/health/types";

import {
  HealthSummaryInfoData,
  UserAllergyData,
  UserConditionData,
  FamilyMedicalHistoryData,
  fetchHealthSummaryInfo,
  saveHealthSummaryInfo,
  fetchUserAllergies,
  createUserAllergy,
  editUserAllergy,
  removeUserAllergy,
  fetchUserConditions,
  createUserCondition,
  editUserCondition,
  removeUserCondition,
  fetchFamilyMedicalHistory,
  createFamilyMedicalHistory,
  editFamilyMedicalHistory,
  removeFamilyMedicalHistory,
  fetchFamilyMembersForHealth,
  transformHealthSummaryInfoData,
  transformUserAllergyData,
  transformUserConditionData,
  transformFamilyMedicalHistoryData,
  transformFamilyMemberForHealth,
  calculateFamilyMedicalHistoryStats,
  validateFamilyMedicalHistoryData,
} from "../services/health/healthSummary";

// Import health services
import {
  fetchMedications,
  createMedication,
  editMedication,
  removeMedication,
  transformMedicationData,
} from "../services/health/medications";

// UPDATED: Import enhanced wellness functions with date validation
import {
  fetchWellnessTasks,
  createWellnessTask,
  editWellnessTask,
  removeWellnessTask,
  toggleTaskCompletion,
  transformWellnessTaskData,
  validateWellnessTaskDates, // NEW: Import validation function
  sortWellnessTasks, // NEW: Import sorting function
} from "../services/health/wellness";

import {
  fetchProviders,
  createProvider,
  editProvider,
  removeProvider,
  transformProviderData,
} from "../services/health/providers";

import {
  fetchInsuranceAccounts,
  createInsuranceAccount,
  editInsuranceAccount,
  removeInsuranceAccount,
  transformInsuranceData,
} from "../services/health/insurance";

export const useHealthData = (): [HealthDataState, HealthDataActions] => {
  // Data states
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [wellnessTasks, setWellnessTasks] = useState<WellnessTaskData[]>([]);
  const [providers, setProviders] = useState<HealthcareProviderData[]>([]);
  const [insuranceAccounts, setInsuranceAccounts] = useState<
    InsuranceAccountData[]
  >([]);
  const [healthInfo, setHealthInfo] = useState<HealthSummaryInfoData>({});
  const [allergies, setAllergies] = useState<UserAllergyData[]>([]);
  const [conditions, setConditions] = useState<UserConditionData[]>([]);
  const [familyHistory, setFamilyHistory] = useState<
    FamilyMedicalHistoryData[]
  >([]);

  // NEW: Family members state
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberForHealth[]>(
    []
  );
  const [familyHistoryStats, setFamilyHistoryStats] = useState<
    FamilyMedicalHistoryStats | undefined
  >(undefined);

  // Loading states
  const [medicationsLoading, setMedicationsLoading] = useState(false);
  const [wellnessLoading, setWellnessLoading] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [healthInfoLoading, setHealthInfoLoading] = useState(false);
  const [allergiesLoading, setAllergiesLoading] = useState(false);
  const [conditionsLoading, setConditionsLoading] = useState(false);
  const [familyHistoryLoading, setFamilyHistoryLoading] = useState(false);
  const [familyMembersLoading, setFamilyMembersLoading] = useState(false); // NEW
  const [generalLoading, setGeneralLoading] = useState(false);

  // Enhanced load all health data - includes family members
  const loadAllHealthData = async () => {
    await Promise.all([
      loadMedications(),
      loadWellnessTasks(),
      loadProviders(),
      loadInsuranceAccounts(),
      loadHealthSummaryInfo(),
      loadAllergies(),
      loadConditions(),
      loadFamilyMembers(), // NEW: Load family members first
      loadFamilyMedicalHistory(), // Then load family medical history
    ]);
  };

  // Load medications from API
  const loadMedications = async () => {
    try {
      setMedicationsLoading(true);
      const response = await fetchMedications();

      if (response.data.status === 1) {
        const transformedMedications = response.data.payload.medications.map(
          transformMedicationData
        );
        setMedications(transformedMedications);
      } else {
        console.error("Failed to fetch medications:", response.data.message);
        setMedications([]);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
      setMedications([]);
    } finally {
      setMedicationsLoading(false);
    }
  };

  // UPDATED: Load wellness tasks from API with enhanced sorting
  const loadWellnessTasks = async () => {
    try {
      setWellnessLoading(true);
      const response = await fetchWellnessTasks();

      if (response.data.status === 1) {
        const transformedTasks = response.data.payload.tasks.map(
          transformWellnessTaskData
        );

        // NEW: Sort tasks by urgency and date
        const sortedTasks = sortWellnessTasks(transformedTasks);
        setWellnessTasks(sortedTasks);
      } else {
        console.error("Failed to fetch wellness tasks:", response.data.message);
        setWellnessTasks([]);
      }
    } catch (error) {
      console.error("Error fetching wellness tasks:", error);
      setWellnessTasks([]);
    } finally {
      setWellnessLoading(false);
    }
  };

  // Load providers from API
  const loadProviders = async () => {
    try {
      setProvidersLoading(true);
      const response = await fetchProviders();

      if (response.data.status === 1) {
        const transformedProviders = response.data.payload.providers.map(
          transformProviderData
        );
        setProviders(transformedProviders);
      } else {
        console.error("Failed to fetch providers:", response.data.message);
        setProviders([]);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  // Load insurance accounts from API
  const loadInsuranceAccounts = async () => {
    try {
      setInsuranceLoading(true);
      const response = await fetchInsuranceAccounts();

      if (response.data.status === 1) {
        const transformedInsurance =
          response.data.payload.insuranceAccounts.map(transformInsuranceData);
        setInsuranceAccounts(transformedInsurance);
      } else {
        console.error(
          "Failed to fetch insurance accounts:",
          response.data.message
        );
        setInsuranceAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching insurance accounts:", error);
      setInsuranceAccounts([]);
    } finally {
      setInsuranceLoading(false);
    }
  };

  // Load health summary info from API
  const loadHealthSummaryInfo = async () => {
    try {
      setHealthInfoLoading(true);
      const response = await fetchHealthSummaryInfo();

      if (response.data.status === 1) {
        const healthInfoData = response.data.payload.healthInfo;
        if (healthInfoData && Object.keys(healthInfoData).length > 0) {
          setHealthInfo(transformHealthSummaryInfoData(healthInfoData));
        } else {
          setHealthInfo({});
        }
      } else {
        console.error(
          "Failed to fetch health summary info:",
          response.data.message
        );
        setHealthInfo({});
      }
    } catch (error) {
      console.error("Error fetching health summary info:", error);
      setHealthInfo({});
    } finally {
      setHealthInfoLoading(false);
    }
  };

  // Load allergies from API
  const loadAllergies = async () => {
    try {
      setAllergiesLoading(true);
      const response = await fetchUserAllergies();

      if (response.data.status === 1) {
        const transformedAllergies = response.data.payload.allergies.map(
          transformUserAllergyData
        );
        setAllergies(transformedAllergies);
      } else {
        console.error("Failed to fetch allergies:", response.data.message);
        setAllergies([]);
      }
    } catch (error) {
      console.error("Error fetching allergies:", error);
      setAllergies([]);
    } finally {
      setAllergiesLoading(false);
    }
  };

  // Load conditions from API
  const loadConditions = async () => {
    try {
      setConditionsLoading(true);
      const response = await fetchUserConditions();

      if (response.data.status === 1) {
        const transformedConditions = response.data.payload.conditions.map(
          transformUserConditionData
        );
        setConditions(transformedConditions);
      } else {
        console.error("Failed to fetch conditions:", response.data.message);
        setConditions([]);
      }
    } catch (error) {
      console.error("Error fetching conditions:", error);
      setConditions([]);
    } finally {
      setConditionsLoading(false);
    }
  };

  // NEW: Load family members for health context
  const loadFamilyMembers = async () => {
    try {
      setFamilyMembersLoading(true);
      const response = await fetchFamilyMembersForHealth();

      if (response.data.status === 1) {
        const transformedMembers = response.data.payload.familyMembers.map(
          transformFamilyMemberForHealth
        );
        setFamilyMembers(transformedMembers);
      } else {
        console.error("Failed to fetch family members:", response.data.message);
        setFamilyMembers([]);
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
      setFamilyMembers([]);
    } finally {
      setFamilyMembersLoading(false);
    }
  };

  // Enhanced load family medical history with permissions and stats
  const loadFamilyMedicalHistory = async () => {
    try {
      setFamilyHistoryLoading(true);
      const response = await fetchFamilyMedicalHistory();

      if (response.data.status === 1) {
        const transformedHistory = response.data.payload.familyHistory.map(
          transformFamilyMedicalHistoryData
        );
        setFamilyHistory(transformedHistory);

        // Update family members if they came with the response
        if (response.data.payload.familyMembers) {
          const transformedMembers = response.data.payload.familyMembers.map(
            transformFamilyMemberForHealth
          );
          setFamilyMembers(transformedMembers);
        }

        // Calculate and set stats
        const currentMembers =
          response.data.payload.familyMembers || familyMembers;
        const stats =
          response.data.payload.stats ||
          calculateFamilyMedicalHistoryStats(
            transformedHistory,
            currentMembers
          );
        setFamilyHistoryStats(stats);
      } else {
        console.error(
          "Failed to fetch family medical history:",
          response.data.message
        );
        setFamilyHistory([]);
        setFamilyHistoryStats(undefined);
      }
    } catch (error) {
      console.error("Error fetching family medical history:", error);
      setFamilyHistory([]);
      setFamilyHistoryStats(undefined);
    } finally {
      setFamilyHistoryLoading(false);
    }
  };

  // CRUD handlers for medications
  const handleAddMedication = async (medicationData: MedicationData) => {
    try {
      setGeneralLoading(true);
      const response = await createMedication(medicationData);

      if (response.data.status === 1) {
        message.success("Medication added successfully!");
        await loadMedications();
      } else {
        message.error(response.data.message || "Failed to add medication");
      }
    } catch (error) {
      console.error("Error adding medication:", error);
      message.error("Failed to add medication");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleEditMedication = async (
    id: number,
    medicationData: MedicationData
  ) => {
    try {
      setGeneralLoading(true);
      const response = await editMedication(id, medicationData);

      if (response.data.status === 1) {
        message.success("Medication updated successfully!");
        await loadMedications();
      } else {
        message.error(response.data.message || "Failed to update medication");
      }
    } catch (error) {
      console.error("Error updating medication:", error);
      message.error("Failed to update medication");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleDeleteMedication = async (id: number) => {
    try {
      setGeneralLoading(true);
      const response = await removeMedication(id);

      if (response.data.status === 1) {
        message.success("Medication deleted successfully!");
        await loadMedications();
      } else {
        message.error(response.data.message || "Failed to delete medication");
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
      message.error("Failed to delete medication");
    } finally {
      setGeneralLoading(false);
    }
  };

  // UPDATED: CRUD handlers for wellness tasks with enhanced validation
  const handleAddWellnessTask = async (taskData: WellnessTaskData) => {
    try {
      setGeneralLoading(true);

      // NEW: Validate dates before submission
      const validation = validateWellnessTaskDates(
        taskData.start_date || taskData.startDate,
        taskData.due_date || taskData.dueDate,
        taskData.recurring
      );

      if (!validation.isValid) {
        message.error(`Validation error: ${validation.errors.join(", ")}`);
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach((warning) => {
          message.warning(warning);
        });
      }

      const wellnessTaskData: WellnessTaskData = {
        ...taskData,
        recurring:
          taskData.recurring !== undefined ? taskData.recurring : false,
      };

      const response = await createWellnessTask(wellnessTaskData);

      if (response.data.status === 1) {
        message.success("Wellness task added successfully!");
        await loadWellnessTasks(); // Reload to get updated sorting
      } else {
        message.error(response.data.message || "Failed to add wellness task");
      }
    } catch (error: any) {
      console.error("Error adding wellness task:", error);
      // NEW: Show specific validation errors from the service layer
      if (
        (error.message && error.message.includes("Start date")) ||
        error.message.includes("Due date")
      ) {
        message.error(`Date validation error: ${error.message}`);
      } else {
        message.error("Failed to add wellness task");
      }
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleEditWellnessTask = async (
    id: number,
    taskData: WellnessTaskData
  ) => {
    try {
      setGeneralLoading(true);

      // NEW: Validate dates before submission
      const validation = validateWellnessTaskDates(
        taskData.start_date || taskData.startDate,
        taskData.due_date || taskData.dueDate,
        taskData.recurring
      );

      if (!validation.isValid) {
        message.error(`Validation error: ${validation.errors.join(", ")}`);
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach((warning) => {
          message.warning(warning);
        });
      }

      const response = await editWellnessTask(id, taskData);

      if (response.data.status === 1) {
        message.success("Wellness task updated successfully!");
        await loadWellnessTasks(); // Reload to get updated sorting
      } else {
        message.error(
          response.data.message || "Failed to update wellness task"
        );
      }
    } catch (error: any) {
      console.error("Error updating wellness task:", error);
      // NEW: Show specific validation errors from the service layer
      if (
        (error.message && error.message.includes("Start date")) ||
        error.message.includes("Due date")
      ) {
        message.error(`Date validation error: ${error.message}`);
      } else {
        message.error("Failed to update wellness task");
      }
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleDeleteWellnessTask = async (id: number) => {
    try {
      setGeneralLoading(true);
      const response = await removeWellnessTask(id);

      if (response.data.status === 1) {
        message.success("Wellness task deleted successfully!");
        await loadWellnessTasks(); // Reload to get updated sorting
      } else {
        message.error(
          response.data.message || "Failed to delete wellness task"
        );
      }
    } catch (error) {
      console.error("Error deleting wellness task:", error);
      message.error("Failed to delete wellness task");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleToggleWellnessTask = async (id: number) => {
    try {
      const response = await toggleTaskCompletion(id);

      if (response.data.status === 1) {
        const newCompletedStatus = response.data.payload.completed;
        message.success(
          `Task ${
            newCompletedStatus ? "completed" : "uncompleted"
          } successfully!`
        );
        await loadWellnessTasks(); // Reload to get updated sorting
      } else {
        message.error(response.data.message || "Failed to toggle task status");
      }
    } catch (error) {
      console.error("Error toggling task status:", error);
      message.error("Failed to toggle task status");
    }
  };

  // CRUD handlers for providers
  const handleAddProvider = async (providerData: HealthcareProviderData) => {
    try {
      setGeneralLoading(true);
      const response = await createProvider(providerData);

      if (response.data.status === 1) {
        message.success("Healthcare provider added successfully!");
        await loadProviders();
      } else {
        message.error(
          response.data.message || "Failed to add healthcare provider"
        );
      }
    } catch (error) {
      console.error("Error adding healthcare provider:", error);
      message.error("Failed to add healthcare provider");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleEditProvider = async (
    id: number,
    providerData: HealthcareProviderData
  ) => {
    try {
      setGeneralLoading(true);
      const response = await editProvider(id, providerData);

      if (response.data.status === 1) {
        message.success("Healthcare provider updated successfully!");
        await loadProviders();
      } else {
        message.error(
          response.data.message || "Failed to update healthcare provider"
        );
      }
    } catch (error) {
      console.error("Error updating healthcare provider:", error);
      message.error("Failed to update healthcare provider");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleDeleteProvider = async (id: number) => {
    try {
      setGeneralLoading(true);
      const response = await removeProvider(id);

      if (response.data.status === 1) {
        message.success("Healthcare provider deleted successfully!");
        await loadProviders();
      } else {
        message.error(
          response.data.message || "Failed to delete healthcare provider"
        );
      }
    } catch (error) {
      console.error("Error deleting healthcare provider:", error);
      message.error("Failed to delete healthcare provider");
    } finally {
      setGeneralLoading(false);
    }
  };

  // CRUD handlers for insurance
  const handleAddInsurance = async (insuranceData: InsuranceAccountData) => {
    try {
      setGeneralLoading(true);
      const response = await createInsuranceAccount(insuranceData);

      if (response.data.status === 1) {
        message.success("Insurance account added successfully!");
        await loadInsuranceAccounts();
      } else {
        message.error(
          response.data.message || "Failed to add insurance account"
        );
      }
    } catch (error) {
      console.error("Error adding insurance account:", error);
      message.error("Failed to add insurance account");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleEditInsurance = async (
    id: number,
    insuranceData: InsuranceAccountData
  ) => {
    try {
      setGeneralLoading(true);
      const response = await editInsuranceAccount(id, insuranceData);

      if (response.data.status === 1) {
        message.success("Insurance account updated successfully!");
        await loadInsuranceAccounts();
      } else {
        message.error(
          response.data.message || "Failed to update insurance account"
        );
      }
    } catch (error) {
      console.error("Error updating insurance account:", error);
      message.error("Failed to update insurance account");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleDeleteInsurance = async (id: number) => {
    try {
      setGeneralLoading(true);
      const response = await removeInsuranceAccount(id);

      if (response.data.status === 1) {
        message.success("Insurance account deleted successfully!");
        await loadInsuranceAccounts();
      } else {
        message.error(
          response.data.message || "Failed to delete insurance account"
        );
      }
    } catch (error) {
      console.error("Error deleting insurance account:", error);
      message.error("Failed to delete insurance account");
    } finally {
      setGeneralLoading(false);
    }
  };

  // CRUD handlers for health summary info
  const handleSaveHealthInfo = async (infoData: HealthSummaryInfoData) => {
    try {
      setGeneralLoading(true);
      const response = await saveHealthSummaryInfo(infoData);

      if (response.data.status === 1) {
        message.success("Health information saved successfully!");
        await loadHealthSummaryInfo();
      } else {
        message.error(
          response.data.message || "Failed to save health information"
        );
      }
    } catch (error) {
      console.error("Error saving health information:", error);
      message.error("Failed to save health information");
    } finally {
      setGeneralLoading(false);
    }
  };

  // CRUD handlers for allergies
  const handleAddAllergy = async (allergyData: UserAllergyData) => {
    try {
      setGeneralLoading(true);
      const response = await createUserAllergy(allergyData);

      if (response.data.status === 1) {
        message.success("Allergy added successfully!");
        await loadAllergies();
      } else {
        message.error(response.data.message || "Failed to add allergy");
      }
    } catch (error) {
      console.error("Error adding allergy:", error);
      message.error("Failed to add allergy");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleEditAllergy = async (
    id: number,
    allergyData: UserAllergyData
  ) => {
    try {
      setGeneralLoading(true);
      const response = await editUserAllergy(id, allergyData);

      if (response.data.status === 1) {
        message.success("Allergy updated successfully!");
        await loadAllergies();
      } else {
        message.error(response.data.message || "Failed to update allergy");
      }
    } catch (error) {
      console.error("Error updating allergy:", error);
      message.error("Failed to update allergy");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleDeleteAllergy = async (id: number) => {
    try {
      setGeneralLoading(true);
      const response = await removeUserAllergy(id);

      if (response.data.status === 1) {
        message.success("Allergy deleted successfully!");
        await loadAllergies();
      } else {
        message.error(response.data.message || "Failed to delete allergy");
      }
    } catch (error) {
      console.error("Error deleting allergy:", error);
      message.error("Failed to delete allergy");
    } finally {
      setGeneralLoading(false);
    }
  };

  // CRUD handlers for conditions
  const handleAddCondition = async (conditionData: UserConditionData) => {
    try {
      setGeneralLoading(true);
      const response = await createUserCondition(conditionData);

      if (response.data.status === 1) {
        message.success("Condition added successfully!");
        await loadConditions();
      } else {
        message.error(response.data.message || "Failed to add condition");
      }
    } catch (error) {
      console.error("Error adding condition:", error);
      message.error("Failed to add condition");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleEditCondition = async (
    id: number,
    conditionData: UserConditionData
  ) => {
    try {
      setGeneralLoading(true);
      const response = await editUserCondition(id, conditionData);

      if (response.data.status === 1) {
        message.success("Condition updated successfully!");
        await loadConditions();
      } else {
        message.error(response.data.message || "Failed to update condition");
      }
    } catch (error) {
      console.error("Error updating condition:", error);
      message.error("Failed to update condition");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleDeleteCondition = async (id: number) => {
    try {
      setGeneralLoading(true);
      const response = await removeUserCondition(id);

      if (response.data.status === 1) {
        message.success("Condition deleted successfully!");
        await loadConditions();
      } else {
        message.error(response.data.message || "Failed to delete condition");
      }
    } catch (error) {
      console.error("Error deleting condition:", error);
      message.error("Failed to delete condition");
    } finally {
      setGeneralLoading(false);
    }
  };

  // ENHANCED: CRUD handlers for family medical history with validation and permissions
  const handleAddFamilyHistory = async (
    historyData: FamilyMedicalHistoryData
  ) => {
    try {
      // Validate family member selection
      const validationErrors = validateFamilyMedicalHistoryData(
        historyData,
        familyMembers
      );
      if (validationErrors.length > 0) {
        message.error(validationErrors.join(", "));
        return;
      }

      setGeneralLoading(true);
      const response = await createFamilyMedicalHistory(historyData);

      if (response.data.status === 1) {
        message.success("Family medical history added successfully!");
        await loadFamilyMedicalHistory();
      } else {
        message.error(
          response.data.message || "Failed to add family medical history"
        );
      }
    } catch (error) {
      console.error("Error adding family medical history:", error);
      message.error("Failed to add family medical history");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleEditFamilyHistory = async (
    id: number,
    historyData: FamilyMedicalHistoryData
  ) => {
    try {
      // Validate family member selection if changed
      if (historyData.familyMemberUserId) {
        const validationErrors = validateFamilyMedicalHistoryData(
          historyData,
          familyMembers
        );
        if (validationErrors.length > 0) {
          message.error(validationErrors.join(", "));
          return;
        }
      }

      setGeneralLoading(true);
      const response = await editFamilyMedicalHistory(id, historyData);

      if (response.data.status === 1) {
        message.success("Family medical history updated successfully!");
        await loadFamilyMedicalHistory();
      } else {
        message.error(
          response.data.message || "Failed to update family medical history"
        );
      }
    } catch (error) {
      console.error("Error updating family medical history:", error);
      message.error("Failed to update family medical history");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleDeleteFamilyHistory = async (id: number) => {
    try {
      setGeneralLoading(true);
      const response = await removeFamilyMedicalHistory(id);

      if (response.data.status === 1) {
        message.success("Family medical history deleted successfully!");
        await loadFamilyMedicalHistory();
      } else {
        message.error(
          response.data.message || "Failed to delete family medical history"
        );
      }
    } catch (error) {
      console.error("Error deleting family medical history:", error);
      message.error("Failed to delete family medical history");
    } finally {
      setGeneralLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllHealthData();
  }, []);

  // Enhanced state with new family members and stats
  const state: HealthDataState = {
    medications,
    wellnessTasks,
    providers,
    insuranceAccounts,
    healthInfo,
    allergies,
    conditions,
    familyHistory,
    familyMembers, // NEW
    familyHistoryStats, // NEW
    medicationsLoading,
    wellnessLoading,
    providersLoading,
    insuranceLoading,
    healthInfoLoading,
    allergiesLoading,
    conditionsLoading,
    familyHistoryLoading,
    familyMembersLoading, // NEW
    generalLoading,
  };

  // Enhanced actions with new family members functionality
  const actions: HealthDataActions = {
    loadAllHealthData,
    loadMedications,
    loadWellnessTasks,
    loadProviders,
    loadInsuranceAccounts,
    loadHealthSummaryInfo,
    loadAllergies,
    loadConditions,
    loadFamilyMedicalHistory,
    loadFamilyMembers, // NEW
    handleAddMedication,
    handleEditMedication,
    handleDeleteMedication,
    handleAddWellnessTask,
    handleEditWellnessTask,
    handleDeleteWellnessTask,
    handleToggleWellnessTask,
    handleAddProvider,
    handleEditProvider,
    handleDeleteProvider,
    handleAddInsurance,
    handleEditInsurance,
    handleDeleteInsurance,
    handleSaveHealthInfo,
    handleAddAllergy,
    handleEditAllergy,
    handleDeleteAllergy,
    handleAddCondition,
    handleEditCondition,
    handleDeleteCondition,
    handleAddFamilyHistory, // ENHANCED
    handleEditFamilyHistory, // ENHANCED
    handleDeleteFamilyHistory, // ENHANCED
  };

  return [state, actions];
};
