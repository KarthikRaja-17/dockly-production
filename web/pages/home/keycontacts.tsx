"use client";
import React, { useState, useEffect } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  Card,
  Tabs,
  Button,
  Modal,
  Input,
  Select,
  message,
  Popconfirm,
  Spin,
  Alert,
} from "antd";
import {
  getKeyContacts,
  addKeyContact,
  updateKeyContact,
  deleteKeyContact,
  KeyContact,
} from "../../services/home";
import { CustomButton, PRIMARY_COLOR } from "../../app/comman";
import { FileText, Mail, Phone } from "lucide-react";

const { TabPane } = Tabs;
const { Option } = Select;

interface PredefinedContact {
  category: string;
  name: string;
  icon: string;
  desc: string;
}

const KeyContacts: React.FC = () => {
  const [formData, setFormData] = useState({
    category: "",
    service: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [contacts, setContacts] = useState<KeyContact[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<KeyContact | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Emergency Services");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);

  const predefinedContacts: PredefinedContact[] = [
    {
      category: "Emergency Services",
      name: "Emergency Plumber",
      icon: "🔧",
      desc: "24/7 service",
    },
    {
      category: "Emergency Services",
      name: "Emergency Electrician",
      icon: "⚡",
      desc: "24/7 service",
    },
    {
      category: "Emergency Services",
      name: "Emergency Locksmith",
      icon: "🔒",
      desc: "24/7 service",
    },
    {
      category: "Regular Service Providers",
      name: "HVAC Technician",
      icon: "🔥",
      desc: "Heating & cooling service",
    },
    {
      category: "Regular Service Providers",
      name: "Handyman / Contractor",
      icon: "🔨",
      desc: "General repairs & renovations",
    },
    {
      category: "Regular Service Providers",
      name: "Window & Gutter Service",
      icon: "🪟",
      desc: "Cleaning & maintenance",
    },
    {
      category: "Regular Service Providers",
      name: "Roofer",
      icon: "🏠",
      desc: "Repairs & inspections",
    },
    {
      category: "Regular Service Providers",
      name: "Tree Service / Arborist",
      icon: "🌳",
      desc: "Trimming & removal",
    },
    {
      category: "Professional Advisors",
      name: "Insurance Agent",
      icon: "🏢",
      desc: "Home & auto insurance",
    },
    {
      category: "Professional Advisors",
      name: "Real Estate Agent",
      icon: "🏘",
      desc: "Property advisor",
    },
    {
      category: "Professional Advisors",
      name: "Real Estate Attorney",
      icon: "⚖",
      desc: "Legal matters",
    },
    {
      category: "Professional Advisors",
      name: "Mortgage Broker / Banker",
      icon: "🏦",
      desc: "Financing advisor",
    },
    {
      category: "Other Contacts",
      name: "HOA Contact",
      icon: "👥",
      desc: "Management company",
    },
    {
      category: "Other Contacts",
      name: "Neighbors",
      icon: "🏠",
      desc: "Emergency contacts",
    },
  ];

  const categories = {
    "Emergency Services": { title: "Emergency Services" },
    "Regular Service Providers": { title: "Regular Service Providers" },
    "Professional Advisors": { title: "Professional Advisors" },
    "Other Contacts": { title: "Other Contacts" },
  };

  const categoryOrder = Object.keys(categories);

  const gradientColors = [
    "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)",
    "linear-gradient(135deg, #fefcbf 0%, #fef3c7 100%)",
    "linear-gradient(135deg, #d1fae5 0%, #c7f0e0 100%)",
    "linear-gradient(135deg, #fed7e2 0%, #fce7f3 100%)",
  ];

  useEffect(() => {
    const fetchContacts = async () => {
      setFetchLoading(true);
      try {
        const response = await getKeyContacts({ is_active: 1 });
        if (response.status === 1 && response.payload.contacts) {
          setContacts(response.payload.contacts);
        } else {
          message.error(response.message || "Failed to fetch contacts");
        }
      } catch (error) {
        message.error("Error fetching contacts");
        console.error("Fetch contacts error:", error);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const sectionCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    overflow: "hidden",
    transition: "box-shadow 0.3s",
    height: "360px",
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

  const contactsContentStyle: React.CSSProperties = {
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

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const ContactSubCard: React.FC<{
    predefined: PredefinedContact;
    contact?: KeyContact;
    expanded: boolean;
    gradientIndex?: number;
  }> = ({ predefined, contact, expanded, gradientIndex = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const contactCardStyle: React.CSSProperties = {
      background: contact
        ? gradientColors[gradientIndex % gradientColors.length]
        : "#e2e8f0",
      borderRadius: "0.5rem",
      padding: "1.25rem",
      marginBottom: "1rem",
      cursor: "pointer",
      transition: "all 0.2s",
      position: "relative",
      border: contact ? "1px solid #e2e8f0" : "1px dashed #6b7280",
      color: contact ? "#000000" : "#6b7280",
    };

    const contactProviderStyle: React.CSSProperties = {
      fontWeight: 600,
      marginBottom: "0.75rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      fontSize: "0.9375rem",
      color: contact ? "#000000" : "#6b7280",
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
      color: contact ? "#64748b" : "#9ca3af",
    };

    const coverageValueStyle: React.CSSProperties = {
      fontWeight: 600,
      color: contact ? "#000000" : "#6b7280",
    };

    const descStyle: React.CSSProperties = {
      fontSize: "0.8125rem",
      color: contact ? "#64748b" : "#9ca3af",
      marginTop: "0.5rem",
    };

    const detailItemStyle: React.CSSProperties = {
      fontSize: "0.875rem",
      marginBottom: "0.5rem",
    };

    const detailLabelStyle: React.CSSProperties = {
      color: contact ? "#64748b" : "#9ca3af",
      marginBottom: "0.25rem",
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
    };

    const detailValueStyle: React.CSSProperties = {
      fontWeight: 500,
      color: contact ? "#000000" : "#6b7280",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
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
      if (contact) {
        setEditingContact(contact);
        setFormData({
          category: contact.category,
          service: contact.service,
          name: contact.name,
          phone: contact.phone,
          email: contact.email || "",
          notes: contact.notes || "",
        });
        setIsModalVisible(true);
      }
    };

    const handleDelete = async () => {
      try {
        setLocalLoading(true);
        const response = await deleteKeyContact(contact!.id);
        if (response.status === 1) {
          setContacts(contacts.filter((c) => c.id !== contact!.id));
          message.success("Contact deleted successfully");
        } else {
          message.error(response.message || "Failed to delete contact");
        }
      } catch (error) {
        message.error("Error deleting contact");
        console.error("Delete contact error:", error);
      } finally {
        setLocalLoading(false);
      }
    };

    const handleCardClick = () => {
      if (contact) {
        toggleExpand(contact.id);
      } else {
        setFormData({
          category: predefined.category,
          service: predefined.name,
          name: "",
          phone: "",
          email: "",
          notes: "",
        });
        setEditingContact(null);
        setIsModalVisible(true);
      }
    };

    const arrowContent = contact ? "→" : <PlusOutlined />;
    const arrowColor = contact ? PRIMARY_COLOR : "#6b7280";

    return (
      <div
        style={contactCardStyle}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={contactProviderStyle}>
          <span>{predefined.icon}</span>
          <span>{predefined.name}</span>
        </div>
        {contact ? (
          <div style={coverageGridStyle}>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Phone</span>
              <span style={coverageValueStyle}>{contact.phone}</span>
            </div>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Email</span>
              <span style={coverageValueStyle}>{contact.email || "N/A"}</span>
            </div>
          </div>
        ) : (
          <div style={descStyle}>{predefined.desc}</div>
        )}
        {contact && expanded && (
          <div>
            <div style={propertyItemDetailsStyle}>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Name</div>
                <div style={detailValueStyle}>
                  <FileText size={16} />
                  {contact.name}
                </div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Service</div>
                <div style={detailValueStyle}>
                  <FileText size={16} />
                  {contact.service}
                </div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Notes</div>
                <div style={detailValueStyle}>
                  {contact.notes || "No notes"}
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
                title="Are you sure to delete this contact?"
                onConfirm={handleDelete}
                okText="Yes, Delete"
                cancelText="No"
                okButtonProps={{
                  danger: true,
                  style: {
                    backgroundColor: "#ff0207ff",
                    borderColor: "#ff0207ff",
                  },
                }}
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
        {/* <div style={placeholderIconStyle}><PlusOutlined /></div> */}
        <div>
          <div style={placeholderNameStyle}>Add Another Contact</div>
          <div style={placeholderDescStyle}>
            Add a new contact to your network
          </div>
        </div>
        <div style={{ ...arrowStyle, opacity: isHovered ? 1 : 0 }}>
          <PlusOutlined />
        </div>
      </div>
    );
  };

  const handleAdd = () => {
    setFormData({
      category: activeTab,
      service: "",
      name: "",
      phone: "",
      email: "",
      notes: "",
    });
    setEditingContact(null);
    setErrorMessage("");
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      if (
        !formData.category ||
        !formData.service ||
        !formData.name ||
        !formData.phone
      ) {
        setErrorMessage("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const contactData = {
        category: formData.category,
        service: formData.service,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || "",
        notes: formData.notes || "",
      };

      let response: {
        status: number;
        message?: string;
        payload: {
          contact?: KeyContact;
        };
      };
      if (editingContact) {
        response = await updateKeyContact(editingContact.id, contactData);
        if (response.status === 1 && response.payload.contact) {
          setContacts(
            contacts.map((c) =>
              c.id === editingContact.id ? response.payload.contact! : c
            )
          );
          message.success("Contact updated successfully");
        } else {
          message.error(response.message || "Failed to update contact");
        }
      } else {
        response = await addKeyContact(contactData);
        if (response.status === 1 && response.payload.contact) {
          setContacts([...contacts, response.payload.contact]);
          message.success("Contact added successfully");
        } else {
          message.error(response.message || "Failed to add contact");
        }
      }
      setIsModalVisible(false);
      setFormData({
        category: "",
        service: "",
        name: "",
        phone: "",
        email: "",
        notes: "",
      });
      setEditingContact(null);
    } catch (error: any) {
      console.error("Save error:", error);
      setErrorMessage(
        `Failed to ${editingContact ? "update" : "add"} contact: ${
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
      category: "",
      service: "",
      name: "",
      phone: "",
      email: "",
      notes: "",
    });
    setEditingContact(null);
    setErrorMessage("");
  };

  const renderContacts = (category: string) => {
    const catPre = predefinedContacts.filter((p) => p.category === category);
    const catContacts = contacts.filter((c) => c.category === category);
    if (catPre.length === 0 && catContacts.length === 0) return null;
    return (
      <div style={contactsContentStyle}>
        {catPre.map((p, index) => {
          const existingContact = catContacts.find((c) => c.service === p.name);
          return (
            <ContactSubCard
              key={p.name}
              predefined={p}
              contact={existingContact}
              expanded={expandedItems.has(existingContact?.id || "")}
              gradientIndex={index}
            />
          );
        })}
        {catContacts
          .filter(
            (c) =>
              !predefinedContacts.some(
                (p) => p.category === category && p.name === c.service
              )
          )
          .map((contact, index) => (
            <ContactSubCard
              key={contact.id}
              predefined={{
                category: contact.category,
                name: contact.service,
                icon: "⚙️",
                desc: "Custom contact",
              }}
              contact={contact}
              expanded={expandedItems.has(contact.id)}
              gradientIndex={catPre.length + index}
            />
          ))}
        <PlaceholderCard onAdd={handleAdd} />
      </div>
    );
  };

  if (fetchLoading) {
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
            <div style={sectionIconStyle}>📞</div>
            <span>Key Contacts</span>
          </h2>
          <CustomButton
            label="Add Contact" // tooltip text
            // size="small"
            // icon={<PlusOutlined />}
            onClick={handleAdd}
            // style={{
            //   backgroundColor: "#3182ce",
            //   borderColor: "#3182ce",
            //   color: "#fff",
            //   borderRadius: "6px",
            //   height: "32px",
            //   padding: "0 8px",
            //   width: "30px",
            //   display: "flex",
            //   alignItems: "center",
            //   gap: "2px",
            //   justifyContent: "center",
            // }}
          />
        </div>
        <div style={contactsContentStyle}>
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
            <div style={sectionIconStyle}>📞</div>
            <span>Key Contacts</span>
          </h2>
          <CustomButton
            label="Add Contact" // tooltip text
            // size="small"
            // icon={<PlusOutlined />}
            onClick={handleAdd}
            // style={{
            //   backgroundColor: "#3182ce",
            //   borderColor: "#3182ce",
            //   color: "#fff",
            //   borderRadius: "6px",
            //   height: "32px",
            //   padding: "0 8px",
            //   width: "30px",
            //   display: "flex",
            //   alignItems: "center",
            //   gap: "2px",
            //   justifyContent: "center",
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
          {categoryOrder.map((cat) => (
            <TabPane
              tab={categories[cat as keyof typeof categories].title}
              key={cat}
              style={{ flex: 1 }}
            >
              {renderContacts(cat)}
            </TabPane>
          ))}
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
              <FileText style={{ fontSize: "20px", color: "white" }} />
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
                {editingContact
                  ? `Edit ${editingContact.name}`
                  : "Add Key Contact"}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: 400,
                }}
              >
                {editingContact
                  ? "Update contact information"
                  : "Add a new contact to your network"}
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
              value={formData.category}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  category: value,
                  service: "",
                }))
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
              Service Type
            </label>
            <Input
              size="large"
              value={formData.service}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, service: e.target.value }))
              }
              placeholder="Enter service type"
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
                Provider Name
              </label>
              <Input
                size="large"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter provider name"
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
                Phone Number
              </label>
              <Input
                size="large"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter phone number"
                prefix={<Phone size={16} color="#64748b" />}
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
                Email
              </label>
              <Input
                size="large"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email (optional)"
                prefix={<Mail size={16} color="#64748b" />}
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
              Notes
            </label>
            <Input.TextArea
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Enter notes"
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
                : editingContact
                ? "Update Contact"
                : "Add Contact"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default KeyContacts;
