// // export interface PasswordItem {
// //   id: string;
// //   name: string;
// //   username: string;
// //   uri: string;
// //   folder: string;
// //   favorite: boolean;
// //   organizationId: string;
// //   lastModified: string;
// //   strength: number;
// // }

// // export interface ApiResponse<T = any> {
// //   status: number;
// //   message: string;
// //   payload: T;
// // }

// // class ApiClient {
// //   private baseUrl: string;

// //   constructor() {
// //     // Use the WebContainer API URL for backend communication
// //     this.baseUrl = 'http://localhost:5000/server/api/vault';
// //   }

// //   private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
// //     try {
// //       const response = await fetch(`${this.baseUrl}${endpoint}`, {
// //         headers: {
// //           'Content-Type': 'application/json',
// //           ...options.headers,
// //         },
// //         ...options,
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }

// //       return await response.json();
// //     } catch (error) {
// //       console.error('API request failed:', error);
// //       throw error;
// //     }
// //   }

// //   async getStatus(): Promise<ApiResponse<{ status: any }>> {
// //     return this.request('/status');
// //   }

// //   async login(email: string, password: string, code?: string): Promise<ApiResponse<{
// //     is_logged_in: boolean;
// //     session_key: string;
// //     twoFactorRequired: boolean
// //   }>> {
// //     return this.request('/login', {
// //       method: 'POST',
// //       body: JSON.stringify({ email, password, code }),
// //     });
// //   }

// //   async unlock(password: string): Promise<ApiResponse<{
// //     is_logged_in: boolean;
// //     session_key: string
// //   }>> {
// //     return this.request('/unlock', {
// //       method: 'POST',
// //       body: JSON.stringify({ password }),
// //     });
// //   }

// //   async getItems(): Promise<ApiResponse<{ items: PasswordItem[] }>> {
// //     return this.request('/items');
// //   }

// //   async getPassword(itemId: string): Promise<ApiResponse<{ password: string }>> {
// //     return this.request(`/password/${itemId}`);
// //   }

// //   async syncVault(): Promise<ApiResponse<{}>> {
// //     return this.request('/sync', {
// //       method: 'POST',
// //     });
// //   }

// //   async logout(): Promise<ApiResponse<{}>> {
// //     return this.request('/logout', {
// //       method: 'POST',
// //     });
// //   }
// // }

// // export const apiClient = new ApiClient();

// export interface PasswordItem {
//   id: string;
//   name: string;
//   username: string;
//   uri: string;
//   folder: string;
//   favorite: boolean;
//   organizationId: string;
//   lastModified: string;
//   strength: number;
// }

// export interface ApiResponse<T = any> {
//   status: number;
//   message: string;
//   payload: T;
// }

// class ApiClient {
//   private baseUrl: string;

//   constructor() {
//     // Use the WebContainer API URL for backend communication
//     this.baseUrl = 'http://localhost:5000/server/api/vault';
//   }

//   private async request<T>(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<ApiResponse<T>> {
//     try {
//       const response = await fetch(`${this.baseUrl}${endpoint}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...options.headers,
//         },
//         ...options,
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('API request failed:', error);
//       throw error;
//     }
//   }

//   async getStatus(): Promise<ApiResponse<{ status: any }>> {
//     return this.request('/status');
//   }

//   async login(
//     email: string,
//     password: string
//   ): Promise<
//     ApiResponse<{
//       is_logged_in: boolean;
//       session_key: string;
//     }>
//   > {
//     return this.request('/login', {
//       method: 'POST',
//       body: JSON.stringify({ email, password }),
//     });
//   }

//   async unlock(password: string): Promise<
//     ApiResponse<{
//       is_logged_in: boolean;
//       session_key: string;
//     }>
//   > {
//     return this.request('/unlock', {
//       method: 'POST',
//       body: JSON.stringify({ password }),
//     });
//   }

