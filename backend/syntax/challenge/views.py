from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from challenge.serializers import ChallengeSerializer,SubmissionSerializer,SubmissionListSerializer,SolutionSerializer,ChallengeCreateSerializer,ChallengeRequestSerializer
from rest_framework.response import Response
from rest_framework import status
from challenge.models import Challenge,Submission,Solutions,ChallengeRequest
import requests
import json,time
from challenge.utils import format_input_args,update_user_streak
from django.db.models import Count,Avg
from django.core.paginator import Paginator
from accounts.models import User
from notification.utils import send_system_notification
from badge.utils import award_badges_on_submission
from django.db.models import Q
from django.utils import timezone


# Handles the creation of a new coding challenge. 
# Only users with staff or superuser status are authorized.
class ChallengeCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer=ChallengeCreateSerializer(data=request.data)
        if serializer.is_valid():
            challenge=serializer.save()

            users=User.objects.all()
            send_system_notification(
                users,
                f"New challenge '{challenge.title}' has been posted!",
                link=f'/challenge/{challenge.id}/'
            )
            
            return Response({"message": "Challenge created successfully!"},status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


# Allows authorized staff or superusers to update an existing challenge.
# Updates are partial (PATCH method).
class ChallengeUpdateView(APIView):
    permission_classes=[IsAuthenticated]

    def patch(self,request,id):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        challenge=Challenge.objects.get(id=id)
        serializer=ChallengeSerializer(challenge,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'challenge updated successfully'},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        



# Lists all challenges for the authenticated user.
# Staff and superusers see all challenges with pagination;
# regular users see only active challenges without pagination.
# Also includes user-specific info: whether the user has completed it,
# how many users completed it, and the challenge's success rate.
class ChallengeListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        user=request.user
        is_admin=user.is_staff or user.is_superuser

        search_query=request.GET.get('search','').strip()
        difficulty_filter=request.GET.get('difficulty','').strip()
        tag_filter=request.GET.get('tag','').strip()


        if is_admin:
            challenges=Challenge.objects.all()
        else:
            challenges=Challenge.objects.filter(is_active=True)
        
        if search_query:
            challenges=challenges.filter(
                Q(title__icontains=search_query)
            )
        
        if difficulty_filter and difficulty_filter.lower() != 'all':
            challenges=challenges.filter(difficulty__iexact=difficulty_filter)
        
        if tag_filter and tag_filter.lower() !='all':
            challenges=challenges.filter(tags__icontains=tag_filter)
        
        challenges=challenges.order_by('-created_at')

        if is_admin:
            page=int(request.GET.get('page',1))
            page_size=int(request.GET.get('page_size',10))
            paginator=Paginator(challenges,page_size)
            page_obj=paginator.get_page(page)
            paginated_challenges=page_obj.object_list
            total_count = paginator.count
        else:
            paginated_challenges=challenges
            total_count = challenges.count()

        challenge_list=[]

        for challenge in paginated_challenges:
            is_completed=Submission.objects.filter(user=user,challenge=challenge,is_completed=True).exists()
            total_attempts=Submission.objects.filter(challenge=challenge).count()
            completed_users_count=Submission.objects.filter(challenge=challenge,is_completed=True).values('user').distinct().count()
            if total_attempts > 0:
                success_rate=round((completed_users_count/total_attempts)*100,2)
            else:
                success_rate=0.0
            serializer=ChallengeSerializer(challenge,context={'request':request})
            challenge_data=serializer.data
            challenge_data['is_completed']=is_completed
            challenge_data['success_rate']=success_rate
            challenge_data['completed_users']=completed_users_count

            challenge_list.append(challenge_data)
        
        return Response({
            'results':challenge_list,
            'count':total_count,
            'search_query':search_query,
            'applied_filters': {
                'difficulty': difficulty_filter,
                'tag': tag_filter
            }
        },status=status.HTTP_200_OK)
        


# Allows staff/superusers to activate or deactivate a challenge
# using the `is_active` field.
class ChallengeBlockView(APIView):
    permission_classes=[IsAuthenticated]

    def patch(self,request,id):
        if not(request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            challenge=Challenge.objects.get(id=id)
        except Challenge.DoesNotExist:
            return Response({'detail':'Challenge not Found'},status=status.HTTP_404_NOT_FOUND)
        
        is_active=request.data.get('is_active')
        if is_active is None:
            return Response({'error':'is_active field is required'},status=status.HTTP_400_BAD_REQUEST)
        challenge.is_active=is_active
        challenge.save()
        return Response({'message':'Challenge Status Updated Successfully'},status=status.HTTP_200_OK)


# Fetches detailed information about a specific challenge by ID.
# Non-admin users can only view active challenges.
class ChallengeDetailView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request,id):
        try:
            challenge=Challenge.objects.get(id=id)
            if not challenge.is_active and not (request.user.is_staff or request.user.is_superuser):
                return Response({'detail': 'This challenge is not available.'},status=status.HTTP_403_FORBIDDEN)
            serializer=ChallengeSerializer(challenge)
            return Response(serializer.data)
        except Challenge.DoesNotExist:
            return Response({'detail':'challenge not Found'},status=status.HTTP_404_NOT_FOUND)


PISTON_URL = "https://emkc.org/api/v2/piston/execute"



# Executes the user's code against all **visible** test cases
# using the Piston code execution API.
# Returns the result of each test case with a summary of passed tests.
class RunChallengeView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        challenge_id=request.data.get('challenge_id')
        code=request.data.get('code')
        language=request.data.get('language')

        try:
            challenge=Challenge.objects.get(id=challenge_id)
        except Challenge.DoesNotExist:
            return Response({'error':'Challenge not found'},status=status.HTTP_404_NOT_FOUND)
        
        
        # function_name = challenge.function_signature.strip().split('(')[0].replace("def", "").strip()
        function_name = challenge.function_signature.strip()
        visible_cases = [tc for tc in challenge.test_cases if not tc["hidden"]]
        console_output=[]
        passed=0
        total=len(visible_cases)

        for i,case in enumerate(visible_cases):
            input_args = format_input_args(case['input'], language)
            func_call=''
            if language == 'python':
                func_call = f"\nprint({function_name}({input_args}))" 
                final_code=code.strip() + "\n" + func_call
            elif language == 'javascript':
                func_call=f"\nconsole.log({function_name}({input_args}))"
                final_code=code.strip() + "\n" + func_call
            elif language == 'cpp':
                final_code=f"""
#include <iostream>
using namespace std;

{code.strip()}

int main() {{
    cout << {function_name}({input_args});
    return 0;
}}
"""
            elif language == 'java':
                final_code=f"""
{code.strip()}

class Main {{
    public static void main(String[] args) {{
        System.out.println({function_name}({input_args}));
    }}
}}
"""
            elif language=='c':
                final_code=f"""
#include <stdio.h>

{code.strip()}

int main() {{
    printf("%d", {function_name}({input_args}));
    return 0;
}}
"""
            else:
                return Response({'error':'unsupported language'},status=status.HTTP_400_BAD_REQUEST)
            data={
                'language':language,
                "version": "*",
                "files": [
                    {
                        "name": "main." + (
                            'py' if language == 'python' else
                            'js' if language == 'javascript' else
                            'cpp' if language == 'cpp' else
                            'java' if language == 'java' else
                            'c'
                        ), 
                        "content": final_code
                    }
                ]
            }
            piston_res=requests.post(PISTON_URL,json=data)
            result=piston_res.json()

            # actual_output = result.get('run', {}).get('stdout', '').strip().lower()
            # expected_output=case['output'].strip().lower()
            # stderr = result.get('run', {}).get('stderr', '') or result.get('compile', {}).get('stderr', '')
            actual_output_raw = result.get('run', {}).get('stdout', '').strip()
            expected_output_raw = case['output'].strip()
            stderr = result.get('run', {}).get('stderr', '') or result.get('compile', {}).get('stderr', '')

            try:
                actual_parsed = json.loads(actual_output_raw)
                expected_parsed = json.loads(expected_output_raw)
                is_passed = actual_parsed == expected_parsed
            except Exception:
                is_passed = actual_output_raw.lower() == expected_output_raw.lower()

            if stderr:
                console_output.append({
                    "type": "error",
                    "message": f"Test Case {i + 1}: ERROR",
                    "details": {
                        "input": case['input'],
                        "error": stderr.strip()
                    }
                })
            elif is_passed:
                console_output.append({
                    'type':'success',
                    "message": f"Test Case {i + 1}: PASSED"
                })
                passed+=1
            else:
                console_output.append({
                    "type": "error",
                    "message": f"Test Case {i + 1}: FAILED",
                    "details": {
                        "input": case['input'],
                        "expected": expected_output_raw,
                        "actual": actual_output_raw
                    }
                })
        
        summary={
            'passed':passed,
            'total':total
        }

        console_output.append({
            'type':'info',
            'message':f"{passed}/{total} test cases passed"
        })
        return Response({
            'console_output':console_output,
            'result_summary':summary
        })



# Handles challenge submission by the user.
# Code is executed against **all** test cases (visible + hidden).
# Awards XP only if the user is completing the challenge for the first time.
# Saves the submission and updates the user's XP and progress.
class SubmitChallengeView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        serializer=SubmissionSerializer(data=request.data)
        if serializer.is_valid():
            challenge_id=serializer.validated_data['challenge_id']
            code=serializer.validated_data['code']
            language=serializer.validated_data['language']
            user=request.user

            try:
                challenge=Challenge.objects.get(id=challenge_id)
            except Challenge.DoesNotExist:
                return Response({'error':'Challenge not found'},status=status.HTTP_404_NOT_FOUND)
            
            already_completed=Submission.objects.filter(user=user,challenge=challenge,is_completed=True).exists()
            
            function_name=challenge.function_signature.strip()
            visible_cases=[tc for tc in challenge.test_cases]
            console_output=[]
            passed=0
            total=len(visible_cases)
            failed_hidden_cases=[]

            start_time=time.time()

            for i,case in enumerate(visible_cases):
                input_args = format_input_args(case['input'], language)
                func_call=''
                if language == 'python':
                    func_call = f"\nprint({function_name}({input_args}))" 
                    final_code=code.strip() + "\n" + func_call
                elif language == 'javascript':
                    func_call=f"\nconsole.log({function_name}({input_args}))"
                    final_code=code.strip() + "\n" + func_call
                elif language == 'cpp':
                    final_code=f"""
                        #include <iostream>
                        using namespace std;

                        {code.strip()}

                        int main() {{
                            cout << {function_name}({input_args});
                            return 0;
                        }}
                        """
                elif language == 'java':
                    final_code=f"""
                        {code.strip()}

                        class Main {{
                            public static void main(String[] args) {{
                                System.out.println({function_name}({input_args}));
                            }}
                        }}
                        """
                elif language=='c':
                    final_code=f"""
                        #include <stdio.h>

                        {code.strip()}

                        int main() {{
                            printf("%d", {function_name}({input_args}));
                            return 0;
                        }}
                        """
                else:
                    return Response({'error':'unsupported language'},status=status.HTTP_400_BAD_REQUEST)
                
                data={
                    'language':language,
                    'version':'*',
                    "files": [
                        {
                            "name": "main." + (
                                'py' if language == 'python' else
                                'js' if language == 'javascript' else
                                'cpp' if language == 'cpp' else
                                'java' if language == 'java' else
                                'c'
                            ), 
                            "content": final_code
                        }
                    ]
                }
                piston_res=requests.post(PISTON_URL,json=data)
                result=piston_res.json()

                # actual_output = result.get('run', {}).get('stdout', '').strip().lower()
                # expected_output=case['output'].strip().lower()
                # stderr = result.get('run', {}).get('stderr', '') or result.get('compile', {}).get('stderr', '')

                actual_output_raw = result.get('run', {}).get('stdout', '').strip()
                expected_output_raw = case['output'].strip()
                stderr = result.get('run', {}).get('stderr', '') or result.get('compile', {}).get('stderr', '')

                try:
                    actual_parsed = json.loads(actual_output_raw)
                    expected_parsed = json.loads(expected_output_raw)
                    is_passed = actual_parsed == expected_parsed
                except Exception:
                    is_passed = actual_output_raw.lower() == expected_output_raw.lower()


                if stderr:
                    if case.get('hidden'):
                        failed_hidden_cases.append({
                            'input':input_args,
                            'error':stderr.strip()
                        })
                    continue

                if is_passed:
                    passed+=1
                    console_output.append({
                        'type': 'success',
                        'message': f"Test Case {i + 1} {'(Hidden)' if case.get('hidden') else ''}: PASSED"
                    })
                else:
                    if case.get('hidden'):
                        failed_hidden_cases.append({
                            'input':input_args,
                            'actual':actual_output_raw,
                            'expected':expected_output_raw
                        })
                    console_output.append({
                        'type': 'error',
                        'message': f"Test Case {i + 1} {'(Hidden)' if case.get('hidden') else ''}: FAILED",
                        'details': {
                            'input':input_args,
                            'actual':actual_output_raw,
                            'expected':expected_output_raw
                        }
                    })
            
            end_time=time.time()
            runtime=round(end_time-start_time,2)

            is_completed=passed==total

            xp_awarded=challenge.xp_reward if is_completed and not already_completed else 0

            submission=Submission.objects.create(
                user=user,
                challenge=challenge,
                code=code,
                language=language,
                is_completed=is_completed,
                passed_test_cases=passed,
                total_test_cases=total,
                runtime=runtime,
                xp_awarded=xp_awarded
                )
            
            if xp_awarded:
                user.xp +=xp_awarded
                user.save()
                update_user_streak(user)
            
            award_badges_on_submission(submission)
            
            console_output.append({
                'type':'info',
                'message':f"{passed}/{total} test cases passed"
            })

            if xp_awarded:
                console_output.append({
                    'type': 'success',
                    'message': f"🎉 {xp_awarded} XP awarded!"
                })
            elif is_completed and already_completed:
                console_output.append({
                    'type': 'warning',
                    'message': "You already completed this challenge."
                })
            elif not is_completed:
                console_output.append({
                    'type': 'error',
                    'message': "Challenge failed. Try fixing the issues above and submit again."
                })
            
            for error in failed_hidden_cases:
                console_output.append({
                    'type': 'error',
                    'message': 'Hidden Test Case Failed',
                    'details': error
                })
            
            attempts = Submission.objects.filter(user=user, challenge=challenge).count()     
            summary={
                'passed':passed,
                'total':total,
                'is_completed':is_completed,
                'xp_awarded':xp_awarded,
                'already_completed':already_completed,
                'attempts':attempts
            }

            return Response({
                'console_output':console_output,
                'result_summary':summary
            },status=status.HTTP_200_OK)


# Retrieves all past submissions of the authenticated user 
# for a specific challenge by ID.
class SubmissionListView(APIView):
    permission_classes =[IsAuthenticated]

    def get(self,request,id):
        user=request.user
        submissions=Submission.objects.filter(user=user,challenge_id=id)
        serializer=SubmissionListSerializer(submissions,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    

# Allows an authenticated user to submit a solution (explanation) 
# for a challenge they've completed.
class CreateSolutionView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,challenge_id):
        print("request reached")
        challenge=Challenge.objects.get(id=challenge_id)
        serializer=SolutionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user,challenge=challenge)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



