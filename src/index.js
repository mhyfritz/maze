import { scaleLinear } from 'd3-scale'
import kmers from 'k-mers'
import revcom from 'revcom'

const btnRun = document.getElementById('btn-run')
btnRun.addEventListener('click', run)

const textareaReference = document.getElementById('textarea-reference')
const textareaQuery = document.getElementById('textarea-query')
const inputK = document.getElementById('input-k')

const containerCanvas = document.getElementById('container-canvas')

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

function run () {
  let reference = getSequence(textareaReference.value, 'Reference')
  let query = getSequence(textareaQuery.value, 'Query')
  let k = parseInt(inputK.value, 10)
  if (reference.seq && query.seq && Number.isInteger(k) && k > 0) {
    visualize(k, reference.seq, query.seq)
  }
}

function visualize (k, seq1, seq2) {
  const lenSeq1 = seq1.length
  const lenSeq2 = seq2.length

  const width = Math.min(containerCanvas.clientWidth, containerCanvas.clientHeight) - 80
  const height = width

  canvas.width = width
  canvas.height = height

  const x = scaleLinear()
    .domain([0, lenSeq1 - 1])
    .range([0, width - 1])

  const y = scaleLinear()
    .domain([0, lenSeq2 - 1])
    .range([0, height - 1])

  context.clearRect(0, 0, width, height)

  const index = buildIndex(k, seq1)

  const iterKmers = kmers(k, seq2)
  context.beginPath()
  context.strokeStyle = 'dodgerblue'
  while (true) {
    const kmer = iterKmers.next()
    if (kmer.value === undefined) {
      break
    }
    if (kmer.value in index) {
      for (let hit of index[kmer.value]) {
        const x1 = x(hit)
        const x2 = x(hit + k)
        const y1 = y(kmer.index)
        const y2 = y(kmer.index + k)
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
      }
    }
  }
  context.stroke()

  iterKmers.seek(0)
  context.beginPath()
  context.strokeStyle = 'red'
  while (true) {
    const kmer = iterKmers.next()
    if (kmer.value === undefined) {
      break
    }
    const kmerRc = revcom(kmer.value)
    if (kmerRc in index) {
      for (let hit of index[kmerRc]) {
        const x1 = x(hit)
        const x2 = x(hit + k)
        const y1 = y(kmer.index + k)
        const y2 = y(kmer.index)
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
      }
    }
  }
  context.stroke()
}

function buildIndex (k, seq) {
  const index = {}
  const iterKmers = kmers(k, seq)
  while (true) {
    const kmer = iterKmers.next()
    if (kmer.value === undefined) {
      break
    }
    if (kmer.value in index) {
      index[kmer.value].push(kmer.index)
    } else {
      index[kmer.value] = [kmer.index]
    }
  }
  return index
}

function getSequence (str, id = '') {
  const ret = {
    header: '',
    id,
    seq: ''
  }
  if (str.startsWith('>')) {
    const headerEnd = str.indexOf('\n')
    ret.header = str.substring(0, headerEnd)
    const match = ret.header.match(/>\s*(\S+)/)
    if (match) {
      ret.id = match[1]
    }
    ret.seq = str.substring(headerEnd).replace(/\s+/g, '').toUpperCase()
  } else {
    ret.seq = str.replace(/\s+/g, '').toUpperCase()
  }
  return ret
}
