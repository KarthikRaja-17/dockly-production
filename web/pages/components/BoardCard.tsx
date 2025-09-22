// // 'use client';

// // import React from 'react';
// // import {
// //   Home,
// //   Users,
// //   DollarSign,
// //   Heart,
// //   Plane,
// //   Puzzle
// // } from 'lucide-react';
// // import { motion } from 'framer-motion';

// // interface StatusItem {
// //   type: 'urgent' | 'pending' | 'complete';
// //   text: string;
// // }

// // interface BoardCardProps {
// //   title: string;
// //   icon: string;
// //   accounts: number;
// //   documents: number;
// //   statusItems: StatusItem[];
// //   index: number;
// // }

// // const BoardCard: React.FC<BoardCardProps> = ({
// //   title,
// //   icon,
// //   accounts,
// //   documents,
// //   statusItems,
// //   index
// // }) => {
// //   const getIcon = (iconName: string) => {
// //     const iconMap: { [key: string]: React.ReactNode } = {
// //       home: <Home size={24} />,
// //       family: <Users size={24} />,
// //       finance: <DollarSign size={24} />,
// //       health: <Heart size={24} />,
// //       travel: <Plane size={24} />,
// //       projects: <Puzzle size={24} />,
// //     };
// //     return iconMap[iconName] || <Home size={24} />;
// //   };

// //   const getStatusColor = (type: string) => {
// //     switch (type) {
// //       case 'urgent':
// //         return '#ef4444'; // red
// //       case 'pending':
// //         return '#f59e0b'; // amber
// //       case 'complete':
// //         return '#22c55e'; // green
// //       default:
// //         return '#64748b'; // slate
// //     }
// //   };

// //   const cardColors = [
// //     { bg: '#e6f0ff', border: '#3b82f6' },   // blue
// //     { bg: '#ffeaf0', border: '#ec4899' },   // pink
// //     { bg: '#e7fff6', border: '#10b981' },   // mint green
// //     { bg: '#fffbe6', border: '#facc15' },   // yellow
// //     { bg: '#f3f0ff', border: '#8b5cf6' },   // violet
// //     { bg: '#fff1e6', border: '#fb923c' },   // orange peach
// //   ];

// //   const safeIndex = typeof index === 'number' ? index : 0;
// //   const colorSet = cardColors[safeIndex % cardColors.length];

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 30 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ delay: safeIndex * 0.1, duration: 0.5 }}
// //       whileHover={{
// //         y: -8,
// //         boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
// //         scale: 1.02
// //       }}
// //       whileTap={{ scale: 0.98 }}
// //       style={{
// //         // background: colorSet.bg,
// //         borderRadius: '16px',
// //         padding: '20px',
// //         cursor: 'pointer',
// //         border: `1px solid ${colorSet.border}`,
// //         boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
// //         fontFamily: `'Inter', sans-serif`,
// //         transition: 'all 0.3s ease',
// //       }}
// //     >
// //       <div style={{
// //         display: 'flex',
// //         alignItems: 'center',
// //         gap: '14px',
// //         marginBottom: '16px',
// //       }}>
// //         <motion.div
// //           whileHover={{ rotate: 360 }}
// //           transition={{ duration: 0.5 }}
// //           style={{
// //             width: '52px',
// //             height: '52px',
// //             background: colorSet.border,
// //             borderRadius: '12px',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'center',
// //             color: 'white',
// //             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
// //           }}
// //         >
// //           {getIcon(icon)}
// //         </motion.div>
// //         <div>
// //           <h3 style={{
// //             fontSize: '18px',
// //             fontWeight: 700,
// //             color: '#1e293b',
// //             marginBottom: '4px',
// //           }}>
// //             {title}
// //           </h3>
// //           <div style={{
// //             fontSize: '13px',
// //             color: '#475569',
// //             display: 'flex',
// //             gap: '8px',
// //           }}>
// //             <span>{accounts} accounts</span>
// //             <span>•</span>
// //             <span>{documents} documents</span>
// //           </div>
// //         </div>
// //       </div>

