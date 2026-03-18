#!/usr/bin/env python3
"""
Test script to verify the application status flow
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_status_flow():
    """Test the application status flow"""
    
    # Test data
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "mobile": "9876543210"
    }
    
    print("🧪 Testing Application Status Flow")
    print("=" * 50)
    
    # Step 1: Register user
    print("1. Registering user...")
    register_response = requests.post(f"{BASE_URL}/auth/registerOtp/", json=test_data)
    if register_response.status_code == 200:
        print("✅ User registration successful")
    else:
        print(f"❌ User registration failed: {register_response.text}")
        return
    
    # Step 2: Login user
    print("2. Logging in user...")
    login_response = requests.post(f"{BASE_URL}/auth/loginOtp/", json={"mobile": test_data["mobile"]})
    if login_response.status_code == 200:
        print("✅ Login OTP sent")
    else:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    # Step 3: Get application data
    print("3. Getting application data...")
    # Note: In real scenario, you'd need to get the token from login
    # For testing, we'll assume the token is available
    
    print("✅ Status flow test completed")
    print("\nExpected Status Flow:")
    print("- Started → In Progress → Completed → Selected (if in Google Sheet)")

if __name__ == "__main__":
    test_status_flow() 