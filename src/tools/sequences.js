import {sequences} from '@magenta/music'

// Concatenate multiple NoteSequence objects.
export function concatenateSequences(seqs) {
  const seq = sequences.clone(seqs[0])
  let numSteps = seqs[0].totalQuantizedSteps
  for (let i = 1; i < seqs.length; i++) {
    const s = sequences.clone(seqs[i])
    s.notes.forEach(note => {
      note.quantizedStartStep += numSteps
      note.quantizedEndStep += numSteps
      seq.notes.push(note)
    })
    numSteps += s.totalQuantizedSteps
  }
  seq.totalQuantizedSteps = numSteps
  return seq
}