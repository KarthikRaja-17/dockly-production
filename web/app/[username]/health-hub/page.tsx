// HealthDashboard.tsx - Refactored and streamlined with Fitbit Callback
"use client";

import React, { useEffect, useState } from "react";
import { Form } from "antd";
import { useRouter } from "next/navigation";

// Import custom hook and types
import { useHealthData } from "../../../hooks/useHealthData";
import {
  MedicationData,
  WellnessTaskData,
  HealthcareProviderData,
  InsuranceAccountData,
  colors,
  shadows,
} from "../../../services/health/types";

import {
  HealthSummaryInfoData,
  UserAllergyData,
  UserConditionData,
  FamilyMedicalHistoryData,
} from '../../../services/health/healthSummary';

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

const HealthDashboard = () => {
  const router = useRouter();

  // Mobile detection state
  const [isMobile, setIsMobile] = useState(false);

  // User data
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // Custom hook for all health data management
  const [healthData, healthActions] = useHealthData();

  // Modal visibility states
  const [medicationModalVisible, setMedicationModalVisible] = useState(false);
  const [wellnessModalVisible, setWellnessModalVisible] = useState(false);
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [providerViewModalVisible, setProviderViewModalVisible] = useState(false);
  const [insuranceModalVisible, setInsuranceModalVisible] = useState(false);
  const [insuranceViewModalVisible, setInsuranceViewModalVisible] = useState(false);
  const [healthInfoModalVisible, setHealthInfoModalVisible] = useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [allergyViewModalVisible, setAllergyViewModalVisible] = useState(false);
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [conditionViewModalVisible, setConditionViewModalVisible] = useState(false);
  const [familyHistoryModalVisible, setFamilyHistoryModalVisible] = useState(false);
  const [familyHistoryViewModalVisible, setFamilyHistoryViewModalVisible] = useState(false);

  // Editing states for modals
  const [editingMedication, setEditingMedication] = useState<MedicationData | null>(null);
  const [editingWellnessTask, setEditingWellnessTask] = useState<WellnessTaskData | null>(null);
  const [editingProvider, setEditingProvider] = useState<HealthcareProviderData | null>(null);
  const [viewingProvider, setViewingProvider] = useState<HealthcareProviderData | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceAccountData | null>(null);
  const [viewingInsurance, setViewingInsurance] = useState<InsuranceAccountData | null>(null);
  const [editingAllergy, setEditingAllergy] = useState<UserAllergyData | null>(null);
  const [viewingAllergy, setViewingAllergy] = useState<UserAllergyData | null>(null);
  const [editingCondition, setEditingCondition] = useState<UserConditionData | null>(null);
  const [viewingCondition, setViewingCondition] = useState<UserConditionData | null>(null);
  const [editingFamilyHistory, setEditingFamilyHistory] = useState<FamilyMedicalHistoryData | null>(null);
  const [viewingFamilyHistory, setViewingFamilyHistory] = useState<FamilyMedicalHistoryData | null>(null);

  // Form instances for modals
  const [medicationForm] = Form.useForm();
  const [wellnessForm] = Form.useForm();
  const [providerForm] = Form.useForm();
  const [insuranceForm] = Form.useForm();
  const [healthInfoForm] = Form.useForm();
  const [allergyForm] = Form.useForm();
  const [conditionForm] = Form.useForm();
  const [familyHistoryForm] = Form.useForm();

  // ✅ SOLUTION 2: Add Fitbit connection callback handler
  const handleFitbitConnected = async () => {
    console.log('DEBUG: Fitbit connection callback triggered, refreshing all health data...');
    try {
      // Refresh all health data including any potential Fitbit-related data
      await healthActions.loadAllHealthData();
      console.log('DEBUG: Health data refresh completed after Fitbit connection');
    } catch (error) {
      console.error('DEBUG: Error refreshing health data after Fitbit connection:', error);
    }
  };

  // Initialize user data and mobile detection
  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    const userId = localStorage.getItem("userId") || "";
    setUsername(username);
    setUserId(userId);

    if (localStorage.getItem('health') === null) {
      // router.push(`/${username}/health-hub/setup`);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Modal handlers for opening
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

  const handleOpenFamilyHistoryModal = () => {
    setEditingFamilyHistory(null);
    setFamilyHistoryModalVisible(true);
    familyHistoryForm.resetFields();
  };

  // Modal handlers for editing
  const handleEditMedicationModal = (medication: MedicationData) => {
    setEditingMedication(medication);
    medicationForm.setFieldsValue(medication);
    setMedicationModalVisible(true);
  };

  const handleEditWellnessTaskModal = (task: WellnessTaskData) => {
    setEditingWellnessTask(task);
    wellnessForm.setFieldsValue(task);
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

  const handleEditFamilyHistoryModal = (history: FamilyMedicalHistoryData) => {
    setEditingFamilyHistory(history);
    familyHistoryForm.setFieldsValue(history);
    setFamilyHistoryModalVisible(true);
  };

  // Modal submit handlers
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
      await healthActions.handleEditMedication(editingMedication.id!, medicationData);
    } else {
      await healthActions.handleAddMedication(medicationData);
    }

    setMedicationModalVisible(false);
    setEditingMedication(null);
    // Clear form completely and reset to default values
    medicationForm.resetFields();
    medicationForm.setFieldsValue({
      name: "",
      dosage: "",
      conditionTreated: "",
      prescribingDoctor: "",
      schedule: "Once Daily",
      refillDaysLeft: 30,
      icon: "💊",
    });
  };

  const handleWellnessTaskSubmit = async (values: any) => {
    const taskData: WellnessTaskData = {
      icon: values.icon || "✅",
      text: values.text,
      date: values.date,
      recurring: values.recurring || false,
      details: values.details || "",
      completed: false,
    };

    if (editingWellnessTask) {
      await healthActions.handleEditWellnessTask(editingWellnessTask.id!, taskData);
    } else {
      await healthActions.handleAddWellnessTask(taskData);
    }

    setWellnessModalVisible(false);
    setEditingWellnessTask(null);
    // Clear form completely and reset to default values
    wellnessForm.resetFields();
    wellnessForm.setFieldsValue({
      text: "",
      date: "Daily",
      recurring: false,
      details: "",
      icon: "✅",
    });
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
    // Clear form completely and reset to default values
    providerForm.resetFields();
    providerForm.setFieldsValue({
      name: "",
      specialty: "",
      phone: "",
      practiceName: "",
      address: "",
      icon: "👨‍⚕️",
      notes: "",
    });
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
      await healthActions.handleEditInsurance(editingInsurance.id!, insuranceData);
    } else {
      await healthActions.handleAddInsurance(insuranceData);
    }

    setInsuranceModalVisible(false);
    setEditingInsurance(null);
    // Clear form completely and reset to default values
    insuranceForm.resetFields();
    insuranceForm.setFieldsValue({
      providerName: "",
      planName: "",
      accountType: "insurance",
      details: [],
      contactInfo: "",
      logoText: "INS",
      gradientStyle: "linear-gradient(135deg, #dbeafe, #e0e7ff)",
      notes: "",
    });
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
    // Clear form completely and reset to default values
    allergyForm.resetFields();
    allergyForm.setFieldsValue({
      allergyName: '',
      severityLevel: 'mild',
      allergyType: '',
      reactionSymptoms: '',
      notes: ''
    });
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
      await healthActions.handleEditCondition(editingCondition.id!, conditionData);
    } else {
      await healthActions.handleAddCondition(conditionData);
    }

    setConditionModalVisible(false);
    setEditingCondition(null);
    // Clear form completely and reset to default values
    conditionForm.resetFields();
    conditionForm.setFieldsValue({
      conditionName: '',
      status: 'active',
      diagnosisDate: '',
      treatingDoctor: '',
      notes: ''
    });
  };

  const handleFamilyHistorySubmit = async (values: any) => {
    const historyData: FamilyMedicalHistoryData = {
      familyMemberRelation: values.familyMemberRelation,
      conditionName: values.conditionName,
      ageOfOnset: values.ageOfOnset,
      status: values.status,
      notes: values.notes,
    };

    if (editingFamilyHistory) {
      await healthActions.handleEditFamilyHistory(editingFamilyHistory.id!, historyData);
    } else {
      await healthActions.handleAddFamilyHistory(historyData);
    }

    setFamilyHistoryModalVisible(false);
    setEditingFamilyHistory(null);
    // Clear form completely and reset to default values
    familyHistoryForm.resetFields();
    familyHistoryForm.setFieldsValue({
      familyMemberRelation: '',
      conditionName: '',
      ageOfOnset: null,
      status: '',
      notes: ''
    });
  };

  // Modal cancel handlers
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: isMobile ? '1rem' : '1rem',
            marginBottom: isMobile ? '1rem' : '1rem'
          }}>
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
              familyHistoryLoading={healthData.familyHistoryLoading}
              onAddFamilyHistory={handleOpenFamilyHistoryModal}
              onViewFamilyHistory={handleViewFamilyHistory}
              onEditFamilyHistory={handleEditFamilyHistoryModal}
              onDeleteFamilyHistory={healthActions.handleDeleteFamilyHistory}
              onFitbitConnected={handleFitbitConnected} // ✅ SOLUTION 2: Pass callback to HealthSummary

            />
            <WellnessTasks
              isMobile={isMobile}
              wellnessTasks={healthData.wellnessTasks}
              wellnessLoading={healthData.wellnessLoading}
              onAddTask={handleOpenWellnessModal}
              onToggleTask={healthActions.handleToggleWellnessTask}
              onEditTask={handleEditWellnessTaskModal}
              onDeleteTask={healthActions.handleDeleteWellnessTask}
            />
          </div>

          {/* Second Row: Health Goals and Medications */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? "1rem" : "1rem",
              marginBottom: isMobile ? "1rem" : "1rem",
            }}
          >
            <HealthGoals isMobile={isMobile} userId={""} username={""} />
            <Medications
              isMobile={isMobile}
              medications={healthData.medications}
              medicationsLoading={healthData.medicationsLoading}
              onAddMedication={handleOpenMedicationModal}
              onEditMedication={handleEditMedicationModal}
              onDeleteMedication={healthActions.handleDeleteMedication}
            />
          </div>

          {/* Third Row: Healthcare Providers and Insurance */}
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
            onAddInsurance={handleOpenInsuranceModal}
            onViewInsurance={handleViewInsurance}
            onEditInsurance={handleEditInsuranceModal}
            onDeleteInsurance={healthActions.handleDeleteInsurance}
          />
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
          form={familyHistoryForm}
          onCancel={handleFamilyHistoryCancel}
          onSubmit={handleFamilyHistorySubmit}
        />

        <FamilyHistoryViewModal
          visible={familyHistoryViewModalVisible}
          familyHistoryData={viewingFamilyHistory}
          onClose={handleFamilyHistoryViewCancel}
        />
      </div>
    </>
  );
};

export default HealthDashboard;