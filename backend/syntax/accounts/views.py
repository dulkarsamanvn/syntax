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
            return Response({'message':'OTP verified successfully'},status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error':'User not found'},status=status.HTTP_400_BAD_REQUEST)

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

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    permission_classes=[]
    def post(self,request):
        response=JsonResponse({'message':'Logout Successful'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    

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

            