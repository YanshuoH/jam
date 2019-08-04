<template>
    <div class="align-center">
        <h1>Sample With Chords</h1>

        <div>
            Chord progress without interpolation
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
  import {MusicVAE, Player, sequences} from '@magenta/music'
  import {search} from '@/checkpoints/config'
  import {concatenateSequences} from '@/tools/sequences'

  const player = new Player()

  const chordProgression = ['F', 'G', 'Am', 'Am']
  const endpoint = search('multitrack_chords').endpoint
  const model = new MusicVAE(endpoint)

  export default {
    name: 'SampleWithChords',
    created() {
      model.initialize()
        .then(() => {
          this.initialized = true
        })
        .then(() => {
          let promises = []
          for (let i = 0; i < chordProgression.length; i++) {
            let chord = chordProgression[i]
            let p = model.sample(1, null, [chord], 24, 120)
              .then(samples => samples[0])
            promises.push(p)
          }

          return Promise.all(promises)
        })
        .then(samples => {
          let concatSeqs = concatenateSequences(samples)
          // let qs = sequences.quantizeNoteSequence(concatSeqs, null)
          this.sample = sequences.mergeInstruments(concatSeqs)
        })
    },
    methods: {
      start() {
        player.resumeContext()
        player.start(this.sample)
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
        sample: null,
      }
    }
  }
</script>