"""User management for BBS"""
import os
import json
import hashlib
import time
from datetime import datetime
from colorama import Fore, Style

class UserManager:
    """Manage user accounts and authentication"""
    
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.users_file = os.path.join(data_dir, 'users.json')
        self._ensure_data_dir()
        self.users = self._load_users()
        
    def _ensure_data_dir(self):
        """Ensure data directory exists"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            
    def _load_users(self):
        """Load users from file"""
        if os.path.exists(self.users_file):
            try:
                with open(self.users_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading users: {e}")
                return {}
        return {}
        
    def _save_users(self):
        """Save users to file"""
        try:
            with open(self.users_file, 'w') as f:
                json.dump(self.users, f, indent=2)
        except Exception as e:
            print(f"Error saving users: {e}")
            
    def _hash_password(self, password):
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
        
    def register_user(self):
        """Register a new user"""
        print(f"\n{Fore.GREEN}=== NEW USER REGISTRATION ==={Style.RESET_ALL}\n")
        
        while True:
            username = input(f"{Fore.CYAN}Enter username: {Style.RESET_ALL}").strip()
            
            if not username:
                print(f"{Fore.RED}Username cannot be empty!{Style.RESET_ALL}")
                continue
                
            if username.lower() in [u.lower() for u in self.users.keys()]:
                print(f"{Fore.RED}Username already exists!{Style.RESET_ALL}")
                continue
                
            break
            
        while True:
            password = input(f"{Fore.CYAN}Enter password: {Style.RESET_ALL}").strip()
            
            if len(password) < 6:
                print(f"{Fore.RED}Password must be at least 6 characters!{Style.RESET_ALL}")
                continue
                
            password_confirm = input(f"{Fore.CYAN}Confirm password: {Style.RESET_ALL}").strip()
            
            if password != password_confirm:
                print(f"{Fore.RED}Passwords do not match!{Style.RESET_ALL}")
                continue
                
            break
            
        # Create user account
        user_data = {
            'username': username,
            'password_hash': self._hash_password(password),
            'created': datetime.now().isoformat(),
            'last_login': datetime.now().isoformat(),
            'total_calls': 1,
            'messages_posted': 0,
            'files_uploaded': 0,
            'access_level': 'user'
        }
        
        self.users[username] = user_data
        self._save_users()
        
        print(f"\n{Fore.GREEN}Account created successfully!{Style.RESET_ALL}")
        time.sleep(1)
        
        return user_data
        
    def login_user(self):
        """Login existing user"""
        print(f"\n{Fore.GREEN}=== USER LOGIN ==={Style.RESET_ALL}\n")
        
        max_attempts = 3
        attempts = 0
        
        while attempts < max_attempts:
            username = input(f"{Fore.CYAN}Username: {Style.RESET_ALL}").strip()
            password = input(f"{Fore.CYAN}Password: {Style.RESET_ALL}").strip()
            
            if username in self.users:
                user = self.users[username]
                if user['password_hash'] == self._hash_password(password):
                    # Update last login
                    user['last_login'] = datetime.now().isoformat()
                    user['total_calls'] = user.get('total_calls', 0) + 1
                    self._save_users()
                    
                    print(f"\n{Fore.GREEN}Login successful!{Style.RESET_ALL}")
                    time.sleep(1)
                    return user
                    
            attempts += 1
            remaining = max_attempts - attempts
            
            if remaining > 0:
                print(f"{Fore.RED}Invalid credentials! {remaining} attempts remaining.{Style.RESET_ALL}\n")
            else:
                print(f"{Fore.RED}Maximum login attempts exceeded!{Style.RESET_ALL}")
                time.sleep(2)
                
        return None
