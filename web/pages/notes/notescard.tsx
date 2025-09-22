
// import React, { useState, useEffect, ReactElement } from "react";
// import {
//     Modal,
//     Card,
//     Button,
//     Form,
//     Input,
//     Select,
//     DatePicker,
//     Typography,
//     Space,
//     Row,
//     Col,
//     Empty,
//     Badge,
//     Divider,
//     Carousel,
//     message,
//     Tooltip,
// } from "antd";
// import {
//     Plus,
//     Edit3,
//     Trash2,
//     Calendar,
//     X,
//     RotateCcw,
//     Clock,
//     CheckCircle,
//     PlayCircle,
//     AlertCircle,
//     Sparkles,
//     Target,
//     BookOpen,
//     Heart,
// } from "lucide-react";
// import { LeftOutlined, RightOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
// import { addNotes, getNotes } from "../../services/notes";
// import { showNotification } from "../../utils/notification";
// import { useGlobalLoading } from "../../app/loadingContext";

// const { Text, Title } = Typography;
// const { TextArea } = Input;
// const { Option } = Select;

// interface Note {
//     id: number;
//     title: string;
//     description: string;
//     reminderDate: string;
//     status: "Done" | "In Progress" | "Yet to Start" | "Due";
// }

// interface StickyNotesProps {
//     isOpen: boolean;
//     setIsOpen: (isOpen: boolean) => void;
// }

// const StickyNotes: React.FC<StickyNotesProps> = ({ isOpen, setIsOpen }) => {
//     const [notes, setNotes] = useState<Note[]>([]);
//     const [showModal, setShowModal] = useState(false);
//     const { loading, setLoading } = useGlobalLoading();
//     const [modalMode, setModalMode] = useState<"create" | "edit">("create");
//     const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
//     const [form] = Form.useForm();

//     useEffect(() => {
//         getStickyNotes();
//     }, []);

//     const getStickyNotes = async () => {
//         try {
//             const response = await getNotes({});
//             const { status, message: msg, payload } = response.data;
//             if (status) {
//                 setNotes(payload.notes);
//             } else {
//                 showNotification("Error", msg, "error");
//             }
//         } catch (error) {
//             console.error("Error fetching notes:", error);
//             showNotification("Error", "Failed to fetch notes", "error");
//         }
//     };

//     type StatusType = "Done" | "In Progress" | "Yet to Start" | "Due";

//     // Define the config structure
//     interface StatusStyle {
//         color: string;
//         bgColor: string;
//         borderColor: string;
//         icon: ReactElement;
//     }

//     const statusConfig: Record<number, {
//         color: string;
//         bgColor: string;
//         borderColor: string;
//         icon: ReactElement;
//     }> = {
//         2: {
//             color: "#2ecc71",
//             bgColor: "#e8f7f0",
//             borderColor: "#87e8b6",
//             icon: <CheckCircle style={{ width: "18px", height: "18px", color: "#2ecc71" }} />,
//         },
//         1: {
//             color: "#3498db",
//             bgColor: "#e7f0fa",
//             borderColor: "#85c1e9",
//             icon: <PlayCircle style={{ width: "18px", height: "18px", color: "#3498db" }} />,
//         },
//         3: {
//             color: "#f1c40f",
//             bgColor: "#fef9e7",
//             borderColor: "#f7dc6f",
//             icon: <Clock style={{ width: "18px", height: "18px", color: "#f1c40f" }} />,
//         },
//         0: {
//             color: "#e74c3c",
//             bgColor: "#fcece9",
//             borderColor: "#f1948a",
//             icon: <AlertCircle style={{ width: "18px", height: "18px", color: "#e74c3c" }} />,
//         },
//     };

//     const openCreateModal = () => {
//         setModalMode("create");
//         form.resetFields();
//         setShowModal(true);
//     };

//     const statusMap: Record<"Done" | "In Progress" | "Yet to Start" | "Due", number> = {
//         "Done": 2,
//         "In Progress": 1,
//         "Due": 0,
//         "Yet to Start": 3,
//     };

//     const numberToStatusMap: Record<number, string> = Object.entries(statusMap)
//         .reduce((acc, [key, value]) => {
//             acc[value] = key;
//             return acc;
//         }, {} as Record<number, string>);

//     const statusToNumberMap: Record<string, number> = Object.fromEntries(
//         Object.entries(statusMap).map(([key, value]) => [value, Number(key)])
//     );

//     const openEditModal = (note: Note) => {
//         setModalMode("edit");
//         setEditingNoteId(note.id);
//         form.setFieldsValue({
//             title: note.title,
//             description: note.description,
//             reminderDate: dayjs(note.reminderDate),
//             status: numberToStatusMap[Number(note.status)],
//             id: note.id,
//         });
//         setShowModal(true);
//     };

//     const closeModal = () => {
//         setShowModal(false);
//         form.resetFields();
//         setEditingNoteId(null);
//     };

