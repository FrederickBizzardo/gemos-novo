/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Copy, Terminal as TerminalIcon, ShieldCheck, Power, RefreshCcw, Trash2 } from 'lucide-react';

const SCRIPT_DATA = [
  {
    title: "Boot gemOS (QEMU)",
    id: "boot",
    icon: Power,
    color: "text-green-400",
    desc: "Initializes the virtualized Linux kernel via QEMU with KVM-TCG bridging.",
    code: `#!/bin/bash
# gemOS Ultra-Lightweight Bootloader
echo "[*] Spinning up gemOS Virtual Kernel..."
qemu-system-x86_64 \\
  -m 512M \\
  -smp 2 \\
  -kernel ./gemos-vmlinuz \\
  -append "root=/dev/sda1 console=ttyS0" \\
  -nographic \\
  -drive file=gemos_root.img,format=raw \\
  -net user,hostfwd=tcp::2222-:22 -net echo
`
  },
  {
    title: "Install Environment",
    id: "install",
    icon: TerminalIcon,
    color: "text-cyan-400",
    desc: "Downloads the compressed gemOS image and required dependencies for Termux.",
    code: `#!/bin/bash
# gemOS Quick Installer
pkg update && pkg upgrade -y
pkg install qemu-system-x86-64-headless qemu-utils wget -y
echo "[*] Downloading gemOS Optimized Image (145MB)..."
wget -O gemos_root.img https://mirror.gemos.io/v1/stable/rootfs.img
echo "[*] Downloading Kernel..."
wget -O gemos-vmlinuz https://mirror.gemos.io/v1/stable/vmlinuz
echo "[+] gemOS Ready to Boot."
`
  },
  {
    title: "System Fix / Reset",
    id: "fix",
    icon: RefreshCcw,
    color: "text-yellow-400",
    desc: "Cleans stale virtual sockets and re-syncs the system image file.",
    code: `#!/bin/bash
# gemOS Recovery Tool
echo "[!] Attempting to repair virtual drive..."
qemu-img check gemos_root.img
rm -rf /tmp/qemu-*
echo "[+] Repair sequence complete."
`
  },
  {
    title: "Pure Uninstall",
    id: "uninstall",
    icon: Trash2,
    color: "text-red-400",
    desc: "Completely wipes gemOS binaries and virtual disks from $HOME.",
    code: `#!/bin/bash
# gemOS Wipe Script
rm gemos_root.img gemos-vmlinuz
pkg uninstall qemu-system-x86-64-headless -y
echo "[-] gemOS removed. Returning to stock Termux."
`
  }
];

export const Scripts: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple feedback could be added here
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {SCRIPT_DATA.map((script) => (
        <div 
          key={script.id} 
          className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-3 group hover:border-white/20 transition-all shadow-lg"
          id={`script-${script.id}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded bg-black/40 ${script.color}`}>
              <script.icon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{script.title}</h3>
              <p className="text-[10px] text-gray-400 font-mono">{script.desc}</p>
            </div>
          </div>
          
          <div className="relative">
            <pre className="bg-black/90 p-3 rounded text-[10px] text-cyan-300 font-mono overflow-x-auto border border-white/5 whitespace-pre">
              {script.code}
            </pre>
            <button 
              onClick={() => copyToClipboard(script.code)}
              className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Copy Script"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