//   async getItems(): Promise<ApiResponse<{ items: PasswordItem[] }>> {
//     return this.request('/items');
//   }

//   async getPassword(
//     itemId: string
//   ): Promise<ApiResponse<{ password: string }>> {
//     return this.request(`/password/${itemId}`);
//   }

//   async syncVault(): Promise<ApiResponse<{}>> {
//     return this.request('/sync', {
//       method: 'POST',
//     });
//   }

//   async logout(): Promise<ApiResponse<{}>> {
//     return this.request('/logout', {
//       method: 'POST',
//     });
//   }
// }

// export const apiClient = new ApiClient();

// export interface PasswordItem {
//   id: string;
//   name: string;
//   username: string;
//   uri: string;
//   folder: string;
//   favorite: boolean;
//   organizationId: string;
//   lastModified: string;
//   strength: number;
// }

// export interface ApiResponse<T = any> {
//   status: number;
//   message: string;
//   payload: T;
// }

// class ApiClient {
//   private baseUrl: string;

//   constructor() {
//     // Use the WebContainer API URL for backend communication
//     this.baseUrl = 'http://localhost:5000/server/api/vault';
//   }

//   private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
//     try {
//       const response = await fetch(`${this.baseUrl}${endpoint}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...options.headers,
//         },
//         ...options,
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('API request failed:', error);
//       throw error;
//     }
//   }

//   async getStatus(): Promise<ApiResponse<{ status: any }>> {
//     return this.request('/status');
//   }

//   async login(email: string, password: string, code?: string): Promise<ApiResponse<{
//     is_logged_in: boolean;
//     session_key: string;
//     twoFactorRequired: boolean
//   }>> {
//     return this.request('/login', {
//       method: 'POST',
//       body: JSON.stringify({ email, password, code }),
//     });
//   }

//   async unlock(password: string): Promise<ApiResponse<{
//     is_logged_in: boolean;
//     session_key: string
//   }>> {
//     return this.request('/unlock', {
//       method: 'POST',
//       body: JSON.stringify({ password }),
//     });
//   }

//   async getItems(): Promise<ApiResponse<{ items: PasswordItem[] }>> {
//     return this.request('/items');
//   }

//   async getPassword(itemId: string): Promise<ApiResponse<{ password: string }>> {
//     return this.request(`/password/${itemId}`);
//   }

//   async syncVault(): Promise<ApiResponse<{}>> {
//     return this.request('/sync', {
//       method: 'POST',
//     });
//   }

//   async logout(): Promise<ApiResponse<{}>> {
//     return this.request('/logout', {
//       method: 'POST',
//     });
//   }
// }

// export const apiClient = new ApiClient();

export interface PasswordItem {
  id: string;
  name: string;
  username: string;
  uri: string;
  folder: string;
  favorite: boolean;
  organizationId: string;
  lastModified: string;
  strength: number;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  payload: T;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use the WebContainer API URL for backend communication
    this.baseUrl = 'http://localhost:5000/server/api/vault';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getStatus(): Promise<ApiResponse<{ status: any }>> {
    return this.request('/status');
  }

  async login(
    email: string,
    password: string
  ): Promise<
    ApiResponse<{
      is_logged_in: boolean;
      session_key: string;
    }>
  > {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async unlock(password: string): Promise<
    ApiResponse<{
      is_logged_in: boolean;
      session_key: string;
    }>
  > {
    return this.request('/unlock', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async getItems(): Promise<ApiResponse<{ items: PasswordItem[] }>> {
    return this.request('/items');
  }

  async getPassword(
    itemId: string
  ): Promise<ApiResponse<{ password: string }>> {
    return this.request(`/password/${itemId}`);
  }

  async syncVault(): Promise<ApiResponse<{}>> {
    return this.request('/sync', {
      method: 'POST',
    });
  }

  async logout(): Promise<ApiResponse<{}>> {
    return this.request('/logout', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
