#!/usr/bin/env python3
"""
Shift-Term BBS Emulator
A nostalgic BBS (Bulletin Board System) terminal emulator
"""
import os
import sys
import time
from colorama import init, Fore, Back, Style
from ansi_handler import ANSIHandler
from user_manager import UserManager
from menu_system import MenuSystem
from message_board import MessageBoard
from file_area import FileArea

# Initialize colorama for cross-platform ANSI support
init()

class BBSEmulator:
    """Main BBS Emulator class"""
    
    def __init__(self):
        self.running = False
        self.current_user = None
        self.ansi_handler = ANSIHandler()
        self.user_manager = UserManager()
        self.menu_system = MenuSystem()
        self.message_board = MessageBoard()
        self.file_area = FileArea()
        
    def clear_screen(self):
        """Clear the terminal screen"""
        os.system('cls' if os.name == 'nt' else 'clear')
        
    def display_welcome(self):
        """Display welcome screen with ANSI art"""
        self.clear_screen()
        welcome_art = self.ansi_handler.load_ansi('welcome.ans')
        if welcome_art:
            print(welcome_art)
        else:
            # Fallback ASCII art
            print(f"{Fore.CYAN}")
            print("╔═══════════════════════════════════════════════════════╗")
            print("║                                                       ║")
            print("║              SHIFT-TERM BBS EMULATOR                  ║")
            print("║                                                       ║")
            print("║         Welcome to the Retro Computing Era!          ║")
            print("║                                                       ║")
            print("╚═══════════════════════════════════════════════════════╝")
            print(Style.RESET_ALL)
        
        time.sleep(1)
        
    def login(self):
        """Handle user login or registration"""
        self.clear_screen()
        print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
        print(f"{Fore.GREEN}║        USER AUTHENTICATION        ║{Style.RESET_ALL}")
        print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
        
        print(f"{Fore.YELLOW}[N]ew User Registration{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}[L]ogin with existing account{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}[Q]uit{Style.RESET_ALL}\n")
        
        choice = input(f"{Fore.CYAN}Select option: {Style.RESET_ALL}").strip().upper()
        
        if choice == 'N':
            self.current_user = self.user_manager.register_user()
        elif choice == 'L':
            self.current_user = self.user_manager.login_user()
        elif choice == 'Q':
            return False
        else:
            print(f"{Fore.RED}Invalid option!{Style.RESET_ALL}")
            time.sleep(1)
            return self.login()
            
        return self.current_user is not None
        
    def main_loop(self):
        """Main BBS loop"""
        while self.running:
            self.clear_screen()
            
            # Display header
            print(f"{Fore.CYAN}{'=' * 60}{Style.RESET_ALL}")
            print(f"{Fore.YELLOW}SHIFT-TERM BBS{Style.RESET_ALL} | User: {Fore.GREEN}{self.current_user['username']}{Style.RESET_ALL}")
            print(f"{Fore.CYAN}{'=' * 60}{Style.RESET_ALL}\n")
            
            # Display menu
            menu_choice = self.menu_system.display_main_menu()
            
            if menu_choice == '1':
                self.message_board.display_boards(self.current_user)
            elif menu_choice == '2':
                self.file_area.display_files()
            elif menu_choice == '3':
                self.display_user_stats()
            elif menu_choice == '4':
                self.display_who_is_online()
            elif menu_choice == '5':
                self.display_door_games()
            elif menu_choice == 'G':
                self.running = False
            else:
                print(f"{Fore.RED}Invalid option!{Style.RESET_ALL}")
                time.sleep(1)
                
    def display_user_stats(self):
        """Display user statistics"""
        self.clear_screen()
        print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
        print(f"{Fore.GREEN}║         USER STATISTICS           ║{Style.RESET_ALL}")
        print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
        
        print(f"Username: {Fore.CYAN}{self.current_user['username']}{Style.RESET_ALL}")
        print(f"Total Calls: {Fore.CYAN}{self.current_user.get('total_calls', 0)}{Style.RESET_ALL}")
        print(f"Messages Posted: {Fore.CYAN}{self.current_user.get('messages_posted', 0)}{Style.RESET_ALL}")
        print(f"Files Uploaded: {Fore.CYAN}{self.current_user.get('files_uploaded', 0)}{Style.RESET_ALL}")
        print(f"Last Call: {Fore.CYAN}{self.current_user.get('last_login', 'N/A')}{Style.RESET_ALL}")
        
        input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
        
    def display_who_is_online(self):
        """Display who's online"""
        self.clear_screen()
        print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
        print(f"{Fore.GREEN}║          WHO'S ONLINE             ║{Style.RESET_ALL}")
        print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
        
        print(f"{Fore.CYAN}{self.current_user['username']}{Style.RESET_ALL} - Main Menu")
        print(f"\n{Fore.YELLOW}Total users online: 1{Style.RESET_ALL}")
        
        input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
        
    def display_door_games(self):
        """Display available door games"""
        self.clear_screen()
        print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
        print(f"{Fore.GREEN}║           DOOR GAMES              ║{Style.RESET_ALL}")
        print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
        
        print(f"{Fore.CYAN}1.{Style.RESET_ALL} Number Guessing Game")
        print(f"{Fore.CYAN}Q.{Style.RESET_ALL} Return to Main Menu\n")
        
        choice = input(f"{Fore.CYAN}Select game: {Style.RESET_ALL}").strip().upper()
        
        if choice == '1':
            self.play_number_game()
        
    def play_number_game(self):
        """Simple number guessing game"""
        import random
        
        self.clear_screen()
        print(f"{Fore.YELLOW}=== NUMBER GUESSING GAME ==={Style.RESET_ALL}\n")
        print("I'm thinking of a number between 1 and 100!")
        
        number = random.randint(1, 100)
        attempts = 0
        
        while True:
            try:
                guess = int(input(f"\n{Fore.CYAN}Your guess: {Style.RESET_ALL}"))
                attempts += 1
                
                if guess < number:
                    print(f"{Fore.YELLOW}Too low!{Style.RESET_ALL}")
                elif guess > number:
                    print(f"{Fore.YELLOW}Too high!{Style.RESET_ALL}")
                else:
                    print(f"\n{Fore.GREEN}Congratulations! You guessed it in {attempts} attempts!{Style.RESET_ALL}")
                    break
            except ValueError:
                print(f"{Fore.RED}Please enter a valid number!{Style.RESET_ALL}")
                
        input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
        
    def run(self):
        """Start the BBS emulator"""
        try:
            self.display_welcome()
            
            if self.login():
                self.running = True
                self.main_loop()
                
            self.clear_screen()
            print(f"{Fore.CYAN}Thank you for calling Shift-Term BBS!{Style.RESET_ALL}")
            print(f"{Fore.YELLOW}Come back soon!{Style.RESET_ALL}\n")
            
        except KeyboardInterrupt:
            self.clear_screen()
            print(f"\n{Fore.RED}Connection terminated by user.{Style.RESET_ALL}\n")
            sys.exit(0)

def main():
    """Entry point for the BBS emulator"""
    bbs = BBSEmulator()
    bbs.run()

if __name__ == '__main__':
    main()
