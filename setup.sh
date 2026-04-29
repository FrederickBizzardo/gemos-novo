#!/bin/bash
# gemOS - Ultra-Lightweight Virtual Linux (Debian 12 Base)
# Repository: https://github.com/FrederickBizzardo/gemos-novo
# Optimized for Termux / Android / QEMU-TCG

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Animated ASCII Gem Logo
function animate_gem() {
    clear
    local frames=(
        "      .      \n     / \     \n    /   \    \n   <  *  >   \n    \   /    \n     \ /     \n      '      "
        "      .      \n     /|     \n    / |    \n   |  *  |   \n    \ |    \n     \|     \n      '      "
        "      .      \n      | \    \n      |  \   \n   |  *  |   \n      |  /   \n      | /    \n      '      "
        "      .      \n     \ /     \n    \   /    \n   <  *  >   \n    /   \    \n     / \     \n      '      "
    )
    echo -e "${CYAN}Initializing gemOS Lattice...${NC}"
    for i in {1..3}; do
        for frame in "${frames[@]}"; do
            echo -e "${CYAN}${frame}${NC}"
            sleep 0.1
            clear
        done
    done
}

function show_banner() {
    echo -e "${BLUE}"
    cat << "EOF"
   ____                      ___  ____ 
  / ___| ___ _ __ ___   ___ / _ \/ ___|
 | |  _ / _ \ '_ ` _ \ / _ \ | | \___ \
 | |_| |  __/ | | | | | (_) | |_| |___) |
  \____|\___|_| |_| |_|\___/ \___/|____/ 
   VIRTUAL DEBIAN CORE | REPO: gemos-novo
EOF
    echo -e "${NC}"
}

# --- MANAGEMENT CLI ---
if [[ "$1" == "fix" ]]; then
    echo -e "${YELLOW}[!] Checking virtual disk integrity...${NC}"
    qemu-img check $HOME/gemOS/gemos_disk.qcow2
    exit 0
elif [[ "$1" == "uninstall" ]]; then
    echo -e "${RED}[!] WARNING: This will delete all data inside gemOS.${NC}"
    read -p "Type 'DELETE' to confirm: " confirm
    if [[ $confirm == "DELETE" ]]; then
        rm -rf $HOME/gemOS $PREFIX/bin/gemos
        echo -e "${GREEN}[-] System purged.${NC}"
    else
        echo "Aborted."
    fi
    exit 0
elif [[ "$1" == "exit" ]]; then
    echo "Exiting gemOS management..."
    exit 0
fi

# --- INSTALLATION LOGIC ---
if [ ! -d "$HOME/gemOS" ]; then
    animate_gem
    show_banner
    echo -e "[*] Provisioning gemOS (Debian 12 Base)..."
    
    # 1. Environment Check
    echo -e "[*] Installing QEMU and Utilities..."
    pkg update && pkg upgrade -y
    pkg install qemu-system-aarch64-headless qemu-system-x86-64-headless qemu-utils wget curl git -y

    # 2. Filesystem Initialization
    mkdir -p $HOME/gemOS
    cd $HOME/gemOS

    # 3. Architecture Logic (Ultra-Lightweight Debian Profiles)
    ARCH=$(uname -m)
    if [[ "$ARCH" == "aarch64" ]]; then
        echo -e "[*] Detected ARM64 Hardware..."
        # Minimal ARM64 Debian Image (~120MB)
        URL="https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-nocloud-arm64.qcow2"
        QEMU_BIN="qemu-system-aarch64"
        EXTRA="-cpu max -machine virt"
    else
        echo -e "[*] Detected x86_64 Hardware..."
        # Minimal x86_64 Debian Image (~130MB)
        URL="https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-nocloud-amd64.qcow2"
        QEMU_BIN="qemu-system-x86_64"
        EXTRA="-cpu qemu64"
    fi

    # 4. Image Deployment (Under 200MB compressed footprint)
    if [ ! -f "gemos_disk.qcow2" ]; then
        echo -e "[*] Fetching Minimal Debian-Core Image..."
        wget -O gemos_disk.qcow2 "$URL"
        echo -e "[*] Setting sparse expansion limits..."
        # We resize internally to allow for growth WITHOUT taking up physical space on Android
        qemu-img resize gemos_disk.qcow2 +4G
    fi

    # 5. Bootloader Generation
    cat << EOF > start_gemos.sh
#!/bin/bash
clear
echo -e "${CYAN}gemOS Virtual Kernel Booting...${NC}"
$QEMU_BIN \\
  -m 1G -smp 4 \\
  $EXTRA \\
  -drive file=\$HOME/gemOS/gemos_disk.qcow2,if=virtio \\
  -net nic,model=virtio -net user,hostfwd=tcp::2222-:22 \\
  -nographic -append "console=ttyS0 root=/dev/vda1 rw"
EOF
    chmod +x start_gemos.sh

    # 6. Global Command Hook
    cat << 'EOF' > $PREFIX/bin/gemos
#!/bin/bash
if [ "$1" == "fix" ]; then bash $HOME/gemOS/setup.sh fix
elif [ "$1" == "uninstall" ]; then bash $HOME/gemOS/setup.sh uninstall
elif [ "$1" == "help" ]; then 
    echo "gemOS CLI Commands:"
    echo "  gemos           - Start the virtual OS"
    echo "  gemos fix       - Repair disk image"
    echo "  gemos uninstall - Remove gemOS"
else bash $HOME/gemOS/start_gemos.sh; fi
EOF
    chmod +x $PREFIX/bin/gemos
    
    # Save the setup script for future management calls
    cp $0 $HOME/gemOS/setup.sh
    chmod +x $HOME/gemOS/setup.sh

    echo -e "${GREEN}[+] gemOS (FrederickBizzardo/gemos-novo) is ready.${NC}"
    echo -e "Type 'gemos' to start."
    exit 0
fi

# --- BOOT TRIGGER ---
animate_gem
show_banner
bash $HOME/gemOS/start_gemos.sh

