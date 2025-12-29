"""ANSI art handler for BBS"""
import os

class ANSIHandler:
    """Handle ANSI art loading and display"""
    
    def __init__(self, ansi_dir='ansi'):
        self.ansi_dir = ansi_dir
        
    def load_ansi(self, filename):
        """Load ANSI art from file"""
        filepath = os.path.join(self.ansi_dir, filename)
        
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r', encoding='cp437') as f:
                    return f.read()
            except Exception as e:
                print(f"Error loading ANSI file: {e}")
                return None
        
        return None
        
    def create_ansi_dir(self):
        """Create ANSI directory if it doesn't exist"""
        if not os.path.exists(self.ansi_dir):
            os.makedirs(self.ansi_dir)
