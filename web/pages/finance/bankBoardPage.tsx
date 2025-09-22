
"use client";
import { useEffect, useState } from "react";
import {
  Steps,
  Card,
  Input,
  Button,
  Typography,
  Result,
  message,
  Spin,
} from "antd";
import Link from "next/link";
import { getBankAccount } from "../../services/apiConfig";
import {
  ConnectorSDKCallbackMetadata,
  QuilttButton,
  useQuilttSession,
} from "@quiltt/react";
import FinanceIntroBoard from "./financeBoard";
import BankPage from "./bankPage";
import { useRouter } from "next/navigation";
import DocklyLoader from "../../utils/docklyLoader";

const { Title } = Typography;
export default function BankBoardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileId, setProfileId] = useState("");
  const [emailId, setEmailId] = useState("");
  const [isFinanceAccount, setIsFinanceAccount] = useState(false);
  console.log("🚀 ~ BankBoardPage ~ isFinanceAccount:", isFinanceAccount)
  const [bankDetails, setBankDetails] = useState<any>(null);
  console.log("🚀 ~ BankBoardPage ~ bankDetails:", bankDetails)
  const [loading, setLoading] = useState(true); // <-- Add loading state
  const [connectionId, setConnectionId] = useState<string>();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    setUsername(username);
  }, []);

  const { session } = useQuilttSession();
  const router = useRouter();

  const getUserBankAccount = async () => {
    try {
      const response = await getBankAccount({ session });
      if (response) {
        setBankDetails(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching bank details", err);
    } finally {
      setLoading(false); // <-- Stop loading
    }
  };

  useEffect(() => {
    getUserBankAccount();
  }, []);

  useEffect(() => {
    if (!loading && (!bankDetails || bankDetails.length === 0)) {
      router.push(`/${username}/finance-hub/setup`);
    }
  }, [loading, bankDetails]);

  if (loading) {
    return (
      // <div>
      <DocklyLoader />
      // </div>
    ); // Or a spinner
  }

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh" }}>
      <BankPage bankDetails={bankDetails} />
    </div>
  );
}

const FinanceProfileSetup = (props: any) => {
  const {
    setIsNewAccount,
    currentStep,
    handleExitSuccess,
    profileId,
    isNewAccount,
    setProfileId,
    handleProfileSubmit,
    emailId,
    setEmailId,
    handleEmailSubmit,
  } = props;
  return (
    <>
      <Card
        style={{
          maxWidth: 700,
          margin: "20px auto",
          borderRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Steps
          current={currentStep}
          style={{ marginBottom: 40 }}
          items={[{ title: "Profile" }, { title: "Connect Bank" }]}
        />

        {currentStep === 0 && !isNewAccount && (
          <div style={{ textAlign: "center" }}>
            <Title level={3}>Enter Your Profile ID</Title>
            <Input
              placeholder="Enter Profile ID"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              style={{
                marginTop: 20,
                marginBottom: 20,
                height: 50,
                borderRadius: 10,
                fontSize: 16,
              }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleProfileSubmit}
              style={{
                width: "100%",
                borderRadius: 10,
                background: "#1890ff",
              }}
            >
              Continue
            </Button>
            <p className="text-center">
              Don't have an account?{" "}
              <Link href="" onClick={() => setIsNewAccount(true)}>
                Sign up
              </Link>
            </p>
          </div>
        )}
        {currentStep === 0 && isNewAccount && (
          <div style={{ textAlign: "center" }}>
            <Title level={3}>Enter Your Email ID</Title>
            <Input
              placeholder="Enter Email ID"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              style={{
                marginTop: 20,
                marginBottom: 20,
                height: 50,
                borderRadius: 10,
                fontSize: 16,
              }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleEmailSubmit}
              style={{
                width: "100%",
                borderRadius: 10,
                background: "#1890ff",
              }}
            >
              Continue
            </Button>
            <p className="text-center">
              Already have an account?{" "}
              <Link href="" onClick={() => setIsNewAccount(false)}>
                Sign In
              </Link>
            </p>
          </div>
        )}

        {currentStep === 1 && (
          <div style={{ textAlign: "center" }}>
            <Result
              icon={
                <img
                  src="https://img.icons8.com/ios-filled/100/link--v1.png"
                  width={80}
                  alt="connect"
                />
              }
              title="Ready to Connect!"
              subTitle="Click the button below to connect your bank using Quiltt."
              extra={
                <QuilttButton
                  connectorId={"lc9h19r4no"}
                  onExitSuccess={handleExitSuccess}
                  style={{
                    marginTop: 20,
                    borderRadius: 10,
                    background: "#52c41a",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Connect Account
                </QuilttButton>
              }
            />
          </div>
        )}
      </Card>
    </>
  );
};

