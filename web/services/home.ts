
import { ReactNode } from 'react';
import { api } from './apiConfig';

// Interface for Property data
export interface Property {
  type: string;
  id: string;
  address: string;
  purchaseDate: string;
  purchasePrice: number;
  squareFootage: string;
  lotSize: string;
  propertyTaxId: string;
  is_active: number;
}

// Interface for Vehicle data
export interface Vehicle {
  id: string;
  user_id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  registration_number?: string;
  insurance_provider?: string;
  insurance_id?: string;
  is_active: number;
}

export interface Utility {
  amount: ReactNode;
  details: ReactNode;
  name: ReactNode;
  logo: ReactNode;
  backgroundColor: string | undefined;
  id: string;
  type: string;
  accountNumber: string;
  monthlyCost: number;
  providerUrl: string;
  category: 'Core' | 'Entertainment' | 'Home Services';
  created_at?: string;
  updated_at?: string;
  is_active: number;
}

// Interface for API response
export interface ApiResponse<T> {
  status: number;
  message: string;
  payload: T;
}
// Interface for Task
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  priority?: string;
  details?: string;
  propertyIcon?: string;
  isRecurring: boolean;
  created_at?: string;
  updated_at?: string;
  is_active: number;  // Added is_active
}

// New interface for MaintenanceTaskResponse
export interface MaintenanceTaskResponse {
  status: number;
  message: string;
  payload: {
    tasks?: Task[];
    task?: Task;
  };
}

// ... (other interfaces remain unchanged)

