# __routes__.py
from .models import *

from . import home_api

home_api.add_resource(AddMaintenanceTask, "/add/maintenance")
home_api.add_resource(GetMaintenanceTasks, "/get/maintenance")
home_api.add_resource(UpdateMaintenanceTask, "/update/maintenance/<string:task_id>")
home_api.add_resource(DeleteMaintenanceTask, "/delete/maintenance/<string:task_id>")
# home_api.add_resource(DeleteAllMaintenanceTasks, "/delete-all/maintenance")

home_api.add_resource(AddUtility, "/add/utility")
home_api.add_resource(GetUtilities, "/get/utility")
home_api.add_resource(UpdateUtility, "/utility/update/<string:utility_id>")
home_api.add_resource(DeleteUtility, "/utility/delete/<string:utility_id>")

home_api.add_resource(AddInsurance, "/add/insurance")
home_api.add_resource(GetInsurance, "/get/insurance")
home_api.add_resource(UpdateInsurance, "/update/insurance/<string:insurance_id>")
home_api.add_resource(DeleteInsurance, "/delete/insurance/<string:insurance_id>")

home_api.add_resource(AddProperty, "/add/property")
home_api.add_resource(GetProperties, "/get/property")
home_api.add_resource(UpdateProperty, "/property/update/<string:property_id>")
home_api.add_resource(DeleteProperty, "/property/delete/<string:property_id>")

home_api.add_resource(AddMortgageLoan, "/add/mortgage-loan")
home_api.add_resource(GetMortgageLoans, "/get/mortgage-loan")
home_api.add_resource(UpdateMortgageLoan, "/update/mortgage-loan/<string:mortgage_id>")
home_api.add_resource(DeleteMortgageLoan, "/delete/mortgage-loan/<string:mortgage_id>")


home_api.add_resource(AddVehicle, "/add/vehicle")
home_api.add_resource(GetVehicles, "/get/vehicle")
home_api.add_resource(UpdateVehicle, "/update/vehicle/<string:vehicle_id>")
home_api.add_resource(DeleteVehicle, "/delete/vehicle/<string:vehicle_id>")

home_api.add_resource(UploadHomeDriveFile, "/add/home-drive-file")
home_api.add_resource(GetHomeDriveFiles, "/get/home-drive-files")
home_api.add_resource(DeleteHomeDriveFile, "/delete/home-drive-file")

home_api.add_resource(AddOtherAsset, "/add/other-asset")
home_api.add_resource(GetOtherAssets, "/get/other-asset")
home_api.add_resource(UpdateOtherAsset, "/update/other-asset/<string:asset_id>")
home_api.add_resource(DeleteOtherAsset, "/delete/other-asset/<string:asset_id>")
