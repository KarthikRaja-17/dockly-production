import { api } from "./apiConfig";

export interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  modifiedTime: string;
  createdTime: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
  shared: boolean;
  starred?: boolean;
  trashed: boolean;
  parents?: string[];
  source_email?: string;
  account_name?: string;
  provider?: "google" | "outlook" | "dropbox";
  // Dropbox specific fields
  path?: string;
  path_lower?: string;
  server_modified?: string;
  client_modified?: string;
  content_hash?: string;
  is_downloadable?: boolean;
}

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime: string;
  createdTime: string;
  shared: boolean;
  parents?: string[];
  source_email?: string;
  account_name?: string;
  provider?: "google" | "outlook" | "dropbox";
  owners?: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
  // Dropbox specific fields
  path?: string;
  path_lower?: string;
}

export interface StorageInfo {
  used: number;
  limit: number;
  usedByType?: {
    [mimeType: string]: number;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  fileName: string;
  fileId?: string;
  filePath?: string;
  timestamp: string;
  details?: string;
}

export interface DuplicateFile {
  name: string;
  files: DriveFile[];
  totalSize: number;
  count: number;
}

export type CloudProvider = "google" | "outlook" | "dropbox" | "all";

// Account colors for visual differentiation
export const ACCOUNT_COLORS = {
  google: ["#4285f4", "#34a853", "#ea4335", "#fbbc04", "#9c27b0", "#ff5722"],
  outlook: ["#0078d4", "#00bcf2", "#8764b8", "#00b7c3", "#038387", "#486991"],
  dropbox: ["#0061ff", "#1976d2", "#2196f3", "#03a9f4", "#0288d1", "#0277bd"],
};

export const getAccountColor = (provider: string, index: number): string => {
  const colors =
    ACCOUNT_COLORS[provider as keyof typeof ACCOUNT_COLORS] ||
    ACCOUNT_COLORS.google;
  return colors[index % colors.length];
};

export const getFileSource = (
  file: DriveFile | DriveFolder
): "google" | "outlook" | "dropbox" => {
  if (file.provider) {
    return file.provider;
  }
  if (file.source_email) {
    if (
      file.source_email.includes("outlook") ||
      file.source_email.includes("hotmail") ||
      file.source_email.includes("live") ||
      file.source_email.includes("msn")
    ) {
      return "outlook";
    }
    if (file.source_email.includes("dropbox")) {
      return "dropbox";
    }
    return "google";
  }
  return "google";
};

// Provider display utilities
export const PROVIDER_LABELS = {
  google: "Google Drive",
  outlook: "OneDrive",
  dropbox: "Dropbox",
  all: "All Providers",
};

export const PROVIDER_ICONS = {
  google: "G",
  outlook: "O",
  dropbox: "D",
  all: "ALL",
};

export const getProviderDisplayName = (provider: CloudProvider): string => {
  return PROVIDER_LABELS[provider] || "Unknown";
};

export const getProviderIcon = (provider: CloudProvider): string => {
  return PROVIDER_ICONS[provider] || "?";
};

// Multi-provider file listing
export async function listDriveFiles(params: {
  folderId?: string;
  folderPath?: string;
  sortBy?: string;
  sortOrder?: string;
  pageSize?: number;
  providers?: CloudProvider[];
}) {
  try {
    const providers = params.providers || ["all"];
    const actualProviders = providers.includes("all")
      ? ["google", "dropbox"]
      : providers.filter((p) => p !== "all");

    const requests = actualProviders.map(async (provider) => {
      try {
        let endpoint = "";
        let requestData: any = {
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          pageSize: params.pageSize,
        };

        switch (provider) {
          case "google":
            endpoint = "/drive/files";
            requestData.folderId = params.folderId;
            break;
          case "dropbox":
            endpoint = "/drive/dropbox/files";
            requestData.folderPath = params.folderPath || "";
            break;
          default:
            return {
              data: {
                payload: {
                  files: [],
                  folders: [],
                  connected_accounts: [],
                  errors: [],
                },
              },
            };
        }

        const response = await api.post(endpoint, requestData);
        return {
          ...response,
          provider: provider,
        };
      } catch (error) {
        console.error(`Error fetching ${provider} files:`, error);
        return {
          data: {
            payload: {
              files: [],
              folders: [],
              connected_accounts: [],
              errors: [{ error: `Failed to fetch ${provider} files` }],
            },
          },
          provider: provider,
        };
      }
    });

    const responses = await Promise.allSettled(requests);

    const mergedFiles: DriveFile[] = [];
    const mergedFolders: DriveFolder[] = [];
    const mergedAccounts: any[] = [];
    const mergedErrors: any[] = [];

    responses.forEach((response) => {
      if (response.status === "fulfilled" && response.value?.data?.payload) {
        const data = response.value.data.payload;
        const provider = response.value.provider;

        const filesWithProvider = (data.files || []).map((file: DriveFile) => ({
          ...file,
          provider: provider,
        }));
        const foldersWithProvider = (data.folders || []).map(
          (folder: DriveFolder) => ({
            ...folder,
            provider: provider,
          })
        );

        mergedFiles.push(...filesWithProvider);
        mergedFolders.push(...foldersWithProvider);
        mergedAccounts.push(...(data.connected_accounts || []));
        mergedErrors.push(...(data.errors || []));
      }
    });

    return {
      data: {
        payload: {
          files: mergedFiles,
          folders: mergedFolders,
          connected_accounts: mergedAccounts,
          errors: mergedErrors,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching files:", error);
    return {
      data: {
        payload: {
          files: [],
          folders: [],
          connected_accounts: [],
          errors: [{ error: "Failed to fetch files" }],
        },
      },
    };
  }
}

export async function uploadDriveFile(params: {
  file: File;
  parentId?: string;
  folderPath?: string;
  provider: CloudProvider;
}) {
  if (params.provider === "all") {
    throw new Error(
      "Cannot upload to all providers simultaneously. Please select a specific provider."
    );
  }

  const formData = new FormData();
  formData.append("file", params.file);

  let endpoint = "";
  switch (params.provider) {
    case "google":
      endpoint = "/drive/upload";
      if (params.parentId) {
        formData.append("parentId", params.parentId);
      }
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/upload";
      if (params.folderPath) {
        formData.append("folderPath", params.folderPath);
      }
      break;
    default:
      throw new Error(`Unsupported provider: ${params.provider}`);
  }

  // ✅ Return only backend response
  const res = await api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}


export async function downloadDriveFile(params: {
  fileId?: string;
  filePath?: string;
  provider: CloudProvider;
}) {
  if (params.provider === "all") {
    throw new Error(
      "Cannot download from all providers. Please specify a provider."
    );
  }

  let endpoint = "";
  let requestData: any = {};

  switch (params.provider) {
    case "google":
      endpoint = "/drive/download";
      requestData.fileId = params.fileId;
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/download";
      requestData.filePath = params.filePath;
      break;
    default:
      throw new Error(`Unsupported provider: ${params.provider}`);
  }

  return api.post(endpoint, requestData, {
    responseType: "blob",
  });
}

export async function deleteDriveFile(params: {
  fileId?: string;
  filePath?: string;
  provider: CloudProvider;
}) {
  if (params.provider === "all") {
    throw new Error(
      "Cannot delete from all providers. Please specify a provider."
    );
  }

  let endpoint = "";
  let requestData: any = {};

  switch (params.provider) {
    case "google":
      endpoint = "/drive/delete";
      requestData.fileId = params.fileId;
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/delete";
      requestData.filePath = params.filePath;
      break;
    default:
      throw new Error(`Unsupported provider: ${params.provider}`);
  }

  return api.delete(endpoint, { data: requestData });
}

export async function createDriveFolder(params: {
  name: string;
  parentId?: string;
  parentPath?: string;
  provider: CloudProvider;
}) {
  if (params.provider === "all") {
    throw new Error(
      "Cannot create folder in all providers simultaneously. Please select a specific provider."
    );
  }

  let endpoint = "";
  let requestData: any = { name: params.name };

  switch (params.provider) {
    case "google":
      endpoint = "/drive/folder/create";
      requestData.parentId = params.parentId;
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/folder/create";
      requestData.parentPath = params.parentPath || "";
      break;
    default:
      throw new Error(`Unsupported provider: ${params.provider}`);
  }

  return api.post(endpoint, requestData);
}

export async function shareDriveFile(params: {
  fileId?: string;
  filePath?: string;
  email: string;
  role?: string;
  accessLevel?: string;
  provider: CloudProvider;
}) {
  if (params.provider === "all") {
    throw new Error(
      "Cannot share from all providers. Please specify a provider."
    );
  }

  let endpoint = "";
  let requestData: any = {
    email: params.email,
    role: params.role || "reader",
  };

  switch (params.provider) {
    case "google":
      endpoint = "/drive/share";
      requestData.fileId = params.fileId;
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/share";
      requestData.filePath = params.filePath;
      requestData.accessLevel = params.accessLevel || "viewer";
      break;
    default:
      throw new Error(`Unsupported provider: ${params.provider}`);
  }

  return api.post(endpoint, requestData);
}

export async function getDriveFileInfo(params: {
  fileId?: string;
  filePath?: string;
  provider?: CloudProvider;
}) {
  // Try to determine provider from the file identifier
  let provider = params.provider;
  if (!provider) {
    if (params.fileId && !params.fileId.startsWith("/")) {
      provider = "google";
    } else if (params.filePath && params.filePath.startsWith("/")) {
      provider = "dropbox";
    } else {
      provider = "google"; // default fallback
    }
  }

  let endpoint = "";
  let identifier = "";

  switch (provider) {
    case "google":
      endpoint = "/drive/file";
      identifier = params.fileId || "";
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/file";
      identifier = encodeURIComponent(params.filePath || "");
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  return api.get(`${endpoint}/${identifier}`);
}

export async function getDriveStorage(providers?: CloudProvider[]) {
  try {
    const providersToQuery = providers || ["all"];
    const actualProviders = providersToQuery.includes("all")
      ? ["google", "dropbox"]
      : providersToQuery.filter((p) => p !== "all");

    const requests = actualProviders.map(async (provider) => {
      try {
        let endpoint = "";
        switch (provider) {
          case "google":
            endpoint = "/drive/storage";
            break;
          case "dropbox":
            endpoint = "/drive/dropbox/storage";
            break;
          default:
            return null;
        }

        const response = await api.get(endpoint);
        return {
          ...response,
          provider: provider,
        };
      } catch (error) {
        console.error(`Error fetching ${provider} storage:`, error);
        return null;
      }
    });

    const responses = await Promise.allSettled(requests);

    const storageData: any = {};
    let totalUsed = 0;
    let totalLimit = 0;

    responses.forEach((response) => {
      if (response.status === "fulfilled" && response.value?.data?.payload) {
        const data = response.value.data.payload;
        const provider = response.value.provider;

        storageData[provider] = data;

        if (data.total_storage) {
          totalUsed += data.total_storage.used || 0;
          totalLimit += data.total_storage.limit || 0;
        }
      }
    });

    return {
      data: {
        payload: {
          ...storageData,
          combined: {
            used: totalUsed,
            limit: totalLimit,
          },
        },
      },
    };
  } catch (error) {
    console.error("Error fetching storage info:", error);
    return {
      data: {
        payload: {
          combined: { used: 0, limit: 0 },
        },
      },
    };
  }
}

// File operations
export async function renameDriveFile(params: {
  fileId?: string;
  filePath?: string;
  newName: string;
  provider: CloudProvider;
}) {
  if (params.provider === "all") {
    throw new Error(
      "Cannot rename in all providers. Please specify a provider."
    );
  }

  let endpoint = "";
  let requestData: any = { newName: params.newName };

  switch (params.provider) {
    case "google":
      endpoint = "/drive/rename";
      requestData.fileId = params.fileId;
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/rename";
      requestData.filePath = params.filePath;
      break;
    default:
      throw new Error(`Unsupported provider: ${params.provider}`);
  }

  return api.post(endpoint, requestData);
}

export async function copyDriveFile(params: {
  fileId?: string;
  filePath?: string;
  parentId?: string;
  targetPath?: string;
  name?: string;
  provider: CloudProvider;
}) {
  if (params.provider === "all") {
    throw new Error("Cannot copy in all providers. Please specify a provider.");
  }

  let endpoint = "";
  let requestData: any = { name: params.name };

  switch (params.provider) {
    case "google":
      endpoint = "/drive/copy";
      requestData.fileId = params.fileId;
      requestData.parentId = params.parentId;
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/copy";
      requestData.filePath = params.filePath;
      requestData.targetPath = params.targetPath;
      break;
    default:
      throw new Error(`Unsupported provider: ${params.provider}`);
  }

  return api.post(endpoint, requestData);
}

export async function moveDriveFile(params: {
  fileId?: string;
  filePath?: string;
  targetFolderId?: string;
  targetFolderPath?: string;
  provider: CloudProvider;
}) {
  if (params.provider === "all") {
    throw new Error("Cannot move in all providers. Please specify a provider.");
  }

  let endpoint = "";
  let requestData: any = {};

  switch (params.provider) {
    case "google":
      endpoint = "/drive/move";
      requestData.fileId = params.fileId;
      requestData.targetFolderId = params.targetFolderId;
      break;
    case "dropbox":
      endpoint = "/drive/dropbox/move";
      requestData.filePath = params.filePath;
      requestData.targetFolderPath = params.targetFolderPath;
      break;
    default:
      throw new Error(`Unsupported provider: ${params.provider}`);
  }

  return api.post(endpoint, requestData);
}

export async function starDriveFile(params: {
  fileId: string;
  starred: boolean;
}) {
  // Starring is only available for Google Drive
  return api.post("/drive/star", params);
}

// Bulk operations
export async function bulkDownloadFiles(params: {
  fileIds?: string[];
  filePaths?: string[];
  providers: CloudProvider[];
}) {
  const actualProviders = params.providers.includes("all")
    ? ["google", "dropbox"]
    : params.providers.filter((p) => p !== "all");

  // Try each provider
  for (const provider of actualProviders) {
    try {
      let endpoint = "";
      let requestData: any = {};

      switch (provider) {
        case "google":
          endpoint = "/drive/bulk/download";
          requestData.fileIds = params.fileIds || [];
          break;
        case "dropbox":
          endpoint = "/drive/dropbox/bulk/download";
          requestData.filePaths = params.filePaths || [];
          break;
        default:
          continue;
      }

      return await api.post(endpoint, requestData, {
        responseType: "blob",
      });
    } catch (error) {
      console.log(`Bulk download failed for ${provider}`);
    }
  }

  throw new Error("Bulk download failed for all providers");
}

export async function bulkDeleteFiles(params: {
  fileIds?: string[];
  filePaths?: string[];
  providers: CloudProvider[];
}) {
  const actualProviders = params.providers.includes("all")
    ? ["google", "dropbox"]
    : params.providers.filter((p) => p !== "all");

  const results: any[] = [];

  for (const provider of actualProviders) {
    try {
      let endpoint = "";
      let requestData: any = {};

      switch (provider) {
        case "google":
          endpoint = "/drive/bulk/delete";
          requestData.fileIds = params.fileIds || [];
          break;
        case "dropbox":
          endpoint = "/drive/dropbox/bulk/delete";
          requestData.filePaths = params.filePaths || [];
          break;
        default:
          continue;
      }

      const response = await api.post(endpoint, requestData);
      results.push({ provider, ...response.data });
    } catch (error) {
      console.log(`Bulk delete failed for ${provider}`);
      results.push({ provider, error: `Bulk delete failed for ${provider}` });
    }
  }

  return { data: { results } };
}

export async function bulkMoveFiles(params: {
  fileIds?: string[];
  filePaths?: string[];
  targetFolderId?: string;
  targetFolderPath?: string;
  providers: CloudProvider[];
}) {
  const actualProviders = params.providers.includes("all")
    ? ["google", "dropbox"]
    : params.providers.filter((p) => p !== "all");

  const results: any[] = [];

  for (const provider of actualProviders) {
    try {
      let endpoint = "";
      let requestData: any = {};

      switch (provider) {
        case "google":
          endpoint = "/drive/bulk/move";
          requestData.fileIds = params.fileIds || [];
          requestData.targetFolderId = params.targetFolderId;
          break;
        case "dropbox":
          endpoint = "/drive/dropbox/bulk/move";
          requestData.filePaths = params.filePaths || [];
          requestData.targetFolderPath = params.targetFolderPath;
          break;
        default:
          continue;
      }

      const response = await api.post(endpoint, requestData);
      results.push({ provider, ...response.data });
    } catch (error) {
      console.log(`Bulk move failed for ${provider}`);
      results.push({ provider, error: `Bulk move failed for ${provider}` });
    }
  }

  return { data: { results } };
}

export async function bulkCopyFiles(params: {
  fileIds?: string[];
  filePaths?: string[];
  targetFolderId?: string;
  targetFolderPath?: string;
  providers: CloudProvider[];
}) {
  const actualProviders = params.providers.includes("all")
    ? ["google", "dropbox"]
    : params.providers.filter((p) => p !== "all");

  const results: any[] = [];

  for (const provider of actualProviders) {
    try {
      let endpoint = "";
      let requestData: any = {};

      switch (provider) {
        case "google":
          endpoint = "/drive/bulk/copy";
          requestData.fileIds = params.fileIds || [];
          requestData.targetFolderId = params.targetFolderId;
          break;
        case "dropbox":
          endpoint = "/drive/dropbox/bulk/copy";
          requestData.filePaths = params.filePaths || [];
          requestData.targetFolderPath = params.targetFolderPath;
          break;
        default:
          continue;
      }

      const response = await api.post(endpoint, requestData);
      results.push({ provider, ...response.data });
    } catch (error) {
      console.log(`Bulk copy failed for ${provider}`);
      results.push({ provider, error: `Bulk copy failed for ${provider}` });
    }
  }

  return { data: { results } };
}

export async function bulkShareFiles(params: {
  fileIds?: string[];
  filePaths?: string[];
  email: string;
  role?: string;
  accessLevel?: string;
  providers: CloudProvider[];
}) {
  const actualProviders = params.providers.includes("all")
    ? ["google", "dropbox"]
    : params.providers.filter((p) => p !== "all");

  const results: any[] = [];

  for (const provider of actualProviders) {
    try {
      let endpoint = "";
      let requestData: any = { email: params.email };

      switch (provider) {
        case "google":
          endpoint = "/drive/bulk/share";
          requestData.fileIds = params.fileIds || [];
          requestData.role = params.role || "reader";
          break;
        case "dropbox":
          endpoint = "/drive/dropbox/bulk/share";
          requestData.filePaths = params.filePaths || [];
          requestData.accessLevel = params.accessLevel || "viewer";
          break;
        default:
          continue;
      }

      const response = await api.post(endpoint, requestData);
      results.push({ provider, ...response.data });
    } catch (error) {
      console.log(`Bulk share failed for ${provider}`);
      results.push({ provider, error: `Bulk share failed for ${provider}` });
    }
  }

  return { data: { results } };
}

// Advanced features
export async function advancedSearch(params: {
  query?: string;
  fileExtensions?: string[];
  maxResults?: number;
  folderPath?: string;
  providers?: CloudProvider[];
}) {
  const actualProviders = (params.providers || ["all"]).includes("all")
    ? ["google", "dropbox"]
    : (params.providers || []).filter((p) => p !== "all");

  const results: any[] = [];

  for (const provider of actualProviders) {
    try {
      let endpoint = "";

      switch (provider) {
        case "google":
          endpoint = "/drive/search/advanced";
          break;
        case "dropbox":
          endpoint = "/drive/dropbox/search/advanced";
          break;
        default:
          continue;
      }

      const response = await api.post(endpoint, params);
      results.push({ provider, ...response.data });
    } catch (error) {
      console.log(`Advanced search failed for ${provider}`);
    }
  }

  return { data: { results } };
}

export async function findDuplicateFiles(params: {
  folderId?: string;
  folderPath?: string;
  providers?: CloudProvider[];
}) {
  const actualProviders = (params.providers || ["all"]).includes("all")
    ? ["google", "dropbox"]
    : (params.providers || []).filter((p) => p !== "all");

  const results: any[] = [];

  for (const provider of actualProviders) {
    try {
      let endpoint = "";
      let requestData: any = {};

      switch (provider) {
        case "google":
          endpoint = "/drive/duplicates/find";
          requestData.folderId = params.folderId;
          break;
        case "dropbox":
          endpoint = "/drive/dropbox/duplicates/find";
          requestData.folderPath = params.folderPath;
          break;
        default:
          continue;
      }

      const response = await api.post(endpoint, requestData);
      results.push({ provider, ...response.data });
    } catch (error) {
      console.log(`Duplicate search failed for ${provider}`);
    }
  }

  return { data: { results } };
}

export async function getStorageAnalytics(providers?: CloudProvider[]) {
  const actualProviders = (providers || ["all"]).includes("all")
    ? ["google", "dropbox"]
    : (providers || []).filter((p) => p !== "all");

  const results: any[] = [];

  for (const provider of actualProviders) {
    try {
      let endpoint = "";

      switch (provider) {
        case "google":
          endpoint = "/drive/analytics/storage";
          break;
        case "dropbox":
          endpoint = "/drive/dropbox/analytics/storage";
          break;
        default:
          continue;
      }

      const response = await api.get(endpoint);
      results.push({ provider, ...response.data });
    } catch (error) {
      console.log(`Storage analytics failed for ${provider}`);
    }
  }

  return { data: { results } };
}

export async function getActivityLog(params: {
  limit?: number;
  offset?: number;
}) {
  // Combine activity from all providers
  const requests = [
    api.get("/drive/activity", { params }).catch(() => null),
    api.get("/drive/dropbox/activity", { params }).catch(() => null),
  ];

  const responses = await Promise.allSettled(requests);
  const activities: ActivityLog[] = [];

  responses.forEach((response) => {
    if (
      response.status === "fulfilled" &&
      response.value?.data?.payload?.activities
    ) {
      activities.push(...response.value.data.payload.activities);
    }
  });

  // Sort by timestamp
  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    data: {
      payload: {
        activities: activities.slice(0, params.limit || 50),
        total: activities.length,
      },
    },
  };
}

export async function logActivity(params: {
  action: string;
  fileId?: string;
  filePath?: string;
  fileName: string;
  details?: string;
}) {
  // Log to both systems
  const requests = [
    api.post("/drive/activity/log", params).catch(() => null),
    api.post("/drive/dropbox/activity/log", params).catch(() => null),
  ];

  await Promise.allSettled(requests);
  return { data: { status: "success" } };
}

// Upload hub file
export async function uploadHubDocumentFile(
  hub: string,
  formData: FormData
): Promise<any> {
  try {
    formData.append("hub", hub); // 👈 ensure hub is included
    const response = await api.post("/drive/upload/hub-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading hub file:", error);
    throw error;
  }
}

// Get hub files
export async function getHubDocumentFiles(hub: string): Promise<any> {
  try {
    const response = await api.get("/drive/get/hub-files", {
      params: { hub },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching hub files:", error);
    throw error;
  }
}

// Delete hub file
export async function deleteHubDocumentFile(fileId: string): Promise<any> {
  try {
    const res = await api.delete(`/drive/delete/hub-file?file_id=${fileId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting hub file:", error);
    throw error;
  }
}
