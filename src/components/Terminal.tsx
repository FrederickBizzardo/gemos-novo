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
  "[    0.000000] gemOS version 1.0.0-genie (root@termux) #1 SMP PREEMPT Wed Apr 29",
  "[    0.000010] CPU: Virtual ARMv8 Processor (Cortex-A72) @ 2.4GHz",
  "[    0.245000] mem: Initializing 512MB ultra-optimized workspace...",
  "[    0.512000] vfs: Mounting gemOS overlay-fs (Termux bridge active)",
  "[    0.800000] kernel: Sudo-without-root subsystem initialized via proot",
  "[    1.200000] network: TUN/TAP interface bridged to Android hardware",
  "[    1.500000] gemOS: Starting lightweight services (Docker enabled)",
  "[    2.000000] gemOS: System ready. Welcome back, Architect."
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
        newHistory.push({ text: 'Available commands:', type: 'output' });
        newHistory.push({ text: '  sudo         - Run commands with virtual superuser privileges', type: 'output' });
        newHistory.push({ text: '  docker ps    - Show active virtual containers', type: 'output' });
        newHistory.push({ text: '  apt upgrade  - Fetch optimized binary updates', type: 'output' });
        newHistory.push({ text: '  fix          - Auto-repair gemOS dependencies', type: 'output' });
        newHistory.push({ text: '  install      - Show Termux bootstrap installation guide', type: 'output' });
        newHistory.push({ text: '  clear        - Wipes current session screen', type: 'output' });
        newHistory.push({ text: '  exit         - Close gemOS and return to Termux', type: 'output' });
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'sudo':
      case 'sudo su':
        newHistory.push({ text: '[sudo] password for user: ', type: 'output' });
        newHistory.push({ text: 'Virtual root access granted. Environment is now super-privileged.', type: 'success' });
        break;
      case 'docker ps':
        newHistory.push({ text: 'CONTAINER ID   IMAGE          COMMAND                  STATUS          PORTS     NAMES', type: 'output' });
        newHistory.push({ text: 'a8b7c6d5e4f3   alpine:latest  "/bin/sh"                Up 2 hours      -         gem_core', type: 'output' });
        break;
      case 'apt upgrade':
        newHistory.push({ text: 'Reading package lists... Done', type: 'output' });
        newHistory.push({ text: 'Building dependency tree... Done', type: 'output' });
        newHistory.push({ text: 'gemOS is already at the latest bleeding-edge version.', type: 'success' });
        break;
      case 'install':
        newHistory.push({ text: 'GEMOS INSTALLATION SCRIPT (Copy to Termux):', type: 'system' });
        newHistory.push({ text: 'curl -sL https://gemos.io/setup | bash', type: 'success' });
        newHistory.push({ text: 'Estimated setup time: 45 seconds (Ultra-optimized)', type: 'output' });
        break;
      case 'exit':
        newHistory.push({ text: 'Terminating gemOS virtual layer...', type: 'error' });
        newHistory.push({ text: 'Exiting to Termux. Secure session closed.', type: 'output' });
        setTimeout(() => window.location.reload(), 1000);
        break;
      case 'fix':
        newHistory.push({ text: 'Running system integrity check...', type: 'output' });
        newHistory.push({ text: 'Found 0 vulnerabilities. System is rock solid.', type: 'success' });
        break;
      case '':
        break;
      default:
        newHistory.push({ text: `gemOS: command not found: ${trimmed}`, type: 'error' });
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
