"use client";
import React, { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Card,
  Tabs,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Spin,
  Alert,
  InputNumber,
} from "antd";
import { Home, DollarSign, Calendar, FileText } from "lucide-react";
import moment from "moment";
import {
  addInsurance,
  getInsurance,
  updateInsurance,
  deleteInsurance,
} from "../../services/home";
import { CustomButton, PRIMARY_COLOR } from "../../app/comman";

const { TabPane } = Tabs;
const { Option } = Select;

interface Insurance {
  id: string;
  name: string;
  meta: string;
  type: string;
  years: number;
  payment: number;
  renewal_date?: string;
  description?: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

const InsuranceSection: React.FC = () => {
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    meta: "",
    years: "",
    payment: "",
    renewal_date: "",
    description: "",
  });
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("property");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState("");

  const predefined = [
    {
      category: "property",
      name: "Homeowners Insurance",
      icon: "🏠",
      desc: "Coverage • Premium • Deductible",
    },
    {
      category: "property",
      name: "Flood / Earthquake",
      icon: "💧",
      desc: "Optional coverage",
    },
    {
      category: "property",
      name: "Home Warranty",
      icon: "🔧",
      desc: "Appliances • Systems",
    },
    {
      category: "vehicle",
      name: "Auto Insurance",
      icon: "🚗",
      desc: "Cars • Motorcycles • RV • Boat",
    },
    {
      category: "life",
      name: "Life Insurance",
      icon: "❤️",
      desc: "Term • Whole • Universal • AD&D",
    },
    {
      category: "other",
      name: "Umbrella Policy",
      icon: "☂️",
      desc: "Additional liability coverage",
    },
    {
      category: "other",
      name: "Valuable Items",
      icon: "💎",
      desc: "Jewelry • Art • Collectibles",
    },
    {
      category: "other",
      name: "Pet Insurance",
      icon: "🐕",
      desc: "Health coverage for pets",
    },
    {
      category: "other",
      name: "Vehicle Registration",
      icon: "🚗",
      desc: "Cars • Motorcycles • Boats • Trailers",
    },
    {
      category: "other",
      name: "Driver's License",
      icon: "🆔",
      desc: "Renewal date • Real ID",
    },
    {
      category: "other",
      name: "Property Taxes",
      icon: "🏛️",
      desc: "Annual / Semi-annual",
    },
    { category: "other", name: "HOA Dues", icon: "🏘️", desc: "If applicable" },
  ];

  const categories = {
    property: { title: "Property" },
    vehicle: { title: "Vehicle" },
    life: { title: "Life" },
    other: { title: "Other" },
  };

  const categoryOrder = ["property", "vehicle", "life", "other"];

  // Gradient colors matching PropertyInformation
  const gradientColors = [
    "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)",
    "linear-gradient(135deg, #fefcbf 0%, #fef3c7 100%)",
    "linear-gradient(135deg, #d1fae5 0%, #c7f0e0 100%)",
    "linear-gradient(135deg, #fed7e2 0%, #fce7f3 100%)",
  ];

  const sectionCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    overflow: "hidden",
    transition: "box-shadow 0.3s",
    height: "500px",
    display: "flex",
    flexDirection: "column",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: "1.25rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(to bottom, #ffffff, #fafbfc)",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.125rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: 0,
  };

  const sectionIconStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  };

  const insuranceContentStyle: React.CSSProperties = {
    padding: "1.5rem",
    maxHeight: "340px",
    overflowY: "auto",
    flex: 1,
  };

  const noDataStyle: React.CSSProperties = {
    border: "1px dashed #d9d9d9",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    margin: "1.5rem",
    backgroundColor: "#fafafa",
    marginTop: "1.5rem",
  };

  const placeholderCardStyle: React.CSSProperties = {
    background: "#e2e8f0",
    borderRadius: "0.5rem",
    padding: "1.25rem",
    marginBottom: "1rem",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    border: "1px dashed #6b7280",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    color: "#6b7280",
  };

  const placeholderIconStyle: React.CSSProperties = {
    fontSize: "2rem",
    color: "#6b7280",
  };

  const placeholderNameStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#6b7280",
  };

  const placeholderDescStyle: React.CSSProperties = {
    fontSize: "0.8125rem",
    color: "#9ca3af",
  };

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    right: "1rem",
    color: "#6b7280",
    opacity: 0,
    transition: "opacity 0.2s",
    pointerEvents: "none",
    fontSize: "16px",
  };

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const InsuranceSubCard: React.FC<{
    predefined: (typeof predefined)[0];
    insurance?: Insurance;
    expanded: boolean;
    gradientIndex?: number;
  }> = ({ predefined, insurance, expanded, gradientIndex = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const insuranceCardStyle: React.CSSProperties = {
      background: insurance
        ? gradientColors[gradientIndex % gradientColors.length]
        : "#e2e8f0",
      borderRadius: "0.5rem",
      padding: "1.25rem",
      marginBottom: "1rem",
      cursor: "pointer",
      transition: "all 0.2s",
      position: "relative",
      border: insurance ? "1px solid #e2e8f0" : "1px dashed #6b7280",
      color: insurance ? "#000000" : "#6b7280",
    };

    const insuranceProviderStyle: React.CSSProperties = {
      fontWeight: 600,
      marginBottom: "0.75rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      fontSize: "0.9375rem",
      color: insurance ? "#000000" : "#6b7280",
    };

    const coverageGridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "0.75rem",
      fontSize: "0.8125rem",
    };

    const coverageItemStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: "space-between",
      padding: "0.25rem 0",
    };

    const coverageLabelStyle: React.CSSProperties = {
      color: insurance ? "#64748b" : "#9ca3af",
    };

    const coverageValueStyle: React.CSSProperties = {
      fontWeight: 600,
      color: insurance ? "#000000" : "#6b7280",
    };

    const descStyle: React.CSSProperties = {
      fontSize: "0.8125rem",
      color: insurance ? "#64748b" : "#9ca3af",
      marginTop: "0.5rem",
    };

    const detailItemStyle: React.CSSProperties = {
      fontSize: "0.875rem",
      marginBottom: "0.5rem",
    };

    const detailLabelStyle: React.CSSProperties = {
      color: insurance ? "#64748b" : "#9ca3af",
      marginBottom: "0.25rem",
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
    };

    const detailValueStyle: React.CSSProperties = {
      fontWeight: 500,
      color: insurance ? "#000000" : "#6b7280",
    };

    const propertyItemDetailsStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1rem",
      marginTop: "1.25rem",
      paddingTop: "1.25rem",
      borderTop: "1px solid #e2e8f0",
    };

    const actionButtonsStyle: React.CSSProperties = {
      display: "flex",
      gap: "12px",
      marginTop: "1.25rem",
      justifyContent: "flex-end",
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingInsurance(insurance!);
      setFormData({
        type: insurance!.type,
        name: insurance!.name,
        meta: insurance!.meta,
        years: insurance!.years.toString(),
        payment: insurance!.payment.toString(),
        renewal_date: insurance!.renewal_date || "",
        description: insurance!.description || "",
      });
      setIsModalVisible(true);
    };

    const handleDelete = async () => {
      try {
        setLocalLoading(true);
        await deleteInsurance(insurance!.id);
        message.success("Insurance deleted successfully");
        fetchInsurances();
      } catch (error) {
        console.error("Delete error:", error);
        message.error("Failed to delete insurance");
      } finally {
        setLocalLoading(false);
      }
    };

    const handleCardClick = () => {
      if (insurance) {
        toggleExpand(predefined.name);
      } else {
        setFormData({
          type: predefined.category,
          name: predefined.name,
          meta: "",
          years: "",
          payment: "",
          renewal_date: "",
          description: "",
        });
        setEditingInsurance(null);
        setIsModalVisible(true);
      }
    };

    const arrowContent = insurance ? "→" : <PlusOutlined />;
    const arrowColor = insurance ? PRIMARY_COLOR : "#6b7280";

    return (
      <div
        style={insuranceCardStyle}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={insuranceProviderStyle}>
          <span>{predefined.icon}</span>
          <span>{predefined.name}</span>
        </div>
        {insurance ? (
          <div style={coverageGridStyle}>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Term Length</span>
              <span style={coverageValueStyle}>{insurance.years} years</span>
            </div>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Annual Premium</span>
              <span style={coverageValueStyle}>
                ${insurance.payment.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div style={descStyle}>{predefined.desc}</div>
        )}
        {insurance && expanded && (
          <div>
            <div style={propertyItemDetailsStyle}>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Provider</div>
                <div style={detailValueStyle}>
                  <FileText size={16} />
                  {insurance.meta || "N/A"}
                </div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Next Renewal</div>
                <div style={detailValueStyle}>
                  <Calendar size={16} />
                  {insurance.renewal_date
                    ? moment(insurance.renewal_date).format("MMM DD, YYYY")
                    : "N/A"}
                </div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Description</div>
                <div style={detailValueStyle}>
                  {insurance.description || "No description available"}
                </div>
              </div>
            </div>
            <div style={actionButtonsStyle}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ borderRadius: "6px" }}
                loading={localLoading}
              />
              <Popconfirm
                title="Are you sure to delete this insurance?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ borderRadius: "6px" }}
                  loading={localLoading}
                />
              </Popconfirm>
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: arrowColor,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s",
            pointerEvents: "none",
            fontSize: "16px",
          }}
        >
          {arrowContent}
        </div>
      </div>
    );
  };

  const PlaceholderCard: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={placeholderCardStyle}
        onClick={onAdd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={placeholderIconStyle}>
          <PlusOutlined />
        </div>
        <div>
          <div style={placeholderNameStyle}>Add Another Insurance</div>
          <div style={placeholderDescStyle}>
            Add a new insurance to your policies
          </div>
        </div>
        <div style={{ ...arrowStyle, opacity: isHovered ? 1 : 0 }}>
          <PlusOutlined />
        </div>
      </div>
    );
  };

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const response = await getInsurance({});
      setInsurances(response.payload.insurances || []);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch insurances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  const handleAdd = () => {
    setFormData({
      type: activeTab,
      name: "",
      meta: "",
      years: "",
      payment: "",
      renewal_date: "",
      description: "",
    });
    setEditingInsurance(null);
    setErrorMessage("");
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      if (
        !formData.type ||
        !formData.name ||
        !formData.meta ||
        !formData.years ||
        !formData.payment
      ) {
        setErrorMessage("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const insuranceData = {
        name: formData.name,
        type: formData.type,
        meta: formData.meta,
        years: parseInt(formData.years),
        payment: parseFloat(formData.payment),
        renewal_date: formData.renewal_date
          ? moment(formData.renewal_date).format("YYYY-MM-DD")
          : null,
        description: formData.description || "",
      };

      if (editingInsurance) {
        await updateInsurance(editingInsurance.id, insuranceData);
        message.success("Insurance updated successfully");
      } else {
        await addInsurance(insuranceData);
        message.success("Insurance added successfully");
      }
      setIsModalVisible(false);
      setFormData({
        type: "",
        name: "",
        meta: "",
        years: "",
        payment: "",
        renewal_date: "",
        description: "",
      });
      setEditingInsurance(null);
      fetchInsurances();
    } catch (error: any) {
      console.error("Save error:", error);
      setErrorMessage(
        `Failed to ${editingInsurance ? "update" : "add"} insurance: ${
          error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setFormData({
      type: "",
      name: "",
      meta: "",
      years: "",
      payment: "",
      renewal_date: "",
      description: "",
    });
    setEditingInsurance(null);
    setErrorMessage("");
  };

  const renderInsurances = (category: string) => {
    const catPre = predefined.filter((p) => p.category === category);
    const catInsurances = insurances.filter((i) => i.type === category);
    if (catPre.length === 0 && catInsurances.length === 0) return null;
    return (
      <div style={insuranceContentStyle}>
        {catPre.map((p, index) => {
          const ins = insurances.find(
            (i) => i.type === category && i.name === p.name
          );
          return (
            <InsuranceSubCard
              key={p.name}
              predefined={p}
              insurance={ins}
              expanded={expandedItems.has(p.name)}
              gradientIndex={index}
            />
          );
        })}
        {catInsurances
          .filter(
            (i) =>
              !predefined.some(
                (p) => p.category === category && p.name === i.name
              )
          )
          .map((ins, index) => (
            <InsuranceSubCard
              key={ins.id}
              predefined={{
                category: ins.type,
                name: ins.name,
                icon: "⚙️",
                desc: "Custom insurance",
              }}
              insurance={ins}
              expanded={expandedItems.has(ins.name)}
              gradientIndex={catPre.length + index}
            />
          ))}
        <PlaceholderCard onAdd={handleAdd} />
      </div>
    );
  };

  if (loading) {
    return (
      <Card
        style={sectionCardStyle}
        bodyStyle={{
          padding: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            <div style={sectionIconStyle}>🛡️</div>
            <span>Insurance & Renewals</span>
          </h2>
          <Button
            type="primary"
            style={{
              backgroundColor: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              color: "#fff",
              borderRadius: "6px",
              height: "32px",
              padding: "0 8px",
              width: "30px",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              justifyContent: "center",
            }}
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          />
        </div>
        <div style={insuranceContentStyle}>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <Spin />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        style={sectionCardStyle}
        bodyStyle={{
          padding: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            <div style={sectionIconStyle}>🛡️</div>
            <span>Insurance & Renewals</span>
          </h2>
          <CustomButton
            label="Add Insurance" // tooltip text
            // icon={<PlusOutlined />}
            onClick={handleAdd}
            // style={{
            //   backgroundColor: PRIMARY_COLOR,
            //   borderColor: PRIMARY_COLOR,
            //   borderRadius: '6px',
            //   height: '32px',
            //   width: '32px',
            //   display: 'flex',
            //   alignItems: 'center',
            //   justifyContent: 'center',
            //   padding: 0,
            //   color: '#fff',
            // }}
          />
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginTop: "0.5rem",
          }}
          tabBarStyle={{
            padding: "1rem 1.5rem 0",
            background: "#ffffff",
            margin: 0,
          }}
        >
          <TabPane tab="Property" key="property" style={{ flex: 1 }}>
            {renderInsurances("property")}
          </TabPane>
          <TabPane tab="Vehicle" key="vehicle" style={{ flex: 1 }}>
            {renderInsurances("vehicle")}
          </TabPane>
          <TabPane tab="Life" key="life" style={{ flex: 1 }}>
            {renderInsurances("life")}
          </TabPane>
          <TabPane tab="Other" key="other" style={{ flex: 1 }}>
            {renderInsurances("other")}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 0",
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "16px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #096dd9 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
              }}
            >
              <Home style={{ fontSize: "20px", color: "white" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1a202c",
                  lineHeight: 1.2,
                  marginBottom: "2px",
                }}
              >
                {editingInsurance
                  ? `Edit ${editingInsurance.name}`
                  : "Add Insurance Policy"}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: 400,
                }}
              >
                {editingInsurance
                  ? "Update insurance information"
                  : "Add a new insurance to your policies"}
              </div>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{
          padding: "24px",
          maxHeight: "70vh",
          overflowY: "auto",
          background: "#fafbfc",
        }}
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Category
            </label>
            <Select
              size="large"
              value={formData.type}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value, name: "" }))
              }
              placeholder="Select category"
              style={{
                width: "100%",
                borderRadius: "10px",
                fontSize: "15px",
                height: "48px",
              }}
              dropdownStyle={{
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              }}
            >
              {categoryOrder.map((category) => (
                <Option key={category} value={category}>
                  {categories[category as keyof typeof categories].title}
                </Option>
              ))}
            </Select>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Policy Type
            </label>
            <Input
              size="large"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter policy type"
              style={{
                borderRadius: "10px",
                border: "2px solid #e2e8f0",
                fontSize: "15px",
                height: "48px",
                background: "white",
                transition: "all 0.2s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Provider / Meta
              </label>
              <Input
                size="large"
                value={formData.meta}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, meta: e.target.value }))
                }
                placeholder="Enter provider or meta information"
                style={{
                  borderRadius: "10px",
                  border: "2px solid #e2e8f0",
                  fontSize: "15px",
                  height: "48px",
                  background: "white",
                  transition: "all 0.2s ease",
                }}
                prefix={<FileText size={16} color="#64748b" />}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Coverage Years
              </label>
              <Input
                size="large"
                type="number"
                value={formData.years}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, years: e.target.value }))
                }
                placeholder="Enter number of years"
                style={{
                  borderRadius: "10px",
                  border: "2px solid #e2e8f0",
                  fontSize: "15px",
                  height: "48px",
                  background: "white",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Annual Premium
              </label>
              <Input
                size="large"
                type="number"
                value={formData.payment}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, payment: e.target.value }))
                }
                placeholder="Enter annual premium"
                prefix={<DollarSign size={16} color="#64748b" />}
                style={{
                  borderRadius: "10px",
                  border: "2px solid #e2e8f0",
                  fontSize: "15px",
                  height: "48px",
                  background: "white",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Renewal Date
              </label>
              <DatePicker
                value={
                  formData.renewal_date ? moment(formData.renewal_date) : null
                }
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    renewal_date: date ? date.format("YYYY-MM-DD") : "",
                  }))
                }
                format="YYYY-MM-DD"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "2px solid #e2e8f0",
                  fontSize: "15px",
                  height: "48px",
                  background: "white",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Description
            </label>
            <Input.TextArea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter description"
              style={{
                borderRadius: "10px",
                border: "2px solid #e2e8f0",
                fontSize: "15px",
                background: "white",
                transition: "all 0.2s ease",
              }}
            />
          </div>
          {errorMessage && (
            <Alert
              message="Error"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage("")}
              style={{ marginBottom: "16px", borderRadius: "8px" }}
            />
          )}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <Button
              size="large"
              onClick={handleModalCancel}
              style={{
                borderRadius: "10px",
                height: "48px",
                padding: "0 24px",
                fontSize: "15px",
                fontWeight: 500,
                border: "2px solid #e2e8f0",
                color: "#64748b",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #096dd9 100%)`,
                border: "none",
                boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
                height: "48px",
                padding: "0 32px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 6px 16px ${PRIMARY_COLOR}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${PRIMARY_COLOR}30`;
              }}
            >
              {loading
                ? "Saving..."
                : editingInsurance
                ? "Update Insurance"
                : "Add Insurance"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default InsuranceSection;
