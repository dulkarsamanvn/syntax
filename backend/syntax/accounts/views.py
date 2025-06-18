from django.conf import settings
from django.shortcuts import render
from rest_framework.views import APIView
from accounts.serializers import SignupSerializer
from accounts.models import OTP,User
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken,TokenError
from django.http import JsonResponse



class SignupView(APIView):
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
    

class VerifyOTPView(APIView):
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

class ResendOTPView(APIView):
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

                
                      
class LoginView(APIView):
    def post(self,request):
        email=request.data.get('email')
        password=request.data.get('password')

        user=authenticate(username=email,password=password)
        if user is not None:
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
                secure=True,
                samesite='Lax',
                max_age=60 * 5
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='Lax',
                max_age=60 * 60 * 24 * 7

            )
            return response
        else:
            return Response({'detail':'Invalid Credentials'},status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self,request):
        response=JsonResponse({'message':'Logout Successful'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

class RefreshTokenView(APIView):
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
                secure=True,
                samesite='Lax',
                max_age=60 * 5
            )
            return response
        except TokenError:
            return Response({'detail':'Invalid refresh token'},status=status.HTTP_403_FORBIDDEN)
