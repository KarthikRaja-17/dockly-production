
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Tag, message, Checkbox, Typography } from 'antd';
import { ArrowRightOutlined, ChromeOutlined, EditOutlined } from '@ant-design/icons';
import { addSmartNotes, fetchNoteSuggestions } from '../../services/planner';
import { PRIMARY_COLOR } from '../../app/comman';
const { Text } = Typography;
interface SmartInputBoxProps {
    allowMentions?: boolean;
    enableHashMentions?: boolean;
    source?: string;
    familyMembers?: { name: string; email?: string; status?: string }[]
    personColors?: PersonColors;
    setBackup?: (data: any) => void;
    backup?: any;
}

interface PersonData {
    color: string;
    email?: string;
}
interface PersonColors {
    [key: string]: PersonData;
}
const isValidEmail = (text: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
};

const SmartInputBox: React.FC<SmartInputBoxProps> = ({
    allowMentions = false,
    enableHashMentions = false,
    source = 'planner',
    personColors = {},
    setBackup,
    familyMembers,
    backup
}) => {

    const [newEventText, setNewEventText] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionQuery, setMentionQuery] = useState('');
    const [frequentNotes, setFrequentNotes] = useState<string[]>([]);
    const inputRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [hashPosition, setHashPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

    // const familyMembers = ['vini', 'emma', 'sri'];
    // const memberNames = (familyMembers ?? []).map((m) => m.toLowerCase());

    const memberNames = (familyMembers ?? [])
        .filter((m) => !!m.name && m.status?.toLowerCase() !== "pending")
        .map((m) => m.name!.toLowerCase());

    useEffect(() => {
        const uid = localStorage.getItem('userId') || '';
        if (!uid) return;

        // const fetchSuggestions = async () => {
        //     setLoading(true);
        //     try {
        //         const suggestions = await fetchNoteSuggestions(uid, source);
        //         setFrequentNotes(suggestions);
        //     } catch (err) {
        //         console.error('Failed to load frequent notes', err);
        //     }
        //     setLoading(false);
        // };

        // fetchSuggestions();
    }, [source]);

    const handleInputChange = (e: any) => {
        const value = e.target.value;
        const cursor = e.target.selectionStart;

        setNewEventText(value);
        setCursorPosition(cursor);

        const match = value.slice(0, cursor).match(/#(\S*)$/);
        const query = match?.[1] ?? '';
        const isHashMentionActive = !!match && enableHashMentions;

        if (isHashMentionActive) {
            const matchedMembers = memberNames.filter((member) =>
                member.toLowerCase().startsWith(query.toLowerCase())
            );

            if (matchedMembers.length > 0) {
                setMentionQuery(query);
                setShowMentions(true);

                setTimeout(() => {
                    if (inputRef.current && containerRef.current) {
                        const input = inputRef.current.resizableTextArea?.textArea;
                        const rect = input.getBoundingClientRect();
                        const relativeLeft = (cursor - 1) * 7;

                        setHashPosition({
                            left: relativeLeft,
                            top: rect.height,
                        });
                    }
                }, 0);
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }
    };

    const handleSelectMention = (mention: string) => {
        const before = newEventText.substring(0, cursorPosition);
        const after = newEventText.substring(cursorPosition);

        const updatedBefore = before.replace(/#\S*$/, `#${mention} `);
        setNewEventText(updatedBefore + after);
        setShowMentions(false);

        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 0);
    };

    const handleAddEvent = async () => {
        setLoading(true);
        if (!newEventText.trim()) return;

        const uid = localStorage.getItem('userId') || '';

        const hashMatch = newEventText.match(/#(\S+)/);
        let memberName = '';
        let emailId = '';

        if (hashMatch && hashMatch[1]) {
            const hashText = hashMatch[1];

            if (isValidEmail(hashText)) {
                emailId = hashText;
            } else if (memberNames.includes(hashText.toLowerCase())) {
                memberName = hashText;
            }
        }

        // console.log('🔵 emailId:', emailId);

        try {
            await addSmartNotes({
                note: newEventText,
                members: memberName,
                email: emailId,
                userId: uid,
                source: source,
            });

            message.success('Event saved successfully!');
            setNewEventText('');
        } catch (error) {
            console.error(error);
            message.error('Failed to save event');
        }
        setLoading(false);
    };

    const filteredMembers = memberNames.filter((member) =>
        member.toLowerCase().startsWith(mentionQuery.toLowerCase())
    );

    const handleCheckboxChange = (email: string, checked: boolean) => {
        if (checked) {
            if (setBackup) {
                setBackup((prev: any) => Array.isArray(prev) ? [...prev, email] : [email]);
            }
        } else {
            if (setBackup) {
                setBackup((prev: any) => Array.isArray(prev) ? prev.filter((e) => e !== email) : []);
            }
        }
    };

    return (
        <div style={{ marginBottom: '7px' }}>
            {/* Try Suggestions */}
            {/* <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    fontSize: 11,
                    color: '#6b7280',
                    marginBottom: 8,
                }}
            >
                <span style={{ fontWeight: 600 }}>Try:</span>
                {frequentNotes.map((example, index) => (
                    <Tag
                        key={index}
                        onClick={() => setNewEventText(example)}
                        style={{
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            fontSize: 10,
                        }}
                    >
                        "{example}"
                    </Tag>
                ))}
            </div> */}

            {/* Input + Button */}
            <div
                ref={containerRef}
                style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
                <Input
                    ref={inputRef}
                    value={newEventText}
                    onChange={handleInputChange}
                    onPressEnter={handleAddEvent}
                    placeholder="Try: 'Meet with #emma or #name@email.com tomorrow 5pm'"
                    style={{
                        borderRadius: 10,
                        padding: '10px 12px',
                        fontSize: 13,
                        flex: 1,
                        backgroundColor: '#fff',
                        border: '1px solid #d1d5db',
                        caretColor: 'black'
                    }}

                />
                <Button
                    type="primary"
                    shape="circle"
                    icon={<ArrowRightOutlined />}
                    onClick={handleAddEvent}
                    style={{
                        height: 44,
                        width: 44,
                        fontSize: 16,
                        backgroundColor: PRIMARY_COLOR,
                        borderColor: PRIMARY_COLOR,
                    }}
                    loading={loading}
                />

                {showMentions && (
                    <div
                        style={{
                            position: 'absolute',
                            top: hashPosition.top + 53,
                            left: hashPosition.left + 230,
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            padding: '4px 8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 10,
                            minWidth: 200,
                        }}
                    >
                        {filteredMembers.map((member) => (
                            <div
                                key={member}
                                onClick={() => handleSelectMention(member)}
                                style={{
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: '#333',
                                }}
                            >
                                #{member}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Connected Account Section */}
            {/* <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                    Backup Account :
                </Text>
                {Object.entries(personColors).map(([name, { color, email }]) => {
                    const isChecked = backup?.includes(email);
                    return (
                        <div
                            key={email}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: `${color}1A`,
                                padding: '6px 10px',
                                borderRadius: '20px',
                                border: `1px solid ${color}`,
                                fontSize: 13,
                                fontWeight: 500,
                                color: color,
                            }}
                        >
                            <Checkbox
                                style={{ marginRight: 8 }}
                                checked={isChecked}
                                // defaultChecked
                                onChange={(e) => handleCheckboxChange(email ?? '', e.target.checked)}
                            />
                            <div
                                style={{
                                    width: 22,
                                    height: 22,
                                    backgroundColor: color,
                                    color: 'white',
                                    borderRadius: '50%',
                                    textAlign: 'center',
                                    lineHeight: '22px',
                                    fontWeight: 600,
                                    marginRight: 8,
                                    flexShrink: 0,
                                }}
                            >
                                {name[0]}
                            </div>
                            {email}
                            <EditOutlined style={{ marginLeft: 4, color: color, cursor: 'pointer' }} />
                        </div>
                    );
                })}
            </div> */}
        </div>
    );

};

export default SmartInputBox;