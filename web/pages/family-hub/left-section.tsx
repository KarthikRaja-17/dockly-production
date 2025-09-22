'use client';
import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import FamilyMembersCard from './leftsection/familymembers';
import FamilyCalendarCard from './leftsection/familycalendar';
import SchedulesCard from './leftsection/sechdules';
import EmergencyContactsCard from './leftsection/emergencycontacts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export interface FamilyMember {
    name: string;
    relationship: string;
    email?: string;
    phone?: string;
    accessCode?: string;
    method: 'Email' | 'Mobile' | 'Access Code';
    permissions: PermissionState;
    sharedItems: { [key: string]: string[] };
    uid: string;
}

interface PermissionState {
    type: 'Full Access' | 'Custom Access';
    allowAdd?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowInvite?: boolean;
    notify?: boolean;
}

interface Event {
    date: Dayjs;
    title: string;
    color: string;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

export interface Schedule {
    id?: string;
    completedTime: boolean;
    status: string;
    updated_at: string | undefined;
    name: string;
    type: string;
    date: Dayjs;
    time: string;
    place: string;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
    user_id?: string;
}

interface LeftSectionProps {
    setIsModalVisible: (visible: boolean) => void;
    setEditMember: (member: FamilyMember | null) => void;
    familyMembers: FamilyMember[];
    onDelete: (uid: string) => void;
    userId: string; // Added userId prop
}

const LeftSection: React.FC<LeftSectionProps> = ({ setIsModalVisible, setEditMember, familyMembers, onDelete, userId }) => {
    const router = useRouter();
    const [localStep, setLocalStep] = useState<string>('family');
    const [selectedUser, setSelectedUser] = useState<string>(
        Array.isArray(familyMembers) && familyMembers.length > 0 ? familyMembers[0].name : ''
    );
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (familyMembers.length > 0 && !familyMembers.some((member) => member.name === selectedUser)) {
            setSelectedUser(familyMembers[0].name);
        }
    }, [familyMembers, selectedUser]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
            }}
        >
            <FamilyMembersCard
                familyMembers={familyMembers}
                setFamilyMembers={() => { }} // Placeholder, not used since state is managed in parent
                setIsModalVisible={setIsModalVisible}
                setEditMember={setEditMember}
                onDelete={onDelete}
                isMobile={isMobile}
            />
            <FamilyCalendarCard
                upcomingEvents={upcomingEvents}
                setUpcomingEvents={setUpcomingEvents}
                schedules={[]}
                familyMembers={familyMembers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                localStep={localStep}
                setLocalStep={setLocalStep}
                isMobile={isMobile}
            />
            <SchedulesCard
                familyMembers={familyMembers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                localStep={localStep}
                setLocalStep={setLocalStep}
                selectedDate={selectedDate}
                isMobile={isMobile}
                userId={userId}
            />
            <EmergencyContactsCard
                familyMembers={familyMembers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                localStep={localStep}
                setLocalStep={setLocalStep}
                isMobile={isMobile}
                userId={userId}
            />
        </div>
    );
};

export default React.memo(LeftSection);