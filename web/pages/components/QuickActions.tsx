// 'use client';

// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Clock, FileText, Bookmark, Upload, Plus, Camera, Link, Calendar } from 'lucide-react';
// import StickyNotes from '../notes/notescard';

// const QuickActions: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const actions = [
//     { icon: <Clock size={28} />, title: 'New Task', desc: 'Create a task or reminder', color: '#667eea' },
//     { icon: <FileText size={28} />, title: 'Add Note', desc: 'Quick notes and ideas', color: '#f093fb' },
//     { icon: <Bookmark size={28} />, title: 'Add Bookmark', desc: 'Save links and resources', color: '#4facfe' },
//     { icon: <Upload size={28} />, title: 'Drop Files', desc: 'Drag documents here', color: '#43e97b' },
//   ];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.6 }}
//       style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//         gap: '20px',
//         marginTop: '32px',
//       }}
//     >
//       {actions.map((action, index) => (
//         <motion.div
//           key={action.title}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.7 + index * 0.1 }}
//           whileHover={{
//             y: -8,
//             boxShadow: `0 20px 40px ${action.color}30`,
//             scale: 1.05
//           }}
//           whileTap={{ scale: 0.95 }}
//           style={{
//             background: 'white',
//             border: `2px solid ${action.color}20`,
//             borderRadius: '20px',
//             padding: '32px 24px',
//             textAlign: 'center',
//             cursor: 'pointer',
//             transition: 'all 0.3s ease',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: '16px',
//             boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
//           }}
//           onHoverStart={(e) => {
//             const target = e.target as HTMLElement;
//             target.style.borderColor = action.color;
//             target.style.background = `${action.color}08`;
//           }}
//           onHoverEnd={(e) => {
//             const target = e.target as HTMLElement;
//             target.style.borderColor = `${action.color}20`;
//             target.style.background = 'white';
//           }}
//           onClick={() => {
//             if (action.title === "Add Note") {
//               setIsOpen(true)
//             }
//           }
//           }
//         >
//           <motion.div
//             whileHover={{ scale: 1.2, rotate: 360 }}
//             transition={{ duration: 0.5 }}
//             style={{
//               width: '80px',
//               height: '80px',
//               background: `linear-gradient(135deg, ${action.color}20, ${action.color}40)`,
//               borderRadius: '20px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: action.color,
//               boxShadow: `0 8px 25px ${action.color}25`,
//             }}
//           >
//             {action.icon}
//           </motion.div>

//           <div>
//             <h3 style={{
//               fontSize: '18px',
//               fontWeight: '700',
//               color: '#1a202c',
//               marginBottom: '8px',
//             }}>
//               {action.title}
//             </h3>
//             <p style={{
//               fontSize: '14px',
//               color: '#64748b',
//               lineHeight: '1.4',
//             }}>
//               {action.desc}
//             </p>
//           </div>
//         </motion.div>
//       ))}
//       <StickyNotes isOpen={isOpen} setIsOpen={setIsOpen} />
//     </motion.div>
//   );
// };

// export default QuickActions;
'use client'

import React from 'react';
import { Clock, FileText, Bookmark, Download } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: <Clock size={24} />,
      title: 'New Task',
      description: 'Create a task or reminder',
    },
    {
      icon: <FileText size={24} />,
      title: 'Add Note',
      description: 'Quick notes and ideas',
    },
    {
      icon: <Bookmark size={24} />,
      title: 'Add Bookmark',
      description: 'Save links and resources',
    },
    {
      icon: <Download size={24} />,
      title: 'Drop Files',
      description: 'Drag documents here',
    },
  ];

  const handleActionClick = (title: string) => {
    console.log(`Quick action: ${title}`);
    if (title !== 'Drop Files') {
      alert(`Opening ${title} dialog...`);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px',
      }}
    >
      {actions.map((action, index) => (
        <div
          key={index}
          style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => handleActionClick(action.title)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.background = '#eff6ff';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#eff6ff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
              transition: 'all 0.3s ease',
            }}
          >
            {action.icon}
          </div>
          <div
            style={{
              fontWeight: 600,
              color: '#1e293b',
              fontSize: '16px',
            }}
          >
            {action.title}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#64748b',
              lineHeight: 1.4,
            }}
          >
            {action.description}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;