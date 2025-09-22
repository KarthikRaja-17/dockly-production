// import React, { useState } from 'react';
// import { Calendar, Badge, Modal, Button, Input, TimePicker, DatePicker, Select, Card } from 'antd';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   CalendarIcon,
//   Clock,
//   MapPin,
//   User,
//   Plus,
//   Edit3,
//   Trash2,
//   Eye,
//   Sparkles,
//   Star,
//   Heart,
//   Coffee,
//   Briefcase,
//   Users,
//   BookOpen,
//   Music,
//   Camera,
//   Gift
// } from 'lucide-react';
// import { format, isSameDay } from 'date-fns';
// import type { Dayjs } from 'dayjs';

// const { TextArea } = Input;
// const { Option } = Select;

// // Enhanced sample events with rich data
// type EventType = 'work' | 'personal' | 'health' | 'celebration' | 'education' | 'entertainment';

// type Priority = 'high' | 'medium' | 'low';

// interface CalendarEvent {
//   id: string;
//   title: string;
//   start: Date;
//   end: Date;
//   description?: string;
//   location?: string;
//   type: EventType;
//   priority: Priority;
//   attendees?: string[];
// }

// const sampleEvents: CalendarEvent[] = [
//   {
//     id: '1',
//     title: 'Team Meeting',
//     start: new Date(2024, 11, 15, 9, 0),
//     end: new Date(2024, 11, 15, 10, 30),
//     description: 'Weekly team sync and project updates',
//     location: 'Conference Room A',
//     type: 'work',
//     priority: 'high',
//     attendees: ['John', 'Sarah', 'Mike']
//   },
//   {
//     id: '2',
//     title: 'Lunch with Sarah',
//     start: new Date(2024, 11, 16, 12, 30),
//     end: new Date(2024, 11, 16, 14, 0),
//     description: 'Catch up over lunch at the new Italian place',
//     location: 'Bella Vista Restaurant',
//     type: 'personal',
//     priority: 'medium',
//     attendees: ['Sarah']
//   },
//   {
//     id: '3',
//     title: 'Project Deadline',
//     start: new Date(2024, 11, 18, 17, 0),
//     end: new Date(2024, 11, 18, 18, 0),
//     description: 'Final submission for the Q4 project',
//     location: 'Office',
//     type: 'work',
//     priority: 'high',
//     attendees: []
//   },
//   {
//     id: '4',
//     title: 'Yoga Class',
//     start: new Date(2024, 11, 19, 18, 0),
//     end: new Date(2024, 11, 19, 19, 30),
//     description: 'Evening yoga session for relaxation',
//     location: 'Wellness Center',
//     type: 'health',
//     priority: 'low',
//     attendees: []
//   },
//   {
//     id: '5',
//     title: 'Birthday Party',
//     start: new Date(2024, 11, 20, 19, 0),
//     end: new Date(2024, 11, 20, 23, 0),
//     description: 'Alex\'s surprise birthday celebration',
//     location: 'Downtown Venue',
//     type: 'celebration',


//   const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
//   const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
//   education: { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#fff', icon: BookOpen },
//   entertainment: { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#333', icon: Music }
// };

// const priorityColors = {
//   high: '#ff4757',
//   medium: '#ffa502',
//   low: '#7bed9f'
// };

// function App() {
//   const [events, setEvents] = useState(sampleEvents);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [viewMode, setViewMode] = useState('month');

//   const getEventsForDate = (date) => {
//     return events.filter(event => isSameDay(event.start, date));
//   };

//   const dateCellRender = (value) => {
//     const date = value.toDate();
//     const dayEvents = getEventsForDate(date);

//     return (
//       <div style={{ minHeight: '80px', position: 'relative' }}>
//         <AnimatePresence>
//           {dayEvents.map((event, index) => {
//             const eventType = eventTypeColors[event.type] || eventTypeColors.personal;
//             const IconComponent = eventType.icon;

