from .models import AddDropbox, DropboxCallback, RefreshDropboxToken
from . import dropbox_api


dropbox_api.add_resource(AddDropbox, "/add-dropbox")
dropbox_api.add_resource(DropboxCallback, "/auth/callback/dropbox")
dropbox_api.add_resource(RefreshDropboxToken, "/refresh-dropbox-token")
