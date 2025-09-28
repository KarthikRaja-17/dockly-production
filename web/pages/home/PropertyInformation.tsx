"use client";
import React, {
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  PlusOutlined,
  CarOutlined,
  EditOutlined,
  SearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  MapPin,
  Search,
  Home,
  Calendar,
  DollarSign,
  Ruler,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  X,
  PlaneIcon,
} from "lucide-react";
import {
  addProperty,
  getProperties,
  updateProperty,
  deleteProperty,
  ApiResponse,
  Property,
} from "../../services/home";
import {
  GeopifyService,
  GeopifyResponse,
  GeopifyFeature,
  AddressDetails,
} from "../../services/geopify";
import { Popconfirm } from "antd";
import { PRIMARY_COLOR } from "../../app/comman";

interface PropertyData {
  id: string;
  address: string;
  type: string;
  purchaseDate?: string;
  purchasePrice?: number;
  squareFootage?: string;
  lotSize?: string;
  propertyTaxId?: string;
  is_active: number;
  icon: string;
}

interface FormData {
  address: string;
  type: string;
  purchaseDate: string;
  purchasePrice: string;
  squareFootage: string;
  lotSize: string;
  propertyTaxId: string;
}

// const PRIMARY_COLOR = "#1890ff";

const PropertyInformation = forwardRef<any, any>((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null
  );
  const [modalTitle, setModalTitle] = useState("Add New Property");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [addressOptions, setAddressOptions] = useState<any[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(
    null
  );
  const [addressSearchValue, setAddressSearchValue] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    address: "",
    type: "",
    purchaseDate: "",
    purchasePrice: "",
    squareFootage: "",
    lotSize: "",
    propertyTaxId: "",
  });

  const openModal = (preselectedType?: string) => {
    setModalTitle("Add New Property");
    setEditingPropertyId(null);
    setFormData({
      address: "",
      type: preselectedType || "",
      purchaseDate: "",
      purchasePrice: "",
      squareFootage: "",
      lotSize: "",
      propertyTaxId: "",
    });
    setSelectedAddress(null);
    setAddressOptions([]);
    setAddressSearchValue("");
    setIsModalVisible(true);
  };

  useImperativeHandle(ref, () => ({
    openAddModal: () => openModal(),
  }));

  const handleZillowClick = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const encodedAddress = encodeURIComponent(address);
    const zillowUrl = `https://www.zillow.com/homes/${encodedAddress}_rb/`;
    window.open(zillowUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await getProperties({ is_active: 1 });
        if (response.status === 1) {
          setProperties(
            response.payload.properties.map((p: any) => ({
              ...p,
              purchaseDate: p.purchaseDate,
              icon: p.type?.includes("Primary") ? "🏡" : "🏖",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const searchAddresses = useCallback(
    debounce(async (value: string) => {
      if (!value) {
        setAddressOptions([]);
        return;
      }
      setAddressLoading(true);
      try {
        const response: GeopifyResponse = await GeopifyService.searchAddresses(
          value,
          10
        );
        if (response.features.length === 0) {
          setAddressOptions([]);
          return;
        }
        const formattedOptions = response.features.map(
          (feature: GeopifyFeature, index: number) => ({
            key: index,
            value: feature.properties.formatted || "No formatted address",
            label: feature.properties.formatted,
            feature,
            houseNumber:
              feature.properties.housenumber ||
              feature.properties.house_number ||
              "",
            building:
              feature.properties.name || feature.properties.building || "",
          })
        );
        setAddressOptions(formattedOptions);
      } catch (error: any) {
        console.error("Geoapify API error:", error);
      } finally {
        setAddressLoading(false);
      }
    }, 150),
    []
  );

  const handleAddressSearch = async (value: string) => {
    setAddressSearchValue(value);
    setFormData((prev) => ({ ...prev, address: value }));
    searchAddresses(value);
  };

  const handleAddressSelect = (option: any) => {
    setAddressSearchValue(option.value);
    setFormData((prev) => ({ ...prev, address: option.value }));
    setSelectedAddress({
      formatted: option.feature.properties.formatted,
      latitude: option.feature.geometry.coordinates[1],
      longitude: option.feature.geometry.coordinates[0],
    });
    setAddressOptions([]);
  };

  const handleEdit = (property: PropertyData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPropertyId(property.id);
    setModalTitle("Edit Property");
    setFormData({
      address: property.address,
      type: property.type,
      purchaseDate: property.purchaseDate || "",
      purchasePrice: property.purchasePrice?.toString() || "",
      squareFootage: property.squareFootage || "",
      lotSize: property.lotSize || "",
      propertyTaxId: property.propertyTaxId || "",
    });
    setSelectedAddress(null);
    setAddressSearchValue(property.address);
    setIsModalVisible(true);
  };

  const handleDelete = async (propertyId: string) => {
    setIsDeleting(propertyId);
    try {
      const response = await deleteProperty(propertyId);
      if (response.status === 1) {
        const fetchResponse = await getProperties({ is_active: 1 });
        if (fetchResponse.status === 1) {
          setProperties(
            fetchResponse.payload.properties.map((p: any) => ({
              ...p,
              purchaseDate: p.purchaseDate,
              icon: p.type?.includes("Primary") ? "🏡" : "🏖",
            }))
          );
        }
      }
    } catch (error: any) {
      console.error("Error deleting property:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        address: selectedAddress?.formatted || formData.address,
        type: formData.type,
        purchase_date: formData.purchaseDate || undefined,
        purchase_price: formData.purchasePrice
          ? parseFloat(formData.purchasePrice)
          : undefined,
        square_footage: formData.squareFootage,
        lot_size: formData.lotSize,
        property_tax_id: formData.propertyTaxId,
        is_active: 1,
      };

      let response: ApiResponse<{ property: Property }>;
      if (editingPropertyId) {
        response = await updateProperty(editingPropertyId, payload);
      } else {
        response = await addProperty(payload);
      }

      if (response.status === 1) {
        setIsModalVisible(false);
        setFormData({
          address: "",
          type: "",
          purchaseDate: "",
          purchasePrice: "",
          squareFootage: "",
          lotSize: "",
          propertyTaxId: "",
        });
        setSelectedAddress(null);
        setAddressOptions([]);
        setAddressSearchValue("");
        setEditingPropertyId(null);
        setModalTitle("Add New Property");
        const fetchResponse = await getProperties({ is_active: 1 });
        if (fetchResponse.status === 1) {
          setProperties(
            fetchResponse.payload.properties.map((p: any) => ({
              ...p,
              purchaseDate: p.purchaseDate,
              icon: p.type?.includes("Primary") ? "🏡" : "🏖",
            }))
          );
        }
      }
    } catch (error: any) {
      console.error("Error saving property:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
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

  const closeModal = () => {
    setIsModalVisible(false);
    setFormData({
      address: "",
      type: "",
      purchaseDate: "",
      purchasePrice: "",
      squareFootage: "",
      lotSize: "",
      propertyTaxId: "",
    });
    setSelectedAddress(null);
    setAddressOptions([]);
    setAddressSearchValue("");
    setEditingPropertyId(null);
    setModalTitle("Add New Property");
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            color: "#666",
          }}
        >
          Loading properties...
        </div>
      ) : properties.length === 0 ? (
        <div
          className="custom-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 1.25rem",
            maxHeight: "350px",
            scrollbarWidth: "thin",
            scrollbarColor: `${PRIMARY_COLOR}40 transparent`,
          }}
        >
          {/* Dummy Primary Residence Placeholder */}
          <div
            style={{
              // background: "#545151ff",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1rem",
              border: "1px dashed #d9d9d9",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              opacity: 0.8,
            }}
            onClick={() => openModal("Primary Residence")}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(0, 0, 0, 0.12)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  flexShrink: 0,
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                🏡
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    marginBottom: "0.25rem",
                    color: "#1a202c",
                    lineHeight: "1.4",
                  }}
                >
                  Primary Residence
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#64748b",
                  }}
                >
                  Add your main home details • Address • Mortgage • Value
                </div>
              </div>
            </div>
          </div>

          {/* Dummy Add Another Property Placeholder */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1rem",
              border: "1px dashed #d9d9d9",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              opacity: 0.8,
            }}
            onClick={() => openModal()}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(0, 0, 0, 0.12)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    marginBottom: "0.25rem",
                    color: "#1a202c",
                    lineHeight: "1.4",
                  }}
                >
                  <PlusOutlined /> Add Another Property
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#64748b",
                  }}
                >
                  Vacation home • Rental property • Land
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="custom-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 1.25rem",
            maxHeight: "350px",
            scrollbarWidth: "thin",
            scrollbarColor: `${PRIMARY_COLOR}40 transparent`,
          }}
        >
          {properties.map((property) => (
            <div
              key={property.id}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "1rem",
                border: "1px solid #e2e8f0",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              }}
              onClick={() => toggleExpanded(property.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(0, 0, 0, 0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    flexShrink: 0,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  {property.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginBottom: "0.25rem",
                      color: "#1a202c",
                      lineHeight: "1.4",
                    }}
                  >
                    {property.address}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {property.icon}
                    {property.type}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: PRIMARY_COLOR,
                    paddingRight: "1.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  {property.purchasePrice
                    ? `$${Number(property.purchasePrice).toLocaleString()}`
                    : "N/A"}
                </div>
              </div>
              {expandedItems.has(property.id) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: "0.875rem" }}>
                    <div
                      style={{
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Type
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#1a202c",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Home size={16} />
                      {property.type}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    <div
                      style={{
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Purchase Date
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#1a202c",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Calendar size={16} />
                      {property.purchaseDate || "N/A"}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    <div
                      style={{
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Purchase Price
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#1a202c",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <DollarSign size={16} />
                      {property.purchasePrice
                        ? `$${Number(property.purchasePrice).toLocaleString()}`
                        : "N/A"}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    <div
                      style={{
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Square Footage
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#1a202c",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Ruler size={16} />
                      {property.squareFootage || "N/A"}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    <div
                      style={{
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Lot Size
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#1a202c",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Ruler size={16} />
                      {property.lotSize || "N/A"}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    <div
                      style={{
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Property Tax ID
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#1a202c",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {property.propertyTaxId || "N/A"}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={(e) => handleEdit(property, e)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 16px",
                            backgroundColor: PRIMARY_COLOR,
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px rgba(24, 144, 255, 0.2)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              PRIMARY_COLOR;
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(24, 144, 255, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              PRIMARY_COLOR;
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(24, 144, 255, 0.2)";
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <Popconfirm
                          title="Are you sure to delete this property?"
                          onConfirm={() => handleDelete(property.id)}
                          onCancel={(e) => {
                            if (e) e.stopPropagation();
                          }}
                          okText="Yes"
                          cancelText="No"
                        >
                          <button
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "10px 16px",
                              backgroundColor: "#ff4d4f",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              cursor:
                                isDeleting === property.id
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              transition: "all 0.2s ease",
                              boxShadow: "0 2px 4px rgba(255, 77, 79, 0.2)",
                              opacity: isDeleting === property.id ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (isDeleting !== property.id) {
                                e.currentTarget.style.backgroundColor =
                                  "#d9363e";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 8px rgba(255, 77, 79, 0.3)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isDeleting !== property.id) {
                                e.currentTarget.style.backgroundColor =
                                  "#ff4d4f";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 4px rgba(255, 77, 79, 0.2)";
                              }
                            }}
                          >
                            <Trash2 size={16} />
                            {isDeleting === property.id ? "Deleting..." : ""}
                          </button>
                        </Popconfirm>
                      </div>
                      <button
                        onClick={(e) => handleZillowClick(property.address, e)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 16px",
                          marginLeft: "300px",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          transition: "all 0.2s ease",
                          boxShadow: "0 2px 4px rgba(46, 204, 113, 0.2)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 8px rgba(46, 204, 113, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(46, 204, 113, 0.2)";
                        }}
                      >
                        <img
                          src="https://s.zillowstatic.com/pfs/static/z-logo-default.svg"
                          alt="Zillow"
                          style={{ width: "90px", height: "24px" }}
                        />
                        <ExternalLink size={18} color="#006AFF" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: PRIMARY_COLOR,
                  transition: "transform 0.2s ease",
                  pointerEvents: "none",
                  fontSize: "16px",
                }}
              >
                <ChevronRight
                  size={20}
                  style={{
                    transform: expandedItems.has(property.id)
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </div>
            </div>
          ))}

          {/* Add Another Property Template - Only show when properties exist */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1rem",
              border: "2px dashed #cbd5e1",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
            }}
            onClick={() => openModal()}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = PRIMARY_COLOR;
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.backgroundColor = "#f8fafc";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  marginBottom: "0.5rem",
                  color: "#475569",
                  lineHeight: "1.4",
                }}
              >
                Add Another Property
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                }}
              >
                Secondary home • Rental • Vacation home • Commercial
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: PRIMARY_COLOR,
                padding: "1.5rem",
                borderRadius: "16px 16px 0 0",
                position: "relative",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                <X size={18} />
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "white",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Home size={20} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {modalTitle}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      opacity: 0.9,
                    }}
                  >
                    Add a new property to your portfolio
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "2rem" }}>
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gap: "1.5rem",
                  }}
                >
                  {/* Address Field - Full Width */}
                  <div style={{ position: "relative" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={addressSearchValue}
                        onChange={(e) => handleAddressSearch(e.target.value)}
                        placeholder="Enter property address"
                        style={{
                          width: "100%",
                          padding: "12px 40px 12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          caretColor: "black", // 👈 makes cursor black
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = PRIMARY_COLOR;
                          e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}15`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          right: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                        }}
                      >
                        {addressLoading ? (
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              border: "2px solid rgba(0, 0, 0, 0.3)",
                              borderTop: "2px solid #1890ff",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        ) : (
                          <Search size={16} />
                        )}
                      </div>
                    </div>
                    {addressOptions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          marginTop: "4px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          zIndex: 1000,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {addressOptions.map((option) => (
                          <div
                            key={option.key}
                            onClick={() => handleAddressSelect(option)}
                            style={{
                              padding: "10px 16px",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#1a202c",
                              transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f5f5f5")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#ffffff")
                            }
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Two Column Layout */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    {/* Property Type */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Property Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          backgroundColor: "#fff", // ✅ prevents black flash
                          appearance: "none", // ✅ keep custom dropdown for desktop
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 14px center",
                          backgroundSize: "12px",
                          cursor: "pointer",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = PRIMARY_COLOR;
                          e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}15`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        <option value="Primary Residence">
                          Primary Residence
                        </option>
                        <option value="Secondary Home">Secondary Home</option>
                        <option value="Investment Property">
                          Investment Property
                        </option>
                        <option value="Rental Property">Rental Property</option>
                      </select>
                    </div>

                    {/* Purchase Date */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            purchaseDate: e.target.value,
                          }))
                        }
                        placeholder="mm/dd/yyyy"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          caretColor: "black",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = PRIMARY_COLOR;
                          e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}15`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Purchase Price */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Purchase Price
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          value={formData.purchasePrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              purchasePrice: e.target.value,
                            }))
                          }
                          placeholder="Enter purchase price"
                          min="0"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "12px 14px 12px 30px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            transition: "all 0.2s ease",
                            caretColor: "black",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = PRIMARY_COLOR;
                            e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}15`;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#d1d5db";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#9ca3af",
                            fontSize: "14px",
                          }}
                        >
                          $
                        </span>
                      </div>
                    </div>

                    {/* Square Footage */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Square Footage
                      </label>
                      <input
                        type="text"
                        value={formData.squareFootage}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            squareFootage: e.target.value,
                          }))
                        }
                        placeholder="Enter square footage"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          caretColor: "black",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = PRIMARY_COLOR;
                          e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}15`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Lot Size */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#374151",
                          caretColor: "black",
                        }}
                      >
                        Lot Size
                      </label>
                      <input
                        type="text"
                        value={formData.lotSize}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lotSize: e.target.value,
                          }))
                        }
                        placeholder="Enter lot size"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          caretColor: "black",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = PRIMARY_COLOR;
                          e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}15`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Property Tax ID */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Property Tax ID
                      </label>
                      <input
                        type="text"
                        value={formData.propertyTaxId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            propertyTaxId: e.target.value,
                          }))
                        }
                        placeholder="Enter property tax ID"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          caretColor: "black",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = PRIMARY_COLOR;
                          e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}15`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "flex-end",
                      marginTop: "1rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      style={{
                        padding: "12px 24px",
                        background: "transparent",
                        color: "#6b7280",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                        e.currentTarget.style.borderColor = "#9ca3af";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "12px 24px",
                        background: loading ? "#9ca3af" : PRIMARY_COLOR,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = "#0969da";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = PRIMARY_COLOR;
                        }
                      }}
                    >
                      {loading && (
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                      )}
                      {editingPropertyId ? "Update Property" : "Add Property"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${PRIMARY_COLOR}40;
            border-radius: 4px;
            transition: background 0.3s ease;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${PRIMARY_COLOR}60;
          }
            @media (max-width: 768px) {
  select {
    appearance: auto !important; /* Let phone use native UI */
    background-image: none !important;
  }
}

        `}
      </style>
    </div>
  );
});

PropertyInformation.displayName = "PropertyInformation";

export default PropertyInformation;
