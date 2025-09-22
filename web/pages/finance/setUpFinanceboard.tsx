"use client";
import React, { useEffect, useState } from "react";
import {
  Steps,
  Card,
  Typography,
  Alert,
  Avatar,
  Button,
  Checkbox,
  Col,
  Row,
  Divider,
  Modal,
  Badge,
  Space,
  message,
} from "antd";
import {
  LockOutlined,
  CheckCircleOutlined,
  BankOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { ConnectorSDKCallbackMetadata, useQuilttSession } from "@quiltt/react";
import { addAccounts, getBankAccount, saveBankTransactions } from "../../services/apiConfig";
import { useRouter } from "next/navigation";
import ConnectAccounts from "./connectaccounts";
import { PRIMARY_COLOR } from "../../app/comman";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
// const PRIMARY_COLOR = "#1890ff";

// Custom Loading Component
const CustomLoadingSpinner = ({ message }: { message: string }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: 120,
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: 8,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          position: "relative",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            border: "2px solid #f3f4f6",
            borderTop: `2px solid ${PRIMARY_COLOR}`,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 8,
            height: 8,
            backgroundColor: PRIMARY_COLOR,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
      <Text
        style={{
          fontSize: 14,
          color: "#4b5563",
          fontWeight: 500,
          textAlign: "center",
          maxWidth: 200,
        }}
      >
        {message}
      </Text>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

const SetupFinanceBoard = () => {
  const [connectionId, setConnectionId] = useState<string | undefined>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { session } = useQuilttSession();
  const router = useRouter();

  useEffect(() => {
    if (!bankDetails && !isRefreshing && session) {
      getUserBankAccount();
    }
  }, [bankDetails, isRefreshing, session]);

  const getUserBankAccount = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const response = await getBankAccount({ session });
      const data = response?.data?.data;
      if (data && data.connections) {
        console.log("Account Details:", data);
        setBankDetails(data);
      } else {
        setError("No account data available. Please connect a financial institution.");
      }
    } catch (error) {
      console.error("Failed to fetch bank account details:", error);
      setError("Failed to fetch account details. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExitSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
    setConnectionId(metadata?.connectionId);
    setShowConnectModal(false);
    console.log("Successfully connected:", metadata.connectionId);
    getUserBankAccount().then(() => {
      setCurrentStep(1);
    });
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: "0 16px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, color: "#1f2937" }}>
          Set Up Your Finance Board
        </Title>
        <Paragraph style={{ color: "#6b7280", fontSize: 16, marginBottom: 0 }}>
          Connect accounts, select preferences, and get insights into your financial health.
        </Paragraph>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          size="small"
          style={{
            background: "#f8fafc",
            padding: "16px 20px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
          }}
        >
          <Step title="Connect" icon={<BankOutlined />} />
          <Step title="Select" icon={<CheckCircleOutlined />} />
          <Step title="Review" icon={<CreditCardOutlined />} />
          <Step title="Complete" icon={<DollarCircleOutlined />} />
        </Steps>
      </div>

      {currentStep === 0 && (
        <Card
          style={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <BankOutlined style={{ fontSize: 48, color: PRIMARY_COLOR, marginBottom: 16 }} />
            <Title level={4} style={{ marginBottom: 8 }}>
              Connect Your Financial Accounts
            </Title>
            <Paragraph style={{ color: "#6b7280", marginBottom: 24 }}>
              Search for your bank or financial institution to securely connect your accounts.
            </Paragraph>

            <Alert
              message={
                <span>
                  <LockOutlined style={{ marginRight: 8 }} />
                  <Text strong>Bank-level security</Text>
                </span>
              }
              description="256-bit encryption • Never store credentials • Disconnect anytime"
              type="info"
              showIcon={false}
              style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 8,
                marginBottom: 24,
              }}
            />

            <Space size={12}>
              <Button disabled size="large">
                Back
              </Button>
              <Button
                type="primary"
                size="large"
                style={{ backgroundColor: PRIMARY_COLOR, minWidth: 120 }}
                onClick={() => setShowConnectModal(true)}
                disabled={!session}
              >
                Connect Bank
              </Button>
            </Space>
          </div>
        </Card>
      )}

      <Modal
        visible={showConnectModal}
        onCancel={() => setShowConnectModal(false)}
        footer={null}
        width={600}
      >
        <ConnectAccounts onSuccess={handleExitSuccess} />
      </Modal>

      {currentStep === 1 && bankDetails && bankDetails.connections && (
        <AccountSelection
          accounts={bankDetails?.connections[0]?.accounts || []}
          setCurrentStep={setCurrentStep}
          setSelectedAccounts={setSelectedAccounts}
          selectedAccounts={selectedAccounts}
          refreshAccounts={getUserBankAccount}
          isRefreshing={isRefreshing}
          setError={setError}
        />
      )}
      {currentStep === 2 && bankDetails && (
        <ConnectedAccountsSummary
          setCurrentStep={setCurrentStep}
          selectedAccounts={selectedAccounts}
          accounts={bankDetails?.connections[0]?.accounts || []}
          session={session}
          setError={setError}
        />
      )}
      {currentStep === 3 && <FinanceBoardCompletedCard />}
    </div>
  );
};

const AccountSelection = ({
  accounts,
  setCurrentStep,
  setSelectedAccounts,
  selectedAccounts,
  refreshAccounts,
  isRefreshing,
  setError,
}: {
  accounts: any[];
  setCurrentStep: (step: number) => void;
  setSelectedAccounts: (accounts: string[]) => void;
  selectedAccounts: string[];
  refreshAccounts: () => void;
  isRefreshing: boolean;
  setError: (error: string | null) => void;
}) => {
  const [accountsReady, setAccountsReady] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state for Next button

  useEffect(() => {
    if (accounts.length > 0) {
      const allAccountsHaveBalance = accounts.every((acc) => acc.balance?.current != null);
      if (allAccountsHaveBalance) {
        setAccountsReady(true);
        setError(null);
      } else if (!isRefreshing) {
        refreshAccounts();
      }
    } else if (!isRefreshing && accounts.length === 0) {
      refreshAccounts();
      setError("No accounts available. Please connect a financial institution.");
    }
  }, [accounts, refreshAccounts, isRefreshing, setError]);

  const handleCheckboxChange = (accountId: string, checked: boolean) => {
    setSelectedAccounts(
      checked ? [...selectedAccounts, accountId] : selectedAccounts.filter((id) => id !== accountId)
    );
  };

  const handleNext = async () => {
    try {
      setLoading(true); // Set loading to true when button is clicked
      const selected = accounts.filter(
        (acc) => selectedAccounts.includes(acc.id) && acc.balance?.current != null
      );
      if (selected.length > 0) {
        setSelectedAccounts(selected.map((acc) => acc.id));
        setCurrentStep(2);
      } else {
        setError("Please select at least one account with a valid balance.");
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const getAccountIcon = (accountName: string) => {
    if (!accountName) return "🏦";
    if (accountName.toLowerCase().includes("credit")) return "💳";
    if (accountName.toLowerCase().includes("saving")) return "💰";
    if (accountName.toLowerCase().includes("investment")) return "📈";
    return "🏦";
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 4 }}>
          Select Accounts
        </Title>
        <Text type="secondary">Choose accounts to include in your Finance Board</Text>
      </div>

      <div style={{ position: "relative" }}>
        {isRefreshing || !accountsReady ? (
          <CustomLoadingSpinner message="Fetching your accounts..." />
        ) : accounts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {accounts.map((acc, index) => {
              const balance = acc.balance?.current ?? null;
              const isNegative = balance != null && balance < 0;

              return (
                <div
                  key={acc.id || index}
                  style={{
                    border: `2px solid ${isNegative ? "#fee2e2" : "#f3f4f6"}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    background: isNegative ? "#fef2f2" : "#ffffff",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => handleCheckboxChange(acc.id, !selectedAccounts.includes(acc.id))}
                >
                  <Row align="middle" justify="space-between">
                    <Col flex={1}>
                      <Row align="middle" gutter={12}>
                        <Col>
                          <Checkbox
                            checked={selectedAccounts.includes(acc.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(acc.id, e.target.checked);
                            }}
                            disabled={balance == null || isRefreshing}
                          />
                        </Col>
                        <Col>
                          <div
                            style={{
                              fontSize: 24,
                              width: 36,
                              height: 36,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 6,
                              background: isNegative ? "#fee2e2" : "#f0f9ff",
                            }}
                          >
                            {getAccountIcon(acc.name)}
                          </div>
                        </Col>
                        <Col flex={1}>
                          <div>
                            <Text
                              strong
                              style={{
                                fontSize: 14,
                                color: isNegative ? "#dc2626" : "#1f2937",
                              }}
                            >
                              {acc.name || "Unnamed Account"}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {acc.provider || "Unknown Provider"} • ••••{acc.id?.slice(-4) || "XXXX"}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    <Col>
                      <div style={{ textAlign: "right" }}>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            color: isNegative ? "#dc2626" : "#059669",
                          }}
                        >
                          {balance != null
                            ? `${isNegative ? "-" : ""}$${Math.abs(balance).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "N/A"}
                        </Text>
                        {isNegative && (
                          <div>
                            <Badge
                              status="error"
                              text={<Text style={{ fontSize: 11, color: "#dc2626" }}>Debt</Text>}
                            />
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Text>No accounts available. Please connect a financial institution.</Text>
          </div>
        )}
      </div>

      <Row justify="space-between" style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
        <Button onClick={() => setCurrentStep(0)} size="large">
          Back
        </Button>
        <Button
          type="primary"
          size="large"
          style={{ backgroundColor: PRIMARY_COLOR, minWidth: 120 }}
          onClick={handleNext}
          loading={loading} // Added loading prop
          disabled={selectedAccounts.length === 0 || isRefreshing || !accountsReady}
        >
          Next ({selectedAccounts.length})
        </Button>
      </Row>
    </Card>
  );
};

const ConnectedAccountsSummary = ({
  selectedAccounts,
  setCurrentStep,
  accounts,
  session,
  setError,
}: {
  selectedAccounts: string[];
  setCurrentStep: (step: number) => void;
  accounts: any[];
  session: any;
  setError: (error: string | null) => void;
}) => {
  const [loading, setLoading] = useState(false); // Added loading state for Complete Setup button
  const selectedAccountsData = accounts.filter(
    (item) => selectedAccounts.includes(item.id) && item.balance?.current != null
  );

  const accountsReady =
    selectedAccounts.length > 0 &&
    selectedAccounts.every((id) => {
      const acc = accounts.find((a) => a.id === id);
      return acc && acc.balance?.current != null;
    });

  const groupedByProvider = selectedAccountsData.reduce(
    (acc: Record<string, any>, item: any) => {
      const provider = item.provider || "Unknown Provider";
      if (!acc[provider]) {
        acc[provider] = {
          institution: provider,
          icon: provider[0]?.toUpperCase() || "P",
          accounts: [],
        };
      }

      if (item.balance?.current != null) {
        acc[provider].accounts.push({
          id: item.id,
          type: item.name || "Unnamed Account",
          number: item.id.slice(-4),
          balance: item.balance.current,
        });
      }

      return acc;
    },
    {}
  );

  const accountsData = Object.values(groupedByProvider).filter((item: any) => item.accounts.length > 0);

  const handleAddAccounts = async () => {
    try {
      setLoading(true); // Set loading to true when button is clicked
      setError(null);
      await addAccounts({
        accounts: selectedAccountsData,
        session,
      });
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to add accounts:", error);
      setError("Failed to save accounts. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const totalBalance = selectedAccountsData.reduce(
    (sum: number, acc: { balance: { current: number } }) => sum + (acc.balance?.current || 0),
    0
  );
  const positiveBalance = selectedAccountsData
    .filter((acc: { balance: { current: number } }) => (acc.balance?.current || 0) > 0)
    .reduce((sum: number, acc: { balance: { current: number } }) => sum + acc.balance.current, 0);
  const negativeBalance = selectedAccountsData
    .filter((acc: { balance: { current: number } }) => (acc.balance?.current || 0) < 0)
    .reduce((sum: number, acc: { balance: { current: number } }) => sum + Math.abs(acc.balance.current), 0);

  return (
    <Card
      style={{
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 4 }}>
          Account Summary
        </Title>
        <Text type="secondary">Review your selected accounts before finalizing</Text>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 8,
            padding: "16px 12px",
            color: "white",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, display: "block" }}>
            Net Worth
          </Text>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", display: "block" }}>
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: 8,
            padding: "16px 12px",
            color: "white",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, display: "block" }}>
            Assets
          </Text>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", display: "block" }}>
            ${positiveBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </div>

        {negativeBalance > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)",
              borderRadius: 8,
              padding: "16px 12px",
              color: "white",
              textAlign: "center",
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, display: "block" }}>
              Debts
            </Text>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", display: "block" }}>
              ${negativeBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </div>
        )}
      </div>

      <Card
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong style={{ fontSize: 16 }}>
            Selected Accounts ({selectedAccountsData.length})
          </Text>
        </div>

        {accountsData.length === 0 ? (
          <Text>No valid accounts with balance data available.</Text>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {accountsData.map((item: any, index: number) => (
              <div key={index}>
                <Row align="middle" style={{ marginBottom: 8 }}>
                  <Avatar
                    shape="square"
                    size={32}
                    style={{
                      backgroundColor: PRIMARY_COLOR,
                      fontWeight: "bold",
                      marginRight: 12,
                      fontSize: 14,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Text strong style={{ fontSize: 15 }}>
                    {item.institution}
                  </Text>
                </Row>

                <div style={{ marginLeft: 44 }}>
                  {item.accounts.map((acc: any, idx: number) => (
                    <Row
                      key={idx}
                      justify="space-between"
                      style={{
                        padding: "6px 12px",
                        marginBottom: 4,
                        background: acc.balance < 0 ? "#fef2f2" : "white",
                        borderRadius: 6,
                        border: `1px solid ${acc.balance < 0 ? "#fecaca" : "#f1f5f9"}`,
                      }}
                    >
                      <Col>
                        <Text
                          style={{
                            fontSize: 13,
                            color: acc.balance < 0 ? "#dc2626" : "#374151",
                          }}
                        >
                          {acc.type} (••••{acc.number})
                        </Text>
                      </Col>
                      <Col>
                        <Text
                          strong
                          style={{
                            fontSize: 14,
                            color: acc.balance < 0 ? "#dc2626" : "#059669",
                          }}
                        >
                          {acc.balance < 0 ? "-" : ""}$
                          {Math.abs(acc.balance).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </Col>
                    </Row>
                  ))}
                </div>
                {index !== accountsData.length - 1 && <Divider style={{ margin: "12px 0" }} />}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Row justify="space-between" style={{ paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
        <Button onClick={() => setCurrentStep(1)} size="large">
          Back
        </Button>
        <Button
          type="primary"
          size="large"
          style={{ backgroundColor: PRIMARY_COLOR, minWidth: 120 }}
          onClick={handleAddAccounts}
          loading={loading} // Added loading prop
          disabled={selectedAccounts.length === 0 || !accountsReady}
        >
          Complete Setup ({selectedAccounts.length})
        </Button>
      </Row>
    </Card>
  );
};

const FinanceBoardCompletedCard = () => {
  const router = useRouter();
  const { session } = useQuilttSession();
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "";
    setUsername(storedUsername);
  }, []);

  const handleGoToBoard = async () => {
    const user_id = localStorage.getItem("userId");

    if (!user_id || !session) {
      message.error("Missing user session or ID");
      return;
    }

    try {
      setLoading(true);
      // await saveBankTransactions({ session, user_id });
      // message.success("Transactions saved successfully!");
      router.push(`/${username}/finance-hub`);
    // } catch (error) {
    //   console.error("Failed to save transactions:", error);
    //   message.error("Failed to save transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        textAlign: "center",
        padding: "24px 20px",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 8, color: "#1f2937" }}>
          Finance Setup Ready!
        </Title>
        <Paragraph style={{ color: "#6b7280", fontSize: 16, marginBottom: 0 }}>
          Your accounts are connected and your Finance Setup is ready to use.
          Start managing your finances in one unified FinanceBoard.
        </Paragraph>
      </div>

      <div
        style={{
          background: "#f0f9ff",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          border: "1px solid #bfdbfe",
        }}
      >
        <Row justify="space-around" style={{ textAlign: "center" }}>
          <Col>
            <CheckCircleOutlined style={{ fontSize: 24, color: "#059669", marginBottom: 4 }} />
            <br />
            <Text style={{ fontSize: 12, color: "#374151" }}>Accounts Connected</Text>
          </Col>
          <Col>
            <LockOutlined style={{ fontSize: 24, color: "#059669", marginBottom: 4 }} />
            <br />
            <Text style={{ fontSize: 12, color: "#374151" }}>Secure & Encrypted</Text>
          </Col>
          <Col>
            <DollarCircleOutlined style={{ fontSize: 24, color: "#059669", marginBottom: 4 }} />
            <br />
            <Text style={{ fontSize: 12, color: "#374151" }}>Real-time Updates</Text>
          </Col>
        </Row>
      </div>

      <Button
        type="primary"
        size="large"
        style={{
          backgroundColor: PRIMARY_COLOR,
          height: 48,
          fontSize: 16,
          fontWeight: "bold",
          minWidth: 180,
          borderRadius: 8,
        }}
        onClick={handleGoToBoard}
        loading={loading}
        disabled={!username}
      >
        Go to Finance Board
      </Button>
    </Card>
  );
};

export default SetupFinanceBoard;