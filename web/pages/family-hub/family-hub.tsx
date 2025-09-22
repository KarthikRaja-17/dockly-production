"use client";
import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Typography,
  Space,
  Row,
  Col,
  message,
  Tabs,
  Card,
  Select,
  Divider,
} from "antd";
import {
  LeftOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  CloseOutlined,
  HomeOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import NotesLists from "../../pages/family-hub/components/familyNotesLists";
import GuardianSection from "../../pages/family-hub/components/guardians";

// Import backend services and contexts
import { useCurrentUser } from "../../app/userContext";
import { getPets, getUsersFamilyMembers, getUserFamilyGroups } from "../../services/family";
import { useGlobalLoading } from "../../app/loadingContext";
import { capitalizeEachWord, PRIMARY_COLOR } from "../../app/comman";
import FamilyInviteForm from "../../pages/family-hub/FamilyInviteForm";
import PetInviteForm from "../../pages/family-hub/PetsInviteForm";
import FamilyMembersCard from "./components/FamilyMembersCard";
import FamilyTasks from "./components/FamilyTask";
import TodaysSchedule from "./components/TodaysSchedule";
import WeekHighlights from "./components/WeekHighlights";
import BookmarkHub from "../components/bookmarks";
import FileHub from "../components/files";
import ProfileClient from "../../app/[username]/family-hub/profile/[id]/profileClient";
const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface FamilyGroup {
  id: string;
  name: string;
  ownerName: string;
  memberCount: number;
}

interface FamilyMember {
  id: number;
  name: string;
  role: string;
  type: "family" | "pets";
  color: string;
  initials: string;
  status?: "pending" | "accepted";
  isPet?: boolean;
  user_id?: string;
}

const SPACING = {
  xs: 3,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 36,
};

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const FamilyHubPage: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [selectedFamilyGroup, setSelectedFamilyGroup] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "family" | "pets">(
    "all"
  );
  const [isFamilyModalVisible, setIsFamilyModalVisible] = useState(false);
  const [isPetModalVisible, setIsPetModalVisible] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("family");
  const [currentFamilyGroupId, setCurrentFamilyGroupId] = useState<string | null>(null);

  useEffect(() => {
      const stored = localStorage.getItem("currentFamilyGroupId");
      setCurrentFamilyGroupId(stored);
    }, []);

  // Contexts for backend integration
  const currentUser = useCurrentUser();
  const role = currentUser?.role;
  const { loading, setLoading } = useGlobalLoading();

  // Function to fetch user's family groups
  const getFamilyGroups = async () => {
    try {
      const response = await getUserFamilyGroups();
      const { status, payload } = response;
      if (status === 1) {
        setFamilyGroups(payload.groups || []);

        if (payload.groups && payload.groups.length > 0) {
          const firstGroup = payload.groups[0];

          if (firstGroup.id) {
            // Normal flow → fetch members from API
            setSelectedFamilyGroup(firstGroup.id);
          } else {
            // No family_group_id → directly use embedded members
            setFamilyMembers(firstGroup.members || []);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch family groups:", error);
    }
  };

  // Function to fetch pet data
  const getPetsData = async (groupId: string) => {
    try {
      const response = await getPets(groupId);
      const { status, payload } = response.data;
      if (status === 1) {
        const formattedPets = payload.pets.map((pet: any, index: number) => ({
          id: pet.id,
          name: pet.name,
          role: `${pet.species} - ${pet.breed}`,
          type: "pets",
          color: "#fbbf24",
          initials:
            pet.species === "Dog"
              ? "🐕"
              : pet.species === "Cat"
              ? "🐈"
              : pet.species === "Bird"
              ? "🐦"
              : pet.species === "Fish"
              ? "🐠"
              : pet.species === "Rabbit"
              ? "🐇"
              : "🐾",
          isPet: true,
        }));
        return formattedPets;
      } else {
        message.error("Failed to fetch pets");
        return [];
      }
    } catch (error) {
      message.error("Failed to fetch pets");
      return [];
    }
  };

  // Function to fetch family members data
  const getMembers = async (groupId?: string) => {
    setLoading(true);
    
    // Clear existing family members to prevent stacking
    setFamilyMembers([]);
    
    const fuser = localStorage.getItem("fuser");
    try {
      const params: { role: any; fuser: string | null; family_group_id?: string } = { role, fuser };
      if (groupId) {
        params.family_group_id = groupId;
        // Store the current family group ID for project filtering
        setCurrentFamilyGroupId(groupId);
      }
      
      const response = await getUsersFamilyMembers(params);
      const { status, payload } = response;

      if (status) {
        const transformedMembers = payload.members.map((member: any) => {
          const name = member.name || "Unnamed";
          const id = member.id;
          const initials = name
            .split(" ")
            .map((word: string) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          const role =
            member.relationship?.replace(/[^a-zA-Z\s]/g, "") || "Unknown";
          const color =
            role.toLowerCase() === "me" ? PRIMARY_COLOR : member.color;

          return {
            id,
            name,
            role,
            type: "family",
            color,
            initials,
            user_id: member.user_id,
            status: member.status || "accepted",
            sharedItems: member.sharedItems || {},
            permissions: member.permissions || {},
          };
        });

        // Only fetch pets if we have a specific group ID
        const pets = groupId ? await getPetsData(groupId) : [];

        const meMember = transformedMembers.find(
          (m: any) => m.role.toLowerCase() === "me"
        );
        const otherMembers = transformedMembers.filter(
          (m: any) => m.role.toLowerCase() !== "me"
        );
        const sortedMembers = meMember
          ? [meMember, ...otherMembers]
          : otherMembers;

        setFamilyMembers([...sortedMembers, ...pets]);
      } else {
        message.error("Failed to fetch family members");
      }
    } catch (error) {
      message.error("Failed to fetch family members");
    } finally {
      setLoading(false);
    }
  };

  // Handle family group selection
  const handleFamilyGroupChange = async (groupId: string) => {
    setSelectedFamilyGroup(groupId);
    // Store current family group ID in localStorage for forms to use
    localStorage.setItem('currentFamilyGroupId', groupId);
    // Update the current family group ID state
    setCurrentFamilyGroupId(groupId);
    // Clear selected member when switching families
    setSelectedMemberId(null);
    await getMembers(groupId);
  };

  // Callback function to refresh family members after adding new ones
  const handleMemberAdded = async () => {
    await getMembers(selectedFamilyGroup || undefined);
  };

  const handleAddMember = (type: string) => {
    type === "family"
      ? setIsFamilyModalVisible(true)
      : setIsPetModalVisible(true);
  };

  const handleFamilyFormSubmit = async (formData: any) => {
    setLoading(true);
    try {
      // Add family_group_id to the form data
      const formDataWithGroup = {
        ...formData,
        family_group_id: selectedFamilyGroup
      };
      
      setIsFamilyModalVisible(false);
      message.success("Family member added successfully!");
      
      // Refresh the family members list for the current group
      await getMembers(selectedFamilyGroup || undefined);
    } catch (error) {
      message.error("Failed to add family member");
    } finally {
      setLoading(false);
    }
  };

  const handlePetFormSubmit = async (formData: any) => {
    setLoading(true);
    try {
      // Add family_group_id to the form data
      const formDataWithGroup = {
        ...formData,
        family_group_id: selectedFamilyGroup
      };
      
      setIsPetModalVisible(false);
      message.success("Pet added successfully!");
      
      // Refresh the family members list for the current group
      await getMembers(selectedFamilyGroup || undefined);
    } catch (error) {
      message.error("Failed to add pet");
    } finally {
      setLoading(false);
    }
  };

  const handleFamilyCancel = () => setIsFamilyModalVisible(false);
  const handlePetCancel = () => setIsPetModalVisible(false);

  // Fetch data on component mount
  useEffect(() => {
    getFamilyGroups();
  }, []);

  // Fetch members when family group is selected
  useEffect(() => {
    if (selectedFamilyGroup) {
      localStorage.setItem('currentFamilyGroupId', selectedFamilyGroup);
      getMembers(selectedFamilyGroup);
    }
  }, [selectedFamilyGroup]);

  const contentStyle: React.CSSProperties = {
    padding: "20px 30px",
    background: "#f9fafb",
    minHeight: "100vh",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e5e7eb",
    background: "transparent",
    padding: 0,
  };

  const capitalizeFirstWord = (text:any) => {
    if (!text) return "";
    const words = text.split(" ");
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ");
  };

  // Dynamic title and icon based on selected member
  const getPageTitle = () => {
    // if (selectedMemberId) {
    //   return "Profile Details";
    // }

    if (selectedFamilyGroup) {
      const group = familyGroups.find(g => g.id === selectedFamilyGroup);
      if (group) {
        return `${capitalizeFirstWord(group.name)} Board`; 
      }
    }

    return "Family Board";
  };


  const handleCloseProfile = () => {
    setSelectedMemberId(null);
  };

  const getPageIcon = () => {
    return "👨‍👩‍👧‍👦";
  };

  return (
    <Layout
      style={{ minHeight: "100vh", marginTop: "62px", marginLeft: "40px" }}
    >
      <Layout>
        <Content style={contentStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: selectedMemberId ? "#f3f4f6" : "#eef1ff",
                  color: selectedMemberId ? "#6b7280" : "#3355ff",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  marginRight: "12px",
                  transition: "all 0.3s ease",
                }}
              >
                {getPageIcon()}
              </div>
              <Title level={3} style={{ margin: 0, transition: "all 0.3s ease" }}>
                {getPageTitle()}
              </Title>
            </div>

            {/* Family Group Selector */}
            {familyGroups.length > 1 && !selectedMemberId && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "white",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                }}
              >
                <HomeOutlined style={{ color: "#6b7280", fontSize: "16px" }} />
                {/* <span style={{ 
                  fontSize: "14px", 
                  fontWeight: 500, 
                  color: "#374151",
                  fontFamily: FONT_FAMILY 
                }}>
                </span> */}
                <Select
                  value={selectedFamilyGroup}
                  onChange={handleFamilyGroupChange}
                  style={{ 
                    minWidth: "200px",
                    fontFamily: FONT_FAMILY
                  }}
                  size="middle"
                  suffixIcon={<SwapOutlined style={{ color: "#6b7280" }} />}
                >
                  {familyGroups.map((group) => (
                    <Option key={group.id} value={group.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 500 }}>{group.name}</span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "#fff",
                            background: "#3b82f6", // blue badge
                            borderRadius: "9999px", // fully rounded badge
                            padding: "2px 6px",
                            lineHeight: 1,
                            display: "inline-block",
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          {group.memberCount}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* Only show other sections when no member is selected */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{
              marginTop: "24px",
            }}
            tabBarStyle={{
              marginBottom: "24px",
              borderBottom: "1px solid #e5e7eb",
              background: "transparent",
              padding: "0",
            }}
            tabBarGutter={40}
            size="large"
            type="line"
          >
            <TabPane
              tab={
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: activeTab === "family" ? "#3355ff" : "#6b7280",
                    transition: "color 0.3s ease",
                  }}
                >
                  <TeamOutlined
                    style={{
                      fontSize: "16px",
                      color: activeTab === "family" ? "#3355ff" : "#9ca3af",
                    }}
                  />
                  Family
                </span>
              }
              key="family"
            >
              {selectedMemberId ? (
                <Card
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        Profile Details
                      </span>
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={handleCloseProfile}
                        size="small"
                        style={{ color: "#666", fontFamily: FONT_FAMILY }}
                      />
                    </div>
                  }
                  style={{ marginBottom: "12px", borderRadius: "12px" }}
                  bodyStyle={{ padding: 0, margin: 0 }}
                >
                  <ProfileClient
                    memberId={selectedMemberId.toString()}
                    onBack={handleCloseProfile}
                  />
                </Card>
              ) : (
                <>
                  <FamilyMembersCard
                    familyMembers={familyMembers}
                    currentFamilyName={familyGroups.find(g => g.id === selectedFamilyGroup)?.name}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    handleAddMember={handleAddMember}
                    selectedMemberId={selectedMemberId}
                    setSelectedMemberId={setSelectedMemberId}
                    onMemberAdded={handleMemberAdded}
                  />

                  {/* Your schedule, highlights, tasks, etc */}
                  <div style={{ marginTop: "24px" }}>
                    <Row gutter={12} style={{ marginBottom: "16px" }}>
                      <Col xs={24} lg={12}>
                        <TodaysSchedule familyMembers={familyMembers} />
                      </Col>
                      <Col xs={24} lg={12}>
                        <WeekHighlights familyMembers={familyMembers} />
                      </Col>
                    </Row>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr 1fr",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <FamilyTasks
                        familyMembers={familyMembers.filter((m) => m.type === "family")}
                        currentFamilyGroupId={currentFamilyGroupId}
                      />

                      <BookmarkHub hub={"family"} />
                      <NotesLists currentHub="family" />
                    </div>

                    <Row
                      gutter={[SPACING.xs, SPACING.xs]}
                      style={{ marginTop: 10 }}
                    >
                      <Col span={10}>
                        <FileHub hubName="Family" title="Files" />
                      </Col>
                    </Row>
                  </div>
                </>
              )}
            </TabPane>

            <TabPane
              tab={
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: activeTab === "guardians" ? "#3355ff" : "#6b7280",
                    transition: "color 0.3s ease",
                  }}
                >
                  <UserOutlined
                    style={{
                      fontSize: "16px",
                      color: activeTab === "guardians" ? "#3355ff" : "#9ca3af",
                    }}
                  />
                  Guardians
                </span>
              }
              key="guardians"
            >
              <GuardianSection />
            </TabPane>
          </Tabs>

          {/* Modals for adding members */}
          <FamilyInviteForm
            visible={isFamilyModalVisible}
            onCancel={handleFamilyCancel}
            isEditMode={false}
            onSubmit={handleFamilyFormSubmit}
          />
          <PetInviteForm
            visible={isPetModalVisible}
            onCancel={handlePetCancel}
            onSubmit={handlePetFormSubmit}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default FamilyHubPage;