//             return (
//               <motion.div
//                 key={event.id}
//                 initial={{ opacity: 0, scale: 0.8, y: 10 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.8, y: -10 }}
//                 transition={{ delay: index * 0.1 }}
//                 whileHover={{ scale: 1.05, zIndex: 10 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setSelectedEvent(event);
//                   setModalVisible(true);
//                 }}
//                 style={{
//                   background: eventType.bg,
//                   color: eventType.text,
//                   padding: '4px 8px',
//                   margin: '2px 0',
//                   borderRadius: '8px',
//                   fontSize: '11px',
//                   fontWeight: '600',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '4px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//                   border: `2px solid ${priorityColors[event.priority]}`,
//                   position: 'relative',
//                   overflow: 'hidden'
//                 }}
//               >
//                 <IconComponent size={10} />
//                 <span style={{
//                   whiteSpace: 'nowrap',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis',
//                   flex: 1
//                 }}>
//                   {event.title}
//                 </span>
//                 <div
//                   style={{
//                     position: 'absolute',
//                     top: 0,
//                     right: 0,
//                     width: '4px',
//                     height: '100%',
//                     background: priorityColors[event.priority],
//                     opacity: 0.8
//                   }}
//                 />
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>

//         {dayEvents.length > 0 && (
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             style={{
//               position: 'absolute',
//               top: '4px',
//               right: '4px',
//               width: '8px',
//               height: '8px',
//               borderRadius: '50%',
//               background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
//               boxShadow: '0 0 10px rgba(255,107,107,0.5)'
//             }}
//           />
//         )}
//       </div>
//     );
//   };

//   const monthCellRender = (value) => {
//     const date = value.toDate();
//     const monthEvents = events.filter(event =>
//       event.start.getMonth() === date.getMonth() &&
//       event.start.getFullYear() === date.getFullYear()
//     );

//     return monthEvents.length > 0 ? (
//       <div style={{ textAlign: 'center' }}>
//         <Badge
//           count={monthEvents.length}
//           style={{
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             boxShadow: '0 2px 8px rgba(102,126,234,0.3)'
//           }}
//         />
//       </div>
//     ) : null;
//   };

//   return (
//     <div style={{
//       minHeight: '100vh',
//       // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
//       padding: '20px',
//       fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
//     }}>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         style={{
//           maxWidth: '1200px',
//           margin: '0 auto'
//         }}
//       >
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           style={{
//             background: 'rgba(255, 255, 255, 0.95)',
//             backdropFilter: 'blur(20px)',
//             borderRadius: '24px',
//             padding: '24px',
//             marginBottom: '20px',
//             boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
//             border: '1px solid rgba(255,255,255,0.2)'
//           }}
//         >
//           <div style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             flexWrap: 'wrap',
//             gap: '16px'
//           }}>

//             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
//               <Select
//                 value={viewMode}
//                 onChange={setViewMode}
//                 style={{ minWidth: '120px' }}
//                 size="large"
//               >
//                 <Option value="month">Month View</Option>
//                 <Option value="year">Year View</Option>
//               </Select>

//               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <Button
//                   type="primary"
//                   size="large"
//                   icon={<Plus size={16} />}
//                   onClick={() => {
//                     setSelectedEvent(null);
//                     setModalVisible(true);
//                   }}
//                   style={{
//                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                     border: 'none',
//                     borderRadius: '12px',
//                     height: '44px',
//                     boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
//                     fontWeight: '600'
//                   }}
//                 >
//                   Add Event
//                 </Button>
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Calendar */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.4 }}
//         >
//           <Card
//             style={{
//               background: 'rgba(255, 255, 255, 0.95)',
//               backdropFilter: 'blur(20px)',
//               borderRadius: '24px',
//               border: '1px solid rgba(255,255,255,0.2)',
//               boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
//               overflow: 'hidden'
//             }}
//             bodyStyle={{ padding: '24px' }}
//           >
//             <Calendar
//               dateCellRender={viewMode === 'month' ? dateCellRender : undefined}
//               monthCellRender={viewMode === 'year' ? monthCellRender : undefined}
//               onSelect={(date) => setSelectedDate(date.toDate())}
//               style={{
//                 background: 'transparent'
//               }}
//               headerRender={({ value, type, onChange, onTypeChange }) => {
//                 const start = 0;
//                 const end = 12;
//                 const monthOptions = [];

//                 for (let i = start; i < end; i++) {
//                   monthOptions.push(
//                     <Option key={i} value={i}>
//                       {value.clone().month(i).format('MMMM')}
//                     </Option>
//                   );
//                 }

//                 const year = value.year();
//                 const month = value.month();
//                 const options = [];
//                 for (let i = year - 10; i < year + 10; i += 1) {
//                   options.push(
//                     <Option key={i} value={i}>
//                       {i}
//                     </Option>
//                   );
//                 }

//                 return (
//                   <div style={{
//                     padding: '16px 0',
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     borderBottom: '2px solid #f0f0f0',
//                     marginBottom: '16px'
//                   }}>
//                     <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
//                       <Select
//                         size="large"
//                         value={year}
//                         onChange={(newYear) => {
//                           const now = value.clone().year(newYear);
//                           onChange(now);
//                         }}
//                         style={{ minWidth: '100px' }}
//                       >
//                         {options}
//                       </Select>
//                       <Select
//                         size="large"
//                         value={month}
//                         onChange={(newMonth) => {
//                           const now = value.clone().month(newMonth);
//                           onChange(now);
//                         }}
//                         style={{ minWidth: '120px' }}
//                       >
//                         {monthOptions}
//                       </Select>
//                     </div>

//                     <div style={{
//                       display: 'flex',
//                       gap: '8px',
//                       alignItems: 'center',
//                       background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
//                       padding: '8px',
//                       borderRadius: '12px'
//                     }}>
//                       <Button
//                         size="small"
//                         onClick={() => onTypeChange('month')}
//                         type={type === 'month' ? 'primary' : 'text'}
//                         style={{
//                           borderRadius: '8px',
//                           background: type === 'month' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
//                           border: 'none'
//                         }}
//                       >
//                         Month
//                       </Button>
//                       <Button
//                         size="small"
//                         onClick={() => onTypeChange('year')}
//                         type={type === 'year' ? 'primary' : 'text'}
//                         style={{
//                           borderRadius: '8px',
//                           background: type === 'year' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
//                           border: 'none'
//                         }}
//                       >
//                         Year
//                       </Button>
//                     </div>
//                   </div>
//                 );
//               }}
//             />
//           </Card>
//         </motion.div>

//         {/* Event Details Modal */}
//         <Modal
//           title={
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '12px',
//               padding: '8px 0'
//             }}>
//               {selectedEvent && (
//                 <>
//                   <div style={{
//                     background: eventTypeColors[selectedEvent.type]?.bg || eventTypeColors.personal.bg,
//                     borderRadius: '12px',
//                     padding: '8px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     {React.createElement(
//                       eventTypeColors[selectedEvent.type]?.icon || Heart,
//                       { size: 16, color: 'white' }
//                     )}
//                   </div>
//                   <span style={{ fontSize: '20px', fontWeight: '700' }}>
//                     {selectedEvent?.title || 'New Event'}
//                   </span>
//                 </>
//               )}
//             </div>
//           }
//           open={modalVisible}
//           onCancel={() => setModalVisible(false)}
//           footer={null}
//           width={600}
//           style={{
//             borderRadius: '24px',
//             overflow: 'hidden'
//           }}
//           bodyStyle={{
//             background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
//             padding: '24px'
//           }}
//         >
//           {selectedEvent && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
//             >
//               <div style={{
//                 background: 'white',
//                 borderRadius: '16px',
//                 padding: '20px',
//                 boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
//                   <Clock size={18} color="#667eea" />
//                   <span style={{ fontWeight: '600', color: '#1a202c' }}>
//                     {format(selectedEvent.start, 'PPP p')} - {format(selectedEvent.end, 'p')}
//                   </span>
//                 </div>

//                 {selectedEvent.location && (
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
//                     <MapPin size={18} color="#667eea" />
//                     <span style={{ color: '#4a5568' }}>{selectedEvent.location}</span>
//                   </div>
//                 )}

//                 {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
//                     <Users size={18} color="#667eea" />
//                     <span style={{ color: '#4a5568' }}>
//                       {selectedEvent.attendees.join(', ')}
//                     </span>
//                   </div>
//                 )}

//                 <div style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px',
//                   marginBottom: '16px'
//                 }}>
//                   <span style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>Priority:</span>
//                   <div style={{
//                     padding: '4px 12px',
//                     borderRadius: '20px',
//                     background: priorityColors[selectedEvent.priority],
//                     color: 'white',
//                     fontSize: '12px',
//                     fontWeight: '600',
//                     textTransform: 'uppercase'
//                   }}>
//                     {selectedEvent.priority}
//                   </div>
//                 </div>

//                 {selectedEvent.description && (
//                   <div style={{
//                     background: '#f7fafc',
//                     padding: '16px',
//                     borderRadius: '12px',
//                     border: '1px solid #e2e8f0'
//                   }}>
//                     <p style={{ margin: 0, color: '#4a5568', lineHeight: '1.6' }}>
//                       {selectedEvent.description}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//                 <Button
//                   icon={<Edit3 size={16} />}
//                   style={{
//                     borderRadius: '12px',
//                     height: '40px',
//                     border: '2px solid #667eea',
//                     color: '#667eea',
//                     fontWeight: '600'
//                   }}
//                 >
//                   Edit
//                 </Button>
//                 <Button
//                   danger
//                   icon={<Trash2 size={16} />}
//                   style={{
//                     borderRadius: '12px',
//                     height: '40px',
//                     fontWeight: '600'
//                   }}
//                 >
//                   Delete
//                 </Button>
//               </div>
//             </motion.div>
//           )}
//         </Modal>
//       </motion.div>
//     </div>
//   );
// }

'use client'

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView: React.FC = () => {
  const [activeView, setActiveView] = useState('Month');
  const views = ['List', 'Day', 'Week', 'Month'];

  const calendarEvents = {
    12: 'Mortgage Payment',
    15: 'Internet Bill',
    17: "Emma's Soccer",
    20: 'Netflix',
    25: 'Annual Checkup',
  };

  const generateDays = () => {
    const days = [];
    const daysInMonth = 30;
    const startDay = 0; // June starts on Sunday (0-indexed)

    // Previous month days
    for (let i = 25; i <= 31; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === 10,
        event: calendarEvents[i as keyof typeof calendarEvents]
      });
    }

    // Next month days
    for (let i = 1; i <= 5; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1a202c',
          }}
        >
          June 2025
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: '#f3f4f6',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            {views.map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                style={{
                  padding: '6px 12px',
                  background: activeView === view ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: activeView === view ? 600 : 400,
                  boxShadow: activeView === view ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                }}
              >
                {view}
              </button>
            ))}
          </div>
          <select
            style={{
              padding: '6px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option>My View</option>
            <option>Family View</option>
          </select>
          <button
            style={{
              padding: '6px 12px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            style={{
              padding: '6px 12px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          background: '#e5e7eb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            style={{
              background: '#f9fafb',
              padding: '12px 8px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
            }}
          >
            {day}
          </div>
        ))}

        {generateDays().map((dayObj, index) => (
          <div
            key={index}
            style={{
              background: dayObj.isCurrentMonth ? 'white' : '#f9fafb',
              minHeight: '80px',
              padding: '8px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ...(dayObj.isToday && {
                background: '#eff6ff',
              }),
            }}
            onMouseEnter={(e) => {
              if (dayObj.isCurrentMonth) {
                e.currentTarget.style.background = dayObj.isToday ? '#dbeafe' : '#f8fafc';
              }
            }}
            onMouseLeave={(e) => {
              if (dayObj.isCurrentMonth) {
                e.currentTarget.style.background = dayObj.isToday ? '#eff6ff' : 'white';
              }
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '4px',
                color: dayObj.isCurrentMonth ? '#1a202c' : '#9ca3af',
                ...(dayObj.isToday && {
                  color: '#2563eb',
                  fontWeight: 700,
                }),
              }}
            >
              {dayObj.day}
            </div>
            {dayObj.event && (
              <div
                style={{
                  fontSize: '11px',
                  padding: '2px 4px',
                  background: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.2s ease',
                }}
              >
                {dayObj.event}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;

