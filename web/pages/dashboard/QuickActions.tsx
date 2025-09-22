// import React, { useState } from 'react';
// import { Calendar, Plus, FileText, Star, Upload, Zap } from 'lucide-react';

// const QuickActions: React.FC = () => {
//     const [isDragActive, setIsDragActive] = useState(true);

//     const actions = [
//         {
//             icon: <Calendar size={18} />,
//             label: 'Add Event',
//             bgColor: '#eff6ff',
//             textColor: '#2563eb',
//             hoverBg: '#dbeafe'
//         },
//         {
//             icon: <Plus size={18} />,
//             label: 'Add Task',
//             bgColor: '#f0fdf4',
//             textColor: '#16a34a',
//             hoverBg: '#dcfce7'
//         },
//         {
//             icon: <FileText size={18} />,
//             label: 'Add Note',
//             bgColor: '#fffbeb',
//             textColor: '#d97706',
//             hoverBg: '#fef3c7'
//         },
//         {
//             icon: <Star size={18} />,
//             label: 'Add Bookmark',
//             bgColor: '#faf5ff',
//             textColor: '#9333ea',
//             hoverBg: '#f3e8ff'
//         },
//         // {
//         //     icon: <Zap size={18} />,
//         //     label: 'Quick Capture',
//         //     bgColor: '#fef2f2',
//         //     textColor: '#dc2626',
//         //     hoverBg: '#fee2e2'
//         // }
//     ];

//     const handleDragOver = (e: React.DragEvent) => {
//         e.preventDefault();
//         setIsDragActive(true);
//     };

//     const handleDragLeave = () => {
//         setIsDragActive(false);
//     };

//     const handleDrop = (e: React.DragEvent) => {
//         e.preventDefault();
//         setIsDragActive(false);
//         const files = e.dataTransfer.files;
//         if (files.length > 0) {
//             console.log('Files dropped:', files);
//         }
//     };

//     return (
//         <div style={{
//             backgroundColor: 'white',
//             borderRadius: '20px',
//             padding: '24px',
//             border: '1px solid #e2e8f0',
//             marginBottom: '32px',
//             opacity: 0,
//             animation: 'fadeInUp 0.6s ease-out 0.5s forwards'
//         }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
//                 <Zap size={20} style={{ color: '#f59e0b' }} />
//                 <h3 style={{
//                     fontSize: '16px',
//                     fontWeight: '600',
//                     color: '#1e293b',
//                     margin: 0
//                 }}>
//                     Quick Actions
//                 </h3>
//             </div>

//             {/* Actions Row */}
//             <div style={{
//                 display: 'flex',
//                 alignContent: 'center',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '45px',
//                 marginBottom: '24px',
//                 overflowX: 'auto'
//             }}>
//                 {actions.map((action, index) => (
//                     <button
//                         key={action.label}
//                         className="card-hover"
//                         style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '8px',
//                             padding: '32px 85px',
//                             backgroundColor: action.bgColor,
//                             color: action.textColor,
//                             border: 'none',
//                             borderRadius: '12px',
//                             fontSize: '14px',
//                             fontWeight: '500',
//                             cursor: 'pointer',
//                             transition: 'all 0.2s ease',
//                             opacity: 0,
//                             animation: `slideIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
//                             whiteSpace: 'nowrap'
//                         }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.backgroundColor = action.hoverBg;
//                             e.currentTarget.style.transform = 'translateY(-2px)';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.backgroundColor = action.bgColor;
//                             e.currentTarget.style.transform = 'translateY(0)';
//                         }}
//                     >
//                         {action.icon}
//                         <span>{action.label}</span>
//                     </button>
//                 ))}
//             </div>

//             {/* Drag & Drop Zone */}
//             <div
//                 // onDragOver={handleDragOver}
//                 // onDragLeave={handleDragLeave}
//                 // onDrop={handleDrop}
//                 style={{
//                     border: `2px dashed ${isDragActive ? '#3b82f6' : '#d1d5db'}`,
//                     borderRadius: '16px',
//                     padding: '24px',
//                     textAlign: 'center',
//                     backgroundColor: isDragActive ? '#eff6ff' : '#f9fafb',
//                     cursor: 'pointer',
//                     transition: 'all 0.3s ease',
//                     opacity: 0,
//                     animation: 'fadeInUp 0.4s ease-out 1s forwards'
//                 }}
//             >
//                 <div style={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     gap: '8px'
//                 }}>
//                     <Upload
//                         size={28}
//                         style={{
//                             color: isDragActive ? '#3b82f6' : '#9ca3af',
//                             transition: 'color 0.3s ease'
//                         }}
//                     />
//                     <div>
//                         <p style={{
//                             fontSize: '14px',
//                             fontWeight: '500',
//                             color: isDragActive ? '#3b82f6' : '#6b7280',
//                             margin: '0 0 4px 0'
//                         }}>
//                             Drag & Drop Files
//                         </p>
//                         <p style={{
//                             fontSize: '12px',
//                             color: '#9ca3af',
//                             margin: 0
//                         }}>
//                             or click to browse
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>

