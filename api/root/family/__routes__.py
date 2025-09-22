# _routes_.py
from .models import *
from . import family_api


family_api.add_resource(InviteFamily, "/family/invite")
family_api.add_resource(AddFamilyMembers, "/add/family-member")
family_api.add_resource(AddFamilyMemberWithoutInvite, "/add/family_without_invite")
family_api.add_resource(GetFamilyMembers, "/get/family-members")
family_api.add_resource(GetUserFamilyGroups, "/get/user-family-groups")
family_api.add_resource(GetFamilyTasks, "/get/family-tasks")
family_api.add_resource(SendInvitation, "/send/invitation")


family_api.add_resource(AddNotes, "/family/add/notes")
family_api.add_resource(GetNotes, "/family/get/notes")
family_api.add_resource(UpdateNote, "/family/update/note")
family_api.add_resource(DeleteNote, "/family/delete/note")
family_api.add_resource(ShareNote, "/family/share/note")


family_api.add_resource(AddNoteCategory, "/family/add/note_category")
family_api.add_resource(GetNoteCategories, "/family/get/note_categories")
family_api.add_resource(UpdateNoteCategory, "/family/update/note_category")
family_api.add_resource(DeleteNoteCategory, "/family/delete/note_category")



family_api.add_resource(AddPet, "/add/pet")
family_api.add_resource(GetPets, "/get/pets")
family_api.add_resource(AddContacts, "/add/contacts")
family_api.add_resource(GetContacts, "/get/contacts")
family_api.add_resource(AddGuardianEmergencyInfo, "/add/guardian-emergency-info")
family_api.add_resource(GetGuardianEmergencyInfo, "/get/guardian-emergency-info")


family_api.add_resource(AddProject, "/add/project")
family_api.add_resource(GetProjects, "/get/projects")
family_api.add_resource(UpdateProject, "/update/project")
family_api.add_resource(DeleteProject, "/delete/project")

family_api.add_resource(AddTask, "/add/task")
family_api.add_resource(GetTasks, "/get/tasks")
family_api.add_resource(UpdateTask, "/update/task")
family_api.add_resource(DeleteTask, "/delete/task")

family_api.add_resource(AddPersonalInfo, "/add/personal-info")
family_api.add_resource(GetPersonalInfo, "/get/personal-info")
family_api.add_resource(UpdatePersonalInfo, "/update/personal-info")

family_api.add_resource(AddProvider, "/add/provider")
family_api.add_resource(GetProviders, "/get/provider")
family_api.add_resource(UpdateProvider, "/update/provider")
family_api.add_resource(GetFamilyMemberUserId, "/get/fam-id")

family_api.add_resource(AddAccountPassword, "/add/account-passwords")
family_api.add_resource(GetAccountPasswords, "/get/account-passwords")
family_api.add_resource(UpdateAccountPassword, "/update/account-passwords")

family_api.add_resource(UploadDriveFile, "/add/family-drive-file")
family_api.add_resource(GetFamilyDriveFiles, "/get/family-drive-files")
family_api.add_resource(DeleteDriveFile, "/delete/family-drive-files")

family_api.add_resource(UploadDocumentRecordFile, "/add/family-document-file")
family_api.add_resource(GetDocumentRecordsFiles, "/get/family-document-file")

family_api.add_resource(UploadMedicalRecordFile, "/add/family-medical-file")
family_api.add_resource(GetMedicalRecordFiles, "/get/family-medical-files")

family_api.add_resource(AddBeneficiary, "/add/beneficiary")
family_api.add_resource(GetBeneficiaries, "/get/beneficiaries")
family_api.add_resource(UpdateBeneficiary, "/update/beneficiary")

family_api.add_resource(AddDevice, "/add/device")
family_api.add_resource(GetDevices, "/get/devices")
family_api.add_resource(UpdateDevice, "/update/device")
family_api.add_resource(ShareProject, "/share/projects")



# School routes
family_api.add_resource(AddSchool, "/add/school")
family_api.add_resource(GetSchools, "/get/schools")
family_api.add_resource(UpdateSchool, "/update/school")
family_api.add_resource(DeleteSchool, "/delete/school")

# Activity routes
family_api.add_resource(AddActivity, "/add/activity")
family_api.add_resource(GetActivities, "/get/activities")
family_api.add_resource(UpdateActivity, "/update/activity")
family_api.add_resource(DeleteActivity, "/delete/activity")
