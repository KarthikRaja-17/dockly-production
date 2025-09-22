// family.ts
import { api } from "./apiConfig";

// Add Axios interceptor for token handling (already present, but ensuring it's correct)
if (typeof window !== "undefined") {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("Dtoken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

interface ScheduleData {
  school_church: {
    name: string;
    type: string;
    date: string;
    time: string;
    place: string;
    addedBy: string;
    editedBy: string;
  };
}

interface ContactData {
  contacts: {
    name: string;
    role: string;
    phone: string;
    addedBy: string;
    addedTime?: string;
    editedBy?: string;
    editedTime?: string;
  };
}

export async function addFamilyMember(params: any) {
  return api
    .post("/add/family-member", params, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);
}

// Axios interceptor for token handling
if (typeof window !== "undefined") {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("Dtoken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.warn(
          "No token found in localStorage. Requests may fail if authentication is required."
        );
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// Interface for schedule data payload
// (Removed duplicate ScheduleData interface)

// Interface for contact data payload
// (Removed duplicate ContactData interface)

// Add a new contact
// export async function addContacts(params: ContactData): Promise<any> {
//   try {
//     const response = await api.post('/add/contacts', params, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error adding contact:', error);
//     throw error;
//   }
// }

// Fetch contacts for a user

// Add a new schedule
export async function addSchedules(params: ScheduleData): Promise<any> {
  try {
    const response = await api.post("/add/school_church", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding schedule:", error);
    throw error;
  }
}

// Fetch schedules for a user

export async function updateContact(params: ContactData & { id: number }) {
  return api
    .put("/update/contacts", params, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);
}

export async function updateSchedule(params: ScheduleData & { id: number }) {
  return api
    .put("/update/school_church", params, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);
}

export async function addMealPlan(params: any) {
  return api
    .post("/add/meal-planning", params, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);
}

export async function addFamilyTasks(data: any) {
  return api
    .post("/add/sharedtasks", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);
}

export async function addCustomSection(data: any) {
  return api
    .post("/add/customsection", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);
}

// export const getUsersFamilyMembers = async (params = {}) => {
//   const token = localStorage.getItem('Dtoken');
//   return api.get('/get/family-members', {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     params,
//   });
// };

export async function addFamilyGuidelines(params: any) {
  return api
    .post("/add/family-guidelines", params, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data);
}

// export async function addFamilyGuidelines(guideline: any): Promise<any> {
//   return api.post("/add/family-guidelines", guideline, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   }).then(response => response.data);
// }

export async function getUserSharedTasks() {
  const response = await api.get("/get/family-tasks");
  return response.data;
}

export async function getUserSchedules(p0: { userId: string }) {
  const response = await api.get("/get/family-schedules");
  return response.data;
}

export async function getUserMealPlan() {
  const response = await api.get("/get/family-mealplan");
  return response.data;
}

export async function getFamilyGuidelines() {
  const response = await api.get("/get/familyguidelines");
  return response.data;
}
export async function getUsersFamilyMembers(params: any) {
  const response = await api.get("/get/family-members", { params });
  return response.data;
}

export async function getUserFamilyGroups() {
  const response = await api.get("/get/user-family-groups");
  return response.data;
}

interface ContactData {
  contacts: {
    name: string;
    role: string;
    phone: string;
    addedBy: string;
    addedTime?: string;
    editedBy?: string;
    editedTime?: string;
  };
}

interface GuardianData {
  name: string;
  relationship: string;
  phone: string;
  details?: string;
  addedBy: string;
}

interface PetData {
  name: string;
  species: string;
  breed: string;
  guardianEmail?: string;
  guardianContact?: string;
  userId: string;
  family_group_id: string;
}

export async function addContacts(params: ContactData): Promise<any> {
  try {
    const response = await api.post("/add/contacts", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding contact:", error);
    throw error;
  }
}

export async function getUserContacts(
  params: { userId?: string } = {}
): Promise<any> {
  try {
    const response = await api.get("/get/contacts", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

export async function addGuardians(params: GuardianData): Promise<any> {
  try {
    const response = await api.post("/add/guardian-emergency-info", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding guardian:", error);
    throw error;
  }
}

export async function getGuardians(userId: string) {
  const response = await api.get("/get/family-members", {
    params: { uid: userId },
  });

  // Filter members whose relationship includes 'Guardian'
  const guardians = response.data.payload.members.filter(
    (member: any) =>
      member.relationship.toLowerCase().includes("guardian") &&
      member.status !== "pending"
  );

  return guardians;
}

export async function addPets(params: PetData): Promise<any> {
  try {
    const response = await api.post("/add/pet", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding pet:", error);
    throw error;
  }
}

export const getPets = async (familyGroupId?: string) => {
  try {
    const response = await api.get("/get/pets", {
      params: {
        fuser: familyGroupId || localStorage.getItem("fuser"),
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};


interface getAllNotes {
  title: string;
  description: string;
  // created_at?: string; // <-- this enables storing timestamp
}

export async function addNote(params: {
  title: string;
  description: string;
  category_id: number;
  user_id: string;
  hub: string; // ✅ Add hub
}) {
  return api.post("/family/add/notes", params);
}

export async function getAllNotes(hub?: string) {
  const url = hub ? `/family/get/notes?hub=${hub}` : `/family/get/notes`;
  return api.get(url);
}

export async function updateNote(params: {
  id: number;
  title: string;
  description: string;
  category_id: number;
  // hub: string; // ✅ Add hub
  original_title?: string;  // ✅ NEW
  original_description?: string;  // ✅ NEW
}) {
  return api.post("/family/update/note", params);
}

export async function deleteNote(params: any) {
  return api.delete(`family/delete/note`, {
    params,
  });
}

export async function shareNote(params: {
  email: string;   // ✅ single string
  note: {
    id?: string;
    title: string;
    description: string;
    hub?: string;
    created_at?: string;
  };
  tagged_members?: string[];
}) {
  return api.post("/family/share/note", params);
}


export async function addNoteCategory(params: {
  name: string;
  icon: string;
  user_id: string;
}) {
  return api.post("/family/add/note_category", params);
}

export async function getNoteCategories() {
  return api.get("/family/get/note_categories");
}

export async function updateNoteCategory(params: {
  id: number;
  pinned: boolean;
}) {
  return api.post("/family/update/note_category", params);
}

export async function deleteNoteCategory(params: any) {
  return api.delete(`family/delete/note_category`, {
    params,
  });
}

export async function addProject(params: any) {
  return api.post("/add/project", params);
}

export async function getProjects(params: { source?: string; family_group_id?: string | null} = {}) {
  return api.get("/get/projects", {
    params,
  });
}

export async function addTask(params: any) {
  return api.post("/add/task", params);
}

export async function getTasks(params: any) {
  return api.get("/get/tasks", { params });
}

export async function updateTask(params: any) {
  return api.post("/update/task", params);
}

export async function addPersonalInfo(params: any): Promise<any> {
  try {
    const response = await api.post("/add/personal-info", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding personal info:", error);
    throw error;
  }
}

export async function getPersonalInfo(params: {
  userId: string;
}): Promise<any> {
  try {
    const response = await api.get("/get/personal-info", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching personal info:", error);
    throw error;
  }
}

// School Info
// Add school info
export async function addSchoolInfo(params: any): Promise<any> {
  try {
    const response = await api.post("/add/school-info", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding school info:", error);
    throw error;
  }
}

// Add activities
export async function addActivities(params: any): Promise<any> {
  try {
    const response = await api.post("/add/activities", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding activities:", error);
    throw error;
  }
}

// family.ts
// ... (existing imports and functions remain the same)

export async function getSchoolInfo(params: { userId: string }): Promise<any> {
  try {
    const response = await api.get("/get/school-info", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching school info:", error);
    throw error;
  }
}

export async function addPet(params: PetData): Promise<any> {
  try {
    const response = await api.post("/add/pet", toSnakeCase(params));
    return response.data;
  } catch (error) {
    console.error("Error adding pet:", error);
    throw error;
  }
}

export async function getUserPets(
  params: { user_id?: string } = {}
): Promise<any> {
  try {
    const response = await api.get("/get/pets", {
      params: toSnakeCase(params),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pets:", error);
    throw error;
  }
}

export async function getUpcomingActivities(userId: string): Promise<any> {
  try {
    const response = await api.get("/get/upcoming-events", {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching upcoming activities:", error);
    throw error;
  }
}
export async function updatePersonalInfo(params: any): Promise<any> {
  try {
    const response = await api.put("/update/personal-info", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating personal info:", error);
    throw error;
  }
}

export async function addProvider(params: any): Promise<any> {
  try {
    const response = await api.post("/add/provider", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding provider:", error);
    throw error;
  }
}

// GET Providers
export async function getProviders(params: { userId: string }): Promise<any> {
  try {
    const response = await api.get("/get/provider", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching providers:", error);
    throw error;
  }
}

// UPDATE Provider
export async function updateProvider(params: any): Promise<any> {
  try {
    const response = await api.put("/update/provider", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating provider:", error);
    throw error;
  }
}
export const resolveFamilyMemberUserId = async (memberId: string) => {
  try {
    const res = await api.get("/get/fam-id", {
      params: { memberId },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to resolve user ID:", error);
    return { status: 0, message: "Failed to resolve user ID" };
  }
};

export async function addAccountPassword(payload: any): Promise<any> {
  try {
    const response = await api.post(
      "/add/account-passwords",
      { account: payload },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding account password:", error);
    throw error;
  }
}

export async function getAccountPasswords(params: {
  userId: string;
}): Promise<any> {
  try {
    const response = await api.get("/get/account-passwords", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching account passwords:", error);
    throw error;
  }
}

export async function updateAccountPassword(payload: any): Promise<any> {
  try {
    const response = await api.put("/update/account-passwords", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating account password:", error);
    throw error;
  }
}

export async function uploadFamilyDocument(formData: FormData): Promise<any> {
  try {
    const response = await api.post("/add/family-drive-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading family document:", error);
    throw error;
  }
}

export async function getFamilyDocuments(
  uid: string | null,
  docType: string
): Promise<any> {
  try {
    const response = await api.get("/get/family-drive-files", {
      params: { uid, docType },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching family documents:", error);
    throw error;
  }
}

export async function deleteFamilyDocument(fileId: string): Promise<any> {
  try {
    const res = await api.delete(`/delete/family-drive-file?file_id=${fileId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
// Upload
export async function uploadFamilyDocumentRecordFile(
  formData: FormData,
  userId?: string
): Promise<any> {
  try {
    if (userId) {
      formData.append("userId", userId); // tell backend whose drive to use
    }

    const response = await api.post("/add/family-document-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading family document record:", error);
    throw error;
  }
}

// Fetch
export async function getFamilyDocumentRecordFiles(
  userId?: string
): Promise<any> {
  try {
    const response = await api.get("/get/family-document-file", {
      params: userId ? { userId } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching family document record files:", error);
    throw error;
  }
}

export async function uploadMedicalRecordFile(
  formData: FormData,
  userId?: string
): Promise<any> {
  try {
    const response = await api.post("/add/family-medical-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: userId ? { userId } : {}, // ✅ pass userId if provided
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading medical record:", error);
    throw error;
  }
}

export async function getMedicalRecordFiles(userId?: string): Promise<any> {
  try {
    const response = await api.get("/get/family-medical-files", {
      params: userId ? { userId } : {}, // ✅ pass userId if provided
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching medical records:", error);
    throw error;
  }
}

export async function addBeneficiary(params: any): Promise<any> {
  return api.post("/add/beneficiary", params).then((res) => res.data);
}

export async function getBeneficiaries(userId: string): Promise<any> {
  return api
    .get("/get/beneficiaries", { params: { userId } })
    .then((res) => res.data);
}

export async function updateBeneficiary(params: any): Promise<any> {
  return api.put("/update/beneficiary", params).then((res) => res.data);
}

// Add a device
export async function addDevice(payload: any): Promise<any> {
  try {
    const response = await api.post(
      "/add/device",
      { device: payload },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding device:", error);
    throw error;
  }
}

// Get devices for a family member
export async function getDevices(params: { userId: string }): Promise<any> {
  try {
    const response = await api.get("/get/devices", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
}

// Update an existing device
export async function updateDevice(payload: any): Promise<any> {
  try {
    const response = await api.put(
      "/update/device",
      { device: payload },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating device:", error);
    throw error;
  }
}

export async function shareProject(params: {
  email: string[];
  tagged_members?: string[];
  project: {
    id: string;
    title: string;
    description: string;
    deadline?: string;
    status?: string;
    created_at?: string;
  };
}) {
  return api.post("/share/projects", params);
}

export async function addFamilyMemberWithoutInvite(params: any): Promise<any> {
  try {
    const response = await api.post("/add/family_without_invite", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding family member without invite:", error);
    throw error;
  }
}

export async function updateProject(params: any) {
  return api.post("/update/project", {
    id: params.id ?? params.project_id, // ✅ map old key to new one if needed
    title: params.title,
    description: params.description,
    due_date: params.due_date,
  });
}

export async function deleteProjects(params: any) {
  return api.post("/delete/project", params);
}
  
export async function DeleteTask(params: any) {
  return api.post("/delete/task", params);
}



export async function addSchool(schoolData: any): Promise<any> {
  try {
    const response = await api.post("/add/school", { school: schoolData }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding school:", error);
    throw error;
  }
}

export async function getSchools(): Promise<any> {
  try {
    const response = await api.get("/get/schools");
    return response.data;
  } catch (error) {
    console.error("Error fetching schools:", error);
    throw error;
  }
}

export async function updateSchool(schoolData: any): Promise<any> {
  try {
    const response = await api.put("/update/school", { school: schoolData }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating school:", error);
    throw error;
  }
}

export async function deleteSchool(schoolId: string): Promise<any> {
  try {
    const response = await api.delete(`/delete/school?id=${schoolId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting school:", error);
    throw error;
  }
}

// Activity API functions
export async function addActivity(activityData: any): Promise<any> {
  try {
    const response = await api.post("/add/activity", { activity: activityData }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding activity:", error);
    throw error;
  }
}

export async function getActivities(): Promise<any> {
  try {
    const response = await api.get("/get/activities");
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

export async function updateActivity(activityData: any): Promise<any> {
  try {
    const response = await api.put("/update/activity", { activity: activityData }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
}

export async function deleteActivity(activityId: string): Promise<any> {
  try {
    const response = await api.delete(`/delete/activity?id=${activityId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}