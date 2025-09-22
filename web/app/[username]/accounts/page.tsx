// // 'use client';
// // import React, { useEffect, useState } from 'react';
// // import { Steps, Button, Card, Checkbox, Select, Input, Space, Typography, Divider } from 'antd';
// // import { CheckCircleOutlined, CloudOutlined, UsergroupAddOutlined, EditOutlined } from '@ant-design/icons';
// // import { useRouter } from 'next/navigation';

// // const { Step } = Steps;
// // const { Option } = Select;
// // const { Text, Title } = Typography;

// // interface StepConfig {
// //   title: string;
// //   content: React.ReactNode;
// // }

// // interface Account {
// //   name: string;
// //   icon: string;
// // }

// // const DocklyWizard: React.FC = () => {
// //   const [currentStep, setCurrentStep] = useState<number>(0);
// //   const [selectedAccounts, setSelectedAccounts] = useState<string[]>([
// //     'Chase Bank', 'Gmail', 'Amazon', 'Netflix', 'Spotify', 'Instagram', 'LinkedIn', 'Dropbox',
// //   ]);
// //   const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);
// //   const [selectedOption, setSelectedOption] = useState<string | null>(null);
// //   const [selectedDiscoveryOption, setSelectedDiscoveryOption] = useState<string | null>(null);
// //   const [selectedManagerOption, setSelectedManagerOption] = useState<string | null>(null);

// //   const handleStartSelection = (option: string) => {
// //     setSelectedOption(option);
// //   };

// //   const handleDiscoverySelection = (option: string) => {
// //     setSelectedDiscoveryOption(option);
// //   };

// //   const handleManagerSelection = (option: string) => {
// //     setSelectedManagerOption(option);
// //   };

// //   const router = useRouter();

// //   useEffect(() => {
// //     const username = localStorage.getItem("username") || "";
// //     if (localStorage.getItem('account') === null) {
// //       router.push(`/${username}/accounts/setup`);
// //     }
// //   }, []);

// //   const handleReturnToDashboard = () => {
// //     router.push(`/${localStorage.getItem("username")}/finalboards/accounts`);
// //   }

// //   const accounts: Account[] = [
// //     { name: 'Chase Bank', icon: '/manager/chase.png' },
// //     { name: 'Gmail', icon: '/manager/gmail.png' },
// //     { name: 'Amazon', icon: '/manager/amazon.png' },
// //     { name: 'Netflix', icon: '/manager/netflix.jpg' },
// //     { name: 'Spotify', icon: '/manager/spotify.jpg' },
// //     { name: 'Instagram', icon: '/manager/instagram.jpg' },
// //     { name: 'LinkedIn', icon: '/manager/linkdin.jpg' },
// //     { name: 'Dropbox', icon: '/manager/dropbox.jpg' },
// //     { name: 'State Farm', icon: '/manager/statefarm.jpg' },
// //     { name: 'Ameren', icon: '/manager/ameren.jpg' },
// //     { name: 'Water Utility', icon: '/manager/water.jpg' },
// //     { name: 'Xfinity', icon: '/manager/xfinity.jpg' },
// //     { name: 'Santander', icon: '/manager/santander.jpg' },
// //     { name: 'Waste Mgmt', icon: '/manager/waste.svg' },
// //     { name: 'Google Drive', icon: '/manager/drive.jpg' },
// //     { name: 'Facebook', icon: '/manager/facebook.jpg' },
// //   ];

