'use client';
import React, { useState } from 'react';
import { Card, Button, List, Input, Typography, message } from 'antd';
import { CommentOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { Note } from '../right-section';

const { Title, Text } = Typography;

interface FamilyNotesCardProps {
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    selectedUser: string;
    localStep: string;
    setLocalStep: (step: string) => void;
    isMobile: boolean;
}

const FamilyNotesCard: React.FC<FamilyNotesCardProps> = ({
    notes,
    setNotes,
    selectedUser,
    localStep,
    setLocalStep,
    isMobile,
}) => {
    const [newNote, setNewNote] = useState<Note>({
        title: '',
        content: '',
        addedBy: selectedUser,
        addedTime: dayjs(),
    });
    const [editNoteIndex, setEditNoteIndex] = useState<number | null>(null);

    const handleAddNote = () => {
        if (!newNote.title.trim() || !newNote.content.trim() || !selectedUser) {
            message.error('Please fill in all note fields.');
            return;
        }
        setNotes([...notes, { ...newNote, addedBy: selectedUser, addedTime: dayjs() }]);
        setNewNote({ title: '', content: '', addedBy: selectedUser, addedTime: dayjs() });
        setLocalStep('family');
        message.success('Note added successfully!');
    };

    const handleEditNote = () => {
        if (!newNote.title.trim() || !newNote.content.trim() || !selectedUser || editNoteIndex === null) {
            message.error('Please fill in all note fields.');
            return;
        }
        const updatedNotes = [...notes];
        updatedNotes[editNoteIndex] = {
            ...newNote,
            addedBy: notes[editNoteIndex].addedBy,
            addedTime: notes[editNoteIndex].addedTime,
            editedBy: selectedUser,
            editedTime: dayjs(),
        };
        setNotes(updatedNotes);
        setNewNote({ title: '', content: '', addedBy: selectedUser, addedTime: dayjs() });
        setEditNoteIndex(null);
        setLocalStep('family');
        message.success('Note updated successfully!');
    };

    return (
        <Card
            style={{
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '16px',
                width: '100%',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <CommentOutlined style={{ fontSize: '20px', color: '#eb2f96', marginRight: '10px' }} />
                <Title level={4} style={{ color: '#eb2f96', margin: 0 }}>
                    Family Notes
                </Title>
            </div>
            <List
                dataSource={notes}
                renderItem={(note, index) => (
                    <List.Item
                        actions={[
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setNewNote(note);
                                    setEditNoteIndex(index);
                                    setLocalStep('editNote');
                                }}
                                style={{ padding: '0', color: '#1890ff' }}
                            >
                                Edit
                            </Button>,
                        ]}
                        style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}
                    >
                        <List.Item.Meta
                            title={<Text style={{ fontSize: '14px' }}>{note.title}</Text>}
                            description={
                                <div>
                                    <Text style={{ fontSize: '12px', color: '#666' }}>{note.content}</Text>
                                    <br />
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        Added by {note.addedBy} on {note.addedTime.format('MMM D, YYYY h:mm A')}
                                    </Text>
                                    {note.editedBy && note.editedTime && (
                                        <>
                                            <br />
                                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                                Edited by {note.editedBy} on {note.editedTime.format('MMM D, YYYY h:mm A')}
                                            </Text>
                                        </>
                                    )}
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
            <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                    setNewNote({ title: '', content: '', addedBy: selectedUser, addedTime: dayjs() });
                    setEditNoteIndex(null);
                    setLocalStep('addNote');
                }}
                style={{ marginTop: '10px', padding: '0', color: '#1890ff', width: isMobile ? '100%' : 'auto' }}
            >
                Add Note
            </Button>
            {(localStep === 'addNote' || localStep === 'editNote') && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '5px' }}>
                    <Title level={5}>{localStep === 'addNote' ? 'Add Note' : 'Edit Note'}</Title>
                    <Input
                        placeholder="Note Title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                    />
                    <Input.TextArea
                        placeholder="Note Content"
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                        rows={4}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                        <Button
                            onClick={() => {
                                setNewNote({ title: '', content: '', addedBy: selectedUser, addedTime: dayjs() });
                                setEditNoteIndex(null);
                                setLocalStep('family');
                            }}
                            style={{ borderRadius: '20px', padding: '5px 15px', flex: isMobile ? '1 1 100%' : 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => (localStep === 'addNote' ? handleAddNote() : handleEditNote())}
                            style={{
                                borderRadius: '20px',
                                padding: '5px 15px',
                                backgroundColor: '#1890ff',
                                borderColor: '#1890ff',
                                flex: isMobile ? '1 1 100%' : 'none',
                            }}
                        >
                            {localStep === 'addNote' ? 'Add' : 'Save'}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default React.memo(FamilyNotesCard);