from root.general.currentUser import CurrentUser
from .models import (
    AddDetails,
    GetProfilePictures,
    GetRecentActivities,
    GetStarted,
    GetUserDetails,
    GetUserMenus,
    LoginUser,
    MobileVerification,
    OtpVerification,
    RegisterUser,
    SaveUserEmail,
    SendAdditionalEmailOtp,
    SendFeedback,
    SignInVerification,
    UploadProfilePicture,
    VerifyAdditionalEmailOtp,
    UpdateUsername,
)
from . import users_api


users_api.add_resource(RegisterUser, "/add/username")
users_api.add_resource(SaveUserEmail, "/sign-up/email")
users_api.add_resource(LoginUser, "/sign-in")
users_api.add_resource(OtpVerification, "/email/otpVerification")
users_api.add_resource(MobileVerification, "/mobile/otpVerification")
users_api.add_resource(SignInVerification, "/signIn/otpVerification")
users_api.add_resource(GetStarted, "/get/started")
users_api.add_resource(GetRecentActivities, "/get/recent-activities")
users_api.add_resource(AddDetails, "/add/profile")
users_api.add_resource(GetUserDetails, "/get/profile")
users_api.add_resource(GetUserMenus, "/get/menus")
users_api.add_resource(CurrentUser, "/get/currentUser")
users_api.add_resource(SendFeedback, "/send/feedback")
users_api.add_resource(SendAdditionalEmailOtp, "/send/additional-email-otp")
users_api.add_resource(VerifyAdditionalEmailOtp, "/verify/additional-email-otp")
users_api.add_resource(UploadProfilePicture, "/upload/profile-picture")
users_api.add_resource(GetProfilePictures, "/get/profile-pictures")
users_api.add_resource(UpdateUsername, "/update/username")  # NEW
