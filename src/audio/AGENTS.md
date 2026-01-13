# AUDIO MODULE

Pitch detection and audio processing for vocal training.

## STRUCTURE

```
audio/
├── AudioContextManager.js   # Shared AudioContext, mic access
├── PitchDetector.js         # YIN algorithm wrapper
├── PitchDetector.worker.js  # Web Worker for YIN processing
├── CalibrationEngine.js     # Vocal range detection
└── NoteMapper.js            # Frequency → note name conversion
```

## WHERE TO LOOK

| Task                             | File                      | Notes              |
| -------------------------------- | ------------------------- | ------------------ |
| Change pitch algorithm           | `PitchDetector.worker.js` | YIN implementation |
| Modify note detection thresholds | `NoteMapper.js`           | Frequency ranges   |
| Add mic input processing         | `AudioContextManager.js`  | AnalyserNode setup |
| Change calibration duration      | `CalibrationEngine.js`    | Timing constants   |

## CONVENTIONS

- **Web Worker isolation** - Heavy YIN computation runs off main thread
- **Single AudioContext** - All audio routes through AudioContextManager
- **Note format** - `{ note: 'C4', frequency: 261.63, cents: 0 }`

## ANTI-PATTERNS

| DO NOT                                  | WHY                      |
| --------------------------------------- | ------------------------ |
| Create AudioContext before user gesture | Browser blocks autoplay  |
| Run YIN on main thread                  | Causes frame drops       |
| Access mic without error handling       | Permission can be denied |
