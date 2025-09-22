import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Checkbox,
  Row,
  Col,
  Space,
  Avatar,
  message,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { addEvent } from "../../services/google";
import { showNotification } from "../../utils/notification";

// Professional color palette
const COLORS = {
  primary: "#1C1C1E",
  secondary: "#48484A",
  accent: "#6366F1",
  success: "#52C41A",
  warning: "#FAAD14",
  error: "#FF4D4F",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8F9FA",
  border: "#E8E8E8",
  borderLight: "#F0F0F0",
  text: "#1C1C1E",
  textSecondary: "#8C8C8C",
  textTertiary: "#BFBFBF",
  overlay: "rgba(0, 0, 0, 0.45)",
  shadowLight: "rgba(0, 0, 0, 0.04)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
  shadowHeavy: "rgba(0, 0, 0, 0.12)",
};

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Types and Interfaces
interface Event {
  id: string;
  title: string;
  startTime: string;
  date: string;
  person: string;
  color: string;
  endTime?: string;
  description?: string;
  location?: string;
  end_date?: string;
  start_date?: string;
  is_all_day?: boolean;
  source_email?: string;
  provider?: string;
  type?: "goal" | "todo" | "event";
}

interface ConnectedAccount {
  userName: string;
  email: string;
  displayName: string;
  accountType: string;
  provider: string;
  color: string;
}

interface AddEventModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  connectedAccounts?: ConnectedAccount[];
  editingEvent?: Event | null;
  initialDate?: string;
  initialTime?: string;
}

const { TextArea } = Input;
const { Option } = Select;