//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             const values = await form.validateFields();
//             const statusNumber = statusMap[values.status as keyof typeof statusMap] ?? -1;
//             if (modalMode === "create") {
//                 values.reminderDate = values.reminderDate.format("YYYY-MM-DD");
//                 values.status = statusNumber;
//                 const response = await addNotes(values);
//                 const { status, message } = response.data;
//                 if (status) {
//                     showNotification("Success", message, "success");
//                     getStickyNotes();
//                 }
//             } else {
//                 values.reminderDate = values.reminderDate.format("YYYY-MM-DD");
//                 values.status = statusNumber;
//                 const response = await addNotes({
//                     id: values.id,
//                     editing: true,
//                     ...values,
//                 });
//                 const { status, message } = response.data;
//                 if (status) {
//                     showNotification("Success", message, "success");
//                     getStickyNotes();
//                 }
//             }
//             closeModal();
//         } catch (error) {
//             console.error("Validation failed:", error);
//         }
//         setLoading(false);
//     };

//     const handleDeleteNote = (id: number) => { };

//     const resetToDefault = () => {
//         setNotes([]);
//     };

//     const formatDisplayDate = (dateString: string): string => {
//         return dayjs(dateString).format("MMM DD, YYYY");
//     };

//     const NextArrow: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
//         return (
//             <Button
//                 type="text"
//                 shape="circle"
//                 icon={
//                     <RightOutlined
//                         style={{ width: "16px", height: "16px", color: "#595959" }}
//                     />
//                 }
//                 onClick={onClick}
//                 style={{
//                     position: "absolute",
//                     right: "-30px",
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     background: "rgba(255, 255, 255, 0.9)",
//                     boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
//                     zIndex: 1,
//                 }}
//             />
//         );
//     };

//     const PrevArrow: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
//         return (
//             <Button
//                 type="text"
//                 shape="circle"
//                 icon={
//                     <LeftOutlined
//                         style={{ width: "16px", height: "16px", color: "#595959" }}
//                     />
//                 }
//                 onClick={onClick}
//                 style={{
//                     position: "absolute",
//                     left: "-30px",
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     background: "rgba(255, 255, 255, 0.9)",
//                     boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
//                     zIndex: 1,
//                 }}
//             />
//         );
//     };

//     return (
//         <>
//             {/* Main Modal */}
//             <Modal
//                 open={isOpen}
//                 onCancel={() => setIsOpen(false)}
//                 footer={null}
//                 width="90vw"
//                 closable={false}
//                 style={{ maxWidth: "600px", top: "30px" }}
//                 styles={{
//                     body: {
//                         padding: 0,
//                         background: "linear-gradient(135deg, #f9f9fb 0%, #f0f2f7 100%)",
//                         borderRadius: "12px",
//                         overflow: "hidden",
//                     },
//                 }}
//                 loading={loading}
//             >
//                 {/* Header */}
//                 <div
//                     style={{
//                         padding: "12px 16px",
//                         background: "transparent",
//                         position: "relative",
//                     }}
//                 >
//                     <Row justify="space-between" align="middle">
//                         <Col>
//                             <Space size="middle">
//                                 <div
//                                     style={{
//                                         width: "36px",
//                                         height: "36px",
//                                         background: "rgba(100, 100, 255, 0.1)",
//                                         borderRadius: "8px",
//                                         display: "flex",
//                                         alignItems: "center",
//                                         justifyContent: "center",
//                                     }}
//                                 >
//                                     <Target
//                                         style={{ width: "20px", height: "20px", color: "#4a4aff" }}
//                                     />
//                                 </div>
//                                 <div>
//                                     <Title
//                                         level={3}
//                                         style={{
//                                             color: "#1a1a1a",
//                                             margin: 0,
//                                             fontSize: "22px",
//                                             fontWeight: 600,
//                                         }}
//                                     >
//                                         Sticky Notes
//                                     </Title>
//                                     <Text
//                                         style={{
//                                             color: "#666",
//                                             fontSize: "12px",
//                                             display: "flex",
//                                             alignItems: "center",
//                                             gap: "4px",
//                                         }}
//                                     >
//                                         <Sparkles
//                                             style={{ width: "14px", height: "14px", color: "#666" }}
//                                         />
//                                         {notes.length} notes
//                                     </Text>
//                                 </div>
//                             </Space>
//                         </Col>
//                         <Col>
//                             <Space size="small">
//                                 <Button
//                                     type="text"
//                                     shape="circle"
//                                     icon={
//                                         <RotateCcw
//                                             style={{ width: "16px", height: "16px", color: "#666" }}
//                                         />
//                                     }
//                                     onClick={resetToDefault}
//                                 />
//                                 <Button
//                                     type="text"
//                                     shape="circle"
//                                     icon={
//                                         <X
//                                             style={{ width: "16px", height: "16px", color: "#666" }}
//                                         />
//                                     }
//                                     onClick={() => setIsOpen(false)}
//                                 />
//                             </Space>
//                         </Col>
//                     </Row>
//                     <Row justify="end" style={{ marginTop: "12px" }}>
//                         <Button
//                             type="primary"
//                             size="middle"
//                             icon={<Plus style={{ width: "16px", height: "16px" }} />}
//                             onClick={openCreateModal}
//                             style={{
//                                 background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
//                                 border: "none",
//                                 borderRadius: "8px",
//                                 padding: "0 16px",
//                                 height: "32px",
//                                 fontSize: "14px",
//                                 fontWeight: 500,
//                                 boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
//                             }}
//                         >
//                             New Note
//                         </Button>
//                     </Row>
//                 </div>

