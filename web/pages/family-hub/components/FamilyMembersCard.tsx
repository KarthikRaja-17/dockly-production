import React, { useState } from 'react';
import { Card, Avatar, Button, Space, Typography, Row, Col, Modal, Tag } from 'antd';
import { PlusOutlined, UserOutlined, CloseOutlined, UsergroupAddOutlined, HeartOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import FamilyInviteForm from '../FamilyInviteForm';
import PetInviteForm from '../PetsInviteForm';
import FamilyWithoutInviteForm from '../FamilyWithoutInvite';
import ProfileClient from '../../../app/[username]/family-hub/profile/[id]/profileClient';
import { PRIMARY_COLOR } from '../../../app/comman';

const { Text, Title } = Typography;

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface FamilyMember {
    id: number;
    name: string;
    role: string;
    type: 'family' | 'pets';
    color: string;
    initials: string;
    status?: 'pending' | 'accepted';
    isPet?: boolean;
}

interface FamilyMembersCardProps {
    familyMembers: FamilyMember[];
    currentFamilyName?: string;
    activeFilter: 'all' | 'family' | 'pets';
    setActiveFilter: (filter: 'all' | 'family' | 'pets') => void;
    handleAddMember: (type: string) => void;
    selectedMemberId: number | null;
    setSelectedMemberId: (id: number | null) => void;
    onMemberAdded: () => Promise<void>;
}

const capitalizeEachWord = (str: string) => {
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.charAt(1).toLowerCase()
    );
};

