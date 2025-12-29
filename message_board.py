"""Message board system for BBS"""
import os
import json
from datetime import datetime
from colorama import Fore, Style

class MessageBoard:
    """Handle message board functionality"""
    
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.messages_file = os.path.join(data_dir, 'messages.json')
        self._ensure_data_dir()
        self.messages = self._load_messages()
        self.boards = ['General', 'Tech Support', 'File Sharing', 'Gaming']
        
    def _ensure_data_dir(self):
        """Ensure data directory exists"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            
    def _load_messages(self):
        """Load messages from file"""
        if os.path.exists(self.messages_file):
            try:
                with open(self.messages_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading messages: {e}")
                return {}
        return {}
        
    def _save_messages(self):
        """Save messages to file"""
        try:
            with open(self.messages_file, 'w') as f:
                json.dump(self.messages, f, indent=2)
        except Exception as e:
            print(f"Error saving messages: {e}")
            
    def display_boards(self, current_user=None):
        """Display message boards"""
        while True:
            os.system('cls' if os.name == 'nt' else 'clear')
            print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
            print(f"{Fore.GREEN}║        MESSAGE BOARDS             ║{Style.RESET_ALL}")
            print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
            
            for idx, board in enumerate(self.boards, 1):
                msg_count = len(self.messages.get(board, []))
                print(f"{Fore.CYAN}{idx}.{Style.RESET_ALL} {board} ({msg_count} messages)")
                
            print(f"{Fore.CYAN}Q.{Style.RESET_ALL} Return to Main Menu\n")
            
            choice = input(f"{Fore.CYAN}Select board: {Style.RESET_ALL}").strip().upper()
            
            if choice == 'Q':
                break
                
            try:
                board_idx = int(choice) - 1
                if 0 <= board_idx < len(self.boards):
                    self.view_board(self.boards[board_idx], current_user)
            except ValueError:
                pass
                
    def view_board(self, board_name, current_user=None):
        """View messages in a board"""
        while True:
            os.system('cls' if os.name == 'nt' else 'clear')
            print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
            print(f"{Fore.GREEN}║  {board_name:^33} ║{Style.RESET_ALL}")
            print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
            
            messages = self.messages.get(board_name, [])
            
            if not messages:
                print(f"{Fore.YELLOW}No messages yet. Be the first to post!{Style.RESET_ALL}\n")
            else:
                for idx, msg in enumerate(messages, 1):
                    print(f"{Fore.CYAN}{idx}.{Style.RESET_ALL} {msg['subject']}")
                    print(f"   From: {msg['author']} | {msg['date']}\n")
                    
            print(f"{Fore.CYAN}P.{Style.RESET_ALL} Post New Message")
            print(f"{Fore.CYAN}Q.{Style.RESET_ALL} Return to Board List\n")
            
            choice = input(f"{Fore.CYAN}Select option: {Style.RESET_ALL}").strip().upper()
            
            if choice == 'Q':
                break
            elif choice == 'P':
                self.post_message(board_name, current_user)
            else:
                try:
                    msg_idx = int(choice) - 1
                    if 0 <= msg_idx < len(messages):
                        self.read_message(messages[msg_idx])
                except ValueError:
                    pass
                    
    def post_message(self, board_name, current_user=None):
        """Post a new message"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"{Fore.GREEN}=== POST NEW MESSAGE ==={Style.RESET_ALL}\n")
        
        subject = input(f"{Fore.CYAN}Subject: {Style.RESET_ALL}").strip()
        if not subject:
            print(f"{Fore.RED}Subject cannot be empty!{Style.RESET_ALL}")
            input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
            return
            
        print(f"{Fore.YELLOW}Enter message (empty line to finish):{Style.RESET_ALL}")
        message_lines = []
        while True:
            line = input()
            if not line:
                break
            message_lines.append(line)
            
        if not message_lines:
            print(f"{Fore.RED}Message cannot be empty!{Style.RESET_ALL}")
            input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
            return
        
        # Use current user's username or 'Anonymous' if not provided
        author = current_user['username'] if current_user else 'Anonymous'
            
        message_data = {
            'subject': subject,
            'author': author,
            'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
            'message': '\n'.join(message_lines)
        }
        
        if board_name not in self.messages:
            self.messages[board_name] = []
            
        self.messages[board_name].append(message_data)
        self._save_messages()
        
        print(f"\n{Fore.GREEN}Message posted successfully!{Style.RESET_ALL}")
        input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
        
    def read_message(self, message):
        """Read a message"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
        print(f"{Fore.GREEN}║          MESSAGE VIEW             ║{Style.RESET_ALL}")
        print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
        
        print(f"{Fore.CYAN}Subject:{Style.RESET_ALL} {message['subject']}")
        print(f"{Fore.CYAN}From:{Style.RESET_ALL} {message['author']}")
        print(f"{Fore.CYAN}Date:{Style.RESET_ALL} {message['date']}\n")
        print(f"{Fore.YELLOW}{'─' * 40}{Style.RESET_ALL}")
        print(message['message'])
        print(f"{Fore.YELLOW}{'─' * 40}{Style.RESET_ALL}")
        
        input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
