// Enhanced HealthDashboard page.tsx - UPDATED with Centralized Tracker State Management
"use client";

import React, { useEffect, useState } from "react";
import {
  Col,
  Form,
  Row,
  Modal,
  Input,
  Button,
  Avatar,
  Typography,
  message,
  Select,
} from "antd";
import { useRouter } from "next/navigation";
import {
  SearchOutlined,
  ShareAltOutlined,
  MailOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// Import enhanced custom hook and types
import { useHealthData } from "../../../hooks/useHealthData";
import {
  MedicationData,
  WellnessTaskData,
  HealthcareProviderData,
  InsuranceAccountData,
  FamilyMember,
  FamilyMemberForHealth,
  colors,
  shadows,
} from "../../../services/health/types";

import {
  HealthSummaryInfoData,
  UserAllergyData,
  UserConditionData,
  FamilyMedicalHistoryData,
} from "../../../services/health/healthSummary";

// NEW: Import validation functions
import {
  validateWellnessTaskDates,
  formatDateForAPI,
} from "../../../services/health/wellness";

// Import sharing functions
import { shareWellnessTaskWithMembers } from "../../../services/health/wellness";
import { shareMedicationWithMembers } from "../../../services/health/medications";
import { shareProviderWithMembers } from "../../../services/health/providers";
import { shareInsuranceWithMembers } from "../../../services/health/insurance";

// UPDATED: Import centralized tracker hooks
import { useFitbit } from "../../../hooks/useFitbit";
import { useGarmin } from "../../../hooks/useGarmin";

// Import components
import HealthSummary from "../../../pages/components/health/HealthSummary";
import WellnessTasks from "../../../pages/components/health/WellnessTasks";
import HealthGoals from "../../../pages/components/health/HealthGoals";
import Medications from "../../../pages/components/health/Medications";
import HealthcareSection from "../../../pages/components/health/HealthcareSection";

// Import modal components
import {
  MedicationModal,
  WellnessTaskModal,
  ProviderModal,
  ProviderViewModal,
  InsuranceModal,
  InsuranceViewModal,
  HealthInfoModal,
  AllergyModal,
  AllergyViewModal,
  ConditionModal,
  ConditionViewModal,
  FamilyHistoryModal,
  FamilyHistoryViewModal,
} from "../../../pages/modals/HealthModals";
import BookmarkHub from "../../../pages/components/bookmarks";
import NotesLists from "../../../pages/family-hub/components/familyNotesLists";
import FileHub from "../../../pages/components/files";
import { getUsersFamilyMembers } from "../../../services/family";

const { Text } = Typography;
const { Option } = Select;

const HealthDashboard = () => {
  const router = useRouter();

  // Mobile detection state
  const [isMobile, setIsMobile] = useState(false);

  // User data
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // UPDATED: CENTRALIZED HEALTH TRACKER INTEGRATION
  // Single source of truth for both Fitbit and Garmin state
  const fitbit = useFitbit({
    userId,
    username,
    onConnected: handleFitbitConnected,
    autoCheck: true,
  });

  const garmin = useGarmin({
    userId,
    username,
    onConnected: handleGarminConnected,
    autoCheck: true,
  });

  // Enhanced custom hook for all health data management with family members
  const [healthData, healthActions] = useHealthData();

  // Modal visibility states
  const [medicationModalVisible, setMedicationModalVisible] = useState(false);
  const [wellnessModalVisible, setWellnessModalVisible] = useState(false);
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [providerViewModalVisible, setProviderViewModalVisible] =
    useState(false);
  const [insuranceModalVisible, setInsuranceModalVisible] = useState(false);
  const [insuranceViewModalVisible, setInsuranceViewModalVisible] =
    useState(false);
  const [healthInfoModalVisible, setHealthInfoModalVisible] = useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [allergyViewModalVisible, setAllergyViewModalVisible] = useState(false);
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [conditionViewModalVisible, setConditionViewModalVisible] =
    useState(false);
  const [familyHistoryModalVisible, setFamilyHistoryModalVisible] =
    useState(false);
  const [familyHistoryViewModalVisible, setFamilyHistoryViewModalVisible] =
    useState(false);

  // ==================== TAGGING INTEGRATION - SHARING MODAL STATES ====================
  const [medicationShareModalVisible, setMedicationShareModalVisible] =
    useState(false);
  const [wellnessShareModalVisible, setWellnessShareModalVisible] =
    useState(false);
  const [providerShareModalVisible, setProviderShareModalVisible] =
    useState(false);
  const [insuranceShareModalVisible, setInsuranceShareModalVisible] =
    useState(false);

  // Current items being shared
  const [currentShareMedication, setCurrentShareMedication] =
    useState<MedicationData | null>(null);
  const [currentShareWellnessTask, setCurrentShareWellnessTask] =
    useState<WellnessTaskData | null>(null);
  const [currentShareProvider, setCurrentShareProvider] =
    useState<HealthcareProviderData | null>(null);
  const [currentShareInsurance, setCurrentShareInsurance] =
    useState<InsuranceAccountData | null>(null);

  // Family members and sharing states (for tagging functionality)
  const [familyMembersForTagging, setFamilyMembersForTagging] = useState<
    FamilyMember[]
  >([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [shareForm] = Form.useForm();
  const [sharingLoading, setSharingLoading] = useState(false);

  // Editing states for modals
  const [editingMedication, setEditingMedication] =
    useState<MedicationData | null>(null);
  const [editingWellnessTask, setEditingWellnessTask] =
    useState<WellnessTaskData | null>(null);
  const [editingProvider, setEditingProvider] =
    useState<HealthcareProviderData | null>(null);
  const [viewingProvider, setViewingProvider] =
    useState<HealthcareProviderData | null>(null);
  const [editingInsurance, setEditingInsurance] =
    useState<InsuranceAccountData | null>(null);
  const [viewingInsurance, setViewingInsurance] =
    useState<InsuranceAccountData | null>(null);
  const [editingAllergy, setEditingAllergy] = useState<UserAllergyData | null>(
    null
  );
  const [viewingAllergy, setViewingAllergy] = useState<UserAllergyData | null>(
    null
  );
  const [editingCondition, setEditingCondition] =
    useState<UserConditionData | null>(null);
  const [viewingCondition, setViewingCondition] =
    useState<UserConditionData | null>(null);
  const [editingFamilyHistory, setEditingFamilyHistory] =
    useState<FamilyMedicalHistoryData | null>(null);
  const [viewingFamilyHistory, setViewingFamilyHistory] =
    useState<FamilyMedicalHistoryData | null>(null);

  // Form instances for modals
  const [medicationForm] = Form.useForm();
  const [wellnessForm] = Form.useForm();
  const [providerForm] = Form.useForm();
  const [insuranceForm] = Form.useForm();
  const [healthInfoForm] = Form.useForm();
  const [allergyForm] = Form.useForm();
  const [conditionForm] = Form.useForm();
  const [familyHistoryForm] = Form.useForm();

  // ==================== HEALTH TRACKER INTEGRATION - MOVED TO TOP ====================

  // UPDATED: Fitbit connection callback handler - now uses centralized state
  function handleFitbitConnected() {
    console.log(
      "DEBUG: Fitbit connection callback triggered, refreshing all health data..."
    );
    try {
      healthActions.loadAllHealthData();
      console.log(
        "DEBUG: Health data refresh completed after Fitbit connection"
      );
    } catch (error) {
      console.error(
        "DEBUG: Error refreshing health data after Fitbit connection:",
        error
      );
    }
  }

  // UPDATED: Garmin connection callback handler - now uses centralized state
  function handleGarminConnected() {
    console.log(
      "DEBUG: Garmin connection callback triggered, refreshing all health data..."
    );
    try {
      healthActions.loadAllHealthData();
      console.log(
        "DEBUG: Health data refresh completed after Garmin connection"
      );
    } catch (error) {
      console.error(
        "DEBUG: Error refreshing health data after Garmin connection:",
        error
      );
    }
  }

  // ==================== TAGGING INTEGRATION - FAMILY MEMBERS ====================

  // Filter family members (same logic as BookmarkHub)
  const filteredFamilyMembers = familyMembersForTagging
    .filter((member: FamilyMember) => !member.isPet)
    .filter(
      (member: FamilyMember) => member.status?.toLowerCase() !== "pending"
    )
    .filter((member: FamilyMember) => member.email && member.email.trim())
    .filter((member: FamilyMember) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Helper function to extract valid emails from family members
  const getValidEmails = (members: FamilyMember[]): string[] => {
    return members
      .map((member) => member.email)
      .filter(
        (email): email is string =>
          typeof email === "string" && email.trim() !== ""
      );
  };

  // Fetch family members for tagging functionality
  const fetchFamilyMembersForTagging = async () => {
    try {
      const res = await getUsersFamilyMembers({});
      if (res.status) {
        const filtered = (res.payload.members || [])
          .filter((m: any) => !m.isPet && m.status?.toLowerCase() !== "pending")
          .map((m: any) => ({
            id: m.id,
            name: m.name,
            role: m.role || m.relationship,
            type: "family" as const,
            color: m.color || "#666",
            initials: m.name?.charAt(0)?.toUpperCase() || "U",
            status: m.status,
            email: m.email,
            user_id: m.fm_user_id || m.user_id,
          }));
        setFamilyMembersForTagging(filtered);
      }
    } catch (error) {
      message.error("Failed to fetch family members");
    }
  };

  // ==================== TAGGING INTEGRATION - SHARING HANDLERS ====================

  // Medication sharing handlers
  const handleShareMedication = (medication: MedicationData) => {
    setCurrentShareMedication(medication);
    setSelectedMemberIds([]);
    setSearchTerm("");
    setMedicationShareModalVisible(true);
    shareForm.resetFields();
  };

  const handleShareMedicationToMembers = async () => {
    if (!currentShareMedication || selectedMemberIds.length === 0) {
      message.warning("Please select family members to tag");
      return;
    }

    const selectedMembers = familyMembersForTagging.filter((member) =>
      selectedMemberIds.includes(member.id.toString())
    );

    // FIXED: Use helper function to get valid emails
    const emails = getValidEmails(selectedMembers);

    if (emails.length === 0) {
      message.warning("Selected members don't have valid email addresses");
      return;
    }

    try {
      setSharingLoading(true);
      await shareMedicationWithMembers(emails, currentShareMedication, emails);

      const memberNames = selectedMembers.map((m) => m.name).join(", ");
      message.success(`Medication tagged with ${memberNames}!`);
      setMedicationShareModalVisible(false);
      resetSharingState();
    } catch (error) {
      console.error("Error sharing medication:", error);
      message.error("Failed to share medication");
    } finally {
      setSharingLoading(false);
    }
  };

  const handleShareMedicationViaEmail = async () => {
    try {
      const values = await shareForm.validateFields();
      if (!currentShareMedication) return;

      setSharingLoading(true);
      await shareMedicationWithMembers([values.email], currentShareMedication);

      message.success("Medication shared via email!");
      setMedicationShareModalVisible(false);
      resetSharingState();
    } catch (error) {
      console.error("Error sharing medication via email:", error);
      message.error("Failed to share medication");
    } finally {
      setSharingLoading(false);
    }
  };

  // Wellness task sharing handlers
  const handleShareWellnessTask = (task: WellnessTaskData) => {
    setCurrentShareWellnessTask(task);
    setSelectedMemberIds([]);
    setSearchTerm("");
    setWellnessShareModalVisible(true);
    shareForm.resetFields();
  };

  const handleShareWellnessTaskToMembers = async () => {
    if (!currentShareWellnessTask || selectedMemberIds.length === 0) {
      message.warning("Please select family members to tag");
      return;
    }

    const selectedMembers = familyMembersForTagging.filter((member) =>
      selectedMemberIds.includes(member.id.toString())
    );

    // FIXED: Use helper function to get valid emails
    const emails = getValidEmails(selectedMembers);

    if (emails.length === 0) {
      message.warning("Selected members don't have valid email addresses");
      return;
    }

    try {
      setSharingLoading(true);
      await shareWellnessTaskWithMembers(
        emails,
        currentShareWellnessTask,
        emails
      );

      const memberNames = selectedMembers.map((m) => m.name).join(", ");
      message.success(`Wellness task tagged with ${memberNames}!`);
      setWellnessShareModalVisible(false);
      resetSharingState();
    } catch (error) {
      console.error("Error sharing wellness task:", error);
      message.error("Failed to share wellness task");
    } finally {
      setSharingLoading(false);
    }
  };

  const handleShareWellnessTaskViaEmail = async () => {
    try {
      const values = await shareForm.validateFields();
      if (!currentShareWellnessTask) return;

      setSharingLoading(true);
      await shareWellnessTaskWithMembers(
        [values.email],
        currentShareWellnessTask
      );

      message.success("Wellness task shared via email!");
      setWellnessShareModalVisible(false);
      resetSharingState();
    } catch (error) {
      console.error("Error sharing wellness task via email:", error);
      message.error("Failed to share wellness task");
    } finally {
      setSharingLoading(false);
    }
  };

  // Provider sharing handlers
  const handleShareProvider = (provider: HealthcareProviderData) => {
    setCurrentShareProvider(provider);
    setSelectedMemberIds([]);
    setSearchTerm("");
    setProviderShareModalVisible(true);
    shareForm.resetFields();
  };

  const handleShareProviderToMembers = async () => {
    if (!currentShareProvider || selectedMemberIds.length === 0) {
      message.warning("Please select family members to tag");
      return;
    }

    const selectedMembers = familyMembersForTagging.filter((member) =>
      selectedMemberIds.includes(member.id.toString())
    );

    // FIXED: Use helper function to get valid emails
    const emails = getValidEmails(selectedMembers);

    if (emails.length === 0) {
      message.warning("Selected members don't have valid email addresses");
      return;
    }

    try {
      setSharingLoading(true);
      await shareProviderWithMembers(emails, currentShareProvider, emails);

      const memberNames = selectedMembers.map((m) => m.name).join(", ");
      message.success(`Healthcare provider tagged with ${memberNames}!`);
      setProviderShareModalVisible(false);
      resetSharingState();
    } catch (error) {
      console.error("Error sharing provider:", error);
      message.error("Failed to share healthcare provider");
    } finally {
      setSharingLoading(false);
    }
  };

  const handleShareProviderViaEmail = async () => {
    try {
      const values = await shareForm.validateFields();
      if (!currentShareProvider) return;

      setSharingLoading(true);
      await shareProviderWithMembers([values.email], currentShareProvider);

      message.success("Healthcare provider shared via email!");
      setProviderShareModalVisible(false);
      resetSharingState();
    } catch (error) {
      console.error("Error sharing provider via email:", error);
      message.error("Failed to share healthcare provider");
    } finally {
      setSharingLoading(false);
    }
  };

  // Insurance sharing handlers
  const handleShareInsurance = (insurance: InsuranceAccountData) => {
    setCurrentShareInsurance(insurance);
    setSelectedMemberIds([]);
    setSearchTerm("");
    setInsuranceShareModalVisible(true);
    shareForm.resetFields();
  };

  const handleShareInsuranceToMembers = async () => {
    if (!currentShareInsurance || selectedMemberIds.length === 0) {
      message.warning("Please select family members to tag");
      return;
    }

    const selectedMembers = familyMembersForTagging.filter((member) =>
      selectedMemberIds.includes(member.id.toString())
    );

    // FIXED: Use helper function to get valid emails
    const emails = getValidEmails(selectedMembers);

    if (emails.length === 0) {
      message.warning("Selected members don't have valid email addresses");
      return;
    }

    try {
      setSharingLoading(true);
      await shareInsuranceWithMembers(emails, currentShareInsurance, emails);

      const memberNames = selectedMembers.map((m) => m.name).join(", ");
      message.success(`Insurance account tagged with ${memberNames}!`);
      setInsuranceShareModalVisible(false);
      resetSharingState();
    } catch (error) {
      console.error("Error sharing insurance:", error);
      message.error("Failed to share insurance account");
    } finally {
      setSharingLoading(false);
    }
  };

  const handleShareInsuranceViaEmail = async () => {
    try {
      const values = await shareForm.validateFields();
      if (!currentShareInsurance) return;

      setSharingLoading(true);
      await shareInsuranceWithMembers([values.email], currentShareInsurance);

      message.success("Insurance account shared via email!");
      setInsuranceShareModalVisible(false);
      resetSharingState();
    } catch (error) {
      console.error("Error sharing insurance via email:", error);
      message.error("Failed to share insurance account");
    } finally {
      setSharingLoading(false);
    }
  };

  // Reset sharing state
  const resetSharingState = () => {
    setCurrentShareMedication(null);
    setCurrentShareWellnessTask(null);
    setCurrentShareProvider(null);
    setCurrentShareInsurance(null);
    setSelectedMemberIds([]);
    setSearchTerm("");
    shareForm.resetFields();
  };

  // Close sharing modals
  const closeSharingModals = () => {
    setMedicationShareModalVisible(false);
    setWellnessShareModalVisible(false);
    setProviderShareModalVisible(false);
    setInsuranceShareModalVisible(false);
    resetSharingState();
  };

  // Initialize user data and mobile detection
  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    const userId = localStorage.getItem("userId") || "";
    setUsername(username);
    setUserId(userId);

    if (localStorage.getItem("health") === null) {
      // router.push(`/${username}/health-hub/setup`);
    }

    // Fetch family members for tagging
    fetchFamilyMembersForTagging();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ==================== MODAL HANDLERS - OPENING ====================

  const handleOpenMedicationModal = () => {
    setEditingMedication(null);
    setMedicationModalVisible(true);
    medicationForm.resetFields();
  };

  const handleOpenWellnessModal = () => {
    setEditingWellnessTask(null);
    setWellnessModalVisible(true);
    wellnessForm.resetFields();
  };

  const handleOpenProviderModal = () => {
    setEditingProvider(null);
    setProviderModalVisible(true);
    providerForm.resetFields();
  };

  const handleOpenInsuranceModal = () => {
    setEditingInsurance(null);
    setInsuranceModalVisible(true);
    insuranceForm.resetFields();
  };

  const handleOpenHealthInfoModal = () => {
    setHealthInfoModalVisible(true);
    healthInfoForm.setFieldsValue(healthData.healthInfo);
  };

  const handleOpenAllergyModal = () => {
    setEditingAllergy(null);
    setAllergyModalVisible(true);
    allergyForm.resetFields();
  };

  const handleOpenConditionModal = () => {
    setEditingCondition(null);
    setConditionModalVisible(true);
    conditionForm.resetFields();
  };

  // ENHANCED: Family history modal handler with family member validation
  const handleOpenFamilyHistoryModal = (
    familyMembers?: FamilyMemberForHealth[]
  ) => {
    // Check if family members are available
    const availableMembers = familyMembers || healthData.familyMembers;
    if (!availableMembers || availableMembers.length === 0) {
      message.warning(
        "Please add family members first before adding medical history"
      );
      return;
    }

    setEditingFamilyHistory(null);
    setFamilyHistoryModalVisible(true);
    familyHistoryForm.resetFields();
  };

  // ==================== MODAL HANDLERS - EDITING ====================

  const handleEditMedicationModal = (medication: MedicationData) => {
    setEditingMedication(medication);
    medicationForm.setFieldsValue(medication);
    setMedicationModalVisible(true);
  };

  // UPDATED: Wellness task edit with date handling
  const handleEditWellnessTaskModal = (task: WellnessTaskData) => {
    setEditingWellnessTask(task);

    // NEW: Handle date field conversion for form
    const formValues: any = {
      text: task.text,
      recurring: task.recurring || false,
      details: task.details || "",
      icon: task.icon || "✅",
    };

    // Handle date fields based on task structure
    if (task.recurring) {
      // For recurring tasks, use the new date fields
      if (task.start_date || task.startDate) {
        formValues.startDate = dayjs(task.start_date || task.startDate);
      }
      if (task.due_date || task.dueDate) {
        formValues.dueDate = dayjs(task.due_date || task.dueDate);
      }
    } else {
      // For non-recurring tasks, handle legacy date field
      if (task.date) {
        formValues.date = task.date;
      }

      // Also set optional date pickers if new date fields exist
      if (task.start_date || task.startDate) {
        formValues.startDate = dayjs(task.start_date || task.startDate);
      }
      if (task.due_date || task.dueDate) {
        formValues.dueDate = dayjs(task.due_date || task.dueDate);
      }
    }

    wellnessForm.setFieldsValue(formValues);
    setWellnessModalVisible(true);
  };

  const handleEditProviderModal = (provider: HealthcareProviderData) => {
    setEditingProvider(provider);
    providerForm.setFieldsValue({
      name: provider.name,
      specialty: provider.specialty,
      phone: provider.phone,
      practiceName: provider.practiceName,
      address: provider.address,
      icon: provider.icon,
      notes: provider.notes,
    });
    setProviderModalVisible(true);
  };

  const handleEditInsuranceModal = (insurance: InsuranceAccountData) => {
    setEditingInsurance(insurance);
    insuranceForm.setFieldsValue({
      providerName: insurance.providerName,
      planName: insurance.planName,
      accountType: insurance.accountType,
      details: insurance.details,
      contactInfo: insurance.contactInfo,
      logoText: insurance.logoText,
      gradientStyle: insurance.gradientStyle,
      notes: insurance.notes,
    });
    setInsuranceModalVisible(true);
  };

  const handleViewAllergy = (allergy: UserAllergyData) => {
    setViewingAllergy(allergy);
    setAllergyViewModalVisible(true);
  };

  const handleViewCondition = (condition: UserConditionData) => {
    setViewingCondition(condition);
    setConditionViewModalVisible(true);
  };

  const handleViewFamilyHistory = (history: FamilyMedicalHistoryData) => {
    setViewingFamilyHistory(history);
    setFamilyHistoryViewModalVisible(true);
  };

  const handleViewProvider = (provider: HealthcareProviderData) => {
    setViewingProvider(provider);
    setProviderViewModalVisible(true);
  };

  const handleViewInsurance = (insurance: InsuranceAccountData) => {
    setViewingInsurance(insurance);
    setInsuranceViewModalVisible(true);
  };

  const handleEditAllergyModal = (allergy: UserAllergyData) => {
    setEditingAllergy(allergy);
    allergyForm.setFieldsValue(allergy);
    setAllergyModalVisible(true);
  };

  const handleEditConditionModal = (condition: UserConditionData) => {
    setEditingCondition(condition);
    conditionForm.setFieldsValue(condition);
    setConditionModalVisible(true);
  };

  // ENHANCED: Family history edit with family member validation
  const handleEditFamilyHistoryModal = (
    history: FamilyMedicalHistoryData,
    familyMembers?: FamilyMemberForHealth[]
  ) => {
    // Check if family members are available
    const availableMembers = familyMembers || healthData.familyMembers;
    if (!availableMembers || availableMembers.length === 0) {
      message.warning("Family members information is not available");
      return;
    }

    setEditingFamilyHistory(history);
    familyHistoryForm.setFieldsValue({
      ...history,
      familyMemberUserId: history.familyMemberUserId,
    });
    setFamilyHistoryModalVisible(true);
  };

  // ==================== MODAL SUBMIT HANDLERS ====================

  const handleMedicationSubmit = async (values: any) => {
    const medicationData: MedicationData = {
      name: values.name,
      dosage: values.dosage,
      conditionTreated: values.conditionTreated,
      prescribingDoctor: values.prescribingDoctor,
      schedule: values.schedule,
      refillDaysLeft: values.refillDaysLeft,
      icon: values.icon || "💊",
      isRefillSoon: values.refillDaysLeft <= 7,
    };

    if (editingMedication) {
      await healthActions.handleEditMedication(
        editingMedication.id!,
        medicationData
      );
    } else {
      await healthActions.handleAddMedication(medicationData);
    }

    setMedicationModalVisible(false);
    setEditingMedication(null);
    medicationForm.resetFields();
  };

  // UPDATED: Enhanced wellness task submit with date validation
  const handleWellnessTaskSubmit = async (values: any) => {
    try {
      // NEW: Validate dates before submission
      let startDate: string | undefined;
      let dueDate: string | undefined;

      console.log("DEBUG: Wellness task form values on submit:", values);

      const formatDate = (date: any) => {
        if (!date) return undefined;
        if (typeof date === "string") return date; // already formatted
        if (date.format) return date.format("YYYY-MM-DD"); // dayjs/moment
        return String(date); // fallback
      };

      if (values.recurring) {
        // For recurring tasks, dates are required
        if (!values.startDate || !values.dueDate) {
          message.error(
            "Start date and due date are required for recurring tasks"
          );
          return;
        }
        startDate = formatDate(values.startDate);
        dueDate = formatDate(values.dueDate);
      } else {
        // For non-recurring tasks, dates are optional
        startDate = formatDate(values.startDate);
        dueDate = formatDate(values.dueDate);
      }

      // NEW: Use validation function
      const validation = validateWellnessTaskDates(
        startDate,
        dueDate,
        values.recurring
      );
      if (!validation.isValid) {
        message.error(`Validation error: ${validation.errors.join(", ")}`);
        return;
      }

      // Show warnings
      if (validation.warnings.length > 0) {
        validation.warnings.forEach((warning) => message.warning(warning));
      }

      const taskData: WellnessTaskData = {
        icon: values.icon || "✅",
        text: values.text,
        recurring: values.recurring || false,
        details: values.details || "",
        completed: false,
        // NEW: Include both date structures for compatibility
        start_date: startDate,
        due_date: dueDate,
        startDate,
        dueDate,
        // Legacy support
        date: values.date,
      };

      console.log("DEBUG: Submitting wellness task with data:", taskData);

      if (editingWellnessTask) {
        await healthActions.handleEditWellnessTask(
          editingWellnessTask.id!,
          taskData
        );
      } else {
        await healthActions.handleAddWellnessTask(taskData);
      }

      setWellnessModalVisible(false);
      setEditingWellnessTask(null);
      wellnessForm.resetFields();
    } catch (error: any) {
      console.error("Error in wellness task submission:", error);
      message.error(
        `Failed to save wellness task: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleProviderSubmit = async (values: any) => {
    const providerData: HealthcareProviderData = {
      name: values.name,
      specialty: values.specialty,
      phone: values.phone,
      practiceName: values.practiceName,
      address: values.address,
      icon: values.icon || "👨‍⚕️",
      notes: values.notes,
    };

    if (editingProvider) {
      await healthActions.handleEditProvider(editingProvider.id!, providerData);
    } else {
      await healthActions.handleAddProvider(providerData);
    }

    setProviderModalVisible(false);
    setEditingProvider(null);
    providerForm.resetFields();
  };

  const handleInsuranceSubmit = async (values: any) => {
    const insuranceData: InsuranceAccountData = {
      providerName: values.providerName,
      planName: values.planName,
      accountType: values.accountType,
      details: values.details || [],
      contactInfo: values.contactInfo,
      logoText: values.logoText,
      gradientStyle: values.gradientStyle,
      notes: values.notes,
    };

    if (editingInsurance) {
      await healthActions.handleEditInsurance(
        editingInsurance.id!,
        insuranceData
      );
    } else {
      await healthActions.handleAddInsurance(insuranceData);
    }

    setInsuranceModalVisible(false);
    setEditingInsurance(null);
    insuranceForm.resetFields();
  };

  const handleHealthInfoSubmit = async (values: any) => {
    const infoData: HealthSummaryInfoData = {
      ...healthData.healthInfo,
      bloodType: values.bloodType,
      dateOfBirth: values.dateOfBirth,
      height: values.height,
      emergencyContactName: values.emergencyContactName,
      emergencyContactPhone: values.emergencyContactPhone,
      primaryDoctor: values.primaryDoctor,
      medicalRecordNumber: values.medicalRecordNumber,
    };

    await healthActions.handleSaveHealthInfo(infoData);
    setHealthInfoModalVisible(false);
    healthInfoForm.resetFields();
  };

  const handleAllergySubmit = async (values: any) => {
    const allergyData: UserAllergyData = {
      allergyName: values.allergyName,
      severityLevel: values.severityLevel,
      allergyType: values.allergyType,
      reactionSymptoms: values.reactionSymptoms,
      notes: values.notes,
    };

    if (editingAllergy) {
      await healthActions.handleEditAllergy(editingAllergy.id!, allergyData);
    } else {
      await healthActions.handleAddAllergy(allergyData);
    }

    setAllergyModalVisible(false);
    setEditingAllergy(null);
    allergyForm.resetFields();
  };

  const handleConditionSubmit = async (values: any) => {
    const conditionData: UserConditionData = {
      conditionName: values.conditionName,
      status: values.status,
      diagnosisDate: values.diagnosisDate,
      treatingDoctor: values.treatingDoctor,
      notes: values.notes,
    };

    if (editingCondition) {
      await healthActions.handleEditCondition(
        editingCondition.id!,
        conditionData
      );
    } else {
      await healthActions.handleAddCondition(conditionData);
    }

    setConditionModalVisible(false);
    setEditingCondition(null);
    conditionForm.resetFields();
  };

  // ENHANCED: Family history submit with family member ID
  const handleFamilyHistorySubmit = async (values: any) => {
    const historyData: FamilyMedicalHistoryData = {
      familyMemberUserId: values.familyMemberUserId, // NEW: Use user ID instead of text
      conditionName: values.conditionName,
      ageOfOnset: values.ageOfOnset,
      status: values.status,
      notes: values.notes,
    };

    if (editingFamilyHistory) {
      await healthActions.handleEditFamilyHistory(
        editingFamilyHistory.id!,
        historyData
      );
    } else {
      await healthActions.handleAddFamilyHistory(historyData);
    }

    setFamilyHistoryModalVisible(false);
    setEditingFamilyHistory(null);
    familyHistoryForm.resetFields();
  };

  // ==================== MODAL CANCEL HANDLERS ====================

  const handleMedicationCancel = () => {
    setMedicationModalVisible(false);
    setEditingMedication(null);
    medicationForm.resetFields();
  };

  const handleWellnessCancel = () => {
    setWellnessModalVisible(false);
    setEditingWellnessTask(null);
    wellnessForm.resetFields();
  };

  const handleProviderCancel = () => {
    setProviderModalVisible(false);
    setEditingProvider(null);
    providerForm.resetFields();
  };

  const handleProviderViewCancel = () => {
    setProviderViewModalVisible(false);
    setViewingProvider(null);
  };

  const handleInsuranceCancel = () => {
    setInsuranceModalVisible(false);
    setEditingInsurance(null);
    insuranceForm.resetFields();
  };

  const handleInsuranceViewCancel = () => {
    setInsuranceViewModalVisible(false);
    setViewingInsurance(null);
  };

  const handleHealthInfoCancel = () => {
    setHealthInfoModalVisible(false);
    healthInfoForm.resetFields();
  };

  const handleAllergyCancel = () => {
    setAllergyModalVisible(false);
    setEditingAllergy(null);
    allergyForm.resetFields();
  };

  const handleAllergyViewCancel = () => {
    setAllergyViewModalVisible(false);
    setViewingAllergy(null);
  };

  const handleConditionCancel = () => {
    setConditionModalVisible(false);
    setEditingCondition(null);
    conditionForm.resetFields();
  };

  const handleConditionViewCancel = () => {
    setConditionViewModalVisible(false);
    setViewingCondition(null);
  };

  const handleFamilyHistoryCancel = () => {
    setFamilyHistoryModalVisible(false);
    setEditingFamilyHistory(null);
    familyHistoryForm.resetFields();
  };

  const handleFamilyHistoryViewCancel = () => {
    setFamilyHistoryViewModalVisible(false);
    setViewingFamilyHistory(null);
  };

  // ==================== TAGGING INTEGRATION - RENDER SHARING MODAL ====================

  const renderSharingModal = (
    visible: boolean,
    onCancel: () => void,
    currentItem: any,
    onShareToMembers: () => void,
    onShareViaEmail: () => void,
    itemType: string
  ) => (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={520}
      destroyOnClose
      styles={{
        body: {
          padding: "0px",
          background: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
        },
        header: { padding: "0px", marginBottom: "0px", border: "none" },
        mask: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        content: {
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
          border: "1px solid #e5e7eb",
        },
      }}
    >
      {currentItem && (
        <div>
          {/* Header with Search */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "#f3f4f6",
                  borderRadius: "50%",
                  padding: "10px",
                  marginRight: "12px",
                }}
              >
                <ShareAltOutlined
                  style={{ color: "#374151", fontSize: "18px" }}
                />
              </div>
              <Text
                style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937" }}
              >
                Share {itemType}
              </Text>
            </div>

            <Input
              placeholder="Search family members..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#374151",
                height: "36px",
              }}
            />
          </div>

          {/* Family Members Grid OR Empty State */}
          <div style={{ padding: "16px 20px" }}>
            {filteredFamilyMembers.length > 0 ? (
              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                  }}
                >
                  {filteredFamilyMembers.map((member: FamilyMember) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedMemberIds((prev) =>
                          prev.includes(member.id.toString())
                            ? prev.filter((id) => id !== member.id.toString())
                            : [...prev, member.id.toString()]
                        );
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        padding: "12px 8px",
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        background: selectedMemberIds.includes(
                          member.id.toString()
                        )
                          ? "#f0f9ff"
                          : "transparent",
                        border: selectedMemberIds.includes(member.id.toString())
                          ? "2px solid #3b82f6"
                          : "2px solid transparent",
                      }}
                    >
                      <div
                        style={{ position: "relative", marginBottom: "8px" }}
                      >
                        <Avatar
                          size={60}
                          style={{
                            background: selectedMemberIds.includes(
                              member.id.toString()
                            )
                              ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                              : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                            fontSize: "24px",
                            fontWeight: "600",
                            border: selectedMemberIds.includes(
                              member.id.toString()
                            )
                              ? "3px solid #3b82f6"
                              : "3px solid #e5e7eb",
                            boxShadow: selectedMemberIds.includes(
                              member.id.toString()
                            )
                              ? "0 4px 20px rgba(59, 130, 246, 0.3)"
                              : "0 2px 8px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                            color: "#ffffff",
                          }}
                          icon={<UserOutlined />}
                        >
                          {member.initials}
                        </Avatar>
                        {selectedMemberIds.includes(member.id.toString()) && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              width: "20px",
                              height: "20px",
                              background: "#10b981",
                              borderRadius: "50%",
                              border: "2px solid #ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                            }}
                          >
                            <CheckCircleOutlined
                              style={{ fontSize: "10px", color: "#fff" }}
                            />
                          </div>
                        )}
                      </div>
                      <Text
                        style={{
                          color: "#374151",
                          fontSize: "13px",
                          fontWeight: selectedMemberIds.includes(
                            member.id.toString()
                          )
                            ? 600
                            : 500,
                          textAlign: "center",
                          lineHeight: "1.2",
                          maxWidth: "80px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {member.name}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#6b7280",
                }}
              >
                <TeamOutlined
                  style={{ fontSize: "40px", marginBottom: "12px" }}
                />
                <div style={{ fontSize: "15px", fontWeight: 500 }}>
                  {searchTerm
                    ? "No members found"
                    : "No family members added yet"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    marginTop: "4px",
                  }}
                >
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Add family members to start sharing health information."}
                </div>
              </div>
            )}

            {/* Share Button */}
            {selectedMemberIds.length > 0 && (
              <Button
                type="primary"
                block
                size="large"
                onClick={onShareToMembers}
                loading={sharingLoading}
                style={{
                  borderRadius: "12px",
                  height: "44px",
                  fontSize: "15px",
                  fontWeight: 600,
                  marginBottom: "20px",
                  background: "#255198ff",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                Share with {selectedMemberIds.length} member
                {selectedMemberIds.length > 1 ? "s" : ""}
              </Button>
            )}

            {/* Email Share Section */}
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    padding: "6px",
                    marginRight: "10px",
                  }}
                >
                  <MailOutlined
                    style={{ color: "#374151", fontSize: "14px" }}
                  />
                </div>
                <Text
                  style={{
                    color: "#374151",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  Or share via email
                </Text>
              </div>

              <Form form={shareForm} onFinish={onShareViaEmail}>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please enter an email address",
                      },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input
                      placeholder="Enter email address"
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "#374151",
                        height: "40px",
                        fontSize: "14px",
                      }}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={sharingLoading}
                    style={{
                      height: "40px",
                      minWidth: "100px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      background: "#10b981",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    Send
                  </Button>
                </div>
              </Form>

              <div
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#6b7280",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <MailOutlined style={{ fontSize: "11px" }} />
                <span>
                  Email will be sent with {itemType.toLowerCase()} details
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <>
      <div
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif',
          background: colors.background,
          color: colors.text,
          lineHeight: "1.6",
          minHeight: "100vh",
          marginTop: isMobile ? "40px" : "50px",
          marginLeft: isMobile ? "0px" : "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: isMobile ? "1rem" : "2rem",
          }}
        >
          {/* Board Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "0.75rem" : "1rem",
              marginBottom: isMobile ? "1rem" : "1rem",
              paddingBottom: isMobile ? "1rem" : "1rem",
              borderBottom: `2px solid ${colors.border}`,
              flexDirection: isMobile ? "column" : "row",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <div
              style={{
                width: isMobile ? "48px" : "56px",
                height: isMobile ? "48px" : "56px",
                background: `linear-gradient(135deg, ${colors.healthLight}, ${colors.healthPrimary})`,
                borderRadius: colors.radius,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? "24px" : "28px",
                boxShadow: shadows.md,
              }}
            >
              ❤️
            </div>
            <h1
              style={{
                fontSize: isMobile ? "1.5rem" : "2rem",
                fontWeight: "700",
                background: `linear-gradient(135deg, ${colors.healthPrimary}, #047857)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              Health & Wellness Dashboard
            </h1>
          </div>

          {/* First Row: Health Summary and Wellness Tasks */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flex: isMobile ? "unset" : "2" }}>
              {/* UPDATED: HealthSummary now receives centralized tracker props */}
              <HealthSummary
                isMobile={isMobile}
                healthInfo={healthData.healthInfo}
                healthInfoLoading={healthData.healthInfoLoading}
                userId={userId}
                username={username}
                onEditHealthInfo={handleOpenHealthInfoModal}
                allergies={healthData.allergies}
                allergiesLoading={healthData.allergiesLoading}
                onAddAllergy={handleOpenAllergyModal}
                onViewAllergy={handleViewAllergy}
                onEditAllergy={handleEditAllergyModal}
                onDeleteAllergy={healthActions.handleDeleteAllergy}
                conditions={healthData.conditions}
                conditionsLoading={healthData.conditionsLoading}
                onAddCondition={handleOpenConditionModal}
                onViewCondition={handleViewCondition}
                onEditCondition={handleEditConditionModal}
                onDeleteCondition={healthActions.handleDeleteCondition}
                familyHistory={healthData.familyHistory}
                familyMembers={healthData.familyMembers}
                familyHistoryStats={healthData.familyHistoryStats}
                familyHistoryLoading={healthData.familyHistoryLoading}
                onAddFamilyHistory={handleOpenFamilyHistoryModal}
                onViewFamilyHistory={handleViewFamilyHistory}
                onEditFamilyHistory={handleEditFamilyHistoryModal}
                onDeleteFamilyHistory={healthActions.handleDeleteFamilyHistory}
                onFitbitConnected={handleFitbitConnected}
                onGarminConnected={handleGarminConnected}
                // NEW: Pass centralized tracker state and actions
                fitbitState={fitbit}
                fitbitActions={fitbit.actions}
                garminState={garmin}
                garminActions={garmin.actions}
              />
            </div>
            <div style={{ flex: isMobile ? "unset" : "1" }}>
              <WellnessTasks
                isMobile={isMobile}
                wellnessTasks={healthData.wellnessTasks}
                wellnessLoading={healthData.wellnessLoading}
                onAddTask={handleOpenWellnessModal}
                onToggleTask={healthActions.handleToggleWellnessTask}
                onEditTask={handleEditWellnessTaskModal}
                onDeleteTask={healthActions.handleDeleteWellnessTask}
                onShareTask={handleShareWellnessTask}
              />
            </div>
          </div>

          {/* Second Row: Health Goals and Medications */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "1rem" : "1rem",
              marginBottom: isMobile ? "1rem" : "1rem",
            }}
          >
            <div style={{ flex: isMobile ? "unset" : "1" }}>
              {/* UPDATED: HealthGoals now receives centralized tracker props */}
              <HealthGoals
                isMobile={isMobile}
                userId={userId}
                username={username}
                onFitbitConnected={handleFitbitConnected}
                onGarminConnected={handleGarminConnected}
                // NEW: Pass centralized tracker state and actions
                fitbitState={fitbit}
                fitbitActions={fitbit.actions}
                garminState={garmin}
                garminActions={garmin.actions}
              />
            </div>
            <div style={{ flex: isMobile ? "unset" : "1" }}>
              <Medications
                isMobile={isMobile}
                medications={healthData.medications}
                medicationsLoading={healthData.medicationsLoading}
                onAddMedication={handleOpenMedicationModal}
                onEditMedication={handleEditMedicationModal}
                onDeleteMedication={healthActions.handleDeleteMedication}
                onShareMedication={handleShareMedication}
              />
            </div>
          </div>

          {/* Third Row: Healthcare Providers and Insurance */}
          <div
            style={{
              marginBottom: isMobile ? "1rem" : "1rem",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <HealthcareSection
              isMobile={isMobile}
              providers={healthData.providers}
              insuranceAccounts={healthData.insuranceAccounts}
              providersLoading={healthData.providersLoading}
              insuranceLoading={healthData.insuranceLoading}
              onAddProvider={handleOpenProviderModal}
              onViewProvider={handleViewProvider}
              onEditProvider={handleEditProviderModal}
              onDeleteProvider={healthActions.handleDeleteProvider}
              onShareProvider={handleShareProvider}
              onAddInsurance={handleOpenInsuranceModal}
              onViewInsurance={handleViewInsurance}
              onEditInsurance={handleEditInsuranceModal}
              onDeleteInsurance={healthActions.handleDeleteInsurance}
              onShareInsurance={handleShareInsurance}
            />
          </div>

          {/* Fourth Row: Bookmarks, Notes, and Files */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flex: isMobile ? "unset" : "1" }}>
              <BookmarkHub hub={"health"} />
            </div>
            <div style={{ flex: isMobile ? "unset" : "1" }}>
              <NotesLists currentHub="health" />
            </div>
            <div style={{ flex: isMobile ? "unset" : "1" }}>
              <FileHub hubName="Health" title="Files" />
            </div>
          </div>
        </div>

        {/* All Modal Components */}
        <MedicationModal
          visible={medicationModalVisible}
          loading={healthData.generalLoading}
          editingData={editingMedication}
          form={medicationForm}
          onCancel={handleMedicationCancel}
          onSubmit={handleMedicationSubmit}
        />

        <WellnessTaskModal
          visible={wellnessModalVisible}
          loading={healthData.generalLoading}
          editingData={editingWellnessTask}
          form={wellnessForm}
          onCancel={handleWellnessCancel}
          onSubmit={handleWellnessTaskSubmit}
        />

        <ProviderModal
          visible={providerModalVisible}
          loading={healthData.generalLoading}
          editingData={editingProvider}
          form={providerForm}
          onCancel={handleProviderCancel}
          onSubmit={handleProviderSubmit}
        />

        <ProviderViewModal
          visible={providerViewModalVisible}
          providerData={viewingProvider}
          onClose={handleProviderViewCancel}
        />

        <InsuranceModal
          visible={insuranceModalVisible}
          loading={healthData.generalLoading}
          editingData={editingInsurance}
          form={insuranceForm}
          onCancel={handleInsuranceCancel}
          onSubmit={handleInsuranceSubmit}
        />

        <InsuranceViewModal
          visible={insuranceViewModalVisible}
          insuranceData={viewingInsurance}
          onClose={handleInsuranceViewCancel}
        />

        <HealthInfoModal
          visible={healthInfoModalVisible}
          loading={healthData.generalLoading}
          healthInfo={healthData.healthInfo}
          form={healthInfoForm}
          onCancel={handleHealthInfoCancel}
          onSubmit={handleHealthInfoSubmit}
        />

        <AllergyModal
          visible={allergyModalVisible}
          loading={healthData.generalLoading}
          editingData={editingAllergy}
          form={allergyForm}
          onCancel={handleAllergyCancel}
          onSubmit={handleAllergySubmit}
        />

        <AllergyViewModal
          visible={allergyViewModalVisible}
          allergyData={viewingAllergy}
          onClose={handleAllergyViewCancel}
        />

        <ConditionModal
          visible={conditionModalVisible}
          loading={healthData.generalLoading}
          editingData={editingCondition}
          form={conditionForm}
          onCancel={handleConditionCancel}
          onSubmit={handleConditionSubmit}
        />

        <ConditionViewModal
          visible={conditionViewModalVisible}
          conditionData={viewingCondition}
          onClose={handleConditionViewCancel}
        />

        <FamilyHistoryModal
          visible={familyHistoryModalVisible}
          loading={healthData.generalLoading}
          editingData={editingFamilyHistory}
          familyMembers={healthData.familyMembers}
          form={familyHistoryForm}
          onCancel={handleFamilyHistoryCancel}
          onSubmit={handleFamilyHistorySubmit}
        />

        <FamilyHistoryViewModal
          visible={familyHistoryViewModalVisible}
          familyHistoryData={viewingFamilyHistory}
          onClose={handleFamilyHistoryViewCancel}
        />

        {/* ==================== TAGGING INTEGRATION - SHARING MODALS ==================== */}

        {/* Medication Sharing Modal */}
        {renderSharingModal(
          medicationShareModalVisible,
          closeSharingModals,
          currentShareMedication,
          handleShareMedicationToMembers,
          handleShareMedicationViaEmail,
          "Medication"
        )}

        {/* Wellness Task Sharing Modal */}
        {renderSharingModal(
          wellnessShareModalVisible,
          closeSharingModals,
          currentShareWellnessTask,
          handleShareWellnessTaskToMembers,
          handleShareWellnessTaskViaEmail,
          "Wellness Task"
        )}

        {/* Provider Sharing Modal */}
        {renderSharingModal(
          providerShareModalVisible,
          closeSharingModals,
          currentShareProvider,
          handleShareProviderToMembers,
          handleShareProviderViaEmail,
          "Healthcare Provider"
        )}

        {/* Insurance Sharing Modal */}
        {renderSharingModal(
          insuranceShareModalVisible,
          closeSharingModals,
          currentShareInsurance,
          handleShareInsuranceToMembers,
          handleShareInsuranceViaEmail,
          "Insurance Account"
        )}
      </div>
    </>
  );
};

export default HealthDashboard;
