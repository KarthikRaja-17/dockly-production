'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, List, Input, Select, Typography, message, Modal, Alert } from 'antd';
import { ContactsOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { FamilyMember } from '../left-section';
import { addContacts, getUserContacts } from '../../../services/family';
import { useGlobalLoading } from '../../../app/loadingContext';

const { Title, Text } = Typography;
const { Option } = Select;

const contactColors = [
    '#fff7e6', // Light Orange
    '#e6f7ff', // Light Blue
    '#f6ffed', // Light Green
    '#fff0f6', // Light Pink
    '#f9f0ff', // Light Purple
];

interface Contact {
    id?: string;
    name: string;
    role: string;
    phone: string;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

interface EmergencyContactsCardProps {
    familyMembers?: FamilyMember[];
    selectedUser: string;
    setSelectedUser: (user: string) => void;
    localStep: string;
    setLocalStep: (step: string) => void;
    isMobile: boolean;
    userId: string;
}

const EmergencyContactsCard: React.FC<EmergencyContactsCardProps> = ({
    familyMembers = [],
    selectedUser,
    setSelectedUser,
    localStep,
    setLocalStep,
    isMobile,
    userId,
}) => {
    const getStoredUser = (): string => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('username') || selectedUser || 'Unknown User';
        }
        return selectedUser || 'Unknown User';
    };

    const [newContact, setNewContact] = useState<Contact>({
        name: '',
        role: '',
        phone: '',
        addedBy: getStoredUser(),
        addedTime: dayjs(),
    });
    const [contacts, setContacts] = useState<Contact[]>([]);
    const { loading, setLoading } = useGlobalLoading();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    useEffect(() => {
        setNewContact((prev) => ({
            ...prev,
            addedBy: getStoredUser(),
        }));
    }, [selectedUser]);

    useEffect(() => {
        getContacts();
        if (!selectedUser && familyMembers.length > 0) {
            setSelectedUser(familyMembers[0].name);
        }
    }, [userId, familyMembers, setSelectedUser]);

    const getContacts = async () => {
        setLoading(true);
        try {
            const response = await getUserContacts({ userId });
            const { status, message: responseMessage, payload } = response;
            if (status === 1 && Array.isArray(payload?.contacts)) {
                const formattedContacts = payload.contacts.map((contact: any) => ({
                    id: contact.id,
                    name: contact.name,
                    role: contact.role,
                    phone: contact.phone,
                    addedBy: contact.added_by || 'Unknown User',
                    addedTime: contact.added_time ? dayjs(contact.added_time) : dayjs(),
                    editedBy: contact.edited_by,
                    editedTime: contact.edited_time ? dayjs(contact.edited_time) : undefined,
                }));
                setContacts(formattedContacts);
            } else {
                console.warn('Failed to fetch contacts:', responseMessage);
                setContacts([]);
                message.error(responseMessage || 'Failed to fetch contacts');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
            message.error('Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleAddContact = async () => {
        setLoading(true);
        const currentUser = getStoredUser();
        if (!newContact.name.trim() || !newContact.role.trim() || !newContact.phone.trim() || !currentUser) {
            message.error('Please fill in all contact fields or ensure you are logged in.');
            setLoading(false);
            return;
        }
        if (!/^\+?[\d\s-]{10,}$/.test(newContact.phone)) {
            message.error('Please enter a valid phone number.');
            setLoading(false);
            return;
        }
        try {
            const contactPayload = {
                contacts: {
                    name: newContact.name,
                    role: newContact.role,
                    phone: newContact.phone,
                    addedBy: currentUser,
                },
            };
            const response = await addContacts(contactPayload);
            const { status, message: responseMessage, payload } = response;
            if (status === 1) {
                setContacts([
                    ...contacts,
                    {
                        id: payload.id,
                        ...newContact,
                        addedBy: currentUser,
                        addedTime: dayjs(),
                    },
                ]);
                setNewContact({ name: '', role: '', phone: '', addedBy: currentUser, addedTime: dayjs() });
                setLocalStep('family');
                message.success('Contact added successfully!');
            } else {
                message.error(responseMessage || 'Failed to add contact');
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            message.error('Failed to add contact');
        } finally {
            setLoading(false);
        }
    };

    const displayedContacts = (contacts ?? []).slice(0, 2);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const getContactColor = (index: number) => {
        return contactColors[index % contactColors.length];
    };

    return (
        <Card
            style={{
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '16px',
                width: '100%',
                padding: '8px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <ContactsOutlined style={{ fontSize: '20px', color: '#ff7a45', marginRight: '10px' }} />
                <Title level={4} style={{ color: '#ff7a45', margin: 0 }}>
                    Emergency Contacts
                </Title>
            </div>
            {familyMembers.length === 0 && (
                <Alert
                    message="No family members available. Please add a family member to enable adding contacts."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '10px' }}
                />
            )}
            {loading ? (
                <Text>Loading contacts...</Text>
            ) : (
                <>
                    <List
                        dataSource={displayedContacts}
                        renderItem={(contact, index) => (
                            <List.Item
                                style={{
                                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                                    backgroundColor: getContactColor(index),
                                    borderRadius: '5px',
                                    marginBottom: '8px',
                                    padding: '12px',
                                }}
                            >
                                <List.Item.Meta
                                    title={<Text style={{ fontSize: '14px' }}>{contact.name}</Text>}
                                    description={
                                        <div>
                                            <Text style={{ fontSize: '12px', color: '#666' }}>{contact.role}</Text>
                                            <br />
                                            <Text style={{ fontSize: '12px', color: '#666' }}>{contact.phone}</Text>
                                            <br />
                                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                                Added by {contact.addedBy} on {contact.addedTime.format('MMM D, YYYY h:mm A')}
                                            </Text>
                                            {contact.editedBy && contact.editedTime && (
                                                <>
                                                    <br />
                                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                                        Edited by {contact.editedBy} on {contact.editedTime.format('MMM D, YYYY h:mm A')}
                                                    </Text>
                                                </>
                                            )}
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    {(contacts ?? []).length > 2 && (
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={showModal}
                            style={{
                                marginBottom: '10px',
                                borderRadius: '20px',
                                backgroundColor: 'rgba(3, 125, 127, 0.8)',
                                borderColor: '#1890ff',
                                marginLeft: isMobile ? '0' : '200px',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: isMobile ? '100%' : 'auto',
                            }}
                        >
                            View All ({contacts.length})
                        </Button>
                    )}
                    <Modal
                        title={null}
                        open={isModalVisible}
                        onCancel={handleModalClose}
                        footer={[
                            <Button key="close" onClick={handleModalClose}>
                                Close
                            </Button>,
                        ]}
                        width={isMobile ? '90%' : '600px'}
                        bodyStyle={{
                            padding: 0,
                            maxHeight: (contacts ?? []).length > 5 ? '400px' : 'auto',
                            overflowY: (contacts ?? []).length > 5 ? 'auto' : 'visible',
                        }}
                    >
                        <div
                            style={{
                                position: 'sticky',
                                top: 0,
                                backgroundColor: '#fff',
                                zIndex: 1,
                                padding: '16px 24px',
                                borderBottom: '1px solid #f0f0f0',
                            }}
                        >
                            <Title level={4} style={{ margin: 0 }}>
                                All Emergency Contacts
                            </Title>
                        </div>
                        <div style={{ padding: '16px 24px' }}>
                            <List
                                dataSource={contacts ?? []}
                                renderItem={(contact, index) => (
                                    <List.Item
                                        style={{
                                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                                            backgroundColor: getContactColor(index),
                                            borderRadius: '5px',
                                            marginBottom: '8px',
                                            padding: '12px',
                                        }}
                                    >
                                        <List.Item.Meta
                                            title={<Text style={{ fontSize: '14px' }}>{contact.name}</Text>}
                                            description={
                                                <div>
                                                    <Text style={{ fontSize: '12px', color: '#666' }}>{contact.role}</Text>
                                                    <br />
                                                    <Text style={{ fontSize: '12px', color: '#666' }}>{contact.phone}</Text>
                                                    <br />
                                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                                        Added by {contact.addedBy} on {contact.addedTime.format('MMM D, YYYY h:mm A')}
                                                    </Text>
                                                    {contact.editedBy && contact.editedTime && (
                                                        <>
                                                            <br />
                                                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                                                Edited by {contact.editedBy} on {contact.editedTime.format('MMM D, YYYY h:mm A')}
                                                            </Text>
                                                        </>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Modal>
                </>
            )}
            {familyMembers.length > 0 && (
                <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setNewContact({ name: '', role: '', phone: '', addedBy: getStoredUser(), addedTime: dayjs() });
                        setLocalStep('addContact');
                    }}
                    style={{ marginTop: '10px', padding: '0', color: '#1890ff', width: isMobile ? '100%' : 'auto' }}
                >
                    Add Contact
                </Button>
            )}
            {localStep === 'addContact' && familyMembers.length > 0 && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '5px' }}>
                    <Title level={5}>Add Emergency Contact</Title>
                    <Input
                        placeholder="Contact Name (e.g., Dr. Smith)"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                    />
                    <Input
                        placeholder="Role (e.g., Doctor)"
                        value={newContact.role}
                        onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                    />
                    <Input
                        placeholder="Phone (e.g., +1234567890)"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                        <Button
                            onClick={() => {
                                setNewContact({ name: '', role: '', phone: '', addedBy: getStoredUser(), addedTime: dayjs() });
                                setLocalStep('family');
                            }}
                            style={{ borderRadius: '20px', padding: '5px 15px', flex: isMobile ? '1 1 100%' : 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleAddContact}
                            loading={loading}
                            style={{
                                borderRadius: '20px',
                                padding: '5px 15px',
                                backgroundColor: '#1890ff',
                                borderColor: '#1890ff',
                                flex: isMobile ? '1 1 100%' : 'none',
                            }}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default React.memo(EmergencyContactsCard);