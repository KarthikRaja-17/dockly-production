# from vonage_sms import Sms
# from vonage_http_client import HttpClient
# from vonage_http_client.auth import Auth


# def send_sms_otp(otp: str, mobile_number: str) -> bool:
#     # Ensure mobile number starts with '91'
#     if not mobile_number.startswith("91"):
#         mobile_number = "91" + mobile_number

#     auth = Auth(api_key="1dc0971c", api_secret="cQDv5W1i3f0VBCxF")
#     http_client = HttpClient(auth)
#     sms = Sms(http_client)

#     response = sms.send(
#         {
#             "from_": "Vonage APIs",
#             "to": mobile_number,
#             "text": f"Your OTP is {otp} for Dockly login.",
#         }
#     )

#     # Convert response object to dictionary
#     response_dict = response.model_dump()
#     message = response_dict["messages"][0]

#     if message["status"] == "0":
#         print("✅ OTP sent successfully.")
#         return True
#     else:
#         print(f"❌ OTP failed: {message['error-text']}")
#         return False
