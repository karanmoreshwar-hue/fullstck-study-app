import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_chat():
    print("1. Login as Student...")
    try:
        r = requests.post(f"{BASE_URL}/auth/token", data={"username": "demo", "password": "password"})
        if r.status_code != 200:
            print(f"FAILED: Could not login. {r.text}")
            return
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("OK")
    except Exception as e:
        print(f"FAILED: {e}")
        return

    print("\n2. Sending Chat Message...")
    chat_data = {
        "message": "Hello, explain Python variables.",
        "topic": "Python"
    }
    try:
        r = requests.post(f"{BASE_URL}/llm/chat", json=chat_data, headers=headers)
        if r.status_code == 200:
            print("OK")
            print(f"Response: {r.json()}")
        else:
            print(f"FAILED: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_chat()
