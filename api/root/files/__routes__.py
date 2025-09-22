# Update routes to include all the new Outlook endpoints

from .dropbox import (
    AdvancedDropboxSearch,
    BulkCopyDropboxFiles,
    BulkDeleteDropboxFiles,
    BulkDownloadDropboxFiles,
    BulkMoveDropboxFiles,
    BulkShareDropboxFiles,
    CopyDropboxFile,
    CreateDropboxFolder,
    DeleteDropboxFile,
    DownloadDropboxFile,
    FindDuplicateDropboxFiles,
    GetDropboxActivityLog,
    GetDropboxFileInfo,
    GetDropboxStorage,
    GetDropboxStorageAnalytics,
    ListDropboxFiles,
    LogDropboxActivity,
    MoveDropboxFile,
    RenameDropboxFile,
    ShareDropboxFile,
    UploadDropboxFile,
)
from .outlook import (
    CreateOutlookFolder,
    DeleteOutlookFile,
    ListOutlookFiles,
    # ShareOutlookFile,
    UploadOutlookFile,
)
from .models import (
    AdvancedSearch,
    # BulkCopyFiles,
    BulkCopyFiles,
    BulkDeleteFiles,
    BulkDownloadFiles,
    BulkMoveFiles,
    BulkShareFiles,
    CopyDriveFile,
    DeleteHubFile,
    FindDuplicateFiles,
    GetActivityLog,
    GetHubFiles,
    GetStorageAnalytics,
    ListDriveFiles,
    LogActivity,
    MoveDriveFile,
    RenameDriveFile,
    StarDriveFile,
    UploadDriveFile,
    DownloadDriveFile,
    DeleteDriveFile,
    CreateDriveFolder,
    ShareDriveFile,
    GetDriveFileInfo,
    GetDriveStorage,
    UploadHubFile,
)
from . import google_drive_api

# Google Drive endpoints
google_drive_api.add_resource(ListDriveFiles, "/files")
google_drive_api.add_resource(UploadDriveFile, "/upload")
google_drive_api.add_resource(DownloadDriveFile, "/download")
google_drive_api.add_resource(DeleteDriveFile, "/delete")
google_drive_api.add_resource(CreateDriveFolder, "/folder/create")
google_drive_api.add_resource(ShareDriveFile, "/share")
google_drive_api.add_resource(GetDriveFileInfo, "/file/<string:file_id>")
google_drive_api.add_resource(GetDriveStorage, "/storage")

# Bulk Operations
google_drive_api.add_resource(BulkDownloadFiles, "/bulk/download")
google_drive_api.add_resource(BulkDeleteFiles, "/bulk/delete")
google_drive_api.add_resource(BulkMoveFiles, "/bulk/move")
google_drive_api.add_resource(BulkCopyFiles, "/bulk/copy")
google_drive_api.add_resource(BulkShareFiles, "/bulk/share")

# File Operations
google_drive_api.add_resource(RenameDriveFile, "/rename")
google_drive_api.add_resource(CopyDriveFile, "/copy")
google_drive_api.add_resource(MoveDriveFile, "/move")
google_drive_api.add_resource(StarDriveFile, "/star")

# Advanced Search
google_drive_api.add_resource(AdvancedSearch, "/search/advanced")

# Duplicate Detection
google_drive_api.add_resource(FindDuplicateFiles, "/duplicates/find")

# Storage Analytics
google_drive_api.add_resource(GetStorageAnalytics, "/analytics/storage")

# Activity Tracking
google_drive_api.add_resource(GetActivityLog, "/activity")
google_drive_api.add_resource(LogActivity, "/activity/log")


google_drive_api.add_resource(ListDropboxFiles, "/dropbox/files")
google_drive_api.add_resource(UploadDropboxFile, "/dropbox/upload")
google_drive_api.add_resource(DownloadDropboxFile, "/dropbox/download")
google_drive_api.add_resource(DeleteDropboxFile, "/dropbox/delete")
google_drive_api.add_resource(CreateDropboxFolder, "/dropbox/folder/create")
google_drive_api.add_resource(ShareDropboxFile, "/dropbox/share")
google_drive_api.add_resource(GetDropboxFileInfo, "/dropbox/file/<path:file_path>")
google_drive_api.add_resource(GetDropboxStorage, "/dropbox/storage")

# Bulk Operations
google_drive_api.add_resource(BulkDownloadDropboxFiles, "/dropbox/bulk/download")
google_drive_api.add_resource(BulkDeleteDropboxFiles, "/dropbox/bulk/delete")
google_drive_api.add_resource(BulkMoveDropboxFiles, "/dropbox/bulk/move")
google_drive_api.add_resource(BulkCopyDropboxFiles, "/dropbox/bulk/copy")
google_drive_api.add_resource(BulkShareDropboxFiles, "/dropbox/bulk/share")

# File Operations
google_drive_api.add_resource(RenameDropboxFile, "/dropbox/rename")
google_drive_api.add_resource(CopyDropboxFile, "/dropbox/copy")
google_drive_api.add_resource(MoveDropboxFile, "/dropbox/move")

# Advanced Search
google_drive_api.add_resource(AdvancedDropboxSearch, "/dropbox/search/advanced")

# Duplicate Detection
google_drive_api.add_resource(FindDuplicateDropboxFiles, "/dropbox/duplicates/find")

# Storage Analytics
google_drive_api.add_resource(GetDropboxStorageAnalytics, "/dropbox/analytics/storage")

# Activity Tracking
google_drive_api.add_resource(GetDropboxActivityLog, "/dropbox/activity")
google_drive_api.add_resource(LogDropboxActivity, "/dropbox/activity/log")
# google_drive_api.add_resource(ListOutlookFiles, "/outlook/files")
# google_drive_api.add_resource(UploadOutlookFile, "/outlook/upload")
# google_drive_api.add_resource(DownloadOutlookFile, "/outlook/download")
# google_drive_api.add_resource(DeleteOutlookFile, "/outlook/delete")
# google_drive_api.add_resource(CreateOutlookFolder, "/outlook/folder/create")
# google_drive_api.add_resource(ShareOutlookFile, "/outlook/share")
# google_drive_api.add_resource(GetOutlookFileInfo, "/outlook/file/<string:file_id>")
# google_drive_api.add_resource(GetOutlookStorage, "/outlook/storage")

# # File Operations
# google_drive_api.add_resource(RenameOutlookFile, "/outlook/rename")
# google_drive_api.add_resource(CopyOutlookFile, "/outlook/copy")
# google_drive_api.add_resource(MoveOutlookFile, "/outlook/move")
google_drive_api.add_resource(ListOutlookFiles, "/outlook/files")
google_drive_api.add_resource(UploadOutlookFile, "/outlook/upload")
# google_drive_api.add_resource(DownloadOutlookFile, "/outlook/download")
google_drive_api.add_resource(DeleteOutlookFile, "/outlook/delete")
google_drive_api.add_resource(CreateOutlookFolder, "/outlook/folder/create")
# google_drive_api.add_resource(ShareOutlookFile, "/outlook/share")

google_drive_api.add_resource(UploadHubFile, "/upload/hub-file")
google_drive_api.add_resource(GetHubFiles, "/get/hub-files")
google_drive_api.add_resource(DeleteHubFile, "/delete/hub-file")