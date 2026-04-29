#!/bin/bash
# gemOS - Ultra-Lightweight Virtual Linux (Debian 12 Base)
# Optimized for Termux / Android / QEMU-TCG
# Repository: https://github.com/FrederickBizzardo/gemos-novo

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

GEMOS_DIR="$HOME/gemOS"
DISK_IMG="$GEMOS_DIR/gemos_disk.qcow2"

function animate_gem() {
    clear
    local frames=(
        "      .      \n     / \     \n    /   \    \n   <  ·  >   \n    \   /    \n     \ /     \n      '      "
        "      .      \n     /|     \n    / |    \n   |  ·  |   \n    \ |    \n     \|     \n      '      "
    )
    for i in {1..3}; do
        for frame in "${frames[@]}"; do
            echo -e "${CYAN}${frame}${NC}"
            sleep 0.2
            clear
        done
    done
}

function show_banner() {
    echo -e "${BLUE}"
    cat << "EOF"
   ____                  ___  ____ 
  / ___| ___ _ __ ___   / _ \/ ___|
 | |  _ / _ \ '_ ` _ \  | | \___ \
 | |_| |  __/ | | | | | | |_| |___)|
  \____|\___|_| |_| |_| \___/|____/ 
      DEBIAN CORE | ROOTLESS KERNEL
EOF
    echo -e "${NC}"
}

function download_with_fallback() {
    local target=$1
    shift
    local urls=("$@")
    
    for url in "${urls[@]}"; do
        echo -e "[*] Attempting download from: ${url}"
        # Use -c to resume and --timeout to avoid hanging
        if wget -c -q --show-progress --timeout=15 -O "$target" "$url"; then
            echo -e "${GREEN}[+] Download successful.${NC}"
            return 0
        else
            echo -e "${RED}[!] Mirror failed or timed out. Trying fallback...${NC}"
            rm -f "$target"
        fi
    done
    return 1
}

