// ============================================================================
// API SERVICES - Consolidated TypeScript Services
// ============================================================================

const API_BASE = 'http://localhost:5000/api';

// ============================================================================
// TYPES
// ============================================================================

export interface VaultItem {
  id: string;
  organizationId?: string;
  folderId?: string;
  type: number; // 1=login, 2=note, 3=card, 4=identity
  reprompt: number;
  name: string;
  notes?: string;
  favorite: boolean;
  login?: {
    username?: string;
    password?: string;
    uris?: Array<{
      match?: number;
      uri: string;
    }>;
    totp?: string;
  };
  collectionIds: string[];
  revisionDate: string;
  creationDate: string;
  deletedDate?: string;
}

export interface VaultFolder {
  id: string;
  name: string;
  revisionDate: string;
}

export interface CreateItemData {
  name: string;
  username?: string;
  password?: string;
  uri?: string;
  notes?: string;
  folder_id?: string;
  type?: number;
}

export interface PasswordOptions {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  avoid_ambiguous?: boolean;
}

export interface User {
  email: string;
  method: 'password' | 'apikey';
}

export interface LoginCredentials {
  method: 'password' | 'apikey';
  email?: string;
  password?: string;
  client_id?: string;
  client_secret?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  session_active?: boolean;
  user?: string;
}

export interface StatusResponse {
  authenticated: boolean;
  session_active: boolean;
  user?: string;
  method?: string;
  bitwarden_status?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ItemsResponse extends ApiResponse<VaultItem[]> {
  items: VaultItem[];
  count: number;
}

interface ItemResponse extends ApiResponse<VaultItem> {
  item: VaultItem;
}

interface FoldersResponse extends ApiResponse<VaultFolder[]> {
  folders: VaultFolder[];
  count: number;
}

interface PasswordResponse extends ApiResponse<string> {
  password: string;
}

interface SearchResponse extends ApiResponse<VaultItem[]> {
  items: VaultItem[];
  count: number;
  query: string;
}

// ============================================================================
// AUTH SERVICE
// ============================================================================

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Logout failed');
    }
  }

  async getStatus(): Promise<StatusResponse> {
    const response = await fetch(`${API_BASE}/auth/status`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to check authentication status');
    }

    return response.json();
  }

  async refreshSession(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Session refresh failed');
    }

    return data;
  }
}

// ============================================================================
// VAULT SERVICE
// ============================================================================

