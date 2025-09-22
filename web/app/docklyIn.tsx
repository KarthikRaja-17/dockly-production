"use client";
import React, { useEffect, useState } from "react";
import { Button, Typography } from "antd";
import { LowercaseInput, PRIMARY_COLOR, SIDEBAR_BG } from "./comman";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";
import { showNotification } from "../utils/notification";
import addUsername from "../services/user";
import SignUpDockly from "../pages/sign-in/signUp";
import { useGlobalLoading } from "./loadingContext";
import { responsive, getCurrentBreakpoint } from "../utils/responsive";

const { Title } = Typography;

const DocklyLogin = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const { loading, setLoading } = useGlobalLoading();
  const [emailView, setEmailView] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [bp, setBp] = useState(getCurrentBreakpoint());

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(localStorage.getItem("email"));

      const handleResize = () => setBp(getCurrentBreakpoint());
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Only allow letters, numbers, spaces
  const handleInputChange = (value: string) => {
    const filteredValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
    setUsername(filteredValue);
  };

  const handleSignUp = async () => {
    const trimmedUsername = username.trim();

    // Validation: non-empty and no special characters
    if (!trimmedUsername) {
      showNotification(
        "Error",
        "Username cannot be empty or whitespace.",
        "error"
      );
      return;
    }

    if (/[^a-zA-Z0-9 ]/.test(trimmedUsername)) {
      showNotification(
        "Error",
        "Username can only contain letters, numbers, and spaces.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      type ApiResponse = {
        status: boolean;
        message: string;
        payload: {
          userId?: string;
          otpStatus?: { otp?: string };
          email?: string;
          token?: string;
          redirectUrl?: string;
          otpId?: string;
        };
      };

      const response: AxiosResponse<ApiResponse> = await addUsername({
        userName: trimmedUsername,
        email: email,
      });

      const { status, message: msg, payload } = response.data;

      if (!status) {
        showNotification("Error", msg, "error");
      } else {
        showNotification("Success", msg, "success");
        localStorage.setItem("userId", payload.userId || "");
        localStorage.setItem("username", trimmedUsername);
        if (payload?.otpStatus?.otp) {
          localStorage.setItem("otpId", payload?.otpId || "");
          localStorage.setItem("email", payload?.email || "");
        }
        if (payload?.token) {
          localStorage.setItem("Dtoken", payload?.token || "");
        }
       router.push(`/${trimmedUsername}${payload.redirectUrl}`);
      }
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        "Something went wrong during registration.";
      showNotification("Error", errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Responsive container padding
  const containerPadding = responsive("mobile")
    ? "16px"
    : responsive("tablet")
    ? "32px"
    : "64px";


   const formMaxWidth = responsive("desktop") ? "420px" : "100%"; 

  return (
    <>
      {!emailView ? (
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
            boxSizing: "border-box",
            padding: containerPadding,
          }}
        >
          {/* Inner fixed-width card */}
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#f9f9f9",
              borderRadius: 12,
              padding: "40px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                backgroundColor: "#EEF2FF",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 128 128"
              >
                <circle cx="64" cy="64" r="64" fill="#E0E7FF" />
                <g fill="#6366F1">
                  <rect x="34" y="28" width="60" height="16" rx="8" />
                  <rect x="26" y="56" width="76" height="16" rx="8" />
                  <rect x="18" y="84" width="92" height="16" rx="8" />
                </g>
              </svg>
            </div>

            <Title level={3} style={{ marginBottom: 0 }}>
              Welcome to Dockly
            </Title>
            <p>Enter your Dockly URL to get started</p>

            <div style={{ marginTop: 8, marginBottom: 16, width: "100%" }}>
              <LowercaseInput
                addonBefore="dockly.me/"
                style={{ borderRadius: 6, width: "100%" }}
                value={username}
                onChange={handleInputChange}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") handleSignUp();
                }}
              />
            </div>

            <Button
              type="primary"
              style={{
                width: "100%",
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
                borderRadius: 6,
              }}
              onClick={handleSignUp}
              loading={loading}
            >
              Get Started
            </Button>

            <p style={{ marginTop: 16, cursor: "pointer" }}>
              Don&apos;t remember the username?{" "}
              <a
                style={{ color: PRIMARY_COLOR }}
                onClick={() => setEmailView(true)}
              >
                Sign in with email
              </a>
            </p>
          </div>
        </div>
      ) : (
        <SignUpDockly />
      )}
    </>
  );
};

export default DocklyLogin;
