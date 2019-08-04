<template>
    <div class="align-center">
        <h1>Learn Style With Chord</h1>

        <div>
            Learn style from midi file with defined chord
        </div>
        <div class="spacer"></div>

        <div v-if="!modelInitialized">
            <div class="fa-5x">
                <i class="fas fa-sync fa-spin"></i>
            </div>
        </div>

        <div v-if="modelInitialized">
            <div class="upload">
                <label>File
                    <input type="file" id="file" ref="file" v-on:change="upload()" accept="audio/midi"/>
                </label>
            </div>

            <div v-if="sequenceInitializing">
                <div class="fa-5x">
                    <i class="fas fa-sync fa-spin"></i>
                </div>
            </div>

            <div v-if="!sequenceInitializing">
                <div class="fa-5x" v-if="file != null">
                    <a v-if="!playing" v-on:click="start"><i class="fas fa-play-circle"></i></a>
                    <a v-if="playing" v-on:click="stop"><i class="fas fa-stop-circle"></i></a>
                </div>
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
  import {MusicVAE, tf, sequences} from '@magenta/music'
  import {readMidiFileToBinaryString} from '@/tools/load_midi'
  import {concatenateSequences} from '@/tools/sequences'
  import {createSoundFontPlayer, humanize} from '@/tools/player'
  import {slerp} from "@/tools/slerp";
  import {search} from "@/checkpoints/config";

  const STEPS_PER_QUARTER = 24
  const Z_DIM = 256

  const player = createSoundFontPlayer()
  const endpoint = search('multitrack_chords').endpoint
  const model = new MusicVAE(endpoint)

  export default {
    name: 'LearnStyle',
    created() {
      console.log('initializing model')
      model.initialize()
        .then(() => {
          console.log('initialized model')
          this.modelInitialized = true
        })
    },
    methods: {
      upload() {
        if (this.playing) {
          this.stop()
        }

        let file = this.$refs.file.files[0]

        // avoid memory leak
        let tfr2;
        this.sequenceInitializing = true
        readMidiFileToBinaryString(file)
          .then(seqs => {
            this.file = file
            return model.encode([seqs], ['Dm'])
          })
          .then(z => {
            console.log(z)
            tfr2 = z
            return z.data()
          })
          .then(zarr => {
            tfr2.dispose()

            // zarr = tf.reshape(zarr, [1, Z_DIM]).dataSync()
            const zt1 = tf.tensor2d(zarr, [1, Z_DIM])

            const zrandom = tf.randomNormal([1, Z_DIM])
            let zarrRandom = zrandom.dataSync()
            zrandom.dispose()

            const zt2 = tf.tensor2d(zarrRandom, [1, Z_DIM])
            const zt = slerp(zt1, zt2, 6)

            return model.decode(zt, undefined, ['C'], STEPS_PER_QUARTER)
          })
          .then(seqs => {
            const seq = concatenateSequences(seqs)
            const mergedSeq = sequences.mergeInstruments(seq)
            let interpSeq = sequences.unquantizeSequence(mergedSeq)
            interpSeq.ticksPerQuarter = STEPS_PER_QUARTER

            this.sample = interpSeq
            return player.loadSamples(this.sample)
          })
          .then(() => {
            this.sequenceInitializing = false
          })
          .catch(err => {
            alert(err)
            console.trace(err)

            this.sequenceInitializing = false
          })
      },
      start() {
        player.resumeContext()

        player.start(humanize(this.sample))
        this.playing = true
      },
      stop() {
        player.stop()
        this.playing = false
      }
    },
    data() {
      return {
        file: null,
        modelInitialized: false,
        sequenceInitializing: false,
        playing: false,
        sample: null,
      }
    }
  }
</script>