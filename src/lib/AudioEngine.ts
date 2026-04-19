/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MetronomeSound = 'beep' | 'clak' | 'thump' | 'splash' | 'ping' | 'wood' | 'pulse';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private lookahead: number = 25.0; // How frequently to call scheduler (ms)
  private scheduleAheadTime: number = 0.1; // How far ahead to schedule audio (sec)

  private spm: number = 20;
  private soundType: MetronomeSound = 'beep';
  private onBeat?: (time: number) => void;

  constructor(spm: number, sound: MetronomeSound, onBeat?: (time: number) => void) {
    this.spm = spm;
    this.soundType = sound;
    this.onBeat = onBeat;
  }

  public setSPM(spm: number) {
    this.spm = spm;
  }

  public setSound(sound: MetronomeSound) {
    this.soundType = sound;
  }

  private initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createNoiseBuffer();
    }
  }

  private createNoiseBuffer() {
    if (!this.audioContext) return;
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  private playSound(time: number, isSubBeat: boolean = false) {
    if (!this.audioContext) return;

    const volumeScale = isSubBeat ? 0.3 : 1.0;

    if (this.soundType === 'splash') {
      if (!this.noiseBuffer) this.createNoiseBuffer();
      const noise = this.audioContext.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isSubBeat ? 800 : 1500, time);
      filter.frequency.exponentialRampToValueAtTime(400, time + 0.2);
      
      const envelope = this.audioContext.createGain();
      noise.connect(filter);
      filter.connect(envelope);
      envelope.connect(this.audioContext.destination);

      envelope.gain.setValueAtTime(0.4 * volumeScale, time);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      noise.start(time);
      noise.stop(time + 0.3);
      return;
    }

    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    osc.connect(envelope);
    envelope.connect(this.audioContext.destination);

    switch (this.soundType) {
      case 'beep':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isSubBeat ? 440 : 880, time);
        envelope.gain.setValueAtTime(volumeScale, time);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
        break;
      case 'clak':
        osc.type = 'square';
        osc.frequency.setValueAtTime(isSubBeat ? 600 : 1200, time);
        envelope.gain.setValueAtTime(0.5 * volumeScale, time);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.start(time);
        osc.stop(time + 0.05);
        break;
      case 'thump':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isSubBeat ? 100 : 200, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.2);
        envelope.gain.setValueAtTime(1.5 * volumeScale, time);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        osc.start(time);
        osc.stop(time + 0.25);
        break;
      case 'ping':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isSubBeat ? 1000 : 2000, time);
        envelope.gain.setValueAtTime(0.6 * volumeScale, time);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        osc.start(time);
        osc.stop(time + 0.4);
        break;
      case 'wood':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isSubBeat ? 300 : 600, time);
        envelope.gain.setValueAtTime(1.5 * volumeScale, time);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        osc.start(time);
        osc.stop(time + 0.04);
        break;
      case 'pulse':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isSubBeat ? 110 : 220, time);
        envelope.gain.setValueAtTime(1.0 * volumeScale, time);
        envelope.gain.setTargetAtTime(0, time, 0.05);
        osc.start(time);
        osc.stop(time + 0.15);
        break;
    }
  }

  private scheduler() {
    if (!this.audioContext) return;
    
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      // Primary "Catch" Beat
      this.playSound(this.nextNoteTime, false);
      if (this.onBeat) this.onBeat(this.nextNoteTime);
      
      // Secondary "Recovery Start" Beat (1/3rd of the way through)
      const strokeDuration = 60.0 / this.spm;
      this.playSound(this.nextNoteTime + (strokeDuration / 3), true);

      this.nextNoteTime += strokeDuration;
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  public async start() {
    this.initAudio();
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.nextNoteTime = this.audioContext!.currentTime;
    this.scheduler();
  }

  public stop() {
    if (this.timerID) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
  }
}
