"use client"
import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Input,
  message,
  Modal,
  Select,
  Typography,
  Row,
  Col,
  Form,
  Dropdown,
  Menu,
  Popconfirm,
  Empty,
  Tooltip,
  Avatar,
  Table,
  Tag,
  Space,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  StarOutlined,
  StarFilled,
  FileTextOutlined,
  SearchOutlined,
  TagOutlined,
  MoreOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  MailOutlined,
  ReloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  TableOutlined,
  AppstoreOutlined,
  EyeOutlined,
  SaveOutlined,
  CloseOutlined,
  SettingOutlined,
  BoldOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  UserAddOutlined,
  DownOutlined,
  UpOutlined,
  LoadingOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
import DocklyLoader from "../../../utils/docklyLoader";
import { responsive, getCurrentBreakpoint } from "../../../utils/responsive";
import { PRIMARY_COLOR } from "../../comman";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Note {
  id?: number;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  hub?: string;
  hubs?: string[];
}

interface Category {
  title: string;
  icon: string;
  items: Note[];
  category_id?: number;
  favorite?: boolean;
}

interface ApiCategory {
  pinned: boolean;
  id: number;
  title: string;
  icon: string;
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

const categoryColors = { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };

// Updated hub options with colors and icons to match bookmarks
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

const getHubDisplayName = (hub: string): string => {
  const hubOption = hubOptions.find(h => h.value === hub);
  return hubOption?.label || hub;
};

const getHubIcon = (hub: string, size: number = 14) => {
  const hubOption = hubOptions.find(h => h.value === hub);
  return hubOption ? React.cloneElement(hubOption.icon, {
    style: { fontSize: size, color: "#fff" }
  }) : <SettingOutlined style={{ fontSize: size, color: "#fff" }} />;
};

const getHubColor = (hub: string): string => {
  const hubOption = hubOptions.find(h => h.value === hub);
  return hubOption?.color || "#722ed1";
};

// Updated function to get hub display info with colors
const getHubsDisplay = (hubs: string[] | undefined) => {
  if (!hubs || hubs.length === 0) {
    const defaultHub = hubOptions.find((h) => h.value === "FAMILY");
    return defaultHub ? [{
      label: defaultHub.label,
      color: defaultHub.color,
      icon: defaultHub.icon,
      value: defaultHub.value,
    }] : [];
  }

  return hubs.map((hub) => {
    const hubOption = hubOptions.find((h) => h.value === hub);
    return hubOption ? {
      label: hubOption.label,
      color: hubOption.color,
      icon: hubOption.icon,  
      value: hubOption.value,
    } : {
      label: "Utilities",
      color: "#722ed1",
      icon: <SettingOutlined style={{ fontSize: "12px" }} />,
      value: "NONE",
    };
  });
};

const getCategoryColors = (categoryTitle: string) => {
  return categoryColors;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    // hour: "2-digit",
    // minute: "2-digit",
  });
};

// Helper function to check if mobile
const isMobile = () => responsive("mobile");

// Fixed word counting functions - properly strip HTML and count words
const countWords = (text: string): number => {
  if (!text) return 0;
  // Remove HTML tags and count words properly
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

// Enhanced function to count lines in HTML content with proper list handling
const countHtmlLines = (html: string, containerWidth: number = 200): number => {
  if (!html) return 0;
  
  // Create a temporary div to measure content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.width = `${containerWidth}px`;
  tempDiv.style.fontSize = '12px';
  tempDiv.style.lineHeight = '1.5';
  tempDiv.style.fontFamily = FONT_FAMILY;
  tempDiv.style.wordBreak = 'break-all'; // Changed to break-all for aggressive breaking
  tempDiv.style.overflowWrap = 'break-word';
  tempDiv.style.whiteSpace = 'normal';
  
  document.body.appendChild(tempDiv);
  const height = tempDiv.offsetHeight;
  document.body.removeChild(tempDiv);
  
  // Approximate line height is 18px (12px font * 1.5 line-height)
  const lineHeight = 18;
  return Math.ceil(height / lineHeight);
};

// Enhanced HTML truncation for grid view - show limited lines with proper truncation
const truncateHtmlToLines = (html: string, maxLines: number = 3, containerWidth: number = 200): { content: string, truncated: boolean } => {
  if (!html) return { content: "", truncated: false };
  
  // If content is short enough, return as is
  if (countHtmlLines(html, containerWidth) <= maxLines) {
    return { content: html, truncated: false };
  }
  
  // Create a temporary container to work with
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.width = `${containerWidth}px`;
  tempDiv.style.fontSize = '12px';
  tempDiv.style.lineHeight = '1.5';
  tempDiv.style.fontFamily = FONT_FAMILY;
  tempDiv.style.wordBreak = 'break-all'; // Changed to break-all for aggressive breaking
  tempDiv.style.overflowWrap = 'break-word';
  tempDiv.style.whiteSpace = 'normal';
  
  document.body.appendChild(tempDiv);
  
  const lineHeight = 18;
  const maxHeight = maxLines * lineHeight;
  
  // Function to truncate while preserving HTML structure
  const truncateElement = (element: HTMLElement, remainingHeight: number): { element: HTMLElement, truncated: boolean } => {
    const clone = element.cloneNode(false) as HTMLElement;
    let currentHeight = 0;
    let truncated = false;
    
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];
      
      if (child.nodeType === Node.TEXT_NODE) {
        // Handle text nodes
        const textContent = child.textContent || '';
        const tempSpan = document.createElement('span');
        tempSpan.textContent = textContent;
        tempSpan.style.cssText = getComputedStyle(element).cssText;
        tempDiv.appendChild(tempSpan);
        
        const textHeight = tempSpan.offsetHeight;
        tempDiv.removeChild(tempSpan);
        
        if (currentHeight + textHeight <= remainingHeight) {
          clone.appendChild(child.cloneNode(true));
          currentHeight += textHeight;
        } else {
          // Try to fit partial text
          const words = textContent.split(/\s+/);
          let partialText = '';
          
          for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
            const testText = partialText + (partialText ? ' ' : '') + words[wordIndex];
            tempSpan.textContent = testText;
            tempDiv.appendChild(tempSpan);
            
            if (tempSpan.offsetHeight + currentHeight <= remainingHeight) {
              partialText = testText;
            } else {
              break;
            }
            tempDiv.removeChild(tempSpan);
          }
          
          if (partialText) {
            clone.appendChild(document.createTextNode(partialText));
          }
          truncated = true;
          break;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Handle element nodes (including lists)
        const childElement = child as HTMLElement;
        const childClone = document.createElement(childElement.tagName);
        
        // Copy attributes (important for lists to maintain numbering)
        Array.from(childElement.attributes).forEach(attr => {
          childClone.setAttribute(attr.name, attr.value);
        });
        
        // For list items, preserve the structure
        if (childElement.tagName === 'LI') {
          const tempLi = childElement.cloneNode(true) as HTMLElement;
          tempDiv.appendChild(tempLi);
          const liHeight = tempLi.offsetHeight;
          tempDiv.removeChild(tempLi);
          
          if (currentHeight + liHeight <= remainingHeight) {
            clone.appendChild(childElement.cloneNode(true));
            currentHeight += liHeight;
          } else {
            truncated = true;
            break;
          }
        } else {
          // Recursively handle other elements
          const result = truncateElement(childElement, remainingHeight - currentHeight);
          if (result.element.childNodes.length > 0) {
            clone.appendChild(result.element);
            
            // Measure the added element
            const measureDiv = document.createElement('div');
            measureDiv.appendChild(result.element.cloneNode(true));
            measureDiv.style.cssText = tempDiv.style.cssText;
            tempDiv.appendChild(measureDiv);
            currentHeight += measureDiv.offsetHeight;
            tempDiv.removeChild(measureDiv);
          }
          
          if (result.truncated) {
            truncated = true;
            break;
          }
        }
      }
    }
    
    return { element: clone, truncated };
  };
  
  const result = truncateElement(tempDiv, maxHeight);
  document.body.removeChild(tempDiv);
  
  return { 
    content: result.element.innerHTML,
    truncated: result.truncated
  };
};

