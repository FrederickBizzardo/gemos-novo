/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RotatingGem } from './components/RotatingGem';
import { Terminal } from './components/Terminal';
import { Scripts } from './components/Scripts';
import { InstallationGuide } from './components/InstallationGuide';
import { Shield, LayoutGrid, Terminal as TerminalIcon, Settings, Github, Zap, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const THEMES = [
  { name: 'Gem Blue', root: '#06b6d4' },
  { name: 'Neon Green', root: '#22c55e' },
  { name: 'Ruby Core', root: '#ef4444' },
  { name: 'Amber Volt', root: '#f59e0b' },
  { name: 'Purple Void', root: '#a855f7' },
];

export default function App() {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [activeTab, setActiveTab] = useState<'terminal' | 'scripts' | 'setup'>('terminal');

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-from),_transparent_70%)]"
          style={{ '--tw-gradient-from': `${activeTheme.root}30` } as any}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <nav className="relative flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            <Zap className="text-cyan-400" size={24} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase italic">
            gem<span className="text-cyan-400">OS</span>
          </h1>
          <div className="hidden md:flex flex-col ml-4">
            <span className="text-[10px] text-cyan-500 font-mono font-bold leading-none uppercase tracking-[0.2em]">v1.0.0-STABLE</span>
            <span className="text-[10px] text-gray-500 font-mono leading-none">Kernel: 5.15.0-v8+</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
            {THEMES.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setActiveTheme(theme)}
                className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${activeTheme.name === theme.name ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                style={{ backgroundColor: theme.root }}
                title={theme.name}
              />
            ))}
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Shield size={12} />
              Termux Virtual Subsystem
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none italic">
              Ultra-lightweight <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-white">Rootless Linux</span>
            </h2>
            <p className="text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
              gemOS is a high-performance, rootless Linux environment containerized for Android. 
              Engineered with a minimalist footprint to run directly on Termux/QEMU with full 
              Docker support and developer-centric toolchains.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'terminal' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            >
              <TerminalIcon size={18} />
              Open Terminal
            </button>
            <button 
              onClick={() => setActiveTab('setup')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'setup' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            >
              <Download size={18} />
              GitHub Setup
            </button>
            <button 
              onClick={() => setActiveTab('scripts')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'scripts' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
              style={activeTab === 'scripts' ? { backgroundColor: 'white', color: 'black' } : {}}
            >
              <LayoutGrid size={18} />
              Script Hub
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'terminal' && (
              <motion.div 
                key="terminal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-[400px] md:h-[500px]"
              >
                <Terminal themeColor={activeTheme.root} />
              </motion.div>
            )}
            {activeTab === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <InstallationGuide />
              </motion.div>
            )}
            {activeTab === 'scripts' && (
              <motion.div
                key="scripts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Scripts />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="w-full md:w-80 flex flex-col items-center gap-12">
          <div className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl w-full flex flex-col items-center shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <RotatingGem />
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold uppercase tracking-widest italic">gem<span className="text-cyan-400">OS</span> Core</h3>
              <p className="text-xs text-gray-400 font-mono mt-1 uppercase">Rotating Binary Lattice</p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase font-bold tracking-[0.3em]">System Specs</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 rounded bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono uppercase">OS Size</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">145 MB</span>
              </div>
              <div className="p-3 rounded bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono uppercase">Boot Speed</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">~1.2s</span>
              </div>
              <div className="p-3 rounded bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono uppercase">Privileges</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">PROOT-V2</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-12 flex gap-4 text-gray-500">
             <Github size={20} className="hover:text-white cursor-pointer transition-colors" />
             <div className="w-[1px] bg-white/10" />
             <span className="text-[10px] font-mono tracking-widest uppercase">Proprietary Build Labs</span>
          </div>
        </aside>
      </main>

      <footer className="mt-24 px-6 py-12 border-t border-white/5 bg-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <Zap className="text-cyan-400 opacity-50" size={32} />
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-white/50">Designed for Extreme Mobility</p>
              <p className="text-xs text-gray-600 font-mono">No device rooting required. Virtual kernel emulation active.</p>
            </div>
          </div>
          <div className="text-[10px] text-gray-700 font-mono uppercase tracking-[0.4em]">
            © 2026 gemOS Dynamic Computing
          </div>
        </div>
      </footer>
    </div>
  );
}

