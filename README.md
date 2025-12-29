# Shift-Term

A modern BBS (Bulletin Board System) Terminal Emulator built with Electron and xterm.js, designed to bridge the gap between vintage computing and contemporary development practices.

## 🤝 Let's Build Together!

This application is available to all coders and programmers, old and new. Whether you're a seasoned developer familiar with vintage computing or a newcomer interested in learning about BBS culture and terminal emulation, your contributions are welcome. Join us in preserving digital heritage while building modern tools!

## 🚀 Features

- **Authentic BBS Experience**: Fixed 80x25 terminal display with proper CP437 character encoding
- **ANSI Graphics Support**: Full color and character rendering for classic BBS artwork
- **Phonebook Management**: Save, edit, and organize your favorite BBS systems
- **Modern Interface**: Clean, dark-themed UI with modal dialogs and responsive design
- **Telnet Protocol**: Native telnet client with proper negotiation (NAWS, TTYPE)
- **Session Management**: Connection status tracking and optional session logging

## 📋 Requirements

- **Node.js** 18+ (LTS recommended)
- **Cross-Platform Support:**
  - **Windows** 10/11 (primary development platform)
  - **macOS** 10.14+ (compatible, limited testing)
  - **Linux** Ubuntu 18.04+ (compatible, most distributions supported)
- **npm** or **yarn** package manager

## 🛠️ Installation

### All Platforms

