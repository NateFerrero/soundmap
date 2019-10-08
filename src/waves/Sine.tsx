import React, { useEffect } from 'react'
import { mapCircular, mapRange } from './math'

const cycleStep = document.getElementById('cycleStep')
const freqStep = document.getElementById('freqStep')
const visualSync = document.getElementById('visualSync')

const GRID_SIZE = 5
const RESOLUTION = Math.pow(GRID_SIZE, 2)

const FREQ_BASE = 220
const FREQ_MINIMUM = FREQ_BASE
const MAX_AUDIBLE_FREQ = 660

const STEPS = 1e9

export const Sine = (): null => {
  const mouse = { x: 0, y: 0 }

  document.body.addEventListener('mousemove', e => {
    mouse.x = e.clientX / document.body.clientWidth
    mouse.y = e.clientY / document.body.clientHeight
  })

  useEffect(() => {
    const audioContext = new AudioContext()

    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0, audioContext.currentTime)
    masterGain.connect(audioContext.destination)

    const oscillators = new Array(RESOLUTION)
      .fill(null)
      .map(_ => audioContext.createOscillator())

    const visualNodes = oscillators.map(() => document.createElement('span'))
    visualNodes.forEach((node, index) => {
      if (Math.floor(index % Math.pow(RESOLUTION, 0.5)) === 0) {
        visualSync.appendChild(document.createElement('div'))
      }
      visualSync.appendChild(node)
    })

    const gainNodes = oscillators.map((oscillator, index) => {
      const panNode = audioContext.createStereoPanner()
      const gainNode = audioContext.createGain()
      gainNode.gain.setValueAtTime(
        1 / Math.pow(RESOLUTION, 0.5),
        audioContext.currentTime
      )
      gainNode.connect(panNode)
      oscillator.connect(gainNode)
      panNode.connect(masterGain)
      const panValue =
        oscillators.length === 1
          ? 0
          : mapCircular([0, RESOLUTION - 1], index, [-1, 1])

      console.log('Created oscillator', index, 'with pan', panValue)
      panNode.pan.setValueAtTime(panValue, audioContext.currentTime)

      oscillator.frequency.setValueAtTime(
        FREQ_MINIMUM,
        audioContext.currentTime
      )
      oscillator.start()

      return gainNode
    })

    let tick = 0

    const frame = () => {
      const endTime = audioContext.currentTime + 1 / 120

      masterGain.gain.exponentialRampToValueAtTime(
        0.01 + 0.99 * mouse.x,
        endTime
      )

      const frameTickRate = Math.floor(
        1 + (STEPS / 100) * Math.pow(2 * mouse.y - 1, 5)
      )
      tick += frameTickRate

      const FREQ_MAXIMUM =
        FREQ_MINIMUM +
        (MAX_AUDIBLE_FREQ - FREQ_MINIMUM) *
          mapCircular([0, STEPS], tick, [0, 1])

      const targetFrequencies = oscillators.map((oscillator, index) => {
        return mapCircular([0, STEPS], tick * index, [
          FREQ_MINIMUM,
          FREQ_MAXIMUM
        ])
      })

      oscillators.forEach((oscillator, index) => {
        const frequency = targetFrequencies[index]

        oscillator.frequency.exponentialRampToValueAtTime(frequency, endTime)

        const FREQ_BAND = FREQ_MAXIMUM - FREQ_MINIMUM
        const FREQ_FRACTION = (frequency - FREQ_MINIMUM) / FREQ_BAND

        const red = mapRange([0, 1], Math.pow(FREQ_FRACTION, 5), [0, 255])
        const green = mapRange([0, 1], Math.pow(FREQ_FRACTION, 4), [0, 255])
        const blue = mapRange([0, 1], Math.pow(FREQ_FRACTION, 3), [0, 255])

        visualNodes[
          index
        ].style.backgroundColor = `rgb(${red}, ${green}, ${blue})`

        visualNodes[index].style.transform = `scale(${mapRange(
          [0, 1],
          FREQ_FRACTION,
          [0.7, 0.9]
        )})`
      })

      cycleStep.innerText = `${mapCircular([0, STEPS], tick, [0, 100]).toFixed(
        3
      )}%`

      freqStep.innerText = `${frameTickRate}x`

      requestAnimationFrame(frame)
    }

    requestAnimationFrame(frame)
  }, [])

  return null
}
