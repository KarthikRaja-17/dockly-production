import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, message, Button, Divider, Typography } from 'antd';
import { 
  addNote, 
  getNoteCategories, 
  addNoteCategory 
} from '../../services/family';
import {
  PlusOutlined,
  BoldOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  HeartOutlined,
  HomeOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const PRIMARY_COLOR = '#1890ff';

interface AddNoteModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
    selectedCategoryId?: number; // Optional: pre-select a category
}

interface ApiCategory {
    id: number;
    title: string;
    icon: string;
    pinned: boolean;
}

// Enhanced hub options with colors and icons
const hubOptions = [
  {
    value: "FAMILY",
    label: "Family",
    color: "#eb2f96",
    icon: <TeamOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "FINANCE",
    label: "Finance", 
    color: "#13c2c2",
    icon: <DollarOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "PLANNER",
    label: "Planner",
    color: "#9254de", 
    icon: <CalendarOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "HEALTH",
    label: "Health",
    color: "#f5222d",
    icon: <HeartOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "HOME", 
    label: "Home",
    color: "#fa8c16",
    icon: <HomeOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "NONE",
    label: "Utilities",
    color: "#722ed1",
    icon: <SettingOutlined style={{ fontSize: "12px" }} />,
  },
];

const suggestedCategories = [
  { label: "💰 Budget & Finance", value: "Budget & Finance", icon: "💰" },
  { label: "🏥 Health & Medical", value: "Health & Medical", icon: "🏥" },
  { label: "🚗 Car & Maintenance", value: "Car & Maintenance", icon: "🚗" },
  { label: "🎯 Goals & Plans", value: "Goals & Plans", icon: "🎯" },
  { label: "📚 Books & Movies", value: "Books & Movies", icon: "📚" },
  { label: "🏃 Fitness & Exercise", value: "Fitness & Exercise", icon: "🏃" },
  { label: "🧹 Cleaning & Chores", value: "Cleaning & Chores", icon: "🧹" },
  { label: "👥 Family Events", value: "Family Events", icon: "👥" },
  { label: "🎨 Hobbies & Crafts", value: "Hobbies & Crafts", icon: "🎨" },
  { label: "📞 Contacts & Info", value: "Contacts & Info", icon: "📞" },
  { label: "🌱 Garden & Plants", value: "Garden & Plants", icon: "🌱" },
  { label: "🎓 Education & Learning", value: "Education & Learning", icon: "🎓" },
  { label: "💻 Technology & Apps", value: "Technology & Apps", icon: "💻" },
  { label: "✈ Travel & Vacation", value: "Travel & Vacation", icon: "✈" },
  { label: "🔧 Home Improvement", value: "Home Improvement", icon: "🔧" },
  { label: "📝 Work & Projects", value: "Work & Projects", icon: "📝" },
  { label: "🎉 Party Planning", value: "Party Planning", icon: "🎉" },
  { label: "🐾 Pet Care", value: "Pet Care", icon: "🐾" },
  { label: "🎪 Kids Activities", value: "Kids Activities", icon: "🎪" },
  { label: "💡 Ideas & Inspiration", value: "Ideas & Inspiration", icon: "💡" },
  { label: "Add Custom Category", value: "Add Custom Category", icon: "✍" },
];

// Word counting functions
const countWords = (text: string): number => {
  if (!text) return 0;
  const plainText = text.replace(/<[^>]*>/g, " ");
  return plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0 && word !== "").length;
};

const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

