"use client";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Input,
  Form,
  Upload,
  Card,
  DatePicker,
  Tabs,
  Switch,
  Select,
  TimePicker,
  List,
  Rate,
  Row,
  Col,
  Typography,
  Space,
  message,
  Badge,
  Tooltip,
  Spin,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Chrome,
  Mail,
  Folder,
  Apple,
  Check,
  Plus,
  X,
  User,
} from "lucide-react";
import dayjs from "dayjs";
import { getUserProfile, updateUsername, userAddProfile } from "../../../services/user";
import DocklyLoader from "../../../utils/docklyLoader";
import { useGlobalLoading } from "../../loadingContext";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
import { getUserConnectedAccounts } from "../../../services/dashboard";
import { useCurrentUser } from "../../../app/userContext";
import {
  API_URL,
  getProfilePictures,
  sendAdditionalEmailOtp,
  uploadProfilePicture,
  verifyAdditionalEmailOtp,
} from "../../../services/apiConfig";
import { useSearchParams } from "next/navigation";
import { showNotification } from "../../../utils/notification";
import { AxiosResponse } from "axios";
import RecentActivity from "../../../pages/dashboard/RecentActivity";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const PRIMARY_COLOR = "#6366F1";

// Define the UserProfile type matching backend response
type UserProfile = {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  phone_number?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  gender?: string;
  user_name: string;
  primary_email?: string;
  additional_emails?: string;
  [key: string]: any;
};

type ConnectedAccount = {
  id: string;
  provider: string;
  email?: string;
  user_object?: string;
  [key: string]: any;
};