//                 {/* Content */}
//                 <div
//                     style={{
//                         background: "transparent",
//                         minHeight: "300px",
//                         padding: "16px",
//                     }}
//                 >
//                     {notes.length === 0 ? (
//                         <div
//                             style={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 minHeight: "200px",
//                             }}
//                         >
//                             <Empty
//                                 image={
//                                     <div
//                                         style={{
//                                             width: "80px",
//                                             height: "80px",
//                                             background:
//                                                 "linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)",
//                                             borderRadius: "50%",
//                                             display: "flex",
//                                             alignItems: "center",
//                                             justifyContent: "center",
//                                             margin: "0 auto 16px",
//                                         }}
//                                     >
//                                         <BookOpen
//                                             style={{
//                                                 width: "40px",
//                                                 height: "40px",
//                                                 color: "#3b82f6",
//                                             }}
//                                         />
//                                     </div>
//                                 }
//                                 description={
//                                     <div style={{ textAlign: "center" }}>
//                                         <Title
//                                             level={4}
//                                             style={{ color: "#6b7280", marginBottom: "8px" }}
//                                         >
//                                             No Notes Yet
//                                         </Title>
//                                         <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
//                                             Create a note to get organized!
//                                         </Text>
//                                     </div>
//                                 }
//                             />
//                         </div>
//                     ) : (
//                         <Carousel
//                             slidesToShow={2}
//                             slidesToScroll={1}
//                             dots={true}
//                             infinite={notes.length > 2}
//                             style={{ padding: "8px 0" }}
//                             prevArrow={<PrevArrow />}
//                             nextArrow={<NextArrow />}
//                             arrows={true}
//                         >
//                             {notes.map((note) => (
//                                 <div key={note.id} style={{ padding: "0 6px" }}>
//                                     <Tooltip
//                                         title={`Status: ${numberToStatusMap[Number(note.status)] || ""}`}
//                                         overlayInnerStyle={{
//                                             backgroundColor:
//                                                 statusConfig[Number(note.status)]?.color || "#e5e7eb",
//                                             color: "#fff", // optional: set text color to white for contrast
//                                             fontWeight: 500,
//                                             borderRadius: "6px",
//                                             padding: "8px 12px",
//                                         }}
//                                     >
//                                         <Card
//                                             hoverable
//                                             style={{
//                                                 width: "90%",
//                                                 height: "242px",
//                                                 borderRadius: "12px",
//                                                 border: `1px solid ${statusConfig[Number(note.status)]?.borderColor || "#e5e7eb"
//                                                     }`,
//                                                 background:
//                                                     statusConfig[Number(note.status)]?.bgColor || "#fff",
//                                                 boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
//                                                 transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                                             }}
//                                             // styles={{
//                                             //     background:
//                                             //         statusConfig[statusMap[note.status]]?.bgColor || "#fff",
//                                             //     boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
//                                             //     transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                                             //     padding: "16px",
//                                             //     display: "flex",
//                                             //     flexDirection: "column",
//                                             // }}
//                                             actions={[
//                                                 <Button
//                                                     type="text"
//                                                     icon={
//                                                         <Edit3 style={{ width: "14px", height: "14px" }} />
//                                                     }
//                                                     onClick={() => openEditModal(note)}
//                                                     style={{
//                                                         color:
//                                                             statusConfig[Number(note.status)]?.color || "#4a4aff",
//                                                         fontSize: "12px",
//                                                     }}
//                                                 >
//                                                     Edit
//                                                 </Button>,
//                                                 <Button
//                                                     type="text"
//                                                     icon={
//                                                         <Trash2 style={{ width: "14px", height: "14px" }} />
//                                                     }
//                                                     onClick={() => handleDeleteNote(note.id)}
//                                                     style={{ color: "#ef4444", fontSize: "12px" }}
//                                                 >
//                                                     Delete
//                                                 </Button>,
//                                             ]}
//                                         >
//                                             <div
//                                                 style={{
//                                                     marginBottom: "8px",
//                                                     display: "flex",
//                                                     alignItems: "center",
//                                                     gap: "8px",
//                                                 }}
//                                             >
//                                                 <Badge
//                                                     count={statusConfig[Number(note.status)]?.icon}
//                                                     style={{
//                                                         background:
//                                                             statusConfig[Number(note.status)]?.borderColor || "#4a4aff",
//                                                         borderRadius: "50%",
//                                                         width: "32px",
//                                                         height: "32px",
//                                                         display: "flex",
//                                                         alignItems: "center",
//                                                         justifyContent: "center",
//                                                     }}
//                                                 />
//                                                 {/* <Text
//                                                     style={{
//                                                         fontSize: "12px",
//                                                         color: "#374151",
//                                                         fontWeight: 500,
//                                                     }}
//                                                 >
//                                                     {statusMap[note.status]}
//                                                 </Text> */}
//                                             </div>
//                                             <Title
//                                                 level={5}
//                                                 style={{
//                                                     color: "#1f2937",
//                                                     marginBottom: "8px",
//                                                     fontSize: "16px",
//                                                     lineHeight: "1.3",
//                                                     fontWeight: 600,
//                                                     overflow: "hidden",
//                                                     whiteSpace: "nowrap",
//                                                     textOverflow: "ellipsis",
//                                                 }}
//                                             >
//                                                 {note.title}
//                                             </Title>
//                                             <Text
//                                                 style={{
//                                                     color: "#6b7280",
//                                                     fontSize: "12px",
//                                                     lineHeight: "1.4",
//                                                     display: "-webkit-box",
//                                                     WebkitBoxOrient: "vertical",
//                                                     overflow: "hidden",
//                                                     whiteSpace: "nowrap",
//                                                     textOverflow: "ellipsis",
//                                                 }}
//                                             >
//                                                 {note.description}
//                                             </Text>
//                                             <Divider style={{ margin: "8px 0" }} />
//                                             <div
//                                                 style={{
//                                                     display: "flex",
//                                                     justifyContent: "space-between",
//                                                     alignItems: "center",
//                                                 }}
//                                             >
//                                                 <Space size={4}>
//                                                     <Calendar
//                                                         style={{
//                                                             width: "14px",
//                                                             height: "14px",
//                                                             color: "#9ca3af",
//                                                         }}
//                                                     />
//                                                     <Text style={{ color: "#9ca3af", fontSize: "11px" }}>
//                                                         {formatDisplayDate(note.reminderDate)}
//                                                     </Text>
//                                                 </Space>
//                                                 <Badge
//                                                     text={note.status}
//                                                     style={{
//                                                         background:
//                                                             statusConfig[Number(note.status)]?.color || "#4a4aff",
//                                                         color: "white",
//                                                         padding: "2px 8px",
//                                                         borderRadius: "8px",
//                                                         fontSize: "11px",
//                                                         fontWeight: 500,
//                                                     }}
//                                                 />
//                                             </div>
//                                         </Card>
//                                     </Tooltip>
//                                 </div>
//                             ))}
//                         </Carousel>
//                     )}
//                 </div>
//             </Modal>

