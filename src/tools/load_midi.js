import {midiToSequenceProto, sequences} from '@magenta/music'
import {NoteSequence} from "@magenta/music/es5/protobuf/index";

const STEPS_PER_QUARTER = 24

/**
 * @param filename
 * @returns {Promise<INoteSequence>}
 */
export function readMidiFileToBinaryString(filename) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      let rawSequences = midiToSequenceProto(reader.result)

      let quantizedSeq
      try {
        quantizedSeq = sequences.quantizeNoteSequence(rawSequences, STEPS_PER_QUARTER)
      } catch(err) {
        console.error(err)
        reject('Unable to quantize MIDI file, possibly due to tempo or time signature changes.')
        return
      }

      // const quartersPerBar = 4 *  quantizedSeq.timeSignatures[0].numerator / quantizedSeq.timeSignatures[0].denominator
      // if (quartersPerBar !== 4) {
      //   reject('Time signatures other than 4/4 not supported.')
      //   return
      // }

      // if (quantizedSeq.totalQuantizedSteps > 4 * STEPS_PER_QUARTER) {
      //   reject('Imported MIDI file must be a single bar.')
      //   return
      // }

      resolve(quantizedSeq)
    }

    reader.onerror = (e) => {
      reject(`error occurred wile read file ${filename}, e = ${e.toString()}`)
    }
    reader.readAsBinaryString(filename)
  })
}
