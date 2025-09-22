from .models import (
    AddUserPermissions,
    CreateUser,
    DeleteUserPermission,
    GetAllBoards,
    GetAllHubs,
    GetAllUsers,
    GetUserMenus,
    GetUserStats,
    SuspendUser,
    UpdateUser,
)
from . import admin_users_api

# Add resources to API
admin_users_api.add_resource(GetAllUsers, "/get/all/users")
admin_users_api.add_resource(GetUserStats, "/get/all/users/stats")
admin_users_api.add_resource(CreateUser, "/admin/users/create")
admin_users_api.add_resource(UpdateUser, "/admin/users/update/<string:target_uid>")
admin_users_api.add_resource(SuspendUser, "/admin/users/suspend/<string:target_uid>")
admin_users_api.add_resource(GetUserMenus, "/get/user/menus/<string:userId>")
admin_users_api.add_resource(
    DeleteUserPermission, "/admin/users/permissions/<string:permission_id>"
)
admin_users_api.add_resource(
    AddUserPermissions, "/admin/users/permissions/<string:userId>"
)
admin_users_api.add_resource(GetAllBoards, "/get/all/boards")
admin_users_api.add_resource(GetAllHubs, "/get/all/hubs")
