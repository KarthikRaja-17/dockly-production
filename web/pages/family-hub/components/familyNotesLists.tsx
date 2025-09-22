"use client";
import {
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  MoreOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  TagOutlined,
  MailOutlined,
  DownOutlined,
  UpOutlined,
  StarOutlined,
  StarFilled,
  PushpinOutlined,
  PushpinFilled,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  BoldOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Input,
  message,
  Modal,
  Select,
  Typography,
  Form,
  Dropdown,
  Avatar,
  Empty,
  Card,
  Space,
  Tooltip,
  Button,
  Tag,
  Popconfirm,
  Divider,
} from "antd";

import { useState, useEffect, useRef } from "react";
import {
  getAllNotes,
  updateNote,
  addNote,
  addNoteCategory,
  getNoteCategories,
  updateNoteCategory,
  deleteNoteCategory,
  deleteNote,
  shareNote,
  getUsersFamilyMembers,
} from "../../../services/family";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../../app/userContext";
import { PRIMARY_COLOR } from "../../../app/comman";
import DocklyLoader from "../../../utils/docklyLoader";

const { Title, Text } = Typography;
const { TextArea } = Input;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface Note {
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  id?: number;
  hub?: string;
  hubs?: string[];
}

interface Category {
  title: string;
  icon: string;
  items: Note[];
  category_id?: number;
  pinned?: boolean;
}

interface ApiCategory {
  pinned: boolean;
  id: number;
  title: string;
  icon: string;
  hub?: string;
}

interface ApiNote {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  created_at: string;
  updated_at: string;
  hub?: string;
}

interface NotesListsProps {
  currentHub?: string;
  showAllHubs?: boolean;
}

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
  {
    label: "🎓 Education & Learning",
    value: "Education & Learning",
    icon: "🎓",
  },
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

const categoryColorMap: Record<string, string> = {
  "Budget & Finance": "#af630bff",
  "Health & Medical": "#9f0aaaff",
  "Car & Maintenance": "#fa541c",
  "Goals & Plans": "#52c41a",
  "Books & Movies": "#2c0447ff",
  "Fitness & Exercise": "#13c2c2",
  "Cleaning & Chores": "#a01010ff",
  "Family Events": "#eb2f96",
  "Hobbies & Crafts": "#8b5cf6",
  "Contacts & Info": "#3a1e1eff",
  "Garden & Plants": "#10b981",
  "Education & Learning": "#2563eb",
  "Technology & Apps": "#ec4899",
  "Travel & Vacation": "#f97316",
  "Home Improvement": "#dc2626",
  "Work & Projects": "#7c3aed",
  "Party Planning": "#059669",
  "Pet Care": "#ea580c",
  "Kids Activities": "#0891b2",
  "Ideas & Inspiration": "#be185d",
 "Add Custom Category": "#6b7280",
};

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return `#${color.padStart(6, "0")}`;
};

const getHubDisplayName = (hub: string): string => {
  const hubNames: Record<string, string> = {
    family: "Family",
    finance: "Finance",
    planner: "Planner",
    health: "Health",
    home: "Home",
  };
  return hubNames[hub] || hub.charAt(0).toUpperCase() + hub.slice(1);
};

const getHubColor = (hub: string): string => {
  const hubColors: Record<string, string> = {
    family: "#eb2f96",
    finance: "#13c2c2",
    planner: "#9254de",
    health: "#f5222d",
    home: "#fa8c16",
  };
  return hubColors[hub] || "#6b7280";
};

// Helper function to count words in text (including HTML content)
const countWords = (text: string): number => {
  if (!text || text.trim() === "") return 0;
  // Strip HTML tags and count words
  const plainText = text.replace(/<[^>]*>/g, " ");
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  return words.length;
};

// Helper function to validate title word count (max 20 words)
const validateTitleWords = (title: string): boolean => {
  return countWords(title) <= 20;
};

// Helper function to validate description word count (max 500 words)
const validateDescriptionWords = (description: string): boolean => {
  return countWords(description) <= 500;
};

// Helper function to truncate title to 10 words
const truncateTitle = (title: string, wordLimit: number = 10): string => {
  const words = title.split(" ");
  if (words.length <= wordLimit) {
    return title;
  }
  return words.slice(0, wordLimit).join(" ") + "...";
};

// Helper function to truncate description to 200 characters
const truncateDescription = (
  description: string,
  charLimit: number = 2000
): string => {
  if (description.length <= charLimit) {
    return description;
  }
  return description.slice(0, charLimit).trim() + "...";
};

// Helper function to strip HTML tags for plain text display
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
};

// Helper function to render HTML content safely with smooth scrolling
const renderHtmlContent = (
  html: string,
  maxLength?: number
): React.ReactNode => {
  if (!html) return "";

  let content = html;
  if (maxLength) {
    const plainText = stripHtml(html);
    if (plainText.length > maxLength) {
      // Find a reasonable cutoff point in the HTML
      const truncated = plainText.substring(0, maxLength) + "...";
      return <span>{truncated}</span>;
    }
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        wordBreak: "break-word",
        lineHeight: "1.4",
        overflowWrap: "break-word",
        wordWrap: "break-word",
        hyphens: "auto",
        maxWidth: "100%",
        maxHeight: "60px",
        overflowY: "auto",
        scrollBehavior: "smooth",
      }}
      className="note-content-scroll"
    />
  );
};

