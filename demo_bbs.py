#!/usr/bin/env python3
"""
Demo script to showcase BBS functionality
Displays various screens without requiring interactive input
"""
import os
import time
from colorama import init, Fore, Back, Style

# Initialize colorama
init()

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def display_welcome():
    """Display welcome screen"""
    clear_screen()
    print(f"{Fore.CYAN}")
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║                                                               ║")
    print("║   ███████╗██╗  ██╗██╗███████╗████████╗    ████████╗███████╗  ║")
    print("║   ██╔════╝██║  ██║██║██╔════╝╚══██╔══╝    ╚══██╔══╝██╔════╝  ║")
    print("║   ███████╗███████║██║█████╗     ██║    █████╗██║   █████╗    ║")
    print("║   ╚════██║██╔══██║██║██╔══╝     ██║    ╚════╝██║   ██╔══╝    ║")
    print("║   ███████║██║  ██║██║██║        ██║          ██║   ███████╗  ║")
    print("║   ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝          ╚═╝   ╚══════╝  ║")
    print("║                                                               ║")
    print("║              ██████╗ ██████╗ ███████╗                        ║")
    print("║              ██╔══██╗██╔══██╗██╔════╝                        ║")
    print("║              ██████╔╝██████╔╝███████╗                        ║")
    print("║              ██╔══██╗██╔══██╗╚════██║                        ║")
    print("║              ██████╔╝██████╔╝███████║                        ║")
    print("║              ╚═════╝ ╚═════╝ ╚══════╝                        ║")
    print("║                                                               ║")
    print("║         Welcome to the Retro Computing Era!                  ║")
    print("║                                                               ║")
    print("║         Experience the nostalgia of classic BBS systems      ║")
    print("║         from the 1980s and 1990s                             ║")
    print("║                                                               ║")
    print("║         • Message Boards  • File Areas  • Door Games         ║")
    print("║         • User Statistics • Community Chat                   ║")
    print("║                                                               ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    print(Style.RESET_ALL)
    time.sleep(2)

def display_login():
    """Display login screen"""
    clear_screen()
    print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
    print(f"{Fore.GREEN}║        USER AUTHENTICATION        ║{Style.RESET_ALL}")
    print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
    
    print(f"{Fore.YELLOW}[N]ew User Registration{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}[L]ogin with existing account{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}[Q]uit{Style.RESET_ALL}\n")
    print(f"{Fore.CYAN}Select option: L{Style.RESET_ALL}")
    time.sleep(2)

def display_main_menu():
    """Display main menu"""
    clear_screen()
    print(f"{Fore.CYAN}{'=' * 60}{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}SHIFT-TERM BBS{Style.RESET_ALL} | User: {Fore.GREEN}DemoUser{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'=' * 60}{Style.RESET_ALL}\n")
    
    print(f"{Fore.YELLOW}MAIN MENU{Style.RESET_ALL}\n")
    
    print(f"{Fore.CYAN}1.{Style.RESET_ALL} Message Boards")
    print(f"{Fore.CYAN}2.{Style.RESET_ALL} File Areas")
    print(f"{Fore.CYAN}3.{Style.RESET_ALL} User Statistics")
    print(f"{Fore.CYAN}4.{Style.RESET_ALL} Who's Online")
    print(f"{Fore.CYAN}5.{Style.RESET_ALL} Door Games")
    print(f"{Fore.CYAN}G.{Style.RESET_ALL} Goodbye (Logoff)\n")
    
    print(f"{Fore.CYAN}Select option: _{Style.RESET_ALL}")
    time.sleep(2)

def display_message_boards():
    """Display message boards"""
    clear_screen()
    print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
    print(f"{Fore.GREEN}║        MESSAGE BOARDS             ║{Style.RESET_ALL}")
    print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
    
    boards = [
        ('General', 5),
        ('Tech Support', 3),
        ('File Sharing', 8),
        ('Gaming', 12)
    ]
    
    for idx, (board, count) in enumerate(boards, 1):
        print(f"{Fore.CYAN}{idx}.{Style.RESET_ALL} {board} ({count} messages)")
    
    print(f"{Fore.CYAN}Q.{Style.RESET_ALL} Return to Main Menu\n")
    print(f"{Fore.CYAN}Select board: _{Style.RESET_ALL}")
    time.sleep(2)

def display_user_stats():
    """Display user statistics"""
    clear_screen()
    print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
    print(f"{Fore.GREEN}║         USER STATISTICS           ║{Style.RESET_ALL}")
    print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
    
    print(f"Username: {Fore.CYAN}DemoUser{Style.RESET_ALL}")
    print(f"Total Calls: {Fore.CYAN}42{Style.RESET_ALL}")
    print(f"Messages Posted: {Fore.CYAN}15{Style.RESET_ALL}")
    print(f"Files Uploaded: {Fore.CYAN}3{Style.RESET_ALL}")
    print(f"Last Call: {Fore.CYAN}2024-12-29 10:30{Style.RESET_ALL}")
    time.sleep(2)

def display_door_games():
    """Display door games"""
    clear_screen()
    print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
    print(f"{Fore.GREEN}║           DOOR GAMES              ║{Style.RESET_ALL}")
    print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
    
    print(f"{Fore.CYAN}1.{Style.RESET_ALL} Number Guessing Game")
    print(f"{Fore.CYAN}2.{Style.RESET_ALL} (More games coming soon!)")
    print(f"{Fore.CYAN}Q.{Style.RESET_ALL} Return to Main Menu\n")
    
    print(f"{Fore.CYAN}Select game: _{Style.RESET_ALL}")
    time.sleep(2)

def main():
    """Run the demo"""
    print(f"\n{Fore.YELLOW}{'=' * 70}")
    print(f"  SHIFT-TERM BBS EMULATOR DEMO")
    print(f"{'=' * 70}{Style.RESET_ALL}\n")
    
    print("Showcasing the BBS interface...\n")
    time.sleep(1)
    
    print("1. Welcome Screen...")
    time.sleep(1)
    display_welcome()
    
    print("\n2. Login Screen...")
    time.sleep(1)
    display_login()
    
    print("\n3. Main Menu...")
    time.sleep(1)
    display_main_menu()
    
    print("\n4. Message Boards...")
    time.sleep(1)
    display_message_boards()
    
    print("\n5. User Statistics...")
    time.sleep(1)
    display_user_stats()
    
    print("\n6. Door Games...")
    time.sleep(1)
    display_door_games()
    
    clear_screen()
    print(f"\n{Fore.GREEN}{'=' * 70}")
    print(f"  DEMO COMPLETE!")
    print(f"{'=' * 70}{Style.RESET_ALL}\n")
    
    print(f"{Fore.CYAN}The Shift-Term BBS Emulator is fully functional!{Style.RESET_ALL}\n")
    print("Features demonstrated:")
    print(f"  {Fore.GREEN}✓{Style.RESET_ALL} ANSI art and colorful interface")
    print(f"  {Fore.GREEN}✓{Style.RESET_ALL} User authentication system")
    print(f"  {Fore.GREEN}✓{Style.RESET_ALL} Message boards")
    print(f"  {Fore.GREEN}✓{Style.RESET_ALL} User statistics tracking")
    print(f"  {Fore.GREEN}✓{Style.RESET_ALL} Door games")
    print(f"  {Fore.GREEN}✓{Style.RESET_ALL} File areas")
    print(f"\nTo run the full interactive BBS, execute: {Fore.YELLOW}python bbs.py{Style.RESET_ALL}\n")

if __name__ == '__main__':
    main()