1. **Clone the repository:**
   ```bash
   git clone https://github.com/stacycaudle1/Shift-Term.git
   cd Shift-Term
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

### Windows Users
- Use **PowerShell**, **Command Prompt**, or **Git Bash**
- If you don't have Git, download from [git-scm.com](https://git-scm.com/)
- Node.js can be installed from [nodejs.org](https://nodejs.org/) or via `winget install OpenJS.NodeJS`

### macOS Users
- Use **Terminal**
- Install Node.js via [nodejs.org](https://nodejs.org/) or **Homebrew**: `brew install node`

### Linux Users  
- Use your distribution's terminal
- Install Node.js via package manager: `sudo apt install nodejs npm` (Ubuntu/Debian)

## 💻 Usage

### Quick Connect
1. Enter a BBS host address and port in the sidebar
2. Click **Connect** to establish a session
3. Use **Disconnect** to close the connection

### Phonebook Management
- **Add Entry**: Click **Add** to create a new BBS entry with name, host, port, and notes
- **Edit Entry**: Select a BBS from the list, then click **Edit** to modify details
- **Delete Entry**: Select a BBS and click **Delete** to remove it
- **Quick Connect**: Double-click any phonebook entry to connect instantly

### Terminal Features
- **80x25 Display**: Authentic BBS terminal dimensions
- **CP437 Encoding**: Proper character set support for vintage content
- **ANSI Colors**: Full color palette and formatting support
- **Scrollback**: Navigate through session history

## 🏗️ Architecture

### Tech Stack
- **Electron** 39.x - Desktop application framework
- **xterm.js** 6.x - Terminal emulation
- **Node.js** - Backend telnet client
- **Vanilla JavaScript** - Frontend without frameworks
- **CSS Grid/Flexbox** - Modern responsive layout

### Project Structure
```
Shift-Term/
├── src/
│   ├── main/           # Electron main process
│   │   └── main.js     # App lifecycle, telnet client, IPC handlers
│   ├── renderer/       # Frontend interface
│   │   ├── index.html  # Main UI layout
│   │   ├── app.js      # Terminal init, phonebook, event handlers
│   │   └── styles.css  # UI styling and themes
│   └── preload.js      # Secure IPC bridge
├── data/
│   └── phonebook.json  # BBS entries storage
└── package.json        # Dependencies and scripts
```

## 🤝 Contributing

This project welcomes contributions from developers of all experience levels! Whether you're a seasoned programmer familiar with vintage computing or a newcomer interested in learning about BBS culture, there's a place for your contributions.

### Areas for Contribution
- **Protocol Support**: SSH, Rlogin, raw TCP connections
- **File Transfers**: ZMODEM, XMODEM, YMODEM protocols
- **UI Enhancements**: Themes, font options, layout improvements
- **Documentation**: Tutorials, API docs, usage guides
- **Testing**: Cross-platform testing, BBS compatibility
- **Features**: Macro support, scripting, automation tools

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Development Scripts

```bash
npm start          # Launch the application
npm run dev        # Development mode with hot reload
npm run build      # Build for production
npm run dist       # Package for distribution
```

## 🐛 Known Issues

- Some extended Unicode characters may not render correctly
- Large file transfers not yet implemented
- SSH connections require future implementation

## 🎯 Roadmap

- [ ] **ZMODEM/XMODEM** file transfer protocols
- [ ] **SSH** connection support
- [ ] **Macro system** for automated commands
- [ ] **Multi-tab** session management
- [ ] **Font selection** and sizing options
- [ ] **Cross-platform** support (macOS, Linux)
- [ ] **Plugin architecture** for extensibility

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The **xterm.js** team for excellent terminal emulation
- **Electron** community for desktop app framework
- **SysOps** maintaining active BBS systems worldwide
- **Vintage computing** enthusiasts preserving digital heritage

---

## 📋 Application Details

### What Shift-Term Does

**Shift-Term** is a specialized terminal emulator designed specifically for connecting to **Bulletin Board Systems (BBSes)** - the online communities that flourished in the 1980s and 1990s before the widespread adoption of the World Wide Web. While many BBSes have disappeared, hundreds still operate today, maintained by enthusiasts and offering a nostalgic glimpse into early online culture.

### Core Functionality

**Terminal Emulation**: Provides an authentic 80-column by 25-row terminal interface that matches the specifications of classic computer terminals and early PCs. This fixed size is crucial for proper display of BBS menus, artwork, and games.

**Character Encoding**: Implements CP437 (Code Page 437) character set support, which includes the box-drawing characters, symbols, and extended ASCII characters commonly used in BBS artwork and interfaces.

**ANSI Graphics**: Full support for ANSI escape sequences that control text colors, cursor positioning, and screen formatting. This enables proper display of colorful BBS artwork, animated sequences, and user interfaces.

**Connection Management**: Built-in telnet client handles the low-level network protocols required to connect to BBS systems. Supports telnet option negotiation including window size (NAWS) and terminal type (TTYPE) announcements.

### Current Services

**Phonebook System**: Maintains a local database of BBS systems with their connection details, including host addresses, port numbers, and user notes. The Shift-Bits BBS (bbs.shift-bits.com:2003) is prominently featured as the primary test system.

**Session Management**: Tracks connection status, provides user feedback on connection attempts, and handles graceful disconnection. Optional session logging allows users to save their BBS interactions for later review.

**User Interface**: Modern desktop application interface that combines the convenience of contemporary software design with the functionality required for vintage BBS access. The interface is specifically optimized for BBS use rather than general terminal operations.

### Target Audience

- **Retrocomputing Enthusiasts**: Users interested in vintage computing and early online services
- **BBS Community Members**: Active participants in the surviving BBS community
- **Technology Historians**: Researchers studying early online communities and digital culture
- **Developers**: Contributors interested in terminal emulation, network protocols, or Electron development
- **New Users**: People curious about pre-web online services and digital archaeology

### Technical Approach

The application prioritizes **authenticity** over generality - rather than being a general-purpose terminal emulator, Shift-Term is specifically optimized for BBS connections. This includes proper handling of CP437 character encoding, fixed terminal dimensions, and telnet protocol specifics that are crucial for BBS compatibility but may not be necessary for modern shell access.

The **hybrid approach** combines modern web technologies (Electron, xterm.js) with vintage networking protocols (telnet, CP437) to create a bridge between contemporary development practices and historical computing standards. 