// //   const steps: StepConfig[] = [
// //     {
// //       title: 'Start',
// //       content: (
// //         <div style={{ textAlign: 'center', padding: '30px' }}>
// //           <Title level={2} style={{ marginBottom: '20px' }}>Welcome to Dockly</Title>
// //           <Text style={{ fontSize: '16px', color: '#666' }}>
// //             Dockly helps you centralize access to all your accounts and documents in one secure place.
// //           </Text>
// //           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '40px' }}>
// //             {[
// //               { title: 'Quick Setup', description: 'Get started with automatic account discovery', icon: '⚡' },
// //               { title: 'Manual Setup', description: 'Add accounts one by one manually', icon: '📝' },
// //               { title: 'Import Data', description: 'Import from password manager or CSV', icon: '📊' },
// //               { title: 'From Template', description: 'Setup based on pre-made templates', icon: '📋' },
// //             ].map((option) => (
// //               <Card
// //                 key={option.title}
// //                 hoverable
// //                 onClick={() => handleStartSelection(option.title)}
// //                 style={{
// //                   width: '400px',
// //                   borderRadius: '12px',
// //                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
// //                   padding: '20px',
// //                   textAlign: 'left',
// //                   cursor: 'pointer',
// //                   border: selectedOption === option.title ? '2px solid #1890ff' : '1px solid #e8e8e8',
// //                   backgroundColor: selectedOption === option.title ? '#e6f7ff' : '#fff',
// //                   transition: 'all 0.3s',
// //                 }}
// //               >
// //                 <div style={{ display: 'flex', alignItems: 'center' }}>
// //                   {option.icon.startsWith('/') ? (
// //                     <img src={option.icon} alt={option.title} style={{ width: '28px', marginRight: '20px' }} />
// //                   ) : (
// //                     <span style={{ fontSize: '28px', marginRight: '20px' }}>{option.icon}</span>
// //                   )}
// //                   <div>
// //                     <Title level={5} style={{ margin: 0 }}>{option.title}</Title>
// //                     <Text style={{ color: '#888' }}>{option.description}</Text>
// //                   </div>
// //                 </div>
// //               </Card>
// //             ))}
// //           </div>
// //           <div
// //             style={{
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               marginTop: '40px',
// //               marginBottom: '20px',
// //               backgroundColor: '#e6f7e6',
// //               borderRadius: '8px',
// //               padding: '10px 20px',
// //               maxWidth: '600px',
// //               marginLeft: 'auto',
// //               marginRight: 'auto',
// //             }}
// //           >
// //             <span style={{ fontSize: '28px', marginRight: '20px' }}>🔒</span>
// //             <Text style={{ fontSize: '14px', color: '#666' }}>
// //               Your data is secure. Dockly uses bank-level encryption and never stores your passwords.
// //             </Text>
// //           </div>
// //           <Button
// //             type="primary"
// //             size="large"
// //             disabled={!selectedOption}
// //             style={{
// //               padding: '10px 40px',
// //               borderRadius: '8px',
// //               marginTop: '20px',
// //               opacity: !selectedOption ? 0.5 : 1,
// //               transition: 'opacity 0.3s',
// //             }}
// //             onClick={() => setCurrentStep(1)}
// //           >
// //             Continue
// //           </Button>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: 'Discovery',
// //       content: (
// //         <div style={{ textAlign: 'center', padding: '30px' }}>
// //           <Title level={2} style={{ marginBottom: '20px' }}>Discovering your accounts</Title>
// //           <Text style={{ fontSize: '16px', color: '#666' }}>
// //             Select which sources Dockly should use to find your accounts.
// //           </Text>
// //           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '40px' }}>
// //             {[
// //               { title: 'Browser History', description: 'Find accounts from sites you visit', icon: '🌐' },
// //               { title: 'Password Manager', description: 'Import from saved passwords', icon: '🔑' },
// //               { title: 'Email Scan', description: 'Find accounts from email receipts', icon: '📧' },
// //               { title: 'Mobile Apps', description: 'Sync with apps on your phone', icon: '📱' },
// //             ].map((option) => (
// //               <Card
// //                 key={option.title}
// //                 hoverable
// //                 onClick={() => handleDiscoverySelection(option.title)}
// //                 style={{
// //                   width: '400px',
// //                   borderRadius: '12px',
// //                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
// //                   padding: '20px',
// //                   textAlign: 'left',
// //                   cursor: 'pointer',
// //                   border: selectedDiscoveryOption === option.title ? '2px solid #1890ff' : '1px solid #e8e8e8',
// //                   backgroundColor: selectedDiscoveryOption === option.title ? '#e6f7ff' : '#fff',
// //                   transition: 'all 0.3s',
// //                 }}
// //               >
// //                 <div style={{ display: 'flex', alignItems: 'center' }}>
// //                   <span style={{ fontSize: '28px', marginRight: '20px' }}>{option.icon}</span>
// //                   <div>
// //                     <Title level={5} style={{ margin: 0 }}>{option.title}</Title>
// //                     <Text style={{ color: '#888' }}>{option.description}</Text>
// //                   </div>
// //                 </div>
// //               </Card>
// //             ))}
// //           </div>
// //           <div
// //             style={{
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               marginTop: '40px',
// //               marginBottom: '20px',
// //               backgroundColor: '#e6f7e6',
// //               borderRadius: '8px',
// //               padding: '10px 20px',
// //               maxWidth: '600px',
// //               marginLeft: 'auto',
// //               marginRight: 'auto',
// //             }}
// //           >
// //             <span style={{ fontSize: '28px', marginRight: '20px' }}>ℹ️</span>
// //             <Text style={{ fontSize: '14px', color: '#666' }}>
// //               How it works: Dockly scans for domains you regularly visit to suggest accounts but never
// //               accesses your actual browsing history or content.
// //             </Text>
// //           </div>
// //           <div style={{ marginTop: '20px' }}>
// //             <Button
// //               style={{ marginRight: '8px' }}
// //               onClick={() => {
// //                 setCurrentStep(0);
// //                 setSelectedDiscoveryOption(null);
// //               }}
// //             >
// //               Back
// //             </Button>
// //             <Button
// //               type="primary"
// //               size="large"
// //               disabled={!selectedDiscoveryOption}
// //               style={{
// //                 padding: '10px 40px',
// //                 borderRadius: '8px',
// //                 opacity: !selectedDiscoveryOption ? 0.5 : 1,
// //                 transition: 'opacity 0.3s',
// //               }}
// //               onClick={() => setCurrentStep(2)}
// //             >
// //               Continue
// //             </Button>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: 'Manager',
// //       content: (
// //         <div style={{ textAlign: 'center', padding: '20px' }}>
// //           <Title level={3} style={{ marginBottom: '20px' }}>Connect your password manager</Title>
// //           <Text style={{ fontSize: '16px', color: '#666' }}>
// //             Dockly works with your existing password manager for secure login to your accounts.
// //           </Text>
// //           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '40px' }}>
// //             {[
// //               { icon: '/manager/1password.png', title: '1Password', desc: 'Browser extension' },
// //               { icon: '/manager/google.png', title: 'Google Password', desc: 'Chrome built-in' },
// //               { icon: '/manager/keeper.png', title: 'Keeper', desc: 'Browser extension' },
// //               { icon: '/manager/lastpass.png', title: 'LastPass', desc: 'Browser extension' },
// //               { icon: '/manager/bitwarden.jpg', title: 'Bitwarden', desc: 'Browser extension' },
// //               { icon: '/manager/edge.jpg', title: 'Edge Passwords', desc: 'Edge built-in' },
// //             ].map((option) => (
// //               <Card
// //                 key={option.title}
// //                 hoverable
// //                 onClick={() => handleManagerSelection(option.title)}
// //                 style={{
// //                   width: '300px',
// //                   borderRadius: '12px',
// //                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
// //                   padding: '20px',
// //                   textAlign: 'left',
// //                   cursor: 'pointer',
// //                   border: selectedManagerOption === option.title ? '2px solid #1890ff' : '1px solid #e8e8e8',
// //                   backgroundColor: selectedManagerOption === option.title ? '#e6f7ff' : '#fff',
// //                   transition: 'all 0.3s',
// //                 }}
// //               >
// //                 <div style={{ display: 'flex', alignItems: 'center' }}>
// //                   <img
// //                     src={option.icon}
// //                     alt={option.title}
// //                     style={{ width: '50px', height: '50px', marginRight: '20px' }}
// //                   />
// //                   <div>
// //                     <Title level={5} style={{ margin: 0 }}>{option.title}</Title>
// //                     <Text style={{ color: '#888' }}>{option.desc}</Text>
// //                   </div>
// //                 </div>
// //               </Card>
// //             ))}
// //           </div>
// //           <div
// //             style={{
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               marginTop: '40px',
// //               marginBottom: '20px',
// //               backgroundColor: '#e6f7e6',
// //               borderRadius: '8px',
// //               padding: '10px 20px',
// //               maxWidth: '600px',
// //               marginLeft: 'auto',
// //               marginRight: 'auto',
// //             }}
// //           >
// //             <span style={{ fontSize: '28px', marginRight: '20px' }}>🔒</span>
// //             <Text style={{ fontSize: '14px', color: '#666' }}>
// //               Zero-knowledge design: Dockly never stores or handles your actual passwords, it simply
// //               connects to your existing password manager.
// //             </Text>
// //           </div>
// //           <div style={{ marginTop: '20px' }}>
// //             <Button
// //               style={{ marginRight: '8px' }}
// //               onClick={() => {
// //                 setCurrentStep(1);
// //                 setSelectedManagerOption(null);
// //               }}
// //             >
// //               Back
// //             </Button>
// //             <Button
// //               type="primary"
// //               size="large"
// //               disabled={!selectedManagerOption}
// //               style={{
// //                 padding: '10px 40px',
// //                 borderRadius: '8px',
// //                 opacity: !selectedManagerOption ? 0.5 : 1,
// //                 transition: 'opacity 0.3s',
// //               }}
// //               onClick={() => setCurrentStep(3)}
// //             >
// //               Continue
// //             </Button>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: 'Selection',
// //       content: (
// //         <div style={{ padding: '20px' }}>
// //           <Title level={2}>We found 47 potential accounts</Title>
// //           <Text style={{ display: 'block', marginBottom: '20px' }}>
// //             Select the accounts you'd like to add to Dockly. These were detected based on your browser
// //             history.
// //           </Text>
// //           <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
// //             <Text style={{ marginRight: '10px', fontSize: '24px' }}>🔒</Text>
// //             <Text>
// //               Your privacy is protected. Dockly never stores your passwords - connections are managed
// //               securely through your password manager.
// //             </Text>
// //           </div>
// //           <Divider orientation="left">Frequently Visited (15)</Divider>
// //           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
// //             {accounts.slice(0, 8).map((account) => (
// //               <Checkbox
// //                 key={account.name}
// //                 checked={selectedAccounts.includes(account.name)}
// //                 onChange={(e) => {
// //                   if (e.target.checked) {
// //                     setSelectedAccounts([...selectedAccounts, account.name]);
// //                   } else {
// //                     setSelectedAccounts(selectedAccounts.filter((a) => a !== account.name));
// //                   }
// //                 }}
// //                 style={{ width: '150px', display: 'flex', alignItems: 'center' }}
// //               >
// //                 <img
// //                   src={account.icon}
// //                   alt={account.name}
// //                   style={{ width: '50px', marginRight: '8px' }}
// //                 />
// //                 <div>
// //                   <Title level={5} style={{ margin: 0 }}>{account.name}</Title>
// //                 </div>
// //               </Checkbox>
// //             ))}
// //           </div>
// //           <Divider orientation="left">Additional Sites (32)</Divider>
// //           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
// //             {accounts.slice(8).map((account) => (
// //               <Checkbox
// //                 key={account.name}
// //                 checked={selectedAccounts.includes(account.name)}
// //                 onChange={(e) => {
// //                   if (e.target.checked) {
// //                     setSelectedAccounts([...selectedAccounts, account.name]);
// //                   } else {
// //                     setSelectedAccounts(selectedAccounts.filter((a) => a !== account.name));
// //                   }
// //                 }}
// //                 style={{ width: '350px', display: 'flex', alignItems: 'center' }}
// //               >
// //                 <img
// //                   src={account.icon}
// //                   alt={account.name}
// //                   style={{ width: '50px', marginRight: '8px' }}
// //                 />
// //                 <div>
// //                   <Title level={5} style={{ margin: 0 }}>{account.name}</Title>
// //                 </div>
// //               </Checkbox>
// //             ))}
// //           </div>
// //           <div style={{ marginTop: '20px' }}>
// //             <Button
// //               onClick={() => setSelectedAccounts(accounts.map((account) => account.name))}
// //               style={{ marginRight: '10px' }}
// //             >
// //               Select All
// //             </Button>
// //             <Button onClick={() => setSelectedAccounts([])} style={{ marginRight: '10px' }}>
// //               Select None
// //             </Button>
// //             <Select defaultValue="Filter" style={{ width: '120px' }}>
// //               <Option value="Filter">Filter</Option>
// //             </Select>
// //           </div>
// //           <div style={{ marginTop: '20px', textAlign: 'right' }}>
// //             <Button style={{ marginRight: '8px' }} onClick={() => setCurrentStep(2)}>
// //               Back
// //             </Button>
// //             <Button type="primary" onClick={() => setCurrentStep(4)}>
// //               Add Selected ({selectedAccounts.length})
// //             </Button>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: 'Details',
// //       content: (
// //         <div style={{ padding: '20px' }}>
// //           <Title level={2}>Organizing your accounts ({currentAccountIndex + 1}/{selectedAccounts.length})</Title>
// //           <Text style={{ display: 'block', marginBottom: '20px' }}>
// //             Let's categorize your accounts to keep your dashboard organized.
// //           </Text>
// //           <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
// //             <Space direction="vertical" style={{ width: '100%' }}>
// //               <div style={{ display: 'flex', alignItems: 'center' }}>
// //                 <img
// //                   src={accounts.find((account) => account.name === selectedAccounts[currentAccountIndex])?.icon || '/manager/default.png'}
// //                   alt={selectedAccounts[currentAccountIndex]}
// //                   style={{ width: '50px', height: '50px', marginRight: '10px' }}
// //                 />
// //                 <Text strong>{selectedAccounts[currentAccountIndex]}</Text>
// //               </div>
// //               <div>
// //                 <Text>Category</Text>
// //                 <Select defaultValue="Financial" style={{ width: '100%', marginTop: '5px' }}>
// //                   {[
// //                     'Financial', 'Shopping', 'Entertainment', 'Social', 'Work', 'Travel', 'Utilities', 'Custom...',
// //                   ].map((category) => (
// //                     <Option key={category} value={category}>
// //                       {category}
// //                     </Option>
// //                   ))}
// //                 </Select>
// //               </div>
// //               <div>
// //                 <Text>Tags (optional)</Text>
// //                 <div style={{ marginTop: '5px' }}>
// //                   <Button size="small" style={{ marginRight: '5px' }}>
// //                     banking ×
// //                   </Button>
// //                   <Button size="small">personal ×</Button>
// //                 </div>
// //               </div>
// //               <div>
// //                 <Text>Notes (optional)</Text>
// //                 <Input.TextArea
// //                   defaultValue="Primary checking and savings accounts"
// //                   style={{ marginTop: '5px' }}
// //                 />
// //               </div>
// //               <div>
// //                 <Text>Board Assignment</Text>
// //                 <Select defaultValue="Home" style={{ width: '100%', marginTop: '5px' }}>
// //                   {['Home', 'Finance', 'Family Hub'].map((board) => (
// //                     <Option key={board} value={board}>
// //                       {board}
// //                     </Option>
// //                   ))}
// //                 </Select>
// //               </div>
// //             </Space>
// //           </Card>
// //           <div style={{ marginTop: '20px', textAlign: 'right' }}>
// //             <Button style={{ marginRight: '8px' }} onClick={() => setCurrentStep(3)}>
// //               Back
// //             </Button>
// //             <Button
// //               style={{ marginRight: '8px' }}
// //               onClick={() => {
// //                 if (currentAccountIndex < selectedAccounts.length - 1) {
// //                   setCurrentAccountIndex(currentAccountIndex + 1);
// //                 } else {
// //                   setCurrentStep(5);
// //                 }
// //               }}
// //             >
// //               Skip
// //             </Button>
// //             <Button
// //               type="primary"
// //               onClick={() => {
// //                 if (currentAccountIndex < selectedAccounts.length - 1) {
// //                   setCurrentAccountIndex(currentAccountIndex + 1);
// //                 } else {
// //                   setCurrentStep(5);
// //                 }
// //               }}
// //             >
// //               Save & Next
// //             </Button>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: 'Verification',
// //       content: (
// //         <div style={{ textAlign: 'center', padding: '20px' }}>
// //           <Title level={2}>Testing connections</Title>
// //           <Text style={{ display: 'block', marginBottom: '20px' }}>
// //             Let's make sure Dockly can help you log in seamlessly.
// //           </Text>
// //           <Card style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
// //             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
// //               <Text style={{ marginRight: '10px', fontSize: '30px' }}>🔐</Text>
// //               <Text strong>Test account access with {selectedAccounts[currentAccountIndex]}</Text>
// //             </div>
// //             <Text style={{ display: 'block', marginBottom: '20px' }}>
// //               This helps ensure smooth connections when using Dockly.
// //             </Text>
// //             <div style={{ marginLeft: '20px' }}>
// //               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
// //                 <Text style={{ marginRight: '10px', fontSize: '20px' }}>1</Text>
// //                 <Text>We'll open {selectedAccounts[currentAccountIndex]} in a new tab</Text>
// //               </div>
// //               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
// //                 <Text style={{ marginRight: '10px', fontSize: '20px' }}>2</Text>
// //                 <Text>Your password manager will offer to fill credentials</Text>
// //               </div>
// //               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
// //                 <Text style={{ marginRight: '10px', fontSize: '20px' }}>3</Text>
// //                 <Text>Return here after successful login</Text>
// //               </div>
// //             </div>
// //             <Button type="primary" style={{ marginTop: '20px' }}>
// //               Test Connection
// //             </Button>
// //           </Card>
// //           <div style={{ marginTop: '20px', textAlign: 'right' }}>
// //             <Button style={{ marginRight: '8px' }} onClick={() => setCurrentStep(4)}>
// //               Back
// //             </Button>
// //             <Button
// //               style={{ marginRight: '8px' }}
// //               onClick={() => {
// //                 if (currentAccountIndex < selectedAccounts.length - 1) {
// //                   setCurrentAccountIndex(currentAccountIndex + 1);
// //                 } else {
// //                   setCurrentStep(6);
// //                 }
// //               }}
// //             >
// //               Skip Test
// //             </Button>
// //             <Button
// //               type="primary"
// //               onClick={() => {
// //                 if (currentAccountIndex < selectedAccounts.length - 1) {
// //                   setCurrentAccountIndex(currentAccountIndex + 1);
// //                 } else {
// //                   setCurrentStep(6);
// //                 }
// //               }}
// //             >
// //               Next Account
// //             </Button>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: 'Complete',
// //       content: (
// //         <div style={{ textAlign: 'center', padding: '20px' }}>
// //           <Title level={2}>
// //             <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '10px' }} />
// //             Accounts successfully connected!
// //           </Title>
// //           <Text style={{ display: 'block', marginBottom: '20px' }}>
// //             {selectedAccounts.length} accounts are now part of your Dockly dashboard. You can easily add more accounts anytime
// //             from your dashboard.
// //           </Text>
// //           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
// //             {[
// //               { icon: <CloudOutlined />, title: 'Connect cloud storage' },
// //               { icon: <UsergroupAddOutlined />, title: 'Set up family sharing' },
// //               { icon: <EditOutlined />, title: 'Customize your boards' },
// //             ].map((option, index) => (
// //               <Card
// //                 key={index}
// //                 hoverable
// //                 style={{
// //                   width: '200px',
// //                   textAlign: 'center',
// //                   border: '1px solid #e8e8e8',
// //                   borderRadius: '8px',
// //                   padding: '10px',
// //                 }}
// //               >
// //                 <div style={{ fontSize: '30px', marginBottom: '10px' }}>{option.icon}</div>
// //                 <Text strong>{option.title}</Text>
// //               </Card>
// //             ))}
// //           </div>
// //           <Button type="primary" style={{ marginTop: '20px' }} onClick={handleReturnToDashboard}>
// //             Return to Dashboard
// //           </Button>
// //         </div>
// //       ),
// //     },
// //   ];

