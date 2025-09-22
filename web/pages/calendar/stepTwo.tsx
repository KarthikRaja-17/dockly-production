// import { Typography, Button } from "antd";

// const { Title, Paragraph, Text } = Typography;

// const CalendarStepTwo = (props: any) => {
//   const {
//     selectedCalendars = [],
//     setSelectedOptions = () => { },
//     selectedOptions = {},
//     setStep = () => { },
//   } = props || {};
//   const toggleOption = (option: keyof typeof selectedOptions) => {
//     setSelectedOptions((prev: any) => ({
//       ...prev,
//       [option]: !prev[option],
//     }));
//   };
//   return (
//     <div
//       style={{
//         padding: "40px",
//         minHeight: "100vh",
//         backgroundColor: "#f9fafb",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "flex-start",
//       }}
//     >
//       <div
//         style={{
//           width: "100%",
//           maxWidth: "960px",
//           borderRadius: "16px",
//           boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
//           padding: "32px",
//           backgroundColor: "#ffffff",
//         }}
//       >
//         <Title level={3} style={{ color: "#2563eb", marginBottom: "8px" }}>
//           Import Options
//         </Title>
//         <Paragraph
//           style={{ marginBottom: "0px", fontSize: "16px", color: "#374151" }}
//         >
//           Select import options for {(selectedCalendars || []).join(", ")}.
//         </Paragraph>
//         <Text
//           style={{
//             fontSize: "14px",
//             color: "#6b7280",
//             display: "block",
//             marginBottom: "24px",
//           }}
//         >
//           Step 2 of 3
//         </Text>

//         {[
//           {
//             key: "calendar",
//             label: "Calendar",
//             desc: "Appointments, meetings, and events; Tasks with deadlines",
//           },
//           {
//             key: "drive",
//             label: "Drive",
//             desc: "View, upload, and manage text files and PDFs; Access files shared with you",
//           },
//           {
//             key: "photos",
//             label: "Photos",
//             desc: "Browse and manage your photo albums; Access your marked favorite photos",
//           },
//           {
//             key: "health",
//             label: "Health",
//             desc: "Track workouts, steps, and movement trends; Monitor your sleep patterns and duration",
//           }
//         ].map(({ key, label, desc }) => (
//           <div
//             key={key}
//             onClick={() => toggleOption(key as keyof typeof selectedOptions)}
//             style={{
//               padding: "16px",
//               borderRadius: "12px",
//               border: `1px solid ${selectedOptions[key as keyof typeof selectedOptions]
//                 ? "#2563eb"
//                 : "#d1d5db"
//                 }`,
//               backgroundColor: selectedOptions[
//                 key as keyof typeof selectedOptions
//               ]
//                 ? "#eff6ff"
//                 : "#ffffff",
//               marginBottom: "12px",
//               cursor: "pointer",
//               transition: "all 0.2s",
//             }}
//           >
//             <div
//               style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}
//             >
//               {label}
//             </div>
//             <div style={{ fontSize: "12px", color: "#6b7280" }}>{desc}</div>
//           </div>
//         ))}

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginTop: "32px",
//           }}
//         >
//           <Button
//             onClick={() => setStep(1)}
//             style={{
//               height: "40px",
//               padding: "0 24px",
//               borderRadius: "8px",
//               fontWeight: "bold",
//               border: "1px solid #d1d5db",
//               backgroundColor: "#ffffff",
//               color: "#374151",
//             }}
//           >
//             Back
//           </Button>
//           <Button
//             onClick={() => setStep(3)}
//             style={{
//               height: "40px",
//               padding: "0 24px",
//               backgroundColor: "#2563eb",
//               borderColor: "#2563eb",
//               color: "#ffffff",
//               fontWeight: "bold",
//               borderRadius: "8px",
//             }}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default CalendarStepTwo;

const CalendarStepTwo = () => {
  return (
    <div>
      <h1>Calendar Step Two</h1>

    </div>
  );
}
export default CalendarStepTwo;