// Rich Text Editor Component
const RichTextEditor = ({
  value,
  onChange,
  style,
  showWordCount = false,
  maxWords = 500,
}: {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  showWordCount?: boolean;
  maxWords?: number;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const wordCount = countWords(value);

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    
    try {
      if (document.queryCommandState('bold')) formats.add('bold');
      if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
      if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    } catch (e) {
      // Silently handle any errors
    }
    
    setActiveFormats(formats);
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    setTimeout(updateActiveFormats, 10);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleKeyUp = () => {
    updateActiveFormats();
  };

  const handleMouseUp = () => {
    updateActiveFormats();
  };

  useEffect(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      const newValue = value || "";

      if (currentContent !== newValue) {
        editorRef.current.innerHTML = newValue;

        if (newValue) {
          const range = document.createRange();
          const selection = window.getSelection();
          if (selection) {
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }
    updateActiveFormats();
  }, [value]);

  return (
    <div style={{ border: "1px solid #d9d9d9", borderRadius: "8px", ...style }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "6px 10px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
        }}
      >
        <Button
          size="small"
          icon={<BoldOutlined />}
          onClick={() => applyFormat("bold")}
          style={{
            minWidth: 28,
            height: 24,
            backgroundColor: activeFormats.has('bold') ? '#1890ff' : undefined,
            color: activeFormats.has('bold') ? '#fff' : undefined,
            borderColor: activeFormats.has('bold') ? '#1890ff' : undefined,
          }}
        />
        <Button
          size="small"
          icon={<UnorderedListOutlined />}
          onClick={() => applyFormat("insertUnorderedList")}
          style={{
            minWidth: 28,
            height: 24,
            backgroundColor: activeFormats.has('ul') ? '#1890ff' : undefined,
            color: activeFormats.has('ul') ? '#fff' : undefined,
            borderColor: activeFormats.has('ul') ? '#1890ff' : undefined,
          }}
        />
        <Button
          size="small"
          icon={<OrderedListOutlined />}
          onClick={() => applyFormat("insertOrderedList")}
          style={{
            minWidth: 28,
            height: 24,
            backgroundColor: activeFormats.has('ol') ? '#1890ff' : undefined,
            color: activeFormats.has('ol') ? '#fff' : undefined,
            borderColor: activeFormats.has('ol') ? '#1890ff' : undefined,
          }}
        />
        <Divider type="vertical" style={{ height: "24px", margin: "0 2px" }} />
        <Button
          size="small"
          icon={<UndoOutlined />}
          onClick={() => applyFormat("undo")}
          style={{ minWidth: 28, height: 24 }}
        />
        <Button
          size="small"
          icon={<RedoOutlined />}
          onClick={() => applyFormat("redo")}
          style={{ minWidth: 28, height: 24 }}
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        data-placeholder="Enter your description..."
        style={{
          minHeight: "80px",
          padding: "10px",
          fontSize: "13px",
          lineHeight: "1.5",
          fontFamily: FONT_FAMILY,
          outline: "none",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
          caretColor: "#000000",
        }}
        suppressContentEditableWarning={true}
      />

      {/* Word Count */}
      {showWordCount && (
        <div
          style={{
            padding: "4px 10px",
            borderTop: "1px solid #f0f0f0",
            fontSize: "11px",
            color: wordCount > maxWords ? "#ff4d4f" : "#8c8c8c",
            textAlign: "right",
          }}
        >
          {wordCount}/{maxWords} words
        </div>
      )}
    </div>
  );
};

const getHubDisplayName = (hub: string): string => {
    const hubOption = hubOptions.find(h => h.value === hub);
    return hubOption?.label || hub;
};

const AddNoteModal: React.FC<AddNoteModalProps> = ({ 
  visible, 
  onCancel, 
  onSuccess,
  selectedCategoryId
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [selectedHubs, setSelectedHubs] = useState<string[]>([]);
    const [richTextValue, setRichTextValue] = useState<string>("");
    
    // Category creation states
    const [categoryType, setCategoryType] = useState<"existing" | "new">("existing");
    const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>("");
    const [customCategoryName, setCustomCategoryName] = useState<string>("");

    useEffect(() => {
        if (visible) {
            fetchCategories();
            setSelectedHubs([]);
            setRichTextValue("");
            
            // Set category type based on selectedCategoryId
            if (selectedCategoryId) {
                setCategoryType("existing");
            } else {
                setCategoryType("new");
            }
            
            // Reset form and states
            form.resetFields();
            setSelectedCategoryOption("");
            setCustomCategoryName("");
        }
    }, [visible, selectedCategoryId]);

    const fetchCategories = async () => {
        try {
            const response = await getNoteCategories();
            if (response?.data?.status === 1) {
                const apiCategories = response.data.payload || [];
                setCategories(apiCategories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Failed to fetch categories');
        }
    };

    const handleCategorySelection = (value: string) => {
        setSelectedCategoryOption(value);
        if (value !== "Add Custom Category") {
            setCustomCategoryName("");
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Validate word counts
            const titleWordCount = countWords(values.title);
            const descriptionWordCount = countWords(richTextValue);

            if (titleWordCount > 20) {
                message.error("Title must be 20 words or less");
                return;
            }

            if (descriptionWordCount > 500) {
                message.error("Description must be 500 words or less");
                return;
            }

            if (!stripHtml(richTextValue).trim()) {
                message.error("Please enter a description");
                return;
            }

            if (!selectedHubs || selectedHubs.length === 0) {
                message.error("Please select at least one hub");
                return;
            }

            setLoading(true);
            const user_id = localStorage.getItem("userId") || "";
            let categoryId = selectedCategoryId;

            // Create new category if needed
            if (categoryType === "new") {
                let categoryName = "";
                let categoryIcon = "✍";

                if (selectedCategoryOption === "Add Custom Category") {
                    categoryName = customCategoryName.trim();
                    if (!categoryName) {
                        message.error("Please enter a custom category name");
                        return;
                    }
                } else if (selectedCategoryOption) {
                    categoryName = selectedCategoryOption;
                    const selectedOption = suggestedCategories.find(
                        (cat) => cat.value === selectedCategoryOption
                    );
                    categoryIcon = selectedOption?.icon || "✍";
                } else {
                    message.error("Please select a category");
                    return;
                }

                if (categories.some((c) => c.title === categoryName)) {
                    message.error("Category already exists");
                    return;
                }

                try {
                    const categoryRes = await addNoteCategory({
                        name: categoryName,
                        icon: categoryIcon,
                        user_id,
                    });

                    if (categoryRes.data.status === 1) {
                        categoryId = categoryRes.data.payload.id;
                        message.success(`Category "${categoryName}" created successfully!`);
                    } else {
                        message.error("Failed to create category");
                        return;
                    }
                } catch (err) {
                    console.error("Error creating category:", err);
                    message.error("Failed to create category");
                    return;
                }
            } else if (!categoryId) {
                // If existing category but no categoryId, get from form
                categoryId = values.category_id;
                if (!categoryId) {
                    message.error("Please select a category");
                    return;
                }
            }

            try {
                const addNotePromises = selectedHubs.map(hub =>
                    addNote({
                        title: values.title,
                        description: richTextValue,
                       category_id: categoryId!,
                        user_id,
                        hub: hub,
                    })
                );

                const results = await Promise.all(addNotePromises);
                const successfulHubs: string[] = [];
                const failedHubs: string[] = [];

                results.forEach((result: { data: { status: number } }, index: number) => {
                    if (result.data.status === 1) {
                        successfulHubs.push(getHubDisplayName(selectedHubs[index]));
                    } else {
                        failedHubs.push(getHubDisplayName(selectedHubs[index]));
                    }
                });

                if (successfulHubs.length > 0) {
                    message.success(`Note added to ${successfulHubs.join(", ")} successfully! 📝`);
                }

                if (failedHubs.length > 0) {
                    message.warning(`Failed to add note to ${failedHubs.join(", ")}`);
                }

                if (successfulHubs.length > 0) {
                    handleClose();
                    onSuccess?.();
                }
            } catch (err) {
                console.error("Error adding note:", err);
                message.error("Failed to add note");
            }
        } catch (err) {
            console.error("Error in submit:", err);
            message.error("Failed to process request");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedHubs([]);
        setRichTextValue("");
        setSelectedCategoryOption("");
        setCustomCategoryName("");
        setCategoryType("existing");
        onCancel();
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_FAMILY }}>
                    <div
                        style={{
                            width: 28,
                            height: 28,
                            backgroundColor: PRIMARY_COLOR,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <PlusOutlined style={{ color: "#fff", fontSize: 12 }} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                        Add New Note
                        {selectedCategoryId && categories.find(cat => cat.id === selectedCategoryId) && 
                            ` to ${categories.find(cat => cat.id === selectedCategoryId)?.title}`
                        }
                    </span>
                </div>
            }
            open={visible}
            onCancel={handleClose}
            onOk={handleSubmit}
            centered
            width={500}
            okText="Add Note"
            confirmLoading={loading}
            destroyOnClose
            style={{ fontFamily: FONT_FAMILY }}
            okButtonProps={{
                style: {
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                    fontFamily: FONT_FAMILY,
                    borderRadius: 6,
                    height: 36,
                    fontSize: 13,
                    fontWeight: 500,
                },
            }}
            cancelButtonProps={{
                style: {
                    fontFamily: FONT_FAMILY,
                    borderRadius: 6,
                    height: 36,
                    fontSize: 13,
                },
            }}
        >
            <Form form={form} layout="vertical" size="small">
                {/* Category Selection - Only show if not auto-populated */}
                {!selectedCategoryId && (
                    <Form.Item
                        label={
                            <Text style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: FONT_FAMILY }}>
                                📂 Category 
                            </Text>
                        }
                        required
                    >
                        <div style={{ marginBottom: 12 }}>
                            {categoryType === "existing" && (
                                <Form.Item
                                    name="category_id"
                                    rules={[{ required: true, message: "Please select a category" }]}
                                    style={{ marginBottom: 8 }}
                                >
                                    <Select
                                        placeholder="Select an existing category"
                                        style={{ width: "100%", fontFamily: FONT_FAMILY }}
                                        size="middle"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.children as any)?.props?.children?.[1]?.props?.children
                                                ?.toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {categories.map((category) => (
                                            <Select.Option key={category.id} value={category.id}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span>{category.icon}</span>
                                                    <span>{category.title}</span>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            {categoryType === "new" && (
                                <>
                                    <Select
                                        placeholder="Choose a category or select 'Add Custom Category' for custom"
                                        value={selectedCategoryOption}
                                        onChange={handleCategorySelection}
                                        style={{ width: "100%", fontFamily: FONT_FAMILY, marginBottom: 8 }}
                                        showSearch
                                        size="middle"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={suggestedCategories.filter(
                                            (cat) => !categories.some((existingCat) => existingCat.title === cat.value)
                                        )}
                                    />

                                    {selectedCategoryOption === "Add Custom Category" && (
                                        <Input
                                            placeholder="Enter your custom category name"
                                            value={customCategoryName}
                                            onChange={(e) => setCustomCategoryName(e.target.value)}
                                            style={{ width: "100%", fontFamily: FONT_FAMILY, height: 32, borderRadius: 6 }}
                                            maxLength={30}
                                        />
                                    )}

                                    {selectedCategoryOption && selectedCategoryOption !== "Add Custom Category" && (
                                        <div
                                            style={{
                                                padding: 8,
                                                backgroundColor: "#f0fdf4",
                                                border: "1px solid #bbf7d0",
                                                borderRadius: 6,
                                                marginTop: 6,
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <span style={{ fontSize: 14 }}>
                                                    {suggestedCategories.find((cat) => cat.value === selectedCategoryOption)?.icon}
                                                </span>
                                                <span
                                                    style={{
                                                        fontWeight: 500,
                                                        fontFamily: FONT_FAMILY,
                                                        fontSize: 12,
                                                        color: "#15803d",
                                                    }}
                                                >
                                                    {selectedCategoryOption}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <Button
                                    type={categoryType === "existing" ? "primary" : "default"}
                                    size="small"
                                    onClick={() => setCategoryType("existing")}
                                    style={{ fontFamily: FONT_FAMILY, borderRadius: 4 }}
                                >
                                    Existing
                                </Button>
                                <Button
                                    type={categoryType === "new" ? "primary" : "default"}
                                    size="small"
                                    onClick={() => setCategoryType("new")}
                                    style={{ fontFamily: FONT_FAMILY, borderRadius: 4 }}
                                >
                                    Create New
                                </Button>
                            </div>
                        </div>
                    </Form.Item>
                )}

                {/* Show selected category if auto-populated */}
                {selectedCategoryId && (
                    <Form.Item
                        label={
                            <Text style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: FONT_FAMILY }}>
                                📂 Category
                            </Text>
                        }
                    >
                        <div
                            style={{
                                padding: 8,
                                backgroundColor: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <span style={{ fontSize: 14 }}>
                                {categories.find(cat => cat.id === selectedCategoryId)?.icon}
                            </span>
                            <span
                                style={{
                                    fontWeight: 500,
                                    fontFamily: FONT_FAMILY,
                                    fontSize: 12,
                                    color: "#15803d",
                                }}
                            >
                                {categories.find(cat => cat.id === selectedCategoryId)?.title}
                            </span>
                            <Button
                                type="text"
                                size="small"
                                onClick={() => {
                                    // Allow changing category
                                    setCategoryType("existing");
                                }}
                                style={{ fontSize: 10, marginLeft: "auto", color: "#6b7280" }}
                            >
                                Change
                            </Button>
                        </div>
                    </Form.Item>
                )}

                {/* Note Title with Word Count */}
                <Form.Item
                    name="title"
                    label={
                        <Text style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: FONT_FAMILY }}>
                            📝 Title 
                        </Text>
                    }
                    rules={[
                        { required: true, message: "Please enter a title" },
                        {
                            validator: (_, value) => {
                                const wordCount = countWords(value);
                                if (wordCount > 20) {
                                    return Promise.reject(new Error("Title must be 20 words or less"));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                    style={{ marginBottom: 12 }}
                >
                    <div>
                        <Input
                            placeholder="Enter title"
                            style={{ fontFamily: FONT_FAMILY, height: 32, borderRadius: 6 }}
                            size="middle"
                            onChange={(e) => {
                                form.setFieldsValue({ title: e.target.value });
                            }}
                        />
                        <div
                            style={{
                                fontSize: 11,
                                color: countWords(form.getFieldValue("title") || "") > 20 ? "#ff4d4f" : "#8c8c8c",
                                marginTop: 4,
                                textAlign: "right",
                            }}
                        >
                            {countWords(form.getFieldValue("title") || "")}/20 words
                        </div>
                    </div>
                </Form.Item>

                {/* Note Description with Rich Text Editor */}
                <Form.Item
                    name="description"
                    label={
                        <Text style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: FONT_FAMILY }}>
                            📄 Description 
                        </Text>
                    }
                    rules={[
                        { required: true, message: "Please enter a description" },
                        {
                            validator: (_, value) => {
                                const plainText = stripHtml(richTextValue || "");
                                if (!plainText.trim()) {
                                    return Promise.reject(new Error("Please enter a description"));
                                }
                                const wordCount = countWords(richTextValue || "");
                                if (wordCount > 500) {
                                    return Promise.reject(new Error("Description must be 500 words or less"));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                    style={{ marginBottom: 12 }}
                >
                    <RichTextEditor
                        value={richTextValue}
                        onChange={setRichTextValue}
                        style={{ fontFamily: FONT_FAMILY, borderRadius: 6, minHeight: "120px" }}
                        showWordCount={true}
                        maxWords={500}
                    />
                </Form.Item>

                {/* Hub Selection with Enhanced Options */}
                <Form.Item
                    name="hubs"
                    label={
                        <Text style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: FONT_FAMILY }}>
                            🎯 Select Hubs 
                        </Text>
                    }
                    rules={[{ required: true, message: "Please select at least one hub" }]}
                    style={{ marginBottom: 12 }}
                >
                    <Select
                        mode="multiple"
                        placeholder="Choose hubs for this note"
                        value={selectedHubs}
                        onChange={setSelectedHubs}
                        options={hubOptions.map((hub) => ({
                            label: (
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div
                                        style={{
                                            width: 16,
                                            height: 16,
                                            backgroundColor: hub.color,
                                            borderRadius: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {React.cloneElement(hub.icon, {
                                            style: { fontSize: "10px", color: "#fff" },
                                        })}
                                    </div>
                                    {hub.label}
                                </div>
                            ),
                            value: hub.value,
                        }))}
                        style={{ width: "100%", fontFamily: FONT_FAMILY }}
                        size="middle"
                        maxTagCount="responsive"
                        showArrow
                    />
                </Form.Item>

                {/* Info Box */}
                <div
                    style={{
                        fontSize: 11,
                        color: "#6b7280",
                        marginTop: 8,
                        fontFamily: FONT_FAMILY,
                        padding: "8px 12px",
                        backgroundColor: "#f8fafc",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <span style={{ fontSize: 12 }}>💡</span>
                    <span>
                        {selectedCategoryId
                            ? `This note will be added to the selected category in your chosen hubs.`
                            : categoryType === "new"
                            ? "Categories are shared across all hubs, but notes are specific to each selected hub."
                            : "This note will be added to the selected existing category in your chosen hubs."}
                    </span>
                </div>
            </Form>
        </Modal>
    );
};

export default AddNoteModal;