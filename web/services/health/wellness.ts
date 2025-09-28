import { 
  getWellnessTasks, 
  addWellnessTask, 
  updateWellnessTask, 
  deleteWellnessTask, 
  toggleWellnessTask,
  shareWellnessTask,
  getUpcomingWellnessTasks // NEW: Import upcoming tasks endpoint
} from '../apiConfig';
import { WellnessTaskData, WellnessTaskResponse, SharingResponse, UpcomingWellnessTasksResponse } from './types';

// ==================== VALIDATION HELPERS ====================

// NEW: Validate wellness task dates based on recurring status
export function validateWellnessTaskDates(
  startDate?: string,
  dueDate?: string,
  recurring?: boolean
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // For recurring tasks, both dates are required
  if (recurring) {
    if (!startDate) errors.push("Start date is required for recurring tasks");
    if (!dueDate) errors.push("Due date is required for recurring tasks");
    
    // If both dates exist, validate order
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      
      if (start > due) {
        errors.push("Start date cannot be after due date");
      }
      
      // Warning for same day
      if (start.toDateString() === due.toDateString()) {
        warnings.push("Start date and due date are the same day");
      }
    }
  } else {
    // For non-recurring tasks, dates are optional but should be valid if provided
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      
      if (start > due) {
        errors.push("Start date cannot be after due date");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// NEW: Format date for API submission
export function formatDateForAPI(date?: string): string | undefined {
  if (!date) return undefined;
  
  try {
    // Handle various input formats and normalize to YYYY-MM-DD
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return undefined;
    
    return parsedDate.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return undefined;
  }
}

// NEW: Parse date from API response
export function parseDateFromAPI(date?: string): string | undefined {
  if (!date) return undefined;
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return undefined;
    
    return parsedDate.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error parsing date:', date, error);
    return undefined;
  }
}

// ==================== API FUNCTIONS ====================

// Get all wellness tasks for the user
export async function fetchWellnessTasks() {
  return getWellnessTasks({});
}

// NEW: Get upcoming wellness tasks for reminder system
export async function fetchUpcomingWellnessTasks(): Promise<UpcomingWellnessTasksResponse> {
  const response = await getUpcomingWellnessTasks({});
  return response.data;
}

// UPDATED: Add a new wellness task with date validation
export async function createWellnessTask(taskData: WellnessTaskData) {
  // Validate the task data
  const validation = validateWellnessTaskDates(
    taskData.start_date || taskData.startDate,
    taskData.due_date || taskData.dueDate,
    taskData.recurring
  );

  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Prepare the data for API submission
  const apiData = prepareWellnessTaskForSubmission(taskData);
  
  return addWellnessTask(apiData);
}

// UPDATED: Update an existing wellness task with date validation
export async function editWellnessTask(id: number, taskData: WellnessTaskData) {
  // Validate the task data
  const validation = validateWellnessTaskDates(
    taskData.start_date || taskData.startDate,
    taskData.due_date || taskData.dueDate,
    taskData.recurring
  );

  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Prepare the data for API submission
  const apiData = prepareWellnessTaskForSubmission({ ...taskData, editing: true });
  
  return updateWellnessTask(id, apiData);
}

// Delete a wellness task
export async function removeWellnessTask(id: number) {
  return deleteWellnessTask(id);
}

// Toggle task completion status
export async function toggleTaskCompletion(id: number) {
  return toggleWellnessTask(id);
}

// ==================== WELLNESS TASK SHARING FUNCTIONS ====================

// UPDATED: Share wellness task with family members and/or via email
export async function shareWellnessTaskWithMembers(
  emails: string | string[],
  wellnessTask: WellnessTaskData,
  taggedMembers?: string[]
): Promise<SharingResponse> {
  try {
    const response = await shareWellnessTask({
      email: emails,
      wellness_task: {
        id: wellnessTask.id,
        icon: wellnessTask.icon,
        text: wellnessTask.text,
        // NEW: Include both legacy and new date fields for compatibility
        date: wellnessTask.date || wellnessTask.due_date || wellnessTask.dueDate,
        start_date: wellnessTask.start_date || wellnessTask.startDate,
        due_date: wellnessTask.due_date || wellnessTask.dueDate,
        recurring: wellnessTask.recurring,
        details: wellnessTask.details,
        completed: wellnessTask.completed,
      },
      tagged_members: taggedMembers,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Share with family members only (extract emails from tagged members)
export async function shareWellnessTaskWithFamilyMembers(
  wellnessTask: WellnessTaskData,
  familyMemberEmails: string[]
): Promise<SharingResponse> {
  return shareWellnessTaskWithMembers(
    familyMemberEmails,
    wellnessTask,
    familyMemberEmails
  );
}

// Share via email only (no family member tagging)
export async function shareWellnessTaskViaEmail(
  wellnessTask: WellnessTaskData,
  emails: string | string[]
): Promise<SharingResponse> {
  return shareWellnessTaskWithMembers(emails, wellnessTask);
}

// ==================== DATA TRANSFORMATION FUNCTIONS ====================

// UPDATED: Transform backend response to frontend format
export function transformWellnessTaskData(task: WellnessTaskResponse): WellnessTaskData {
  return {
    id: task.id,
    icon: task.icon || '✅',
    text: task.text,
    
    // NEW: Handle both legacy and new date fields
    date: task.date, // Legacy field for backward compatibility
    start_date: parseDateFromAPI(task.start_date),
    due_date: parseDateFromAPI(task.due_date),
    
    // Alternative naming for form compatibility
    startDate: parseDateFromAPI(task.start_date),
    dueDate: parseDateFromAPI(task.due_date),
    
    recurring: task.recurring || false,
    details: task.details || '',
    completed: task.completed || false,
    tagged_ids: task.tagged_ids || [],
  };
}

// UPDATED: Transform frontend data for API calls with enhanced date handling
export function prepareWellnessTaskForSubmission(task: WellnessTaskData): any {
  const apiData: any = {
    id: task.id,
    icon: task.icon,
    text: task.text,
    recurring: task.recurring || false,
    details: task.details || '',
    completed: task.completed || false,
    tagged_members: task.tagged_members || [],
    editing: task.editing,
  };

  // Handle date fields based on recurring status
  if (task.recurring) {
    // For recurring tasks, use the new date fields
    apiData.start_date = formatDateForAPI(task.start_date || task.startDate);
    apiData.due_date = formatDateForAPI(task.due_date || task.dueDate);
    
    // Keep legacy field for backward compatibility if no new fields
    if (!apiData.start_date && !apiData.due_date && task.date) {
      apiData.date = task.date;
    }
  } else {
    // For non-recurring tasks, use legacy format or new fields if provided
    if (task.date) {
      apiData.date = task.date;
    } else if (task.due_date || task.dueDate) {
      // If new due_date is provided, use it as the main date
      apiData.date = formatDateForAPI(task.due_date || task.dueDate);
      // Also send the new fields if available
      if (task.start_date || task.startDate) {
        apiData.start_date = formatDateForAPI(task.start_date || task.startDate);
      }
      if (task.due_date || task.dueDate) {
        apiData.due_date = formatDateForAPI(task.due_date || task.dueDate);
      }
    }
  }

  return apiData;
}

// ==================== UTILITY FUNCTIONS ====================

// Check if task has family member tags
export function hasTaggedMembers(task: WellnessTaskData): boolean {
  return !!(task.tagged_ids && task.tagged_ids.length > 0);
}

// Get tagged member count
export function getTaggedMemberCount(task: WellnessTaskData): number {
  return task.tagged_ids?.length || 0;
}

// NEW: Check if task is recurring and has proper date setup
export function isRecurringTaskValid(task: WellnessTaskData): boolean {
  if (!task.recurring) return true;
  
  const hasStartDate = !!(task.start_date || task.startDate);
  const hasDueDate = !!(task.due_date || task.dueDate);
  
  return hasStartDate && hasDueDate;
}

// NEW: Get display date for task list
export function getTaskDisplayDate(task: WellnessTaskData): string {
  if (task.recurring) {
    // For recurring tasks, show date range if both dates exist
    const startDate = task.start_date || task.startDate;
    const dueDate = task.due_date || task.dueDate;
    
    if (startDate && dueDate) {
      if (startDate === dueDate) {
        return formatDisplayDate(startDate);
      } else {
        return `${formatDisplayDate(startDate)} - ${formatDisplayDate(dueDate)}`;
      }
    } else if (dueDate) {
      return `Due: ${formatDisplayDate(dueDate)}`;
    } else if (startDate) {
      return `Starts: ${formatDisplayDate(startDate)}`;
    }
  }
  
  // For non-recurring tasks or fallback
  const displayDate = task.due_date || task.dueDate || task.date;
  return displayDate ? formatDisplayDate(displayDate) : '';
}

// NEW: Format date for display
function formatDisplayDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return dateStr;
  }
}

// NEW: Get task urgency level based on dates
export function getTaskUrgency(task: WellnessTaskData): 'overdue' | 'urgent' | 'upcoming' | 'future' | 'none' {
  if (task.completed) return 'none';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Determine which date to use for urgency calculation
  let targetDate: Date | null = null;
  
  if (task.recurring) {
    // For recurring tasks, use start_date if task hasn't started, otherwise use due_date
    const startDate = task.start_date || task.startDate;
    const dueDate = task.due_date || task.dueDate;
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      if (start > today) {
        targetDate = start; // Task hasn't started yet
      } else if (dueDate) {
        targetDate = new Date(dueDate); // Task is active, check due date
      }
    } else if (dueDate) {
      targetDate = new Date(dueDate);
    }
  } else {
    // For non-recurring tasks, use due_date or fallback to date
    const dateStr = task.due_date || task.dueDate || task.date;
    if (dateStr) {
      targetDate = new Date(dateStr);
    }
  }
  
  if (!targetDate) return 'none';
  
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'urgent';
  if (diffDays <= 3) return 'upcoming';
  if (diffDays <= 7) return 'future';
  return 'none';
}

// NEW: Filter tasks by urgency
export function filterTasksByUrgency(tasks: WellnessTaskData[], urgency: 'overdue' | 'urgent' | 'upcoming' | 'future'): WellnessTaskData[] {
  return tasks.filter(task => getTaskUrgency(task) === urgency);
}

// NEW: Sort tasks by date and priority
export function sortWellnessTasks(tasks: WellnessTaskData[]): WellnessTaskData[] {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Sort by urgency first
    const urgencyOrder = { 'overdue': 0, 'urgent': 1, 'upcoming': 2, 'future': 3, 'none': 4 };
    const aUrgency = getTaskUrgency(a);
    const bUrgency = getTaskUrgency(b);
    
    if (aUrgency !== bUrgency) {
      return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
    }
    
    // Then sort by date (earliest first)
    const aDate = a.due_date || a.dueDate || a.start_date || a.startDate || a.date;
    const bDate = b.due_date || b.dueDate || b.start_date || b.startDate || b.date;
    
    if (aDate && bDate) {
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    }
    
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    
    // Finally sort by text
    return a.text.localeCompare(b.text);
  });
}

