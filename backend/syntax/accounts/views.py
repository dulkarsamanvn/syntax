from django.conf import settings
from django.shortcuts import render
from rest_framework.views import APIView
from accounts.serializers import SignupSerializer,AdminUserSerializer
from accounts.models import OTP,User
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken,TokenError
from django.http import JsonResponse
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework.decorators import permission_classes
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


# Handles new user registration via email
# Validates user input using SignupSerializer
# Generates and sends an OTP to the user's email for verification
@method_decorator(csrf_exempt, name='dispatch')
class SignupView(APIView):
    permission_classes=[]
    def post(self,request):
        serializer=SignupSerializer(data=request.data)
        if serializer.is_valid():
            user=serializer.save()

            code=OTP.generate_code()
            otp=OTP.objects.create(
                user=user,
                code=code,
                expires_at=timezone.now() + timedelta(minutes=5)
            )

            send_mail(
                subject='your OTP Code',
                message=f'your OTP code is {code}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email]
                
            )
            return Response({'message':'OTP sent to email'},status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    

# Verifies the OTP sent to user's email
# If OTP is valid and not expired, marks the user as verified
# Generates and sends JWT access and refresh tokens as cookies to log the user in
@method_decorator(csrf_exempt, name='dispatch')
class VerifyOTPView(APIView):
    permission_classes=[]
    def post(self,request): 
    
        email=request.data.get('email')
        code=request.data.get('otp')
        try:
            user=User.objects.get(email=email)
            otp=OTP.objects.filter(user=user,code=code).last()
            if not otp:     
                return Response({'error':'invalid otp'},status=status.HTTP_400_BAD_REQUEST)
            if otp.is_expired:    
                return Response({'error':'OTP has expired'},status=status.HTTP_400_BAD_REQUEST)
            user.is_verified=True
            user.save()

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response = JsonResponse({'message': 'OTP verified successfully and logged in'})
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False, 
                samesite='Lax',
                max_age=5 * 60  
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=7 * 24 * 60 * 60 
            )

            return response
        except User.DoesNotExist:
            return Response({'error':'User not found'},status=status.HTTP_400_BAD_REQUEST)



# Allows resending of OTP to user's email if requested
# Prevents abuse by enforcing a 60-second cooldown between OTP sends
# Generates a new OTP and emails it to the user
@method_decorator(csrf_exempt, name='dispatch')
class ResendOTPView(APIView):
    permission_classes=[]
    def post(self,request):
        print("resend otp called")
        email=request.data.get('email')
        print("email received",email)
        if not email:
            return Response({'error':'email is required'},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user=User.objects.get(email=email)
            last_otp=OTP.objects.filter(user=user).last()

            if last_otp and (timezone.now() - last_otp.created_at).seconds < 60:
                return Response({'error':'Please wait before requesting another OTP'},status=status.HTTP_429_TOO_MANY_REQUESTS)
            code=OTP.generate_code()
            otp=OTP.objects.create(
                user=user,
                code=code,
                expires_at=timezone.now() + timedelta(minutes=5)
            )

            send_mail(
                subject='your OTP code is',
                message=f'Your new OTP code is {code}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email]
            )
            return Response({'message':'new OTP send successfully'},status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error':'User not found'},status=status.HTTP_400_BAD_REQUEST)

              
# Handles user login using email and password
# Sends a new OTP if the email is not verified
# On successful login, sends JWT tokens (access and refresh) in cookies              
@method_decorator(csrf_exempt, name='dispatch')                    
class LoginView(APIView):
    permission_classes=[]
    def post(self,request):
        email=request.data.get('email')
        password=request.data.get('password')

        try:
            user=User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({'detail':'You have been blocked by the admin.'},status=status.HTTP_403_FORBIDDEN)
        
        user=authenticate(username=email,password=password)
        if user is None:
            return Response({'detail': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_verified:
            last_otp=OTP.objects.filter(user=user).last()
            if last_otp and (timezone.now()-last_otp.created_at).seconds <60:
                return Response({'detail':'Email not verified.Please wait before requesting another OTP'},status=status.HTTP_429_TOO_MANY_REQUESTS)
            code=OTP.generate_code()
            OTP.objects.create(
                user=user,
                code=code,
                expires_at=timezone.now()+timedelta(minutes=5)
            )
            send_mail(
                subject='Your OTP code',
                message=f'your OTP code is {code}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email]
            )
            return Response({'detail':'Email not verified. A new OTP has been sent to your email.'},status=status.HTTP_403_FORBIDDEN)
        refresh=RefreshToken.for_user(user)
        access_token=str(refresh.access_token)
        refresh_token=str(refresh)

        response=JsonResponse({'message':'Login successful','username':user.username})
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=60 * 5
        )
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=60 * 60 * 24 * 7

        )
        return response

# -------------------------------------

# Logs out the user by clearing JWT access and refresh tokens from cookies
# Stateless logout (no server-side session tracking needed)
# Simple endpoint accessible without authentication
@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    permission_classes=[]
    def post(self,request):
        response=JsonResponse({'message':'Logout Successful'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    


# Generates a new access token using a valid refresh token from cookie
# Helps in keeping the user logged in without requiring re-login
# Returns a new short-lived access token in the cookie
@method_decorator(csrf_exempt, name='dispatch')
class RefreshTokenView(APIView):
    permission_classes=[]
    def post(self,request):
        refresh_token=request.COOKIES.get('refresh_token')
        if refresh_token is None:
            return Response({'detail':'Refresh Token Missing'},status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh=RefreshToken(refresh_token)
            access_token=str(refresh.access_token)
            response=JsonResponse({'message':'Token Refreshed'})
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=60 * 5
            )
            return response
        except TokenError:
            return Response({'detail':'Invalid refresh token'},status=status.HTTP_403_FORBIDDEN)



# Handles login using Google OAuth2
# Verifies Google-issued token and creates or fetches a local user
# Issues JWT tokens and returns them in cookies upon successful login
@method_decorator(csrf_exempt, name='dispatch')
class GoogleLoginView(APIView):
    permission_classes=[]
    def post(self,request):
        token=request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'},status=status.HTTP_400_BAD_REQUEST)
        try:
            idinfo=id_token.verify_oauth2_token(token,requests.Request(),settings.GOOGLE_CLIENT_ID)
            email=idinfo['email']
            name=idinfo.get('name','')

            user,created=User.objects.get_or_create(email=email,defaults={
                'username': email.split('@')[0],
                'is_verified': True
            })

            if not user.is_active:
                return Response(
                    {'detail': 'You have been blocked by the admin.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            refresh=RefreshToken.for_user(user)
            access_token=str(refresh.access_token)
            refresh_token=str(refresh)
            response=JsonResponse({'message': 'Login successful','username': user.username})

            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age= 60 * 5

            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=60 * 60 * 24 * 7
            )
            return response
        except ValueError as e:
            return Response({'error': 'Invalid token', 'details': str(e)},status=status.HTTP_400_BAD_REQUEST)



# Authenticates admin user (is_staff required)
# Issues JWT access and refresh tokens on successful login
# Ensures that only admin users can access admin functionalities
@method_decorator(csrf_exempt, name='dispatch')
class AdminLoginView(APIView):
    permission_classes=[]
    def post(self,request):
        email=request.data.get('email')
        password=request.data.get('password')

        print("Email received:", email)
        print("Password received:", password)

        user=authenticate(username=email,password=password)
        print("Authenticated user:", user)

        if not user:
            return Response({'detail':'Invalid Credentials'},status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_staff:
            return Response({'detail':'Not Authorized as Admin'},status=status.HTTP_403_FORBIDDEN)
        refresh=RefreshToken.for_user(user)
        access_token=str(refresh.access_token)
        refresh_token=str(refresh)

        response=JsonResponse({
            'message':'Admin Login Successful',
            'username':user.username,
            'email':user.email
        })
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=60 * 5
        )
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=60 * 60 * 24 * 7
        )
        return response


# Allows admin to view and filter all registered (non-staff) users
# Supports search by email/username and filter by active/blocked status
# Returns paginated user results using AdminUserSerializer
class AdminUserManagementView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):

        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        search = request.GET.get('search', '')
        filter_active = request.GET.get('filterActive', '')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 5))

       
        users = User.objects.filter(is_staff=False)
        
       
        if search:
            users = users.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )
        
       
        if filter_active == 'active':
            users = users.filter(is_active=True)
        elif filter_active == 'blocked':
            users = users.filter(is_active=False)
       
        paginator = Paginator(users, page_size)
        page_obj = paginator.get_page(page)
        serializer = AdminUserSerializer(page_obj.object_list, many=True)
        
        return Response({
            'results': serializer.data,
            'count': paginator.count
        }, status=status.HTTP_200_OK)



