/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Terminal as TerminalIcon, Github, Check, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    name: "Prepare Environment",
    desc: "Update Termux packages and install basics.",
    cmd: "pkg update && pkg install wget -y"
  },
  {
    name: "Deploy gemOS",
    desc: "Download and execute the secure bootstrap script from the repository.",
    cmd: "wget -qO setup.sh https://raw.githubusercontent.com/FrederickBizzardo/gemos-novo/main/setup.sh && chmod +x setup.sh && ./setup.sh"
  },
  {
    name: "Access System",
    desc: "Enter 'gemos' in your terminal any time to launch the virtual environment.",
    cmd: "gemos"
  }
];

export const InstallationGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <Github className="text-white" size={24} />
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight">GitHub Source Installation</h3>
            <p className="text-xs text-gray-400 font-mono">Build directly from the repository for the latest features.</p>
          </div>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div key={i} className="group flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && <div className="w-[1px] flex-1 bg-white/10" />}
              </div>
              
              <div className="flex-1 pb-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">{step.name}</h4>
                <p className="text-xs text-gray-500 mb-3">{step.desc}</p>
                <div className="relative group/cmd">
                  <div className="bg-black/80 rounded-lg p-3 border border-white/5 font-mono text-xs text-cyan-500 flex items-center justify-between group-hover/cmd:border-cyan-500/30 transition-colors">
                    <span className="truncate pr-8">{step.cmd}</span>
                    <button 
                      onClick={() => copyToClipboard(step.cmd, i)}
                      className="absolute right-2 p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    >
                      {copiedIndex === i ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Stars", value: "1.2k+" },
          { label: "Forks", value: "482" },
          { label: "Pull Requests", value: "24" }
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{stat.label}</span>
            <span className="text-lg font-bold text-white font-mono">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
