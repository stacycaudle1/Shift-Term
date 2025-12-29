# Shift-Term BBS Emulator

A nostalgic BBS (Bulletin Board System) terminal emulator written in Python. Experience the retro computing era with this fully functional BBS system!

## Features

- **User Authentication**: Secure user registration and login system
- **Message Boards**: Multiple message boards for discussions
- **File Areas**: Upload and download files
- **Door Games**: Classic BBS games (Number Guessing Game included)
- **User Statistics**: Track user activity and statistics
- **ANSI Art Support**: Display colorful ANSI art graphics
- **Retro Interface**: Authentic BBS experience with ASCII menus

## Requirements

- Python 3.6+
- colorama
- pyfiglet

## Installation

1. Clone the repository:
```bash
git clone https://github.com/stacycaudle1/Shift-Term.git
cd Shift-Term
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

Run the BBS emulator:
```bash
python bbs.py
```

### First Time Setup

1. When you first run the BBS, select **[N]ew User Registration**
2. Create a username and password (minimum 6 characters)
3. You'll be logged in automatically

### Main Menu Options

- **1. Message Boards**: Read and post messages in various boards
- **2. File Areas**: Browse and manage files
- **3. User Statistics**: View your user statistics
- **4. Who's Online**: See who's currently online
- **5. Door Games**: Play classic BBS games
- **G. Goodbye**: Logoff from the BBS

## Project Structure

```
Shift-Term/
├── bbs.py              # Main BBS emulator
├── ansi_handler.py     # ANSI art handler
├── user_manager.py     # User authentication system
├── menu_system.py      # Menu display and navigation
├── message_board.py    # Message board functionality
├── file_area.py        # File area management
├── config.ini          # Configuration file
├── requirements.txt    # Python dependencies
├── ansi/              # ANSI art files
├── data/              # User data and messages
├── files/             # File storage area
└── logs/              # Log files
```

## Configuration

Edit `config.ini` to customize:
- BBS name and sysop
- Port number
- Maximum users
- Message boards
- Security settings

## Message Boards

The BBS includes several message boards:
- General
- Tech Support
- File Sharing
- Gaming

Post messages, read discussions, and interact with other users!

## Door Games

Currently includes:
- **Number Guessing Game**: Guess the number between 1 and 100

More games coming soon!

## Data Persistence

User data and messages are stored in JSON format:
- `data/users.json`: User accounts and statistics
- `data/messages.json`: Message board posts

## Security

- Passwords are hashed using SHA-256
- Maximum login attempts: 3
- Minimum password length: 6 characters

## Contributing

Contributions are welcome! Feel free to:
- Add new door games
- Improve ANSI art
- Enhance features
- Fix bugs

## License

This project is open source and available for fun and educational purposes.

## Acknowledgments

This BBS emulator is inspired by the classic bulletin board systems of the 1980s and 1990s. A tribute to the early days of online communities!

## Support

For issues or questions, please open an issue on GitHub.

---

**Welcome to Shift-Term BBS - Where the retro meets the future!** 
