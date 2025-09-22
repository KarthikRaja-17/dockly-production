"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Input,
  Form,
  Steps,
  Select,
  message,
  Typography,
  DatePicker,
  Upload,
  Row,
  Col,
  Spin,
  Modal,
} from "antd";
import {
  SaveOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CameraOutlined,
  LoadingOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";
import { userAddProfile, getUserProfile } from "../../../../services/user";
import { showNotification } from "../../../../utils/notification";
import { motion } from "framer-motion";
import type { UploadProps } from "antd";
import {
  getProfilePictures,
  sendAdditionalEmailOtp,
  uploadProfilePicture,
  verifyAdditionalEmailOtp,
} from "../../../../services/apiConfig";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const { Step } = Steps;
const { Title, Text } = Typography;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface CountryOption {
  value: string;
  label: string;
  code: string;
  flag: string;
}

interface StateOption {
  value: string;
  label: string;
}

const SetupPage: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string>("");
  const [formPersonal] = Form.useForm();
  const [formAddress] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<StateOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [additionalEmailOtp, setAdditionalEmailOtp] = useState<string>("");
  const [additionalEmailOtpId, setAdditionalEmailOtpId] = useState<string>("");
  const [isAdditionalEmailVerified, setIsAdditionalEmailVerified] =
    useState<boolean>(false);
  const [showAdditionalEmailOtp, setShowAdditionalEmailOtp] =
    useState<boolean>(false);
  const [additionalEmailValue, setAdditionalEmailValue] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [countrySearchValue, setCountrySearchValue] = useState<string>("");
  const [stateSearchValue, setStateSearchValue] = useState<string>("");
  const [citySearchValue, setCitySearchValue] = useState<string>("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,flag"
        );
        const data = await response.json();
        const countryOptions = data
          .map((country: any) => ({
            value: country.name.common,
            label: country.name.common,
            code: country.cca2,
            flag: country.flag,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setCountries(countryOptions);
      } catch (error) {
        console.error("Error loading countries:", error);
        showNotification("Error", "Failed to load countries", "error");
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (username) {
        try {
          const response = await getUserProfile({ username });
          const { status, payload } = response.data;

          if (status === 1 && payload && Object.keys(payload).length > 0) {
            setIsNavigating(true);
            router.push(`/${username}/profile`);
          }
        } catch (error) {
          console.error("Error checking existing profile:", error);
        }
      }
    };

    checkExistingProfile();
  }, [username, router]);

  const loadStates = async (countryCode: string) => {
    if (!countryCode) {
      setStates([]);
      setSelectedState("");
      formAddress.setFieldsValue({ state: "" });
      setCities([]);
      setSelectedCity("");
      formAddress.setFieldsValue({ city: "" });
      return;
    }

    setLoadingStates(true);
    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
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

      if (data.error === false && Array.isArray(data.data.states)) {
        const stateOptions = data.data.states
          .map(
            (state: any): StateOption => ({
              value: state.name,
              label: state.name,
            })
          )
          .sort((a: StateOption, b: StateOption) =>
            a.label.localeCompare(b.label)
          );

        setStates(stateOptions);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error("Error loading states:", error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (countryCode: string, stateName: string) => {
    if (!countryCode || !stateName) {
      setCities([]);
      setSelectedCity("");
      formAddress.setFieldsValue({ city: "" });
      return;
    }

    setLoadingCities(true);
    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: countries.find((c) => c.code === countryCode)?.value || "",
            state: stateName,
          }),
        }
      );

      const data = await response.json();

      if (data.error === false && Array.isArray(data.data)) {
        const cityOptions = (data.data as string[])
          .map(
            (city): StateOption => ({
              value: city,
              label: city,
            })
          )
          .sort((a, b) => a.label.localeCompare(b.label));

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
            setSelectedCity(city);
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
    if (selectedCountryData) {
      setSelectedCountry(value);
      setSelectedCountryCode(selectedCountryData.code);
      setCountrySearchValue(selectedCountryData.label);
      formAddress.setFieldsValue({ country: value });
      setSelectedState("");
      formAddress.setFieldsValue({ state: "" });
      setSelectedCity("");
      formAddress.setFieldsValue({ city: "" });
      setStates([]);
      setCities([]);
      loadStates(selectedCountryData.code);
    }
    setShowCountryDropdown(false);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setStateSearchValue(value);
    formAddress.setFieldsValue({ state: value });
    setSelectedCity("");
    formAddress.setFieldsValue({ city: "" });
    setCities([]);
    if (selectedCountryCode && value) {
      loadCities(selectedCountryCode, value);
    }
    setShowStateDropdown(false);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setCitySearchValue(value);
    formAddress.setFieldsValue({ city: value });
    setShowCityDropdown(false);
  };

  const handleCountryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountrySearchValue(value);
  };

  const handleStateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStateSearchValue(value);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCitySearchValue(value);
  };

  const handleCountryFocus = () => {
    if (countrySearchValue && !selectedCountry) {
      setShowCountryDropdown(true);
    }
  };

  const handleStateFocus = () => {
    if (stateSearchValue && selectedCountry && !selectedState) {
      setShowStateDropdown(true);
    }
  };

  const handleCityFocus = () => {
    if (citySearchValue && selectedState && !selectedCity) {
      setShowCityDropdown(true);
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.label.toLowerCase().includes(countrySearchValue.toLowerCase())
  );

  const filteredStates = states.filter((state) =>
    state.label.toLowerCase().includes(stateSearchValue.toLowerCase())
  );

  const filteredCities = cities.filter((city) =>
    city.label.toLowerCase().includes(citySearchValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;

      const countryInput = document.querySelector('input[name="country"]');
      const stateInput = document.querySelector('input[name="state"]');
      const cityInput = document.querySelector('input[name="city"]');

      if (countryInput && !countryInput.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }

      if (stateInput && !stateInput.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }

      if (cityInput && !cityInput.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleAdditionalEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    formPersonal.setFieldsValue({ additional_email: value });

    if (value !== additionalEmailValue) {
      setIsAdditionalEmailVerified(false);
      setShowAdditionalEmailOtp(false);
      setAdditionalEmailOtp("");
      setAdditionalEmailOtpId("");
      setAdditionalEmailValue(value);
    }
  };

  const handleNext = async () => {
    const forms = [formPersonal, formAddress];
    try {
      await forms[currentStep].validateFields();

      const additionalEmail = formPersonal.getFieldValue("additional_email");
      if (additionalEmail && !isAdditionalEmailVerified) {
        showNotification(
          "Error",
          "Please verify your additional email before proceeding",
          "error"
        );
        return;
      }

      if (currentStep === 1) {
        const addressValues = await formAddress.validateFields();
        if (!selectedCountry || !selectedState || !selectedCity) {
          showNotification(
            "Error",
            "Please select a country, state, and city from the dropdown.",
            "error"
          );
          return;
        }
      }

      setCurrentStep((prev) => prev + 1);
    } catch {
      showNotification(
        "Error",
        "Please fill in all required fields before proceeding.",
        "error"
      );
    }
  };

  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const handleSave = async () => {
    try {
      const [personalValues, addressValues] = await Promise.all([
        formPersonal.validateFields(),
        formAddress.validateFields(),
      ]);

      const additionalEmail = personalValues.additional_email;
      if (additionalEmail && !isAdditionalEmailVerified) {
        showNotification(
          "Error",
          "Please verify your additional email before saving",
          "error"
        );
        return;
      }

      if (!selectedCountry || !selectedState || !selectedCity) {
        showNotification(
          "Error",
          "Please select a country, state, and city from the dropdown.",
          "error"
        );
        return;
      }

      const dob = personalValues.dob
        ? personalValues.dob.format("YYYY-MM-DD")
        : null;
      const profileData = {
        personal: {
          first_name: personalValues.first_name,
          last_name: personalValues.last_name,
          phone: personalValues.phone,
          gender: personalValues.gender,
          dob: dob,
          additional_email: isAdditionalEmailVerified
            ? personalValues.additional_email
            : null,
        },
        address: {
          country: addressValues.country,
          state: addressValues.state,
          city: addressValues.city,
          postal_code: addressValues.postal_code,
        },
      };

      const response: AxiosResponse<any> = await userAddProfile(profileData);

      const { status, message: msg } = response.data;

      if (status === 1) {
        showNotification(
          "Success",
          msg || "Profile setup completed successfully!",
          "success"
        );
        setIsNavigating(true);
        router.push(`/${username}/profile`);
      } else {
        showNotification("Error", msg || "Failed to setup profile", "error");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification("Error", "Please fill in all required fields.", "error");
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    listType: "picture-card",
    showUploadList: false,
    beforeUpload: async (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        showNotification("Error", "You can only upload JPG/PNG file!", "error");
        return Upload.LIST_IGNORE;
      }

      const isLt2M = file.size / 1024 / 1024 < 5;
      if (!isLt2M) {
        showNotification("Error", "Image must smaller than 5MB!", "error");
        return Upload.LIST_IGNORE;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await uploadProfilePicture(formData);
        const { status, payload, message: msg } = response.data;

        if (status === 1) {
          const url = payload.file.webViewLink;
          setProfileImage(url);
          showNotification(
            "Success",
            msg || "Profile picture uploaded",
            "success"
          );
        } else {
          showNotification(
            "Error",
            msg || "Failed to upload profile picture",
            "error"
          );
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        showNotification("Error", "Upload failed", "error");
      }

      return Upload.LIST_IGNORE;
    },
  };

  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const response = await getProfilePictures();
        const { status, payload } = response.data;
        if (status === 1 && payload.files.length > 0) {
          setProfileImage(payload.files[0].webViewLink);
        }
      } catch (error) {
        console.error("Error loading profile pictures:", error);
      }
    };

    loadProfilePicture();
  }, []);

  const stepTitles = ["Personal Information", "Address Details"];

  if (isNavigating) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#e6e8f5ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: "#1890ff" }}
                spin
              />
            }
            size="large"
          />
          <div
            style={{
              marginTop: "24px",
              fontSize: "16px",
              color: "#595959",
              fontFamily: FONT_FAMILY,
            }}
          >
            Setting up your profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e6e8f5ff",
        padding: "80px 16px 24px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          margin: "0 auto",
        }}
      >
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            border: "none",
            overflow: "hidden",
            background: "#ffffff",
          }}
          bodyStyle={{ padding: "24px 20px" }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
              position: "relative",
            }}
          >
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
                      size={60}
                      src={profileImage}
                      style={{
                        border: "3px solid #f0f0f0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    />
                  ) : (
                    <Avatar
                      size={60}
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
                      width: "22px",
                      height: "22px",
                      backgroundColor: "#1890ff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid white",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    }}
                  >
                    <CameraOutlined
                      style={{ color: "white", fontSize: "10px" }}
                    />
                  </div>
                </div>
              </Upload>
            </div>

            <Title
              level={2}
              style={{
                marginBottom: "4px",
                color: "#262626",
                fontWeight: "500",
                fontSize: "20px",
                fontFamily: FONT_FAMILY,
              }}
            >
              Complete Your Profile
            </Title>
            <Text
              style={{
                color: "#8c8c8c",
                fontSize: "13px",
                display: "block",
                fontFamily: FONT_FAMILY,
              }}
            >
              Help us personalize your experience
            </Text>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Steps current={currentStep} size="small">
              {stepTitles.map((title, index) => (
                <Step
                  key={index}
                  title={
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {title}
                    </span>
                  }
                />
              ))}
            </Steps>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div style={{ display: currentStep === 0 ? "block" : "none" }}>
              <Form form={formPersonal} layout="vertical">
                <Row gutter={[12, 4]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="first_name"
                      label="First Name"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ marginBottom: "12px" }}
                    >
                      <Input
                        placeholder="Enter first name"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value.replace(/\s/g, "");
                          e.target.value = value;
                          e.target.dispatchEvent(
                            new Event("input", { bubbles: true })
                          );
                        }}
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
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="last_name"
                      label="Last Name"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ marginBottom: "12px" }}
                    >
                      <Input
                        placeholder="Enter last name"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value.replace(/\s/g, "");
                          e.target.value = value;
                          e.target.dispatchEvent(
                            new Event("input", { bubbles: true })
                          );
                        }}
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

                <Row gutter={[12, 4]}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="dob"
                      label="Date of Birth"
                      style={{ marginBottom: "12px" }}
                    >
                      <DatePicker
                        style={{
                          width: "100%",
                          borderRadius: "6px",
                          border: "1.5px solid #e8e8e8",
                          padding: "8px 10px",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                          caretColor: "#1890ff",
                        }}
                        placeholder="Select date"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="gender"
                      label="Gender"
                      style={{ marginBottom: "12px" }}
                    >
                      <Select
                        placeholder="Select gender"
                        style={{ fontFamily: FONT_FAMILY, fontSize: "13px" }}
                        options={[
                          { value: "male", label: "Male" },
                          { value: "female", label: "Female" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Email" style={{ marginBottom: "12px" }}>
                      <Input
                        value={email}
                        disabled
                        style={{
                          borderRadius: "6px",
                          border: "1.5px solid #f0f0f0",
                          padding: "8px 10px",
                          fontSize: "13px",
                          backgroundColor: "#fafafa",
                          color: "#8c8c8c",
                          fontFamily: FONT_FAMILY,
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[12, 4]}>
                  <Col xs={24} sm={12}>
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
                                isAdditionalEmailVerified
                                  ? "#52c41a"
                                  : "#e8e8e8"
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

                        {showAdditionalEmailOtp &&
                          !isAdditionalEmailVerified && (
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
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setAdditionalEmailOtp(e.target.value)}
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

                        {showAdditionalEmailOtp &&
                          !isAdditionalEmailVerified && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#666",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              OTP sent to {additionalEmailValue}
                            </div>
                          )}
                      </div>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ marginBottom: "12px" }}
                    >
                      <PhoneInput
                        country={"in"}
                        preferredCountries={["in", "us"]}
                        enableSearch={true}
                        inputStyle={{
                          width: "100%",
                          height: "28px",
                          borderRadius: "6px",
                          border: "1.5px solid #e8e8e8",
                          padding: "6px 10px 6px 48px",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                          caretColor: "#1890ff",
                        }}
                        buttonStyle={{
                          width: "40px",
                          height: "28px",
                          border: "none",
                          background: "#f5f5f5",
                          borderRadius: "6px 0 0 6px",
                        }}
                        dropdownStyle={{
                          fontFamily: FONT_FAMILY,
                          fontSize: "12px",
                          width: "250px",
                          maxHeight: "250px",
                          overflowY: "auto",
                        }}
                        inputProps={{
                          name: "phone",
                          required: true,
                        }}
                        onChange={(phone: string) => {
                          formPersonal.setFieldsValue({ phone });
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>

            <div style={{ display: currentStep === 1 ? "block" : "none" }}>
              <Form form={formAddress} layout="vertical">
                <Row gutter={[12, 4]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="country"
                      label="Country"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ marginBottom: "12px" }}
                    >
                      <div style={{ position: "relative" }}>
                        <Input
                          placeholder="Search country"
                          value={countrySearchValue}
                          onChange={handleCountryInputChange}
                          onFocus={handleCountryFocus}
                          style={{
                            borderRadius: "6px",
                            border: "1.5px solid #e8e8e8",
                            padding: "8px 32px 8px 12px",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                            caretColor: "#1890ff",
                            width: "100%",
                          }}
                          suffix={
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setShowCountryDropdown(!showCountryDropdown)
                              }
                            >
                              {selectedCountry && (
                                <span
                                  style={{
                                    color: "#52c41a",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    marginRight: "8px",
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                              <DownOutlined
                                style={{
                                  color: "#8c8c8c",
                                  fontSize: "12px",
                                  marginRight: "8px",
                                }}
                              />
                            </span>
                          }
                        />
                        {showCountryDropdown && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              backgroundColor: "white",
                              border: "1px solid #d9d9d9",
                              borderRadius: "0 0 6px 6px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              zIndex: 1000,
                              maxHeight: "200px",
                              overflowY: "auto",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            {loadingCountries ? (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#8c8c8c",
                                  fontSize: "13px",
                                }}
                              >
                                <Spin size="small" /> Loading countries...
                              </div>
                            ) : filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <div
                                  key={country.value}
                                  onClick={() =>
                                    handleCountryChange(country.value)
                                  }
                                  style={{
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f0f0f0",
                                    backgroundColor:
                                      selectedCountry === country.value
                                        ? "#f0f5ff"
                                        : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "background-color 0.2s ease",
                                  }}
                                  onMouseEnter={(
                                    e: React.MouseEvent<HTMLDivElement>
                                  ) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#f0f5ff";
                                  }}
                                  onMouseLeave={(
                                    e: React.MouseEvent<HTMLDivElement>
                                  ) => {
                                    e.currentTarget.style.backgroundColor =
                                      selectedCountry === country.value
                                        ? "#f0f5ff"
                                        : "transparent";
                                  }}
                                >
                                  <span style={{ fontSize: "14px" }}>
                                    {country.flag}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {country.label}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#8c8c8c",
                                  fontSize: "13px",
                                }}
                              >
                                No countries found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="state"
                      label="State"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ marginBottom: "12px" }}
                    >
                      <div style={{ position: "relative" }}>
                        <Input
                          placeholder={
                            selectedCountry
                              ? "Search state"
                              : "Select country first"
                          }
                          value={stateSearchValue}
                          onChange={handleStateInputChange}
                          onFocus={handleStateFocus}
                          disabled={!selectedCountry}
                          style={{
                            borderRadius: "6px",
                            border: `1.5px solid ${
                              !selectedCountry ? "#f0f0f0" : "#e8e8e8"
                            }`,
                            padding: "8px 32px 8px 12px",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                            caretColor: "#1890ff",
                            width: "100%",
                            backgroundColor: !selectedCountry
                              ? "#fafafa"
                              : "white",
                          }}
                          suffix={
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                selectedCountry &&
                                setShowStateDropdown(!showStateDropdown)
                              }
                            >
                              {selectedState && (
                                <span
                                  style={{
                                    color: "#52c41a",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    marginRight: "8px",
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                              <DownOutlined
                                style={{
                                  color: "#8c8c8c",
                                  fontSize: "12px",
                                  marginRight: "8px",
                                }}
                              />
                            </span>
                          }
                        />

                        {showStateDropdown && selectedCountry && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              backgroundColor: "white",
                              border: "1px solid #d9d9d9",
                              borderRadius: "0 0 6px 6px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              zIndex: 1000,
                              maxHeight: "200px",
                              overflowY: "auto",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            {loadingStates ? (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#8c8c8c",
                                  fontSize: "13px",
                                }}
                              >
                                <Spin size="small" /> Loading states...
                              </div>
                            ) : filteredStates.length > 0 ? (
                              filteredStates.map((state) => (
                                <div
                                  key={state.value}
                                  onClick={() => handleStateChange(state.value)}
                                  style={{
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f0f0f0",
                                    backgroundColor:
                                      selectedState === state.value
                                        ? "#f0f5ff"
                                        : "transparent",
                                    fontSize: "13px",
                                    transition: "background-color 0.2s ease",
                                  }}
                                  onMouseEnter={(
                                    e: React.MouseEvent<HTMLDivElement>
                                  ) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#f0f5ff";
                                  }}
                                  onMouseLeave={(
                                    e: React.MouseEvent<HTMLDivElement>
                                  ) => {
                                    e.currentTarget.style.backgroundColor =
                                      selectedState === state.value
                                        ? "#f0f5ff"
                                        : "transparent";
                                  }}
                                >
                                  {state.label}
                                </div>
                              ))
                            ) : (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#8c8c8c",
                                  fontSize: "13px",
                                }}
                              >
                                No states found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[12, 4]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="city"
                      label="City"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ marginBottom: "12px" }}
                    >
                      <div style={{ position: "relative" }}>
                        <Input
                          placeholder={
                            selectedState ? "Search city" : "Select state first"
                          }
                          value={citySearchValue}
                          onChange={handleCityInputChange}
                          onFocus={handleCityFocus}
                          disabled={!selectedState}
                          style={{
                            borderRadius: "6px",
                            border: `1.5px solid ${
                              !selectedState ? "#f0f0f0" : "#e8e8e8"
                            }`,
                            padding: "8px 32px 8px 12px",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                            caretColor: "#1890ff",
                            width: "100%",
                            backgroundColor: !selectedState
                              ? "#fafafa"
                              : "white",
                          }}
                          suffix={
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                selectedState &&
                                setShowCityDropdown(!showCityDropdown)
                              }
                            >
                              {selectedCity && (
                                <span
                                  style={{
                                    color: "#52c41a",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    marginRight: "8px",
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                              <DownOutlined
                                style={{
                                  color: "#8c8c8c",
                                  fontSize: "12px",
                                  marginRight: "8px",
                                }}
                              />
                            </span>
                          }
                        />

                        {showCityDropdown && selectedState && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              backgroundColor: "white",
                              border: "1px solid #d9d9d9",
                              borderRadius: "0 0 6px 6px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              zIndex: 1000,
                              maxHeight: "200px",
                              overflowY: "auto",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            {loadingCities ? (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#8c8c8c",
                                  fontSize: "13px",
                                }}
                              >
                                <Spin size="small" /> Loading cities...
                              </div>
                            ) : filteredCities.length > 0 ? (
                              filteredCities.map((city) => (
                                <div
                                  key={city.value}
                                  onClick={() => handleCityChange(city.value)}
                                  style={{
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f0f0f0",
                                    backgroundColor:
                                      selectedCity === city.value
                                        ? "#f0f5ff"
                                        : "transparent",
                                    fontSize: "13px",
                                    transition: "background-color 0.2s ease",
                                  }}
                                  onMouseEnter={(
                                    e: React.MouseEvent<HTMLDivElement>
                                  ) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#f0f5ff";
                                  }}
                                  onMouseLeave={(
                                    e: React.MouseEvent<HTMLDivElement>
                                  ) => {
                                    e.currentTarget.style.backgroundColor =
                                      selectedCity === city.value
                                        ? "#f0f5ff"
                                        : "transparent";
                                  }}
                                >
                                  {city.label}
                                </div>
                              ))
                            ) : (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#8c8c8c",
                                  fontSize: "13px",
                                }}
                              >
                                No cities found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="postal_code"
                      label="Postal Code"
                      style={{ marginBottom: "12px" }}
                    >
                      <Input
                        placeholder="Enter postal code"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePostalCodeChange(e.target.value)
                        }
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePostalCodeChange(e.target.value)
                        }
                        style={{
                          borderRadius: "6px",
                          border: "1.5px solid #e8e8e8",
                          padding: "8px 10px",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                          caretColor: "#1890ff",
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </motion.div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <div>
              {currentStep > 0 && (
                <Button
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  onClick={handlePrev}
                  style={{
                    borderRadius: "8px",
                    height: "36px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    fontSize: "13px",
                    fontWeight: "500",
                    border: "1.5px solid #e8e8e8",
                    color: "#595959",
                    transition: "all 0.3s ease",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Previous
                </Button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#8c8c8c",
                  fontWeight: "500",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Step {currentStep + 1} of {stepTitles.length}
              </div>

              {currentStep < 1 && (
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={handleNext}
                  style={{
                    borderRadius: "8px",
                    height: "36px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    fontSize: "13px",
                    fontWeight: "500",
                    background: "linear-gradient(135deg, #1890ff, #096dd9)",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(24, 144, 255, 0.25)",
                    transition: "all 0.3s ease",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Next
                </Button>
              )}

              {currentStep === 1 && (
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  style={{
                    borderRadius: "8px",
                    height: "36px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    fontSize: "13px",
                    fontWeight: "500",
                    background: "linear-gradient(135deg, #52c41a, #389e0d)",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(82, 196, 26, 0.25)",
                    transition: "all 0.3s ease",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div
          style={{
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {stepTitles.map((_, index) => (
              <div
                key={index}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: index <= currentStep ? "#1890ff" : "#e8e8e8",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
