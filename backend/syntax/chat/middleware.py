from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.authentication import JWTAuthentication
from jwt.exceptions import InvalidTokenError
from asgiref.sync import sync_to_async


class JWTAuthFromCookieMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        cookies_raw = headers.get(b'cookie', b'').decode()
        cookies = {
            kv.split('=')[0]: kv.split('=')[1]
            for kv in cookies_raw.split('; ') if '=' in kv
        }

        print("[JWT MIDDLEWARE] Raw Headers:", headers)
        print("[JWT MIDDLEWARE] Cookies Raw:", cookies_raw)
        print("[JWT MIDDLEWARE] Cookies Parsed:", cookies)

        access_token = cookies.get("access_token")
        print("access_token",access_token)
        

        scope["user"] = AnonymousUser()  # default to anonymous

        if access_token:
            try:
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(access_token)
                user = await sync_to_async(jwt_auth.get_user)(validated_token)
                scope["user"] = user
            except InvalidTokenError:
                pass
            except Exception as e:
                print(f"[JWT Middleware] Error fetching user: {e}")

        close_old_connections()
        return await super().__call__(scope, receive, send)


def JWTAuthFromCookieMiddlewareStack(inner):
    from channels.sessions import SessionMiddlewareStack
    return JWTAuthFromCookieMiddleware(SessionMiddlewareStack(inner))
