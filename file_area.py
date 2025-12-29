"""File area system for BBS"""
import os
from colorama import Fore, Style

class FileArea:
    """Handle file area functionality"""
    
    def __init__(self, files_dir='files'):
        self.files_dir = files_dir
        self._ensure_files_dir()
        
    def _ensure_files_dir(self):
        """Ensure files directory exists"""
        if not os.path.exists(self.files_dir):
            os.makedirs(self.files_dir)
            
    def display_files(self):
        """Display file areas"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
        print(f"{Fore.GREEN}║          FILE AREAS               ║{Style.RESET_ALL}")
        print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
        
        print(f"{Fore.CYAN}1.{Style.RESET_ALL} Download Files")
        print(f"{Fore.CYAN}2.{Style.RESET_ALL} Upload Files")
        print(f"{Fore.CYAN}3.{Style.RESET_ALL} File Statistics")
        print(f"{Fore.CYAN}Q.{Style.RESET_ALL} Return to Main Menu\n")
        
        choice = input(f"{Fore.CYAN}Select option: {Style.RESET_ALL}").strip().upper()
        
        if choice == '1':
            self.list_files()
        elif choice == '3':
            self.show_stats()
            
    def list_files(self):
        """List available files"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
        print(f"{Fore.GREEN}║        AVAILABLE FILES            ║{Style.RESET_ALL}")
        print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
        
        files = [f for f in os.listdir(self.files_dir) if os.path.isfile(os.path.join(self.files_dir, f))]
        
        if not files:
            print(f"{Fore.YELLOW}No files available for download.{Style.RESET_ALL}")
        else:
            for idx, filename in enumerate(files, 1):
                filepath = os.path.join(self.files_dir, filename)
                size = os.path.getsize(filepath)
                print(f"{Fore.CYAN}{idx}.{Style.RESET_ALL} {filename} ({size} bytes)")
                
        input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
        
    def show_stats(self):
        """Show file statistics"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"{Fore.GREEN}╔═══════════════════════════════════╗{Style.RESET_ALL}")
        print(f"{Fore.GREEN}║       FILE STATISTICS             ║{Style.RESET_ALL}")
        print(f"{Fore.GREEN}╚═══════════════════════════════════╝{Style.RESET_ALL}\n")
        
        files = [f for f in os.listdir(self.files_dir) if os.path.isfile(os.path.join(self.files_dir, f))]
        total_size = sum(os.path.getsize(os.path.join(self.files_dir, f)) for f in files)
        
        print(f"Total Files: {Fore.CYAN}{len(files)}{Style.RESET_ALL}")
        print(f"Total Size: {Fore.CYAN}{total_size} bytes{Style.RESET_ALL}")
        
        input(f"\n{Fore.YELLOW}Press ENTER to continue...{Style.RESET_ALL}")