// //   return (
// //     <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
// //       <div style={{ marginBottom: '20px' }}>
// //         <Steps current={currentStep}>
// //           {steps.map((item) => (
// //             <Step key={item.title} title={item.title} />
// //           ))}
// //         </Steps>
// //       </div>
// //       <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', minHeight: '400px' }}>
// //         {steps[currentStep].content}
// //       </div>
// //     </div>
// //   );
// // };

// // export default DocklyWizard;

// 'use client';

// import React, { useState } from 'react';
// import { Typography, Card, Button } from 'antd';
// import { motion } from 'framer-motion';
// import CalendarStepOne from '../../../pages/calendar/stepOne';
// import CalendarStepTwo from '../../../pages/calendar/stepTwo';
// import CalendarStepThree from '../../../pages/calendar/stepThree';

// const { Title, Text } = Typography;

// const IntegrationSteps = () => {
//   const [step, setStep] = useState(1);
//   const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
//   const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
//   const [connectedCalendars, setConnectedCalendars] = useState<string[]>([]);

//   const handleNext = () => {
//     if (step < 3) {
//       setStep(step + 1);
//     } else {
//       window.location.href = 'https://accounts.google.com';
//     }
//   };

//   return (
//     <div style={{ textAlign: 'center', padding: '30px', maxWidth: 1200, margin: '0 auto', marginTop: 40 }}>
//       <motion.div
//         key={step}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -20 }}
//         transition={{ duration: 0.4 }}
//       >
//         {step === 1 && (
//           <>
//             <CalendarStepOne
//               setStep={setStep}
//               selectedCalendars={selectedCalendars}
//               setSelectedCalendars={setSelectedCalendars}
//             />
//           </>
//         )}

//         {/* {step === 2 && (
//           <>
//             <CalendarStepTwo
//               selectedCalendars={selectedCalendars}
//               selectedOptions={selectedOptions}
//               setSelectedOptions={setSelectedOptions}
//               setStep={setStep}
//             />
//           </>
//         )} */}

//         {step === 3 && (
//           <>
//             <CalendarStepThree
//               setStep={setStep}
//               selectedCalendars={selectedCalendars}
//               setConnectedCalendars={setConnectedCalendars}
//             />
//           </>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default IntegrationSteps;

const IntegrationSteps = () => {
  return (
    <div>
      <h1>Integration Steps</h1>
    </div>
  );
}
export default IntegrationSteps;