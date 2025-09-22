
"use client";
import React, { useState, useEffect } from "react";
import { Modal, Card, Button, Input, Checkbox, Typography, notification, Tag, Divider, message } from "antd";
import { useParams, useRouter } from "next/navigation";
import { addFamilyMember } from "../../services/family";
import { Hubs } from "../../app/comman";
import { showNotification } from "../../utils/notification";
const { Text, Title } = Typography;
import { UserAddOutlined, MailOutlined, UserOutlined, CheckCircleOutlined, SendOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useGlobalLoading } from "../../app/loadingContext";

// Utility functions for validation
function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
    return /^\d{10,15}$/.test(phone.replace(/\D/g, ""));
}

// Define types
type PermissionState = {
    type: "Full Access" | "Custom Access";
    allowAdd?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowInvite?: boolean;
    notify?: boolean;
};

type FormDataState = {
    name: string;
    relationship: string;
    email: string;
    phone: string;
    accessCode: string;
    method: "Email" | "Mobile" | "Access Code";
    permissions: PermissionState;
    sharedItems: { [category: string]: string[] };
};

interface FamilyInviteFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (formData: FormDataState) => void;
    isEditMode?: boolean;
    initialData?: FormDataState;
    isGuardianMode?: boolean;
}

const FamilyInviteForm: React.FC<FamilyInviteFormProps> = ({ visible, onCancel, onSubmit, isEditMode = false, initialData, isGuardianMode = false }) => {
    const [step, setStep] = useState<"add" | "permissions" | "share" | "review" | "sent">("add");
    const [selectedMethod, setSelectedMethod] = useState<"Email" | "Mobile" | "Access Code">("Email");
    const [formData, setFormData] = useState<FormDataState>(
        initialData || {
            name: "",
            relationship: isGuardianMode ? "🛡 Guardian" : "",
            email: "",
            phone: "",
            accessCode: "",
            method: "Email",
            permissions: { type: "Custom Access" },
            sharedItems: {},
        }
    );
    const [pendingMember, setPendingMember] = useState<FormDataState | null>(null);
    const [username, setUsername] = useState<string>("");
    const [systemNotification, setSystemNotification] = useState(null);
    const { loading, setLoading } = useGlobalLoading();
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        let storedUsername = localStorage.getItem("username") || (params && params.username);
        if (Array.isArray(storedUsername)) {
            storedUsername = storedUsername[0];
        }
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, [params?.username]);

    useEffect(() => {
        if (!visible) {
            setStep("add");
            setFormData({
                name: "",
                relationship: isGuardianMode ? "🛡 Guardian" : "",
                email: "",
                phone: "",
                accessCode: "",
                method: "Email",
                permissions: { type: "Custom Access" },
                sharedItems: {},
            });
            setPendingMember(null);
            setSelectedMethod("Email");
        } else if (isEditMode && initialData) {
            setFormData(initialData);
            setSelectedMethod(initialData.method);
        }
    }, [visible, isEditMode, initialData, isGuardianMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (key: keyof PermissionState) => {
        setFormData((prev) => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: !prev.permissions[key as keyof PermissionState],
            },
        }));
    };

    const handlePermissionTypeChange = (type: "Full Access" | "Custom Access") => {
        setFormData((prev) => ({
            ...prev,
            permissions: {
                type,
                ...(type === "Full Access"
                    ? { allowAdd: true, allowEdit: true, allowDelete: true, allowInvite: true, notify: true }
                    : { allowAdd: false, allowEdit: false, allowDelete: false, allowInvite: false, notify: false }),
            },
        }));
    };

    const isParentChecked = (categoryName: string) => {
        const category = Hubs.find((c) => c.label.name === categoryName);
        return category?.children.length
            ? formData.sharedItems[categoryName]?.length === category.children.length
            : false;
    };

    const toggleParent = (category: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            sharedItems: {
                ...prev.sharedItems,
                [category]: checked
                    ? Hubs.find((c) => c.label.name === category)?.children.map((c) => c.name) || []
                    : [],
            },
        }));
    };

    const toggleChild = (category: string, item: string) => {
        setFormData((prev) => {
            const currentItems = prev.sharedItems[category] || [];
            const newItems = currentItems.includes(item)
                ? currentItems.filter((i) => i !== item)
                : [...currentItems, item];
            return {
                ...prev,
                sharedItems: { ...prev.sharedItems, [category]: newItems },
            };
        });
    };

    const handleSendInvitation = async () => {
        setLoading(true);
        try {
            // Get the current family group ID from localStorage or context
            const currentFamilyGroupId = localStorage.getItem("currentFamilyGroupId") || localStorage.getItem("fuser");

            const response = await addFamilyMember({
                ...formData,
                sharedItems: formData.sharedItems,
                username,
                family_group_id: currentFamilyGroupId,
            });
            const responseData = response?.data || response; // Fallback to response if .data is undefined
            const status = responseData?.status ?? false;
            const responseMessage = responseData?.message ?? "Unknown error";

            if (status) {
                // Save the form data via onSubmit
                onSubmit(formData);
                setPendingMember(formData);
                setStep("sent");
            } else if (!status) {
                showNotification("Error", responseData?.message, "error");
            } else {
                notification.error({
                    message: "Error Adding Family Member",
                    description: responseMessage || "Failed to add family member. Please try again.",
                    placement: "topRight",
                    duration: 3,
                });
            }
        } catch (error) {
            console.error("Error in handleSendInvitation:", error);
            notification.error({
                message: "Error Sending Invitation",
                description: "Unable to process the invitation. Please try again.",
                placement: "topRight",
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    // Form validation
    const isFormValid = () => {
        return !!(
            formData.name &&
            (isGuardianMode || formData.relationship) &&
            (selectedMethod === "Email" ? formData.email && validateEmail(formData.email) : true) &&
            (selectedMethod === "Mobile" ? formData.phone && validatePhone(formData.phone) : true) &&
            (selectedMethod === "Access Code" ? formData.accessCode : true)
        );
    };

    // Render functions

    const renderAddForm = () => (
        <div style={{ padding: "0", borderRadius: "12px", overflow: "hidden" }}>
            {/* Gradient Header */}
            <div
                style={{
                    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    padding: "10px 24px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    borderTopLeftRadius: "1px",
                    borderTopRightRadius: "1px",
                    marginTop: "0px",
                }}
            >
                <UserAddOutlined style={{ fontSize: 20 }} />
                <Title level={4} style={{ color: "white", margin: 0 }}>
                    {isGuardianMode ? "Add Guardian" : "Add Family Member"}
                </Title>
            </div>

            {/* Content */}
            <div style={{ padding: "15px", backgroundColor: "#fff" }}>
                {/* Contact Method Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <MailOutlined style={{ color: "#3b82f6" }} />
                    <Text strong>Email</Text>
                </div>

                <Text type="secondary">Please enter an email address.</Text>
                <Input
                    name="email"
                    placeholder="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    size="large"
                    prefix={<MailOutlined />}
                    style={{ margin: "4px 0 16px", borderRadius: 8, caretColor: "#1890ff" }} // Added caretColor
                />

                <Text type="secondary">Please enter a display name.</Text>
                <Input
                    name="name"
                    placeholder="Display Name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    size="large"
                    prefix={<UserOutlined />}
                    style={{ margin: "8px 0 24px", borderRadius: 8, caretColor: "#1890ff" }} // Added caretColor
                />

                {!isGuardianMode && (
                    <>
                        <Text strong>Select Relationship</Text>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12, marginBottom: 25 }}>
                            {[
                                { label: "Spouse/Partner", emoji: "❤" },
                                { label: "Child", emoji: "😊" },
                                { label: "Parent", emoji: "🧑‍🤝‍🧑" },
                                { label: "Guardian", emoji: "🛡" },
                            ].map(({ label, emoji }) => {
                                const fullLabel = `${emoji} ${label}`;
                                return (
                                    <Button
                                        key={fullLabel}
                                        type={formData.relationship === fullLabel ? "primary" : "default"}
                                        shape="round"
                                        size="middle"
                                        onClick={() => setFormData({ ...formData, relationship: fullLabel })}
                                        style={{
                                            fontWeight: 500,
                                            borderColor: formData.relationship === fullLabel ? "#3b82f6" : undefined,
                                        }}
                                    >
                                        {fullLabel}
                                    </Button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Footer Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button
                        onClick={onCancel}
                        size="large"
                        shape="round"
                        style={{
                            borderRadius: 8,
                            padding: "6px 24px",
                            fontWeight: 500,
                            background: "#fff",
                            border: "1px solid #d9d9d9",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        shape="round"
                        disabled={!isFormValid()}
                        onClick={() => setStep("share")}
                        style={{
                            background: "linear-gradient(90deg,rgb(141, 138, 200)rgb(155, 116, 244)6)",
                            border: "none",
                            padding: "6px 24px",
                            fontWeight: 500,
                        }}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderPermissions = () => (
        <div style={{ padding: "10px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
                Set Permissions for: {formData.name}
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
                {(["Full Access", "Custom Access"] as const).map((type) => (
                    <Button
                        key={type}
                        type={formData.permissions.type === type ? "primary" : "default"}
                        onClick={() => handlePermissionTypeChange(type)}
                        style={{ borderRadius: "20px", padding: "5px 15px" }}
                    >
                        {type}
                    </Button>
                ))}
            </div>
            {formData.permissions.type === "Custom Access" && (
                <div style={{ marginTop: "20px" }}>
                    {(["allowAdd", "allowEdit", "allowDelete", "allowInvite", "notify"] as const).map((key) => (
                        <div key={key} style={{ marginBottom: "8px" }}>
                            <Checkbox
                                checked={formData.permissions[key] ?? false}
                                onChange={() => handlePermissionChange(key)}
                            >
                                {key.replace("allow", "Allow ").replace(/([A-Z])/g, " $1")}
                            </Checkbox>
                        </div>
                    ))}
                </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
                <Button
                    onClick={() => setStep("add")}
                    style={{ borderRadius: "20px", padding: "5px 15px" }}
                >
                    Back
                </Button>
                <Button
                    type="primary"
                    onClick={() => setStep("share")}
                    style={{ borderRadius: "20px", padding: "5px 15px" }}
                >
                    Continue
                </Button>
            </div>
        </div>
    );

    const renderSharingOptions = () => {
        const hasSelectedItems = Object.values(formData.sharedItems).some((items) => items.length > 0);

        return (
            <div style={{ padding: 0, borderRadius: "12px", overflow: "hidden" }}>
                {/* Gradient Header */}
                <div
                    style={{
                        background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                        padding: "20px 24px",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderTopLeftRadius: "5px",
                        borderTopRightRadius: "5px",
                    }}
                >
                    <ShareAltOutlined style={{ fontSize: 20 }} />
                    <Title level={4} style={{ color: "white", margin: 0 }}>
                        {isGuardianMode
                            ? `Select Guardian Access for ${formData.name}`
                            : `Select What to Share with ${formData.name}`}
                    </Title>
                </div>

                {/* Body */}
                <div style={{ padding: "24px", backgroundColor: "#fff", maxHeight: "60vh", overflowY: "auto" }}>
                    {Hubs.map(({ label, children }, index) => (
                        <div key={label.name} style={{ marginBottom: 24 }}>
                            {/* Section Title with Parent Checkbox */}
                            <Checkbox
                                checked={isParentChecked(label.name)}
                                onChange={(e) => toggleParent(label.name, e.target.checked)}
                                disabled={!children.length}
                            >
                                <Text strong style={{ fontSize: 16 }}>{label.title}</Text>
                            </Checkbox>

                            {/* Child Options */}
                            {children.length > 0 && (
                                <div style={{ marginLeft: 24, marginTop: 8 }}>
                                    {children.map((child) => (
                                        <div key={child.name} style={{ marginBottom: 8 }}>
                                            <Checkbox
                                                checked={formData.sharedItems[label.name]?.includes(child.name) || false}
                                                onChange={() => toggleChild(label.name, child.name)}
                                            >
                                                {child.title}
                                            </Checkbox>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Divider between categories */}
                            {index < Hubs.length - 1 && (
                                <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 24 }} />
                            )}
                        </div>
                    ))}

                    {/* Validation message */}
                    {!hasSelectedItems && (
                        <Text style={{ color: "red", display: "block", marginTop: -10, marginBottom: 16 }}>
                            Please select at least one item to share before continuing.
                        </Text>
                    )}
                </div>

                {/* Footer Buttons */}
                <div
                    style={{
                        backgroundColor: "#f9fafb",
                        padding: "16px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottomLeftRadius: "12px",
                        borderBottomRightRadius: "12px",
                        borderTop: "1px solid #f0f0f0",
                    }}
                >
                    <Button
                        onClick={() => setStep("add")}
                        size="large"
                        style={{
                            borderRadius: 8,
                            padding: "6px 24px",
                            fontWeight: 500,
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        disabled={!hasSelectedItems}
                        onClick={() => {
                            setPendingMember(formData);
                            setStep("review");
                        }}
                        style={{
                            borderRadius: 8,
                            padding: "6px 24px",
                            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                            border: "none",
                            fontWeight: 500,
                        }}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        );
    };

    const renderReview = () => (
        <div style={{ padding: 0, borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
            {/* Gradient Header */}
            <div
                style={{
                    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    padding: "20px 24px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                }}
            >
                <CheckCircleOutlined style={{ fontSize: 20 }} />
                <Title level={4} style={{ color: "white", margin: 0 }}>
                    Review Invitation
                </Title>
            </div>

            {/* Body */}
            <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: 16 }}>
                    <Text strong>To:</Text>{" "}
                    <Text type="secondary">
                        {formData.method === "Email"
                            ? formData.email
                            : formData.method === "Mobile"
                            ? formData.phone
                            : formData.accessCode}
                    </Text>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <Text strong>Name:</Text>{" "}
                    <Text type="secondary">{formData.name}</Text>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <Text strong>Relationship:</Text>{" "}
                    <Text type="secondary">{formData.relationship}</Text>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <Text strong>Access:</Text>{" "}
                    <Tag color="blue">{formData.permissions.type}</Tag>
                </div>

                {formData.permissions.type === "Custom Access" && (
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Permissions:</Text>{" "}
                        {[
                            formData.permissions.allowAdd && <Tag key="add">Add</Tag>,
                            formData.permissions.allowEdit && <Tag key="edit">Edit</Tag>,
                            formData.permissions.allowDelete && <Tag key="delete">Delete</Tag>,
                            formData.permissions.allowInvite && <Tag key="invite">Invite</Tag>,
                            formData.permissions.notify && <Tag key="notify">Notify</Tag>,
                        ].filter(Boolean).length > 0 ? (
                            <>{[
                                formData.permissions.allowAdd && <Tag key="add">Add</Tag>,
                                formData.permissions.allowEdit && <Tag key="edit">Edit</Tag>,
                                formData.permissions.allowDelete && <Tag key="delete">Delete</Tag>,
                                formData.permissions.allowInvite && <Tag key="invite">Invite</Tag>,
                                formData.permissions.notify && <Tag key="notify">Notify</Tag>,
                            ].filter(Boolean)}</>
                        ) : (
                            <Tag color="default">None</Tag>
                        )}
                    </div>
                )}

                <Divider style={{ margin: "32px 0 16px" }}>
                    <Text strong style={{ fontSize: 16 }}>Shared Items</Text>
                </Divider>

                {Object.entries(formData.sharedItems).map(([categoryName, items]) => {
                    const categoryData = Hubs.find((c) => c.label.name === categoryName);
                    if (!categoryData || items.length === 0) return null;

                    return (
                        <div key={categoryName} style={{ marginBottom: "24px" }}>
                            <Text strong style={{ fontSize: "16px" }}>{categoryData.label.title}</Text>
                            <ul style={{ paddingLeft: "24px", marginTop: "6px" }}>
                                {items.map((itemName) => {
                                    const child = categoryData.children.find((c) => c.name === itemName);
                                    return (
                                        <li key={`${categoryName}-${itemName}`} style={{ margin: "4px 0", fontSize: "14px", color: "#3b82f6" }}>
                                            {child?.title || itemName}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Footer Buttons */}
            <div
                style={{
                    backgroundColor: "#f9fafb",
                    padding: "16px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #f0f0f0",
                    borderBottomLeftRadius: "12px",
                    borderBottomRightRadius: "12px",
                }}
            >
                <Button
                    onClick={() => setStep("share")}
                    size="large"
                    style={{
                        borderRadius: 8,
                        padding: "6px 24px",
                        fontWeight: 500,
                    }}
                >
                    ← Back
                </Button>
                <Button
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={handleSendInvitation}
                    icon={<SendOutlined />}
                    style={{
                        borderRadius: 8,
                        padding: "6px 24px",
                        background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                        border: "none",
                        fontWeight: 500,
                    }}
                >
                    Send Invitation
                </Button>
            </div>
        </div>
    );

    const renderSent = () => (
        <div style={{ textAlign: "center", padding: "10px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>Invitation Sent!</h3>
            <p style={{ marginBottom: "20px" }}>
                An invitation has been sent to {pendingMember?.name || "the family member"}.
            </p>
            <Button
                type="primary"
                onClick={() => {
                    console.log("Done clicked, closing modal");
                    onCancel(); // Close the modal
                }}
                style={{ borderRadius: "20px", padding: "5px 15px", backgroundColor: "#1890ff", borderColor: "#1890ff" }}
            >
                Done
            </Button>
        </div>
    );

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            centered
            style={{
                borderRadius: "12px",
                padding: 0,
            }}
            styles={{
                body: {
                    padding: 24,
                    borderRadius: "0 0 12px 12px",
                    maxHeight: "70vh",
                    overflowY: "auto",
                    background: "#fff",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                },
            }}
        >
            {step === "add" && renderAddForm()}
            {step === "share" && renderSharingOptions()}
            {step === "review" && renderReview()}
            {step === "sent" && renderSent()}
        </Modal>
    );
};

export default FamilyInviteForm;