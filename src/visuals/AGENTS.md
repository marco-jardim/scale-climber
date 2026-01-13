# VISUALS MODULE

Canvas rendering, sprites, and visual effects.

## STRUCTURE

```
visuals/
├── CanvasRenderer.js       # Main render loop, component orchestration
├── CharacterSprite.js      # Animated climber character
├── PitchMeter.js           # Real-time pitch visualization
├── ParticleSystem.js       # Hit effects, celebrations
├── PerformanceMonitor.js   # FPS counter, debug overlay
└── TitleSceneRenderer.js   # Title screen visuals
```

## WHERE TO LOOK

| Task                       | File                    | Notes                   |
| -------------------------- | ----------------------- | ----------------------- |
| Add new visual effect      | `ParticleSystem.js`     | `createEffect()` method |
| Change character animation | `CharacterSprite.js`    | Sprite sheet frames     |
| Modify pitch display       | `PitchMeter.js`         | `draw()` method         |
| Add debug overlay          | `PerformanceMonitor.js` | Toggle with 'D' key     |

## CONVENTIONS

- **60fps target** - Desktop; 30fps on mobile (detected automatically)
- **Component pattern** - Each visual implements `update(dt)`, `draw(ctx)`
- **Responsive canvas** - Resizes on window change, coords normalized

## ANTI-PATTERNS

| DO NOT                          | WHY                         |
| ------------------------------- | --------------------------- |
| Create canvas context per frame | Memory leak, GC thrashing   |
| Block render loop with sync ops | Causes visible stuttering   |
| Hardcode pixel dimensions       | Breaks on different screens |
