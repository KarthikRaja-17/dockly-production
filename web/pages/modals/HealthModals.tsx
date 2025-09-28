// Enhanced HealthModals.tsx - Updated with conditional date fields for wellness tasks
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Button,
  Space,
  DatePicker,
  Alert,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  MedicationData,
  WellnessTaskData,
  HealthcareProviderData,
  InsuranceAccountData,
  FamilyMemberForHealth,
} from "../../services/health/types";
import {
  HealthSummaryInfoData,
  UserAllergyData,
  UserConditionData,
  FamilyMedicalHistoryData,
  FAMILY_RELATIONS,
  ALLERGY_TYPES,
  CONDITION_STATUSES,
  SEVERITY_LEVELS,
} from "../../services/health/healthSummary";
import { validateWellnessTaskDates } from "../../services/health/wellness";

// Medication Modal
interface MedicationModalProps {
  visible: boolean;
  loading: boolean;
  editingData: MedicationData | null;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
  visible,
  loading,
  editingData,
  form,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title={editingData ? "Edit Medication" : "Add New Medication"}
    open={visible}
    onCancel={onCancel}
    onOk={() => form.submit()}
    confirmLoading={loading}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={
        editingData || {
          name: "",
          dosage: "",
          conditionTreated: "",
          prescribingDoctor: "",
          schedule: "Once Daily",
          refillDaysLeft: 30,
          icon: "💊",
        }
      }
    >
      <Form.Item
        name="name"
        label="Medication Name"
        rules={[{ required: true, message: "Please enter medication name" }]}
      >
        <Input placeholder="e.g., Zyrtec, Lisinopril, Albuterol" />
      </Form.Item>

      <Form.Item
        name="dosage"
        label="Dosage"
        rules={[{ required: true, message: "Please enter dosage" }]}
      >
        <Input placeholder="e.g., 10mg, 90mcg, 1000mg" />
      </Form.Item>

      <Form.Item
        name="conditionTreated"
        label="Condition Treated"
        rules={[{ required: true, message: "Please enter condition" }]}
      >
        <Input placeholder="e.g., Allergies, Blood Pressure, Asthma" />
      </Form.Item>

      <Form.Item name="prescribingDoctor" label="Prescribing Doctor">
        <Input placeholder="e.g., Dr. Williams, Dr. Chen" />
      </Form.Item>

      <Form.Item
        name="schedule"
        label="Schedule"
        rules={[{ required: true, message: "Please select schedule" }]}
      >
        <Select>
          <Select.Option value="Once Daily">Once Daily</Select.Option>
          <Select.Option value="Twice Daily">Twice Daily</Select.Option>
          <Select.Option value="Three Times Daily">
            Three Times Daily
          </Select.Option>
          <Select.Option value="As Needed">As Needed</Select.Option>
          <Select.Option value="Weekly">Weekly</Select.Option>
          <Select.Option value="Every Other Day">Every Other Day</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="refillDaysLeft"
        label="Days Until Refill Needed"
        rules={[{ required: true, message: "Please enter refill days" }]}
      >
        <InputNumber min={0} max={365} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="icon" label="Type of Medication">
        <Select defaultValue="💊">
          <Select.Option value="💊">💊 Pill</Select.Option>
          <Select.Option value="💨">💨 Inhaler</Select.Option>
          <Select.Option value="🌟">🌟 Supplement</Select.Option>
          <Select.Option value="☀️">☀️ Vitamin</Select.Option>
          <Select.Option value="🟡">🟡 Capsule</Select.Option>
          <Select.Option value="💉">💉 Injection</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  </Modal>
);

// UPDATED: Wellness Task Modal with Conditional Date Fields
interface WellnessTaskModalProps {
  visible: boolean;
  loading: boolean;
  editingData: WellnessTaskData | null;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const WellnessTaskModal: React.FC<WellnessTaskModalProps> = ({
  visible,
  loading,
  editingData,
  form,
  onCancel,
  onSubmit,
}) => {
  // NEW: State for conditional date field visibility
  const [isRecurring, setIsRecurring] = useState(false);
  const [dateValidation, setDateValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });

