from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from premium.serializers import PremiumPlanSerializer
from rest_framework.response import Response
from rest_framework import status
from premium.models import PremiumPlan,UserSubscription,SubscriptionHistory
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import razorpay
# Create your views here.

class PremiumPlanCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        serializer=PremiumPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class PremiumPlanUpdateView(APIView):
    permission_classes=[IsAuthenticated]

    def put(self,request,id):
        print("request reached")
        try:
            plan=PremiumPlan.objects.get(id=id)
        except PremiumPlan.DoesNotExist:
            return Response({'error':'plan not found'},status=status.HTTP_404_NOT_FOUND)
        
        serializer=PremiumPlanSerializer(plan,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        


class PremiumPlanListVIew(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        if request.user.is_staff or request.user.is_superuser:
            plans=PremiumPlan.objects.all()
        else:
            plans=PremiumPlan.objects.filter(is_active=True)
        
        serializer=PremiumPlanSerializer(plans,many=True)
        return Response(serializer.data)


class PremiumPlanOrderView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        plan_id=request.data.get('plan_id')
        try:
            plan=PremiumPlan.objects.get(id=plan_id)
        except PremiumPlan.DoesNotExist:
            return Response({'error':'plan not found'},status=status.HTTP_404_NOT_FOUND)
        
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order_data={
            "amount": int(plan.price * 100),  # in paise
            "currency": "INR",
            "payment_capture": 1
        }
        order=client.order.create(data=order_data)
        return Response({
            "order_id": order['id'],
            "amount": order['amount'],
            "currency": order['currency'],
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "description": plan.description
            }
        })

class VerifyPaymentView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        data=request.data
        user=request.user

        order_id = data.get("razorpay_order_id")
        payment_id = data.get("razorpay_payment_id")
        signature = data.get("razorpay_signature")
        plan_id = data.get("plan_id")

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
        except razorpay.errors.SignatureVerificationError:
            return Response({'error':'payment verification failed'},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            plan=PremiumPlan.objects.get(id=plan_id)
        except PremiumPlan.DoesNotExist:
            return Response({'error':'plan not found'},status=status.HTTP_404_NOT_FOUND)
        
        existing = getattr(user, 'subscription', None)
        if existing and not existing.has_expired():
            SubscriptionHistory.objects.create(
                user=user,
                plan=existing.plan,
                start_date=existing.start_date,
                end_date=timezone.now(),
                price=existing.plan.price
            )
        
        UserSubscription.objects.update_or_create(
            user=user,
            plan=plan,
            start_date=timezone.now(),
            end_date= timezone.now() + timedelta(days=plan.duration_days)
        )

        user.is_premium=True
        user.save()

        return Response({'message': 'Subscription activated successfully'})
            

class CheckSubscriptionView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        subscription=getattr(request.user,'subscription',None)

        if subscription and not subscription.has_expired():
            return Response({
                "is_premium": True,
                "plan_name": subscription.plan.name,
                "end_date": subscription.end_date,
                'start_date':subscription.start_date,
                'remaining_days':subscription.remaining_days()
            })
        return Response({'is_premium':False})


class CancelSubscriptionView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        subscription=getattr(request.user,'subscription',None)

        if subscription and not subscription.has_expired():
            SubscriptionHistory.objects.create(
                user=request.user,
                plan=subscription.plan,
                start_date=subscription.start_date,
                end_date=timezone.now(),
                price=subscription.plan.price
            )
            subscription.end_date=timezone.now()
            subscription.save()

            request.user.is_premium=False
            request.user.save()

            return Response({'message':'Subscription cancelled'},status=status.HTTP_200_OK)
        return Response({'error':'no active subscription'},status=status.HTTP_400_BAD_REQUEST)


class MembershipHistoryView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        history=request.user.subscription_history.all().order_by('-start_date')
        data=[{
            "plan_name": s.plan.name,
            "start_date": s.start_date,
            "end_date": s.end_date,
            "price": s.plan.price,
        } for s in history]

        return Response(data)