// //       <div style={{
// //         display: 'flex',
// //         flexDirection: 'column',
// //         gap: '10px',
// //       }}>
// //         {(statusItems || []).map((item, idx) => (
// //           <motion.div
// //             key={idx}
// //             initial={{ opacity: 0, x: -20 }}
// //             animate={{ opacity: 1, x: 0 }}
// //             transition={{ delay: (index * 0.1) + (idx * 0.05) + 0.3 }}
// //             style={{
// //               display: 'flex',
// //               alignItems: 'center',
// //               gap: '10px',
// //               padding: '10px 14px',
// //               background: '#ffffffcc',
// //               borderRadius: '10px',
// //               fontSize: '13px',
// //               color: '#334155',
// //               border: '1px solid #e2e8f0',
// //             }}
// //           >
// //             <motion.div
// //               initial={{ scale: 0 }}
// //               animate={{ scale: 1 }}
// //               transition={{ delay: (index * 0.1) + (idx * 0.05) + 0.5, type: 'spring' }}
// //               style={{
// //                 width: '10px',
// //                 height: '10px',
// //                 borderRadius: '50%',
// //                 background: getStatusColor(item.type),
// //                 boxShadow: `0 0 12px ${getStatusColor(item.type)}40`,
// //               }}
// //             />
// //             <span>{item.text}</span>
// //           </motion.div>
// //         ))}
// //       </div>
// //     </motion.div>
// //   );
// // };

// // export default BoardCard;
// 'use client';

// import React, { JSX, useEffect, useState } from 'react';
// import { Home, Users, DollarSign, Heart, Plane, Puzzle } from 'lucide-react';
// import { Modal } from 'antd';
// import { useRouter } from 'next/navigation';
// import { useCurrentUser } from '../../app/userContext';
// import { getDashboardBoards } from '../../services/dashboard';

// const YourBoards: React.FC = () => {
//   const router = useRouter();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   type BoardItem = {
//     icon: string;
//     title: string;
//     accounts: number;
//     documents: number;
//     items: { type: string; text: string }[];
//   };
//   const [boards, setBoards] = useState<BoardItem[]>([])
//   const currentUser = useCurrentUser();
//   const username = currentUser?.user_name;
//   const handleAddBoard = () => setIsModalOpen(true);
//   const handleCloseModal = () => setIsModalOpen(false);

//   const boardOptions = [
//     { title: 'Home', icon: '🏠', description: 'Manage home-related records', path: '/home-hub/setup' },
//     { title: 'Finance', icon: '💰', description: 'Track financial documents', path: '/finance-hub/setup' },
//     { title: 'Health', icon: '❤️', description: 'Health and medical files', path: '/health-hub/setup' },
//     { title: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Family accounts and details', path: '/family-hub/setup' },
//   ];
//   // const boards: {
//   //   icon: React.ReactNode;
//   //   title: string;
//   //   accounts: number;
//   //   documents: number;
//   //   items: { type: string; text: string }[];
//   // }[] = []

//   const getBoards = async () => {
//     const response = await getDashboardBoards({});
//     const { status, payload } = response.data;
//     if (status) {
//       setBoards(payload.boards)
//     }
//   }

//   useEffect(() => {
//     getBoards();
//   }, [])

//   const getStatusColor = (type: string) => {
//     switch (type) {
//       case 'urgent':
//         return '#ef4444';
//       case 'pending':
//         return '#f59e0b';
//       case 'complete':
//         return '#10b981';
//       default:
//         return '#64748b';
//     }
//   };

//   const iconMap: Record<string, JSX.Element> = {
//     dollar: <DollarSign size={24} />,
//     users: <Users size={24} />,
//     home: <Home size={24} />,
//     heart: <Heart size={24} />,
//   };

