import { 
  getWellnessTasks, 
  addWellnessTask, 
  updateWellnessTask, 
  deleteWellnessTask, 
  toggleWellnessTask 
} from '../apiConfig';

export interface WellnessTaskData {
  id?: number;
  icon: string;
  text: string;
  date: string;
  recurring?: boolean;   // <-- optional
  details?: string;      // details might also be optional
  completed?: boolean;   // usually UI toggles it, so safe as optional
  editing?: boolean;
}


export interface WellnessTaskResponse {
  id: number;
  icon: string;
  text: string;
  date: string;
  recurring: boolean;
  details: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all wellness tasks for the user
export async function fetchWellnessTasks() {
  return getWellnessTasks({});
}

// Add a new wellness task
export async function createWellnessTask(taskData: WellnessTaskData) {
  return addWellnessTask(taskData);
}

// Update an existing wellness task
export async function editWellnessTask(id: number, taskData: WellnessTaskData) {
  return updateWellnessTask(id, { ...taskData, editing: true });
}

// Delete a wellness task
export async function removeWellnessTask(id: number) {
  return deleteWellnessTask(id);
}

// Toggle task completion status
export async function toggleTaskCompletion(id: number) {
  return toggleWellnessTask(id);
}

// Transform backend response to frontend format
export function transformWellnessTaskData(task: WellnessTaskResponse): WellnessTaskData {
  return {
    id: task.id,
    icon: task.icon || '✅',
    text: task.text,
    date: task.date,
    recurring: task.recurring,
    details: task.details,
    completed: task.completed,
  };
}
