"use client";
import React, { useEffect, useRef, useState } from "react";
import { Typography, Input, Button } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AxiosResponse } from "axios";
import { emailVerification } from "../../services/apiConfig";
import { showNotification } from "../../utils/notification";
import { useGlobalLoading } from "../../app/loadingContext";
import { responsive } from "../../utils/responsive";
import { DocklyUsers } from "../../services/auth";

const { Title, Text, Link } = Typography;

type ApiResponse = {
  status: boolean;
  message: string;
  payload?: {
    token?: string;
    [key: string]: any;
  };
};

const VerifyEmailPage: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const { loading, setLoading } = useGlobalLoading();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [duser, setDuser] = useState<string | null>(null);
  const [storedOtp, setStoredOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const params = useParams() || {};
  const searchParams = useSearchParams();
  const encodedToken = searchParams?.get("token");
  const username = params.username;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userId"));
      setStoredOtp(localStorage.getItem("otpId"));
      setEmail(localStorage.getItem("email"));
      setDuser(localStorage.getItem("duser"));
    }
  }, []);

  useEffect(() => {
    if (encodedToken) {
      try {
        const decoded = JSON.parse(atob(encodedToken));
        const { otp, email, userId, fuser, duser } = decoded;
        localStorage.setItem("userId", userId || "");
        localStorage.setItem("fuser", fuser || "");
        localStorage.setItem("duser", duser);
        setDuser(duser);
        setEmail(email);
        setStoredOtp(otp);
        setUserId(userId);
      } catch (err) {
        console.error("Invalid or malformed token");
      }
    }
  }, [encodedToken]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Auto redirect to home page after countdown expires
      router.push("/");
      localStorage.clear();
      window.location.reload();
    }
  }, [countdown, router]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        inputsRef.current[index + 1]?.focus();
      }

      const fullCode = newOtp.join("");
      if (fullCode.length === 4 && newOtp.every((v) => v !== "")) {
        setTimeout(() => {
          handleContinue(newOtp);
        }, 200);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    // Arrow key navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");

    // Check if pasted content is exactly 4 digits
    if (/^\d{4}$/.test(paste)) {
      const newOtp = paste.split("");
      setOtp(newOtp);

      // Focus the last input after paste
      inputsRef.current[3]?.focus();

      // Auto-submit after a short delay
      setTimeout(() => {
        handleContinue(newOtp);
      }, 200);
    } else if (/^\d+$/.test(paste)) {
      // If it's digits but not exactly 4, fill available slots
      const digits = paste.split("").slice(0, 4 - index);
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      // Focus next empty input or last input
      const nextIndex = Math.min(index + digits.length, 3);
      inputsRef.current[nextIndex]?.focus();

      // Check if complete and auto-submit
      const fullCode = newOtp.join("");
      if (fullCode.length === 4 && newOtp.every((v) => v !== "")) {
        setTimeout(() => {
          handleContinue(newOtp);
        }, 200);
      }
    }
  };

  const handleContinue = async (providedOtp?: string[]) => {
    const code = (providedOtp || otp).join("");
    if (code.length !== 4) {
      showNotification("Error", "Please enter a valid 4-digit code", "error");
      return;
    }

    setLoading(true);

    try {
      const response: AxiosResponse<ApiResponse> = await emailVerification({
        userId,
        otp: code,
        otpId: storedOtp,
        duser: duser,
        email: email,
      });

      const { status, message: msg, payload } = response.data;

      if (!status) {
        showNotification("Error", msg, "error");
      } else {
        const token = payload?.token || "";
        localStorage.setItem("Dtoken", token);
        localStorage.setItem("duser", payload?.role || "");
        showNotification("Success", msg, "success");
        if (payload?.role === DocklyUsers.Guests || payload?.role === DocklyUsers.PaidMember) {
          router.push(`/${username}/dashboard`);
        } else if (payload?.role === DocklyUsers.SuperAdmin) {
          router.push(`/admin/${username}/users`);
        }
      }
    } catch (error) {
      console.error("OTP verification error", error);
      showNotification("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100%",
        backgroundColor: "#f9f9f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: responsive("mobile")
          ? "16px"
          : responsive("tablet")
            ? "32px"
            : "64px",
        boxSizing: "border-box",
      }}
    >
      {/* Inner fixed-width card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px", // fixed width card, never stretches on desktop
          backgroundColor: "#f9f9f9",
          borderRadius: 12,
          padding: responsive("mobile") ? "24px 16px" : "40px 32px",
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ marginBottom: 8 }}>
          Verify your email
        </Title>
        <Text type="secondary">
          Enter the 4-digit code sent to <b>{email}</b>
        </Text>

        {/* Countdown Timer */}
        {/* <div style={{ marginTop: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 16, color: countdown <= 10 ? "#ff4d4f" : "#666" }}>
            Time remaining: {formatTime(countdown)}
          </Text>
        </div> */}

        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {otp.map((digit, idx) => (
            <Input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el?.input || null;
              }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={(e) => handlePaste(e, idx)}
              maxLength={1}
              style={{
                width: 60,
                height: 60,
                fontSize: 24,
                textAlign: "center",
                borderRadius: 8,
              }}
            />
          ))}
        </div>

        {/* <Button
          type="primary"
          block
          size="large"
          onClick={() => handleContinue()}
          disabled={otp.join("").length !== 4}
          loading={loading}
          style={{
            marginTop: 32,
            backgroundColor: "#003cff",
            borderColor: "#003cff",
            borderRadius: 6,
            color: "#fff", // <-- force text to white
          }}
        >
          Continue
        </Button> */}

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>Didn't receive a code? </Text>
          <Link onClick={() => console.log("Resend clicked")}>Resend</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;