const ProfilePage: React.FC = () => {
  const [connections, setConnections] = useState({
    apple: false,
    outlook: false,
    google: false,
    dropbox: false,
  });
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [formAddress] = Form.useForm();
  const { loading, setLoading } = useGlobalLoading();
  const currentUser = useCurrentUser();
  const [formPersonal] = Form.useForm();
  const [countries, setCountries] = useState<
    Array<{ value: string; label: string; code: string }>
  >([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cities, setCities] = useState<Array<{ value: string; label: string }>>(
    []
  );
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [additionalEmailOtp, setAdditionalEmailOtp] = useState<string>("");
  const [additionalEmailOtpId, setAdditionalEmailOtpId] = useState<string>("");
  const [isAdditionalEmailVerified, setIsAdditionalEmailVerified] =
    useState<boolean>(false);
  const [showAdditionalEmailOtp, setShowAdditionalEmailOtp] =
    useState<boolean>(false);
  const [additionalEmailValue, setAdditionalEmailValue] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const searchParams = useSearchParams();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  useEffect(() => {
    getConnectedAccounts();
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );
        const data = await response.json();
        const countryOptions = data
          .map((country: any) => ({
            value: country.name.common,
            label: country.name.common,
            code: country.cca2,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setCountries(countryOptions);
      } catch (error) {
        console.error("Error loading countries:", error);
        message.error("Failed to load countries");
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  const getConnectedAccounts = async () => {
    setLoading(true);
    try {
      const response = await getUserConnectedAccounts({});
      const { status, payload } = response.data;

      if (status) {
        const connected = {
          apple: false,
          outlook: false,
          google: false,
          dropbox: false,
        };
        payload.connectedAccounts.forEach((acc: ConnectedAccount) => {
          if (acc.provider in connected) {
            connected[acc.provider as keyof typeof connected] = true;
          }
        });
        setConnectedAccounts(payload.connectedAccounts);
        setConnections(connected);
      }
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
    }
    setLoading(false);
  };

  const loadCities = async (countryCode: string) => {
    if (!countryCode) return;

    setLoadingCities(true);
    try {
      const response = await fetch(
        `https://countriesnow.space/api/v0.1/countries/cities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: countries.find((c) => c.code === countryCode)?.value || "",
          }),
        }
      );
      const data = await response.json();

      if (data.error === false && data.data) {
        const cityOptions = data.data.map((city: string) => ({
          value: city,
          label: city,
        }));
        setCities(cityOptions);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleSendAdditionalEmailOtp = async () => {
    const additionalEmail = formPersonal.getFieldValue("additional_email");
    if (!additionalEmail) {
      message.error("Please enter an additional email address");
      return;
    }

    setSendingOtp(true);
    try {
      const response: AxiosResponse<any> = await sendAdditionalEmailOtp({
        email: additionalEmail,
      });

      const { status, message: msg, payload } = response.data;

      if (status === 1) {
        setAdditionalEmailOtpId(payload.otpId);
        setAdditionalEmailValue(additionalEmail);
        setShowAdditionalEmailOtp(true);
        showNotification("Success", msg || "OTP sent successfully", "success");
      } else {
        showNotification("Error", msg || "Failed to send OTP", "error");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      showNotification("Error", "Failed to send OTP", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAdditionalEmailOtp = async () => {
    if (!additionalEmailOtp) {
      showNotification("Error", "Please enter the OTP", "error");
      return;
    }

    setVerifyingOtp(true);
    try {
      const response: AxiosResponse<any> = await verifyAdditionalEmailOtp({
        email: additionalEmailValue,
        otp: additionalEmailOtp,
        otpId: additionalEmailOtpId,
      });

      const { status, message: msg } = response.data;

      if (status === 1) {
        setIsAdditionalEmailVerified(true);
        setShowAdditionalEmailOtp(false);
        showNotification(
          "Success",
          msg || "Email verified successfully",
          "success"
        );
      } else {
        showNotification("Error", msg || "Invalid OTP", "error");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showNotification("Error", "Failed to verify OTP", "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleAdditionalEmailChange = (e: any) => {
    const value = e.target.value;
    formPersonal.setFieldsValue({ additional_email: value });

    // Reset verification state when email changes
    if (value !== additionalEmailValue) {
      setIsAdditionalEmailVerified(false);
      setShowAdditionalEmailOtp(false);
      setAdditionalEmailOtp("");
      setAdditionalEmailOtpId("");
      setAdditionalEmailValue(value);
    }
  };

  const handlePostalCodeChange = async (postalCode: string) => {
    if (postalCode.length >= 3 && selectedCountryCode) {
      try {
        const response = await fetch(
          `https://api.zippopotam.us/${selectedCountryCode.toLowerCase()}/${postalCode}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.places && data.places.length > 0) {
            const city = data.places[0]["place name"];
            formAddress.setFieldsValue({ city });

            const cityExists = cities.some(
              (c) => c.value.toLowerCase() === city.toLowerCase()
            );
            if (!cityExists) {
              setCities((prev) => [...prev, { value: city, label: city }]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching city from postal code:", error);
      }
    }
  };

  const handleCountryChange = (value: string) => {
    const selectedCountryData = countries.find((c) => c.value === value);
    setSelectedCountry(value);
    setSelectedCountryCode(selectedCountryData?.code || "");
    formAddress.setFieldsValue({ city: "", postal_code: "" });
    setCities([]);
    if (selectedCountryData?.code) {
      loadCities(selectedCountryData.code);
    }
  };

  const handleConnect = (service: string) => {
    if (service === "google") {
      window.location.href = `${API_URL}/add-googleCalendar?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
    } else if (service === "outlook") {
      window.location.href = `${API_URL}/add-microsoftAccount?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
    } else if (service === "dropbox") {
      window.location.href = `${API_URL}/add-dropbox?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
    }
  };

  const handleDisconnectAccount = async (
    accountId: string,
    provider: string
  ) => {
    console.log("Disconnecting account:", accountId, provider);
  };

  const renderConnectedAccounts = (provider: string) => {
    const accounts = connectedAccounts.filter(
      (acc) => acc.provider === provider
    );
    if (!accounts.length) return null;

    return (
      <div
        style={{
          marginTop: 8,
          background: `linear-gradient(135deg, ${PRIMARY_COLOR}08 0%, ${PRIMARY_COLOR}03 100%)`,
          borderRadius: 8,
          padding: "12px",
          border: `1px solid ${PRIMARY_COLOR}15`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 600,
              color: "#2c3e50",
              fontSize: "12px",
            }}
          >
            Connected Accounts ({accounts.length})
          </Text>
          <Button
            type="text"
            size="small"
            icon={<Plus size={12} />}
            onClick={() => handleConnect(provider)}
            style={{
              fontFamily: FONT_FAMILY,
              color: PRIMARY_COLOR,
              fontSize: "11px",
              height: "22px",
              padding: "0 6px",
            }}
          >
            Add
          </Button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {accounts.map((acc, idx) => {
            let userData = null;
            try {
              userData = acc.user_object ? JSON.parse(acc.user_object) : null;
            } catch (_) {}

            const picture = userData?.picture;

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "white",
                  borderRadius: 6,
                  padding: "6px 10px",
                  boxShadow: `0 2px 8px ${PRIMARY_COLOR}10`,
                  border: `1px solid ${PRIMARY_COLOR}10`,
                  minWidth: "180px",
                  position: "relative",
                }}
              >
                <Avatar
                  size={24}
                  src={picture}
                  icon={!picture && <User size={12} />}
                  style={{
                    marginRight: 8,
                    border: `1.5px solid ${PRIMARY_COLOR}20`,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontWeight: 500,
                      fontSize: "12px",
                      color: "#2c3e50",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {userData?.email || acc.email}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: "10px",
                      color: "#52c41a",
                    }}
                  >
                    Active
                  </Text>
                </div>
                <Tooltip title="Disconnect">
                  <Button
                    type="text"
                    size="small"
                    icon={<X size={10} />}
                    onClick={() => handleDisconnectAccount(acc.id, provider)}
                    style={{
                      width: 18,
                      height: 18,
                      padding: 0,
                      color: "#999",
                      marginLeft: 6,
                    }}
                  />
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const [isDetailsEditing, setIsDetailsEditing] = useState(false);
  const [personalValues, setPersonalValues] = useState<UserProfile | null>(
    null
  );
  const [profileImage, setProfileImage] = useState<string>("");
  const [formDetails] = Form.useForm();
  const [username, setUsername] = useState<string>("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [workingHours, setWorkingHours] = useState([
    dayjs("09:00", "HH:mm"),
    dayjs("17:00", "HH:mm"),
  ]);

  const router = useRouter();

  // Handle hash-based navigation to feedback tab
   useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#feedback") {
        setActiveTab("feedback");
      } else if (hash === "#preferences") {
        setActiveTab("preferences");
      }
    };

    // Custom event listener for tab changes from header
    const handleCustomTabChange = (event: CustomEvent) => {
      const { tab } = event.detail;
      setActiveTab(tab);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("changeProfileTab", handleCustomTabChange as EventListener);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("changeProfileTab", handleCustomTabChange as EventListener);
    };
  }, []);

  const mockConnectedAccounts: ConnectedAccount[] = [
    {
      id: "1",
      provider: "google",
      email: "john.doe@gmail.com",
      user_object: JSON.stringify({
        email: "john.doe@gmail.com",
        picture:
          "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
      }),
    },
    {
      id: "2",
      provider: "google",
      email: "jane.smith@gmail.com",
      user_object: JSON.stringify({
        email: "jane.smith@gmail.com",
        picture:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
      }),
    },
    {
      id: "3",
      provider: "outlook",
      email: "work@company.com",
      user_object: JSON.stringify({
        email: "work@company.com",
      }),
    },
  ];
  
  useEffect(() => {
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const { data } = await getProfilePictures();

      if (data?.status === 1 && data.payload?.file) {
        setProfileImage(data.payload.file.publicUrl); // ✅ direct image URL
      } else {
        setProfileImage(""); // fallback (e.g. default avatar)
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      setProfileImage("");
    }
  };

  useEffect(() => {
    const connected = {
      apple: false,
      outlook: false,
      google: false,
      dropbox: false,
    };
    mockConnectedAccounts.forEach((acc: ConnectedAccount) => {
      if (acc.provider in connected) {
        connected[acc.provider as keyof typeof connected] = true;
      }
    });
    setConnectedAccounts(mockConnectedAccounts);
    setConnections(connected);
  }, []);

  const connectionData = [
    {
      key: "google",
      name: "Google",
      description: "Files, Calendar & Photos",
      icon: <Chrome size={18} style={{ color: "#4285f4" }} />,
      color: "#4285f4",
      bgColor: "#4285f408",
    },
    {
      key: "dropbox",
      name: "Dropbox",
      description: "Cloud Storage & Files",
      icon: <Folder size={18} style={{ color: "#0061FF" }} />,
      color: "#0061FF",
      bgColor: "#0061FF08",
    },
    {
      key: "outlook",
      name: "Microsoft 365",
      description: "Email, Calendar & OneDrive",
      icon: <Mail size={18} style={{ color: "#0078d4" }} />,
      color: "#0078d4",
      bgColor: "#0078d408",
    },
    {
      key: "apple",
      name: "Apple iCloud",
      description: "Photos, Files & Calendar",
      icon: <Apple size={18} style={{ color: "#000" }} />,
      color: "#000",
      bgColor: "#00000008",
    },
  ];

  const uploadProps = {
    name: "avatar",
    listType: "picture-card" as const,
    className: "avatar-uploader",
    showUploadList: false,
    beforeUpload: async (file: File) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG/PNG file!");
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must smaller than 2MB!");
        return false;
      }

      try {
        // Local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setProfileImage(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);

        // Upload to backend
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await uploadProfilePicture(formData);

        if (data?.status === 1) {
          const uploadedFile = data.payload.file; // depends on your backend response
          message.success("Profile picture uploaded successfully");

          setProfileImage(data.payload.file.publicUrl);
          fetchProfilePicture();
        } else {
          message.error("Failed to upload profile picture");
        }
      } catch (error) {
        console.error(error);
        message.error("Upload error, please try again");
      }

      return false; // prevent default upload
    },
  };


  const handleDetailsSave = async () => {
    try {
      const values = await formDetails.validateFields();
       const originalUsername = username;

      let usernameUpdated = false;
      if (values.user_name !== originalUsername) {
        const usernameResponse = await updateUsername({ user_name: values.user_name });
        const { status, message: msg, payload } = usernameResponse.data;

        if (status === 1) {
          setUsername(payload.user_name);
          localStorage.setItem("username", payload.user_name);
          message.success("Username updated successfully!");
          usernameUpdated = true;
        } else {
          message.error(msg || "Failed to update username");
          return;
        }
      }

      const dob = values.date_of_birth
        ? values.date_of_birth.format("YYYY-MM-DD")
        : null;
      const payload = {
        personal: {
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone_number,
          gender: values.gender,
          dob: dob,
          additional_email: values.additional_emails,
        },
        address: {
          country: values.country,
          city: values.city,
          postal_code: values.postal_code,
        },
      };

      const response = await userAddProfile(payload);
      const { status, message: msg } = response.data;

      if (status === 1) {
        message.success(msg || "Details updated successfully!");
        setIsDetailsEditing(false);
        await fetchProfileAndCheck();
      }
      if (usernameUpdated) {
          router.replace(`/${values.user_name}/profile`);
        } 
      else {
        message.error(msg || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Please fill in all required fields.");
    }
  };

  const fetchProfileAndCheck = async () => {
    setLoading(true);
    try {
      const response = await getUserProfile({});
      const { status, payload } = response.data;

      if (status === 1 && payload && Object.keys(payload).length > 0) {
        setPersonalValues(payload);
        setUsername(payload.user_name || currentUser?.user_name || ""); // Fallback to currentUser if payload.user_name is missing
        localStorage.setItem("username", payload.user_name || currentUser?.user_name || "");
      } else {
        router.push(`/${username || currentUser?.user_name || "profile"}/profile/setup`);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      message.error("Failed to load profile");
      router.push(`/${username || currentUser?.user_name || "profile"}/profile/setup`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "vini";
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    if (username) {
      fetchProfileAndCheck();
      const savedWorkingHours = localStorage.getItem("workingHours");
      if (savedWorkingHours) {
        const { start, end } = JSON.parse(savedWorkingHours);
        setWorkingHours([dayjs(start, "HH:mm"), dayjs(end, "HH:mm")]);
      }
    }
  }, [username]);

  if (!personalValues) {
    return <DocklyLoader />;
  }

  const activityData = [
    {
      title: "Profile Updated",
      description: "You updated your profile information",
      time: "2 hours ago",
      type: "info",
    },
    {
      title: "Password Changed",
      description: "Your password was successfully changed",
      time: "1 day ago",
      type: "success",
    },
    {
      title: "Login from New Device",
      description: "New login detected from Chrome on Windows",
      time: "3 days ago",
      type: "warning",
    },
    {
      title: "Account Created",
      description: "Welcome to Dockly! Your account has been created",
      time: "1 week ago",
      type: "success",
    },
  ];

  const connectedCount = Object.values(connections).filter(Boolean).length;
  const tabItems = [
    {
      key: "details",
      label: "Details",
      children: (
        <Card
          title="Personal Information"
          extra={
            isDetailsEditing ? (
              <Space>
                <Button
                  onClick={() => setIsDetailsEditing(false)}
                  style={{ fontFamily: FONT_FAMILY }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleDetailsSave}
                  style={{ fontFamily: FONT_FAMILY }}
                >
                  Save Changes
                </Button>
              </Space>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={() => setIsDetailsEditing(true)}
                style={{ fontFamily: FONT_FAMILY }}
              >
                Edit
              </Button>
            )
          }
          style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
        >
          {isDetailsEditing ? (
            <Form
              form={formDetails}
              layout="vertical"
              initialValues={{
                first_name: personalValues?.first_name,
                last_name: personalValues?.last_name,
                // username: username,
                user_name: personalValues?.user_name || username,
                primary_email: personalValues?.primary_email,
                phone_number: personalValues?.phone_number,
                gender: personalValues?.gender,
                date_of_birth: personalValues?.date_of_birth
                  ? dayjs(personalValues.date_of_birth)
                  : null,
                country: personalValues?.country,
                city: personalValues?.city,
                postal_code: personalValues?.postal_code,
                additional_emails: personalValues?.additional_emails,
              }}
              style={{ fontFamily: FONT_FAMILY }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="first_name"
                    label={
                      <span style={{ fontFamily: FONT_FAMILY }}>
                        First Name
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                    ]}
                  >
                    <Input size="large" style={{ fontFamily: FONT_FAMILY }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="last_name"
                    label={
                      <span style={{ fontFamily: FONT_FAMILY }}>Last Name</span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                    ]}
                  >
                    <Input size="large" style={{ fontFamily: FONT_FAMILY }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                                    <Form.Item
                    name="user_name"
                    label="Username"
                    rules={[
                      { required: true, message: "Username is required" },
                      { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: "Username must be 3-20 alphanumeric characters or underscores" },
                    ]}
                    style={{ marginBottom: "12px" }}
                  >
                    <Input
                      placeholder="Enter username"
                      style={{
                        borderRadius: "6px",
                        border: "1.5px solid #e8e8e8",
                        padding: "8px 10px",
                        fontSize: "13px",
                        transition: "all 0.3s ease",
                        fontFamily: FONT_FAMILY,
                        caretColor: "#1890ff",
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="primary_email"
                    label={
                      <span style={{ fontFamily: FONT_FAMILY }}>
                        Email Address
                      </span>
                    }
                  >
                    <Input
                      size="large"
                      disabled
                      style={{ fontFamily: FONT_FAMILY }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="phone_number"
                    label={
                      <span style={{ fontFamily: FONT_FAMILY }}>
                        Phone Number
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
                    ]}
                  >
                    <Input size="large" style={{ fontFamily: FONT_FAMILY }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="gender"
                    label={
                      <span style={{ fontFamily: FONT_FAMILY }}>Gender</span>
                    }
                  >
                    <Select
                      size="large"
                      placeholder="Select gender"
                      style={{ fontFamily: FONT_FAMILY }}
                    >
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                      <Option value="prefer_not_to_say">
                        Prefer not to say
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="country"
                    label="Country"
                    style={{ marginBottom: "12px" }}
                  >
                    <Select
                      placeholder="Select or search country"
                      showSearch
                      loading={loadingCountries}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={countries.map((country) => ({
                        value: country.value,
                        label: country.label,
                      }))}
                      onChange={handleCountryChange}
                      style={{
                        fontFamily: FONT_FAMILY,
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="city"
                    label="City"
                    style={{ marginBottom: "12px" }}
                  >
                    <Select
                      placeholder="Select or search city"
                      showSearch
                      loading={loadingCities}
                      options={cities}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      notFoundContent={
                        loadingCities ? (
                          <Spin size="small" />
                        ) : selectedCountry ? (
                          "No cities found"
                        ) : (
                          "Please select a country first"
                        )
                      }
                      disabled={!selectedCountry}
                      style={{
                        fontFamily: FONT_FAMILY,
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="postal_code"
                    label="Postal Code"
                    style={{ marginBottom: "12px" }}
                  >
                    <Input
                      placeholder="Enter postal code"
                      onChange={(e) => handlePostalCodeChange(e.target.value)}
                      onBlur={(e) => handlePostalCodeChange(e.target.value)}
                      style={{
                        fontFamily: FONT_FAMILY,
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="date_of_birth"
                    label={
                      <span style={{ fontFamily: FONT_FAMILY }}>
                        Date of Birth
                      </span>
                    }
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%", fontFamily: FONT_FAMILY }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="additional_email"
                    label="Additional Email"
                    style={{ marginBottom: "12px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "flex-start",
                        }}
                      >
                        <Input
                          placeholder="Enter additional email"
                          onChange={handleAdditionalEmailChange}
                          disabled={isAdditionalEmailVerified}
                          style={{
                            borderRadius: "6px",
                            border: `1.5px solid ${
                              isAdditionalEmailVerified ? "#52c41a" : "#e8e8e8"
                            }`,
                            padding: "8px 10px",
                            fontSize: "13px",
                            transition: "all 0.3s ease",
                            fontFamily: FONT_FAMILY,
                            flex: 1,
                            backgroundColor: isAdditionalEmailVerified
                              ? "#f6ffed"
                              : "white",
                            caretColor: "#1890ff",
                          }}
                        />
                        {formPersonal.getFieldValue("additional_email") &&
                          !isAdditionalEmailVerified && (
                            <Button
                              size="small"
                              type="primary"
                              loading={sendingOtp}
                              onClick={handleSendAdditionalEmailOtp}
                              style={{
                                fontSize: "11px",
                                height: "32px",
                                minWidth: "70px",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              {showAdditionalEmailOtp ? "Resend" : "Send OTP"}
                            </Button>
                          )}
                        {isAdditionalEmailVerified && (
                          <div
                            style={{
                              color: "#52c41a",
                              fontSize: "11px",
                              fontWeight: "500",
                              fontFamily: FONT_FAMILY,
                              display: "flex",
                              alignItems: "center",
                              padding: "0 8px",
                              height: "32px",
                              backgroundColor: "#f6ffed",
                              borderRadius: "4px",
                              border: "1px solid #b7eb8f",
                            }}
                          >
                            ✓ Verified
                          </div>
                        )}
                      </div>

                      {showAdditionalEmailOtp && !isAdditionalEmailVerified && (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-start",
                          }}
                        >
                          <Input
                            placeholder="Enter OTP"
                            value={additionalEmailOtp}
                            onChange={(e) =>
                              setAdditionalEmailOtp(e.target.value)
                            }
                            style={{
                              borderRadius: "6px",
                              border: "1.5px solid #e8e8e8",
                              padding: "8px 10px",
                              fontSize: "13px",
                              fontFamily: FONT_FAMILY,
                              flex: 1,
                              caretColor: "#1890ff",
                            }}
                            maxLength={6}
                          />
                          <Button
                            size="small"
                            type="primary"
                            loading={verifyingOtp}
                            onClick={handleVerifyAdditionalEmailOtp}
                            style={{
                              fontSize: "11px",
                              height: "32px",
                              minWidth: "60px",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            Verify
                          </Button>
                        </div>
                      )}

                      {showAdditionalEmailOtp && !isAdditionalEmailVerified && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#666",
                            fontFamily: FONT_FAMILY,
                            caretColor: "#1890ff",
                          }}
                        >
                          OTP sent to {additionalEmailValue}
                        </div>
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ) : (
            <div style={{ fontFamily: FONT_FAMILY }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      First Name
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.first_name || "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      Last Name
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.last_name || "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text strong style={{ color: "#666", fontFamily: FONT_FAMILY }}>
                      Username
                    </Text>
                    <div style={{ marginTop: "4px", fontSize: "16px", fontFamily: FONT_FAMILY }}>
                      {personalValues.user_name || username || "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      Email Address
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.primary_email || "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      Phone Number
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.phone_number || "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      Gender
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.gender || "Not specified"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      Date of Birth
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.date_of_birth
                        ? dayjs(personalValues.date_of_birth).format(
                            "MMMM DD, YYYY"
                          )
                        : "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      Country
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.country || "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      City
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.city || "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      Postal Code
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.postal_code || "Not provided"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ color: "#666", fontFamily: FONT_FAMILY }}
                    >
                      Additional Email
                    </Text>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {personalValues.additional_emails || "Not provided"}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: "preferences",
      label: "Preferences",
      children: (
        <div style={{ fontFamily: FONT_FAMILY }}>
          <Card
            title={
              <span style={{ fontFamily: FONT_FAMILY }}>
                Notification Preferences
              </span>
            }
            style={{
              marginBottom: "16px",
              borderRadius: "8px",
              fontFamily: FONT_FAMILY,
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <Text strong style={{ fontFamily: FONT_FAMILY }}>
                    Email Notifications
                  </Text>
                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Receive notifications via email
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text strong style={{ fontFamily: FONT_FAMILY }}>
                    Push Notifications
                  </Text>
                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Receive push notifications in browser
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onChange={setPushNotifications}
                />
              </div>
            </div>
          </Card>

          <Card
            title={
              <span style={{ fontFamily: FONT_FAMILY }}>Calendar Settings</span>
            }
            style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Working Hours
              </Text>
              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: "16px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Set your preferred working hours for calendar scheduling
              </Text>
              <Space>
                <TimePicker
                  value={workingHours[0]}
                  format="HH:mm"
                  onChange={(time) => {
                    const newWorkingHours = [
                      time || dayjs("09:00", "HH:mm"),
                      workingHours[1],
                    ];
                    setWorkingHours(newWorkingHours);
                    localStorage.setItem(
                      "workingHours",
                      JSON.stringify({
                        start: newWorkingHours[0].format("HH:mm"),
                        end: newWorkingHours[1].format("HH:mm"),
                      })
                    );
                  }}
                  placeholder="Start time"
                  style={{ fontFamily: FONT_FAMILY }}
                />
                <span style={{ fontFamily: FONT_FAMILY }}>to</span>
                <TimePicker
                  value={workingHours[1]}
                  format="HH:mm"
                  onChange={(time) => {
                    const newWorkingHours = [
                      workingHours[0],
                      time || dayjs("17:00", "HH:mm"),
                    ];
                    setWorkingHours(newWorkingHours);
                    localStorage.setItem(
                      "workingHours",
                      JSON.stringify({
                        start: newWorkingHours[0].format("HH:mm"),
                        end: newWorkingHours[1].format("HH:mm"),
                      })
                    );
                  }}
                  placeholder="End time"
                  style={{ fontFamily: FONT_FAMILY }}
                />
              </Space>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: "accounts",
      label: "Manage Accounts",
      children: (
        <div style={{ fontFamily: FONT_FAMILY }}>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            {connectionData.map((service) => {
              const key = service.key as keyof typeof connections;
              const isConnected = connections[key];
              const accountCount = connectedAccounts.filter(
                (acc) => acc.provider === service.key
              ).length;

              return (
                <Card
                  key={service.key}
                  style={{
                    borderRadius: "10px",
                    boxShadow: isConnected
                      ? `0 2px 12px ${service.color}15`
                      : `0 2px 8px ${PRIMARY_COLOR}08`,
                    border: isConnected
                      ? `1px solid ${service.color}20`
                      : `1px solid ${PRIMARY_COLOR}10`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "white",
                    fontFamily: FONT_FAMILY,
                  }}
                  bodyStyle={{ padding: "14px" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = isConnected
                      ? `0 4px 16px ${service.color}25`
                      : `0 4px 12px ${PRIMARY_COLOR}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isConnected
                      ? `0 2px 12px ${service.color}15`
                      : `0 2px 8px ${PRIMARY_COLOR}08`;
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <Avatar
                        size={36}
                        style={{
                          backgroundColor: service.bgColor,
                          border: `2px solid ${service.color}15`,
                        }}
                      >
                        {service.icon}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 1,
                          }}
                        >
                          <Text
                            style={{
                              margin: 0,
                              fontFamily: FONT_FAMILY,
                              fontWeight: 600,
                              color: "#2c3e50",
                              fontSize: "14px",
                            }}
                          >
                            {service.name}
                          </Text>
                          {isConnected && (
                            <Badge
                              count={accountCount}
                              size="small"
                              style={{
                                backgroundColor: service.color,
                                fontSize: "9px",
                              }}
                            />
                          )}
                        </div>
                        <Text
                          style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: "12px",
                            color: "#666",
                            display: "block",
                            marginBottom: 2,
                          }}
                        >
                          {service.description}
                        </Text>
                        <Text
                          style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: "11px",
                            color: isConnected ? service.color : "#999",
                            fontWeight: 500,
                          }}
                        >
                          {isConnected ? "✓ Connected" : "Not Connected"}
                        </Text>
                      </div>
                    </div>

                    <Button
                      type={isConnected ? "default" : "primary"}
                      onClick={() => handleConnect(service.key)}
                      icon={
                        isConnected ? <Check size={14} /> : <Plus size={14} />
                      }
                      size="small"
                      style={{
                        borderRadius: 6,
                        fontFamily: FONT_FAMILY,
                        fontWeight: 500,
                        fontSize: "12px",
                        background: isConnected
                          ? "transparent"
                          : `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_COLOR}dd 100%)`,
                        color: isConnected ? service.color : "#fff",
                        border: isConnected
                          ? `1px solid ${service.color}30`
                          : "none",
                        minWidth: "80px",
                        height: "28px",
                      }}
                    >
                      {isConnected ? "Manage" : "Connect"}
                    </Button>
                  </div>
                  {isConnected && renderConnectedAccounts(service.key)}
                </Card>
              );
            })}
          </Space>

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "6px",
              background: `${PRIMARY_COLOR}02`,
              border: `1px solid ${PRIMARY_COLOR}10`,
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#666",
                fontFamily: FONT_FAMILY,
                fontWeight: 400,
              }}
            >
              🔒 Your data is encrypted and secure. We never access your
              personal files.
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: "subscription",
      label: "Subscription",
      children: (
        <Card style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <CreditCardOutlined
              style={{
                fontSize: "48px",
                color: "#52c41a",
                marginBottom: "16px",
              }}
            />
            <Title level={4} style={{ fontFamily: FONT_FAMILY }}>
              View and manage your dockly subscription plan and billing history
            </Title>
            <Paragraph
              type="secondary"
              style={{ marginBottom: "24px", fontFamily: FONT_FAMILY }}
            >
              Upgrade your plan or view your billing information
            </Paragraph>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                style={{ fontFamily: FONT_FAMILY }}
              >
                Upgrade Plan
              </Button>
              <Button size="large" style={{ fontFamily: FONT_FAMILY }}>
                View Billing History
              </Button>
            </Space>
          </div>
        </Card>
      ),
    },
    {
      key: "activity",
      label: "Activity",
      children: (
        <RecentActivity compact={false} showHeader={false}/>
      ),
    },
    {
      key: "feedback",
      label: "Feedback",
      children: (
        <Card
          title={
            <span style={{ fontFamily: FONT_FAMILY }}>
              Send us your feedback
            </span>
          }
          style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
        >
          <Form
            layout="vertical"
            style={{ fontFamily: FONT_FAMILY }}
            onFinish={(values) => {
              const { rating, type, experience } = values;
              const subject = encodeURIComponent(`Dockly Feedback - ${type}`);
              const body = encodeURIComponent(
                `Rating: ${rating} stars\nType: ${type}\n\nFeedback:\n${experience}`
              );

              // Try mailto first
              const mailto = `mailto:dockly.me@gmail.com?subject=${subject}&body=${body}`;

              // Create a temporary link to test mailto
              const link = document.createElement("a");
              link.href = mailto;
              link.style.display = "none";
              document.body.appendChild(link);

              // Attempt to trigger mailto
              const mailtoClicked = link.click();
              document.body.removeChild(link);

              // Fallback to web-based email (Gmail as default)
              setTimeout(() => {
                // If mailto doesn't work (no client response), redirect to Gmail
                const hasEmailClient = connectedAccounts.some((acc) =>
                  ["google", "outlook", "apple"].includes(acc.provider)
                );

                if (!hasEmailClient) {
                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=dockly.me@gmail.com&su=${subject}&body=${body}`;
                  window.open(gmailUrl, "_blank");
                  message.info("Opening Gmail to send your feedback...");
                } else {
                  // If connected accounts exist, prioritize user's connected email service
                  const googleAccount = connectedAccounts.find(
                    (acc) => acc.provider === "google"
                  );
                  const outlookAccount = connectedAccounts.find(
                    (acc) => acc.provider === "outlook"
                  );
                  const appleAccount = connectedAccounts.find(
                    (acc) => acc.provider === "apple"
                  );

                  if (googleAccount) {
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=dockly.me@gmail.com&su=${subject}&body=${body}`;
                    window.open(gmailUrl, "_blank");
                    message.info("Opening Gmail to send your feedback...");
                  } else if (outlookAccount) {
                    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=dockly.me@gmail.com&subject=${subject}&body=${body}`;
                    window.open(outlookUrl, "_blank");
                    message.info("Opening Outlook to send your feedback...");
                  } else if (appleAccount) {
                    // Apple iCloud mail doesn't have a direct compose URL, fallback to mailto
                    window.location.href = mailto;
                    message.info(
                      "Opening your default email client to send feedback..."
                    );
                  } else {
                    window.location.href = mailto;
                    message.info(
                      "Opening your default email client to send feedback..."
                    );
                  }
                }
              }, 500); // Small delay to allow mailto to attempt opening
            }}
          >
            <Form.Item
              name="rating"
              label={
                <span style={{ fontFamily: FONT_FAMILY }}>
                  How would you rate your overall experience?
                </span>
              }
              rules={[{ required: true, message: "Please provide a rating" }]}
            >
              <Rate style={{ fontSize: "24px" }} />
            </Form.Item>

            <Form.Item
              name="type"
              label={
                <span style={{ fontFamily: FONT_FAMILY }}>
                  What type of feedback do you have?
                </span>
              }
              rules={[
                { required: true, message: "Please select a feedback type" },
              ]}
            >
              <Select
                size="large"
                placeholder="Select feedback type"
                style={{ width: "100%", fontFamily: FONT_FAMILY }}
              >
                <Option value="bug">Bug Report</Option>
                <Option value="feature">Feature Request</Option>
                <Option value="improvement">Improvement Suggestion</Option>
                <Option value="general">General Feedback</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="experience"
              label={
                <span style={{ fontFamily: FONT_FAMILY }}>
                  Tell us more about your experience
                </span>
              }
              rules={[
                { required: true, message: "Please enter your feedback" },
                {
                  validator: (_, value) =>
                    value && value.trim().length > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("Please enter your feedback")),
                },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
                style={{ resize: "none", fontFamily: FONT_FAMILY }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SaveOutlined />}
                style={{ fontFamily: FONT_FAMILY }}
              >
                Submit Feedback
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "24px",
        paddingTop: "80px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontFamily: FONT_FAMILY,
            position: "relative",
          }}
        >
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              position: "absolute",
              top: "11px",
              right: "24px",
              color: "#ff4d4f",
              fontSize: "15px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              fontFamily: FONT_FAMILY,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ff4d4f15";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Logout
          </Button>

          <Row align="middle" gutter={24}>
            <Col>
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginBottom: "12px",
                }}
              >
                <Upload {...uploadProps}>
                  <div
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {profileImage ? (
                      <Avatar
                        size={100}
                        src={profileImage}
                        style={{
                          border: "3px solid #f0f0f0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                      />
                    ) : (
                      <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: "#f5f5f5",
                          color: "#8c8c8c",
                          border: "3px solid #f0f0f0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        right: "-2px",
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#1890ff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                      }}
                    >
                      <EditOutlined
                        style={{ color: "white", fontSize: "14px" }}
                      />
                    </div>
                  </div>
                </Upload>
              </div>
            </Col>
            <Col flex="auto">
              <Title
                level={2}
                style={{ marginBottom: "8px", fontFamily: FONT_FAMILY }}
              >
                {personalValues.first_name} {personalValues.last_name}
              </Title>
              <div style={{ display: "flex", alignItems: "center" }}>
                  <UserOutlined style={{ marginRight: "8px", color: "#666" }} />
                  <Text style={{ fontFamily: FONT_FAMILY }}>
                    {personalValues.user_name || username || "Not provided"}
                  </Text>
                </div>
              <Space direction="vertical" size="small">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MailOutlined style={{ marginRight: "8px", color: "#666" }} />
                  <Text style={{ fontFamily: FONT_FAMILY }}>
                    {personalValues.primary_email}
                  </Text>
                </div>
                {personalValues.phone_number && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <PhoneOutlined
                      style={{ marginRight: "8px", color: "#666" }}
                    />
                    <Text style={{ fontFamily: FONT_FAMILY }}>
                      {personalValues.phone_number}
                    </Text>
                  </div>
                )}
                {personalValues.date_of_birth && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <CalendarOutlined
                      style={{ marginRight: "8px", color: "#666" }}
                    />
                    <Text style={{ fontFamily: FONT_FAMILY }}>
                      {dayjs(personalValues.date_of_birth).format(
                        "MMMM DD, YYYY"
                      )}
                    </Text>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <EnvironmentOutlined
                    style={{ marginRight: "8px", color: "#666" }}
                  />
                  <Text style={{ fontFamily: FONT_FAMILY }}>
                    {personalValues.city}, {personalValues.country}
                  </Text>
                </div>
              </Space>
            </Col>
            <Col></Col>
          </Row>
        </Card>

        <Card
          style={{
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontFamily: FONT_FAMILY,
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            style={{
              fontFamily: FONT_FAMILY,
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;