// Rich Text Editor Component with scrollbars and improved styling
const RichTextEditor = ({
  value,
  onChange,
  style,
  showWordCount = false,
}: {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  showWordCount?: boolean;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const wordCount = countWords(value);
  const isOverLimit = wordCount > 500;

  const checkActiveFormats = () => {
    const formats = new Set<string>();
    
    try {
      if (document.queryCommandState('bold')) formats.add('bold');
      if (document.queryCommandState('insertUnorderedList')) formats.add('unorderedList');
      if (document.queryCommandState('insertOrderedList')) formats.add('orderedList');
    } catch (e) {
      // Ignore errors in queryCommandState
    }
    
    setActiveFormats(formats);
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    // Check active formats after applying
    setTimeout(checkActiveFormats, 100);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelectionChange = () => {
    checkActiveFormats();
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      // Only update if the content is different and value is not undefined/null
      const currentContent = editorRef.current.innerHTML;
      const newValue = value || "";

      if (currentContent !== newValue) {
        editorRef.current.innerHTML = newValue;

        // Position cursor at end only if there's content
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
  }, [value]);

  return (
    <div style={{ border: "1px solid #d9d9d9", borderRadius: "8px", ...style }}>
      {/* Enhanced Toolbar with Active State Indicators */}
      <div
        style={{
          padding: "6px 10px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
        }}
      >
        <>
          <Tooltip title="Bold">
            <Button
              size="small"
              icon={<BoldOutlined />}
              onClick={() => applyFormat("bold")}
              style={{ 
                minWidth: 28, 
                height: 24,
                backgroundColor: activeFormats.has('bold') ? '#1890ff' : 'transparent',
                color: activeFormats.has('bold') ? '#fff' : 'inherit',
                borderColor: activeFormats.has('bold') ? '#1890ff' : '#d9d9d9',
              }}
            />
          </Tooltip>

          <Tooltip title="Bulleted List">
            <Button
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => applyFormat("insertUnorderedList")}
              style={{ 
                minWidth: 28, 
                height: 24,
                backgroundColor: activeFormats.has('unorderedList') ? '#1890ff' : 'transparent',
                color: activeFormats.has('unorderedList') ? '#fff' : 'inherit',
                borderColor: activeFormats.has('unorderedList') ? '#1890ff' : '#d9d9d9',
              }}
            />
          </Tooltip>

          <Tooltip title="Numbered List">
            <Button
              size="small"
              icon={<OrderedListOutlined />}
              onClick={() => applyFormat("insertOrderedList")}
              style={{ 
                minWidth: 28, 
                height: 24,
                backgroundColor: activeFormats.has('orderedList') ? '#1890ff' : 'transparent',
                color: activeFormats.has('orderedList') ? '#fff' : 'inherit',
                borderColor: activeFormats.has('orderedList') ? '#1890ff' : '#d9d9d9',
              }}
            />
          </Tooltip>

          <Divider
            type="vertical"
            style={{ height: "24px", margin: "0 2px" }}
          />

          <Tooltip title="Undo">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={() => applyFormat("undo")}
              style={{ minWidth: 28, height: 24 }}
            />
          </Tooltip>

          <Tooltip title="Redo">
            <Button
              size="small"
              icon={<RedoOutlined />}
              onClick={() => applyFormat("redo")}
              style={{ minWidth: 28, height: 24 }}
            />
          </Tooltip>
        </>
      </div>

      {/* Enhanced Editor with Better Text Wrapping and scrollbars */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder="Enter your description..."
        style={{
          minHeight: "80px",
          maxHeight: "200px",
          padding: "10px",
          fontSize: "14px",
          lineHeight: "1.5",
          fontFamily: FONT_FAMILY,
          outline: "none",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          wordWrap: "break-word",
          hyphens: "auto",
          maxWidth: "100%",
          whiteSpace: "pre-wrap",
          caretColor: "#000000",
          overflowY: "auto",
          overflowX: "auto",
          scrollBehavior: "smooth",
        }}
        suppressContentEditableWarning={true}
      />

      {/* Word Count Display */}
      {showWordCount && (
        <div
          style={{
            padding: "4px 10px",
            borderTop: "1px solid #f0f0f0",
            fontSize: "12px",
            color: isOverLimit ? "#ff4d4f" : "#8c8c8c",
            textAlign: "right",
            fontFamily: FONT_FAMILY,
          }}
        >
          {wordCount}/500 words
        </div>
      )}

      {/* Global styles for formatted content to show properly */}
      <style jsx>{`
        div[contenteditable] strong,
        div[contenteditable] b {
          color: #1890ff !important;
          font-weight: bold;
        }
        
        div[contenteditable] ul,
        div[contenteditable] ol {
          color: #1890ff !important;
          padding-left: 20px;
        }
        
        div[contenteditable] ul li,
        div[contenteditable] ol li {
          color: #1890ff !important;
          margin: 4px 0;
          word-break: break-word;
          overflow-wrap: break-word;
          word-wrap: break-word;
          hyphens: auto;
          max-width: 100%;
        }
        
        div[contenteditable] ul li::marker,
        div[contenteditable] ol li::marker {
          color: #1890ff !important;
        }

        /* Ensure text wrapping for all content */
        div[contenteditable] * {
          word-break: break-word;
          overflow-wrap: break-word;
          word-wrap: break-word;
          hyphens: auto;
          max-width: 100%;
        }

        /* Handle very long words without spaces */
        div[contenteditable] {
          overflow-wrap: anywhere;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
};

const NotesLists: React.FC<NotesListsProps> = ({
  currentHub,
  showAllHubs = false,
}) => {
  const [activeHub, setActiveHub] = useState<string>(currentHub || "family");
  const router = useRouter();
  const username = useCurrentUser()?.user_name || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Note form states
  const [showNoteForm, setShowNoteForm] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<Note>({ title: "", description: "" });
  const [richTextValue, setRichTextValue] = useState<string>("");

  // Inline editing states
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteData, setEditingNoteData] = useState<Note>({
    title: "",
    description: "",
  });
  const [editingRichTextValue, setEditingRichTextValue] = useState<string>("");
  const titleInputRef = useRef<any>(null);

  // Combined modal states
  const [combinedModalVisible, setCombinedModalVisible] = useState(false);
  const [categoryType, setCategoryType] = useState<"existing" | "new">(
    "existing"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedCategoryOption, setSelectedCategoryOption] =
    useState<string>("");
  const [customCategoryName, setCustomCategoryName] = useState<string>("");
  const [modalRichTextValue, setModalRichTextValue] = useState<string>("");

  const [form] = Form.useForm();

  // Combined share modal states
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [currentShareNote, setCurrentShareNote] = useState<Note | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [shareForm] = Form.useForm();
  const [familyMembers, setFamilyMembers] = useState([]);
  
  // Add search term state for share modal - SAME AS BOOKMARKS
  const [searchTerm, setSearchTerm] = useState("");

  // Filter family members based on search term AND excluding pending/me - SAME LOGIC AS BOOKMARKS
  const filteredFamilyMembers = familyMembers
    .filter((member: any) => member.relationship !== "me")
    .filter((member: any) => member.status?.toLowerCase() !== "pending") // Added pending filter
    .filter((member: any) => member.email && member.email.trim()) 
    .filter((member: any) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  useEffect(() => {
    fetchCategoriesAndNotes();
    fetchFamilyMembers();
  }, [activeHub, showAllHubs]);

  useEffect(() => {
    if (!currentHub) {
      const getCurrentHub = (): string => {
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          const hubMatch = path.match(/\/(family|finance|planner|health|home)/);
          if (hubMatch) return hubMatch[1];

          const urlParams = new URLSearchParams(window.location.search);
          const hubFromParams = urlParams.get("hub");
          if (
            hubFromParams &&
            ["family", "finance", "planner", "health", "home"].includes(
              hubFromParams
            )
          )
            return hubFromParams;

          const storedHub = localStorage.getItem("currentHub");
          if (
            storedHub &&
            ["family", "finance", "planner", "health", "home"].includes(
              storedHub
            )
          )
            return storedHub;
        }
        return "family";
      };
      setActiveHub(getCurrentHub());
    }
  }, [currentHub]);

  // Focus title input when editing starts
  useEffect(() => {
    if (editingNoteId && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 100);
    }
  }, [editingNoteId]);

  const fetchCategoriesAndNotes = async () => {
    try {
      setLoading(true);
      const [categoriesRes, notesRes] = await Promise.all([
        getNoteCategories(),
        getAllNotes(showAllHubs ? "ALL" : activeHub.toUpperCase()),
      ]);

      const categoriesPayload: ApiCategory[] = categoriesRes.data.payload;
      const rawNotes: ApiNote[] = notesRes.data.payload;

      // Build categories from API only - NO DEFAULT CATEGORIES
      const customCategories: Category[] = categoriesPayload.map((cat) => ({
        title: cat.title,
        icon: cat.icon || "✍",
        items: [],
        category_id: cat.id,
        pinned: cat.pinned === true,
      }));

      // Process notes and group by category
      const groupedNotes: Record<string, Note[]> = {};
      rawNotes.forEach((note) => {
        let catTitle = "Add Custom Category";

        // Find category by ID first
        const foundCategory = categoriesPayload.find(
          (cat) => cat.id === note.category_id
        );
        if (foundCategory) {
          catTitle = foundCategory.title;
        } else if (note.category_name) {
          catTitle = note.category_name;
        }

        if (!groupedNotes[catTitle]) groupedNotes[catTitle] = [];

        const noteItem: Note = {
          id: note.id,
          title: note.title,
          description: note.description,
          created_at: note.created_at,
          updated_at: note.updated_at,
          hub: note.hub || activeHub.toUpperCase(),
        };

        if (showAllHubs) {
          (noteItem as any).hub = note.hub || "FAMILY";
        }

        groupedNotes[catTitle].unshift(noteItem);
      });

      // Attach notes to categories and sort
      const finalCategories = customCategories
        .map((cat) => ({
          ...cat,
          items: groupedNotes[cat.title] || [],
        }))
        .filter((cat) => cat.items.length > 0 || cat.pinned) // Only show categories with notes or pinned ones
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return a.title.localeCompare(b.title);
        });

      setCategories(finalCategories);
    } catch (err) {
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const res = await getUsersFamilyMembers({});
      if (res.status) {
        setFamilyMembers(res.payload.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch family members:", error);
    }
  };

  // Handle double-click to edit note inline
  const handleNoteDoubleClick = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(note.id!);
    setEditingNoteData({
      title: note.title,
      description: note.description,
    });
    setEditingRichTextValue(note.description);
  };

  // Handle edit button click (same as double click)
  const handleEditButtonClick = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    handleNoteDoubleClick(note, e);
  };

  // Save inline edited note
  const handleSaveInlineEdit = async (note: Note) => {
    const category = categories.find((cat) =>
      cat.items.some((item) => item.id === note.id)
    );
    if (!category) return;

    // Validate title word count
    if (!editingNoteData.title.trim()) {
      message.error("Please enter a title");
      return;
    }

    if (!validateTitleWords(editingNoteData.title)) {
      message.error("Title must be 20 words or less");
      return;
    }

    // Validate description word count
    if (!editingRichTextValue.trim()) {
      message.error("Please enter a description");
      return;
    }

    if (!validateDescriptionWords(editingRichTextValue)) {
      message.error("Description must be 500 words or less");
      return;
    }

    setLoading(true);
    try {
      const res = await updateNote({
        id: note.id!,
        title: editingNoteData.title,
        description: editingRichTextValue,
        category_id: category.category_id as number,
      });

      if (res.data.status === 1) {
        message.success("Note updated");
        await fetchCategoriesAndNotes();
        setEditingNoteId(null);
        setEditingNoteData({ title: "", description: "" });
        setEditingRichTextValue("");
      }
    } catch (err) {
      message.error("Something went wrong");
    }
    setLoading(false);
  };

  // Cancel inline editing
  const handleCancelInlineEdit = () => {
    setEditingNoteId(null);
    setEditingNoteData({ title: "", description: "" });
    setEditingRichTextValue("");
  };

  // Pin/Unpin Category functionality
  const togglePinCategory = async (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPinnedStatus = !category.pinned;
    const categoryId = category.category_id;

    if (!categoryId) {
      message.error("Category ID not found");
      return;
    }

    try {
      setLoading(true);
      const res = await updateNoteCategory({
        id: categoryId,
        pinned: newPinnedStatus,
      });

      if (res.data.status === 1) {
        message.success(`Category ${newPinnedStatus ? "pinned" : "unpinned"}`);
        fetchCategoriesAndNotes();
      } else {
        message.error("Failed to update pin status");
      }
    } catch (err) {
      console.error("Error updating pin status:", err);
      message.error("Failed to update pin status");
    } finally {
      setLoading(false);
    }
  };

  // Delete Category functionality
  const handleDeleteNoteCategory = async (category: Category) => {
    const categoryId = category.category_id;

    if (!categoryId) {
      message.error("Category ID not found");
      return;
    }

    try {
      setLoading(true);

      const res = await deleteNoteCategory({ id: categoryId });

      if (res?.data?.status === 1) {
        message.success(
          `Category "${category.title}" and its notes deleted successfully`
        );
        await fetchCategoriesAndNotes();
      } else {
        message.error(res?.data?.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      message.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      setLoading(true);
      const res = await deleteNote({ id: noteId });

      if (res?.data?.status === 1) {
        message.success("Note deleted successfully");
        await fetchCategoriesAndNotes();
      } else {
        message.error("Failed to delete note");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      message.error("Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  // Combined share/tag handler
  const handleShareNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentShareNote(note);
    setSelectedMemberIds([]);
    setShareModalVisible(true);
    shareForm.resetFields();
  };

  // Handle sharing to family members
  const handleShareToMembers = async () => {
    if (!currentShareNote || selectedMemberIds.length === 0) {
      message.warning("Please select family members to share with");
      return;
    }

    // Apply same filtering logic when selecting members for sharing
    const selectedMembers = filteredFamilyMembers.filter((member: any) =>
      selectedMemberIds.includes(member.id)
    );

    const emails = selectedMembers
      .map((member: any) => member.email)
      .filter((email: string) => !!email);

    try {
      setLoading(true);
      for (const email of emails) {
        await shareNote({
          email,
          note: {
            title: currentShareNote.title,
            description: currentShareNote.description,
            hub: currentShareNote.hub || activeHub.toUpperCase(),
            created_at: currentShareNote.created_at,
          },
        });
      }

      const memberNames = selectedMembers.map((m: any) => m.name).join(", ");
      message.success(`Note shared with ${memberNames}!`);
      setShareModalVisible(false);
      setCurrentShareNote(null);
      setSelectedMemberIds([]);
    } catch (err) {
      console.error("Error sharing note:", err);
      message.error("Failed to share note");
    } finally {
      setLoading(false);
    }
  };

  // Handle email sharing
  const handleEmailShare = async () => {
    try {
      const values = await shareForm.validateFields();

      if (!currentShareNote) {
        message.error("No note selected for sharing");
        return;
      }

      setLoading(true);

      const res = await shareNote({
        email: values.email,
        note: {
          title: currentShareNote.title,
          description: currentShareNote.description,
          hub: currentShareNote.hub || activeHub.toUpperCase(),
          created_at: currentShareNote.created_at,
        },
      });

      if (res?.data?.status === 1) {
        message.success("Note shared via email!");
      } else {
        message.error("Failed to share note");
      }

      setShareModalVisible(false);
      shareForm.resetFields();
      setCurrentShareNote(null);
      setSelectedMemberIds([]);
    } catch (err) {
      console.error("Error sharing note:", err);
      message.error("Failed to share note");
    } finally {
      setLoading(false);
    }
  };

  const getNoteActionMenu = (note: Note) => ({
    items: [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit",
        onClick: (e: { domEvent: any }) =>
          handleEditButtonClick(note, e.domEvent as any),
      },
      {
        key: "share",
        icon: <ShareAltOutlined />,
        label: "Share",
        onClick: (e: { domEvent: any }) =>
          handleShareNote(note, e.domEvent as any),
      },
      {
        type: "divider" as const,
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete",
        danger: true,
        onClick: () => handleDeleteNote(note.id!),
      },
    ],
  });

  const handleSaveNote = async (categoryId: string) => {
    const category = categories.find(
      (cat) => String(cat.category_id) === categoryId
    );
    if (!category) return;

    // Validate title
    if (!newNote.title.trim()) {
      message.error("Please enter a title");
      return;
    }

    if (!validateTitleWords(newNote.title)) {
      message.error("Title must be 20 words or less");
      return;
    }

    // Validate description
    if (!richTextValue.trim()) {
      message.error("Please enter a description");
      return;
    }

    if (!validateDescriptionWords(richTextValue)) {
      message.error("Description must be 500 words or less");
      return;
    }

    setLoading(true);
    try {
      const user_id = localStorage.getItem("userId") || "";

      const res = await addNote({
        title: newNote.title,
        description: richTextValue,
        category_id: category.category_id as number,
        user_id,
        hub: activeHub.toUpperCase(),
      });

      if (res.data.status === 1) {
        message.success(
          showAllHubs
            ? "Note added"
            : `Note added to ${getHubDisplayName(activeHub)} 📝`
        );
        await fetchCategoriesAndNotes();
      }

      setShowNoteForm(null);
      setNewNote({ title: "", description: "" });
      setRichTextValue("");
    } catch (err) {
      message.error("Something went wrong");
    }

    setLoading(false);
  };

  const handleCancelNoteForm = () => {
    setShowNoteForm(null);
    setNewNote({ title: "", description: "" });
    setRichTextValue("");
  };

  // Combined Modal Functions
  const showCombinedModal = (categoryId?: number) => {
    if (categoryId) {
      setCategoryType("existing");
      setSelectedCategoryId(categoryId);
    } else {
      setCategoryType("new");
      setSelectedCategoryId(null);
    }
    setCombinedModalVisible(true);
    form.resetFields();
    setSelectedCategoryOption("");
    setCustomCategoryName("");
    setModalRichTextValue("");
  };

  const handleCategorySelection = (value: string) => {
    setSelectedCategoryOption(value);
    if (value !== "Add Custom Category") {
      setCustomCategoryName("");
    }
  };

  const handleCombinedSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Validate title
      if (!validateTitleWords(values.title)) {
        message.error("Title must be 20 words or less");
        return;
      }

      // Validate description
      if (!validateDescriptionWords(modalRichTextValue)) {
        message.error("Description must be 500 words or less");
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
            message.success("Category created successfully");
          } else {
            message.error("Failed to create category");
            return;
          }
        } catch (err) {
          console.error("Error creating category:", err);
          message.error("Failed to create category");
          return;
        }
      }

      if (!categoryId) {
        message.error("Category not selected");
        return;
      }

      // Add note to current hub
      try {
        const res = await addNote({
          title: values.title,
          description: modalRichTextValue,
          category_id: categoryId,
          user_id,
          hub: activeHub.toUpperCase(),
        });

        if (res.data.status === 1) {
          message.success(
            showAllHubs
              ? "Note added successfully! 📝"
              : `Note added to ${getHubDisplayName(activeHub)} 📝`
          );
          setCombinedModalVisible(false);
          await fetchCategoriesAndNotes();
          form.resetFields();
          setSelectedCategoryOption("");
          setCustomCategoryName("");
          setModalRichTextValue("");
        } else {
          message.error("Failed to add note");
        }
      } catch (err) {
        console.error("Error adding note:", err);
        message.error("Failed to add note");
      }
    } catch (err) {
      console.error("Error in combined submit:", err);
      message.error("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMoreClick = () => {
    router.push(`/${username}/notes`);
  };

  const getCategoryLatestTimestamp = (category: Category): string => {
    if (category.items.length === 0) return "No notes";

    const latest = category.items.reduce((latest, note) => {
      const noteDate = new Date(note.updated_at || note.created_at || "");
      const latestDate = new Date(latest.updated_at || latest.created_at || "");
      return noteDate > latestDate ? note : latest;
    });

    const date = new Date(latest.updated_at || latest.created_at || "");

    // Format as MM/DD/YYYY HH:mm
    const formattedDate = date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return latest.updated_at
      ? `Updated: ${formattedDate}`
      : `Created: ${formattedDate}`;
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY }}>
      {/* Loading overlay */}
      {loading && <DocklyLoader />}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(155, 155, 155, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 155, 155, 0.7);
        }
        .note-content-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .note-content-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .note-content-scroll::-webkit-scrollbar-thumb {
          background: rgba(155, 155, 155, 0.3);
          border-radius: 1.5px;
        }
        .note-content-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 155, 155, 0.5);
        }

        /* Global styles for formatted content display - Proper formatting */
        .formatted-content strong,
        .formatted-content b {
          color: #1890ff !important;
          font-weight: bold;
        }
        
        .formatted-content ul,
        .formatted-content ol {
          color: #1890ff !important;
          padding-left: 20px;
        }
        
        .formatted-content ul li,
        .formatted-content ol li {
          color: #1890ff !important;
          margin: 4px 0;
          word-break: break-word;
          overflow-wrap: break-word;
          word-wrap: break-word;
          hyphens: auto;
          max-width: 100%;
        }
        
        .formatted-content ul li::marker,
        .formatted-content ol li::marker {
          color: #1890ff !important;
        }

        /* Enhanced text wrapping for all content */
        .text-content {
          word-break: break-word;
          overflow-wrap: break-word;
          word-wrap: break-word;
          hyphens: auto;
          max-width: 100%;
          white-space: pre-wrap;
        }

        /* Handle very long words without spaces */
        .text-content-aggressive {
          overflow-wrap: anywhere;
          word-break: break-all;
          max-width: 100%;
        }
      `}</style>

      <Card
        style={{
          padding: 0,
          backgroundColor: "#ffffff",
          width: "100%",
          maxWidth: "100%",
          borderRadius: 12,
          position: "relative",
          height: "360px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.06)",
          fontFamily: FONT_FAMILY,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        bodyStyle={{
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: 0,
              flex: 1,
            }}
          >
            <Avatar
              style={{
                backgroundColor: "#fa8c16",
                color: "#fff",
                fontSize: "18px",
                flexShrink: 0,
              }}
              size={40}
              icon={<FileTextOutlined />}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#262626",
                  fontFamily: FONT_FAMILY,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Notes & Lists
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {categories.length} categories •{" "}
                {showAllHubs
                  ? "All Hubs"
                  : `${getHubDisplayName(activeHub)} Hub`}
              </Text>
            </div>
          </div>

          <Button
            type="primary"
            shape="default"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => showCombinedModal()}
            style={{
              borderRadius: 6,
              background: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              fontSize: 11,
              height: 28,
              width: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              flexShrink: 0,
            }}
          />
        </div>

        {/* Scrollable Content with Smooth Scrollbar */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "2px",
            width: "100%",
            minHeight: 0,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
          }}
          className="custom-scrollbar"
        >
          {categories.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                padding: "20px",
                width: "100%",
              }}
            >
              <div
                onClick={() => showCombinedModal()}
                style={{
                  padding: "16px",
                  border: "2px dashed #f0f0f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  width: "100%",
                  maxWidth: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#2563eb60";
                  e.currentTarget.style.background = "#2563eb05";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#f0f0f0";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <PlusOutlined
                  style={{
                    fontSize: "20px",
                    color: "#999",
                    marginBottom: "6px",
                  }}
                />
                <Text
                  style={{
                    color: "#999",
                    fontSize: "12px",
                    display: "block",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Add New Note
                </Text>
                <Text
                  style={{
                    color: "#bbb",
                    fontSize: "10px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Note description...
                </Text>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              {categories.map((category) => {
                const categoryId = String(category.category_id);
                const isExpanded = expandedCategories.has(categoryId);

                return (
                  <div
                    key={categoryId}
                    style={{
                      backgroundColor: "#fafafa",
                      borderRadius: "12px",
                      border: "1px solid #f0f0f0",
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                      width: "100%",
                      maxWidth: "100%",
                    }}
                  >
                    {/* Category Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 12px",
                        cursor: "pointer",
                        width: "100%",
                        maxWidth: "100%",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement!.style.backgroundColor =
                          "#f5f5f5";
                        e.currentTarget.parentElement!.style.borderColor =
                          "#d9d9d9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement!.style.backgroundColor =
                          "#fafafa";
                        e.currentTarget.parentElement!.style.borderColor =
                          "#f0f0f0";
                      }}
                    >
                      {/* Category Icon */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          background: `${
                            categoryColorMap[category.title] ||
                            stringToColor(category.title)
                          }15`,
                          borderRadius: 6,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: 14,
                          marginRight: "12px",
                          flexShrink: 0,
                        }}
                      >
                        {category.icon}
                      </div>

                      {/* Category Title & Count */}
                      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                        <Text
                          style={{
                            fontWeight: 500,
                            fontSize: "14px",
                            color: "#262626",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          {category.title}
                          {category.pinned && (
                            <StarFilled
                              style={{
                                marginLeft: 6,
                                color: "#faad14",
                                fontSize: 11,
                              }}
                            />
                          )}
                        </Text>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: "12px",
                            fontFamily: FONT_FAMILY,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {category.items.length} notes
                        </Text>
                      </div>

                      {/* Add Note Button */}
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          showCombinedModal(category.category_id);
                        }}
                        style={{
                          borderRadius: 6,
                          background: PRIMARY_COLOR,
                          borderColor: PRIMARY_COLOR,
                          fontSize: 11,
                          height: 24,
                          width: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          marginRight: "8px",
                          flexShrink: 0,
                        }}
                      />

                      {/* Expand/Collapse Arrow */}
                      <Button
                        type="text"
                        size="small"
                        icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                        onClick={(e) => handleToggleExpand(categoryId, e)}
                        style={{
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div
                        style={{
                          borderTop: "1px solid #f0f0f0",
                          backgroundColor: "#ffffff",
                          width: "100%",
                          maxWidth: "100%",
                          overflow: "hidden",
                        }}
                      >
                        {/* Notes List */}
                        {category.items.length > 0 && (
                          <div style={{ padding: "16px", width: "100%" }}>
                            {category.items.map((note, idx) => (
                              <div
                                key={`note-${note.id}`}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "8px",
                                  padding: "8px 0",
                                  borderBottom:
                                    idx < category.items.length - 1
                                      ? "1px solid #f0f0f0"
                                      : "none",
                                  width: "100%",
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: "hidden",
                                    width: "100%",
                                  }}
                                >
                                  {/* Inline Edit Mode */}
                                  {editingNoteId === note.id ? (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        width: "100%",
                                      }}
                                    >
                                      <div>
                                        <Input
                                          ref={titleInputRef}
                                          value={editingNoteData.title}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setEditingNoteData({
                                              ...editingNoteData,
                                              title: value,
                                            });
                                          }}
                                          style={{
                                            marginBottom: 4,
                                            fontFamily: FONT_FAMILY,
                                            fontSize: "13px",
                                            fontWeight: 600,
                                          }}
                                          className="text-content"
                                          onPressEnter={() =>
                                            handleSaveInlineEdit(note)
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === "Escape") {
                                              handleCancelInlineEdit();
                                            }
                                          }}
                                        />
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            color:
                                              countWords(
                                                editingNoteData.title
                                              ) > 20
                                                ? "#ff4d4f"
                                                : "#8c8c8c",
                                            textAlign: "right",
                                            fontFamily: FONT_FAMILY,
                                            marginBottom: 8,
                                          }}
                                        >
                                          {countWords(editingNoteData.title)}/20
                                          words
                                        </div>
                                      </div>
                                      <RichTextEditor
                                        value={editingRichTextValue}
                                        onChange={setEditingRichTextValue}
                                        showWordCount={true}
                                        style={{
                                          fontFamily: FONT_FAMILY,
                                          fontSize: "12px",
                                          marginBottom: 8,
                                          minHeight: "80px",
                                        }}
                                      />
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "8px",
                                          justifyContent: "flex-end",
                                        }}
                                      >
                                        <Button
                                          size="small"
                                          icon={<CloseOutlined />}
                                          onClick={handleCancelInlineEdit}
                                          style={{ fontSize: "10px" }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          type="primary"
                                          size="small"
                                          icon={<CheckOutlined />}
                                          onClick={() =>
                                            handleSaveInlineEdit(note)
                                          }
                                          loading={loading}
                                          style={{ fontSize: "10px" }}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Display Mode with Enhanced Text Wrapping */
                                    <div
                                      onDoubleClick={(e) =>
                                        handleNoteDoubleClick(note, e)
                                      }
                                      style={{
                                        cursor: "pointer",
                                        width: "100%",
                                        overflow: "hidden",
                                      }}
                                      title="Double-click to edit"
                                    >
                                      {/* Title - Enhanced text wrapping */}
                                      <div
                                        style={{
                                          fontSize: "13px",
                                          fontFamily: FONT_FAMILY,
                                          fontWeight: 600,
                                          color: "#374151",
                                          marginBottom: "4px",
                                          width: "100%",
                                          lineHeight: "1.3",
                                        }}
                                        className="text-content"
                                      >
                                        {truncateTitle(note.title, 10)}
                                      </div>

                                      {/* Description Container with Enhanced Text Wrapping and smooth scrolling */}
                                      <div
                                        style={{
                                          fontSize: "12px",
                                          fontFamily: FONT_FAMILY,
                                          color: "#6b7280",
                                          lineHeight: "1.4",
                                          width: "100%",
                                          paddingRight: "2px",
                                          marginBottom: "6px",
                                        }}
                                        className="text-content formatted-content"
                                      >
                                        {renderHtmlContent(note.description)}
                                      </div>

                                      {/* Meta info */}
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          width: "100%",
                                          overflow: "hidden",
                                        }}
                                      >
                                        {showAllHubs && (note as any).hub && (
                                          <Tag
                                            color={getHubColor(
                                              (note as any).hub.toLowerCase()
                                            )}
                                            style={{
                                              fontSize: 9,
                                              padding: "1px 4px",
                                              fontFamily: FONT_FAMILY,
                                              margin: 0,
                                              flexShrink: 0,
                                            }}
                                          >
                                            {getHubDisplayName(
                                              (note as any).hub.toLowerCase()
                                            )}
                                          </Tag>
                                        )}
                                        {note.created_at && (
                                          <div
                                            style={{
                                              fontSize: 10,
                                              color: "#9ca3af",
                                              fontFamily: FONT_FAMILY,
                                              flex: 1,
                                              minWidth: 0,
                                            }}
                                            className="text-content"
                                          >
                                            {note.updated_at
                                              ? `Updated: ${new Date(
                                                  note.updated_at
                                                ).toLocaleDateString()}`
                                              : `Created: ${new Date(
                                                  note.created_at
                                                ).toLocaleDateString()}`}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Action Menu (only show when not editing) */}
                                {editingNoteId !== note.id && (
                                  <Dropdown
                                    menu={getNoteActionMenu(note)}
                                    trigger={["click"]}
                                    placement="bottomRight"
                                  >
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={
                                        <MoreOutlined
                                          style={{ fontSize: "12px" }}
                                        />
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    />
                                  </Dropdown>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Note Form */}
                        {showNoteForm === categoryId && (
                          <div
                            style={{
                              padding: "16px",
                              borderTop:
                                category.items.length > 0
                                  ? "1px solid #f0f0f0"
                                  : "none",
                              width: "100%",
                            }}
                          >
                            <div style={{ marginBottom: 12 }}>
                              <div>
                                <Input
                                  placeholder="Enter note title"
                                  value={newNote.title}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setNewNote({ ...newNote, title: value });
                                  }}
                                  style={{
                                    marginBottom: 4,
                                    fontFamily: FONT_FAMILY,
                                  }}
                                  className="text-content"
                                />
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color:
                                      countWords(newNote.title) > 20
                                        ? "#ff4d4f"
                                        : "#8c8c8c",
                                    textAlign: "right",
                                    fontFamily: FONT_FAMILY,
                                    marginBottom: 8,
                                  }}
                                >
                                  {countWords(newNote.title)}/20 words
                                </div>
                              </div>
                              <RichTextEditor
                                value={richTextValue}
                                onChange={setRichTextValue}
                                showWordCount={true}
                                style={{
                                  fontFamily: FONT_FAMILY,
                                  minHeight: "100px",
                                }}
                              />
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                size="small"
                                onClick={handleCancelNoteForm}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleSaveNote(categoryId)}
                                loading={loading}
                                style={{
                                  backgroundColor: PRIMARY_COLOR,
                                  borderColor: PRIMARY_COLOR,
                                }}
                              >
                                Add Note
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Footer Action Buttons */}
                        <div
                          style={{
                            borderTop: "1px solid #f0f0f0",
                            backgroundColor: "#f8f9fa",
                            padding: "10px 12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            overflow: "hidden",
                          }}
                        >
                          {/* Timestamp */}
                          <div
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              fontFamily: FONT_FAMILY,
                              flex: 1,
                              minWidth: 0,
                            }}
                            className="text-content"
                          >
                            {getCategoryLatestTimestamp(category)}
                          </div>

                          {/* Action buttons */}
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexShrink: 0,
                            }}
                          >
                            <Tooltip
                              title={
                                category.pinned
                                  ? "Remove from favourites"
                                  : "Add to favourites"
                              }
                            >
                              <Button
                                icon={
                                  category.pinned ? (
                                    <StarFilled />
                                  ) : (
                                    <StarOutlined />
                                  )
                                }
                                onClick={(e) => togglePinCategory(category, e)}
                                type="text"
                                size="small"
                                style={{
                                  color: category.pinned
                                    ? "#faad14"
                                    : "#9ca3af",
                                  fontSize: 11,
                                }}
                              />
                            </Tooltip>

                            <Popconfirm
                              title="Delete Category"
                              description={
                                <div>
                                  <p style={{ margin: 0, marginBottom: 8 }}>
                                    Are you sure you want to delete this
                                    category?
                                  </p>
                                  {category.items.length > 0 && (
                                    <p
                                      style={{
                                        margin: 0,
                                        color: "#f56565",
                                        fontSize: 12,
                                      }}
                                    >
                                      ⚠️ This will also delete all{" "}
                                      {category.items.length} notes in this
                                      category!
                                    </p>
                                  )}
                                </div>
                              }
                              onConfirm={() =>
                                handleDeleteNoteCategory(category)
                              }
                              okText="Yes, Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                              placement="topRight"
                            >
                              <Button
                                icon={<DeleteOutlined />}
                                type="text"
                                size="small"
                                style={{
                                  color: "#ef4444",
                                  fontSize: 11,
                                }}
                              ></Button>
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Combined Add Note/Category Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: FONT_FAMILY,
            }}
          >
            <span>Add New Note</span>
          </div>
        }
        open={combinedModalVisible}
        onCancel={() => {
          setCombinedModalVisible(false);
          form.resetFields();
          setSelectedCategoryOption("");
          setCustomCategoryName("");
          setCategoryType("existing");
          setSelectedCategoryId(null);
          setModalRichTextValue("");
        }}
        onOk={handleCombinedSubmit}
        centered
        width={500}
        okText="Add Note"
        confirmLoading={loading}
        destroyOnClose
        style={{ fontFamily: FONT_FAMILY }}
      >
        <Form form={form} layout="vertical">
          {/* Category Selection */}
          <Form.Item label="">
            <div style={{ marginBottom: 12, fontWeight: 500 }}>Category</div>

            {categoryType === "existing" && (
              <Select
                placeholder="Select an existing category"
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                style={{ width: "100%", fontFamily: FONT_FAMILY }}
                disabled={categories.length === 0}
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.category_id} value={cat.category_id}>
                    <span style={{ marginRight: 8 }}>{cat.icon}</span>
                    {cat.title}
                  </Select.Option>
                ))}
              </Select>
            )}

            {categoryType === "new" && (
              <>
                <Select
                  placeholder="Choose a category or select Add Custom Category for custom"
                  value={selectedCategoryOption}
                  onChange={handleCategorySelection}
                  style={{
                    width: "100%",
                    fontFamily: FONT_FAMILY,
                    marginBottom: 12,
                  }}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={suggestedCategories.filter(
                    (cat) =>
                      !categories.some(
                        (existingCat) => existingCat.title === cat.value
                      )
                  )}
                />

                {selectedCategoryOption === "Add Custom Category" && (
                  <Input
                    placeholder="Enter your custom category name"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    style={{ width: "100%", fontFamily: FONT_FAMILY }}
                    className="text-content"
                  />
                )}

                {selectedCategoryOption &&
                  selectedCategoryOption !== "Add Custom Category" && (
                    <div
                      style={{
                        padding: 10,
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>
                          {
                            suggestedCategories.find(
                              (cat) => cat.value === selectedCategoryOption
                            )?.icon
                          }
                        </span>
                        <span
                          style={{
                            fontWeight: 500,
                            fontFamily: FONT_FAMILY,
                            fontSize: 13,
                          }}
                          className="text-content"
                        >
                          {selectedCategoryOption}
                        </span>
                      </div>
                    </div>
                  )}
              </>
            )}
          </Form.Item>

          {/* Note Details */}
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter a title" },
              {
                validator: (_, value) => {
                  if (!value || value.trim() === "") {
                    return Promise.reject(new Error("Please enter a title"));
                  }
                  if (!validateTitleWords(value)) {
                    return Promise.reject(
                      new Error("Title must be 20 words or less")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <div>
              <Input
                placeholder="Enter note title"
                style={{ fontFamily: FONT_FAMILY }}
                className="text-content"
                onChange={(e) => {
                  // Force form validation update
                  form.validateFields(["title"]);
                }}
              />
              <div
                style={{
                  fontSize: "12px",
                  color:
                    form.getFieldValue("title") &&
                    countWords(form.getFieldValue("title")) > 20
                      ? "#ff4d4f"
                      : "#8c8c8c",
                  textAlign: "right",
                  fontFamily: FONT_FAMILY,
                  marginTop: 4,
                }}
              >
                {countWords(form.getFieldValue("title") || "")}/20 words
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter a description" },
              {
                validator: (_, value) => {
                  const plainText = stripHtml(modalRichTextValue || "");
                  if (!plainText.trim()) {
                    return Promise.reject(
                      new Error("Please enter a description")
                    );
                  }
                  if (!validateDescriptionWords(modalRichTextValue)) {
                    return Promise.reject(
                      new Error("Description must be 500 words or less")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <RichTextEditor
              value={modalRichTextValue}
              onChange={setModalRichTextValue}
              showWordCount={true}
              style={{
                fontFamily: FONT_FAMILY,
                minHeight: "120px",
              }}
            />
          </Form.Item>

          {/* Hub Info */}
          <div
            style={{
              padding: 12,
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <div
              style={{
                fontWeight: 500,
                marginBottom: 8,
                fontSize: 13,
                fontFamily: FONT_FAMILY,
              }}
              className="text-content"
            >
              📝 Note will be added to:{" "}
              {showAllHubs ? "All Hubs" : `${getHubDisplayName(activeHub)} Hub`}
            </div>
          </div>
         
        </Form>
      </Modal>

      {/* Enhanced Share Modal with White Theme and 4-Column Grid */}
      <Modal
        title={null}
        open={shareModalVisible}
        onCancel={() => {
          setShareModalVisible(false);
          setCurrentShareNote(null);
          setSelectedMemberIds([]);
          shareForm.resetFields();
          setSearchTerm("");
        }}
        footer={null}
        centered
        width={520}
        destroyOnClose
        style={{
          fontFamily: FONT_FAMILY,
        }}
        styles={{
          body: {
            padding: "0px",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
          },
          header: {
            padding: "0px",
            marginBottom: "0px",
            border: "none",
          },
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
        {currentShareNote && (
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
                    style={{
                      color: "#374151",
                      fontSize: "18px",
                    }}
                  />
                </div>
                <Text
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1f2937",
                    fontFamily: FONT_FAMILY,
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Share Note
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
                  fontFamily: FONT_FAMILY,
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
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "10px",
                    }}
                  >
                    {filteredFamilyMembers.map((member: any) => (
                      <div
                        key={member.id}
                        onClick={() => {
                          setSelectedMemberIds((prev) =>
                            prev.includes(member.id)
                              ? prev.filter((id) => id !== member.id)
                              : [...prev, member.id]
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
                          background: selectedMemberIds.includes(member.id)
                            ? "#f0f9ff"
                            : "transparent",
                          border: selectedMemberIds.includes(member.id)
                            ? "2px solid #3b82f6"
                            : "2px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedMemberIds.includes(member.id)) {
                            e.currentTarget.style.background = "#f9fafb";
                            e.currentTarget.style.transform = "scale(1.02)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedMemberIds.includes(member.id)) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.transform = "scale(1)";
                          }
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            marginBottom: "8px",
                          }}
                        >
                          <Avatar
                            size={60}
                            style={{
                              background: selectedMemberIds.includes(member.id)
                                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                              fontSize: "24px",
                              fontWeight: "600",
                              border: selectedMemberIds.includes(member.id)
                                ? "3px solid #3b82f6"
                                : "3px solid #e5e7eb",
                              boxShadow: selectedMemberIds.includes(member.id)
                                ? "0 4px 20px rgba(59, 130, 246, 0.3)"
                                : "0 2px 8px rgba(0, 0, 0, 0.1)",
                              transition: "all 0.3s ease",
                              color: "#ffffff",
                            }}
                            icon={<UserOutlined />}
                          >
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </Avatar>
                          {selectedMemberIds.includes(member.id) && (
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
                                style={{
                                  fontSize: "10px",
                                  color: "#fff",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <Text
                          style={{
                            color: "#374151",
                            fontSize: "13px",
                            fontWeight: selectedMemberIds.includes(member.id)
                              ? 600
                              : 500,
                            fontFamily: FONT_FAMILY,
                            textAlign: "center",
                            lineHeight: "1.2",
                            maxWidth: "80px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
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
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <TeamOutlined style={{ fontSize: "40px", marginBottom: "12px" }} />
                  <div style={{ fontSize: "15px", fontWeight: 500, wordBreak: "break-word", overflowWrap: "break-word" }}>
                    {searchTerm ? "No members found" : "No family members with email addresses"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px", wordBreak: "break-word", overflowWrap: "break-word" }}>
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : "Add family members with email addresses to share notes."}
                  </div>
                </div>
              )}

              {/* Share Button */}
              {selectedMemberIds.length > 0 && (
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleShareToMembers}
                  loading={loading}
                  style={{
                    borderRadius: "12px",
                    height: "44px",
                    fontSize: "15px",
                    fontWeight: 600,
                    fontFamily: FONT_FAMILY,
                    marginBottom: "20px",
                    background: "#255198ff",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    transition: "all 0.3s ease",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Share with {selectedMemberIds.length} member
                  {selectedMemberIds.length > 1 ? "s" : ""}
                </Button>
              )}

              {/* Email Share Section */}
              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "20px",
                }}
              >
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
                      style={{
                        color: "#374151",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                  <Text
                    style={{
                      color: "#374151",
                      fontSize: "15px",
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    Or share via email
                  </Text>
                </div>

                <Form form={shareForm} onFinish={handleEmailShare}>
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
                          fontFamily: FONT_FAMILY,
                          height: "40px",
                          fontSize: "14px",
                          wordBreak: "break-all",
                          overflowWrap: "break-word",
                        }}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={{
                        height: "40px",
                        minWidth: "100px",
                        fontFamily: FONT_FAMILY,
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
                    fontFamily: FONT_FAMILY,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  <MailOutlined style={{ fontSize: "11px" }} />
                  <span>Email will be sent with note content</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotesLists;