import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    print("1. Testing Health...")
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        assert r.status_code == 200
        print("OK")
    except Exception as e:
        print(f"FAILED: {e}")
        return

    # 1. Login as Admin
    print("\n2. Testing Admin Login...")
    r = requests.post(f"{BASE_URL}/auth/token", data={"username": "admin", "password": "password"})
    if r.status_code != 200:
        print(f"FAILED: Could not login as admin. {r.text}")
        return
    admin_token = r.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("OK")

    # 2. Create Course
    print("\n3. Testing Create Course...")
    course_data = {
        "title": "Test Course",
        "description": "Test Desc",
        "price": 1000,
        "image_url": "http://test.com/image.png"
    }
    r = requests.post(f"{BASE_URL}/admin/courses", json=course_data, headers=admin_headers)
    if r.status_code == 200:
        course_id = r.json()["id"]
        print(f"OK (Course ID: {course_id})")
    else:
        print(f"FAILED: {r.text}")
        return

    # 3. Login as Student
    print("\n4. Testing Student Login...")
    r = requests.post(f"{BASE_URL}/auth/token", data={"username": "demo", "password": "password"})
    if r.status_code != 200:
        print(f"FAILED: Could not login as demo. {r.text}")
        return
    student_token = r.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("OK")

    # 4. Buy Course
    print("\n5. Testing Buy Course...")
    r = requests.post(f"{BASE_URL}/courses/{course_id}/buy", headers=student_headers)
    if r.status_code == 200 or "Already enrolled" in r.text:
       print(f"OK: {r.json()}")
    else:
       print(f"FAILED: {r.text}")

    # 5. Create Note
    print("\n6. Testing Create Note...")
    note_data = {"title": "My Note", "content": "This is a test note."}
    r = requests.post(f"{BASE_URL}/notes/", json=note_data, headers=student_headers)
    if r.status_code == 200:
       print("OK")
    else:
       print(f"FAILED: {r.text}")

    # 6. Check Analytics (Owner)
    print("\n7. Testing Owner Analytics...")
    r = requests.post(f"{BASE_URL}/auth/token", data={"username": "owner", "password": "password"})
    if r.status_code == 200:
        owner_token = r.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        r = requests.get(f"{BASE_URL}/analytics/dashboard", headers=owner_headers)
        if r.status_code == 200:
            print(f"OK: {r.json()}")
        else:
            print(f"FAILED TO GET ANALYTICS: {r.text}")
    else:
        print(f"FAILED: Could not login as owner. {r.text}")

if __name__ == "__main__":
    test_flow()