# Retrieves all submitted solutions (explanations) 
# for a specific challenge.
class SolutionListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request,challenge_id):
        solutions=Solutions.objects.filter(challenge__id=challenge_id).order_by('-created_at')
        serializer=SolutionSerializer(solutions,many=True)
        return Response(serializer.data)


# Allows a user to delete their own solution 
# to a specific challenge.
class SolutionDeleteView(APIView):
    permission_classes=[IsAuthenticated]

    def delete(self,request,challenge_id,solution_id):
        try:
            solution=Solutions.objects.get(id=solution_id,challenge__id=challenge_id,user=request.user)
        except Solutions.DoesNotExist:
            return Response({'error':'Solution not found'},status=status.HTTP_404_NOT_FOUND)
        solution.delete()
        return Response({'detail': 'Solution deleted'}, status=status.HTTP_204_NO_CONTENT)


# Allows a user to edit/update their own submitted solution 
# for a specific challenge. Partial updates are allowed.
class SolutionEditView(APIView):
    permission_classes=[IsAuthenticated]

    def put(self,request,challenge_id,solution_id):
        print("request reached")
        try:
            solution=Solutions.objects.get(id=solution_id,challenge__id=challenge_id,user=request.user)
        except Solutions.DoesNotExist:
            return Response({'error':'solution not found'},status=status.HTTP_404_NOT_FOUND)
        serializer=SolutionSerializer(solution,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


# Returns the number of completed challenges per programming language 
# for the authenticated user using aggregation.
class CompletedLanguagesStatsView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        user=request.user

        completed_count=(
            Submission.objects.filter(user=user,is_completed=True)
            .values('language')
            .annotate(completed_count=Count('challenge',distinct=True))
        )

        return Response(list(completed_count))
    

# Provides stats like total submissions, completion count, acceptance rate, 
# and difficulty-level wise challenge completion for the user.
class UserDomainStatsView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        user=request.user

        total_submissions=Submission.objects.filter(user=user).count()
        completed_challenge_ids=Submission.objects.filter(user=user,is_completed=True).values_list('challenge_id',flat=True).distinct()

        total_completed=completed_challenge_ids.count()

        challenges=Challenge.objects.filter(id__in=completed_challenge_ids)

        completed_dict = {
            'easy': challenges.filter(difficulty='easy').count(),
            'medium': challenges.filter(difficulty='medium').count(),
            'hard': challenges.filter(difficulty='hard').count(),
        }
        
        total_challenges=Challenge.objects.values('difficulty').annotate(count=Count('id'))
        total_dict = {"easy": 0, "medium": 0, "hard": 0}

        for item in total_challenges:
            level=item['difficulty']
            if level in total_dict:
                total_dict[level]=item['count']

        acceptance_rate=(
            (total_completed/total_submissions) * 100 if total_submissions > 0 else 0
        )

        return Response({
            'challenges_completed':total_completed,
            'acceptance_rate':round(acceptance_rate,2),
            'easy_completed':completed_dict['easy'],
            'easy_total':total_dict['easy'],
            'medium_completed':completed_dict['medium'],
            'hard_completed':completed_dict['hard'],
            'medium_total':total_dict['medium'],
            'hard_total':total_dict['hard'],
        })



# Allows users to submit a request to create a new challenge.
# Sends a system notification upon successful submission.
class CreateChallengeRequestView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        serializer=ChallengeRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)

            title=serializer.validated_data['title']

            send_system_notification(
                [request.user],
                f"Your request for challenge {title} has been submitted successfully."
            )
            return Response({'message':'Challenge Request Submitted Successfully'},status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


# Returns a paginated list of challenge requests.
# Admins see all requests, users see only their own; supports search.
class ChallengeRequestListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        user=request.user
        is_admin=request.user.is_superuser or request.user.is_staff

        search=request.GET.get('search','')
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',10))

        if is_admin:
            queryset=ChallengeRequest.objects.all()
        else:
            queryset=ChallengeRequest.objects.filter(user=user)

        if search:
            queryset=queryset.filter(
                Q(title__icontains=search)
            )
        
        paginator=Paginator(queryset.order_by('-created_at'),page_size)
        page_obj=paginator.get_page(page)
        count=paginator.count
        serializer=ChallengeRequestSerializer(page_obj,many=True)
        return Response({
            'results':serializer.data,
            'count':count
        })

# Allows admins to update the status of a submitted challenge request.
# Sends a system notification to the requester on status update.
class ChallengeRequestStatusUpdateView(APIView):
    permission_classes=[IsAuthenticated]

    def patch(self,request,request_id):
        try:
            challenge_request=ChallengeRequest.objects.get(id=request_id)
        except ChallengeRequest.DoesNotExist:
            return Response({'error':'Challenge Request not found'},status=status.HTTP_404_NOT_FOUND)
        
        status_value=request.data.get('status')
        if status_value:
            challenge_request.status=status_value
            challenge_request.save()

            send_system_notification(
                [challenge_request.user],
                f"Your Challenge request status has been updated to {status_value}."
            )

            return Response({'message':'status updated successfully'})
        return Response({'error':'no status provided'},status=status.HTTP_400_BAD_REQUEST)


# Returns the currently active time-limited challenge if available.
# Also includes success rate based on completed submissions.
class TimeLimitedChallengesView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        now=timezone.now()
        challenge=Challenge.objects.filter(start_time__isnull=False,end_time__isnull=False,start_time__lte=now,end_time__gte=now).order_by('-start_time').first()
        if challenge:
            serializer=ChallengeSerializer(challenge)
            challenge_data=serializer.data

            total_attempts=Submission.objects.filter(challenge=challenge).count()
            completed_users_count=Submission.objects.filter(challenge=challenge,is_completed=True).values('user').distinct().count()
            if total_attempts > 0:
                success_rate=round((completed_users_count/total_attempts)*100,2)
            else:
                success_rate=0.0
            
            challenge_data['success_rate']=success_rate

            return Response(challenge_data)
        else:
            return Response({'message':'coming soon'},status=status.HTTP_200_OK)

