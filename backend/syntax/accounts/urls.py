from django.urls import path
from accounts.views import SignupView,VerifyOTPView,ResendOTPView,LoginView

urlpatterns = [
    path('signup/',SignupView.as_view(),name='signup'),
    path('verify_otp/',VerifyOTPView.as_view(),name='verify_otp'),
    path('resend_otp/',ResendOTPView.as_view(),name='resend_otp'),
    path('login/',LoginView.as_view(),name='login')
]
