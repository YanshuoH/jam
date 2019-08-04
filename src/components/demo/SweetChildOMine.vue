<template>
    <div class="align-center">
        <h1>Sweet Child O' ...</h1>

        <div>
            Make a Guns'n'Roses like music clip
        </div>
        <div class="spacer"></div>

        <div v-if="!modelInitialized">
            <div class="fa-5x">
                <i class="fas fa-sync fa-spin"></i>
            </div>
        </div>

        <div v-if="modelInitialized">
            <div class="upload" v-if="!sequenceInitializing">
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
  import {interpolateSequences} from '@/tools/interpolate'
  import {search} from "@/checkpoints/config";
  import {createSoundFontPlayer, humanize} from '@/tools/player'
  import {slerp} from '@/tools/slerp'

  const STEPS_PER_QUARTER = 24

  const player = createSoundFontPlayer()
  const endpoint = search('multitrack_fb256').endpoint
  const model = new MusicVAE(endpoint)

  export default {
    name: 'SweetChildOMine',
    created() {
      console.log('initializing model')
      model.initialize()
        .then(() => {
          this.modelInitialized = true
        })
    },
    methods: {
      upload() {
        let file = this.$refs.file.files[0]
        this.sequenceInitializing = true
        readMidiFileToBinaryString(file)
          .then(seq => {
            this.file = file
            // let click = Number((seq.totalQuantizedSteps / STEPS_PER_QUARTER).toFixed(0))
            // let bars = Number((click/4).toFixed(0))

            let seqs = sequences.split(sequences.clone(seq), STEPS_PER_QUARTER*4)
            console.log(seqs.length)


            return interpolateSequences(model, seqs, undefined)
          })
          .then(seqs => {
            this.sample = seqs
            return player.loadSamples(seqs)
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