// "use client";
// import React from "react";
// import { Card, Typography, Alert } from "antd";
// import { LockOutlined } from "@ant-design/icons";
// import { QuilttButton, ConnectorSDKCallbackMetadata } from "@quiltt/react";
// import { PRIMARY_COLOR } from "../../app/comman";

// const { Title, Paragraph, Text } = Typography;

// interface ConnectAccountsProps {
//   onSuccess: (metadata: ConnectorSDKCallbackMetadata) => void;
// }
// // connectaccounts.tsx
// const ConnectAccounts: React.FC<ConnectAccountsProps> = ({ onSuccess }) => {
//   const handleSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
//     // Store Quiltt connection ID in localStorage
//     localStorage.setItem("quilttId", metadata.connectionId || "");
//     onSuccess(metadata);
//   };

//   return (
//     <Card style={{ borderRadius: 12 }}>
//       <Title level={4}>Connect Your Financial Accounts</Title>
//       <Paragraph>
//         Search for your bank or financial institution to securely connect your accounts.
//       </Paragraph>
//       <div style={{ marginTop: 30 }}>
//         <Alert
//           message={
//             <span>
//               <LockOutlined style={{ marginRight: 8 }} />
//               <Text strong>Your data is secure</Text>
//             </span>
//           }
//           description="We use bank-level encryption and never store your credentials. You can disconnect your accounts at any time."
//           type="info"
//           showIcon
//           style={{ backgroundColor: "#f0faff", borderRadius: 8 }}
//         />
//       </div>
//       <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
//         <QuilttButton
//           connectorId="lc9h19r4no"
//           onExitSuccess={handleSuccess}
//           style={{
//             marginTop: 20,
//             borderRadius: 10,
//             background: PRIMARY_COLOR,
//             color: "#fff",
//             padding: "20px",
//             cursor: "pointer",
//           }}
//         >
//           Connect Account
//         </QuilttButton>
//       </div>
//     </Card>
//   );
// };

// export default ConnectAccounts;

"use client";
import React from "react";
import { Card, Typography, Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { QuilttButton, ConnectorSDKCallbackMetadata } from "@quiltt/react";
import { PRIMARY_COLOR } from "../../app/comman";

const { Title, Paragraph, Text } = Typography;

interface ConnectAccountsProps {
  onSuccess: (metadata: ConnectorSDKCallbackMetadata) => void;
}
// connectaccounts.tsx
const ConnectAccounts: React.FC<ConnectAccountsProps> = ({ onSuccess }) => {
  const handleSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
    // Store Quiltt connection ID in localStorage
    localStorage.setItem("quilttId", metadata.connectionId || "");
    onSuccess(metadata);
  };

  return (
    <Card style={{ borderRadius: 12 }}>
      <Title level={4}>Connect Your Financial Accounts</Title>
      <Paragraph>
        Search for your bank or financial institution to securely connect your accounts.
      </Paragraph>
      <div style={{ marginTop: 30 }}>
        <Alert
          message={
            <span>
              <LockOutlined style={{ marginRight: 8 }} />
              <Text strong>Your data is secure</Text>
            </span>
          }
          description="We use bank-level encryption and never store your credentials. You can disconnect your accounts at any time."
          type="info"
          showIcon
          style={{ backgroundColor: "#f0faff", borderRadius: 8 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <QuilttButton
          connectorId="lc9h19r4no"
          onExitSuccess={handleSuccess}
          style={{
            marginTop: 20,
            borderRadius: 10,
            background: PRIMARY_COLOR,
            color: "#fff",
            padding: "20px",
            cursor: "pointer",
            border: "1px solid transparent",
            // transition: "border-color 0.3s",
          }}
        >
          Connect Account
        </QuilttButton>
      </div>
    </Card>
  );
};

export default ConnectAccounts;