const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  connectedAccounts = [],
  editingEvent = null,
  initialDate,
  initialTime,
}) => {
  const [form] = Form.useForm();
  const [isAllDay, setIsAllDay] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper functions
  const getConnectedAccount = (userName: string): ConnectedAccount | null => {
    return (
      connectedAccounts.find((account) => account.userName === userName) || null
    );
  };

  // Initialize form when modal opens or editing event changes
  React.useEffect(() => {
    if (visible) {
      if (editingEvent) {
        // Editing existing event
        const convertTo24Hour = (time12h: string): string => {
          if (!time12h) return "00:00";
          const [time, modifier] = time12h.split(" ");
          let [hours, minutes] = time.split(":");
          if (hours === "12") hours = "00";
          if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
          return `${hours.padStart(2, "0")}:${minutes || "00"}`;
        };

        const isAllDayEvent =
          editingEvent.startTime === "12:00 AM" &&
          editingEvent.endTime === "11:59 PM";

        setIsAllDay(isAllDayEvent);

        const convertToDayjsTime = (time: string) => {
          const parsed = dayjs(time, ["h:mm A", "hh:mm A", "H:mm"]);
          return parsed.isValid() ? parsed : null;
        };

        form.setFieldsValue({
          title: editingEvent.title || "",
          location: editingEvent.location || "",
          description: editingEvent.description || "",
          person: editingEvent.person || "",
          ...(isAllDayEvent
            ? {
                startDate: dayjs(editingEvent.start_date || editingEvent.date),
                endDate: dayjs(editingEvent.end_date || editingEvent.date),
              }
            : {
                date: dayjs(editingEvent.date),
                startTime: convertToDayjsTime(editingEvent.startTime),
                endTime: convertToDayjsTime(editingEvent.endTime || ""),
              }),
        });
      } else {
        // Creating new event
        const startTime = initialTime || "12:00";
        const [hours, minutes] = startTime.split(":").map(Number);
        const endHours = hours + 1;
        const endTime = `${endHours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        form.setFieldsValue({
          title: "",
          date: initialDate ? dayjs(initialDate) : dayjs(),
          startTime: dayjs(startTime, "HH:mm"),
          endTime: dayjs(endTime, "HH:mm"),
          person:
            connectedAccounts.length > 0 ? connectedAccounts[0].userName : "",
          location: "",
          description: "",
          invitee: "",
        });
        setIsAllDay(false);
      }
    }
  }, [
    visible,
    editingEvent,
    initialDate,
    initialTime,
    form,
    connectedAccounts,
  ]);

  const handleModalSave = () => {
    setLoading(true);

    form
      .validateFields()
      .then(async (values) => {
        const {
          title,
          date,
          startTime,
          endTime,
          startDate,
          endDate,
          person,
          location,
          description,
          invitee,
        } = values;

        const payload = isAllDay
          ? {
              is_all_day: true,
              title,
              start_date: startDate.format("YYYY-MM-DD"),
              end_date: endDate.format("YYYY-MM-DD"),
              location,
              description,
              person,
              invitee,
            }
          : {
              is_all_day: false,
              title,
              date: date.format("YYYY-MM-DD"),
              start_time: startTime.format("h:mm A"),
              end_time: endTime.format("h:mm A"),
              location,
              description,
              person,
              invitee,
            };

        // Add ID for editing case only
        if (editingEvent) {
          (payload as any).id = editingEvent.id;
        }

        try {
          const res = await addEvent(payload);
          const { status, message: responseMessage } = res.data;

          if (status === 1) {
            showNotification("Success", "Event added successfully to Planner.", "success");
            if (onSuccess) onSuccess(); // Callback to refresh calendar
            handleClose();
          } else {
            showNotification("Error", responseMessage, "error");
          }
        } catch (err) {
          console.error("Save error:", err);
          showNotification("Error", "Something went wrong.", "error");
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleClose = () => {
    setIsAllDay(false);
    form.resetFields();
    onCancel();
  };

  // Show message if no connected accounts
  if (connectedAccounts.length === 0) {
    return (
      <Modal
        title={
          <Space style={{ fontFamily: FONT_FAMILY }}>
            <PlusOutlined />
            Create New Event
          </Space>
        }
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={520}
        style={{ fontFamily: FONT_FAMILY }}
      >
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <h3>No Connected Accounts</h3>
          <p>Please connect your calendar accounts first to create events.</p>
          <button
            onClick={handleClose}
            style={{
              background: COLORS.accent,
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Space style={{ fontFamily: FONT_FAMILY }}>
          <PlusOutlined />
          {editingEvent ? "Edit Event" : "Create New Event"}
        </Space>
      }
      open={visible}
      onOk={handleModalSave}
      onCancel={handleClose}
      okText={editingEvent ? "Update Event" : "Create Event"}
      cancelText="Cancel"
      width={520}
      confirmLoading={loading}
      okButtonProps={{
        style: {
          backgroundColor: COLORS.accent,
          borderColor: COLORS.accent,
          fontFamily: FONT_FAMILY,
        },
      }}
      cancelButtonProps={{
        style: {
          fontFamily: FONT_FAMILY,
        },
      }}
      style={{ fontFamily: FONT_FAMILY }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 12, fontFamily: FONT_FAMILY }}
        initialValues={{
          person:
            connectedAccounts.length > 0 ? connectedAccounts[0].userName : "",
        }}
      >
        <Form.Item
          name="title"
          label="Event Title"
          rules={[{ required: true, message: "Please enter event title" }]}
        >
          <Input
            placeholder="Add a descriptive title"
            style={{ fontFamily: FONT_FAMILY }}
          />
        </Form.Item>

        {isAllDay ? (
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[
                  { required: true, message: "Please select start date" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%", fontFamily: FONT_FAMILY }}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[{ required: true, message: "Please select end date" }]}
              >
                <DatePicker
                  style={{ width: "100%", fontFamily: FONT_FAMILY }}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <Row gutter={8}>
            <Col span={8}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker
                  style={{ width: "100%", fontFamily: FONT_FAMILY }}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="startTime"
                label={
                  <Space>
                    <ClockCircleOutlined />
                    Start Time
                  </Space>
                }
                rules={[
                  { required: true, message: "Please select start time" },
                ]}
              >
                <TimePicker
                  style={{ width: "100%", fontFamily: FONT_FAMILY }}
                  format="hh:mm A"
                  use12Hours
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="endTime"
                label={
                  <Space>
                    <ClockCircleOutlined />
                    End Time
                  </Space>
                }
                rules={[{ required: true, message: "Please select end time" }]}
              >
                <TimePicker
                  style={{ width: "100%", fontFamily: FONT_FAMILY }}
                  format="hh:mm A"
                  use12Hours
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item>
          <Checkbox
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
            style={{ fontFamily: FONT_FAMILY }}
          >
            All day
          </Checkbox>
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="person"
              label="Assigned to"
              rules={[
                { required: true, message: "Please select calendar account" },
              ]}
            >
              <Select
                placeholder="Select calendar account"
                style={{ fontFamily: FONT_FAMILY }}
              >
                {connectedAccounts.map((account) => (
                  <Option key={account.userName} value={account.userName}>
                    <Space>
                      <Avatar
                        size="small"
                        style={{ backgroundColor: account.color }}
                      >
                        {account.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>
                        {account.displayName}
                      </span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="invitee" label="Invite">
              <Input
                placeholder="Add email"
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="location"
          label={
            <Space>
              <EnvironmentOutlined />
              Location
            </Space>
          }
        >
          <Input
            placeholder="Add location or meeting link"
            style={{ fontFamily: FONT_FAMILY }}
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="Add notes, agenda, or additional details"
            style={{ fontFamily: FONT_FAMILY }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEventModal;
