import json
from datetime import date,timedelta


def format_input_args(input_str,language):
    try:
        parsed=json.loads(input_str)
    except json.JSONDecodeError:
        return input_str
    
    if isinstance(parsed,str):
        if language in ['python','javascript']:
            return json.dumps(parsed)
        else:
            return f'"{parsed}"'
    if isinstance(parsed,list):
        if language=='python':
            return str(parsed)
        elif language=='javascript':
            return json.dumps(parsed)
        elif language in ['cpp', 'java', 'c']:
            return str(parsed)
    if isinstance(parsed,bool):
        if language == 'python':
            return 'True' if parsed else 'False'
        elif language == 'javascript':
            return 'true' if parsed else 'false'
        else:
            return '1' if parsed else '0'
    else:
        return str(parsed)
        


def update_user_streak(user):
    today=date.today()

    if user.last_solved_date==today:
        return
    
    if user.last_solved_date== today-timedelta(days=1):
        user.current_streak+=1
    else:
        user.current_streak=1
    
    if user.current_streak > user.longest_streak:
        user.longest_streak=user.current_streak
    
    user.last_solved_date=today
    user.save()