export const addMaintenanceTask = async (taskData: Partial<Task>): Promise<MaintenanceTaskResponse> => {
  try {
    const response = await api.post<MaintenanceTaskResponse>('/add/maintenance', {
      name: taskData.text,
      date: taskData.date,
      completed: taskData.completed ?? false,
      priority: taskData.priority ?? "",
      details: taskData.details ?? "",
      property_icon: taskData.propertyIcon ?? "",
      is_recurring: taskData.isRecurring ?? false,
      is_active: 1,  // Set is_active to 1
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add maintenance task');
  }
};

export const getMaintenanceTasks = async (filters: { completed?: boolean ,is_active?: number}): Promise<MaintenanceTaskResponse> => {
  try {
    const response = await api.get<MaintenanceTaskResponse>('/get/maintenance', {
      params: { ...filters, is_active: 1 },  // Only fetch active tasks
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch maintenance tasks');
  }
};

export const updateMaintenanceTask = async (taskId: string, updates: Partial<Task>): Promise<MaintenanceTaskResponse> => {
  try {
    const response = await api.put<MaintenanceTaskResponse>(`/update/maintenance/${taskId}`, {
      name: updates.text,
      date: updates.date,
      completed: updates.completed,
      priority: updates.priority ?? "",
      details: updates.details ?? "",
      property_icon: updates.propertyIcon ?? "",
      is_recurring: updates.isRecurring,
      is_active: updates.is_active ?? 1,  // Include is_active
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update maintenance task');
  }
};

export const deleteMaintenanceTask = async (taskId: string): Promise<MaintenanceTaskResponse> => {
  try {
    const response = await api.delete<MaintenanceTaskResponse>(`/delete/maintenance/${taskId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete maintenance task');
  }
};

// ... (other functions remain unchanged)
export async function addUtility(
  params: any
): Promise<ApiResponse<{ utility: Utility }>> {
  return api.post('/add/utility', params).then((res) => res.data);
}

export async function getUtilities(
  params: any
): Promise<ApiResponse<{ utilities: Utility[] }>> {
  return api.get('/get/utility', { params }).then((res) => res.data);
}

export async function updateUtility(
  utilityId: string,
  params: any
): Promise<ApiResponse<{ utility: Utility }>> {
  return api
    .put(`/utility/update/${utilityId}`, params)
    .then((res) => res.data);
}

export async function deleteUtility(
  utilityId: string
): Promise<ApiResponse<{ utility: Utility }>> {
  return api.delete(`/utility/delete/${utilityId}`).then((res) => res.data);
}


export async function addInsurance(
  params: any
): Promise<ApiResponse<{ insurance: any }>> {
  return api.post('/add/insurance', params).then((res) => res.data);
}

export async function getInsurance(
  params: any
): Promise<ApiResponse<{ insurances: any[] }>> {
  return api.get('/get/insurance', { params }).then((res) => res.data);
}

export async function updateInsurance(
  insuranceId: string,
  params: any
): Promise<ApiResponse<{ insurance: any }>> {
  return api
    .put(`/update/insurance/${insuranceId}`, params)
    .then((res) => res.data);
}

export async function deleteInsurance(
  insuranceId: string
): Promise<ApiResponse<{ insurance: any }>> {
  return api.delete(`/delete/insurance/${insuranceId}`).then((res) => res.data);
}

export async function addProperty(
  params: any
): Promise<ApiResponse<{ property: Property }>> {
  return api.post('/add/property', params).then((res) => res.data);
}

export async function getProperties(
  params: any
): Promise<ApiResponse<{ properties: Property[] }>> {
  return api.get('/get/property', { params }).then((res) => res.data);
}

export async function updateProperty(
  propertyId: string,
  params: any
): Promise<ApiResponse<{ property: Property }>> {
  return api
    .put(`/property/update/${propertyId}`, params)
    .then((res) => res.data);
}



// Interface for Mortgage data
export interface Mortgage {
  mortgageId: string;
  remainingBalance: number;
  mortgagePayment: number;
  type: string;
  remaining_balance: number;
  loan_type: string;
  id: string;
  name: string;
  meta: string;
  amount: number;
  interestRate: number;
  term: number;
  created_at?: string;
  updated_at?: string;
  is_active: number;
}

export async function addMortgageLoan(
  params: any
): Promise<ApiResponse<{ loans: Mortgage[] }>> {
  return api.post('/add/mortgage-loan', params).then((res) => res.data);
}

export async function getLoansAndMortgages(
  params: any
): Promise<ApiResponse<{ loans: Mortgage[] }>> {
  return api.get('/get/mortgage-loan', { params }).then((res) => res.data);
}

export async function updateMortgageLoan(
  mortgageId: string,
  params: any
): Promise<ApiResponse<{ loans: Mortgage[] }>> {
  return api
    .put(`/update/mortgage-loan/${mortgageId}`, params)
    .then((res) => res.data);
}

export async function deleteMortgageLoan(
  mortgageId: string
): Promise<ApiResponse<{ loans: Mortgage[] }>> {
  return api.delete(`/delete/mortgage-loan/${mortgageId}`).then((res) => res.data);
}

export async function addVehicle(
  params: any
): Promise<ApiResponse<{ vehicles: Vehicle[] }>> {
  return api.post('/add/vehicle', params).then((res) => res.data);
}

export async function getVehicles(
  params: any
): Promise<ApiResponse<{ vehicles: Vehicle[] }>> {
  return api.get('/get/vehicle', { params }).then((res) => res.data);
}

export async function updateVehicle(
  vehicleId: string,
  params: any
): Promise<ApiResponse<{ vehicles: Vehicle[] }>> {
  return api
    .put(`/update/vehicle/${vehicleId}`, params)
    .then((res) => res.data);
}


export const fetchAddressSuggestions = async (
  query: string
): Promise<any[]> => {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `/server/api/autocomplete/address?text=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error(`Geoapify API failed: HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Geoapify API error:', error);
    return [];
  }
};

export async function uploadHomeDocument(formData: FormData): Promise<any> {
  const response = await api.post('/add/home-drive-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getHomeDocuments(): Promise<any> {
  const response = await api.get('/get/home-drive-files');
  return response.data;
}

export async function deleteHomeDocument(fileId: string): Promise<any> {
  const response = await api.delete(
    `/delete/home-drive-file?file_id=${fileId}`
  );
  return response.data;
}

export async function uploadDocklyRootFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/add/dockly-root-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}
export interface OtherAsset {
  id: string;
  name: string;
  type: string;
  value: number;
  payment: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
  is_active: number;
}

export async function addOtherAsset(
  params: any
): Promise<ApiResponse<{ asset: OtherAsset }>> {
  return api.post('/add/other-asset', params).then((res) => res.data);
}

export async function getOtherAssets(
  params: any
): Promise<ApiResponse<{ assets: OtherAsset[] }>> {
  return api.get('/get/other-asset', { params }).then((res) => res.data);
}

export async function updateOtherAsset(
  assetId: string,
  params: any
): Promise<ApiResponse<{ asset: OtherAsset }>> {
  return api
    .put(`/update/other-asset/${assetId}`, params)
    .then((res) => res.data);
}
// ... (keep existing imports and other functions)

// Updated deleteProperty
export async function deleteProperty(
  propertyId: string
): Promise<ApiResponse<{ property: Property }>> {
  try {
    console.log(`Sending DELETE request for propertyId: ${propertyId}`);
    const response = await api.delete(`/property/delete/${propertyId}`);
    console.log(`Delete response for propertyId ${propertyId}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting property ${propertyId}:`, error);
    let errorMessage = 'Failed to delete property';
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        errorMessage = data.message || 'Invalid property ID format';
      } else if (status === 404) {
        errorMessage = data.message || 'Property not found or already deleted';
      } else if (status === 500) {
        errorMessage = data.message || 'Server error while deleting property';
      }
    }
    throw new Error(errorMessage);
  }
}


// Updated deleteVehicle
export async function deleteVehicle(
  vehicleId: string
): Promise<ApiResponse<{ vehicle: Vehicle }>> {
  try {
    console.log(`Sending DELETE request for vehicleId: ${vehicleId}`);
    const response = await api.delete(`/delete/vehicle/${vehicleId}`);
    console.log(`Delete response for vehicleId ${vehicleId}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting vehicle ${vehicleId}:`, error);
    let errorMessage = 'Failed to delete vehicle';
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        errorMessage = data.message || 'Invalid vehicle ID format';
      } else if (status === 404) {
        errorMessage = data.message || 'Vehicle not found or already deactivated';
      } else if (status === 500) {
        errorMessage = data.message || 'Server error while deactivating vehicle';
      }
    }
    throw new Error(errorMessage);
  }
}

// ... (keep all existing functions below)
// deleteOtherAsset (already good, but included for completeness)
export async function deleteOtherAsset(
  assetId: string
): Promise<ApiResponse<{ asset: OtherAsset }>> {
  try {
    console.log(`Sending DELETE request for assetId: ${assetId}`);
    const response = await api.delete(`/delete/other-asset/${assetId}`);
    console.log(`Delete response for assetId ${assetId}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting asset ${assetId}:`, error);
    let errorMessage = 'Failed to delete asset';
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        errorMessage = data.message || 'Invalid asset ID format';
      } else if (status === 404) {
        errorMessage = data.message || 'Asset not found or already deleted';
      } else if (status === 500) {
        errorMessage = data.message || 'Server error while deleting asset';
      }
    }
    throw new Error(errorMessage);
  }
}


export async function shareMaintenanceTask(params: {
  task: any;
  email: string | string[];
  tagged_members?: string[];
}) {
  return api.post('/share/maintenance_task', params);
}

export interface KeyContact {
  id: string;
  name: string;
  service: string;
  phone: string;
  email?: string;
  notes?: string;
  category: string;
  created_at?: string;
  updated_at?: string;
  is_active: number;
}

export interface KeyContactResponse {
  status: number;
  message: string;
  payload: {
    contacts?: KeyContact[];
    contact?: KeyContact;
  };
}


export const addKeyContact = async (contactData: Partial<KeyContact>): Promise<KeyContactResponse> => {
  try {
    const response = await api.post<KeyContactResponse>('/add/key-contact', {
      name: contactData.name,
      service: contactData.service,
      phone: contactData.phone,
      email: contactData.email || '',
      notes: contactData.notes || '',
      category: contactData.category,
      is_active: 1,  // Set is_active to 1
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add key contact');
  }
};

export const getKeyContacts = async (filters: { is_active?: number } = {}): Promise<KeyContactResponse> => {
  try {
    const response = await api.get<KeyContactResponse>('/get/key-contacts', {
      params: { ...filters, is_active: 1 },  // Only fetch active contacts
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch key contacts');
  }
};

export const updateKeyContact = async (contactId: string, updates: Partial<KeyContact>): Promise<KeyContactResponse> => {
  try {
    const response = await api.put<KeyContactResponse>(`/update/key-contact/${contactId}`, {
      name: updates.name,
      service: updates.service,
      phone: updates.phone,
      email: updates.email || '',
      notes: updates.notes || '',
      category: updates.category,
      is_active: updates.is_active ?? 1,  // Include is_active
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update key contact');
  }
};

export const deleteKeyContact = async (contactId: string): Promise<KeyContactResponse> => {
  try {
    console.log(`Sending DELETE request for contactId: ${contactId}`);
    const response = await api.delete<KeyContactResponse>(`/delete/key-contact/${contactId}`);
    console.log(`Delete response for contactId ${contactId}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting key contact ${contactId}:`, error);
    let errorMessage = 'Failed to delete key contact';
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        errorMessage = data.message || 'Invalid contact ID format';
      } else if (status === 404) {
        errorMessage = data.message || 'Contact not found or already deleted';
      } else if (status === 500) {
        errorMessage = data.message || 'Server error while deleting contact';
      }
    }
    throw new Error(errorMessage);
  }
};