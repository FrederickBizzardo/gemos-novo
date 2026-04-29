/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldCheck, Cpu, Code2, Power, Settings, HelpCircle, Trash2, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
}

const BOOT_LOGS = [
  "[    0.000000] Linux version 6.1.0-13-arm64 (debian-kernel@lists.debian.org)",
  "[    0.000000] BIOS: QEMU-virt-aarch64 v6.1",
  "[*] gemOS booting (Serial Console)...",
  "[i] SSH Port: 3027 (User: root)",
  "[    0.450000] virtio-pci 0000:00:01.0: using bar 0 for rng-virtio",
  "[    0.890000] vda: vda1 vda2",
  "[    1.500000] systemd[1]: Started Dispatch Password Requests to Console Directory Watch.",
  "[    2.200000] Debian GNU/Linux 12 gemOS ttyS0",
  "gemOS login: root",
  "root@gemOS:~# _"
];

export const Terminal: React.FC<{ themeColor: string }> = ({ themeColor }) => {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let i = 0;
    const boot = () => {
      if (i < BOOT_LOGS.length) {
        setHistory(prev => [...prev, { text: BOOT_LOGS[i], type: 'system' }]);
        i++;
        setTimeout(boot, 100 + Math.random() * 200);
      } else {
        setIsBooting(false);
        setHistory(prev => [...prev, { text: 'Type "help" for a list of available commands.', type: 'output' }]);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory: TerminalLine[] = [...history, { text: `user@gemOS:~$ ${cmd}`, type: 'input' }];

    switch (trimmed) {
      case 'help':
        newHistory.push({ text: 'gemOS (Debian Core) Commands:', type: 'output' });
        newHistory.push({ text: '  sudo         - Escalate to superuser privileges', type: 'output' });
        newHistory.push({ text: '  apt-get      - Debian package management tool', type: 'output' });
        newHistory.push({ text: '  docker stats - Monitor container resource usage', type: 'output' });
        newHistory.push({ text: '  systemctl    - Manage systemd services', type: 'output' });
        newHistory.push({ text: '  fix          - Run fsck on the virtual drive', type: 'output' });
        newHistory.push({ text: '  clear        - Clear terminal session', type: 'output' });
        newHistory.push({ text: '  exit         - Shut down virtual kernel', type: 'output' });
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'sudo':
      case 'sudo su':
        newHistory.push({ text: 'root@gemOS:~# ', type: 'success' });
        newHistory.push({ text: 'Privilege escalation successful. Security mode: Permissive.', type: 'output' });
        break;
      case 'docker stats':
        newHistory.push({ text: 'CONTAINER ID   NAME       CPU %     MEM USAGE / LIMIT', type: 'output' });
        newHistory.push({ text: 'a8b7c6d5e4f3   gem_core   0.05%     12.4MiB / 512MiB', type: 'output' });
        break;
      case 'apt-get update':
      case 'apt update':
        newHistory.push({ text: 'Hit:1 http://deb.debian.org/debian bookworm InRelease', type: 'output' });
        newHistory.push({ text: 'Reading package lists... Done', type: 'output' });
        break;
      case 'systemctl status':
        newHistory.push({ text: '● gemOS-core.service - Core System Logic', type: 'success' });
        newHistory.push({ text: '   Active: active (running) since Wed 2026-04-29', type: 'output' });
        break;
      case 'exit':
        newHistory.push({ text: 'Sending SIGTERM to all processes...', type: 'error' });
        newHistory.push({ text: 'kernel: Power down.', type: 'output' });
        setTimeout(() => window.location.reload(), 1000);
        break;
      case 'fix':
        newHistory.push({ text: '[*] Checking /dev/vda1 (Debian Root FS)...', type: 'output' });
        newHistory.push({ text: 'clean, 125432/625856 files, 1542341/2501376 blocks', type: 'success' });
        break;
      case '':
        break;
      default:
        newHistory.push({ text: `bash: ${trimmed}: command not found`, type: 'error' });
    }

    setHistory(newHistory);
  };

  return (
    <div 
      className="flex flex-col h-full rounded-lg border border-white/10 bg-black/80 backdrop-blur-md overflow-hidden"
      onClick={() => inputRef.current?.focus()}
      style={{ boxShadow: `0 0 40px -10px ${themeColor}40` }}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/5">
        <TerminalIcon size={14} className="text-gray-400" />
        <span className="text-xs font-mono text-gray-400">user@gemOS: ~</span>
        <div className="flex-1" />
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs md:text-sm space-y-1 scrollbar-thin scrollbar-thumb-white/10"
      >
        {history.map((line, i) => (
          <div key={i} className={`
            ${line.type === 'input' ? 'text-white' : ''}
            ${line.type === 'output' ? 'text-gray-400' : ''}
            ${line.type === 'error' ? 'text-red-400' : ''}
            ${line.type === 'success' ? 'text-green-400' : ''}
            ${line.type === 'system' ? 'text-cyan-500' : ''}
            break-words whitespace-pre-wrap
          `}>
            {line.text}
          </div>
        ))}
        {!isBooting && (
          <div className="flex items-center gap-2">
            <span className="text-green-400 shrink-0">user@gemOS:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommand(input);
                  setInput('');
                }
              }}
              className="bg-transparent border-none outline-none text-white w-full"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};
