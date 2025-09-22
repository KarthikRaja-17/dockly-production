'use client';
import React, { useState, useEffect } from 'react';
import { message, UploadFile, UploadProps } from 'antd';
import ImportantDocumentsCard from './rightsection/documents';
import FamilyGuidelinesCard from './rightsection/familyguideline';
import FamilyNotesCard from './rightsection/familynotes';
import MealPlansCard from './rightsection/mealplan';
import SharedTasksCard from './rightsection/sharedtasks';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { FamilyMember } from './rightsection/sharedtasks';

interface Document {
    id: string;
    title: string;
    category: string;
    file: UploadFile | null;
    fileUrl?: string;
    uploadedBy: string;
    uploadTime: Dayjs;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

export interface Guideline {
    title: string;
    description: string;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

export interface Note {
    id?: string;
    title: string;
    content: string;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

interface MealPlan {
    id?: string;
    name?: string;
    date: Dayjs;
    mealType: string;
    description: string;
    mealTime: Dayjs;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

interface Task {
    id?: string;
    title: string;
    description: string;
    dueDate: Dayjs;
    assignedTo: string;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

export interface RightSectionProps {
    familyMembers?: FamilyMember[];
}

const RightSection: React.FC<RightSectionProps> = ({ familyMembers = [] }) => {
    const [localStep, setLocalStep] = useState<string>('right');
    const [selectedUser, setSelectedUsers] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('username') || (Array.isArray(familyMembers) && familyMembers[0]?.name) || 'John Doe';
        }
        return (Array.isArray(familyMembers) && familyMembers[0]?.name) || 'John Doe';
    });
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: '1',
            title: 'Family Insurance Policy',
            category: 'Insurance',
            file: null,
            fileUrl: undefined,
            uploadedBy: 'John Doe',
            uploadTime: dayjs(),
            addedBy: 'John Doe',
            addedTime: dayjs(),
        },
        {
            id: '2',
            title: 'Mortgage Agreement',
            category: 'Mortgage',
            file: null,
            fileUrl: undefined,
            uploadedBy: 'Jane Doe',
            uploadTime: dayjs(),
            addedBy: 'Jane Doe',
            addedTime: dayjs(),
        },
    ]);
    const [guidelines, setGuidelines] = useState<Guideline[]>([]);
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    // Detect mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        if (typeof window !== 'undefined') {
            handleResize(); // Initial check
            window.addEventListener('resize', handleResize);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    return (
        <>
            <ImportantDocumentsCard
                documents={documents}
                setDocuments={setDocuments}
                selectedUser={selectedUser}
                localStep={localStep}
                setLocalStep={setLocalStep}
                isMobile={isMobile}
                familyMembers={familyMembers}
                setSelectedUser={setSelectedUsers}
            />
            <FamilyGuidelinesCard
                guidelines={guidelines}
                setGuidelines={setGuidelines}
                selectedUser={selectedUser}
                localStep={localStep}
                setLocalStep={setLocalStep}
                isMobile={isMobile}
            />
            {/* <FamilyNotesCard
        notes={notes}
        setNotes={setNotes}
        selectedUser={selectedUser}
        localStep={localStep}
        setLocalStep={setLocalStep}
        isMobile={isMobile}
      /> */}
            <MealPlansCard
                mealPlans={mealPlans}
                setMealPlans={setMealPlans}
                familyMembers={familyMembers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUsers}
                localStep={localStep}
                setLocalStep={setLocalStep}
                isMobile={isMobile}
            />
            <SharedTasksCard
                tasks={tasks}
                setTasks={setTasks}
                familyMembers={familyMembers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUsers}
                localStep={localStep}
                setLocalStep={setLocalStep}
                isMobile={isMobile}
            />
        </>
    );
};

export default RightSection;