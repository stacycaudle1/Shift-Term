"""Menu system for BBS"""
from colorama import Fore, Style

class MenuSystem:
    """Handle BBS menu display and navigation"""
    
    def display_main_menu(self):
        """Display the main menu"""
        print(f"{Fore.YELLOW}MAIN MENU{Style.RESET_ALL}\n")
        
        print(f"{Fore.CYAN}1.{Style.RESET_ALL} Message Boards")
        print(f"{Fore.CYAN}2.{Style.RESET_ALL} File Areas")
        print(f"{Fore.CYAN}3.{Style.RESET_ALL} User Statistics")
        print(f"{Fore.CYAN}4.{Style.RESET_ALL} Who's Online")
        print(f"{Fore.CYAN}5.{Style.RESET_ALL} Door Games")
        print(f"{Fore.CYAN}G.{Style.RESET_ALL} Goodbye (Logoff)\n")
        
        choice = input(f"{Fore.CYAN}Select option: {Style.RESET_ALL}").strip().upper()
        return choice
