// 'use client';

// import React, { useMemo, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Clock, DollarSign, Users, Heart, AlertCircle } from 'lucide-react';
// import { Modal } from 'antd';

// interface RawEvent {
//   title: string;
//   start: Date;
//   end: Date;
//   allDay: boolean;
//   id: string;
//   extendedProps?: {
//     status?: string;
//     category?: 'finance' | 'family' | 'health' | 'general';
//     info?: string;
//   };
//   source_email?: string;
// }

// interface Activity {
//   date: { day: string; month: string };
//   title: string;
//   info: string;
//   status: { type: string; label: string };
//   category: 'finance' | 'family' | 'health' | 'general';
// }

// interface Props {
//   events: RawEvent[];
// }

// const UpcomingActivities: React.FC<Props> = ({ events }) => {
//   const [modalVisible, setModalVisible] = useState(false);

//   const getMonthAbbreviation = (date: Date): string =>
//     date.toLocaleString('default', { month: 'short' }).toUpperCase();

//   const mapEventsToActivities = (rawEvents: RawEvent[]): Activity[] => {
//     return rawEvents.map((event) => {
//       const startDate = new Date(event.start);
//       const category =
//         event.extendedProps?.category ||
//         (event.title?.toLowerCase().includes('bill') ||
//           event.title?.toLowerCase().includes('payment')
//           ? 'finance'
//           : event.title?.toLowerCase().includes('checkup')
//             ? 'health'
//             : event.title?.toLowerCase().includes('practice')
//               ? 'family'
//               : 'general');

//       const statusType =
//         event.extendedProps?.status === 'confirmed'
//           ? 'pending'
//           : event.extendedProps?.status || 'general';

//       const statusLabel =
//         statusType === 'confirmed'
//           ? 'Confirmed'
//           : statusType.charAt(0).toUpperCase() + statusType.slice(1);

//       return {
//         date: {
//           day: startDate.getDate().toString().padStart(2, '0'),
//           month: getMonthAbbreviation(startDate),
//         },
//         title: event.title,
//         info:
//           event.extendedProps?.info ||
//           `${event.source_email || 'No Info'} - ${startDate.toLocaleTimeString([], {
//             hour: '2-digit',
//             minute: '2-digit',
//           })}`,
//         status: {
//           type: statusType,
//           label: statusLabel,
//         },
//         category: category as Activity['category'],
//       };
//     });
//   };

//   const activities = useMemo(() => mapEventsToActivities(events || []), [events]);
//   const displayed = activities.slice(0, 3);
//   const overflow = activities.length > 3;

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case 'finance':
//         return <DollarSign size={16} />;
//       case 'family':
//         return <Users size={16} />;
//       case 'health':
//         return <Heart size={16} />;
//       default:
//         return <Clock size={16} />;
//     }
//   };

//   const getStatusColor = (type: string) => {
//     switch (type) {
//       case 'urgent':
//         return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
//       case 'pending':
//         return { bg: '#fffbeb', color: '#d97706', border: '#fed7aa' };
//       case 'family':
//         return { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' };
//       case 'health':
//         return { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0' };
//       default:
//         return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
//     }
//   };

//   const renderActivity = (activity: Activity, index: number) => {
//     const statusColors = getStatusColor(activity.status.type);
//     return (
//       <motion.div
//         key={index}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.9 + index * 0.1 }}
//         whileHover={{
//           x: 8,
//           boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
//           scale: 1.02,
//         }}
//         style={{
//           display: 'flex',
//           gap: '16px',
//           padding: '20px',
//           background: '#fafbfc',
//           borderRadius: '16px',
//           border: '1px solid #f1f5f9',
//           cursor: 'pointer',
//           transition: 'all 0.3s ease',
//         }}
//       >
//         <motion.div
//           whileHover={{ scale: 1.1 }}
//           style={{
//             width: '60px',
//             height: '60px',
//             background: 'white',
//             borderRadius: '16px',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             border: '2px solid #e2e8f0',
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
//           }}
//         >
//           <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a202c' }}>{activity.date.day}</div>
//           <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
//             {activity.date.month}
//           </div>
//         </motion.div>

