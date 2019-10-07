import React, { useEffect } from 'react'

const interpolate = (range: number, phase: number, low: number, high: number) =>
  low + ((high - low) * (phase % range)) / range

const smooth = (range: number, value: number, low: number, high: number) =>
  low + ((high - low) * value) / range

const cycleStep = document.getElementById('cycleStep')
const visualSync = document.getElementById('visualSync')

const DIVISIONS = 4
const CYCLE = 1728
const SPEED = 30

const FREQ_BASE = 110
const FREQ_LOW = FREQ_BASE * 2
const FREQ_RANGE = FREQ_BASE
const FREQ_CYCLE_RANGE = FREQ_BASE

export const Sine = (): null => {
  useEffect(() => {
    const audioContext = new AudioContext()

    const oscillators = new Array(DIVISIONS)
      .fill(null)
      .map(_ => audioContext.createOscillator())

    const visualNodes = oscillators.map(() => document.createElement('div'))
    visualNodes.forEach(node => visualSync.appendChild(node))

    oscillators.forEach((oscillator, index) => {
      const panNode = audioContext.createStereoPanner()
      oscillator.connect(panNode)
      panNode.connect(audioContext.destination)
      const panValue =
        index === oscillators.length - 1
          ? 1
          : interpolate(oscillators.length - 1, index, -1, 1)
      console.log('Oscillator', index, 'with pan', panValue)
      panNode.pan.setValueAtTime(panValue, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(FREQ_LOW, audioContext.currentTime)
    })

    oscillators.forEach(oscillator => oscillator.start())

    let tick = 0

    setInterval(() => {
      tick += 1

      const bigTick = interpolate(CYCLE, Math.floor(tick / CYCLE), 0, CYCLE)
      cycleStep.innerText = `${bigTick}`

      oscillators.forEach((oscillator, index) => {
        const fraction = index + 1 // 1 1/2 1/3 1/4 1/5 1/6 etc
        const bigRelevance = fraction / oscillators.length

        const frequency = interpolate(
          CYCLE / fraction,
          tick,
          FREQ_LOW,
          FREQ_LOW +
            interpolate(
              CYCLE / fraction,
              tick,
              0,
              FREQ_RANGE +
                interpolate(CYCLE, bigTick, 0, bigRelevance * FREQ_CYCLE_RANGE)
            )
        )

        const FREQ_BAND = (FREQ_CYCLE_RANGE + FREQ_CYCLE_RANGE) / 3
        const FREQ_DELTA = frequency - FREQ_LOW

        const red = smooth(FREQ_BAND, FREQ_DELTA, 0, 360)
        const green = smooth(FREQ_BAND * 2, FREQ_DELTA, 0, 360)
        const blue = smooth(FREQ_BAND * 3, FREQ_DELTA, 0, 360)

        visualNodes[
          index
        ].style.backgroundColor = `rgb(${red}, ${green}, ${blue})`

        visualNodes[index].style.transform = `scale(${interpolate(
          CYCLE / fraction,
          tick,
          0.1,
          1
        )})`

        oscillator.frequency.exponentialRampToValueAtTime(
          frequency,
          audioContext.currentTime + 5 / SPEED
        )
      })
    }, 5000 / SPEED)
  }, [])

  return null
}