//             {/* Create/Edit Modal */}
//             <Modal
//                 open={showModal}
//                 onCancel={closeModal}
//                 footer={null}
//                 width={500}
//                 closable={false}
//                 style={{ top: "50px" }}
//                 styles={{
//                     body: {
//                         padding: 0,
//                         borderRadius: "12px",
//                         overflow: "hidden",
//                     },
//                 }}
//             // loading={loading}
//             >
//                 <div
//                     style={{
//                         background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
//                         padding: "16px",
//                         color: "white",
//                         textAlign: "center",
//                     }}
//                 >
//                     <div
//                         style={{
//                             width: "25px",
//                             height: "25px",
//                             background: "rgba(255, 255, 255, 0.2)",
//                             borderRadius: "50%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             margin: "0 auto 8px",
//                         }}
//                     >
//                         {modalMode === "create" ? (
//                             <Plus style={{ width: "20px", height: "20px", color: "white" }} />
//                         ) : (
//                             <Edit3
//                                 style={{ width: "20px", height: "20px", color: "white" }}
//                             />
//                         )}
//                     </div>
//                     <Title
//                         level={4}
//                         style={{
//                             color: "white",
//                             margin: 0,
//                             fontSize: "20px",
//                             fontWeight: 600,
//                         }}
//                     >
//                         {modalMode === "create" ? "New Note" : "Edit Note"}
//                     </Title>
//                     <Text
//                         style={{
//                             color: "rgba(255, 255, 255, 0.8)",
//                             fontSize: "12px",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             gap: "4px",
//                             marginTop: "4px",
//                         }}
//                     >
//                         <Heart style={{ width: "12px", height: "12px" }} />
//                         {modalMode === "create" ? "Get organized" : "Update note"}
//                     </Text>
//                 </div>
//                 <div
//                     style={{
//                         padding: "16px",
//                         background: "white",
//                         minHeight: "300px",
//                         display: "flex",
//                         flexDirection: "column",
//                     }}
//                 >
//                     <Form
//                         form={form}
//                         layout="vertical"
//                         initialValues={{
//                             reminderDate: dayjs(),
//                             status: "Yet to Start",
//                         }}
//                         style={{ width: "100%", flex: 1 }}
//                         onFinish={handleSave}
//                     >
//                         <Form.Item
//                             label={
//                                 <span
//                                     style={{
//                                         fontSize: "14px",
//                                         fontWeight: 500,
//                                         color: "#1f2937",
//                                     }}
//                                 >
//                                     Title
//                                 </span>
//                             }
//                             name="title"
//                             rules={[{ required: true, message: "Enter a title" }]}
//                         >
//                             <Input
//                                 placeholder="Note title..."
//                                 size="middle"
//                                 style={{
//                                     borderRadius: "8px",
//                                     border: "1px solid #e5e7eb",
//                                     fontSize: "14px",
//                                 }}
//                             />
//                         </Form.Item>
//                         <Form.Item
//                             label={
//                                 <span
//                                     style={{
//                                         fontSize: "14px",
//                                         fontWeight: 500,
//                                         color: "#1f2937",
//                                     }}
//                                 >
//                                     Description
//                                 </span>
//                             }
//                             name="description"
//                         >
//                             <TextArea
//                                 placeholder="Note details..."
//                                 rows={3}
//                                 style={{
//                                     borderRadius: "8px",
//                                     border: "1px solid #e5e7eb",
//                                     fontSize: "14px",
//                                     resize: "none",
//                                 }}
//                             />
//                         </Form.Item>
//                         <Row gutter={12}>
//                             <Col span={12}>
//                                 <Form.Item
//                                     label={
//                                         <span
//                                             style={{
//                                                 fontSize: "14px",
//                                                 fontWeight: 500,
//                                                 color: "#1f2937",
//                                             }}
//                                         >
//                                             Reminder Date
//                                         </span>
//                                     }
//                                     name="reminderDate"
//                                     rules={[{ required: true, message: "Select a date" }]}
//                                 >
//                                     <DatePicker
//                                         style={{
//                                             width: "100%",
//                                             borderRadius: "8px",
//                                             border: "1px solid #e5e7eb",
//                                             fontSize: "14px",
//                                         }}
//                                         size="middle"
//                                     />
//                                 </Form.Item>
//                             </Col>
//                             <Col span={12}>
//                                 <Form.Item
//                                     label={
//                                         <span
//                                             style={{
//                                                 fontSize: "14px",
//                                                 fontWeight: 500,
//                                                 color: "#1f2937",
//                                             }}
//                                         >
//                                             Status
//                                         </span>
//                                     }
//                                     name="status"
//                                 >
//                                     <Select
//                                         size="middle"
//                                         style={{
//                                             borderRadius: "8px",
//                                             fontSize: "14px",
//                                         }}
//                                     >
//                                         <Option value="Yet to Start">Yet to Start</Option>
//                                         <Option value="In Progress">In Progress</Option>
//                                         <Option value="Done">Done</Option>
//                                         <Option value="Due">Due</Option>
//                                     </Select>
//                                 </Form.Item>
//                                 <Form.Item name="id" hidden>
//                                     <Input />
//                                 </Form.Item>
//                             </Col>
//                         </Row>
//                         <Row gutter={12} style={{ marginTop: "16px" }}>
//                             <Col span={12}>
//                                 <Button
//                                     size="middle"
//                                     block
//                                     onClick={closeModal}
//                                     style={{
//                                         borderRadius: "8px",
//                                         height: "36px",
//                                         fontSize: "14px",
//                                         fontWeight: 500,
//                                         border: "1px solid #e5e7eb",
//                                         color: "#374151",
//                                     }}
//                                 >
//                                     Cancel
//                                 </Button>
//                             </Col>
//                             <Col span={12}>
//                                 <Button
//                                     type="primary"
//                                     size="middle"
//                                     block
//                                     onClick={handleSave}
//                                     style={{
//                                         background:
//                                             "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
//                                         border: "none",
//                                         borderRadius: "8px",
//                                         height: "36px",
//                                         fontSize: "14px",
//                                         fontWeight: 500,
//                                         boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
//                                     }}
//                                     loading={loading}
//                                 >
//                                     {modalMode === "create" ? "Create" : "Update"}
//                                 </Button>
//                             </Col>
//                         </Row>
//                     </Form>
//                 </div>
//             </Modal>
//         </>
//     );
// };