//         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//             <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a202c', display: 'flex', gap: '8px' }}>
//               {getCategoryIcon(activity.category)} {activity.title}
//             </h3>
//             <motion.span
//               whileHover={{ scale: 1.05 }}
//               style={{
//                 fontSize: '12px',
//                 fontWeight: '600',
//                 padding: '10px 12px',
//                 borderRadius: '10px',
//                 background: statusColors.bg,
//                 color: statusColors.color,
//                 border: `1px solid ${statusColors.border}`,
//               }}
//             >
//               {activity.status.label}
//             </motion.span>
//           </div>
//           <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{activity.info}</p>
//         </div>
//       </motion.div>
//     );
//   };

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0, x: -40 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ delay: 0.7 }}
//         style={{
//           background: 'white',
//           borderRadius: '24px',
//           padding: '32px',
//           boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
//           backdropFilter: 'blur(20px)',
//           border: '1px solid rgba(0, 0, 0, 0.06)',
//           height: 'fit-content',
//           width: '500px',
//         }}
//       >
//         <motion.div
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             marginBottom: '24px',
//           }}
//         >
//           <motion.h2
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.8 }}
//             style={{
//               fontSize: '24px',
//               fontWeight: '500',
//               color: '#1a202c',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '12px',
//             }}
//           >
//             <AlertCircle size={28} color="#667eea" />
//             Upcoming Activities
//           </motion.h2>
//           {overflow && (
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               onClick={() => setModalVisible(true)}
//               style={{
//                 fontSize: '14px',
//                 fontWeight: '600',
//                 padding: '4px 12px',
//                 borderRadius: '8px',
//                 background: '#edf2ff',
//                 color: '#4c51bf',
//                 border: 'none',
//                 cursor: 'pointer',
//               }}
//             >
//               View All
//             </motion.button>
//           )}
//         </motion.div>

//         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//           {displayed.map(renderActivity)}
//         </div>
//       </motion.div>

//       <Modal
//         title="All Activities"
//         open={modalVisible}
//         onCancel={() => setModalVisible(false)}
//         footer={null}
//         width={600}
//       >
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//           {activities.map(renderActivity)}
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default UpcomingActivities;

'use client'

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const UpcomingActivities: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  const activities = [
    {
      day: '12',
      month: 'JUN',
      title: 'Mortgage Payment',
      info: 'Chase Bank - $1,450.00',
      status: 'Due Soon',
      statusType: 'due',
    },
    {
      day: '15',
      month: 'JUN',
      title: 'Internet Bill',
      info: 'Xfinity - $89.99',
      status: 'Due Soon',
      statusType: 'due',
    },
    {
      day: '17',
      month: 'JUN',
      title: "Emma's Soccer Practice",
      info: '4:00 PM - Community Park',
      status: 'Family Event',
      statusType: 'family',
    },
    {
      day: '20',
      month: 'JUN',
      title: 'Netflix Subscription',
      info: 'Netflix - $19.99',
      status: 'Auto-Pay On',
      statusType: 'autopay',
    },
    {
      day: '25',
      month: 'JUN',
      title: 'Annual Checkup',
      info: 'Dr. Smith - 10:00 AM',
      status: 'Health',
      statusType: 'health',
    },
  ];

  const getStatusStyle = (type: string) => {
    switch (type) {
      case 'due':
        return { background: '#fef3c7', color: '#92400e' };
      case 'autopay':
        return { background: '#d1fae5', color: '#065f46' };
      case 'family':
        return { background: '#ddd6fe', color: '#5b21b6' };
      case 'health':
        return { background: '#fce7f3', color: '#be185d' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const handleAddActivity = () => {
    if (inputValue.trim()) {
      alert(`Activity added: "${inputValue}"`);
      setInputValue('');
    }
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        height: 'fit-content',
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '16px',
          color: '#1a202c',
        }}
      >
        Upcoming Activities
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activities.map((activity, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.background = '#eff6ff';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#1a202c',
                }}
              >
                {activity.day}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                {activity.month}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: '4px',
                  color: '#1a202c',
                  fontSize: '16px',
                }}
              >
                {activity.title}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '8px',
                }}
              >
                {activity.info}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  ...getStatusStyle(activity.statusType),
                }}
              >
                {activity.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Add an event or task in natural language (e.g., 'Dinner with Sarah tomorrow at 7pm')"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={handleAddActivity}
            style={{
              padding: '12px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingActivities;