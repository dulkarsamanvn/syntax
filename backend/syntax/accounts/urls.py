from django.urls import path
from accounts.views import SignupView,VerifyOTPView,ResendOTPView,LoginView,LogoutView,RefreshTokenView,GoogleLoginView,AdminLoginView,AdminUserManagementView,AdminBlockUserView,ForgetPasswordView,VerifyResetOTPView,ResetPasswordView

urlpatterns = [
    path('signup/',SignupView.as_view(),name='signup'),
    path('verify_otp/',VerifyOTPView.as_view(),name='verify_otp'),
    path('resend_otp/',ResendOTPView.as_view(),name='resend_otp'),
    path('login/',LoginView.as_view(),name='login'),
    path('logout/',LogoutView.as_view(),name='logout'),
    path('refresh-token/',RefreshTokenView.as_view(),name='refresh-token'),
    path('google/',GoogleLoginView.as_view(),name='google-login'),
    path('adminlogin/',AdminLoginView.as_view(),name='adminlogin'),
    path('user-management',AdminUserManagementView.as_view(),name='user-management'),
    path('user-management/<int:id>/block',AdminBlockUserView.as_view(),name='block-user'),
    path('forgot-password/',ForgetPasswordView.as_view(),name='forgot-password'),
    path('verify-reset-code/',VerifyResetOTPView.as_view(),name='verify-reset-code'),
    path('reset-password/',ResetPasswordView.as_view(),name='reset-password'),

]