export class VaultService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async getItems(): Promise<ItemsResponse> {
    return this.makeRequest<ItemsResponse>('/vault/items');
  }

  async getItem(id: string): Promise<ItemResponse> {
    return this.makeRequest<ItemResponse>(`/vault/items/${id}`);
  }

  async createItem(data: CreateItemData): Promise<ItemResponse> {
    return this.makeRequest<ItemResponse>('/vault/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(
    id: string,
    data: Partial<CreateItemData>
  ): Promise<ItemResponse> {
    return this.makeRequest<ItemResponse>(`/vault/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<ApiResponse<void>>(`/vault/items/${id}`, {
      method: 'DELETE',
    });
  }

  async searchItems(query: string, type?: string): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);

    return this.makeRequest<SearchResponse>(`/vault/search?${params}`);
  }

  async getFolders(): Promise<FoldersResponse> {
    return this.makeRequest<FoldersResponse>('/vault/folders');
  }

  async sync(): Promise<ApiResponse<void>> {
    return this.makeRequest<ApiResponse<void>>('/vault/sync', {
      method: 'POST',
    });
  }

  async generatePassword(options: PasswordOptions): Promise<PasswordResponse> {
    return this.makeRequest<PasswordResponse>('/vault/generate-password', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if a vault item is a login item
   */
  isLoginItem(item: VaultItem): boolean {
    return item.type === 1;
  }

  /**
   * Check if a vault item is a secure note
   */
  isSecureNote(item: VaultItem): boolean {
    return item.type === 2;
  }

  /**
   * Check if a vault item is a card
   */
  isCard(item: VaultItem): boolean {
    return item.type === 3;
  }

  /**
   * Check if a vault item is an identity
   */
  isIdentity(item: VaultItem): boolean {
    return item.type === 4;
  }

  /**
   * Get the primary URI for a login item
   */
  getPrimaryUri(item: VaultItem): string | null {
    if (!this.isLoginItem(item) || !item.login?.uris?.length) {
      return null;
    }
    return item.login.uris[0].uri;
  }

  /**
   * Get the domain from a URI
   */
  getDomainFromUri(uri: string): string | null {
    try {
      const url = new URL(uri);
      return url.hostname;
    } catch {
      return null;
    }
  }

  /**
   * Get favicon URL for a domain
   */
  getFaviconUrl(uri: string): string {
    const domain = this.getDomainFromUri(uri);
    if (!domain) {
      return '';
    }
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Check if an item was recently created (within last 7 days)
   */
  isRecentlyCreated(item: VaultItem): boolean {
    try {
      const created = new Date(item.creationDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    } catch {
      return false;
    }
  }

  /**
   * Check if an item was recently updated (within last 7 days)
   */
  isRecentlyUpdated(item: VaultItem): boolean {
    if (!item.revisionDate) return false;
    try {
      const updated = new Date(item.revisionDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updated > weekAgo;
    } catch {
      return false;
    }
  }

  /**
   * Generate a secure password with default options
   */
  async generateSecurePassword(): Promise<string> {
    return this.generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      avoid_ambiguous: false,
    }).then((response) => response.password);
  }

  /**
   * Validate password strength (basic check)
   */
  validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8)
      feedback.push('Consider using 12+ characters for better security');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    const isStrong = score >= 5;

    if (isStrong) {
      feedback.push('Strong password!');
    }

    return {
      score,
      feedback,
      isStrong,
    };
  }

  /**
   * Search items by multiple criteria
   */
  searchItemsLocally(
    items: VaultItem[],
    query: string,
    options: {
      searchInNames?: boolean;
      searchInUsernames?: boolean;
      searchInUris?: boolean;
      searchInNotes?: boolean;
      caseSensitive?: boolean;
    } = {}
  ): VaultItem[] {
    const {
      searchInNames = true,
      searchInUsernames = true,
      searchInUris = true,
      searchInNotes = false,
      caseSensitive = false,
    } = options;

    const searchTerm = caseSensitive ? query : query.toLowerCase();

    return items.filter((item) => {
      const itemName = caseSensitive ? item.name : item.name.toLowerCase();
      const itemUsername = item.login?.username
        ? caseSensitive
          ? item.login.username
          : item.login.username.toLowerCase()
        : '';
      const itemUri = item.login?.uris?.[0]?.uri
        ? caseSensitive
          ? item.login.uris[0].uri
          : item.login.uris[0].uri.toLowerCase()
        : '';
      const itemNotes = item.notes
        ? caseSensitive
          ? item.notes
          : item.notes.toLowerCase()
        : '';

      return (
        (searchInNames && itemName.includes(searchTerm)) ||
        (searchInUsernames && itemUsername.includes(searchTerm)) ||
        (searchInUris && itemUri.includes(searchTerm)) ||
        (searchInNotes && itemNotes.includes(searchTerm))
      );
    });
  }

  /**
   * Group items by folder
   */
  groupItemsByFolder(
    items: VaultItem[],
    folders: VaultFolder[]
  ): Record<string, VaultItem[]> {
    const grouped: Record<string, VaultItem[]> = {
      'no-folder': [],
    };

    // Initialize folder groups
    folders.forEach((folder) => {
      grouped[folder.id] = [];
    });

    // Group items
    items.forEach((item) => {
      if (item.folderId && grouped[item.folderId]) {
        grouped[item.folderId].push(item);
      } else {
        grouped['no-folder'].push(item);
      }
    });

    return grouped;
  }

  /**
   * Get items statistics
   */
  getItemsStatistics(items: VaultItem[]): {
    total: number;
    loginItems: number;
    secureNotes: number;
    cards: number;
    identities: number;
    recentlyCreated: number;
    recentlyUpdated: number;
    withPasswords: number;
    withoutPasswords: number;
  } {
    return {
      total: items.length,
      loginItems: items.filter((item) => this.isLoginItem(item)).length,
      secureNotes: items.filter((item) => this.isSecureNote(item)).length,
      cards: items.filter((item) => this.isCard(item)).length,
      identities: items.filter((item) => this.isIdentity(item)).length,
      recentlyCreated: items.filter((item) => this.isRecentlyCreated(item))
        .length,
      recentlyUpdated: items.filter((item) => this.isRecentlyUpdated(item))
        .length,
      withPasswords: items.filter((item) => item.login?.password).length,
      withoutPasswords: items.filter(
        (item) => this.isLoginItem(item) && !item.login?.password
      ).length,
    };
  }
}

// ============================================================================
// SERVICE INSTANCES
// ============================================================================

export const authService = new AuthService();
export const vaultService = new VaultService();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a random color for avatars/icons
 */
export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError!;
}
