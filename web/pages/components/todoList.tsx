import React, { useEffect, useState } from "react";
import {
    Tabs,
    Input,
    DatePicker,
    Select,
    Button,
    List,
    Checkbox,
    Typography,
    Form,
    Space,
    Popconfirm,
} from "antd";
import moment from "moment";
import { CloseOutlined } from "@ant-design/icons";
import { inputSuffix } from "./eventCarousel";
import { addNotes, deleteNotes, getNotes, updateNotes } from "../../services/google";
import { showNotification } from "../../utils/notification";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useGlobalLoading } from "../../app/loadingContext";

const { Option } = Select;
const { Title } = Typography;

const ToDoList = () => {
    const [assignedTo, setAssignedTo] = useState("Asfar");
    const { loading, setLoading } = useGlobalLoading();
    const [tasks, setTasks] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("today");
    const [viewMode, setViewMode] = useState<"my" | "family">("my");
    const [form] = Form.useForm();


    const handleAddNotes = async (values: any) => {
        setLoading(true);
        const response = await addNotes({ ...values, mode: activeTab });
        const { status, message, payload } = response.data;
        if (status) {
            getUserNotes();
            showNotification("Success", message, "success");
            form.resetFields();
        }
        setLoading(false);
    };
    useEffect(() => {
        getUserNotes();
    }, [])

    const getUserNotes = async () => {
        setLoading(true);
        const response = await getNotes({});
        const { status, payload } = response.data;
        if (status) {
            const transformedNotes = payload.notes.map((note: any, index: number) => ({
                id: index + 1,
                text: note.note,
                due: moment(note.note_time),
                completed: false,
                color: getColorByIndex(index),
                nid: note.nid
            }));
            setTasks(transformedNotes);
        }
        setLoading(false);
    }

    const getColorByIndex = (index: number) => {
        const colors = ["#1677ff", "#faad14", "#52c41a", "#ff4d4f", "#9254de"];
        return colors[index % colors.length];
    };

    const deleteTask = async (id: number) => {
        setLoading(true);
        // setTasks(tasks.filter((t) => t.id !== id));
        try {
            const response = await deleteNotes({ noteId: id });
            const { status, message } = response.data;
            if (status) {
                showNotification("Success", message, "success");
                getUserNotes();
            } else {
                showNotification("Error", message, "error");
            }
        } catch (error) {
            console.error("Failed to update notes on delete:", error);
        }
        setLoading(false);
    };

    const toggleComplete = async (nid: number) => {
        setLoading(true);
        // setTasks(
        //     tasks.map((t) =>
        //         t.id === id ? { ...t, completed: !t.completed } : t
        //     )
        // );
        try {
            const response = await updateNotes({ noteId: nid });
            const { status, message } = response.data;
            if (status) {
                showNotification("Success", message, "success");
                getUserNotes();
            } else {
                showNotification("Error", message, "error");
            }
        } catch (error) {
            console.error("Failed to update notes on delete:", error);
        }
        setLoading(false);
    };

    const filteredTasks = () => {
        const now = moment();
        return tasks.filter((task) => {
            if (activeTab === "today") {
                return task.due.isSame(now, "day");
            }
            if (activeTab === "week") {
                return task.due.isSame(now, "week");
            }
            if (activeTab === "month") {
                return task.due.isSame(now, "month");
            }
            return true;
        });
    };

    // if (loading) {
    //     return <div style={{ maxWidth: 750 }}>
    //         <DotLottieReact
    //             src="https://lottie.host/da88533c-a8ff-4727-ae07-d874fef181a3/hRNqEpQVWC.lottie"
    //             loop
    //             autoplay
    //         />
    //     </div>
    // }

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                padding: 24,
                maxWidth: 750,
                margin: "auto",
                marginTop: 17,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Space>
                    <Title level={4} style={{ margin: 0, marginBottom: 10, }}>
                        To-Do List
                    </Title>
                    {inputSuffix}
                </Space>
                <div style={{ marginBottom: 10, display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Button
                        onClick={() => setViewMode("my")}
                        type={viewMode === "my" ? "primary" : "default"}
                    >
                        My View
                    </Button>
                    <Button
                        onClick={() => setViewMode("family")}
                        type={viewMode === "family" ? "primary" : "default"}
                    >
                        Family View
                    </Button>
                </div>
            </div>

            <Tabs
                defaultActiveKey="today"
                onChange={(key) => setActiveTab(key)}
                tabBarStyle={{ marginBottom: 20 }}
                items={[
                    { key: "today", label: "Today" },
                    { key: "week", label: "Week" },
                    { key: "month", label: "Month" },
                ]}
            />

            <Form
                form={form}
                requiredMark={false}
                onFinish={handleAddNotes}
                initialValues={{ note: "" }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 16,
                        alignItems: "center",
                    }}
                >
                    <Form.Item
                        name="note"
                        style={{ flex: 1, marginBottom: 0 }}
                        rules={[{ required: true, message: "Please enter a task" }]}
                    >
                        <Input.TextArea
                            placeholder="Add new task..."
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            style={{
                                width: "100%",
                                padding: "10px 20px",
                                fontSize: 16,
                                caretColor: "auto",
                            }}
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                            backgroundColor: "#1677ff",
                            height: 40,
                            fontWeight: 500,
                            padding: "0 24px",
                            whiteSpace: "nowrap",
                        }}
                        loading={loading}
                    >
                        Add
                    </Button>
                </div>
            </Form>
            <List
                loading={loading}
                dataSource={filteredTasks()}
                locale={{
                    emptyText: (
                        <div style={{ textAlign: "center" }}>
                            <img
                                src="/think.jpg"
                                alt="No Tasks"
                                style={{ width: 180, marginBottom: 20 }}
                            />
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#888" }}>
                                No tasks found for this view.
                            </div>
                            <div style={{ fontSize: 14, color: "#aaa", marginTop: 8 }}>
                                Try creating a new task to get started.
                            </div>
                        </div>
                    ),
                }}
                renderItem={(task) => {
                    const isPastDue = moment().isAfter(task.due) && !task.completed;
                    return (
                        <List.Item
                            key={task.id}
                            style={{
                                padding: 12,
                                background: "#fafafa",
                                borderRadius: 8,
                                marginBottom: 8,
                                borderLeft: `4px solid ${task.color}`,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <Checkbox
                                checked={task.completed}
                                onChange={() => toggleComplete(task.nid)}
                                style={{ marginRight: 12 }}
                            />
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        textDecoration: task.completed ? "line-through" : "none",
                                        fontSize: 15,
                                        fontWeight: 500,
                                    }}
                                >
                                    {task.text}
                                </div>
                                <div style={{ fontSize: 12, color: isPastDue ? "red" : "#888" }}>
                                    Due: {task.due.format("MMM DD, YYYY HH:mm")}
                                    {isPastDue && (
                                        <span style={{ marginLeft: 8, color: "red" }}>
                                            PAST DUE
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Popconfirm
                                title="Are you sure you want to delete this task?"
                                onConfirm={() => deleteTask(task.nid)}
                                okText="Yes"
                                cancelText="No"
                                placement="topRight"
                            >
                                <CloseOutlined
                                    style={{ color: "#ff4d4f", fontSize: 16, cursor: "pointer" }}
                                />
                            </Popconfirm>
                        </List.Item>
                    );
                }}
            />
        </div>
    );
};

export default ToDoList;
