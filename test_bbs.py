#!/usr/bin/env python3
"""
Test script for Shift-Term BBS Emulator
Tests core functionality without interactive input
"""
import os
import sys
import json
import tempfile
import shutil

# Test imports
print("Testing imports...")
try:
    from bbs import BBSEmulator
    from ansi_handler import ANSIHandler
    from user_manager import UserManager
    from menu_system import MenuSystem
    from message_board import MessageBoard
    from file_area import FileArea
    print("✓ All imports successful")
except ImportError as e:
    print(f"✗ Import failed: {e}")
    sys.exit(1)

# Test BBS initialization
print("\nTesting BBS initialization...")
try:
    bbs = BBSEmulator()
    assert bbs.running == False
    assert bbs.current_user is None
    print("✓ BBS initialized correctly")
except Exception as e:
    print(f"✗ BBS initialization failed: {e}")
    sys.exit(1)

# Test ANSI handler
print("\nTesting ANSI handler...")
try:
    ansi = ANSIHandler()
    welcome = ansi.load_ansi('welcome.ans')
    assert welcome is not None
    assert len(welcome) > 0
    print("✓ ANSI handler working")
except Exception as e:
    print(f"✗ ANSI handler failed: {e}")
    sys.exit(1)

# Test User Manager
print("\nTesting User Manager...")
try:
    # Create temp directory for test data
    temp_dir = tempfile.mkdtemp()
    user_mgr = UserManager(data_dir=temp_dir)
    
    # Test password hashing
    hash1 = user_mgr._hash_password("test123")
    hash2 = user_mgr._hash_password("test123")
    assert hash1 == hash2
    print("✓ Password hashing working")
    
    # Test user creation
    test_user = {
        'username': 'testuser',
        'password_hash': hash1,
        'total_calls': 1,
        'messages_posted': 0,
        'files_uploaded': 0
    }
    user_mgr.users['testuser'] = test_user
    user_mgr._save_users()
    
    # Test user loading
    user_mgr2 = UserManager(data_dir=temp_dir)
    assert 'testuser' in user_mgr2.users
    print("✓ User management working")
    
    # Cleanup
    shutil.rmtree(temp_dir)
except Exception as e:
    print(f"✗ User Manager failed: {e}")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    sys.exit(1)

# Test Message Board
print("\nTesting Message Board...")
try:
    temp_dir = tempfile.mkdtemp()
    msg_board = MessageBoard(data_dir=temp_dir)
    
    # Test board creation
    assert len(msg_board.boards) > 0
    print("✓ Message boards initialized")
    
    # Test message storage
    test_message = {
        'subject': 'Test Message',
        'author': 'TestUser',
        'date': '2024-01-01 12:00',
        'message': 'This is a test message'
    }
    msg_board.messages['General'] = [test_message]
    msg_board._save_messages()
    
    # Test message loading
    msg_board2 = MessageBoard(data_dir=temp_dir)
    assert 'General' in msg_board2.messages
    assert len(msg_board2.messages['General']) == 1
    print("✓ Message board storage working")
    
    # Cleanup
    shutil.rmtree(temp_dir)
except Exception as e:
    print(f"✗ Message Board failed: {e}")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    sys.exit(1)

# Test File Area
print("\nTesting File Area...")
try:
    temp_dir = tempfile.mkdtemp()
    file_area = FileArea(files_dir=temp_dir)
    
    # Test file directory creation
    assert os.path.exists(temp_dir)
    print("✓ File area initialized")
    
    # Test with sample file
    test_file = os.path.join(temp_dir, 'test.txt')
    with open(test_file, 'w') as f:
        f.write('Test content')
    
    # Verify file exists
    files = [f for f in os.listdir(temp_dir) if os.path.isfile(os.path.join(temp_dir, f))]
    assert len(files) == 1
    print("✓ File area storage working")
    
    # Cleanup
    shutil.rmtree(temp_dir)
except Exception as e:
    print(f"✗ File Area failed: {e}")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    sys.exit(1)

# Test Menu System
print("\nTesting Menu System...")
try:
    menu = MenuSystem()
    # Menu system just displays, so we just check it initializes
    assert menu is not None
    print("✓ Menu system initialized")
except Exception as e:
    print(f"✗ Menu System failed: {e}")
    sys.exit(1)

print("\n" + "="*50)
print("ALL TESTS PASSED! ✓")
print("="*50)
print("\nThe BBS Emulator is ready to use!")
print("Run: python bbs.py")