// Updated function to render HTML content with better handling for grid vs table view
const renderHtmlContent = (
  html: string,
  options?: {
    maxLines?: number;
    containerWidth?: number;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    showToggle?: boolean;
    isGridView?: boolean;
  }
): React.ReactNode => {
  if (!html) return "";

  const {
    maxLines = 2,
    containerWidth = 200,
    isExpanded = false,
    onToggleExpand,
    showToggle = false,
    isGridView = false,
  } = options || {};

  // For grid view - handle both truncated and expanded states
  if (isGridView) {
    // Check if content needs truncation
    const needsTruncation = maxLines ? countHtmlLines(html, containerWidth) > maxLines : false;
    
    // If no truncation needed, show full content
    if (!needsTruncation) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="html-content-grid"
          style={{
            wordBreak: "break-all",
            overflowWrap: "break-word",
            whiteSpace: "normal",
            lineHeight: "1.3",
            maxWidth: "100%",
          }}
        />
      );
    }

    // Content needs truncation - handle expanded vs collapsed states
    let displayContent = html;
    if (!isExpanded && maxLines) {
      const result = truncateHtmlToLines(html, maxLines, containerWidth);
      displayContent = result.content;
    }

    return (
      <div
        style={{
          wordBreak: "break-all",
          overflowWrap: "break-word",
          whiteSpace: "normal",
          lineHeight: "1.3",
          maxWidth: "100%",
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: displayContent }}
          className="html-content-grid"
        />
        {showToggle && onToggleExpand && needsTruncation && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            style={{
              color: "#1890ff",
              cursor: "pointer",
              fontSize: "10px",
              fontFamily: FONT_FAMILY,
              marginTop: "4px",
              display: "inline-block",
            }}
          >
            {isExpanded ? "show less" : "...read more"}
          </span>
        )}
      </div>
    );
  }

  // For table view, handle truncation with inline read more
  let content = html;
  let needsTruncation = false;

  if (maxLines && showToggle) {
    const lineCount = countHtmlLines(html, containerWidth);
    needsTruncation = lineCount > maxLines;
    
    if (needsTruncation && !isExpanded) {
      const result = truncateHtmlToLines(html, maxLines, containerWidth);
      content = result.content;
    }
  }

  if (needsTruncation && showToggle && onToggleExpand) {
    return (
      <div style={{ maxWidth: "100%" }}>
        <span
          dangerouslySetInnerHTML={{ __html: content }}
          className="html-content-table"
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "normal",
            lineHeight: "1.5",
            maxWidth: "100%",
          }}
        />
        {!isExpanded && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            style={{
              color: "#1890ff",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: FONT_FAMILY,
              marginLeft: "4px",
            }}
          >
            ...read more
          </span>
        )}
        {isExpanded && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            style={{
              color: "#1890ff",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: FONT_FAMILY,
              marginLeft: "4px",
            }}
          >
            show less
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
      className="html-content-table"
      style={{
        wordBreak: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "normal",
        lineHeight: "1.5",
        maxWidth: "100%",
      }}
    />
  );
};

// Rich Text Editor Component with fixed active state detection
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

  // Check active formatting states
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
    // Update active states after a short delay
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
      {/* Toolbar with active state styling */}
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