// export default StickyNotes;












import React, { useState, useEffect, ReactElement } from "react";
import {
    Modal, Card, Button, Form, Input, Select, DatePicker, Typography, Space, Row, Col, Empty, Badge, Divider, Carousel, message, Tooltip,
} from "antd";
import {
    Plus,
    Edit3,
    Trash2,
    Calendar,
    X,
    RotateCcw,
    Clock,
    CheckCircle,
    PlayCircle,
    AlertCircle,
    Sparkles,
    Target,
    BookOpen,
    Heart,
} from "lucide-react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { addNotes, getNotes } from "../../services/notes";
import { showNotification } from "../../utils/notification";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Note {
    id: number;
    title: string;
    description: string;
    reminderDate: string;
    status: "Done" | "In Progress" | "Yet to Start" | "Due";
}

interface StickyNotesProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const StickyNotes: React.FC<StickyNotesProps> = ({ isOpen, setIsOpen }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        getStickyNotes();
    }, []);

    const getStickyNotes = async () => {
        try {
            const response = await getNotes({});
            const { status, message: msg, payload } = response.data;
            if (status) {
                setNotes(payload.notes);
            } else {
                showNotification("Error", msg, "error");
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            showNotification("Error", "Failed to fetch notes", "error");
        }
    };

    type StatusType = "Done" | "In Progress" | "Yet to Start" | "Due";

    // Define the config structure
    interface StatusStyle {
        color: string;
        bgColor: string;
        borderColor: string;
        icon: ReactElement;
    }

    const statusConfig: Record<number, {
        color: string;
        bgColor: string;
        borderColor: string;
        icon: ReactElement;
    }> = {
        2: {
            color: "#2ecc71",
            bgColor: "#e8f7f0",
            borderColor: "#87e8b6",
            icon: <CheckCircle style={{ width: "18px", height: "18px", color: "#2ecc71" }} />,
        },
        1: {
            color: "#3498db",
            bgColor: "#e7f0fa",
            borderColor: "#85c1e9",
            icon: <PlayCircle style={{ width: "18px", height: "18px", color: "#3498db" }} />,
        },
        3: {
            color: "#f1c40f",
            bgColor: "#fef9e7",
            borderColor: "#f7dc6f",
            icon: <Clock style={{ width: "18px", height: "18px", color: "#f1c40f" }} />,
        },
        0: {
            color: "#e74c3c",
            bgColor: "#fcece9",
            borderColor: "#f1948a",
            icon: <AlertCircle style={{ width: "18px", height: "18px", color: "#e74c3c" }} />,
        },
    };

    const openCreateModal = () => {
        setModalMode("create");
        form.resetFields();
        setShowModal(true);
    };

    const statusMap: Record<"Done" | "In Progress" | "Yet to Start" | "Due", number> = {
        "Done": 2,
        "In Progress": 1,
        "Due": 0,
        "Yet to Start": 3,
    };

    const numberToStatusMap: Record<number, string> = Object.entries(statusMap)
        .reduce((acc, [key, value]) => {
            acc[value] = key;
            return acc;
        }, {} as Record<number, string>);

    const statusToNumberMap: Record<string, number> = Object.fromEntries(
        Object.entries(statusMap).map(([key, value]) => [value, Number(key)])
    );

    const openEditModal = (note: Note) => {
        setModalMode("edit");
        setEditingNoteId(note.id);
        form.setFieldsValue({
            title: note.title,
            description: note.description,
            reminderDate: dayjs(note.reminderDate),
            status: numberToStatusMap[Number(note.status)],
            id: note.id,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        form.resetFields();
        setEditingNoteId(null);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const statusNumber = statusMap[values.status as keyof typeof statusMap] ?? -1;
            if (modalMode === "create") {
                values.reminderDate = values.reminderDate.format("YYYY-MM-DD");
                values.status = statusNumber;
                const response = await addNotes(values);
                const { status, message } = response.data;
                if (status) {
                    showNotification("Success", message, "success");
                    getStickyNotes();
                }
            } else {
                values.reminderDate = values.reminderDate.format("YYYY-MM-DD");
                values.status = statusNumber;
                const response = await addNotes({
                    id: values.id,
                    editing: true,
                    ...values,
                });
                const { status, message } = response.data;
                if (status) {
                    showNotification("Success", message, "success");
                    getStickyNotes();
                }
            }
            closeModal();
        } catch (error) {
            console.error("Validation failed:", error);
        }
        setLoading(false);
    };

    const handleDeleteNote = (id: number) => { };

    const resetToDefault = () => {
        setNotes([]);
    };

    const formatDisplayDate = (dateString: string): string => {
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    const NextArrow: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
        return (
            <Button
                type="text"
                shape="circle"
                icon={
                    <RightOutlined
                        style={{ width: "16px", height: "16px", color: "#595959" }}
                    />
                }
                onClick={onClick}
                style={{
                    position: "absolute",
                    right: "-30px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 1,
                }}
            />
        );
    };

    const PrevArrow: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
        return (
            <Button
                type="text"
                shape="circle"
                icon={
                    <LeftOutlined
                        style={{ width: "16px", height: "16px", color: "#595959" }}
                    />
                }
                onClick={onClick}
                style={{
                    position: "absolute",
                    left: "-30px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 1,
                }}
            />
        );
    };

    return (
        <>
            {/* Main Modal */}
            <Modal
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                footer={null}
                width="90vw"
                closable={false}
                style={{ maxWidth: "600px", top: "30px" }}
                styles={{
                    body: {
                        padding: 0,
                        background: "linear-gradient(135deg, #f9f9fb 0%, #f0f2f7 100%)",
                        borderRadius: "12px",
                        overflow: "hidden",
                    },
                }}
                loading={loading}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "12px 16px",
                        background: "transparent",
                        position: "relative",
                    }}
                >
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space size="middle">
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        background: "rgba(100, 100, 255, 0.1)",
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Target
                                        style={{ width: "20px", height: "20px", color: "#4a4aff" }}
                                    />
                                </div>
                                <div>
                                    <Title
                                        level={3}
                                        style={{
                                            color: "#1a1a1a",
                                            margin: 0,
                                            fontSize: "22px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Sticky Notes
                                    </Title>
                                    <Text
                                        style={{
                                            color: "#666",
                                            fontSize: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                    >
                                        <Sparkles
                                            style={{ width: "14px", height: "14px", color: "#666" }}
                                        />
                                        {notes.length} notes
                                    </Text>
                                </div>
                            </Space>
                        </Col>
                        <Col>
                            <Space size="small">
                                <Button
                                    type="text"
                                    shape="circle"
                                    icon={
                                        <RotateCcw
                                            style={{ width: "16px", height: "16px", color: "#666" }}
                                        />
                                    }
                                    onClick={resetToDefault}
                                />
                                <Button
                                    type="text"
                                    shape="circle"
                                    icon={
                                        <X
                                            style={{ width: "16px", height: "16px", color: "#666" }}
                                        />
                                    }
                                    onClick={() => setIsOpen(false)}
                                />
                            </Space>
                        </Col>
                    </Row>
                    <Row justify="end" style={{ marginTop: "12px" }}>
                        <Button
                            type="primary"
                            size="middle"
                            icon={<Plus style={{ width: "16px", height: "16px" }} />}
                            onClick={openCreateModal}
                            style={{
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                border: "none",
                                borderRadius: "8px",
                                padding: "0 16px",
                                height: "32px",
                                fontSize: "14px",
                                fontWeight: 500,
                                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                            }}
                        >
                            New Note
                        </Button>
                    </Row>
                </div>

                {/* Content */}
                <div
                    style={{
                        background: "transparent",
                        minHeight: "300px",
                        padding: "16px",
                    }}
                >
                    {notes.length === 0 ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: "200px",
                            }}
                        >
                            <Empty
                                image={
                                    <div
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                            background:
                                                "linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 16px",
                                        }}
                                    >
                                        <BookOpen
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                color: "#3b82f6",
                                            }}
                                        />
                                    </div>
                                }
                                description={
                                    <div style={{ textAlign: "center" }}>
                                        <Title
                                            level={4}
                                            style={{ color: "#6b7280", marginBottom: "8px" }}
                                        >
                                            No Notes Yet
                                        </Title>
                                        <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                                            Create a note to get organized!
                                        </Text>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        <Carousel
                            slidesToShow={2}
                            slidesToScroll={1}
                            dots={true}
                            infinite={notes.length > 2}
                            style={{ padding: "8px 0" }}
                            prevArrow={<PrevArrow />}
                            nextArrow={<NextArrow />}
                            arrows={true}
                        >
                            {notes.map((note) => (
                                <div key={note.id} style={{ padding: "0 6px" }}>
                                    <Tooltip
                                        title={`Status: ${numberToStatusMap[Number(note.status)] || ""}`}
                                        overlayInnerStyle={{
                                            backgroundColor:
                                                statusConfig[Number(note.status)]?.color || "#e5e7eb",
                                            color: "#fff", // optional: set text color to white for contrast
                                            fontWeight: 500,
                                            borderRadius: "6px",
                                            padding: "8px 12px",
                                        }}
                                    >
                                        <Card
                                            hoverable
                                            style={{
                                                width: "90%",
                                                height: "242px",
                                                borderRadius: "12px",
                                                border: `1px solid ${statusConfig[Number(note.status)]?.borderColor || "#e5e7eb"
                                                    }`,
                                                background:
                                                    statusConfig[Number(note.status)]?.bgColor || "#fff",
                                                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
                                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                            }}

                                            actions={[
                                                <Button
                                                    type="text"
                                                    icon={
                                                        <Edit3 style={{ width: "14px", height: "14px" }} />
                                                    }
                                                    onClick={() => openEditModal(note)}
                                                    style={{
                                                        color:
                                                            statusConfig[Number(note.status)]?.color || "#4a4aff",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    Edit
                                                </Button>,
                                                // <Button
                                                //     type="text"
                                                //     icon={
                                                //         <Trash2 style={{ width: "14px", height: "14px" }} />
                                                //     }
                                                //     onClick={() => handleDeleteNote(note.id)}
                                                //     style={{ color: "#ef4444", fontSize: "12px" }}
                                                // >
                                                //     Delete
                                                // </Button>,
                                            ]}
                                        >
                                            <div
                                                style={{
                                                    marginBottom: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                }}
                                            >
                                                <Badge
                                                    count={statusConfig[Number(note.status)]?.icon}
                                                    style={{
                                                        background:
                                                            statusConfig[Number(note.status)]?.borderColor || "#4a4aff",
                                                        borderRadius: "50%",
                                                        width: "32px",
                                                        height: "32px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                />
                                            </div>
                                            <Title
                                                level={5}
                                                style={{
                                                    color: "#1f2937",
                                                    marginBottom: "8px",
                                                    fontSize: "16px",
                                                    lineHeight: "1.3",
                                                    fontWeight: 600,
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {note.title}
                                            </Title>
                                            <Text
                                                style={{
                                                    color: "#6b7280",
                                                    fontSize: "12px",
                                                    lineHeight: "1.4",
                                                    display: "-webkit-box",
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {note.description}
                                            </Text>
                                            <Divider style={{ margin: "8px 0" }} />
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Space size={4}>
                                                    <Calendar
                                                        style={{
                                                            width: "14px",
                                                            height: "14px",
                                                            color: "#9ca3af",
                                                        }}
                                                    />
                                                    <Text style={{ color: "#9ca3af", fontSize: "11px" }}>
                                                        {formatDisplayDate(note.reminderDate)}
                                                    </Text>
                                                </Space>
                                                <Badge
                                                    text={note.status}
                                                    style={{
                                                        background:
                                                            statusConfig[Number(note.status)]?.color || "#4a4aff",
                                                        color: "white",
                                                        padding: "2px 8px",
                                                        borderRadius: "8px",
                                                        fontSize: "11px",
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </div>
                                        </Card>
                                    </Tooltip>
                                </div>
                            ))}
                        </Carousel>
                    )}
                </div>
            </Modal>

            {/* Create/Edit Modal */}
            <Modal
                open={showModal}
                onCancel={closeModal}
                footer={null}
                width={500}
                closable={false}
                style={{ top: "50px" }}
                styles={{
                    body: {
                        padding: 0,
                        borderRadius: "12px",
                        overflow: "hidden",
                    },
                }}
            // loading={loading}
            >
                <div
                    style={{
                        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                        padding: "16px",
                        color: "white",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: "25px",
                            height: "25px",
                            background: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 8px",
                        }}
                    >
                        {modalMode === "create" ? (
                            <Plus style={{ width: "20px", height: "20px", color: "white" }} />
                        ) : (
                            <Edit3
                                style={{ width: "20px", height: "20px", color: "white" }}
                            />
                        )}
                    </div>
                    <Title
                        level={4}
                        style={{
                            color: "white",
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: 600,
                        }}
                    >
                        {modalMode === "create" ? "New Note" : "Edit Note"}
                    </Title>
                    <Text
                        style={{
                            color: "rgba(255, 255, 255, 0.8)",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            marginTop: "4px",
                        }}
                    >
                        <Heart style={{ width: "12px", height: "12px" }} />
                        {modalMode === "create" ? "Get organized" : "Update note"}
                    </Text>
                </div>
                <div
                    style={{
                        padding: "16px",
                        background: "white",
                        minHeight: "300px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            reminderDate: dayjs(),
                            status: "Yet to Start",
                        }}
                        style={{ width: "100%", flex: 1 }}
                        onFinish={handleSave}
                    >
                        <Form.Item
                            label={
                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "#1f2937",
                                    }}
                                >
                                    Title
                                </span>
                            }
                            name="title"
                            rules={[{ required: true, message: "Enter a title" }]}
                        >
                            <Input
                                placeholder="Note title..."
                                size="middle"
                                style={{
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    fontSize: "14px",
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            label={
                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "#1f2937",
                                    }}
                                >
                                    Description
                                </span>
                            }
                            name="description"
                        >
                            <TextArea
                                placeholder="Note details..."
                                rows={3}
                                style={{
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    fontSize: "14px",
                                    resize: "none",
                                }}
                            />
                        </Form.Item>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item
                                    label={
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 500,
                                                color: "#1f2937",
                                            }}
                                        >
                                            Reminder Date
                                        </span>
                                    }
                                    name="reminderDate"
                                    rules={[{ required: true, message: "Select a date" }]}
                                >
                                    <DatePicker
                                        style={{
                                            width: "100%",
                                            borderRadius: "8px",
                                            border: "1px solid #e5e7eb",
                                            fontSize: "14px",
                                        }}
                                        size="middle"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 500,
                                                color: "#1f2937",
                                            }}
                                        >
                                            Status
                                        </span>
                                    }
                                    name="status"
                                >
                                    <Select
                                        size="middle"
                                        style={{
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                        }}
                                    >
                                        <Option value="Yet to Start">Yet to Start</Option>
                                        <Option value="In Progress">In Progress</Option>
                                        <Option value="Done">Done</Option>
                                        <Option value="Due">Due</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="id" hidden>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12} style={{ marginTop: "16px" }}>
                            <Col span={12}>
                                <Button
                                    size="middle"
                                    block
                                    onClick={closeModal}
                                    style={{
                                        borderRadius: "8px",
                                        height: "36px",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        border: "1px solid #e5e7eb",
                                        color: "#374151",
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    size="middle"
                                    block
                                    onClick={handleSave}
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                        border: "none",
                                        borderRadius: "8px",
                                        height: "36px",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                                    }}
                                    loading={loading}
                                >
                                    {modalMode === "create" ? "Create" : "Update"}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Modal>
        </>
    );
};

export default StickyNotes;
