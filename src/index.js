import { scaleLinear } from 'd3-scale'
import { select, event } from 'd3-selection'
import kmers from 'k-mers'

const btnRun = document.getElementById('btn-run')
btnRun.addEventListener('click', run)

const textareaReference = document.getElementById('textarea-reference')
const textareaQuery = document.getElementById('textarea-query')
const inputK = document.getElementById('input-k')

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

function run() {
    let sequenceReference = textareaReference.value.replace(/\s+/g, '').toUpperCase()
    let sequenceQuery = textareaQuery.value.replace(/\s+/g, '').toUpperCase()
    let k = parseInt(inputK.value, 10)
    if (sequenceReference && sequenceQuery && Number.isInteger(k) && k > 0) {
        visualize(k, sequenceReference, sequenceQuery)
    }
}

function visualize(k, seq1, seq2) {
    const lenSeq1 = seq1.length
    const lenSeq2 = seq2.length
    const width = canvas.width
    const height = canvas.height

    const x = scaleLinear()
        .domain([0, lenSeq1 - 1])
        .range([0, width - 1])

    const y = scaleLinear()
        .domain([0, lenSeq2 - 1])
        .range([0, height - 1])

    context.clearRect(0, 0, width, height)

    const index = buildIndex(k, seq1)

    let kmersIter = kmers(seq2, k)
    context.beginPath()
    context.strokeStyle = 'dodgerblue'
    while (true) {
        const kmer = kmersIter.next()
        if (kmer.done) {
            break
        }
        if (kmer.value in index) {
            for (let hit of index[kmer.value]) {
                const x1 = x(hit),
                    x2 = x(hit + k),
                    y1 = y(kmer.index),
                    y2 = y(kmer.index + k)
                context.moveTo(x1, y1)
                context.lineTo(x2, y2)
            }
        }
    }
    context.stroke()

    kmersIter = kmers(seq2, k)
    context.beginPath()
    context.strokeStyle = 'red'
    while (true) {
        const kmer = kmersIter.next()
        if (kmer.done) {
            break
        }
        const kmerRc = revcom(kmer.value)
        if (kmerRc in index) {
            for (let hit of index[kmerRc]) {
                const x1 = x(hit),
                    x2 = x(hit + k),
                    y1 = y(kmer.index + k),
                    y2 = y(kmer.index)
                context.moveTo(x1, y1)
                context.lineTo(x2, y2)
            }
        }
    }
    context.stroke()
}

function buildIndex(k, seq) {
    const index = {}
    const kmersIter = kmers(seq, k)
    while (true) {
        let kmer = kmersIter.next()
        if (kmer.done) {
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

function revcom(seq) {
    return seq.split('').reverse().join('')
}
