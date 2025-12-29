# Quick Start Guide

## Running the BBS Emulator

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the BBS

```bash
python bbs.py
```

### Demo Mode

To see a non-interactive demo of the BBS features:
```bash
python demo_bbs.py
```

### Running Tests

To verify all components work correctly:
```bash
python test_bbs.py
```

## First Time Usage

1. Start the BBS: `python bbs.py`
2. Select **[N]** for New User Registration
3. Enter a username (e.g., "testuser")
4. Enter a password (minimum 6 characters)
5. Confirm your password
6. You'll be automatically logged in

## Main Features

### 1. Message Boards
- View multiple message boards (General, Tech Support, File Sharing, Gaming)
- Read existing messages
- Post new messages
- Each message includes subject, author, date, and content

### 2. File Areas
- Browse available files
- View file statistics
- Upload capability (interface ready)

### 3. User Statistics
- View your total calls
- Track messages posted
- See files uploaded
- Check last login time

### 4. Who's Online
- See currently connected users
- View what they're doing

### 5. Door Games
- Number Guessing Game (fully functional)
- More games coming soon!

## Tips

- Press **Ctrl+C** at any time to exit
- Choose **G** from the main menu to logoff properly
- Data is automatically saved to JSON files in the `data/` directory
- User passwords are securely hashed using SHA-256

## File Structure

```
Shift-Term/
├── bbs.py              # Main BBS emulator (run this!)
├── test_bbs.py         # Automated tests
├── demo_bbs.py         # Non-interactive demo
├── user_manager.py     # User authentication
├── message_board.py    # Message board system
├── file_area.py        # File management
├── menu_system.py      # Menu display
├── ansi_handler.py     # ANSI art support
├── config.ini          # Configuration
├── requirements.txt    # Dependencies
├── ansi/               # ANSI art files
├── data/               # User data and messages (auto-created)
├── files/              # File storage
└── logs/               # Log files
```

## Configuration

Edit `config.ini` to customize:
- BBS name
- System operator name
- Port number
- Maximum users
- Message board names
- Security settings

## Troubleshooting

### Colors not displaying correctly?
Make sure you have `colorama` installed:
```bash
pip install colorama
```

### Permission errors?
Ensure the `data/`, `files/`, and `logs/` directories are writable.

### Login issues?
- Check that your password is at least 6 characters
- Remember: usernames and passwords are case-sensitive

## Development

Want to add more features?
- Add new door games in `bbs.py` (see `play_number_game()` example)
- Create custom ANSI art in the `ansi/` directory
- Modify message boards in `message_board.py`
- Adjust security settings in `config.ini`

## Have Fun!

Enjoy the nostalgic experience of classic BBS systems! 🎉
