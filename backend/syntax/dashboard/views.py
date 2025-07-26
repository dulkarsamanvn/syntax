from django.shortcuts import render,HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from datetime import date,timedelta,datetime
from accounts.models import User
from challenge.models import Challenge,Submission
from django.db.models import Avg,Count,IntegerField,Sum
from premium.models import SubscriptionHistory
from rest_framework.response import Response
from django.db.models.functions import Cast,TruncDay
import csv

# view to fetch stats for the dashboard
# all stats including user metrics,revenue metrics are taken here
class DashboardStatsView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        today=date.today()
        week_ago=today-timedelta(days=7)
        month_ago=today-timedelta(days=30)
        week_start=today-timedelta(days=today.weekday())
        month_start=today.replace(day=1)

        total_users=User.objects.count()
        active_users=User.objects.filter(last_login__gte=week_ago).count()
        churned_users=User.objects.filter(last_login__lte=today-timedelta(days=30)).count()
        premium_users=User.objects.filter(is_premium=True).count()

        total_challenges=Challenge.objects.all().count()
        attempts_this_week=Submission.objects.filter(created_at__gte=week_ago).count()
        total_attempts=Submission.objects.count()
        avg_completion_rate=Submission.objects.annotate(is_completed_int=Cast('is_completed', output_field=IntegerField())).aggregate(avg=Avg('is_completed_int'))['avg'] or 0


        most_attempted=(Submission.objects.values('challenge__id','challenge__title').annotate(attempt_count=Count('id')).order_by('-attempt_count').first())
        top_attempted=(Submission.objects.values('challenge__title').annotate(count=Count('id')).order_by('-count')[:3])

        total_revenue=SubscriptionHistory.objects.aggregate(total=Sum('price'))['total'] or 0
        weekly_revenue=SubscriptionHistory.objects.filter(start_date__date__gte=week_start).aggregate(total=Sum('price'))['total'] or 0
        monthly_revenue=SubscriptionHistory.objects.filter(start_date__date__gte=month_start).aggregate(total=Sum('price'))['total'] or 0


        revenue_trend = (
            SubscriptionHistory.objects
            .filter(start_date__date__gte=month_ago)
            .annotate(day=TruncDay('start_date'))
            .values('day')
            .annotate(total=Sum('price'))
            .order_by('day')
        )
        active_users_trend = (
            User.objects
            .filter(last_login__date__gte=month_ago)
            .annotate(day=TruncDay('last_login'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        plan_distribution=SubscriptionHistory.objects.values('plan__name').annotate(total=Sum('price')).order_by('-total')

        return Response({
            'total_users':total_users,
            'active_users':active_users,
            'total_challenges':total_challenges,
            'attempts_this_week':attempts_this_week,
            'avg_completion_rate':avg_completion_rate,
            'premium_users':premium_users,
            'most_attempted':most_attempted,
            'churned_users':churned_users,
            'total_attempts':total_attempts,
            'top_attempted':list(top_attempted),
            'total_revenue':float(total_revenue),
            'weekly_revenue':float(weekly_revenue),
            'monthly_revenue':float(monthly_revenue),
            'plan_distribution':list(plan_distribution),
            'revenue_trend':revenue_trend,
            'active_users_trend':active_users_trend,
            'user_breakdown': {
                'premium': premium_users,
                'free': total_users - premium_users
            }
        })


class ReportDownloadView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        response=HttpResponse(content_type='text/csv')
        filename=f'report_{datetime.now().strftime('%Y%m%d')}.csv'
        response["Content-Disposition"]=f'attachment; filename="{filename}"'

        writer=csv.writer(response)
        writer.writerow(["Metric", "Value"])

        today=date.today()
        week_ago=today-timedelta(days=7)

        total_users=User.objects.count()
        active_users=User.objects.filter(last_login__gte=week_ago).count()
        churned_users=User.objects.filter(last_login__lte=today-timedelta(days=30)).count()
        premium_users=User.objects.filter(is_premium=True).count()
        total_challenges=Challenge.objects.all().count()
        attempts_this_week=Submission.objects.filter(created_at__gte=week_ago).count()
        total_attempts=Submission.objects.count()
        avg_completion_rate=Submission.objects.annotate(is_completed_int=Cast('is_completed', output_field=IntegerField())).aggregate(avg=Avg('is_completed_int'))['avg'] or 0
        total_revenue=SubscriptionHistory.objects.aggregate(total=Sum('price'))['total'] or 0
        
        writer.writerow(["Total Users", total_users])
        writer.writerow(["Active Users", active_users])
        writer.writerow(["Churned Users", churned_users])
        writer.writerow(["Premium Users", premium_users])
        writer.writerow(["Total Challenges", total_challenges])
        writer.writerow(["Attempts This Week", attempts_this_week])
        writer.writerow(["Total Attempts", total_attempts])
        writer.writerow(["Avg Completion Rate", avg_completion_rate])
        writer.writerow(["Total Revenue", total_revenue])

        return response




