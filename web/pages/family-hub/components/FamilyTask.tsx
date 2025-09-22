"use client";
import { useEffect, useState } from 'react';
import { addContacts, addGuardians, addNote, addProject, addTask, DeleteTask, getAllNotes, getGuardians, getPets, getProjects, getTasks, getUserContacts, updateNote, updateTask, getUserFamilyGroups } from '../../../services/family';

import dayjs from 'dayjs';
import { message, Modal, Checkbox, Form, Avatar } from 'antd';
import FamilyTasksComponent from '../../components/familyTasksProjects';
import { useCurrentUser } from '../../../app/userContext';

type Task = {
    id: number;
    title: string;
    assignee: string;
    type: string;
    completed: boolean;
    due: string;
    dueDate?: string;
};


type Project = {
    color?: string;
    id: string;
    title: string;
    description: string;
    due_date: string;
    progress: number;
    tasks: Task[];
    visibility: string;
    created_by?: string;
    creator_name?: string;
    family_groups?: string[];
        source?: string;
};

interface FamilyGroup {
    id: string;
    name: string;
    ownerName: string;
    memberCount: number;
}

interface FamilyTasksProps {
    familyMembers: { name: string; email?: string; status?: string }[];
    currentFamilyGroupId?: string | null;
}

const FamilyTasks: React.FC<FamilyTasksProps> = ({ familyMembers,currentFamilyGroupId }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
    const [showFamilySelector, setShowFamilySelector] = useState(false);
    const [pendingProject, setPendingProject] = useState<any>(null);
    const [selectedFamilyGroups, setSelectedFamilyGroups] = useState<string[]>([]);
    const currentUser = useCurrentUser();
    
    const publicProjects = projects.filter(p => p.visibility === 'public' || p.visibility === 'undefined');
    
    useEffect(() => {
        if (currentFamilyGroupId) {
        fetchProjects();
        }
        fetchFamilyGroups();
    }, [currentFamilyGroupId]);

    const fetchFamilyGroups = async () => {
        try {
            const response = await getUserFamilyGroups();
            const { status, payload } = response;
            if (status === 1) {
                setFamilyGroups(payload.groups || []);
            }
        } catch (error) {
            console.error("Failed to fetch family groups:", error);
        }
    };

    const fetchProjects = async () => {
        if (!currentFamilyGroupId) return;

        try {
            const projRes = await getProjects({ 
                family_group_id: currentFamilyGroupId,
                source: 'familyhub'
            });
            const rawProjects = projRes.data.payload.projects || [];

            const projectsWithTasks = await Promise.all(
                rawProjects.map(async (proj: any) => {
                    const taskRes = await getTasks({ project_id: proj.id });
                    const rawTasks = taskRes.data.payload.tasks || [];

                    const tasks = rawTasks.map((task: any, i: number) => ({
                        id: task.id || i + 1,
                        title: task.title,
                        assignee: task.assignee,
                        type: task.type,
                        completed: task.completed,
                        due: task.completed
                            ? "Completed"
                            : `Due ${dayjs(task.due_date).format("MMM D")}`,
                        dueDate: task.due_date,
                    }));

                    return {
                        id: proj.id,
                        title: proj.title,
                        description: proj.description,
                        due_date: proj.due_date,
                        color: proj.color || "#667eea",
                        progress: tasks.length
                            ? Math.round(
                                (tasks.filter((t: Task) => t.completed).length / tasks.length) * 100
                            )
                            : 0,
                        tasks,
                        visibility: proj.meta?.visibility || "private",
                        source: proj.source || "",
                        created_by: proj.created_by,
                        creator_name: proj.creator_name,
                        family_groups: proj.meta?.family_groups || [],
                    };
                })
            );

            setProjects(projectsWithTasks); // ✅ no extra filtering
        } catch (err) {
            message.error("Failed to load family hub projects");
        }
    };

    const handleAddProject = async (project: {
        title: string;
        description: string;
        due_date: string;
        visibility: 'public' | 'private';
    }) => {
        // Always show family selector for familyhub projects if user has multiple family groups
        if (familyGroups.length > 1) {
            setPendingProject({
                ...project,
                source: 'familyhub',
                meta: {
                    visibility: project.visibility
                }
            });
            setSelectedFamilyGroups([localStorage.getItem('currentFamilyGroupId') || '']);
            setShowFamilySelector(true);
        } else {
            // Single family group, proceed directly
            try {
                await addProject({
                    ...project,
                    source: 'familyhub',
                    family_groups: [localStorage.getItem('currentFamilyGroupId')],
                    meta: {
                        visibility: project.visibility
                    }
                });
                message.success('Project added');
                fetchProjects(); // Call the local fetchProjects function
            } catch {
                message.error('Failed to add project');
            }
        }
    };

    const handleFamilySelectionConfirm = async () => {
        if (selectedFamilyGroups.length === 0) {
            message.error('Please select at least one family group');
            return;
        }

        try {
            await addProject({
                ...pendingProject,
                family_groups: selectedFamilyGroups
            });
            message.success('Project added');
            setShowFamilySelector(false);
            setPendingProject(null);
            setSelectedFamilyGroups([]);
            fetchProjects(); // Call the local fetchProjects function
        } catch {
            message.error('Failed to add project');
        }
    };

    const handleFamilySelectionCancel = () => {
        setShowFamilySelector(false);
        setPendingProject(null);
        setSelectedFamilyGroups([]);
    };

    const handleAddTask = async (projectId: string,
        taskData?: { title: string; due_date: string; assignee?: string }
    ) => {
        if (!taskData) return;
        try {
            await addTask({
                project_id: projectId,
                title: taskData.title,
                assignee: taskData.assignee || 'All',
                type: 'low',
                due_date: taskData.due_date,
                completed: false,
            });
            fetchProjects(); // Call the local fetchProjects function
        } catch {
            message.error('Failed to add task');
        }
    };


    const handleToggleTask = async (projectId: string, taskId: number) => {
        const project = projects.find((p) => p.id === projectId);
        const task = project?.tasks.find((t) => t.id === taskId);
        if (!task) return;

        try {
            await updateTask({ id: taskId, completed: !task.completed });
            fetchProjects(); // Call the local fetchProjects function
        } catch {
            message.error('Failed to toggle task');
        }
    };
    const [loading, setLoading] = useState(false);
    const handleDeleteTask = async (projectId: string, taskId: number) => {
            setLoading(true);
            try {
                await DeleteTask({ id: taskId });   // call your API
                fetchProjects(); // Call the local fetchProjects function              
                message.success("Task deleted");
            } catch {
                message.error("Failed to delete task");
            }
            setLoading(false);
        };

    const handleUpdateTask = async (task: Task) => {
        try {
            await updateTask({
                id: task.id,
                title: task.title,
                due_date: task.dueDate,
                assignee: task.assignee,
                type: task.type,
            });
            message.success('Task updated');
            fetchProjects(); // Call the local fetchProjects function
        } catch {
            message.error('Failed to update task');
        }
    };

    return (
        <div>
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600 }}>Select Family Groups</span>
                    </div>
                }
                open={showFamilySelector}
                onOk={handleFamilySelectionConfirm}
                onCancel={handleFamilySelectionCancel}
                okText="Create Project"
                cancelText="Cancel"
                width={500}
                styles={{
                    header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' },
                    body: { paddingTop: '20px' }
                }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ marginBottom: '12px', color: '#666' }}>
                        Choose which family groups can see this project:
                    </p>
                    <Checkbox.Group
                        value={selectedFamilyGroups}
                        onChange={setSelectedFamilyGroups}
                        style={{ width: '100%' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {familyGroups.map((group) => (
                                <Checkbox 
                                    key={group.id} 
                                    value={group.id}
                                    style={{ 
                                        padding: '8px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        margin: 0,
                                        background: selectedFamilyGroups.includes(group.id) ? '#f0f7ff' : '#fff',
                                        borderColor: selectedFamilyGroups.includes(group.id) ? '#3b82f6' : '#e5e7eb',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Avatar 
                                            size={24} 
                                            style={{ 
                                                backgroundColor: '#3b82f6', 
                                                fontSize: '12px',
                                                minWidth: '24px'
                                            }}
                                        >
                                            {group.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <span style={{ fontWeight: 500 }}>{group.name}</span>
                                        <span style={{
                                            fontSize: '11px',
                                            color: '#fff',
                                            background: '#10b981',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontWeight: 500
                                        }}>
                                            {group.memberCount} members
                                        </span>
                                    </div>
                                </Checkbox>
                            ))}
                        </div>
                    </Checkbox.Group>
                </div>
            </Modal>
            
            <FamilyTasksComponent
                title="Projects & Tasks"
                projects={projects}
                onAddProject={handleAddProject}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                familyMembers={familyMembers}
                showVisibilityToggle={false}
                showAssigneeField={true}
                source="familyhub"
                showCreator={true}
                fetchProjects={fetchProjects} // Pass the fetchProjects function as a prop
            />
        </div>
    );
};

export default FamilyTasks;