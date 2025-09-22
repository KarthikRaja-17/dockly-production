from .models import AddMicrosoftAccount, MicrosoftCallback
from . import microsoft_api

microsoft_api.add_resource(AddMicrosoftAccount, "/add-microsoftAccount")
microsoft_api.add_resource(MicrosoftCallback, "/auth/callback")