// ==================== MIGRATION HELPERS ====================

// NEW: Migrate legacy task data to new format
export function migrateLegacyTaskData(tasks: any[]): WellnessTaskData[] {
  return tasks.map(task => {
    // If task only has legacy 'date' field and is not recurring, keep it simple
    if (task.date && !task.recurring && !task.start_date && !task.due_date) {
      return transformWellnessTaskData({
        ...task,
        due_date: task.date, // Map legacy date to due_date
      });
    }
    
    return transformWellnessTaskData(task);
  });
}

// NEW: Check if task needs date migration
export function needsDateMigration(task: WellnessTaskData): boolean {
  // Task needs migration if it's recurring but lacks proper date fields
  if (task.recurring) {
    const hasNewDateFields = !!(task.start_date || task.startDate) && !!(task.due_date || task.dueDate);
    return !hasNewDateFields && !!task.date;
  }
  
  return false;
}

// ==================== REMINDER SYSTEM HELPERS ====================

// NEW: Get tasks that need reminders
export function getTasksNeedingReminders(tasks: WellnessTaskData[]): WellnessTaskData[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  return tasks.filter(task => {
    if (task.completed || !task.recurring) return false;
    
    const startDate = task.start_date || task.startDate;
    if (!startDate) return false;
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    // Task starts in 1-2 days
    return start.getTime() >= tomorrow.getTime() && start.getTime() <= dayAfter.getTime();
  });
}

// NEW: Format task for reminder email
export function formatTaskForReminder(task: WellnessTaskData): {
  title: string;
  startDate: string;
  dueDate: string;
  daysUntilStart: number;
  details: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = task.start_date || task.startDate;
  const dueDate = task.due_date || task.dueDate;
  
  let daysUntilStart = 0;
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  return {
    title: task.text,
    startDate: startDate ? formatDisplayDate(startDate) : '',
    dueDate: dueDate ? formatDisplayDate(dueDate) : '',
    daysUntilStart,
    details: task.details || ''
  };
}