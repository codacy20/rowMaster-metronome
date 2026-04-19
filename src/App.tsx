/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Volume2, Anchor, Activity, Waves } from 'lucide-react';
import { AudioEngine, MetronomeSound } from './lib/AudioEngine';

const ROLLING_SPMS = [18, 20, 22, 24, 26, 28, 30, 32, 34, 36];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [spm, setSpm] = useState(24);
  const [sound, setSound] = useState<MetronomeSound>('beep');
  const [useHaptics, setUseHaptics] = useState(false);
  const [lastBeatTime, setLastBeatTime] = useState(0);
  const engineRef = useRef<AudioEngine | null>(null);

  // Initialize engine only once
  useEffect(() => {
    engineRef.current = new AudioEngine(spm, sound, (time) => {
      setLastBeatTime(time);
      // Trigger haptic if enabled
      if (useHaptics && navigator.vibrate) {
        navigator.vibrate(20);
      }
    });
    return () => {
      engineRef.current?.stop();
    };
  }, [useHaptics]); // Re-init engine when haptics toggle changes so callback is fresh

  // Sync spm and sound to engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSPM(spm);
      engineRef.current.setSound(sound);
    }
  }, [spm, sound]);

  const togglePlay = async () => {
    if (isPlaying) {
      engineRef.current?.stop();
      setIsPlaying(false);
    } else {
      await engineRef.current?.start();
      setIsPlaying(true);
    }
  };

  const getIntensityZone = (val: number) => {
    if (val <= 20) return { label: "Technical Base", description: "Focus on form and deep breathing." };
    if (val <= 25) return { label: "Aerobic Steady", description: "Sustainable pace for long sessions." };
    if (val <= 32) return { label: "AT / Power", description: "High performance threshold." };
    return { label: "Sprint / Max", description: "Maximum effort anaerobic bursts." };
  };

  const zone = getIntensityZone(spm);

  const sounds: { id: MetronomeSound, name: string, desc: string }[] = [
    { id: 'beep', name: 'Wooden Oar-Click', desc: 'Natural pivot resonance' },
    { id: 'clak', name: 'Digital Pulse', desc: 'Clear high-frequency spike' },
    { id: 'thump', name: 'Deep Percussion', desc: 'Low-end rhythmic anchor' },
    { id: 'splash', name: 'The Catch (Splash)', desc: 'Blade entry simulation' },
    { id: 'ping', name: 'Resonant Digital', desc: 'Sharp studio ping' },
    { id: 'wood', name: 'Hardwood Block', desc: 'Percussive studio wood' },
    { id: 'pulse', name: 'Heavy Electronic', desc: 'Deep sawtooth drive' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#0A0B0D] text-[#F2F2F2]">
      {/* Visualizer Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <Waves className="absolute -bottom-20 -left-20 w-[600px] h-[600px]" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-between relative z-10">
        <header>
          <div className="accent-text mb-3">Session 01 // Foundation</div>
          <h1 className="editorial-title">The Rhythm<br />of Water.</h1>
          <div className="mt-4 flex items-center gap-4">
            <div className="px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded text-[10px] font-mono text-brand-cyan">
              {zone.label}
            </div>
            <p className="text-xs opacity-40 font-light italic">{zone.description}</p>
          </div>
        </header>

        <div className="relative my-20 md:my-0 flex items-center">
          <motion.div 
            key={lastBeatTime}
            initial={{ opacity: 1 }}
            animate={isPlaying ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.2 }}
            className="spm-display"
          >
            {spm}
          </motion.div>
          
          <div className="absolute bottom-12 md:bottom-20 left-[18rem] md:left-[30rem] hidden md:block">
            <span className="accent-text !text-2xl">SPM</span>
            <br />
            <span className="text-sm opacity-50 font-light">Strokes Per Minute</span>
          </div>

          {/* Rhythm Guide visualization (1:2 ratio) */}
          <div className="absolute left-0 bottom-[-40px] w-full max-w-[200px] h-1 bg-white/5 rounded-full overflow-hidden">
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  key={lastBeatTime + "-guide"}
                  initial={{ width: "0%", backgroundColor: "rgba(0, 209, 255, 1)" }}
                  animate={{ 
                    width: ["0%", "100%", "100%"],
                    backgroundColor: ["rgba(0,209,255,1)", "rgba(0,209,255,1)", "rgba(255,255,255,0.1)"]
                  }}
                  transition={{ 
                    duration: 60 / spm, 
                    times: [0, 0.33, 1], // Drive is first 33%, Recovery is rest
                    ease: "linear"
                  }}
                  className="h-full"
                />
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isPlaying && (
              <motion.div
                key="pulse"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 0.1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-cyan rounded-full filter blur-[100px] pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-end gap-10">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <span className="control-label !mb-0">Rhythm Dynamics</span>
              <div className="text-[10px] bg-white/5 px-2 py-0.5 rounded opacity-45">1:2 Ratio Guide</div>
            </div>
            <div className="flex items-end h-10 gap-1 mt-2">
              {[20, 10, 10, 30, 40, 35, 30, 25, 20, 18, 16, 14, 12, 10].map((h, i) => (
                <motion.div
                  key={i}
                  animate={isPlaying ? { height: [h + "px", (h * 1.5) + "px", h + "px"] } : { height: h + "px" }}
                  transition={{ duration: 0.5, delay: i * 0.05, repeat: isPlaying ? Infinity : 0 }}
                  className="w-1 bg-brand-cyan opacity-80"
                />
              ))}
            </div>
          </div>
          
          <button 
            onClick={togglePlay}
            className="btn-primary flex flex-col items-center gap-1 min-w-[200px]"
          >
            <div className="flex items-center gap-3">
              {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {isPlaying ? 'Terminate Stroke' : 'Initiate Stroke'}
            </div>
          </button>
        </div>
      </div>

      {/* Side Control Panel */}
      <div className="glass-panel w-full md:w-[400px] p-8 md:p-16 flex flex-col relative z-20">
        <div className="mb-14">
          <div className="flex justify-between items-center mb-1">
            <span className="control-label !mb-0">01 // Audio Guidance</span>
            <button 
              onClick={() => setUseHaptics(!useHaptics)}
              className={`text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded border ${useHaptics ? 'bg-brand-cyan border-brand-cyan text-black' : 'border-white/20 text-white/40'}`}
            >
              Haptic {useHaptics ? 'On' : 'Off'}
            </button>
          </div>
          <p className="text-[10px] opacity-40 leading-relaxed mb-4">
            <span className="text-brand-cyan font-bold">LOUD BEAT</span> = Catch
            <br />
            <span className="opacity-100 text-white font-bold ml-4">SOFT CLICK</span> = Finish
          </p>

          <span className="control-label">02 // Tempo Adjustment</span>
          <div className="flex justify-between mb-4 text-sm">
            <span className="font-light opacity-80">Cycle Duration</span>
            <span className="text-brand-cyan font-mono">{(60 / spm).toFixed(2)}s per stroke</span>
          </div>
          
          <div className="relative h-10 flex items-center group">
            <div className="slider-track" />
            <input
              type="range"
              min="12"
              max="40" 
              value={spm}
              onChange={(e) => setSpm(parseInt(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
            />
            <div 
              className="slider-thumb pointer-events-none transition-transform group-hover:scale-125" 
              style={{ left: `${((spm - 12) / 28) * 100}%` }} 
            />
          </div>
          
          <div className="flex justify-between font-mono text-[10px] opacity-40 mt-2">
            <span>TECH</span>
            <span>POWER</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <span className="control-label">03 // Acoustic Profile</span>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col">
              {sounds.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSound(s.id)}
                  className={`py-4 flex items-center justify-between border-b border-white/5 transition-all text-left ${sound === s.id ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
                >
                  <div className="flex flex-col">
                    <span className={`text-xs uppercase tracking-widest font-bold ${sound === s.id ? 'text-brand-cyan' : 'text-white'}`}>
                      {s.name}
                    </span>
                    <span className="text-[9px] opacity-60 font-light mt-0.5 italic">{s.desc}</span>
                  </div>
                  {sound === s.id ? (
                    <motion.div layoutId="active-dot" className="w-1.5 h-1.5 bg-brand-cyan rounded-full" />
                  ) : (
                    <Volume2 size={12} className="opacity-20" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>


        <div className="mt-auto pt-10 border-t border-white/5">
          <span className="control-label">Performance Summary</span>
          <div className="grid grid-cols-2 gap-8 mt-4">
            <div>
              <div className="text-2xl font-light">2:14</div>
              <div className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Split / 500m</div>
            </div>
            <div>
              <div className="text-2xl font-light">12:40</div>
              <div className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Total Time</div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-right">
          <span className="[writing-mode:vertical-rl] uppercase tracking-[0.4em] text-[10px] opacity-20 transform rotate-180">
            VIRTUAL COXSWAIN SYSTEM v4.0
          </span>
        </div>
      </div>
    </div>
  );
}


