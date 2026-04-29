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
        if wget -q --show-progress -O "$target" "$url"; then
            echo -e "${GREEN}[+] Download successful.${NC}"
            return 0
        else
            echo -e "${RED}[!] Download failed. Trying next mirror...${NC}"
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
        urls=(
            "https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-nocloud-arm64.qcow2"
            "https://cloud.debian.org/images/cloud/bookworm/20231013-1533/debian-12-nocloud-arm64.qcow2"
        )
    else
        urls=(
            "https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-nocloud-amd64.qcow2"
            "https://cloud.debian.org/images/cloud/bookworm/20231013-1533/debian-12-nocloud-amd64.qcow2"
        )
    fi

    echo -e "[*] Fetching Minimal Debian-Core (200MB - 350MB)..."
    if ! download_with_fallback "$DISK_IMG" "${urls[@]}"; then
        echo -e "${RED}[!!] All download mirrors failed. Please check your internet connection.${NC}"
        return 1
    fi
    
    # Create the boot command wrapper
    echo -e "[*] Configuring Bootloader..."
    cat << EOF > "$GEMOS_DIR/boot.sh"
#!/bin/bash
ARCH=\$(uname -m)
if [[ "\$ARCH" == "aarch64" ]]; then
    qemu-system-aarch64 -m 10G -smp 2 -machine virt -cpu max \\
        -drive file=$DISK_IMG,if=virtio,format=qcow2 \\
        -net nic,model=virtio -net user,hostfwd=tcp::2222-:22 \\
        -nographic
else
    qemu-system-x86_64 -m 10G -smp 2 -cpu qemu64 \\
        -drive file=$DISK_IMG,if=virtio,format=qcow2 \\
        -net nic,model=virtio -net user,hostfwd=tcp::2222-:22 \\
        -nographic
fi
EOF
    chmod +x "$GEMOS_DIR/boot.sh"

    # Link to global bin
    cat << EOF > $PREFIX/bin/gemos
#!/bin/bash
bash $GEMOS_DIR/setup.sh
EOF
    chmod +x $PREFIX/bin/gemos

    # Back up script - handling different invocation methods
    if [ -f "$0" ]; then
        cp "$0" "$GEMOS_DIR/setup.sh"
    else
        echo -e "[*] Redownloading setup.sh for persistence..."
        wget -q -O "$GEMOS_DIR/setup.sh" "https://raw.githubusercontent.com/FrederickBizzardo/gemos-novo/main/setup.sh"
    fi
    chmod +x "$GEMOS_DIR/setup.sh"
    
    echo -e "${GREEN}[+] gemOS Installation Complete.${NC}"
}

function uninstall_gemos() {
    echo -e "${RED}[!] This will destroy the virtual drive.${NC}"
    read -p "Confirm (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        rm -rf "$GEMOS_DIR" "$PREFIX/bin/gemos"
        echo -e "${RED}[-] gemOS Purged.${NC}"
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