//   return (
//     <div style={{ marginBottom: '24px' }}>
//       <h2
//         style={{
//           fontSize: '20px',
//           fontWeight: 700,
//           marginBottom: '16px',
//           color: '#1a202c',
//         }}
//       >
//         Your Boards
//       </h2>
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
//           gap: '24px',
//           marginBottom: '32px',
//         }}
//       >
//         {boards.map((board, index) => (
//           <div
//             key={index}
//             style={{
//               background: 'white',
//               borderRadius: '12px',
//               border: '1px solid #e2e8f0',
//               padding: '24px',
//               transition: 'all 0.3s ease',
//               cursor: 'pointer',
//               position: 'relative',
//               overflow: 'hidden',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.borderColor = '#2563eb';
//               e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.15)';
//               e.currentTarget.style.transform = 'translateY(-4px)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.borderColor = '#e2e8f0';
//               e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
//               e.currentTarget.style.transform = 'translateY(0)';
//             }}
//           >
//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '16px',
//                 marginBottom: '16px',
//               }}
//             >
//               <div
//                 style={{
//                   width: '48px',
//                   height: '48px',
//                   background: '#eff6ff',
//                   borderRadius: '12px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: '#2563eb',
//                   transition: 'all 0.3s ease',
//                 }}
//               >
//                 {iconMap[board.icon] || null}
//               </div>
//               <div>
//                 <div
//                   style={{
//                     fontWeight: 600,
//                     fontSize: '18px',
//                     marginBottom: '4px',
//                     color: '#1a202c',
//                   }}
//                 >
//                   {board.title}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: '14px',
//                     color: '#64748b',
//                   }}
//                 >
//                   {board.accounts} accounts • {board.documents} documents
//                 </div>
//               </div>
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//               {board.items.map((item, itemIndex) => (
//                 <div
//                   key={itemIndex}
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '12px',
//                     fontSize: '14px',
//                     padding: '8px 0',
//                     borderRadius: '4px',
//                     transition: 'all 0.2s ease',
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = '#f8fafc';
//                     e.currentTarget.style.paddingLeft = '8px';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'transparent';
//                     e.currentTarget.style.paddingLeft = '0';
//                   }}
//                 >
//                   <div
//                     style={{
//                       width: '8px',
//                       height: '8px',
//                       borderRadius: '50%',
//                       background: getStatusColor(item.type),
//                       flexShrink: 0,
//                     }}
//                   />
//                   <span style={{ color: '#1a202c' }}>{item.text}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//       <div
//         onClick={handleAddBoard}
//         style={{
//           background: '#f9fafb',
//           borderRadius: '12px',
//           border: '2px dashed #cbd5e1',
//           padding: '24px',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           cursor: 'pointer',
//           color: '#2563eb',
//           transition: 'all 0.3s ease',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.borderColor = '#2563eb';
//           e.currentTarget.style.background = '#fff';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.borderColor = '#cbd5e1';
//           e.currentTarget.style.background = '#f9fafb';
//         }}
//       >
//         <div style={{ fontSize: '28px', marginBottom: '8px' }}>➕</div>
//         <div style={{ fontWeight: 600 }}>Add New Board</div>
//       </div>
//       <Modal
//         open={isModalOpen}
//         onCancel={handleCloseModal}
//         footer={null}
//         centered
//         width={800}
//         title="Choose a Board Type"
//       >
//         <div
//           style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(2, 1fr)',
//             gap: '20px',
//             marginTop: '20px',
//           }}
//         >
//           {boardOptions.map((option, index) => (
//             <div
//               key={index}
//               onClick={() => {
//                 router.push(`/${username}/${option.path}`);
//                 setIsModalOpen(false);
//               }}
//               style={{
//                 background: '#ffffff',
//                 borderRadius: '12px',
//                 border: '1px solid #e2e8f0',
//                 padding: '24px',
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease',
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.borderColor = '#2563eb';
//                 e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.15)';
//                 e.currentTarget.style.transform = 'translateY(-4px)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.borderColor = '#e2e8f0';
//                 e.currentTarget.style.boxShadow = 'none';
//                 e.currentTarget.style.transform = 'translateY(0)';
//               }}
//             >
//               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//                 <div
//                   style={{
//                     width: '48px',
//                     height: '48px',
//                     borderRadius: '12px',
//                     backgroundColor: '#eff6ff',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     fontSize: '24px',
//                     color: '#2563eb',
//                   }}
//                 >
//                   {option.icon}
//                 </div>
//                 <div>
//                   <div style={{ fontWeight: 600, fontSize: '18px', color: '#1a202c' }}>
//                     {option.title}
//                   </div>
//                   <div style={{ fontSize: '14px', color: '#64748b' }}>
//                     {option.description}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default YourBoards;

const YourBoards = () => {
  return (
    <div>
      <h2>Your Boards </h2>
    </div>
  );
}
export default YourBoards;