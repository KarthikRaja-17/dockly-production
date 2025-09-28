
"use client";
import React, { useEffect, useState } from "react";
import { Tabs, Typography, message } from "antd";
import Overview from "./overView";
import UpcomingBills from "./upcomingBills";
// import SavingsGoals from "./savingsGoals";
import AccountsList from "./accountsList";
import RecentTransactions from "./transactions";
import MonthlyBudget from "./monthlyBudget";
import { useQuilttSession } from "@quiltt/react";
import { getBankAccount } from "../../services/apiConfig";
import CashFlow from "./cashFlow";
import FinancialSummary from "./financialSummary";
import AccountsOverview from "./accountsList";
import GoalsCard from "./goalcard";
import RecurringTransactions from "./recurringTransactions";
import DocklyLoader from "../../utils/docklyLoader";
import { useGlobalLoading } from "../../app/loadingContext";
// import NotesLists from "../family-hub/components/familyNotesLists";
import FileHub from "../components/files";
import BookmarkHub from "../components/bookmarks";
import { useRouter } from "next/navigation";
import { PRIMARY_COLOR } from "../../app/comman";
import NotesLists from "../../pages/family-hub/components/familyNotesLists";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const { Text } = Typography;

const FinanceTabs = () => {
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState("1");
  const [loading, setLoading] = useState(false);
  const { session } = useQuilttSession();
  const { setLoading: setGlobalLoading } = useGlobalLoading();
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "";
    setUsername(storedUsername);
  }, []);

  const getUserBankAccount = async (retryCount = 0) => {
    const maxRetries = 1; // Reduced retries to minimize server calls
    try {
      setLoading(true);
      setGlobalLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased timeout to 60s

      const response = await getBankAccount({ session });
      clearTimeout(timeoutId);

      const data = response?.data?.data;
      if (data) {
        setBankDetails(data);
      } else {
        throw new Error("No bank data received");
      }
    } catch (error: any) {
      console.error("Error fetching bank account:", error);
      if (retryCount < maxRetries && error.name !== "AbortError") {
        console.log(`Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
        setTimeout(() => getUserBankAccount(retryCount + 1), 2000);
      } else {
        setError(error.message || "Failed to load bank account data");
        message.error("Failed to load bank data. Please try again later.");
      }
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (session?.token) {
      getUserBankAccount();
    }
  }, [session?.token]); // Explicit dependency on session.token

  const goToTransactionsTab = () => {
    setActiveKey("3");
  };

  const handleManageAccounts = () => {
    router.push(`/${username}/finance-hub/setup`);
  };

  const items = [
    {
      label: "Overview",
      key: "1",
      children: (
        <>
          <div style={{ display: "flex", gap: "16px" }}>
            {bankDetails && <CashFlow bankDetails={bankDetails} />}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ width: 890 }}>
              <MonthlyBudget />
            </div>
            <GoalsCard />
          </div>
          <div style={{ display: "flex",gap: "10px" }}>
            <div style={{ width: 890, marginLeft: '7px' }}>
              <RecentTransactions onViewAll={goToTransactionsTab} />
            </div>
            <RecurringTransactions />
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "16px",
              marginLeft: 10,
            }}
          >
            <div style={{ height: "fit-content",width: 800 }}>
              <AccountsList />
            </div>
            <div style={{ width: 600, height: "fit-content" }}>
              <NotesLists currentHub="finance" />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "16px0",
              marginLeft: 10,
            }}
          >
            <div style={{ width: 700, height: "fit-content" }}>
              <FileHub hubName="Finance" title="Files" />
            </div>
            <div style={{ width: 500, height: "fit-content" }}>
              <BookmarkHub hub={"finance"} />
            </div>
            {/* <div style={{ width: 400, height: "fit-content" }}>
              <NotesLists currentHub="finance" />
            </div> */}
            {/* <div style={{ width: 400, height: "fit-content" }}>
              <BookmarkHub hub={"finance"} />
            </div> */}
          </div>
        </>
      ),
    },
    {
      label: "Accounts",
      key: "2",
      children: (
        <div style={{ width: "100%" }}>
          {bankDetails && <AccountsOverview />}
        </div>
      ),
    },
    {
      label: "Transactions",
      key: "3",
      children: (
        <>{bankDetails && <RecentTransactions isFullscreen={true} />}</>
      ),
    },
    {
      label: "Budgets",
      key: "4",
      children: (
        <div>
          <MonthlyBudget />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          margin: "60px 16px 16px 48px",
          fontFamily: FONT_FAMILY,
          background: "#fafafa",
        }}
      >
        <BoardTitle handleManageAccounts={handleManageAccounts} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <DocklyLoader />
            <div
              style={{
                marginTop: 16,
                color: "#6b7280",
                fontFamily: FONT_FAMILY,
              }}
            >
              Loading your financial data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "60px 16px 16px 48px",
        fontFamily: FONT_FAMILY,
        background: "#fafafa",
      }}
    >
      <BoardTitle handleManageAccounts={handleManageAccounts} />
      <div
        style={{
          marginLeft: "38px",
        }}
      >
        <Tabs
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          tabBarGutter={24}
          destroyInactiveTabPane={false}
          tabBarStyle={{
            marginBottom: 16,
            fontWeight: "600",
            fontSize: 14,
            fontFamily: FONT_FAMILY,
          }}
          size="middle"
          animated
          items={items}
        />
      </div>
    </div>
  );
};

export default FinanceTabs;

const BoardTitle: React.FC<{ handleManageAccounts: () => void }> = ({
  handleManageAccounts,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            color: "#059669",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            background: "linear-gradient(145deg, #ecfdf5, #d1fae5)",
            border: "1px solid #a7f3d0",
          }}
        >
          💵
        </div>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            fontFamily: FONT_FAMILY,
            letterSpacing: "-0.025em",
          }}
        >
          Finance Board
        </h1>
      </div>
      <Text
        style={{
          color: "#f7fafdff",
          border: "1px solid #fcfdfdff",
          padding: "6px 12px",
          borderRadius: "6px",
          backgroundColor: PRIMARY_COLOR,
          cursor: "pointer",
          fontFamily: FONT_FAMILY,
          fontSize: "14px",
          fontWeight: 500,
        }}
        onClick={handleManageAccounts}
      >
        Manage Accounts
      </Text>
    </div>
    );
};