  // NEW: Watch form values for date validation
  const startDate = Form.useWatch("startDate", form);
  const dueDate = Form.useWatch("dueDate", form);
  const recurring = Form.useWatch("recurring", form);

  // NEW: Update recurring state and validate dates
  useEffect(() => {
    setIsRecurring(recurring || false);

    // Validate dates when they change
    const validation = validateWellnessTaskDates(startDate, dueDate, recurring);
    setDateValidation(validation);
  }, [startDate, dueDate, recurring]);

  // NEW: Initialize form values based on editing data
  useEffect(() => {
    if (visible) {
      if (editingData) {
        setIsRecurring(editingData.recurring || false);
        form.setFieldsValue({
          text: editingData.text,
          // Handle legacy date field
          date: editingData.date,
          // NEW: Handle new date fields
          startDate:
            editingData.start_date || editingData.startDate
              ? dayjs(editingData.start_date || editingData.startDate)
              : undefined,
          dueDate:
            editingData.due_date || editingData.dueDate
              ? dayjs(editingData.due_date || editingData.dueDate)
              : undefined,
          recurring: editingData.recurring || false,
          details: editingData.details || "",
          icon: editingData.icon || "✅",
        });
      } else {
        // Default values for new task
        setIsRecurring(false);
        form.setFieldsValue({
          text: "",
          date: "Daily",
          startDate: undefined,
          dueDate: undefined,
          recurring: false,
          details: "",
          icon: "✅",
        });
      }
    }
  }, [visible, editingData, form]);

  // NEW: Handle recurring toggle
  const handleRecurringChange = (checked: boolean) => {
    setIsRecurring(checked);

    // Clear date validation when toggling
    if (!checked) {
      setDateValidation({ isValid: true, errors: [], warnings: [] });
    }
  };

  // NEW: Enhanced form submission with date handling
  const handleSubmit = async (values: any) => {
    // Prepare the data with proper date formatting
    const submissionData: any = {
      text: values.text,
      recurring: values.recurring || false,
      details: values.details || "",
      icon: values.icon || "✅",
    };

    if (values.recurring) {
      // For recurring tasks, use the new date fields
      if (values.startDate) {
        submissionData.start_date = values.startDate.format("YYYY-MM-DD");
        submissionData.startDate = values.startDate.format("YYYY-MM-DD");
      }
      if (values.dueDate) {
        submissionData.due_date = values.dueDate.format("YYYY-MM-DD");
        submissionData.dueDate = values.dueDate.format("YYYY-MM-DD");
      }
    } else {
      // For non-recurring tasks, use legacy date field or convert from new fields
      if (values.date) {
        submissionData.date = values.date;
      } else if (values.dueDate) {
        submissionData.date = values.dueDate.format("YYYY-MM-DD");
      }

      // Also include new date fields if provided for non-recurring tasks
      if (values.startDate) {
        submissionData.start_date = values.startDate.format("YYYY-MM-DD");
        submissionData.startDate = values.startDate.format("YYYY-MM-DD");
      }
      if (values.dueDate) {
        submissionData.due_date = values.dueDate.format("YYYY-MM-DD");
        submissionData.dueDate = values.dueDate.format("YYYY-MM-DD");
      }
    }

    await onSubmit(submissionData);
  };