const IntegratedNotes = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tempNote, setTempNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  
  // Add loading state for operations
  const [operationLoading, setOperationLoading] = useState<boolean>(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryType, setCategoryType] = useState<"existing" | "new">(
    "existing"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedCategoryOption, setSelectedCategoryOption] =
    useState<string>("");
  const [customCategoryName, setCustomCategoryName] = useState<string>("");
  const [selectedHubs, setSelectedHubs] = useState<string[]>([]);
  const [richTextValue, setRichTextValue] = useState<string>("");

  const [form] = Form.useForm();
  const [totalNotes, setTotalNotes] = useState<number>(0);

  // Share modal states
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [currentShareNote, setCurrentShareNote] = useState<Note | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [emailShareVisible, setEmailShareVisible] = useState(false);
  const [shareForm] = Form.useForm();

  const [familyMembers, setFamilyMembers] = useState([]);
  
  // ✅ Add search term state for share modal - SAME AS BOOKMARKS
  const [shareSearchTerm, setShareSearchTerm] = useState("");

  // State for expanded descriptions (only for table view now)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
  
  // State for expanded grid descriptions
  const [expandedGridDescriptions, setExpandedGridDescriptions] = useState<Set<number>>(new Set());

  // ✅ Filter family members based on search term AND excluding pending/me - SAME LOGIC AS BOOKMARKS
  const filteredFamilyMembers = familyMembers
    .filter((member: any) => member.relationship !== "me")
    .filter((member: any) => member.status?.toLowerCase() !== "pending") // ✅ Added pending filter
    .filter((member: any) => member.email && member.email.trim()) // Keep email filter for IntegratedNotes
    .filter((member: any) =>
      member.name.toLowerCase().includes(shareSearchTerm.toLowerCase())
    );

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchCategoriesAndNotes();
    fetchFamilyMembers();
  }, []);

  const fetchCategoriesAndNotes = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("🚀 Fetching all notes and categories...");

      const hubsToFetch = [
        "FAMILY",
        "FINANCE",
        "PLANNER",
        "HEALTH",
        "HOME",
        "NONE",
      ];

      const [categoriesRes, ...notesResponses] = await Promise.all([
        getNoteCategories(),
        ...hubsToFetch.map((hub) => getAllNotes(hub)),
      ]);

      console.log("📊 API Responses:", { categoriesRes, notesResponses });

      if (!categoriesRes?.data?.status || categoriesRes.data.status !== 1) {
        throw new Error("Failed to fetch categories");
      }

      const categoriesPayload: ApiCategory[] = categoriesRes.data.payload || [];

      // Combine all notes from all hubs and group by title and description to merge duplicates
      const allNotes: ApiNote[] = [];
      const noteMap = new Map<string, ApiNote & { hubs: string[] }>();

      hubsToFetch.forEach((hub, index) => {
        const response = notesResponses[index];
        if (response?.data?.status === 1 && response.data.payload) {
          response.data.payload.forEach((note: ApiNote) => {
            const noteKey = `${note.title}-${note.description}`;

            if (noteMap.has(noteKey)) {
              const existingNote = noteMap.get(noteKey)!;
              if (!existingNote.hubs.includes(hub)) {
                existingNote.hubs.push(hub);
              }
            } else {
              noteMap.set(noteKey, {
                ...note,
                hub: hub,
                hubs: [hub],
              });
            }
          });
        }
      });

      noteMap.forEach((note) => {
        allNotes.push(note);
      });

      console.log("📋 Categories:", categoriesPayload);
      console.log("📝 All Notes:", allNotes);

      // Process categories - only use API categories, no defaults
      const apiCategories: Category[] = categoriesPayload.map((cat) => ({
        title: cat.title,
        icon: cat.icon || "✍",
        items: [],
        category_id: cat.id,
        favorite: cat.pinned === true,
      }));

      // Group notes by category
      const groupedNotes: Record<string, Note[]> = {};

      allNotes.forEach((note) => {
        let catTitle = "Add Custom Category";

        const foundCategory = categoriesPayload.find(
          (cat) => cat.id === note.category_id
        );
        if (foundCategory) {
          catTitle = foundCategory.title;
        } else if (note.category_name) {
          catTitle = note.category_name;
        }

        if (!groupedNotes[catTitle]) {
          groupedNotes[catTitle] = [];
        }

        const noteItem: Note = {
          id: note.id,
          title: note.title,
          description: note.description,
          created_at: note.created_at,
          updated_at: note.updated_at,
          hub: note.hub || "NONE",
          hubs: (note as any).hubs || [note.hub || "NONE"],
        };

        groupedNotes[catTitle].unshift(noteItem);
      });

      console.log("🗂 Grouped Notes:", groupedNotes);

      // Attach notes to categories and sort
      const finalCategories = apiCategories
        .map((cat) => ({
          ...cat,
          items: groupedNotes[cat.title] || [],
        }))
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1;
          if (!a.favorite && b.favorite) return 1;
          if (b.items.length !== a.items.length) {
            return b.items.length - a.items.length;
          }
          return a.title.localeCompare(b.title);
        });

      console.log("✅ Final Categories:", finalCategories);

      setCategories(finalCategories);
      setTotalNotes(allNotes.length);

      if (allNotes.length === 0) {
        console.log("ℹ No notes found across all hubs");
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      message.error(
        error instanceof Error
          ? `Failed to load data: ${error.message}`
          : "Failed to load data. Please try again."
      );
      setCategories([]);
      setTotalNotes(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const res = await getUsersFamilyMembers({});
      if (res.status) {
        setFamilyMembers(res.payload.members || []);
      }
    } catch (error) {
      message.error("Failed to fetch family members");
    }
  };

  const handleRefresh = () => {
    fetchCategoriesAndNotes(true);
  };

  const toggleFavoriteCategory = async (
    category: Category,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const newFavoriteStatus = !category.favorite;
    const categoryId = category.category_id;

    if (!categoryId) {
      message.error("Category ID not found");
      return;
    }

    try {
      setOperationLoading(true);
      const res = await updateNoteCategory({
        id: categoryId,
        pinned: newFavoriteStatus,
      });

      if (res.data.status === 1) {
        message.success(
          `Category ${
            newFavoriteStatus ? "added to favorites" : "removed from favorites"
          }`
        );
        fetchCategoriesAndNotes();
      } else {
        message.error("Failed to update favorite status");
      }
    } catch (err) {
      console.error("Error updating favorite status:", err);
      message.error("Failed to update favorite status");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteNoteCategory = async (category: Category) => {
    const categoryId = category.category_id;

    if (!categoryId) {
      message.error("Category ID not found");
      return;
    }

    try {
      setOperationLoading(true);

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
      setOperationLoading(false);
    }
  };

  const handleStartEdit = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(note.id || null);
    setTempNote({ ...note });
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(null);
    setTempNote(null);
  };

  const handleTempNoteChange = (field: keyof Note, value: string) => {
    if (tempNote) {
      setTempNote({
        ...tempNote,
        [field]: value,
      });
    }
  };

  const handleSaveEdit = async (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!tempNote || !tempNote.title.trim() || !stripHtml(tempNote.description).trim()) {
      message.error("Please fill in all fields");
      return;
    }

    // Validate word counts
    const titleWordCount = countWords(tempNote.title);
    const descriptionWordCount = countWords(tempNote.description);

    if (titleWordCount > 20) {
      message.error("Title must be 20 words or less");
      return;
    }

    if (descriptionWordCount > 500) {
      message.error("Description must be 500 words or less");
      return;
    }

    setOperationLoading(true);
    try {
      const category = categories.find((cat) =>
        cat.items.some((item) => item.id === noteId)
      );

      if (!category) {
        message.error("Category not found");
        return;
      }

      const categoryId = category.category_id;

      // Find the original note
      const originalNote = category.items.find((item) => item.id === noteId);

      if (!originalNote) {
        message.error("Note not found");
        return;
      }

      // Single update call with original note data for matching
      const res = await updateNote({
        id: noteId,
        title: tempNote.title,
        description: tempNote.description,
        category_id: categoryId as number,
        // Send original data for backend matching
        original_title: originalNote.title,
        original_description: originalNote.description,
      });

      if (res.data.status === 1) {
        message.success("Note updated successfully across all hubs!");
        await fetchCategoriesAndNotes();
        setEditingNoteId(null);
        setTempNote(null);
      } else {
        message.error("Failed to update note");
      }
    } catch (err) {
      console.error("Error updating note:", err);
      message.error("Failed to update note");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      setOperationLoading(true);

      const noteToDelete = categories
        .flatMap((cat) => cat.items)
        .find((note) => note.id === noteId);

      if (!noteToDelete) {
        message.error("Note not found");
        return;
      }

      const deletePayload = {
        id: noteId,
        title: noteToDelete.title,
        description: noteToDelete.description,
      };

      const res = await deleteNote(deletePayload);

      if (res?.data?.status === 1) {
        const hubNames = (noteToDelete.hubs || [noteToDelete.hub || "NONE"])
          .map((hub) => getHubDisplayName(hub))
          .join(", ");
        message.success(
          `Note deleted from all hubs (${hubNames}) successfully`
        );
        await fetchCategoriesAndNotes();
      } else {
        message.error("Failed to delete note");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      message.error("Failed to delete note");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleShareNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentShareNote(note);
    setSelectedMemberIds([]);
    setEmailShareVisible(false);
    setShareModalVisible(true);
    shareForm.resetFields();
  };

  const handleShareToMembers = async () => {
    if (!currentShareNote || selectedMemberIds.length === 0) {
      message.warning("Please select family members to share with");
      return;
    }

    // ✅ Apply same filtering logic when selecting members for sharing
    const selectedMembers = filteredFamilyMembers.filter((member: any) =>
      selectedMemberIds.includes(member.id)
    );

    const emails = selectedMembers
      .map((member: any) => member.email)
      .filter((email: string) => !!email);

    if (emails.length === 0) {
      message.warning("Selected family members don't have email addresses");
      return;
    }

    try {
      setOperationLoading(true);

      // Improved error handling for sharing
      const sharePromises = emails.map(async (email: string) => {
        try {
          return await shareNote({
            email,
            note: {
              title: currentShareNote.title,
              description: currentShareNote.description,
              hub: currentShareNote.hub,
              created_at: currentShareNote.created_at,
            },
            tagged_members: emails,
          });
        } catch (error) {
          console.error(`Failed to share with ${email}:`, error);
          throw error;
        }
      });

      await Promise.all(sharePromises);

      const memberNames = selectedMembers
        .filter((m: any) => m.email)
        .map((m: any) => m.name)
        .join(", ");
      message.success(`Note shared with ${memberNames}!`);
      setShareModalVisible(false);
      setCurrentShareNote(null);
      setSelectedMemberIds([]);
      setEmailShareVisible(false);
    } catch (err) {
      console.error("Error sharing note:", err);
      message.error("Failed to share note. Please check your connection and try again.");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEmailShare = async () => {
    try {
      const values = await shareForm.validateFields();

      if (!currentShareNote) {
        message.error("No note selected for sharing");
        return;
      }

      setOperationLoading(true);

      const res = await shareNote({
        email: values.email,
        note: {
          title: currentShareNote.title,
          description: currentShareNote.description,
          hub: currentShareNote.hub,
          created_at: currentShareNote.created_at,
        },
      });

      message.success("Note shared via email!");
      setShareModalVisible(false);
      shareForm.resetFields();
      setCurrentShareNote(null);
      setSelectedMemberIds([]);
      setEmailShareVisible(false);
    } catch (err) {
      console.error("Error sharing note:", err);
      message.error("Failed to share note via email. Please check your connection and try again.");
    } finally {
      setOperationLoading(false);
    }
  };

  const getNoteActionMenu = (note: Note) => {
    return (
      <Menu style={{ fontFamily: FONT_FAMILY }}>
        <Menu.Item
          key="edit"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.domEvent.stopPropagation();
            handleStartEdit(note, e.domEvent as any);
          }}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          key="share"
          icon={<ShareAltOutlined />}
          onClick={(e) => {
            e.domEvent.stopPropagation();
            handleShareNote(note, e.domEvent as any);
          }}
        >
          Share
        </Menu.Item>
        <Menu.Item
          key="delete"
          icon={<DeleteOutlined />}
          danger
          onClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          <Popconfirm
            title="Delete Note"
            description="Are you sure you want to delete this note from all hubs?"
            onConfirm={() => handleDeleteNote(note.id!)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            Delete
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );
  };

  // Fixed showModal function to properly auto-populate category
  const showModal = (categoryId?: number) => {
    if (categoryId) {
      setCategoryType("existing");
      setSelectedCategoryId(categoryId);
    } else {
      setCategoryType("new");
      setSelectedCategoryId(null);
    }
    setModalVisible(true);
    form.resetFields();
    setRichTextValue("");
    setSelectedHubs([]);
    setSelectedCategoryOption("");
    setCustomCategoryName("");
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

      setOperationLoading(true);
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
      }

      if (!categoryId) {
        message.error("Category not selected");
        return;
      }

      // Add note to all selected hubs
      try {
        const addNotePromises = selectedHubs.map((hub) =>
          addNote({
            title: values.title,
            description: richTextValue,
            category_id: categoryId,
            user_id,
            hub: hub,
          })
        );

        const results = await Promise.all(addNotePromises);
        const successfulHubs: string[] = [];
        const failedHubs: string[] = [];

        results.forEach(
          (result: { data: { status: number } }, index: number) => {
            if (result.data.status === 1) {
              successfulHubs.push(getHubDisplayName(selectedHubs[index]));
            } else {
              failedHubs.push(getHubDisplayName(selectedHubs[index]));
            }
          }
        );

        if (successfulHubs.length > 0) {
          message.success(
            `Note added to ${successfulHubs.join(", ")} successfully! 📝`
          );
        }

        if (failedHubs.length > 0) {
          message.warning(`Failed to add note to ${failedHubs.join(", ")}`);
        }

        if (successfulHubs.length > 0) {
          setModalVisible(false);
          await fetchCategoriesAndNotes();
          form.resetFields();
          setRichTextValue("");
          setSelectedHubs([]);
          setSelectedCategoryOption("");
          setCustomCategoryName("");
          setCategoryType("existing");
        }
      } catch (err) {
        console.error("Error adding note:", err);
        message.error("Failed to add note");
      }
    } catch (err) {
      console.error("Error in submit:", err);
      message.error("Failed to process request");
    } finally {
      setOperationLoading(false);
    }
  };

  // Function to toggle expanded state for descriptions (only for table view now)
  const toggleDescriptionExpansion = (noteId: number) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  // Function to toggle expanded state for grid descriptions
  const toggleGridDescriptionExpansion = (noteId: number) => {
    setExpandedGridDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.items.some(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stripHtml(note.description)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
  );

  const displayedCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, 6);

  // Enhanced hub rendering function for grid view - matches bookmarks
  const renderHubIcons = (note: Note) => {
    const noteHubs = note.hubs || [note.hub || "NONE"];
    const hubsToDisplay = getHubsDisplay(noteHubs);

    if (hubsToDisplay.length === 1) {
      const hub = hubsToDisplay[0];
      return (
        <Tooltip title={hub.label} placement="top">
          <div
            style={{
              width: responsive("mobile") ? "18px" : "22px",
              height: responsive("mobile") ? "18px" : "22px",
              borderRadius: "6px",
              backgroundColor: hub.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            {React.cloneElement(hub.icon, {
              style: {
                fontSize: responsive("mobile") ? "10px" : "12px",
                color: "#fff",
              },
            })}
          </div>
        </Tooltip>
      );
    }

    // Multiple hubs - show first hub + count
    const firstHub = hubsToDisplay[0];
    const remainingCount = hubsToDisplay.length - 1;
    const hubNames = hubsToDisplay.map((hub) => hub.label).join(", ");

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Tooltip title={hubNames} placement="top">
          <div
            style={{
              width: responsive("mobile") ? "18px" : "22px",
              height: responsive("mobile") ? "18px" : "22px",
              borderRadius: "6px",
              backgroundColor: firstHub.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            {React.cloneElement(firstHub.icon, {
              style: {
                fontSize: responsive("mobile") ? "10px" : "12px",
                color: "#fff",
              },
            })}
          </div>
        </Tooltip>
        {remainingCount > 0 && (
          <div
            style={{
              width: responsive("mobile") ? "18px" : "22px",
              height: responsive("mobile") ? "18px" : "22px",
              borderRadius: "6px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #e1e8ed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: responsive("mobile") ? "8px" : "9px",
              fontWeight: "bold",
              fontFamily: FONT_FAMILY,
            }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };

  // Enhanced hub tags for table view - matches bookmarks exactly
  const renderHubTags = (note: Note) => {
    const noteHubs = note.hubs || [note.hub || "NONE"];
    const hubsToDisplay = getHubsDisplay(noteHubs);

    if (hubsToDisplay.length === 1) {
      const hub = hubsToDisplay[0];
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: hub.color,
            color: "#fff",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: FONT_FAMILY,
            margin: 0,
            padding: "4px 8px",
            width: "fit-content",
          }}
        >
          {React.cloneElement(hub.icon, {
            style: {
              fontSize: "12px",
              color: "#fff",
            },
          })}
          <span>{hub.label}</span>
        </div>
      );
    }

    // Multiple hubs - show first hub + count  
    const firstHub = hubsToDisplay[0];
    const remainingCount = hubsToDisplay.length - 1;
    const hubNames = hubsToDisplay.map((hub) => hub.label).join(", ");

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
        <Tooltip title={hubNames}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: firstHub.color,
              color: "#fff",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: FONT_FAMILY,
              margin: 0,
              padding: "4px 8px",
              width: "fit-content",
            }}
          >
            {React.cloneElement(firstHub.icon, {
              style: {
                fontSize: "12px",
                color: "#fff",
              },
            })}
            <span>
              {responsive("mobile")
                ? `${firstHub.label.substring(0, 3)}+${remainingCount}`
                : `${firstHub.label} +${remainingCount}`}
            </span>
          </div>
        </Tooltip>
      </div>
    );
  };

  // Table view data preparation
  const getAllNotesForTable = () => {
    const allNotes = categories.flatMap((category) =>
      category.items.map((note) => ({
        ...note,
        categoryTitle: category.title,
        categoryIcon: category.icon,
        category_id: category.category_id,
        favorite: category.favorite,
      }))
    );

    return allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtml(note.description)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        note.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Enhanced Table columns configuration with better styling and fixed Updated at
  const getTableColumns = () => {
    const isMobile = responsive("mobile");
    const isTablet = responsive("tablet");

    return [
      {
        title: (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TagOutlined style={{ color: "#6b7280", fontSize: 14 }} />
            <span style={{ fontWeight: 600, color: "#374151" }}>Category</span>
          </div>
        ),
        dataIndex: "categoryTitle",
        key: "category",
        width: isMobile ? "25%" : isTablet ? "20%" : "18%",
        sorter: (a: any, b: any) =>
          a.categoryTitle.localeCompare(b.categoryTitle),
        render: (text: string, record: any) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              backgroundColor: "#f8fafc",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontSize: 14 }}>{record.categoryIcon}</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 12,
                  color: "#374151",
                  fontWeight: 500,
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {responsive("mobile")
                  ? text.substring(0, 8) + (text.length > 8 ? "..." : "")
                  : text.substring(0, 15) + (text.length > 15 ? "..." : "")}
              </span>
              {record.favorite && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    marginTop: 2,
                  }}
                >
                  <StarFilled style={{ fontSize: 8, color: "#faad14" }} />
                  <span
                    style={{ fontSize: 8, color: "#faad14", fontWeight: 500 }}
                  >
                    Favorite
                  </span>
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        title: (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FileTextOutlined style={{ color: "#6b7280", fontSize: 14 }} />
            <span style={{ fontWeight: 600, color: "#374151" }}>Title</span>
          </div>
        ),
        dataIndex: "title",
        key: "title",
        width: isMobile ? "30%" : isTablet ? "25%" : "22%",
        sorter: (a: any, b: any) => a.title.localeCompare(b.title),
        render: (text: string, record: any) => {
          if (editingNoteId === record.id) {
            return (
              <div>
                <Input
                  value={tempNote?.title || ""}
                  onChange={(e) =>
                    handleTempNoteChange("title", e.target.value)
                  }
                  style={{
                    fontSize: 13,
                    fontFamily: FONT_FAMILY,
                    borderRadius: 6,
                    border: "2px solid #3b82f6",
                    caretColor: "#000000",
                    marginBottom: 4,
                  }}
                  size="small"
                  onPressEnter={(e) => handleSaveEdit(record.id, e as any)}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.setSelectionRange(
                      target.value.length,
                      target.value.length
                    );
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color:
                      countWords(tempNote?.title || "") > 20
                        ? "#ff4d4f"
                        : "#8c8c8c",
                  }}
                >
                  {countWords(tempNote?.title || "")}/20 words
                </div>
              </div>
            );
          }
          return (
            <div
              style={{
                fontWeight: 600,
                color: "#1f2937",
                fontSize: 15,
                lineHeight: 1.4,
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "normal",
                maxWidth: "100%",
              }}
            >
              {text}
            </div>
          );
        },
      },
      {
        title: (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <EditOutlined style={{ color: "#6b7280", fontSize: 14 }} />
            <span style={{ fontWeight: 600, color: "#374151" }}>
              Description
            </span>
          </div>
        ),
        dataIndex: "description",
        key: "description",
        width: isMobile ? "25%" : isTablet ? "25%" : "25%",
        render: (text: string, record: any) => {
          if (editingNoteId === record.id) {
            return (
              <div>
                <RichTextEditor
                  value={tempNote?.description || ""}
                  onChange={(value) =>
                    handleTempNoteChange("description", value)
                  }
                  style={{
                    fontSize: 13,
                    fontFamily: FONT_FAMILY,
                    borderRadius: 6,
                    border: "2px solid #3b82f6",
                  }}
                  showWordCount={true}
                  maxWords={500}
                />
              </div>
            );
          }
          
          const containerWidth = responsive("mobile") ? 150 : 200;
          const isExpanded = expandedDescriptions.has(record.id);
          
          return (
            <div
              style={{
                color: "#4b5563",
                fontSize: 12,
                lineHeight: 1.5,
                maxWidth: "100%",
              }}
            >
              {renderHtmlContent(text, {
                maxLines: 3,
                containerWidth,
                isExpanded,
                onToggleExpand: () => toggleDescriptionExpansion(record.id),
                showToggle: true,
                isGridView: false,
              })}
            </div>
          );
        },
      },
      {
        title: (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AppstoreOutlined style={{ color: "#6b7280", fontSize: 14 }} />
            <span style={{ fontWeight: 600, color: "#374151" }}>Hubs</span>
          </div>
        ),
        dataIndex: "hubs",
        key: "hubs",
        width: isMobile ? "15%" : isTablet ? "15%" : "15%",
        render: (_: any, record: any) => renderHubTags(record),
      },
      ...(responsive("lg+")
        ? [
            {
              title: (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CalendarOutlined
                    style={{ color: "#6b7280", fontSize: 14 }}
                  />
                  <span style={{ fontWeight: 600, color: "#374151" }}>
                    Updated
                  </span>
                </div>
              ),
              dataIndex: "updated_at",
              key: "updated_at",
              width: "12%",
              sorter: (a: any, b: any) =>
                new Date(a.updated_at || a.created_at).getTime() -
                new Date(b.updated_at || b.created_at).getTime(),
              render: (date: string, record: any) => {
                // Use updated_at if available, otherwise use created_at
                const displayDate = date || record.created_at;
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "4px 8px",
                      backgroundColor: "#fafafa",
                      borderRadius: 6,
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "#374151",
                        fontWeight: 500,
                        lineHeight: 1.2,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {formatDate(displayDate)}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: "#9ca3af",
                        marginTop: 1,
                      }}
                    >
                      {new Date(displayDate).toLocaleTimeString("en-US", {
                        // hour: "2-digit",
                        // minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              },
            },
          ]
        : []),
      {
        title: (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MoreOutlined style={{ color: "#6b7280", fontSize: 14 }} />
            <span style={{ fontWeight: 600, color: "#374151" }}>Actions</span>
          </div>
        ),
        key: "actions",
        width: isMobile ? "20%" : "15%",
        render: (_: any, record: any) => {
          if (editingNoteId === record.id) {
            return (
              <Space size="small">
                <Tooltip title="Save changes">
                  <Button
                    icon={<SaveOutlined />}
                    type="primary"
                    size="small"
                    onClick={(e) => handleSaveEdit(record.id, e)}
                    loading={operationLoading}
                    disabled={
                      !tempNote?.title.trim() ||
                      !stripHtml(tempNote?.description || "").trim() ||
                      countWords(tempNote?.title || "") > 20 ||
                      countWords(tempNote?.description || "") > 500
                    }
                    style={{
                      fontSize: 11,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: "#10b981",
                      borderColor: "#10b981",
                    }}
                  />
                </Tooltip>
                <Tooltip title="Cancel">
                  <Button
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={(e) => handleCancelEdit(e)}
                    style={{
                      fontSize: 11,
                      height: 28,
                      borderRadius: 6,
                    }}
                  />
                </Tooltip>
              </Space>
            );
          }

          return (
            <Space size="small">
              <Tooltip title="Edit note">
                <Button
                  icon={<EditOutlined />}
                  type="text"
                  size="small"
                  onClick={(e) => handleStartEdit(record, e)}
                  style={{
                    fontSize: 12,
                    height: 28,
                    width: 28,
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dbeafe";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f9ff";
                  }}
                />
              </Tooltip>
              <Tooltip title="Share note">
                <Button
                  icon={<ShareAltOutlined />}
                  type="text"
                  size="small"
                  onClick={(e) => handleShareNote(record, e)}
                  style={{
                    fontSize: 12,
                    height: 28,
                    width: 28,
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dcfce7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0fdf4";
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Delete Note"
                description="Are you sure you want to delete this note from all hubs?"
                onConfirm={() => handleDeleteNote(record.id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete note">
                  <Button
                    icon={<DeleteOutlined />}
                    type="text"
                    size="small"
                    danger
                    style={{
                      fontSize: 12,
                      height: 28,
                      width: 28,
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fef2f2";
                    }}
                  />
                </Tooltip>
              </Popconfirm>
            </Space>
          );
        },
      },
    ].filter(Boolean);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: responsive("mobile")
          ? "75px 10px 20px 10px"
          : "75px 10px 20px 70px",
        fontFamily: FONT_FAMILY,
        maxWidth: "100%",
      }}
    >
      {/* Add global CSS for HTML content styling with improved word wrapping and bold text styling */}
      <style jsx global>{`
        .html-content-grid {
          max-width: 100% !important;
          word-break: break-all !important;
          overflow-wrap: break-word !important;
          hyphens: auto !important;
        }
        .html-content-grid *,
        .html-content-table * {
          max-width: 100% !important;
          word-break: break-all !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
          hyphens: auto !important;
        }
        .html-content-grid b, 
        .html-content-grid strong,
        .html-content-table b, 
        .html-content-table strong {
          font-weight: 700 !important;
          color: #1a1a1a !important;
        }
        .html-content-grid ol, 
        .html-content-grid ul,
        .html-content-table ol, 
        .html-content-table ul {
          margin: 8px 0 !important;
          padding-left: 16px !important;
          word-break: break-all !important;
          overflow-wrap: break-word !important;
        }
        .html-content-grid li,
        .html-content-table li {
          margin: 4px 0 !important;
          line-height: 1.5 !important;
          word-break: break-all !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
          hyphens: auto !important;
        }
        .html-content-grid p,
        .html-content-table p {
          margin: 4px 0 !important;
          line-height: 1.5 !important;
          word-break: break-all !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
          hyphens: auto !important;
        }
        .table-row-even {
          background-color: #fafbfc !important;
        }
        .table-row-odd {
          background-color: #ffffff !important;
        }
        .table-row-even:hover,
        .table-row-odd:hover {
          background-color: #f0f9ff !important;
        }
        .notes-scrollable {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .notes-scrollable::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: responsive("mobile") ? 250 : 300,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: responsive("mobile") ? 36 : 44,
                height: responsive("mobile") ? 36 : 44,
                backgroundColor: "#fa8c16",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: responsive("mobile") ? 16 : 20,
                color: "#fff",
                marginRight: 12,
                flexShrink: 0,
              }}
            >
              <FileTextOutlined />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: "#1a1a1a",
                    fontSize: responsive("mobile") ? 20 : 26,
                    fontFamily: FONT_FAMILY,
                    fontWeight: 600,
                  }}
                >
                  Notes & Lists
                </Title>
              </div>
              <Text
                style={{
                  color: "#64748b",
                  fontSize: responsive("mobile") ? 12 : 14,
                  fontFamily: FONT_FAMILY,
                  marginTop: 2,
                }}
              >
                Organize your life efficiently
              </Text>
            </div>
          </div>
        </div>

        {/* Search Bar and Action Buttons Row */}
        <Row gutter={16} style={{ marginBottom: 16, alignItems: "center" }}>
          <Col xs={24} sm={24} md={12} lg={14} xl={16}>
            <Input
              placeholder="Search categories or notes..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: 8,
                height: 40,
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                fontSize: 14,
                fontFamily: FONT_FAMILY,
              }}
            />
          </Col>
          <Col xs={24} sm={24} md={12} lg={10} xl={8}>
            <div
              style={{
                display: "flex",
                justifyContent: responsive("mobile") ? "center" : "flex-end",
                gap: 8,
                marginTop: responsive("mobile") ? 8 : 0,
              }}
            >
              <Tooltip title={viewMode === "grid" ? "Table View" : "Grid View"}>
                <Button
                  shape="circle"
                  icon={
                    viewMode === "grid" ? (
                      <TableOutlined />
                    ) : (
                      <AppstoreOutlined />
                    )
                  }
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "table" : "grid")
                  }
                  style={{
                    height: 40,
                    width: 40,
                    border: "1px solid #e5e7eb",
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Tooltip>

              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={refreshing}
                  style={{
                    borderRadius: 8,
                    height: 40,
                    border: "1px solid #e5e7eb",
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Tooltip>
              <Tooltip title="Add note">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                  style={{
                    borderRadius: 8,
                    height: 40,
                    background: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Tooltip>
            </div>
          </Col>
        </Row>

        {/* Loading State */}
        {loading && <DocklyLoader />}
        
        {/* Operation Loading - Replace overlay with DocklyLoader */}
        {operationLoading && <DocklyLoader />}

        {/* Enhanced Table View with HTML Rendering and Inline Expand/Collapse */}
        {!loading && !operationLoading && viewMode === "table" && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "1px solid #f1f5f9",
              }}
            >
              <Table
                dataSource={getAllNotesForTable()}
                columns={getTableColumns()}
                rowKey="id"
                pagination={{
                  pageSize: responsive("mobile") ? 8 : 15,
                  showSizeChanger: !responsive("mobile"),
                  showQuickJumper: responsive("desktop"),
                  size: responsive("mobile") ? "small" : "default",
                  style: {
                    padding: "16px 24px",
                    borderTop: "1px solid #f1f5f9",
                  },
                  showTotal: (total, range) => (
                    <span
                      style={{
                        color: "#6b7280",
                        fontSize: 13,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {range[0]}-{range[1]} of {total} notes
                    </span>
                  ),
                }}
                scroll={{
                  x: responsive("mobile") ? 700 : undefined,
                  y: responsive("mobile") ? 500 : 600,
                }}
                size="middle"
                style={{
                  fontFamily: FONT_FAMILY,
                }}
                rowClassName={(record, index) =>
                  index % 2 === 0 ? "table-row-even" : "table-row-odd"
                }
                locale={{
                  emptyText: (
                    <div style={{ padding: "40px 20px" }}>
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <span
                            style={{
                              fontSize: isMobile() ? "16px" : "19px",
                              color: "#999",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            {searchTerm
                              ? "No results found. Try adjusting your search."
                              : "No Notes yet. Add your first Note to get started!"}
                          </span>
                        }
                      />
                      {!searchTerm && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => showModal()}
                          style={{
                            fontFamily: FONT_FAMILY,
                            borderRadius: 8,
                            marginTop: 12,
                            height: 36,
                            fontSize: 14,
                          }}
                        >
                          Create First Note
                        </Button>
                      )}
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        )}

        {/* Grid View with Improved Content Display and Proper Truncation */}
        {!loading && !operationLoading && viewMode === "grid" && (
          <>
            <Row gutter={[16, 16]}>
              {displayedCategories.map((category, index) => {
                const colors = getCategoryColors(category.title);
                return (
                  <Col
                    key={index}
                    xs={24}
                    sm={responsive("sm") ? 12 : 24}
                    md={responsive("md") ? 12 : 24}
                    lg={8}
                    xl={8}
                    xxl={6}
                  >
                    <div
                      style={{
                        borderRadius: 12,
                        padding: responsive("mobile") ? 12 : 16,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.bg,
                        cursor: "pointer",
                        height: responsive("mobile") ? 320 : 360,
                        position: "relative",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        fontFamily: FONT_FAMILY,
                        width: "100%",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            width: responsive("mobile") ? 32 : 40,
                            height: responsive("mobile") ? 32 : 40,
                            background: "white",
                            borderRadius: 10,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: responsive("mobile") ? 14 : 16,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          {category.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: responsive("mobile") ? 13 : 15,
                              marginBottom: 2,
                              color: colors.text,
                              fontFamily: FONT_FAMILY,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              wordBreak: "break-all", // Changed to break-all for aggressive breaking
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            {responsive("mobile")
                              ? `${category.title.substring(0, 15)}${
                                  category.title.length > 15 ? "..." : ""
                                }`
                              : category.title}
                            {category.favorite && (
                              <StarFilled
                                style={{
                                  fontSize: 12,
                                  color: "#faad14",
                                }}
                              />
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <TagOutlined
                              style={{ fontSize: 11, color: "#9ca3af" }}
                            />
                            <span
                              style={{
                                color: "#6b7280",
                                fontSize: 11,
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              {category.items.length} notes
                            </span>
                          </div>
                        </div>

                        {/* Add Note Button - Top Right */}
                        <div
                          style={{ position: "absolute", top: 12, right: 12 }}
                        >
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              showModal(category.category_id);
                            }}
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
                            }}
                          />
                        </div>
                      </div>

                      {/* Notes Preview with Better Truncation */}
                      <div
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          marginBottom: 12,
                          minHeight: responsive("mobile") ? 180 : 220,
                        }}
                      >
                        {category.items.length === 0 ? (
                          <div
                            style={{
                              textAlign: "center",
                              color: "#9ca3af",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <FileTextOutlined
                              style={{ fontSize: 20, marginBottom: 6 }}
                            />
                            <Text
                              style={{
                                fontSize: 11,
                                color: "#9ca3af",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              No notes yet
                            </Text>
                          </div>
                        ) : (
                          <div
                            className="notes-scrollable"
                            style={{
                              height: "100%",
                              overflowY: "auto",
                              paddingRight: 2,
                            }}
                          >
                            {category.items.map((note) => {
                              const isGridExpanded = expandedGridDescriptions.has(note.id!);
                              return (
                                <div
                                  key={note.id}
                                  style={{
                                    padding: responsive("mobile")
                                      ? "6px 8px"
                                      : "8px 10px",
                                    backgroundColor: "rgba(255,255,255,0.8)",
                                    borderRadius: 6,
                                    marginBottom: 4,
                                    fontSize: 11,
                                    position: "relative",
                                    border: `1px solid #e5e7eb`,
                                    fontFamily: FONT_FAMILY,
                                  }}
                                  onDoubleClick={(e) => handleStartEdit(note, e)}
                                >
                                  {editingNoteId === note.id ? (
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <div style={{ marginBottom: 6 }}>
                                        <Input
                                          value={tempNote?.title || ""}
                                          onChange={(e) =>
                                            handleTempNoteChange(
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          style={{
                                            fontSize: 11,
                                            fontFamily: FONT_FAMILY,
                                            caretColor: "#000000",
                                          }}
                                          size="small"
                                          onFocus={(e) => {
                                            const target =
                                              e.target as HTMLInputElement;
                                            target.setSelectionRange(
                                              target.value.length,
                                              target.value.length
                                            );
                                          }}
                                        />
                                        <div
                                          style={{
                                            fontSize: 9,
                                            color:
                                              countWords(tempNote?.title || "") >
                                              20
                                                ? "#ff4d4f"
                                                : "#8c8c8c",
                                            marginTop: 2,
                                          }}
                                        >
                                          {countWords(tempNote?.title || "")}/20
                                          words
                                        </div>
                                      </div>
                                      <div style={{ marginBottom: 6 }}>
                                        <RichTextEditor
                                          value={tempNote?.description || ""}
                                          onChange={(value) =>
                                            handleTempNoteChange(
                                              "description",
                                              value
                                            )
                                          }
                                          style={{
                                            fontSize: 11,
                                            fontFamily: FONT_FAMILY,
                                            minHeight: "60px",
                                          }}
                                          showWordCount={true}
                                          maxWords={500}
                                        />
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "flex-end",
                                          gap: 6,
                                        }}
                                      >
                                        <Button
                                          size="small"
                                          onClick={(e) => handleCancelEdit(e)}
                                          style={{
                                            fontSize: 10,
                                            fontFamily: FONT_FAMILY,
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          type="primary"
                                          size="small"
                                          onClick={(e) =>
                                            handleSaveEdit(note.id!, e)
                                          }
                                          loading={operationLoading}
                                          disabled={
                                            !tempNote?.title.trim() ||
                                            !stripHtml(tempNote?.description || "").trim() ||
                                            countWords(tempNote?.title || "") >
                                              20 ||
                                            countWords(
                                              tempNote?.description || ""
                                            ) > 500
                                          }
                                          style={{
                                            fontSize: 10,
                                            fontFamily: FONT_FAMILY,
                                          }}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "flex-start",
                                          marginBottom: 6,
                                        }}
                                      >
                                        <div style={{ flex: 1, paddingRight: 8 }}>
                                          <div
                                            style={{
                                              fontWeight: 600,
                                              marginBottom: 2,
                                              color: "#374151",
                                              fontFamily: FONT_FAMILY,
                                              fontSize: 13,
                                              wordBreak: "break-all", // Changed to break-all for aggressive breaking
                                              overflowWrap: "break-word",
                                              whiteSpace: "normal",
                                              lineHeight: 1.3,
                                            }}
                                          >
                                            {note.title}
                                          </div>

                                          {/* Improved content display with proper truncation and read more */}
                                          <div
                                            style={{
                                              color: "#6b7280",
                                              lineHeight: 1.3,
                                              fontFamily: FONT_FAMILY,
                                              fontSize: 10,
                                              paddingRight: "2px",
                                              wordBreak: "break-all", // Changed to break-all for aggressive breaking
                                              overflowWrap: "break-word",
                                              whiteSpace: "normal",
                                              maxHeight: "none",
                                              overflowY: "visible",
                                            }}
                                          >
                                            {renderHtmlContent(note.description, {
                                              maxLines: isGridExpanded ? undefined : 2,
                                              containerWidth: responsive("mobile") ? 200 : 250,
                                              isExpanded: isGridExpanded,
                                              onToggleExpand: () => toggleGridDescriptionExpansion(note.id!),
                                              showToggle: true,
                                              isGridView: true,
                                            })}
                                          </div>
                                        </div>

                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: responsive("mobile") ? 4 : 8,
                                          }}
                                        >
                                          {!responsive("mobile") &&
                                            renderHubIcons(note)}
                                          <Dropdown
                                            overlay={getNoteActionMenu(note)}
                                            trigger={["click"]}
                                            placement="bottomRight"
                                          >
                                            <Button
                                              type="text"
                                              icon={<MoreOutlined />}
                                              size="small"
                                              onClick={(e) => e.stopPropagation()}
                                              style={{
                                                width: 20,
                                                height: 20,
                                                minWidth: 20,
                                                padding: 0,
                                                color: "#070707ff",
                                                opacity: 0.7,
                                                transition: "all 0.2s ease",
                                                fontSize: 13,
                                              }}
                                            />
                                          </Dropdown>
                                        </div>
                                      </div>

                                      {/* Note timestamp and mobile hub icons */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          marginTop: 6,
                                          paddingTop: 4,
                                          borderTop: "1px solid #f1f5f9",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: responsive("mobile")
                                              ? 7
                                              : 8,
                                            color: "#9ca3af",
                                            fontFamily: FONT_FAMILY,
                                            wordBreak: "break-all", // Changed to break-all for aggressive breaking
                                            overflowWrap: "break-word",
                                            whiteSpace: "normal",
                                          }}
                                        >
                                          {note.updated_at
                                            ? `Updated: ${formatDateTime(
                                                note.updated_at
                                              )}`
                                            : `Created: ${formatDateTime(
                                                note.created_at
                                              )}`}
                                        </span>
                                        {responsive("mobile") &&
                                          renderHubIcons(note)}
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer with actions and last activity */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: 8,
                          borderTop: `1px solid ${colors.border}`,
                          marginTop: "auto",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: "#9ca3af",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontFamily: FONT_FAMILY,
                            flex: 1,
                            wordBreak: "break-all", // Changed to break-all for aggressive breaking
                            overflowWrap: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {category.items.length > 0
                            ? (() => {
                                const latestNote = category.items.reduce(
                                  (latest, note) => {
                                    const noteDate = new Date(
                                      note.updated_at || note.created_at || 0
                                    );
                                    const latestDate = new Date(
                                      latest.updated_at ||
                                        latest.created_at ||
                                        0
                                    );
                                    return noteDate > latestDate
                                      ? note
                                      : latest;
                                  }
                                );
                                return (
                                  <span>
                                    {responsive("mobile")
                                      ? "Updated:"
                                      : "Updated:"}{" "}
                                    {responsive("mobile")
                                      ? formatDate(
                                          latestNote.updated_at ||
                                            latestNote.created_at
                                        )
                                      : formatDateTime(
                                          latestNote.updated_at ||
                                            latestNote.created_at
                                        )}
                                  </span>
                                );
                              })()
                            : "No activity"}
                        </div>

                        {/* Footer Action Buttons */}
                        <div style={{ display: "flex", gap: 6 }}>
                          <Tooltip
                            title={
                              category.favorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <Button
                              icon={
                                category.favorite ? (
                                  <StarFilled />
                                ) : (
                                  <StarOutlined />
                                )
                              }
                              onClick={(e) =>
                                toggleFavoriteCategory(category, e)
                              }
                              type="text"
                              size="small"
                              loading={operationLoading}
                              style={{
                                width: 24,
                                height: 24,
                                minWidth: 24,
                                padding: 0,
                                color: category.favorite
                                  ? "#faad14"
                                  : "#9ca3af",
                                borderRadius: 4,
                                fontSize: 10,
                                transition: "all 0.2s ease",
                              }}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="Delete Category"
                            description={
                              <div>
                                <p style={{ margin: 0, marginBottom: 8 }}>
                                  Are you sure you want to delete this category?
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
                                    category from all hubs!
                                  </p>
                                )}
                              </div>
                            }
                            onConfirm={() => handleDeleteNoteCategory(category)}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                            placement="topRight"
                          >
                            <Button
                              icon={<DeleteOutlined />}
                              type="text"
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: 24,
                                height: 24,
                                minWidth: 24,
                                padding: 0,
                                color: "#ef4444",
                                borderRadius: 4,
                                fontSize: 10,
                              }}
                            />
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>

            {/* Show More/Less Button */}
            {filteredCategories.length > 6 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button
                  type="text"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  style={{
                    color: PRIMARY_COLOR,
                    fontSize: 13,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {showAllCategories
                    ? "Show Less"
                    : `View More (${filteredCategories.length - 6})`}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State - Enhanced */}
        {!loading && !operationLoading && filteredCategories.length === 0 && viewMode === "grid" && (
          <div style={{ textAlign: "center", padding: 40 }}>
            {searchTerm ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span
                    style={{
                      fontSize: isMobile() ? "16px" : "19px",
                      color: "#999",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    No results found. Try adjusting your search.
                  </span>
                }
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span
                    style={{
                      fontSize: isMobile() ? "16px" : "19px",
                      color: "#999",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    No Notes yet. Add your first Note to get started!
                  </span>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                  style={{
                    fontFamily: FONT_FAMILY,
                    borderRadius: 8,
                    height: 40,
                    fontSize: 14,
                    marginTop: 16,
                  }}
                >
                  Create First Note
                </Button>
              </Empty>
            )}
          </div>
        )}

        {/* Add Note Modal - Fixed with proper category auto-population and form labels */}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
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
                  {selectedCategoryId && categories.find(cat => cat.category_id === selectedCategoryId) && 
                    ` to ${categories.find(cat => cat.category_id === selectedCategoryId)?.title}`
                  }
                </span>
              </div>
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setRichTextValue("");
            setSelectedHubs([]);
            setSelectedCategoryOption("");
            setCustomCategoryName("");
            setCategoryType("existing");
            setSelectedCategoryId(null);
          }}
          onOk={handleSubmit}
          centered
          width={responsive("mobile") ? "95%" : 500}
          okText="Add Note"
          confirmLoading={operationLoading}
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
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    📂 Category 
                  </Text>
                }
                required
              >
                <div style={{ marginBottom: 12 }}>
                  {categoryType === "new" && (
                    <>
                      <Select
                        placeholder="Choose a category or select 'Add Custom Category' for custom"
                        value={selectedCategoryOption}
                        onChange={handleCategorySelection}
                        style={{
                          width: "100%",
                          fontFamily: FONT_FAMILY,
                          marginBottom: 8,
                        }}
                        showSearch
                        size="middle"
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
                        <Form.Item
                          name="customCategory"
                          rules={[
                            {
                              required: true,
                              message: "Please enter a category name",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder="Enter your custom category name"
                            value={customCategoryName}
                            onChange={(e) =>
                              setCustomCategoryName(e.target.value)
                            }
                            style={{
                              width: "100%",
                              fontFamily: FONT_FAMILY,
                              height: 32,
                              borderRadius: 6,
                            }}
                            maxLength={30}
                          />
                        </Form.Item>
                      )}

                      {selectedCategoryOption &&
                        selectedCategoryOption !== "Add Custom Category" && (
                          <div
                            style={{
                              padding: 8,
                              backgroundColor: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              borderRadius: 6,
                              marginTop: 6,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span style={{ fontSize: 14 }}>
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
                </div>
              </Form.Item>
            )}

            {/* Show selected category if auto-populated */}
            {selectedCategoryId && (
              <Form.Item
                label={
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
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
                    {categories.find(cat => cat.category_id === selectedCategoryId)?.icon}
                  </span>
                  <span
                    style={{
                      fontWeight: 500,
                      fontFamily: FONT_FAMILY,
                      fontSize: 12,
                      color: "#15803d",
                    }}
                  >
                    {categories.find(cat => cat.category_id === selectedCategoryId)?.title}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setCategoryType("new");
                    }}
                    style={{
                      fontSize: 10,
                      marginLeft: "auto",
                      color: "#6b7280",
                    }}
                  >
                    Change
                  </Button>
                </div>
              </Form.Item>
            )}

            {/* Note Title with Word Count - Fixed label */}
            <Form.Item
              name="title"
              label={
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  📝 Title 
                </Text>
              }
              rules={[
                { required: true, message: "Please enter a title" },
                {
                  validator: (_, value) => {
                    const wordCount = countWords(value);
                    if (wordCount > 20) {
                      return Promise.reject(
                        new Error("Title must be 20 words or less")
                      );
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
                  style={{
                    fontFamily: FONT_FAMILY,
                    height: 32,
                    borderRadius: 6,
                  }}
                  size="middle"
                  onChange={(e) => {
                    form.setFieldsValue({ title: e.target.value });
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    color:
                      countWords(form.getFieldValue("title") || "") > 20
                        ? "#ff4d4f"
                        : "#8c8c8c",
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {countWords(form.getFieldValue("title") || "")}/20 words
                </div>
              </div>
            </Form.Item>

            {/* Note Description with Rich Text Editor and Word Count - Fixed label */}
            <Form.Item
              name="description"
              label={
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  📄 Description 
                </Text>
              }
              rules={[
                { required: true, message: "Please enter a description" },
                {
                  validator: (_, value) => {
                    const plainText = stripHtml(richTextValue || "");
                    if (!plainText.trim()) {
                      return Promise.reject(
                        new Error("Please enter a description")
                      );
                    }
                    const wordCount = countWords(richTextValue || "");
                    if (wordCount > 500) {
                      return Promise.reject(
                        new Error("Description must be 500 words or less")
                      );
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
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: 6,
                  minHeight: "120px",
                }}
                showWordCount={true}
                maxWords={500}
              />
            </Form.Item>

            {/* Hub Selection - Fixed label */}
            <Form.Item
              name="hubs"
              label={
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  🎯 Select Hubs 
                </Text>
              }
              rules={[
                { required: true, message: "Please select at least one hub" },
              ]}
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

        {/* Share Modal - Enhanced with consistent filtering */}
        <Modal
          title={null}
          open={shareModalVisible}
          onCancel={() => {
            setShareModalVisible(false);
            setCurrentShareNote(null);
            setSelectedMemberIds([]);
            setEmailShareVisible(false);
            shareForm.resetFields();
            setShareSearchTerm(""); // ✅ Reset search term
          }}
          footer={null}
          centered
          width={responsive("mobile") ? "95%" : 520}
          destroyOnHidden
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
                    }}
                  >
                    Share Note
                  </Text>
                </div>

                <Input
                  placeholder="Search family members..."
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  value={shareSearchTerm}
                  onChange={(e) => setShareSearchTerm(e.target.value)}
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

              {/* Family Members Grid - Filter out members without email */}
              <div style={{ padding: "16px 20px" }}>
                <div
                  style={{
                    maxHeight: "280px",
                    overflowY: "auto",
                    marginBottom: "20px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  className="notes-scrollable"
                >
                  {/* ✅ Updated to use filteredFamilyMembers which now includes pending filter */}
                  {filteredFamilyMembers.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: responsive("mobile")
                          ? "repeat(3, 1fr)"
                          : "repeat(4, 1fr)",
                        gap: "10px",
                      }}
                    >
                      {/* ✅ Use filteredFamilyMembers instead of filtering inline */}
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
                            padding: responsive("mobile")
                              ? "8px 4px"
                              : "12px 8px",
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
                              e.currentTarget.style.background =
                                "transparent";
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
                              size={responsive("mobile") ? 45 : 60}
                              style={{
                                background: selectedMemberIds.includes(
                                  member.id
                                )
                                  ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                                  : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                                fontSize: responsive("mobile")
                                  ? "18px"
                                  : "24px",
                                fontWeight: "600",
                                border: selectedMemberIds.includes(member.id)
                                  ? "3px solid #3b82f6"
                                  : "3px solid #e5e7eb",
                                boxShadow: selectedMemberIds.includes(
                                  member.id
                                )
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
                                  width: responsive("mobile")
                                    ? "16px"
                                    : "20px",
                                  height: responsive("mobile")
                                    ? "16px"
                                    : "20px",
                                  background: "#10b981",
                                  borderRadius: "50%",
                                  border: "2px solid #ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow:
                                    "0 2px 8px rgba(16, 185, 129, 0.4)",
                                }}
                              >
                                <CheckCircleOutlined
                                  style={{
                                    fontSize: responsive("mobile")
                                      ? "8px"
                                      : "10px",
                                    color: "#fff",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <Text
                            style={{
                              color: "#374151",
                              fontSize: responsive("mobile")
                                ? "11px"
                                : "13px",
                              fontWeight: selectedMemberIds.includes(
                                member.id
                              )
                                ? 600
                                : 500,
                              fontFamily: FONT_FAMILY,
                              textAlign: "center",
                              lineHeight: "1.2",
                              maxWidth: responsive("mobile")
                                ? "60px"
                                : "80px",
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
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#6b7280",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <TeamOutlined
                        style={{
                          fontSize: "40px",
                          marginBottom: "12px",
                        }}
                      />
                      <div style={{ fontSize: "15px", fontWeight: 500 }}>
                        {/* ✅ Updated empty state messages to match BookmarkHub */}
                        {shareSearchTerm ? "No members found" : "No family members with email addresses"}
                      </div>
                      <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
                        {shareSearchTerm 
                          ? "Try adjusting your search terms" 
                          : "Add family members with email addresses to share notes."}
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Share Button */}
                {selectedMemberIds.length > 0 && (
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={handleShareToMembers}
                    loading={operationLoading}
                    style={{
                      borderRadius: "12px",
                      height: "44px",
                      fontSize: "15px",
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      marginBottom: "20px",
                      background: "#1365e9ff",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(59, 130, 246, 0.3)";
                    }}
                  >
                    Share with {selectedMemberIds.length} member
                    {selectedMemberIds.length > 1 ? "s" : ""}
                  </Button>
                )}

                {/* Enhanced Email Share Section */}
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
                        flexDirection: responsive("mobile") ? "column" : "row",
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
                        style={{
                          flex: 1,
                          marginBottom: 0,
                          width: responsive("mobile") ? "100%" : "auto",
                        }}
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
                          }}
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={operationLoading}
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
                          width: responsive("mobile") ? "100%" : "auto",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(16, 185, 129, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(16, 185, 129, 0.3)";
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
                    }}
                  >
                    <MailOutlined style={{ fontSize: "11px" }} />
                    <span>Email will be sent with note details</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default IntegratedNotes;