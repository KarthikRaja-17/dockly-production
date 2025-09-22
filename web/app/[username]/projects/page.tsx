"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Progress, Button, List, Tabs, Modal, Input } from "antd";
import { EditOutlined, PlusOutlined, FileOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { TabPane } = Tabs;

const ProjectDashboard: React.FC = () => {
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [isChecklistModalVisible, setIsChecklistModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isToolModalVisible, setIsToolModalVisible] = useState(false);
  const [isDocumentModalVisible, setIsDocumentModalVisible] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [isAddSectionModalVisible, setIsAddSectionModalVisible] =
    useState(false);
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [newSectionName, setNewSectionName] = useState("");

  const handleAddProject = () => setIsProjectModalVisible(true);
  const handleAddChecklistItem = () => setIsChecklistModalVisible(true);
  const handleAddTask = () => setIsTaskModalVisible(true);
  const handleAddTool = () => setIsToolModalVisible(true);
  const handleAddDocument = () => setIsDocumentModalVisible(true);
  const handleAddNote = () => setIsNoteModalVisible(true);
  const handleAddSection = () => setIsAddSectionModalVisible(true);

  const handleModalOk = (type: string) => {
    if (type === "project") setIsProjectModalVisible(false);
    if (type === "checklist") setIsChecklistModalVisible(false);
    if (type === "task") setIsTaskModalVisible(false);
    if (type === "tool") setIsToolModalVisible(false);
    if (type === "document") setIsDocumentModalVisible(false);
    if (type === "note") setIsNoteModalVisible(false);
    if (type === "section") {
      if (newSectionName) {
        setCustomSections([...customSections, newSectionName]);
        setNewSectionName("");
      }
      setIsAddSectionModalVisible(false);
    }
  };

  const handleModalCancel = (type: string) => {
    if (type === "project") setIsProjectModalVisible(false);
    if (type === "checklist") setIsChecklistModalVisible(false);
    if (type === "task") setIsTaskModalVisible(false);
    if (type === "tool") setIsToolModalVisible(false);
    if (type === "document") setIsDocumentModalVisible(false);
    if (type === "note") setIsNoteModalVisible(false);
    if (type === "section") {
      setNewSectionName("");
      setIsAddSectionModalVisible(false);
    }
  };

  const activeProjects = [
    {
      name: "Hamilton",
      start: "May 5, 2025",
      end: "May 31, 2025",
      progress: 80,
      tasks: 6,
    },
    {
      name: "Summer Vacation Planning",
      start: "Apr 18, 2025",
      end: "Jun 1, 2025",
      progress: 50,
      tasks: 10,
    },
    {
      name: "Digital Photo Organization",
      start: "Apr 1, 2025",
      end: "May 15, 2025",
      progress: 20,
      tasks: 8,
    },
  ];

  const projectChecklist = [
    { label: "Measure room dimensions", checked: true },
    { label: "Create budget", checked: true },
    { label: "Research furniture options", checked: true },
    { label: "Clear out existing furniture", checked: false },
    { label: "Select paint color", checked: false },
    { label: "Paint walls", checked: false },
    { label: "Install new lighting", checked: false },
    { label: "Assemble and arrange furniture", checked: false },
    { label: "Set up computer and equipment", checked: false },
  ];

  const tasks = {
    todo: [
      {
        task: "Purchase desk and chair",
        date: "Apr 25",
        budget: "$500",
        status: "SHOPPING",
      },
      {
        task: "Order bookshelf",
        date: "Apr 28",
        budget: "$150",
        status: "SHOPPING",
      },
      {
        task: "Decide on wall paint color",
        date: "Apr 22",
        budget: "$80",
        status: "DESIGN",
      },
    ],
    inProgress: [
      { task: "Remove old furniture", date: "Apr 20", status: "LABOR" },
      { task: "Research lighting options", date: "Apr 31", status: "SHOPPING" },
      { task: "Research desk options", date: "Apr 15", status: "SHOPPING" },
    ],
    done: [
      { task: "Measure room dimensions", date: "Apr 5", status: "PLANNING" },
      { task: "Create budget spreadsheet", date: "Apr 10", status: "PLANNING" },
    ],
  };

  const projectTools = [
    { name: "Google Sheets", description: "Budget Tracking" },
    { name: "Trello", description: "Task Management" },
    { name: "Figma", description: "Room Layout" },
    { name: "Miro", description: "Ideation Board" },
  ];

  const projectDocuments = [
    { name: "Home Office Layout.pdf", source: "Google Drive" },
    { name: "Renovation Budget.xlsx", source: "Google Drive" },
    { name: "Design Inspiration.jpg", source: "Dropbox" },
    { name: "Furniture Dimensions.png", source: "Google Drive" },
  ];

  const projectNotes = [
    {
      content:
        "Consider integrating a standing desk option for better ergonomics. The IKEA BEKANT has good reviews and fits within our budget.",
      added: "Apr 15, 2025",
    },
  ];

  const projectTimeline = [
    { label: "Planning", date: "Apr 5", completed: true },
    { label: "Prep", date: "Apr 30", completed: true },
    { label: "Furniture", date: "May 5", completed: false },
    { label: "Decor", date: "May 15", completed: false },
    { label: "Complete", date: "May 30", completed: false },
  ];
  const [username, setUsername] = useState<string>("");
    console.log("🚀 ~ HealthDashboard ~ username:", username)
    const router = useRouter();
  
    useEffect(() => {
      const username = localStorage.getItem("username") || "";
      setUsername(username);
      if (localStorage.getItem('projectss') === null) {
        router.push(`/${username}/projects/setup`);
      }
    }, []);
  

  return (
    <>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#F5F5F5",
          minHeight: "100vh",
          margin: "80px 10px 10px 60px"
        }}
      >
        {/* Tabs */}
        <Tabs
          defaultActiveKey="1"
          style={{
            marginBottom: "20px",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            color: "#000",
          }}
          tabBarStyle={{
            borderBottom: "none",
          }}
        >
          <TabPane
            tab={
              <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                PROJECTS
              </span>
            }
            key="1"
          />
          <TabPane tab="CALENDAR" key="2" />
          <TabPane tab="ACTIVITY" key="3" />
        </Tabs>

        {/* Two-Column Grid Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Left Column */}
          <div>
            {/* Active Projects */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#000",
                  margin: 0,
                }}
              >
                <span style={{ marginRight: "10px" }}>Active Projects</span>
                <EditOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
              </h3>
              <List
                dataSource={activeProjects}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#E6F0FA",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: "#D3E3FD",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {item.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.start} - {item.end} | {item.tasks} tasks |{" "}
                          {item.progress}% complete
                        </p>
                        <Progress
                          percent={item.progress}
                          showInfo={false}
                          strokeColor="#1890ff"
                        />
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddProject}
                style={{
                  marginTop: "10px",
                  borderRadius: "20px",
                  border: "1px solid #1890ff",
                  color: "#1890ff",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  width: "100%",
                }}
              >
                Add Project
              </Button>
              <Modal
                title="Add Project"
                open={isProjectModalVisible}
                onOk={() => handleModalOk("project")}
                onCancel={() => handleModalCancel("project")}
              >
                <Input
                  placeholder="Project Name"
                  style={{ marginBottom: "10px" }}
                />
                <Input
                  placeholder="Start Date"
                  style={{ marginBottom: "10px" }}
                />
                <Input
                  placeholder="End Date"
                  style={{ marginBottom: "10px" }}
                />
              </Modal>
            </div>

            {/* Home Office Project Tasks */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#ff4d4f",
                  margin: 0,
                }}
              >
                <span style={{ marginRight: "10px" }}>
                  Home Office Project Tasks
                </span>
                <EditOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
              </h3>

              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#000",
                  margin: "10px 0 5px 0",
                }}
              >
                To Do
              </h4>
              <List
                dataSource={tasks.todo}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#E6F0FA",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: "#D3E3FD",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {item.task[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          {item.task}
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.date} | {item.budget} | {item.status}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#000",
                  margin: "10px 0 5px 0",
                }}
              >
                In Progress
              </h4>
              <List
                dataSource={tasks.inProgress}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#E6F0FA",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: "#D3E3FD",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {item.task[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          {item.task}
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.date} | {item.status}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#000",
                  margin: "10px 0 5px 0",
                }}
              >
                Done
              </h4>
              <List
                dataSource={tasks.done}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#E6F0FA",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: "#D3E3FD",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {item.task[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          {item.task}
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.date} | {item.status}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              <Button
                icon={<PlusOutlined />}
                onClick={handleAddTask}
                style={{
                  marginTop: "10px",
                  borderRadius: "20px",
                  border: "1px solid #1890ff",
                  color: "#1890ff",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  width: "100%",
                }}
              >
                Add Task
              </Button>
              <Modal
                title="Add Task"
                open={isTaskModalVisible}
                onOk={() => handleModalOk("task")}
                onCancel={() => handleModalCancel("task")}
              >
                <Input
                  placeholder="Task Name"
                  style={{ marginBottom: "10px" }}
                />
                <Input
                  placeholder="Due Date"
                  style={{ marginBottom: "10px" }}
                />
                <Input placeholder="Budget" style={{ marginBottom: "10px" }} />
                <Input placeholder="Status" style={{ marginBottom: "10px" }} />
              </Modal>
            </div>

            {/* Project Documents */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#722ed1",
                  margin: 0,
                }}
              >
                <span style={{ marginRight: "10px" }}>Project Documents</span>
                <EditOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
              </h3>
              <List
                dataSource={projectDocuments}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#E6F0FA",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: "#D3E3FD",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FileOutlined
                          style={{ fontSize: "16px", color: "#1890ff" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.source}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddDocument}
                style={{
                  marginTop: "10px",
                  borderRadius: "20px",
                  border: "1px solid #1890ff",
                  color: "#1890ff",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  width: "100%",
                }}
              >
                Add Document
              </Button>
              <Modal
                title="Add Document"
                open={isDocumentModalVisible}
                onOk={() => handleModalOk("document")}
                onCancel={() => handleModalCancel("document")}
              >
                <Input
                  placeholder="Document Name"
                  style={{ marginBottom: "10px" }}
                />
                <Input placeholder="Source" style={{ marginBottom: "10px" }} />
              </Modal>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Project Timeline */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#000",
                  margin: 0,
                }}
              >
                <span style={{ marginRight: "10px" }}>Project Timeline</span>
                <EditOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
              </h3>
              <List
                dataSource={projectTimeline}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#E6F0FA",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: item.completed
                            ? "#1890ff"
                            : "#d9d9d9",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#fff",
                        }}
                      >
                        {item.label[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.date}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {/* Project Checklist */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "rgb(131, 4, 4)",
                  margin: 0,
                }}
              >
                <span style={{ marginRight: "10px" }}>Project Checklist</span>
                <EditOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
              </h3>
              {/* if () */}
              <List
                dataSource={projectChecklist}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#E6F0FA",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: "#D3E3FD",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {item.label[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: item.checked ? "#888" : "#000",
                            textDecoration: item.checked
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.checked ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddChecklistItem}
                style={{
                  marginTop: "10px",
                  borderRadius: "20px",
                  border: "1px solid #1890ff",
                  color: "#1890ff",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  width: "100%",
                }}
              >
                Add Item
              </Button>
              <Modal
                title="Add Checklist Item"
                open={isChecklistModalVisible}
                onOk={() => handleModalOk("checklist")}
                onCancel={() => handleModalCancel("checklist")}
              >
                <Input
                  placeholder="Checklist Item"
                  style={{ marginBottom: "10px" }}
                />
              </Modal>
            </div>

            {/* Project Tools */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#fa8c16",
                  margin: 0,
                }}
              >
                <span style={{ marginRight: "10px" }}>Project Tools</span>
                <EditOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
              </h3>
              <List
                dataSource={projectTools}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#E6F0FA",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: "#D3E3FD",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {item.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddTool}
                style={{
                  marginTop: "10px",
                  borderRadius: "20px",
                  border: "1px solid #1890ff",
                  color: "#1890ff",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  width: "100%",
                }}
              >
                Add Tool
              </Button>
              <Modal
                title="Add Tool"
                open={isToolModalVisible}
                onOk={() => handleModalOk("tool")}
                onCancel={() => handleModalCancel("tool")}
              >
                <Input
                  placeholder="Tool Name"
                  style={{ marginBottom: "10px" }}
                />
                <Input
                  placeholder="Description"
                  style={{ marginBottom: "10px" }}
                />
              </Modal>
            </div>

            {/* Project Notes */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#722ed1",
                  margin: 0,
                }}
              >
                <span style={{ marginRight: "10px" }}>Project Notes</span>
                <EditOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
              </h3>
              <List
                dataSource={projectNotes}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      backgroundColor: "#fffbe6",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: "#D3E3FD",
                          borderRadius: "4px",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        N
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          Note
                        </p>
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {item.content} | Added: {item.added}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddNote}
                style={{
                  marginTop: "10px",
                  borderRadius: "20px",
                  border: "1px solid #1890ff",
                  color: "#1890ff",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  width: "100%",
                }}
              >
                Add Note
              </Button>
              <Modal
                title="Add Note"
                open={isNoteModalVisible}
                onOk={() => handleModalOk("note")}
                onCancel={() => handleModalCancel("note")}
              >
                <Input
                  placeholder="Note Content"
                  style={{ marginBottom: "10px" }}
                />
                <Input
                  placeholder="Added Date"
                  style={{ marginBottom: "10px" }}
                />
              </Modal>
            </div>

            {/* Custom Sections */}
            {customSections.map((section, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#000",
                    margin: 0,
                  }}
                >
                  <span style={{ marginRight: "10px" }}>{section}</span>
                  <EditOutlined
                    style={{ color: "#1890ff", fontSize: "14px" }}
                  />
                </h3>
                <List
                  dataSource={[]}
                  renderItem={() => <></>}
                  locale={{ emptyText: "No items yet" }}
                  style={{
                    backgroundColor: "#E6F0FA",
                    borderRadius: "8px",
                    padding: "10px",
                    marginTop: "10px",
                  }}
                />
                <Button
                  icon={<PlusOutlined />}
                  style={{
                    marginTop: "10px",
                    borderRadius: "20px",
                    border: "1px solid #1890ff",
                    color: "#1890ff",
                    backgroundColor: "transparent",
                    fontSize: "14px",
                    width: "100%",
                  }}
                >
                  Add Item
                </Button>
              </div>
            ))}

            {/* Add New Section Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px",
                  backgroundColor: "#F5F5F5",
                  borderRadius: "8px",
                  border: "1px dashed #d9d9d9",
                  width: "100%",
                  cursor: "pointer",
                }}
                onClick={handleAddSection}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#E6F0FA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10px",
                  }}
                >
                  <PlusOutlined
                    style={{ color: "#1890ff", fontSize: "20px" }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#1890ff",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                  }}
                >
                  Add a new section
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#888",
                  }}
                >
                  Customize your board with additional sections
                </p>
              </div>
            </div>
            <Modal
              title="Add New Section"
              open={isAddSectionModalVisible}
              onOk={() => handleModalOk("section")}
              onCancel={() => handleModalCancel("section")}
            >
              <Input
                placeholder="Section Name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDashboard;
