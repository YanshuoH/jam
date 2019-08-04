<template>
    <div class="align-center">
        <h1>Interpolate Multitrack Chords</h1>

        <div>
            Chord progress with interpolation
        </div>
        <div class="spacer"></div>
        <div v-if="!initialized">
            <div class="fa-5x">
                <i class="fas fa-sync fa-spin"></i>
            </div>
        </div>

        <div v-if="initialized">
            <div class="fa-5x">
                <a v-if="!playing" v-on:click="start"><i class="fas fa-play-circle"></i></a>
                <a v-if="playing" v-on:click="stop"><i class="fas fa-stop-circle"></i></a>
            </div>
        </div>
    </div>
</template>

<style>
    .align-center {
        text-align: center
    }

    .spacer {
        padding: 30px
    }
</style>

<script>
  import {MusicVAE, Player, SoundFontPlayer, tf, sequences} from '@magenta/music'
  import {search} from '@/checkpoints/config'
  import {concatenateSequences} from '@/tools/sequences'

  const Z_DIM = 256
  const STEPS_PER_QUARTER = 24
  const HUMANIZE_SECONDS = 0.01

  let z1, z2
  let numSteps = 1
  let numChords = 4
  let chordSeqs
  let progSeqs

  let chords = ['Em', 'G', 'C', 'Bm']

  const player = initPlayer()

  function initPlayer() {
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
  
  function generateSample() {
    const z = tf.randomNormal([1, Z_DIM])
    console.log(z)
    let zarr = z.dataSync()
    z.dispose()

    return zarr
  }

  function generateProgressions(model, cb) {
    let tmp = []
    for (let i = 0; i < numSteps; i++) {
      tmp.push([])
    }

    console.log('generating progressions')

    generateInterpolation(model, 0, tmp, seqs => {
      chordSeqs = seqs

      let concatSeqs = chordSeqs.map(s => concatenateSequences(s))
      progSeqs = concatSeqs.map(seq => {
        const mergedSeq = sequences.mergeInstruments(seq)
        const progSeq = sequences.unquantizeSequence(mergedSeq)
        progSeq.ticksPerQuarter = STEPS_PER_QUARTER
        return progSeq
      })

      const fullSeq = concatenateSequences(concatSeqs)
      const mergedFullSeq = sequences.mergeInstruments(fullSeq)

      cb(mergedFullSeq)
    })
  }

  function generateInterpolation(model, chordIndex, result, cb) {
    if (chordIndex === numChords) {
      console.log('finish generate interpolation with chord index', chordIndex)
      cb(result)
      return
    }

    console.log('interpolating samples for chord index', chordIndex)
    interpolateSamples(model, chords[chordIndex])
      .then(seqs => {
        for (let i = 0; i < numSteps; i++) {
          result[i].push(seqs[i])
        }
        generateInterpolation(model, chordIndex + 1, result, cb)
      })
  }

  function interpolateSamples(model, chord) {
    const z1Tensor = tf.tensor2d(z1, [1, Z_DIM])
    const z2Tensor = tf.tensor2d(z2, [1, Z_DIM])
    const zInterp = slerp(z1Tensor, z2Tensor, numSteps)

    return model.decode(zInterp, undefined, [chord], STEPS_PER_QUARTER)
    // .then(sequences => doneCallback(sequences))
  }

  function slerp(z1, z2, n) {
    const norm1 = tf.norm(z1)
    const norm2 = tf.norm(z2)
    const omega = tf.acos(tf.matMul(tf.div(z1, norm1),
      tf.div(z2, norm2),
      false, true))
    const sinOmega = tf.sin(omega)
    const t1 = tf.linspace(1, 0, n)
    const t2 = tf.linspace(0, 1, n)
    const alpha1 = tf.div(tf.sin(tf.mul(t1, omega)), sinOmega).as2D(n, 1)
    const alpha2 = tf.div(tf.sin(tf.mul(t2, omega)), sinOmega).as2D(n, 1)
    return tf.add(tf.mul(alpha1, z1), tf.mul(alpha2, z2))
  }

  // Randomly adjust note times.
  function humanize(s) {
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

  function playProgression(chordIdx) {
    if (chordIdx === undefined) {
      chordIdx = 0
    }
    const idx = numSteps-1

    console.log(chordSeqs[idx], chordIdx)
    const unquantizedSeq = sequences.unquantizeSequence(chordSeqs[idx][chordIdx])
    player.start(humanize(unquantizedSeq))
      .then(() => {
        const nextChordIdx = (chordIdx + 1) % numChords
        playProgression(nextChordIdx)
      })
  }

  const endpoint = search('multitrack_chords').endpoint

  export default {
    name: 'InterpolateMultitrackChords',
    created() {

      const model = new MusicVAE(endpoint)
      model
        .initialize()
        .then(() => {
          console.log('initialize model done')
        })
        .then(() => {
          z1 = generateSample()
          z2 = generateSample()

          return generateProgressions(model, seqs => {
            player.loadSamples(seqs)
              .then(() => {
                this.initialized = true
              })
          })
        })
    },
    methods: {
      start() {
        player.resumeContext()
        playProgression()
        this.playing = true
      },
      stop() {
        player.stop()
        this.playing = false
      }
    },
    data() {
      return {
        initialized: false,
        playing: false,
      }
    }
  }
</script>