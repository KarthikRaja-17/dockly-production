
'use client';
import React, { useState, useEffect } from 'react';
import { Tabs, Tag, Button, Input, Checkbox, DatePicker, Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import UpcomingActivities from '../components/upcomingActivities';
import ToDoList from '../components/todoList';

// Sample familyHub data (replace with actual import from familyHub)
const familyHub = {
  events: [
    {
      date: '2025-05-22',
      title: 'Family Dinner',
      subtitle: 'At Italian Restaurant - 7 PM',
      tag: <Tag color='blue'>Confirmed</Tag>,
    },
    {
      date: '2025-05-24',
      title: 'School Play',
      subtitle: "Asfar's son - 3 PM",
      tag: <Tag color='purple'>Reminder</Tag>,
    },
  ],
  tasks: [
    {
      text: 'Plan family picnic',
      dueDate: '2025-05-23',
      owner: "Asfar's wife",
      done: false,
      status: 'today',
    },
    {
      text: 'Buy groceries for dinner',
      dueDate: '2025-05-22',
      owner: 'Asfar',
      done: true,
      completionDate: '2025-05-21',
      status: 'week',
    },
  ],
};

interface TodoItem {
  text: string;
  done: boolean;
  dueDate: string;
  completionDate?: string;
  owner?: string;
  status?: 'today' | 'week' | 'month' | 'archived';
}

interface UpcomingItem {
  date: string;
  title: string;
  subtitle: string;
  tag: React.ReactElement;
}

const UpcomingAndTodoList = (props: any) => {
  const { googleEvents, accountColor } = props;
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      text: 'Call internet provider about bill',
      done: false,
      dueDate: '2025-05-21',
      owner: 'Asfar',
      status: 'today',
    },
    {
      text: 'Check email for shopping confirmation',
      done: true,
      dueDate: '2025-05-19',
      completionDate: '2025-05-19',
      owner: "Asfar's son",
      status: 'week',
    },
    ...familyHub.tasks.map(task => ({
      ...task,
      status: task.status as 'today' | 'week' | 'month' | 'archived' | undefined,
    })),
  ]);
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState<Dayjs | null>(null);
  const [newTaskOwner, setNewTaskOwner] = useState('Asfar');
  const [activeTab, setActiveTab] = useState('1');
  const [view, setView] = useState<'my' | 'family'>('my');

  const myUpcomingItems: UpcomingItem[] = [
    {
      date: '23 MAY',
      title: 'Mortgage Payment',
      subtitle: 'Chase Bank - $1,500',
      tag: <Tag color='orange'>Due Soon</Tag>,
    },
    {
      date: '25 MAY',
      title: 'Internet Bill',
      subtitle: 'Xfinity - $89.99',
      tag: <Tag color='orange'>Due Soon</Tag>,
    },
    {
      date: '01 JUN',
      title: 'Netflix Subscription',
      subtitle: 'Netflix - $19.99',
      tag: <Tag color='green'>Auto Pay-On</Tag>,
    },
    {
      date: '03 JUN',
      title: 'Auto Insurance',
      subtitle: 'Progressive - $132.50',
      tag: <Tag color='green'>Auto Pay-On</Tag>,
    },
  ];

  const familyUpcomingItems: UpcomingItem[] = [
    ...familyHub.events.map((event) => ({
      date: dayjs(event.date).format('DD MMM'),
      title: event.title,
      subtitle: event.subtitle,
      tag: event.tag,
    })),
    ...familyHub.tasks.map((task) => ({
      date: dayjs(task.dueDate).format('DD MMM'),
      title: task.text,
      subtitle: `Assigned to ${task.owner}${task.done ? ' - Completed' : ''}`,
      tag: task.done ? (
        <Tag color='green'>Completed</Tag>
      ) : (
        <Tag color='red'>Pending</Tag>
      ),
    })),
  ];

  const ownerColors: Record<string, string> = {
    Asfar: '#00FF00',
    "Asfar's son": '#FFFF00',
    "Asfar's wife": '#FF69B4',
  };

  // Extract unique owners from todos and familyHub.tasks
  const familyMembers = Array.from(
    new Set([
      'Asfar',
      ...todos.map((todo) => todo.owner || 'Asfar'),
      ...familyHub.tasks.map((task) => task.owner || 'Asfar'),
    ])
  );

  const handleAddTodo = (status: 'today' | 'week' | 'month') => {
    if (!newTask.trim()) {
      alert('Please enter a task description.');
      return;
    }
    if (!newDueDate || !newDueDate.isValid()) {
      alert('Please select a valid due date and time.');
      return;
    }

    const newTodo: TodoItem = {
      text: newTask,
      done: false,
      dueDate: newDueDate.format('YYYY-MM-DD HH:mm'),
      owner: newTaskOwner,
      status,
    };
    setTodos([...todos, newTodo]);
    setNewTask('');
    setNewDueDate(null);
    setNewTaskOwner('Asfar');
  };

  const toggleTodo = (index: number) => {
    const updated = [...todos];
    const todo = updated[index];
    todo.done = !todo.done;
    if (todo.done) {
      todo.completionDate = dayjs().format('YYYY-MM-DD');
      todo.status = 'week';
    } else {
      todo.completionDate = undefined;
      todo.status = 'today';
    }
    setTodos(updated);
  };

  const removeTodo = (index: number) => {
    const updated = [...todos];
    updated.splice(index, 1);
    setTodos(updated);
  };

  const migrateTasks = () => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (!todo.done || !todo.completionDate) return todo;
        const completionMoment = dayjs(todo.completionDate);
        const now = dayjs();
        const daysSinceCompletion = now.diff(completionMoment, 'day');

        if (todo.status === 'week' && daysSinceCompletion >= 7) {
          return { ...todo, status: 'month' };
        }
        if (todo.status === 'month' && daysSinceCompletion >= 30) {
          return { ...todo, status: 'archived' };
        }
        return todo;
      })
    );
  };

  useEffect(() => {
    migrateTasks();
  }, []);

  const todayTodos = todos.filter((todo) => todo.status === 'today');
  const weekTodos = todos.filter((todo) => todo.status === 'week');
  const monthTodos = todos.filter((todo) => todo.status === 'month');

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        width: '100%',
      }}
    >
      <UpcomingActivities width={700} googleEvents={googleEvents} accountColor={accountColor} />
      <ToDoList />
    </div>
  );
};

export default UpcomingAndTodoList;

