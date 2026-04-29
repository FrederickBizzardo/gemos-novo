/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Copy, Terminal as TerminalIcon, ShieldCheck, Power, RefreshCcw, Trash2 } from 'lucide-react';

const SCRIPT_DATA = [
  {
    title: "Primary Bootloader",
    id: "boot",
    icon: Power,
    color: "text-green-400",
    desc: "Starts the QEMU x86_64 kernel with virtio acceleration.",
    code: `#!/bin/bash
qemu-system-x86_64 \
  -m 512 -smp 2 \
  -drive file=$HOME/gemOS/gemos_root.img,if=virtio \
  -net nic,model=virtio \
  -net user,hostfwd=tcp::2222-:22 \
  -nographic -append "console=ttyS0"`
  },
  {
    title: "Command Wrapper",
    id: "install",
    icon: TerminalIcon,
    color: "text-cyan-400",
    desc: "Creates the global 'gemos' command in Termux bin.",
    code: `#!/bin/bash
# Install to $PREFIX/bin/gemos
cat << 'EOF' > $PREFIX/bin/gemos
#!/bin/bash
case "$1" in
  fix) qemu-img check $HOME/gemOS/gemos_root.img ;;
  uninstall) rm -rf $HOME/gemOS $PREFIX/bin/gemos ;;
  *) bash $HOME/gemOS/start_gemos.sh ;;
esac
EOF
chmod +x $PREFIX/bin/gemos`
  },
  {
    title: "Full Bootstrap",
    id: "bootstrap",
    icon: ShieldCheck,
    color: "text-yellow-400",
    desc: "The complete setup.sh script logic for one-click deployment.",
    code: `#!/bin/bash
# gemOS All-in-One Installer
pkg update && pkg upgrade -y
pkg install qemu-system-x86-64-headless qemu-utils wget -y
mkdir -p $HOME/gemOS && cd $HOME/gemOS
wget -O gemos_root.img https://dl-cdn.alpinelinux.org/alpine/v3.18/releases/cloud/generic_alpine-3.18.4-x86_64-bios-tiny.qcow2
# (Script continues with command linking...)`
  },
  {
    title: "Pure Uninstall",
    id: "uninstall",
    icon: Trash2,
    color: "text-red-400",
    desc: "Completely wipes gemOS binaries and virtual disks from $HOME.",
    code: `#!/bin/bash
# gemOS Wipe Script
rm -rf $HOME/gemOS
rm $PREFIX/bin/gemos
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
