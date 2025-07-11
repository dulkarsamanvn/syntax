from django.urls import path
from premium.views import PremiumPlanCreateView,PremiumPlanListVIew,PremiumPlanOrderView,VerifyPaymentView,CheckSubscriptionView,MembershipHistoryView,CancelSubscriptionView

urlpatterns = [
   path('create/',PremiumPlanCreateView.as_view(),name='create-plan'),
   path('list/',PremiumPlanListVIew.as_view(),name='plan-list'),
   path('create-order/',PremiumPlanOrderView.as_view(),name='create-order'),
   path('verify/',VerifyPaymentView.as_view(),name='verify'),
   path('check-subscription/',CheckSubscriptionView.as_view(),name='check-subscription'),
   path('cancel-subscription/',CancelSubscriptionView.as_view(),name='cancel-subscription'),
   path('membership-history/',MembershipHistoryView.as_view(),name='membership-history'),


]