  return (
    <Modal
      title={editingData ? "Edit Wellness Task" : "Add New Wellness Task"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="text"
          label="Task Description"
          rules={[{ required: true, message: "Please enter task description" }]}
        >
          <Input placeholder="e.g., Schedule dental cleaning, Morning workout routine" />
        </Form.Item>

        <Form.Item name="details" label="Additional Details">
          <Input.TextArea
            rows={3}
            placeholder="e.g., 6-month cleaning due. Dr. Johnson at Brightsmile Dental. Last cleaning: Oct 2024."
          />
        </Form.Item>

        {/* NEW: Recurring Task Toggle */}
        <Form.Item
          name="recurring"
          label="Recurring Task"
          valuePropName="checked"
          // extra="Enable recurring to set specific start and due dates with reminder notifications"
        >
          <Switch onChange={handleRecurringChange} />
        </Form.Item>

        {/* CONDITIONAL: Show different date fields based on recurring status */}
        {isRecurring ? (
          <>
            <div style={{ display: "flex", gap: "16px" }}>
              <Form.Item
                name="startDate"
                label="Start Date"
                style={{ flex: 1 }}
                rules={[
                  {
                    required: true,
                    message: "Start date is required for recurring tasks",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Select start date"
                  // UPDATED: No date restrictions for start date
                />
              </Form.Item>

              <Form.Item
                name="dueDate"
                label="Due Date"
                style={{ flex: 1 }}
                rules={[
                  {
                    required: true,
                    message: "Due date is required for recurring tasks",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Select due date"
                  // UPDATED: Due date must be after start date
                  disabledDate={(current) => {
                    if (!startDate) return false;
                    return current && current <= startDate.startOf("day");
                  }}
                />
              </Form.Item>
            </div>

            {/* NEW: Date validation feedback */}
            {!dateValidation.isValid && (
              <Alert
                message="Date Validation Error"
                description={dateValidation.errors.join(", ")}
                type="error"
                showIcon
                style={{ marginBottom: "16px" }}
              />
            )}

            {dateValidation.warnings.length > 0 && (
              <Alert
                message="Date Warning"
                description={dateValidation.warnings.join(", ")}
                type="warning"
                showIcon
                style={{ marginBottom: "16px" }}
              />
            )}
          </>
        ) : (
          <></>
        )}

        <Form.Item name="icon" label="Category">
          <Select defaultValue="✅">
            <Select.Option value="✅">✅ Task</Select.Option>
            <Select.Option value="🦷">🦷 Dental</Select.Option>
            <Select.Option value="👁️">👁️ Vision</Select.Option>
            <Select.Option value="💊">💊 Medication</Select.Option>
            <Select.Option value="🏃">🏃 Exercise</Select.Option>
            <Select.Option value="🩺">🩺 Medical</Select.Option>
            <Select.Option value="💉">💉 Vaccination</Select.Option>
            <Select.Option value="🧘">🧘 Wellness</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Healthcare Provider Modal
interface ProviderModalProps {
  visible: boolean;
  loading: boolean;
  editingData: HealthcareProviderData | null;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({
  visible,
  loading,
  editingData,
  form,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title={
      editingData ? "Edit Healthcare Provider" : "Add New Healthcare Provider"
    }
    open={visible}
    onCancel={onCancel}
    onOk={() => form.submit()}
    confirmLoading={loading}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={
        editingData || {
          name: "",
          specialty: "",
          phone: "",
          practiceName: "",
          address: "",
          icon: "👨‍⚕️",
          notes: "",
        }
      }
    >
      <Form.Item
        name="name"
        label="Doctor/Provider Name"
        rules={[{ required: true, message: "Please enter provider name" }]}
      >
        <Input placeholder="e.g., Dr. Robert Williams" />
      </Form.Item>

      <Form.Item
        name="specialty"
        label="Specialty"
        rules={[{ required: true, message: "Please enter specialty" }]}
      >
        <Input placeholder="e.g., Primary Care Physician, Dermatologist, Dentist" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[{ required: true, message: "Please enter phone number" }]}
      >
        <Input placeholder="e.g., (555) 123-4567" />
      </Form.Item>

      <Form.Item name="practiceName" label="Practice/Clinic Name">
        <Input placeholder="e.g., Springfield Medical Group, Westside Dermatology" />
      </Form.Item>

      <Form.Item name="address" label="Address">
        <Input.TextArea
          rows={2}
          placeholder="e.g., 123 Main St, Springfield, IL 62701"
        />
      </Form.Item>

      <Form.Item name="notes" label="Additional Notes">
        <Input.TextArea
          rows={3}
          placeholder="e.g., Preferred appointment times, special instructions, etc."
        />
      </Form.Item>

      <Form.Item name="icon" label="Your Healthcare Provider">
        <Select defaultValue="👨‍⚕️">
          <Select.Option value="🦷">🦷 Dentist</Select.Option>
          <Select.Option value="👁️">👁️ Ophthalmologist</Select.Option>
          <Select.Option value="🩺">🩺 General Practice</Select.Option>
          <Select.Option value="💉">💉 Specialist</Select.Option>
          <Select.Option value="🧬">🧬 Laboratory</Select.Option>
          <Select.Option value="🏥">🏥 Hospital</Select.Option>
          <Select.Option value="👶">👶 Pediatrician</Select.Option>
          <Select.Option value="👩‍⚕️">👩‍⚕️ Gynecologist</Select.Option>
          <Select.Option value="🧠">🧠 Neurologist</Select.Option>
          <Select.Option value="❤️">❤️ Cardiologist</Select.Option>
          <Select.Option value="🫁">🫁 Pulmonologist</Select.Option>
          <Select.Option value="🦴">🦴 Orthopedist</Select.Option>
          <Select.Option value="🍎">🍎 Nutritionist</Select.Option>
          <Select.Option value="🧑‍⚕️">🧑‍⚕️ Dermatologist</Select.Option>
          <Select.Option value="⚕️">⚕️ Psychiatrist</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  </Modal>
);

// Healthcare Provider View Modal (Read-only)
interface ProviderViewModalProps {
  visible: boolean;
  providerData: HealthcareProviderData | null;
  onClose: () => void;
}

export const ProviderViewModal: React.FC<ProviderViewModalProps> = ({
  visible,
  providerData,
  onClose,
}) => (
  <Modal
    title="Healthcare Provider Details"
    open={visible}
    onCancel={onClose}
    footer={[
      <Button key="close" onClick={onClose}>
        Close
      </Button>,
    ]}
    width={600}
  >
    {providerData && (
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Provider Name:
          </strong>
          <span>{providerData.name}</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Specialty:
          </strong>
          <span>{providerData.specialty}</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Phone Number:
          </strong>
          <span>{providerData.phone}</span>
        </div>

        {providerData.practiceName && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Practice/Clinic Name:
            </strong>
            <span>{providerData.practiceName}</span>
          </div>
        )}

        {providerData.address && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Address:
            </strong>
            <span style={{ whiteSpace: "pre-wrap" }}>
              {providerData.address}
            </span>
          </div>
        )}

        {providerData.notes && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Additional Notes:
            </strong>
            <span style={{ whiteSpace: "pre-wrap" }}>{providerData.notes}</span>
          </div>
        )}
      </div>
    )}
  </Modal>
);

// Insurance Account Modal
interface InsuranceModalProps {
  visible: boolean;
  loading: boolean;
  editingData: InsuranceAccountData | null;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const InsuranceModal: React.FC<InsuranceModalProps> = ({
  visible,
  loading,
  editingData,
  form,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title={editingData ? "Edit Insurance Account" : "Add New Insurance Account"}
    open={visible}
    onCancel={onCancel}
    onOk={() => form.submit()}
    confirmLoading={loading}
    width={700}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={
        editingData || {
          providerName: "",
          planName: "",
          accountType: "insurance",
          details: [],
          contactInfo: "",
          logoText: "INS",
          gradientStyle: "linear-gradient(135deg, #dbeafe, #e0e7ff)",
          notes: "",
        }
      }
    >
      <Form.Item
        name="providerName"
        label="Provider Name"
        rules={[{ required: true, message: "Please enter provider name" }]}
      >
        <Input placeholder="e.g., Blue Cross Blue Shield, Fidelity HSA" />
      </Form.Item>

      <Form.Item
        name="planName"
        label="Plan Name"
        rules={[{ required: true, message: "Please enter plan name" }]}
      >
        <Input placeholder="e.g., PPO Family Plan, Health Savings Account" />
      </Form.Item>

      <Form.Item name="accountType" label="Account Type">
        <Select>
          <Select.Option value="insurance">Insurance</Select.Option>
          <Select.Option value="hsa">
            Health Savings Account (HSA)
          </Select.Option>
          <Select.Option value="fsa">
            Flexible Spending Account (FSA)
          </Select.Option>
          <Select.Option value="dental">Dental Insurance</Select.Option>
          <Select.Option value="vision">Vision Insurance</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Account Details">
        <Form.List name="details">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "label"]}
                    rules={[{ required: true, message: "Missing label" }]}
                  >
                    <Input placeholder="e.g., Member ID, Deductible" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "value"]}
                    rules={[{ required: true, message: "Missing value" }]}
                  >
                    <Input placeholder="e.g., XGH4872094, $1,500/yr" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Detail
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item name="contactInfo" label="Contact Information">
        <Input placeholder="e.g., Customer Service: 1-800-555-BCBS" />
      </Form.Item>

      <Form.Item name="logoText" label="Logo Text (2-3 characters)">
        <Input placeholder="e.g., BC, HSA, INS" maxLength={5} />
      </Form.Item>

      <Form.Item name="gradientStyle" label="Card Color Theme">
        <Select>
          <Select.Option value="linear-gradient(135deg, #dbeafe, #e0e7ff)">
            Blue Theme
          </Select.Option>
          <Select.Option value="linear-gradient(135deg, #d1fae5, #a7f3d0)">
            Green Theme
          </Select.Option>
          <Select.Option value="linear-gradient(135deg, #fecaca, #fca5a5)">
            Red Theme
          </Select.Option>
          <Select.Option value="linear-gradient(135deg, #fed7aa, #fdba74)">
            Orange Theme
          </Select.Option>
          <Select.Option value="linear-gradient(135deg, #e9d5ff, #c4b5fd)">
            Purple Theme
          </Select.Option>
          <Select.Option value="linear-gradient(135deg, #fef3c7, #fde68a)">
            Yellow Theme
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="notes" label="Additional Notes">
        <Input.TextArea
          rows={3}
          placeholder="Any additional information about this account..."
        />
      </Form.Item>
    </Form>
  </Modal>
);

// Insurance Account View Modal (Read-only)
interface InsuranceViewModalProps {
  visible: boolean;
  insuranceData: InsuranceAccountData | null;
  onClose: () => void;
}

export const InsuranceViewModal: React.FC<InsuranceViewModalProps> = ({
  visible,
  insuranceData,
  onClose,
}) => (
  <Modal
    title="Insurance Account Details"
    open={visible}
    onCancel={onClose}
    footer={[
      <Button key="close" onClick={onClose}>
        Close
      </Button>,
    ]}
    width={700}
  >
    {insuranceData && (
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Provider Name:
          </strong>
          <span>{insuranceData.providerName}</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Plan Name:
          </strong>
          <span>{insuranceData.planName}</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Account Type:
          </strong>
          <span style={{ textTransform: "capitalize" }}>
            {insuranceData.accountType}
          </span>
        </div>

        {insuranceData.details && insuranceData.details.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "8px" }}>
              Account Details:
            </strong>
            <div style={{ paddingLeft: "16px" }}>
              {insuranceData.details.map((detail: any, index: any) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  <strong>{detail.label}:</strong> {detail.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {insuranceData.contactInfo && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Contact Information:
            </strong>
            <span>{insuranceData.contactInfo}</span>
          </div>
        )}

        {insuranceData.logoText && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Logo Text:
            </strong>
            <span>{insuranceData.logoText}</span>
          </div>
        )}

        {insuranceData.notes && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Additional Notes:
            </strong>
            <span style={{ whiteSpace: "pre-wrap" }}>
              {insuranceData.notes}
            </span>
          </div>
        )}
      </div>
    )}
  </Modal>
);

// Health Info Modal
interface HealthInfoModalProps {
  visible: boolean;
  loading: boolean;
  healthInfo: HealthSummaryInfoData;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const HealthInfoModal: React.FC<HealthInfoModalProps> = ({
  visible,
  loading,
  healthInfo,
  form,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title="Edit Health Information"
    open={visible}
    onCancel={onCancel}
    onOk={() => form.submit()}
    confirmLoading={loading}
    width={600}
  >
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item
        name="bloodType"
        label="Blood Type"
        rules={[{ required: true, message: "Please select blood type" }]}
      >
        <Select placeholder="Select blood type">
          <Select.Option value="A+">A+</Select.Option>
          <Select.Option value="A-">A-</Select.Option>
          <Select.Option value="B+">B+</Select.Option>
          <Select.Option value="B-">B-</Select.Option>
          <Select.Option value="AB+">AB+</Select.Option>
          <Select.Option value="AB-">AB-</Select.Option>
          <Select.Option value="O+">O+</Select.Option>
          <Select.Option value="O-">O-</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="dateOfBirth"
        label="Date of Birth"
        rules={[{ required: true, message: "Please enter date of birth" }]}
      >
        <Input type="date" />
      </Form.Item>

      <Form.Item
        name="height"
        label="Height"
        rules={[{ required: true, message: "Please enter height" }]}
      >
        <Input placeholder="e.g., 5'11&quot;, 180cm" />
      </Form.Item>

      <Form.Item
        name="emergencyContactName"
        label="Emergency Contact Name"
        rules={[
          { required: true, message: "Please enter emergency contact name" },
        ]}
      >
        <Input placeholder="e.g., Sarah Smith" />
      </Form.Item>

      <Form.Item
        name="emergencyContactPhone"
        label="Emergency Contact Phone"
        rules={[
          { required: true, message: "Please enter emergency contact phone" },
        ]}
      >
        <Input placeholder="e.g., (555) 123-4567" />
      </Form.Item>

      <Form.Item
        name="primaryDoctor"
        label="Primary Doctor"
        rules={[{ required: true, message: "Please enter primary doctor" }]}
      >
        <Input placeholder="e.g., Dr. Robert Williams" />
      </Form.Item>

      <Form.Item
        name="medicalRecordNumber"
        label="Medical Record Number"
        rules={[
          { required: true, message: "Please enter medical record number" },
        ]}
      >
        <Input placeholder="e.g., MRN-4829573" />
      </Form.Item>
    </Form>
  </Modal>
);

// Allergy Modal
interface AllergyModalProps {
  visible: boolean;
  loading: boolean;
  editingData: UserAllergyData | null;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const AllergyModal: React.FC<AllergyModalProps> = ({
  visible,
  loading,
  editingData,
  form,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title={editingData ? "Edit Allergy" : "Add New Allergy"}
    open={visible}
    onCancel={onCancel}
    onOk={() => form.submit()}
    confirmLoading={loading}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={
        editingData || {
          allergyName: "",
          severityLevel: "mild",
          allergyType: "",
          reactionSymptoms: "",
          notes: "",
        }
      }
    >
      <Form.Item
        name="allergyName"
        label="Allergy Name"
        rules={[{ required: true, message: "Please enter allergy name" }]}
      >
        <Input placeholder="e.g., Penicillin, Tree Nuts, Pollen" />
      </Form.Item>

      <Form.Item
        name="severityLevel"
        label="Severity Level"
        rules={[{ required: true, message: "Please select severity level" }]}
      >
        <Select>
          {SEVERITY_LEVELS.map((level: any) => (
            <Select.Option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="allergyType" label="Allergy Type">
        <Select placeholder="Select allergy type">
          {ALLERGY_TYPES.map((type: any) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="reactionSymptoms" label="Reaction Symptoms">
        <Input.TextArea
          rows={3}
          placeholder="e.g., Rash, difficulty breathing, swelling"
        />
      </Form.Item>

      <Form.Item name="notes" label="Additional Notes">
        <Input.TextArea
          rows={3}
          placeholder="Any additional information about this allergy"
        />
      </Form.Item>
    </Form>
  </Modal>
);

// Allergy View Modal (Read-only)
interface AllergyViewModalProps {
  visible: boolean;
  allergyData: UserAllergyData | null;
  onClose: () => void;
}

export const AllergyViewModal: React.FC<AllergyViewModalProps> = ({
  visible,
  allergyData,
  onClose,
}) => (
  <Modal
    title="Allergy Details"
    open={visible}
    onCancel={onClose}
    footer={[
      <Button key="close" onClick={onClose}>
        Close
      </Button>,
    ]}
    width={600}
  >
    {allergyData && (
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Allergy Name:
          </strong>
          <span>{allergyData.allergyName}</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Severity Level:
          </strong>
          <span style={{ textTransform: "capitalize" }}>
            {allergyData.severityLevel}
          </span>
        </div>

        {allergyData.allergyType && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Allergy Type:
            </strong>
            <span>{allergyData.allergyType}</span>
          </div>
        )}

        {allergyData.reactionSymptoms && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Reaction Symptoms:
            </strong>
            <span>{allergyData.reactionSymptoms}</span>
          </div>
        )}

        {allergyData.notes && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Additional Notes:
            </strong>
            <span>{allergyData.notes}</span>
          </div>
        )}
      </div>
    )}
  </Modal>
);

// Condition Modal
interface ConditionModalProps {
  visible: boolean;
  loading: boolean;
  editingData: UserConditionData | null;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const ConditionModal: React.FC<ConditionModalProps> = ({
  visible,
  loading,
  editingData,
  form,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title={editingData ? "Edit Condition" : "Add New Condition"}
    open={visible}
    onCancel={onCancel}
    onOk={() => form.submit()}
    confirmLoading={loading}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={
        editingData || {
          conditionName: "",
          status: "active",
          diagnosisDate: "",
          treatingDoctor: "",
          notes: "",
        }
      }
    >
      <Form.Item
        name="conditionName"
        label="Condition Name"
        rules={[{ required: true, message: "Please enter condition name" }]}
      >
        <Input placeholder="e.g., Mild Asthma, Hypertension, Diabetes" />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: "Please select status" }]}
      >
        <Select>
          {CONDITION_STATUSES.map((status: any) => (
            <Select.Option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="diagnosisDate" label="Diagnosis Date">
        <Input type="date" />
      </Form.Item>

      <Form.Item name="treatingDoctor" label="Treating Doctor">
        <Input placeholder="e.g., Dr. Williams, Dr. Chen" />
      </Form.Item>

      <Form.Item name="notes" label="Additional Notes">
        <Input.TextArea
          rows={3}
          placeholder="Any additional information about this condition"
        />
      </Form.Item>
    </Form>
  </Modal>
);

// Condition View Modal (Read-only)
interface ConditionViewModalProps {
  visible: boolean;
  conditionData: UserConditionData | null;
  onClose: () => void;
}

export const ConditionViewModal: React.FC<ConditionViewModalProps> = ({
  visible,
  conditionData,
  onClose,
}) => (
  <Modal
    title="Condition Details"
    open={visible}
    onCancel={onClose}
    footer={[
      <Button key="close" onClick={onClose}>
        Close
      </Button>,
    ]}
    width={600}
  >
    {conditionData && (
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Condition Name:
          </strong>
          <span>{conditionData.conditionName}</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Status:
          </strong>
          <span style={{ textTransform: "capitalize" }}>
            {conditionData.status}
          </span>
        </div>

        {conditionData.diagnosisDate && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Diagnosis Date:
            </strong>
            <span>
              {new Date(conditionData.diagnosisDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {conditionData.treatingDoctor && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Treating Doctor:
            </strong>
            <span>{conditionData.treatingDoctor}</span>
          </div>
        )}

        {conditionData.notes && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Additional Notes:
            </strong>
            <span>{conditionData.notes}</span>
          </div>
        )}
      </div>
    )}
  </Modal>
);

// ENHANCED: Family History Modal with Family Member Selection
interface FamilyHistoryModalProps {
  visible: boolean;
  loading: boolean;
  editingData: FamilyMedicalHistoryData | null;
  familyMembers: FamilyMemberForHealth[]; // NEW: Add family members prop
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const FamilyHistoryModal: React.FC<FamilyHistoryModalProps> = ({
  visible,
  loading,
  editingData,
  familyMembers = [], // NEW: Family members for dropdown
  form,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title={
      editingData ? "Edit Family Medical History" : "Add Family Medical History"
    }
    open={visible}
    onCancel={onCancel}
    onOk={() => form.submit()}
    confirmLoading={loading}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={
        editingData || {
          familyMemberUserId: "", // NEW: Use family member user ID
          conditionName: "",
          ageOfOnset: null,
          status: "",
          notes: "",
        }
      }
    >
      {/* ENHANCED: Family Member Selection - Replace text input with dropdown */}
      <Form.Item
        name="familyMemberUserId"
        label="Family Member"
        rules={[{ required: true, message: "Please select family member" }]}
      >
        <Select
          placeholder="Select family member"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          notFoundContent={
            familyMembers.length === 0
              ? "No family members available. Add family members first."
              : "No matching family members found"
          }
        >
          {familyMembers.map((member) => (
            <Select.Option key={member.user_id} value={member.user_id}>
              {member.name} ({member.relationship})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="conditionName"
        label="Medical Condition"
        rules={[{ required: true, message: "Please enter medical condition" }]}
      >
        <Input placeholder="e.g., Type 2 Diabetes, Heart Disease, Breast Cancer" />
      </Form.Item>

      <Form.Item name="ageOfOnset" label="Age of Onset">
        <InputNumber
          min={0}
          max={120}
          placeholder="Age when diagnosed"
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item name="status" label="Status">
        <Input placeholder="e.g., Deceased, In remission, Ongoing treatment" />
      </Form.Item>

      <Form.Item name="notes" label="Additional Notes">
        <Input.TextArea
          rows={3}
          placeholder="Any additional information about this family medical history"
        />
      </Form.Item>

      {/* Show helper text if no family members */}
      {familyMembers.length === 0 && (
        <div
          style={{
            padding: "12px",
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "6px",
            fontSize: "0.875rem",
            color: "#92400e",
            marginTop: "16px",
          }}
        >
          <strong>Note:</strong> You need to add family members first before you
          can record their medical history.
        </div>
      )}
    </Form>
  </Modal>
);

// Family History View Modal (Read-only)
interface FamilyHistoryViewModalProps {
  visible: boolean;
  familyHistoryData: FamilyMedicalHistoryData | null;
  onClose: () => void;
}

export const FamilyHistoryViewModal: React.FC<FamilyHistoryViewModalProps> = ({
  visible,
  familyHistoryData,
  onClose,
}) => (
  <Modal
    title="Family Medical History Details"
    open={visible}
    onCancel={onClose}
    footer={[
      <Button key="close" onClick={onClose}>
        Close
      </Button>,
    ]}
    width={600}
  >
    {familyHistoryData && (
      <div style={{ padding: "16px 0" }}>
        {/* ENHANCED: Show permission info */}
        {familyHistoryData.addedBy && (
          <div
            style={{
              marginBottom: "16px",
              padding: "8px 12px",
              background: familyHistoryData.canEdit ? "#d1fae5" : "#f3f4f6",
              borderRadius: "6px",
              fontSize: "0.875rem",
            }}
          >
            <strong>Record Status:</strong>{" "}
            {familyHistoryData.addedBy === "me"
              ? "Added by you - You can edit and delete this record"
              : `Added by ${familyHistoryData.addedBy} - This is a read-only record`}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Family Member:
          </strong>
          <span>
            {familyHistoryData.familyMemberName || "Unknown Member"}
            {familyHistoryData.familyMemberRelation &&
              ` (${familyHistoryData.familyMemberRelation})`}
          </span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Medical Condition:
          </strong>
          <span>{familyHistoryData.conditionName}</span>
        </div>

        {familyHistoryData.ageOfOnset && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Age of Onset:
            </strong>
            <span>{familyHistoryData.ageOfOnset} years old</span>
          </div>
        )}

        {familyHistoryData.status && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Status:
            </strong>
            <span>{familyHistoryData.status}</span>
          </div>
        )}

        {familyHistoryData.notes && (
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Additional Notes:
            </strong>
            <span>{familyHistoryData.notes}</span>
          </div>
        )}
      </div>
    )}
  </Modal>
);

const HealthModalsPage = () => null;
export default HealthModalsPage;