function install_gemos() {
    echo -e "[*] Preparing environment..."
    pkg update && pkg upgrade -y
    pkg install qemu-utils wget curl git qemu-system-aarch64-headless qemu-system-x86-64-headless -y
    
    mkdir -p "$GEMOS_DIR"
    cd "$GEMOS_DIR"

    ARCH=$(uname -m)
    local urls=()
    if [[ "$ARCH" == "aarch64" ]]; then
        # Minimal Nocloud ARM64 (~180MB - 240MB)
        urls=(
            "https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-nocloud-arm64.qcow2"
            "https://cloud.debian.org/images/cloud/bookworm/daily/latest/debian-12-nocloud-arm64-daily.qcow2"
        )
    else
        # Minimal Nocloud x86_64 (~190MB - 260MB)
        urls=(
            "https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-nocloud-amd64.qcow2"
            "https://cloud.debian.org/images/cloud/bookworm/daily/latest/debian-12-nocloud-amd64-daily.qcow2"
        )
    fi

    echo -e "[*] Fetching Optimized Debian-Core (Target: <300MB)..."
    if ! download_with_fallback "$DISK_IMG" "${urls[@]}"; then
        echo -e "${RED}[!!] Could not reach mirrors. Check internet connection.${NC}"
        return 1
    fi
    echo -e "[*] Applying sparse expansion (+10GB)..."
    qemu-img resize "$DISK_IMG" +10G

    # 5. Tailoring / Customization
    echo -e "${BLUE}[?] Enter a custom hostname for gemOS (Enter to skip):${NC} "
    read -r ghostname
    ghostname=${ghostname:-gemOS-Kernel}
    
    # Create the boot command wrapper
    echo -e "[*] Configuring Bootloader..."
    # Dynamically find an open port to avoid 'Could not set up host forwarding rule' errors
    RAND_PORT=$((RANDOM % 1000 + 2222))
    cat << EOF > "$GEMOS_DIR/boot.sh"
#!/bin/bash
ARCH=\$(uname -m)
PORT=$RAND_PORT
EFI_AARCH64="/data/data/com.termux/files/usr/share/qemu/edk2-aarch64-code.fd"

echo -e "${CYAN}[*] gemOS Lattice booting ($ghostname)...${NC}"
echo -e "${BLUE}[!] Booting on port \$PORT. Emulator: QEMU TCG.${NC}"
echo -e "${YELLOW}[i] If boot hangs, press Ctrl+A then X to exit.${NC}"

if [[ "\$ARCH" == "aarch64" ]]; then
    BIOS_ARG=""
    if [ -f "\$EFI_AARCH64" ]; then BIOS_ARG="-bios \$EFI_AARCH64"; fi
    
    qemu-system-aarch64 -m 1G -smp 2 -machine virt -cpu max \
        \$BIOS_ARG \
        -drive file=$DISK_IMG,if=virtio,format=qcow2 \
        -net nic,model=virtio -net user,hostfwd=tcp:127.0.0.1:\$PORT-:22 \
        -nographic -serial mon:stdio
else
    qemu-system-x86_64 -m 1G -smp 2 -cpu qemu64 \
        -drive file=$DISK_IMG,if=virtio,format=qcow2 \
        -net nic,model=virtio -net user,hostfwd=tcp:127.0.0.1:\$PORT-:22 \
        -nographic -serial mon:stdio
fi
EOF
    chmod +x "$GEMOS_DIR/boot.sh"

    # Link to global bin
    cat << EOF > $PREFIX/bin/gemos
#!/bin/bash
bash $GEMOS_DIR/setup.sh \$@
EOF
    chmod +x $PREFIX/bin/gemos

    # Back up script - Using realpath for persistence
    ORIGINAL_SCRIPT=$(realpath "$0" 2>/dev/null || echo "$0")
    if [ -f "$ORIGINAL_SCRIPT" ]; then
        cp "$ORIGINAL_SCRIPT" "$GEMOS_DIR/setup.sh"
    else
        wget -q -O "$GEMOS_DIR/setup.sh" "https://raw.githubusercontent.com/FrederickBizzardo/gemos-novo/main/setup.sh"
    fi
    chmod +x "$GEMOS_DIR/setup.sh"
    
    echo -e "${GREEN}[+] gemOS Installation Complete.${NC}"
}

function uninstall_gemos() {
    echo -e "${RED}[!] DANGER: This will delete ALL data and images.${NC}"
    read -p "Type 'PURGE' to confirm: " confirm
    if [[ "$confirm" == "PURGE" ]]; then
        echo -e "[*] Purging $GEMOS_DIR..."
        rm -rf "$GEMOS_DIR"
        echo -e "[*] Removing global bin..."
        rm -f "$PREFIX/bin/gemos"
        echo -e "${GREEN}[-] gemOS has been completely wiped.${NC}"
    else
        echo "Operation cancelled."
    fi
}

function fix_gemos() {
    echo -e "${YELLOW}[*] Repairing virtual drive...${NC}"
    qemu-img check "$DISK_IMG"
    echo -e "${GREEN}[+] Done.${NC}"
}

# --- Main Logic ---
if [ ! -f "$DISK_IMG" ]; then
    show_banner
    echo -e "gemOS is not installed."
    echo -e "1) ${GREEN}Install gemOS${NC}"
    echo -e "2) Exit"
    read -p "Selection: " choice
    case $choice in
        1) install_gemos ;;
        *) exit 0 ;;
    esac
else
    animate_gem
    show_banner
    echo -e "System Status: ${GREEN}READY${NC}"
    echo -e "---------------------------"
    echo -e "1) ${CYAN}Boot gemOS${NC}"
    echo -e "2) ${YELLOW}Fix / Repair System${NC}"
    echo -e "3) ${RED}Full Uninstall${NC}"
    echo -e "4) Exit"
    echo -e "---------------------------"
    read -p "Selection: " choice
    case $choice in
        1) bash "$GEMOS_DIR/boot.sh" ;;
        2) fix_gemos ;;
        3) uninstall_gemos ;;
        4) exit 0 ;;
        *) bash "$GEMOS_DIR/boot.sh" ;;
    esac
fi


