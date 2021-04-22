import os
import jwt

def parse_jwt_token(token) -> dict:
    TEST_SECRET = os.getenv('TEST_SECRET')
    if TEST_SECRET is None:
        raise Exception('No environment TEST_SECRET defined.')
    if not token:
        raise Exception('No token given for parse_token().')

    return jwt.decode(token, TEST_SECRET, algorithms=["HS256"])
