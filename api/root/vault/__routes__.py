# from .models import *
# from . import vault_api

# vault_api.add_resource(GetStatus, "/status")
# vault_api.add_resource(Login, "/login")
# vault_api.add_resource(Unlock, "/unlock")
# vault_api.add_resource(GetItems, "/items")
# vault_api.add_resource(GetPassword, "/password/<string:item_id>")
# vault_api.add_resource(SyncVault, "/sync")
# vault_api.add_resource(Logout, "/logout")


from .models import *
from . import vault_api

vault_api.add_resource(GetStatus, "/status")
vault_api.add_resource(Login, "/login")
vault_api.add_resource(Unlock, "/unlock")
vault_api.add_resource(GetItems, "/items")
vault_api.add_resource(GetPassword, "/password/<string:item_id>")
vault_api.add_resource(SyncVault, "/sync")
vault_api.add_resource(Logout, "/logout")