//     );
// };

// export default QuickActions;








import React, { useRef, useState } from 'react';
import { Calendar, Plus, FileText, Star, Upload, Zap } from 'lucide-react';
import StickyNotes from '../notes/notescard';
import { uploadDocklyRootFile } from '../../services/home';
import { message } from 'antd';

const QuickActions: React.FC = () => {
    const [isDragActive, setIsDragActive] = useState(true);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isStickyOpen, setIsStickyOpen] = useState(false); // Sticky Notes modal control

    const actions = [
        {
            icon: <Calendar size={18} />,
            label: 'Add Event',
            bgColor: '#eff6ff',
            textColor: '#2563eb',
            hoverBg: '#dbeafe'
        },
        {
            icon: <Plus size={18} />,
            label: 'Add Task',
            bgColor: '#f0fdf4',
            textColor: '#16a34a',
            hoverBg: '#dcfce7'
        },
        {
            icon: <FileText size={18} />,
            label: 'Add Note',
            bgColor: '#fffbeb',
            textColor: '#d97706',
            hoverBg: '#fef3c7'
        },
        {
            icon: <Star size={18} />,
            label: 'Add Bookmark',
            bgColor: '#faf5ff',
            textColor: '#9333ea',
            hoverBg: '#f3e8ff'
        },
    ];

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const uploads = Array.from(files).map(async (file) => {
                try {
                    const res = await uploadDocklyRootFile(file);
                    if (res.status === 1) {
                        message.success(`Uploaded: ${file.name}`);
                    } else {
                        message.error(res.message || `Failed to upload: ${file.name}`);
                    }
                } catch (err) {
                    console.error('Upload error:', err);
                    message.error(`Error uploading: ${file.name}`);
                }
            });
            await Promise.all(uploads);
            e.target.value = ''; // reset input
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = () => {
        setIsDragActive(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const uploads = Array.from(files).map(async (file) => {
                try {
                    const res = await uploadDocklyRootFile(file);
                    if (res.status === 1) {
                        message.success(`Uploaded: ${file.name}`);
                    } else {
                        message.error(res.message || `Failed to upload: ${file.name}`);
                    }
                } catch (err) {
                    console.error('Upload error:', err);
                    message.error(`Error uploading: ${file.name}`);
                }
            });

            await Promise.all(uploads);
        }
    };

    return (
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                marginBottom: '32px',
                opacity: 0,
                animation: 'fadeInUp 0.6s ease-out 0.5s forwards',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Zap size={20} style={{ color: '#f59e0b' }} />
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: 0
                }}>
                    Quick Actions
                </h3>
            </div>

            {/* Actions Row */}
            <div style={{
                display: 'flex',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '45px',
                marginBottom: '24px',
                overflowX: 'auto'
            }}>
                {actions.map((action, index) => (
                    <button
                        key={action.label}
                        className="card-hover"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '32px 85px',
                            backgroundColor: action.bgColor,
                            color: action.textColor,
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: 0,
                            animation: `slideIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = action.hoverBg;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = action.bgColor;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onClick={() => {
                            if (action.label === 'Add Note') {
                                setIsStickyOpen(true);
                            }
                        }}
                    >
                        {action.icon}
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Drag & Drop Zone */}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${isDragActive ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: isDragActive ? '#eff6ff' : '#f9fafb',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: 0,
                    animation: 'fadeInUp 0.4s ease-out 1s forwards'
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Upload
                        size={28}
                        style={{
                            color: isDragActive ? '#3b82f6' : '#9ca3af',
                            transition: 'color 0.3s ease'
                        }}
                    />
                    <div>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: isDragActive ? '#3b82f6' : '#6b7280',
                            margin: '0 0 4px 0'
                        }}>
                            Drag & Drop Files
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            margin: 0
                        }}>
                            or click to browse
                        </p>
                    </div>
                </div>
            </div>
            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
            {/* Sticky Notes Modal */}
            <StickyNotes isOpen={isStickyOpen} setIsOpen={setIsStickyOpen} />
        </div>
    );
};

export default QuickActions;

