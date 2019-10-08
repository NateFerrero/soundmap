import React, { useState } from 'react'
import { render } from 'react-dom'
import { Sine } from './waves/Sine'

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div>
      {isPlaying ? (
        <Sine />
      ) : (
        <button onClick={() => setIsPlaying(true)}>Start</button>
      )}
    </div>
  )
}

render(<App />, document.getElementById('root'))
