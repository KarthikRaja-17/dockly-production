"use client";
import React, { useEffect, useState } from "react";
import { Button, Typography, Form } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { AxiosResponse } from "axios";
import { userAddEmail } from "../../services/user";
import { showNotification } from "../../utils/notification";
import { LowercaseInput } from "../../app/comman";
import { useGlobalLoading } from "../../app/loadingContext";

type ApiResponse = {
  status: boolean;
  message: string;
  payload: {
    otpStatus: { otp: string };
    email: string;
    uid: string;
    username: string;
    [key: string]: any;
  };
};

const { Title, Text } = Typography;

const SignUpDockly = () => {
  const router = useRouter();
  const params = useParams() || {};
  const username = params.username;
  const [userId, setUserId] = useState<string | null>(null);
  const { loading, setLoading } = useGlobalLoading();
  const [email, setEmail] = useState(false);
  useEffect(() => {
    const userId = localStorage.getItem("userId") || null;
    setUserId(userId);
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    const response: AxiosResponse<ApiResponse> = await userAddEmail({
      userId: userId,
      email: values.email,
      username: username,
    });
    const { status, message: msg, payload } = response.data;
    if (!status) {
      showNotification("Error", msg, "error");
    }
    if (status) {
      showNotification("Success", msg, "success");
      if (payload?.userId) {
        localStorage.setItem("userId", payload?.userId);
      }
      localStorage.setItem("email", payload?.email || "");
      // localStorage.setItem("duser", payload?.duser || "");
      localStorage.setItem("otpId", payload?.otpId || "");
      router.push(`/${payload?.username}/verify-email?email=${payload.email}`);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        backgroundColor: "#f9f9f9",
        padding: "10px",
        borderRadius: "0 20px 20px 0",
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 400, width: "100%" }}>
        <Title level={2}>Sign in to Dockly</Title>
        <Text type="secondary">Enter your email address to continue</Text>
        <div style={{ marginTop: 32 }}>
          <Text strong>Email address</Text>
          <Form
            name="emailForm"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <LowercaseInput
                size="large"
                placeholder="you@example.com"
                prefix={<MailOutlined />}
                style={{
                  marginTop: 8,
                  borderRadius: 8,
                  backgroundColor: "#fff",
                }}
                value={email}
                onChange={setEmail}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                style={{
                  marginTop: 24,
                  width: "100%",
                  backgroundColor: "#003cff",
                  borderRadius: 6,
                  fontWeight: "bold",
                }}
                htmlType="submit"
                loading={loading}
              >
                Continue
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignUpDockly;
