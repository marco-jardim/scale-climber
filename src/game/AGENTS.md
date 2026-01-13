# GAME MODULE

Core game logic, state management, and scoring.

## STRUCTURE

```
game/
├── GameEngine.js         # Main orchestrator, event emitter
├── ScaleChallenge.js     # Active gameplay (climb the scale)
├── PracticeMode.js       # Free practice (no scoring)
├── ScoreSystem.js        # Points, combos, grades (S/A/B/C)
├── StateRecovery.js      # Crash recovery, session persistence
└── TitleScreenManager.js # Title screen state
```

## WHERE TO LOOK

| Task                      | File                                               | Notes                       |
| ------------------------- | -------------------------------------------------- | --------------------------- |
| Add new game mode         | Create new class, follow `PracticeMode.js` pattern |
| Change scoring formula    | `ScoreSystem.js`                                   | `calculateScore()` method   |
| Modify note hold duration | `ScaleChallenge.js`                                | `HOLD_DURATION_MS` constant |
| Add game events           | `GameEngine.js`                                    | `emit()` for new events     |

## CONVENTIONS

- **Event-driven** - GameEngine emits: `pitch-update`, `note-hit`, `note-miss`, `challenge-complete`
- **State pattern** - Game modes implement `start()`, `stop()`, `update()`, `getState()`
- **Tier system** - PERFECT (±10¢), GREAT (±25¢), OK (±50¢), MISS

## ANTI-PATTERNS

| DO NOT                         | WHY                          |
| ------------------------------ | ---------------------------- |
| Call audio methods directly    | Use GameEngine.audioManager  |
| Mutate state outside game loop | Causes race conditions       |
| Skip StateRecovery integration | Users lose progress on crash |
