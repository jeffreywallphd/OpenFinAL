## OpenFinAL Installation Guide

### Prerequisites

1. **Download the installer** for your operating system from the project's release page:
   - **Windows:** `OpenFinAL-Setup.exe`
   - **Linux (Debian/Ubuntu):** `openfinal_0.1.0_amd64.deb`
   - **Linux (Fedora/RHEL):** `openfinal-0.1.0.x86_64.rpm`
   - **macOS:** `OpenFinAL-darwin-x64.zip`

---

### Windows

1. Locate the downloaded `OpenFinAL-Setup.exe` file.
2. Double-click the installer to run it.
3. If Windows SmartScreen shows a warning ("Windows protected your PC"), click **More info** then **Run anyway** — this appears because the app is not code-signed.
4. The installer runs automatically — no wizard screens. It installs to your user profile and creates a **Start Menu** and **Desktop** shortcut.
5. OpenFinAL launches automatically once installation completes.
6. On first launch, follow the on-screen setup wizard to configure your API keys and preferences.

---

### Linux (Debian / Ubuntu)

1. Open a terminal and navigate to your Downloads folder:
   ```bash
   cd ~/Downloads
   ```
2. Install the `.deb` package:
   ```bash
   sudo dpkg -i openfinal_0.1.0_amd64.deb
   ```
3. If there are missing dependencies, fix them with:
   ```bash
   sudo apt-get install -f
   ```
4. Launch the app from your application menu or from the terminal:
   ```bash
   openfinal
   ```
5. On first launch, follow the on-screen setup wizard.

---

### Linux (Fedora / RHEL)

1. Open a terminal and navigate to your Downloads folder:
   ```bash
   cd ~/Downloads
   ```
2. Install the `.rpm` package:
   ```bash
   sudo rpm -i openfinal-0.1.0.x86_64.rpm
   ```
   Or with dnf:
   ```bash
   sudo dnf install ./openfinal-0.1.0.x86_64.rpm
   ```
3. Launch from the application menu or terminal:
   ```bash
   openfinal
   ```
4. On first launch, follow the on-screen setup wizard.

---

### macOS

1. Locate the downloaded `OpenFinAL-darwin-x64.zip` file.
2. Double-click to extract it. This creates the `OpenFinAL.app` bundle.
3. Drag `OpenFinAL.app` into your **Applications** folder.
4. On first open, macOS may warn the app is from an unidentified developer. Go to **System Settings > Privacy & Security**, scroll down, and click **Open Anyway**.
5. On first launch, follow the on-screen setup wizard.

---

### First Launch — What to Expect

1. **Setup wizard** — The app walks you through initial configuration (API provider selection, user settings).
2. **PIN registration** — You'll be asked to create an 8-digit PIN for local authentication.
3. **API keys** — To use stock data, news, and AI features, you'll need API keys for services like AlphaVantage, FMP, or OpenAI. The app stores these securely in your OS keychain.

After setup, you'll land on the **Dashboard** and can start exploring portfolios, stock data, news, learning modules, and more.
