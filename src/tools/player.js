import {Player, SoundFontPlayer, sequences} from '@magenta/music'

const HUMANIZE_SECONDS = 0.01

export function humanize(s) {
  const seq = sequences.clone(s)
  seq.notes.forEach(note => {
    let offset = HUMANIZE_SECONDS * (Math.random() - 0.5)
    if (seq.notes.startTime + offset < 0) {
      offset = -seq.notes.startTime
    }
    if (seq.notes.endTime > seq.totalTime) {
      offset = seq.totalTime - seq.notes.endTime
    }
    seq.notes.startTime += offset
    seq.notes.endTime += offset
  })
  return seq
}

export function createSoundFontPlayer() {
  const MAX_PAN = 0.2
  const MIN_DRUM = 35
  const MAX_DRUM = 81

  // Set up effects chain.
  const globalCompressor = new Player.tone.MultibandCompressor()
  const globalReverb = new Player.tone.Freeverb(0.25)
  const globalLimiter = new Player.tone.Limiter()
  globalCompressor.connect(globalReverb)
  globalReverb.connect(globalLimiter)
  globalLimiter.connect(Player.tone.Master)

  // Set up per-program effects.
  const programMap = new Map()
  for (let i = 0; i < 128; i++) {
    const programCompressor = new Player.tone.Compressor()
    const pan = 2 * MAX_PAN * Math.random() - MAX_PAN
    const programPanner = new Player.tone.Panner(pan)
    programMap.set(i, programCompressor)
    programCompressor.connect(programPanner)
    programPanner.connect(globalCompressor)
  }

  // Set up per-drum effects.
  const drumMap = new Map()
  for (let i = MIN_DRUM; i <= MAX_DRUM; i++) {
    const drumCompressor = new Player.tone.Compressor()
    const pan = 2 * MAX_PAN * Math.random() - MAX_PAN
    const drumPanner = new Player.tone.Panner(pan)
    drumMap.set(i, drumCompressor)
    drumCompressor.connect(drumPanner)
    drumPanner.connect(globalCompressor)
  }

  // Set up SoundFont player.
  return new SoundFontPlayer(
    'https://storage.googleapis.com/download.magenta.tensorflow.org/soundfonts_js/sgm_plus',
    globalCompressor, programMap, drumMap)
}