const FamilyMembersCard: React.FC<FamilyMembersCardProps> = ({
    familyMembers,
    currentFamilyName,
    activeFilter,
    setActiveFilter,
    handleAddMember,
    selectedMemberId,
    setSelectedMemberId,
    onMemberAdded
}) => {
    const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
    const [isFamilyOptionsVisible, setIsFamilyOptionsVisible] = useState(false);
    const [isFamilyInviteVisible, setIsFamilyInviteVisible] = useState(false);
    const [isPetInviteVisible, setIsPetInviteVisible] = useState(false);
    const [isFamilyWithoutInviteVisible, setIsFamilyWithoutInviteVisible] = useState(false);

    const filteredMembers = (familyMembers || []).filter(member => {
        if (activeFilter === 'all') return true;
        return member.type === activeFilter;
    });

    const handleMemberClick = (memberId: number) => {
        setSelectedMemberId(memberId);
    };

    const handleCloseProfile = () => {
        setSelectedMemberId(null);
    };

    const handlePlusClick = () => {
        setIsSelectionModalVisible(true);
    };

    const handleSelectionModalClose = () => {
        setIsSelectionModalVisible(false);  
    };

    const handleFamilyMemberSelect = () => {
        setIsSelectionModalVisible(false);
        setIsFamilyOptionsVisible(true);
    };

    const handlePetSelect = () => {
        setIsSelectionModalVisible(false);
        setIsPetInviteVisible(true);
    };

    const handleInviteOption = () => {
        setIsFamilyOptionsVisible(false);
        setIsFamilyInviteVisible(true);
    };

    const handleWithoutInviteOption = () => {
        setIsFamilyOptionsVisible(false);
        setIsFamilyWithoutInviteVisible(true);
    };

    const handleBackToSelection = () => {
        setIsFamilyOptionsVisible(false);
        setIsSelectionModalVisible(true);
    };

    const handleFamilyInviteSubmit = async (formData: any) => {
        console.log('Family member added:', formData);
        setIsFamilyInviteVisible(false);
        // Refresh the family members list from API
        await onMemberAdded();
    };

    const handlePetInviteSubmit = async (formData: any) => {
        console.log('Pet added:', formData);
        setIsPetInviteVisible(false);
        // Refresh the family members list from API
        await onMemberAdded();
    };

    const handleFamilyWithoutInviteSubmit = async (formData: any) => {
        console.log('Family member added without invite:', formData);
        setIsFamilyWithoutInviteVisible(false);
        // Refresh the family members list from API
        await onMemberAdded();
    };

    const SelectionModal = () => (
        <Modal
            open={isSelectionModalVisible}
            onCancel={handleSelectionModalClose}
            footer={null}
            width={420}
            centered
            style={{ borderRadius: '16px' }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }
            }}
        >
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '24px',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                    <PlusOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
                
                <Title level={3} style={{ 
                    color: 'white', 
                    margin: '0 0 6px 0',
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700
                }}>
                    Add to Your Family
                </Title>
                
                <Text style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '14px',
                    fontFamily: FONT_FAMILY
                }}>
                    Choose what you'd like to add
                </Text>
            </div>

            <div style={{ 
                background: 'white',
                padding: '20px',
                display: 'flex',
                gap: '16px',
                justifyContent: 'center'
            }}>
                {/* Family Member Option */}
                <div
                    onClick={handleFamilyMemberSelect}
                    style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #f0f2f5',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.3)';
                        e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#f0f2f5';
                    }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    }}>
                        <UsergroupAddOutlined style={{ fontSize: '20px', color: 'white' }} />
                    </div>
                    
                    <Title level={5} style={{ 
                        margin: '0 0 6px 0',
                        fontFamily: FONT_FAMILY,
                        color: '#1e293b'
                    }}>
                        Family Member
                    </Title>
                    
                    <Text style={{ 
                        color: '#64748b',
                        fontSize: '12px',
                        fontFamily: FONT_FAMILY,
                        lineHeight: '1.4',
                        display: 'block',
                        marginBottom: '8px'
                    }}>
                        Add parents, children, spouse or relatives
                    </Text>

                    <Tag 
                        color="blue" 
                        style={{ 
                            borderRadius: '8px',
                            padding: '2px 8px',
                            fontSize: '10px',
                            fontWeight: 500
                        }}
                    >
                        People
                    </Tag>
                </div>

                {/* Pet Option */}
                <div
                    onClick={handlePetSelect}
                    style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #f0f2f5',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #fef7f0 0%, #fed7aa 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(251, 146, 60, 0.3)';
                        e.currentTarget.style.borderColor = '#fb923c';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#f0f2f5';
                    }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        boxShadow: '0 8px 25px rgba(251, 146, 60, 0.4)'
                    }}>
                        <HeartOutlined style={{ fontSize: '20px', color: 'white' }} />
                    </div>
                    
                    <Title level={5} style={{ 
                        margin: '0 0 6px 0',
                        fontFamily: FONT_FAMILY,
                        color: '#1e293b'
                    }}>
                        Pet
                    </Title>
                    
                    <Text style={{ 
                        color: '#64748b',
                        fontSize: '12px',
                        fontFamily: FONT_FAMILY,
                        lineHeight: '1.4',
                        display: 'block',
                        marginBottom: '8px'
                    }}>
                        Add dogs, cats, birds and more
                    </Text>

                    <Tag 
                        color="orange" 
                        style={{ 
                            borderRadius: '8px',
                            padding: '2px 8px',
                            fontSize: '10px',
                            fontWeight: 500
                        }}
                    >
                        Animals
                    </Tag>
                </div>
            </div>

            <div style={{
                background: '#f8fafc',
                padding: '16px 20px',
                textAlign: 'center',
                borderTop: '1px solid #e2e8f0'
            }}>
                <Button
                    onClick={handleSelectionModalClose}
                    size="middle"
                    style={{
                        borderRadius: '8px',
                        padding: '4px 20px',
                        height: 'auto',
                        fontFamily: FONT_FAMILY,
                        fontWeight: 500,
                        border: '1px solid #d1d5db',
                        color: '#6b7280'
                    }}
                >
                    Cancel
                </Button>
            </div>
        </Modal>
    );

    const FamilyOptionsModal = () => (
        <Modal
            open={isFamilyOptionsVisible}
            onCancel={() => setIsFamilyOptionsVisible(false)}
            footer={null}
            width={380}
            centered
            style={{ borderRadius: '16px' }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }
            }}
        >
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                    <UsergroupAddOutlined style={{ fontSize: '20px', color: 'white' }} />
                </div>
                
                <Title level={4} style={{ 
                    color: 'white', 
                    margin: '0 0 4px 0',
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700
                }}>
                    Add Family Member
                </Title>
                
                <Text style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '13px',
                    fontFamily: FONT_FAMILY
                }}>
                    Choose how to add them
                </Text>
            </div>

            <div style={{ 
                background: 'white',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {/* Add Through Invite Option */}
                <div
                    onClick={handleInviteOption}
                    style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #f0f2f5',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                        e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#f0f2f5';
                    }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <MailOutlined style={{ fontSize: '16px', color: 'white' }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <Title level={5} style={{ 
                            margin: '0 0 4px 0',
                            fontFamily: FONT_FAMILY,
                            color: '#1e293b'
                        }}>
                            Add Through Invite
                        </Title>
                        
                        <Text style={{ 
                            color: '#64748b',
                            fontSize: '12px',
                            fontFamily: FONT_FAMILY,
                            lineHeight: '1.4'
                        }}>
                            Send invitation via email
                        </Text>
                    </div>
                </div>

                {/* Add Without Invite Option */}
                <div
                    onClick={handleWithoutInviteOption}
                    style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #f0f2f5',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                        e.currentTarget.style.borderColor = '#22c55e';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#f0f2f5';
                    }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <UserAddOutlined style={{ fontSize: '16px', color: 'white' }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <Title level={5} style={{ 
                            margin: '0 0 4px 0',
                            fontFamily: FONT_FAMILY,
                            color: '#1e293b'
                        }}>
                            Add Without Invite
                        </Title>
                        
                        <Text style={{ 
                            color: '#64748b',
                            fontSize: '12px',
                            fontFamily: FONT_FAMILY,
                            lineHeight: '1.4'
                        }}>
                            Add directly to family
                        </Text>
                    </div>
                </div>
            </div>

            <div style={{
                background: '#f8fafc',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid #e2e8f0'
            }}>
                <Button
                    onClick={handleBackToSelection}
                    size="middle"
                    style={{
                        borderRadius: '8px',
                        padding: '4px 16px',
                        height: 'auto',
                        fontFamily: FONT_FAMILY,
                        fontWeight: 500,
                        border: '1px solid #d1d5db',
                        color: '#6b7280'
                    }}
                >
                    ← Back
                </Button>
                <Button
                    onClick={() => setIsFamilyOptionsVisible(false)}
                    size="middle"
                    style={{
                        borderRadius: '8px',
                        padding: '4px 16px',
                        height: 'auto',
                        fontFamily: FONT_FAMILY,
                        fontWeight: 500,
                        border: '1px solid #d1d5db',
                        color: '#6b7280'
                    }}
                >
                    Cancel
                </Button>
            </div>
        </Modal>
    );

    return (
        <>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 600 }}>
                            {currentFamilyName ? `${currentFamilyName} Members` : 'Family Members'} ({filteredMembers.filter(m => m.status !== 'pending').length})
                        </span>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={handlePlusClick}
                        style={{
                            borderRadius: "12px",
                            background: PRIMARY_COLOR,
                            border: "none",
                            fontFamily: FONT_FAMILY,
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }}
                    />
                }
                style={{ marginBottom: '12px', borderRadius: '12px' }}
                bodyStyle={{ padding: '16px' }}
            >
                <Row gutter={[20, 20]} style={{ marginBottom: 0 }}>
                    {filteredMembers.map((member) => {
                        // ✅ Decide which color to display
                        let displayColor = member.color;
                        if (member.role === "me") {
                        displayColor = "#0033FF"; // always blue for self
                        } else if (member.status === "pending") {
                        displayColor = "#A0AEC0"; // gray for pending
                        }

                        return (
                        <Col
                            key={member.id}
                            style={{
                            minWidth: "120px",
                            maxWidth: "280px",
                            width: "auto",
                            flex: "0 0 auto",
                            }}
                        >
                            <Card
                            size="small"
                            hoverable
                            onClick={() => handleMemberClick(member.id)}
                            style={{
                                textAlign: "left",
                                height: "60px",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                transition: "all 0.3s ease",
                                background:
                                "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                                opacity: member.status === "pending" ? 0.6 : 1,
                                position: "relative",
                                marginBottom: "10px",
                                cursor: "pointer",
                                borderColor:
                                selectedMemberId === member.id ? displayColor : "#e2e8f0",
                            }}
                            styles={{
                                body: {
                                padding: "12px 16px",
                                display: "flex",
                                alignItems: "center",
                                },
                            }}
                            >
                            {member.status === "pending" && (
                                <span
                                style={{
                                    position: "absolute",
                                    top: 4,
                                    right: 8,
                                    backgroundColor: "#f59e0b",
                                    color: "white",
                                    fontSize: "7px",
                                    padding: "1px 4px",
                                    borderRadius: "12px",
                                    fontWeight: 500,
                                    textTransform: "uppercase",
                                    fontFamily: FONT_FAMILY,
                                }}
                                >
                                Not accepted
                                </span>
                            )}

                            <div
                                style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                }}
                            >
                                <Avatar
                                size={36}
                                style={{
                                    background: `linear-gradient(135deg, ${displayColor} 0%, ${displayColor}dd 100%)`,
                                    border: "2px solid white",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    marginRight: 12,
                                    flexShrink: 0,
                                }}
                                icon={
                                    !member.isPet && !member.initials ? (
                                    <UserOutlined />
                                    ) : undefined
                                }
                                >
                                {member.initials}
                                </Avatar>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    marginBottom: 2,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    fontFamily: FONT_FAMILY,
                                    }}
                                >
                                    {member.name}
                                </div>
                                </div>
                            </div>
                            </Card>
                        </Col>
                        );
                    })}
                </Row>
            </Card>

            {/* Profile Details Section */}
            {selectedMemberId && (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 600 }}>
                                Profile Details
                            </span>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={handleCloseProfile}
                                size="small"
                                style={{ color: '#666', fontFamily: FONT_FAMILY }}
                            />
                        </div>
                    }
                    style={{ marginBottom: '12px', borderRadius: '12px' }}
                    bodyStyle={{ padding: 0, margin: 0 }}
                >
                    <ProfileClient
                        memberId={selectedMemberId.toString()}
                        onBack={handleCloseProfile}
                    />
                </Card>
            )}

            {/* Selection Modal */}
            <SelectionModal />

            {/* Family Options Modal */}
            <FamilyOptionsModal />

            {/* Family Invite Form Modal */}
            <FamilyInviteForm
                visible={isFamilyInviteVisible}
                onCancel={() => setIsFamilyInviteVisible(false)}
                onSubmit={handleFamilyInviteSubmit}
            />
            {/* Family Without Invite Form Modal */}
            <FamilyWithoutInviteForm
                visible={isFamilyWithoutInviteVisible}
                onCancel={() => setIsFamilyWithoutInviteVisible(false)}
                onSubmit={handleFamilyWithoutInviteSubmit}
            />

            {/* Pet Invite Form Modal */}
            <PetInviteForm
                visible={isPetInviteVisible}
                onCancel={() => setIsPetInviteVisible(false)}
                onSubmit={handlePetInviteSubmit}
            />
        </>
    );
};

export default FamilyMembersCard;