import {
  getProviders,
  addProvider,
  updateProvider,
  deleteProvider,
} from "../apiConfig";

export interface HealthcareProviderData {
  id?: number;
  name: string;
  specialty: string;
  phone?: string;
  practiceName?: string;
  address?: string;
  icon?: string;
  notes?: string;
  editing?: boolean;
}


export interface HealthcareProviderResponse {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  practiceName: string;
  address: string;
  icon: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Get all healthcare providers for the user
export async function fetchProviders() {
  return getProviders({});
}

// Add a new healthcare provider
export async function createProvider(providerData: HealthcareProviderData) {
  return addProvider(providerData);
}

// Update an existing healthcare provider
export async function editProvider(
  id: number,
  providerData: HealthcareProviderData
) {
  return updateProvider(id, { ...providerData, editing: true });
}

// Delete a healthcare provider
export async function removeProvider(id: number) {
  return deleteProvider(id);
}

// Transform backend response to frontend format
export function transformProviderData(
  provider: HealthcareProviderResponse
): HealthcareProviderData {
  return {
    id: provider.id,
    name: provider.name,
    specialty: provider.specialty,
    phone: provider.phone,
    practiceName: provider.practiceName,
    address: provider.address,
    icon: provider.icon || "👨‍⚕️",
    notes: provider.notes,
  };
}
