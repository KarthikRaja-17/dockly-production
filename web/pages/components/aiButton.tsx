// "use client";
// import React from "react";
// import { Button } from "antd";

// const AIButton = ({
//   onClick,
//   isOpen,
// }: {
//   onClick: () => void;
//   isOpen: boolean;
// }) => {
//   const baseStyle = {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     border: "none",
//     borderRadius: "50px",
//     padding: "12px 20px",
//     height: "40px",
//     fontSize: "16px",
//     fontWeight: "bold",
//     transition: "all 0.3s ease-in-out",
//     cursor: "pointer",
//     overflow: "hidden",
//     whiteSpace: "nowrap",
//   };

//   const buttonStyle = isOpen
//     ? {
//         ...baseStyle,
//         background: "linear-gradient(to right,rgb(234, 11, 29), #04829E)",
//         color: "white",
//       }
//     : {
//         ...baseStyle,
//         background: "linear-gradient(to right, #04829E, #6C63FF)",
//         color: "white",
//       };

//   const iconStyle = {
//     display: "inline-block",
//     marginRight: 6,
//     transition: "transform 0.3s ease-in-out",
//   };

//   return (
//     <Button style={buttonStyle} onClick={onClick}>
//       <span style={iconStyle}>{isOpen ? "❌" : "✨"}</span>
//       <span>{isOpen ? "Close Smart Hub" : "Dockly Smart Hub"}</span>
//     </Button>
//   );
// };

// export default AIButton;

'use client';

const AIButton = () => {
  return (
    <div>
      <h1>AI button</h1>
      {/* You can put your BankPage component here if needed */}
      {/* <BankPage /> */}
    </div>
  );
};
export default AIButton;