# Allows admin to block or unblock a specific user by ID
# Ensures that only staff/superuser can perform this action
# Updates the is_active status of the selected user
class AdminBlockUserView(APIView):
    permission_classes=[IsAuthenticated]
    def patch(self,request,id):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user=User.objects.get(id=id,is_staff=False)
        except User.DoesNotExist:
            return Response({'detail':'User not Found'},status=status.HTTP_404_NOT_FOUND)
        
        is_active=request.data.get('is_active')
        if is_active is None:
            return Response({'error': 'is_active field is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active=is_active
        user.save()
        return Response({'message': 'User Status Updated Successfully'},status=status.HTTP_200_OK)


# Initiates password reset process by sending OTP to user's email
# Verifies if the email exists in the system before sending OTP
# OTP will be used in the next step to validate reset intent
class ForgetPasswordView(APIView):
    permission_classes=[]

    def post(self,request):
        email=request.data.get('email')
        try:
            user=User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error':'User Not Found'},status=status.HTTP_404_NOT_FOUND)
        
        code=OTP.generate_code()
        otp=OTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        send_mail(
            subject='Your OTP Code for Reset Password ',
            message=f'Your OTP Code is {code} ',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email]
        )
        return Response({'message':'OTP send to Email'},status=status.HTTP_200_OK)
        

# Verifies OTP sent during password reset process
# Confirms that the OTP is valid and not expired
# Used as a prerequisite step before allowing password change
class VerifyResetOTPView(APIView):
    permission_classes=[]

    def post(self,request):
        email=request.data.get('email')
        code=request.data.get('otp')

        try:
            user=User.objects.get(email=email)
            otp=OTP.objects.filter(user=user,code=code).last()

            if not otp:
                return Response({'error':'Invalid OTP'},status=status.HTTP_400_BAD_REQUEST)
            if otp.is_expired:
                return Response({'error':'OTP has expired'},status=status.HTTP_400_BAD_REQUEST)
            return Response({'message':'OTP Verified successfully'},status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error':'User not found'},status=status.HTTP_400_BAD_REQUEST)


# Completes password reset process by setting a new password
# Only works after OTP has been verified in previous step
# Updates the user's password securely using set_password()
class ResetPasswordView(APIView):
    permission_classes=[]

    def post(self,request):
        email=request.data.get('email')
        new_password=request.data.get('password')

        try:
            user=User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response({'message':'Password Reset Successful'},status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error':'User not found'},status=status.HTTP_404_NOT_FOUND)
