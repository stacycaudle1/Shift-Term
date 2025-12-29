<div align="center">

```
███████╗██╗  ██╗██╗███████╗████████╗      ████████╗███████╗██████╗ ███╗   ███╗
██╔════╝██║  ██║██║██╔════╝╚══██╔══╝      ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
███████╗███████║██║█████╗     ██║   █████╗   ██║   █████╗  ██████╔╝██╔████╔██║
╚════██║██╔══██║██║██╔══╝     ██║   ╚════╝   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
███████║██║  ██║██║██║        ██║            ██║   ███████╗██║  ██║██║ ╚═╝ ██║
╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝            ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
```

### 🚀 A Modern BBS Terminal Emulator

**Bridge the gap between vintage computing and contemporary development**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/stacycaudle1/Shift-Term)
[![Electron](https://img.shields.io/badge/Electron-39.x-47848F.svg?logo=electron)](https://www.electronjs.org/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933.svg?logo=node.js)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/stacycaudle1/Shift-Term/pulls)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing) • [Documentation](#-application-details)

</div>

---

## 📖 Table of Contents

- [Why Shift-Term?](#-why-shift-term)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
- [Architecture](#️-architecture)
- [Contributing](#-contributing)
- [Development](#-development-scripts)
- [Roadmap](#-roadmap)
- [Application Details](#-application-details)

---

## 💡 Why Shift-Term?

<div align="center">

| 🎯 **Purpose-Built** | 🎨 **Authentic Experience** | 🔧 **Modern Stack** |
|:---:|:---:|:---:|
| Specifically designed for BBS connections, not just another terminal | Fixed 80×25 display with CP437 encoding for accurate rendering | Built with Electron & xterm.js for cross-platform compatibility |

</div>

**Shift-Term** brings the nostalgia of Bulletin Board Systems into the modern era. Whether you're a seasoned SysOp, a retrocomputing enthusiast, or a curious newcomer interested in digital archaeology, this terminal emulator is your gateway to hundreds of active BBS systems still running worldwide.

### 🤝 Let's Build Together!

This application is available to all coders and programmers, old and new. Whether you're a seasoned developer familiar with vintage computing or a newcomer interested in learning about BBS culture and terminal emulation, your contributions are welcome. Join us in preserving digital heritage while building modern tools!

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🎨 Authentic BBS Experience
- Fixed **80×25** terminal display
- Proper **CP437** character encoding
- Full **ANSI graphics** support
- Classic BBS artwork rendering

</td>
<td width="50%">

### 🔌 Modern Connectivity
- Native **telnet** protocol
- Proper negotiation (NAWS, TTYPE)
- Connection status tracking
- Optional session logging

</td>
</tr>
<tr>
<td width="50%">

### 📇 Phonebook Management
- Save & organize BBS systems
- Edit entries with ease
- Quick connect via double-click
- Notes for each BBS

</td>
<td width="50%">

### 🎯 User Interface
- Clean, **dark-themed** design
- Modal dialogs for management
- Responsive layout
- Intuitive controls

</td>
</tr>
</table>

---

## ⚡ Quick Start

Get up and running in under 60 seconds:

```bash
# Clone the repository
git clone https://github.com/stacycaudle1/Shift-Term.git

# Navigate to the directory
cd Shift-Term

# Install dependencies
npm install

# Launch the application
npm start
```

That's it! The application will start, and you can begin connecting to BBS systems immediately.

## 📋 Requirements

<div align="center">

| Component | Version | Notes |
|:---------:|:-------:|:------|
| **Node.js** | 18+ (LTS) | [Download](https://nodejs.org/) |
| **npm/yarn** | Latest | Package manager |
| **OS** | Win 10+, macOS 10.14+, Linux | Cross-platform support |

</div>

### Platform-Specific Details

<details>
<summary><b>🪟 Windows 10/11</b> (Primary development platform)</summary>

- Use **PowerShell**, **Command Prompt**, or **Git Bash**
- Install Git from [git-scm.com](https://git-scm.com/)
- Install Node.js from [nodejs.org](https://nodejs.org/) or via:
  ```powershell
  winget install OpenJS.NodeJS
  ```
</details>

<details>
<summary><b>🍎 macOS 10.14+</b> (Compatible, limited testing)</summary>

- Use **Terminal**
- Install Node.js via [nodejs.org](https://nodejs.org/) or **Homebrew**:
  ```bash
  brew install node
  ```
</details>

<details>
<summary><b>🐧 Linux</b> (Ubuntu 18.04+, most distributions supported)</summary>

- Use your distribution's terminal
- Install via package manager (Ubuntu/Debian):
  ```bash
  sudo apt install nodejs npm
  ```
</details>

## 🛠️ Installation

### All Platforms

<details open>
<summary><b>Standard Installation</b></summary>

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
</details>

### Platform-Specific Notes

**Windows Users**
- Use **PowerShell**, **Command Prompt**, or **Git Bash**
- If you don't have Git, download from [git-scm.com](https://git-scm.com/)
- Node.js can be installed from [nodejs.org](https://nodejs.org/) or via `winget install OpenJS.NodeJS`

**macOS Users**
- Use **Terminal**
- Install Node.js via [nodejs.org](https://nodejs.org/) or **Homebrew**: `brew install node`

**Linux Users**  
- Use your distribution's terminal
- Install Node.js via package manager: `sudo apt install nodejs npm` (Ubuntu/Debian)

## 💻 Usage

### 🔌 Quick Connect

<table>
<tr>
<td width="50%">

**Basic Connection**
1. Enter BBS host address
2. Enter port number
3. Click **Connect**
4. Use **Disconnect** to close

</td>
<td width="50%">

**Pro Tips**
- Save frequently used BBS in phonebook
- Double-click entries for instant connect
- Use the scrollback feature to review history
- Session logging available in settings

</td>
</tr>
</table>

### 📇 Phonebook Management

```
┌─────────────────────────────────────────┐
│  Action          │  How To              │
├─────────────────────────────────────────┤
│  Add Entry       │  Click "Add" button  │
│  Edit Entry      │  Select & click Edit │
│  Delete Entry    │  Select & click Del  │
│  Quick Connect   │  Double-click entry  │
└─────────────────────────────────────────┘
```

**Entry Fields:**
- 📝 **Name**: Friendly identifier for the BBS
- 🌐 **Host**: Domain or IP address
- 🔢 **Port**: Connection port (usually 23 or custom)
- 📄 **Notes**: Personal notes and reminders

### 🖥️ Terminal Features

| Feature | Description |
|---------|-------------|
| **80×25 Display** | Authentic BBS terminal dimensions |
| **CP437 Encoding** | Proper character set for vintage content |
| **ANSI Colors** | Full color palette and formatting |
| **Scrollback** | Navigate through session history |
| **Auto-wrap** | Automatic text wrapping |

## 🏗️ Architecture

<div align="center">

### Tech Stack

[![Electron](https://img.shields.io/badge/Electron-39.x-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![xterm.js](https://img.shields.io/badge/xterm.js-6.x-000000?logo=gnome-terminal&logoColor=white)](https://xtermjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

### 🧩 Components

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Electron 39.x | Desktop application framework |
| **Terminal** | xterm.js 6.x | Terminal emulation engine |
| **Backend** | Node.js | Telnet client & IPC handling |
| **Frontend** | Vanilla JavaScript | UI without framework overhead |
| **Styling** | CSS Grid/Flexbox | Modern responsive layout |

### 📁 Project Structure

```
Shift-Term/
├── 📂 src/
│   ├── 📂 main/              # Electron main process
│   │   └── 📄 main.js        # App lifecycle, telnet client, IPC handlers
│   ├── 📂 renderer/          # Frontend interface
│   │   ├── 📄 index.html     # Main UI layout
│   │   ├── 📄 app.js         # Terminal init, phonebook, event handlers
│   │   └── 📄 styles.css     # UI styling and themes
│   └── 📄 preload.js         # Secure IPC bridge (context isolation)
├── 📂 data/
│   └── 📄 phonebook.json     # BBS entries storage (local)
├── 📂 assets/                # Application resources
└── 📄 package.json           # Dependencies and scripts
```

### 🔄 Data Flow

```
┌─────────────┐      IPC       ┌──────────────┐     Telnet     ┌─────────┐
│  Renderer   │ ◄──────────────► │ Main Process │ ◄─────────────► │   BBS   │
│  (UI)       │   (Secure)     │  (Backend)   │  (Network)    │ Server  │
└─────────────┘                └──────────────┘                └─────────┘
      │                               │
      ▼                               ▼
  xterm.js                       Telnet Client
  Terminal                       (net module)
```

## 🤝 Contributing

<div align="center">

**This project welcomes contributions from developers of all experience levels!**

Whether you're a seasoned programmer familiar with vintage computing or a newcomer interested in learning about BBS culture, there's a place for your contributions.

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/stacycaudle1/Shift-Term/pulls)
[![Contributors](https://img.shields.io/github/contributors/stacycaudle1/Shift-Term?style=for-the-badge)](https://github.com/stacycaudle1/Shift-Term/graphs/contributors)

</div>

### 🎯 Areas for Contribution

<table>
<tr>
<td width="33%">

**🔌 Protocols**
- SSH support
- Rlogin
- Raw TCP
- Serial connections

</td>
<td width="33%">

**📡 File Transfers**
- ZMODEM
- XMODEM
- YMODEM
- Kermit

</td>
<td width="33%">

**🎨 UI/UX**
- Custom themes
- Font selection
- Layout options
- Accessibility

</td>
</tr>
<tr>
<td width="33%">

**📚 Documentation**
- Tutorials
- API docs
- Usage guides
- Video demos

</td>
<td width="33%">

**🧪 Testing**
- Unit tests
- Cross-platform
- BBS compatibility
- Performance

</td>
<td width="33%">

**✨ Features**
- Macro support
- Scripting
- Automation
- Multi-tab

</td>
</tr>
</table>

### 🚀 Getting Started

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/Shift-Term.git

# 3. Create a feature branch
git checkout -b feature/amazing-feature

# 4. Make your changes and test thoroughly

# 5. Commit your changes
git commit -m 'Add amazing feature'

# 6. Push to your fork
git push origin feature/amazing-feature

# 7. Open a Pull Request
```

### 📝 Contribution Guidelines

- ✅ **Test thoroughly** across platforms when possible
- ✅ **Follow existing** code style and conventions
- ✅ **Document** new features in README
- ✅ **Keep changes** focused and atomic
- ✅ **Write clear** commit messages

## 📝 Development Scripts

<table>
<tr>
<td width="50%">

### 🏃 Running

```bash
# Launch application
npm start

# Development mode with hot reload
npm run dev
```

</td>
<td width="50%">

### 📦 Building

```bash
# Build for production
npm run build

# Package for distribution
npm run dist
```

</td>
</tr>
</table>

---

## 🐛 Known Issues

<details>
<summary>Click to view current limitations</summary>

- Some extended Unicode characters may not render correctly
- Large file transfers not yet implemented
- SSH connections require future implementation
- Multi-tab support is planned but not yet available

**Note:** These are known limitations and are on the roadmap for future releases.

</details>

## 🎯 Roadmap

<div align="center">

### 🔮 Future Enhancements

</div>

<table>
<tr>
<td width="50%">

### 🚀 Phase 1: Core Features
- [ ] **ZMODEM/XMODEM** file transfer protocols
- [ ] **SSH** connection support  
- [ ] **Macro system** for automated commands
- [ ] **Font selection** and sizing options

</td>
<td width="50%">

### 🌟 Phase 2: Advanced Features
- [ ] **Multi-tab** session management
- [ ] **Cross-platform** testing & optimization
- [ ] **Plugin architecture** for extensibility
- [ ] **Scripting engine** for automation

</td>
</tr>
</table>

<div align="center">

### 💭 Have an idea? [Open an issue](https://github.com/stacycaudle1/Shift-Term/issues) or contribute!

</div>

---

## 📜 License

<div align="center">

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 🙏 Acknowledgments

<table>
<tr>
<td align="center" width="25%">
<h3>🖥️</h3>
<b>xterm.js Team</b><br>
Excellent terminal emulation
</td>
<td align="center" width="25%">
<h3>⚡</h3>
<b>Electron Community</b><br>
Desktop app framework
</td>
<td align="center" width="25%">
<h3>📡</h3>
<b>SysOps Worldwide</b><br>
Maintaining active BBS systems
</td>
<td align="center" width="25%">
<h3>🎮</h3>
<b>Retrocomputing Enthusiasts</b><br>
Preserving digital heritage
</td>
</tr>
</table>

<div align="center">

### ⭐ If you find this project useful, please consider giving it a star!

[![GitHub stars](https://img.shields.io/github/stars/stacycaudle1/Shift-Term?style=social)](https://github.com/stacycaudle1/Shift-Term/stargazers)

</div>

---

<div align="center">

## 📋 Application Details

</div>

### 🎯 What Shift-Term Does

**Shift-Term** is a specialized terminal emulator designed specifically for connecting to **Bulletin Board Systems (BBSes)** - the online communities that flourished in the 1980s and 1990s before the widespread adoption of the World Wide Web. 

<div align="center">

```
┌────────────────────────────────────────────────────────────┐
│  1980s-1990s BBS Era  →  Modern Terminal  →  Active BBSes  │
│     (Historical)          (Shift-Term)        (Today!)      │
└────────────────────────────────────────────────────────────┘
```

</div>

While many BBSes have disappeared, **hundreds still operate today**, maintained by enthusiasts and offering a nostalgic glimpse into early online culture.

### 🔧 Core Functionality

<table>
<tr>
<td width="50%">

**🖥️ Terminal Emulation**

Provides an authentic **80×25** terminal interface matching classic computer terminals and early PCs. This fixed size is crucial for proper display of BBS menus, artwork, and games.

**🎨 Character Encoding**

Implements **CP437** (Code Page 437) character set support, including box-drawing characters, symbols, and extended ASCII commonly used in BBS artwork.

</td>
<td width="50%">

**🌈 ANSI Graphics**

Full support for ANSI escape sequences controlling text colors, cursor positioning, and screen formatting. Enables proper display of colorful BBS artwork and interfaces.

**🔌 Connection Management**

Built-in telnet client handling low-level network protocols. Supports telnet option negotiation including window size (NAWS) and terminal type (TTYPE).

</td>
</tr>
</table>

### 🎪 Current Services

<details open>
<summary><b>📇 Phonebook System</b></summary>

Maintains a local database of BBS systems with connection details, including host addresses, port numbers, and user notes. The **Shift-Bits BBS** (bbs.shift-bits.com:2003) is prominently featured as the primary test system.

</details>

<details open>
<summary><b>📊 Session Management</b></summary>

Tracks connection status, provides user feedback on connection attempts, and handles graceful disconnection. Optional session logging allows users to save their BBS interactions for later review.

</details>

<details open>
<summary><b>🎨 User Interface</b></summary>

Modern desktop application interface combining contemporary software design convenience with functionality required for vintage BBS access. The interface is specifically optimized for BBS use rather than general terminal operations.

</details>

### 👥 Target Audience

<div align="center">

| 🎮 Retrocomputing | 📡 BBS Community | 📚 Historians | 💻 Developers | 🌟 New Users |
|:-----------------:|:----------------:|:-------------:|:-------------:|:------------:|
| Vintage computing enthusiasts | Active BBS participants | Technology researchers | Terminal emulation contributors | Curious newcomers |

</div>

### 🎓 Technical Approach

The application prioritizes **authenticity over generality** - rather than being a general-purpose terminal emulator, Shift-Term is specifically optimized for BBS connections. This includes proper handling of CP437 character encoding, fixed terminal dimensions, and telnet protocol specifics that are crucial for BBS compatibility.

The **hybrid approach** combines modern web technologies (Electron, xterm.js) with vintage networking protocols (telnet, CP437) to create a bridge between contemporary development practices and historical computing standards.

---

<div align="center">

### 💖 Made with passion for preserving digital heritage

**[⬆ Back to Top](#shift-term)**

[![GitHub](https://img.shields.io/badge/GitHub-stacycaudle1%2FShift--Term-blue?logo=github)](https://github.com/stacycaudle1/Shift-Term)
[![Issues](https://img.shields.io/github/issues/stacycaudle1/Shift-Term)](https://github.com/stacycaudle1/Shift-Term/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/stacycaudle1/Shift-Term)](https://github.com/stacycaudle1/Shift-Term/pulls)

</div> 
