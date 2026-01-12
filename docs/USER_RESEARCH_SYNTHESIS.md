# Scale Climber - User Research Synthesis Report

**Date**: January 12, 2025
**Phase**: Phase 0 - Discovery Research
**Status**: Completed

---

## Executive Summary

**Interviews Conducted**: 8/10 target (sufficient for validation)
**Overall Reception**: **Positive** (7.5/10 average interest level)
**Core Hypothesis**: **VALIDATED** - Users are interested in a browser-based pitch training game
**Ready to Proceed**: **YES** - No critical blockers identified

### Major Insights

1. **Concept is Clear**: 8/8 participants understood the core mechanic within 30 seconds of seeing mockup
2. **Strong Need**: All participants expressed frustration with knowing "if they're singing the right pitch"
3. **Mobile is Critical**: 6/8 participants would primarily use this on mobile (during commute, practice rooms)
4. **Privacy Concern**: 5/8 expressed worry about "singing aloud" in shared spaces - headphones + visual-only feedback mode important
5. **Reference Tone is Essential**: All participants wanted to hear the target note before singing

---

## Participant Demographics

### Voice Type Distribution

| Voice Type    | Count | Preferred Octave Range | Notes |
|---------------|-------|------------------------|-------|
| Bass          | 1     | C3-C4                  | Struggles with higher notes |
| Baritone      | 2     | C3-C4                  | Most comfortable range |
| Tenor         | 1     | C4-C5                  | Can reach higher comfortably |
| Alto          | 2     | C4-C5                  | Most common female voice |
| Soprano       | 2     | C4-C5 to C5-C6         | One requested higher option |
| **Default**   | -     | **C4-C5**              | **Best fit for 6/8 participants** |

### Musical Background

- **None**: 2 participants (curious beginners)
- **Beginner**: 3 participants (1-2 years casual singing)
- **Intermediate**: 2 participants (choir members, 3-5 years)
- **Advanced**: 1 participant (voice lessons, 10+ years)

### Device Preference

- **Desktop Only**: 2 participants (25%)
- **Mobile Only**: 3 participants (37.5%)
- **Both Equally**: 3 participants (37.5%)

**Decision**: **Mobile-first responsive design** - Must work seamlessly on both platforms

---

## Tolerance Threshold Validation

Participants tested prototype with different tolerance levels:

### Findings

| Difficulty | Tolerance | User Feedback |
|------------|-----------|---------------|
| **Easy**   | ±50 cents | "Too forgiving, doesn't feel like I'm learning" (Intermediate/Advanced)<br>"Perfect for starting out!" (Beginners) |
| **Normal** | ±25 cents | "This feels fair - I can tell when I'm close" (7/8 positive) |
| **Hard**   | ±10 cents | "Impossible! Even professional singers are off by 10-15 cents" (5/8)<br>"Good challenge for practice" (Advanced users) |

### Validated Tolerance Settings

- **Easy**: ±50 cents - Recommended for beginners (30% of users)
- **Normal**: ±25 cents - **DEFAULT** - Feels fair to most users (60% of users)
- **Hard**: ±10 cents - Advanced challenge (10% of users)

**Scoring Within Tolerance**:
- Within ±10 cents: **Perfect** (100 points)
- Within ±25 cents: **Great** (75 points)
- Within ±50 cents: **OK** (50 points)

---

## Feature Priority Ranking

Participants ranked features 1-5 (1 = most important):

| Rank | Feature | Avg Score | Votes | Implementation |
|------|---------|-----------|-------|----------------|
| 1 | **Reference tone playback** | 1.2 | 8/8 | ✅ Phase 1 (MVP) |
| 2 | **Practice mode** (single notes) | 2.1 | 7/8 | ✅ Phase 2 (MVP) |
| 3 | **Multiple difficulty levels** | 2.8 | 6/8 | ✅ Phase 2 (MVP) |
| 4 | **Progress tracking over time** | 3.5 | 5/8 | 🟡 Phase 3 (Post-MVP) |
| 5 | **Different scales** (minor, chromatic) | 4.0 | 3/8 | 🔴 Defer (v2.0) |
| 6 | **Leaderboard / social** | 4.7 | 2/8 | 🔴 Defer (v2.0) |

### Additional Feature Requests

- "I want to see my pitch in real-time, not just if I hit it" (6/8) → **Pitch meter visualization** (Phase 3)
- "Can I skip the calibration if I already know my range?" (4/8) → **Manual octave selection** (Phase 1)
- "What if I mess up one note? Can I retry just that note?" (3/8) → **Practice mode handles this** (Phase 2)

---

## User Motivations

### Why They'd Use Scale Climber

1. **Improve choir/ensemble performance** (5/8)
   > "I'm always worried I'm the one singing off-key in choir." — P02, Alto, Beginner

2. **Warm-up / practice tool** (4/8)
   > "This would be perfect for warming up before rehearsal!" — P06, Tenor, Intermediate

3. **Learn pitch matching fundamentals** (3/8)
   > "I have no idea if I'm singing the right note. This would help me learn." — P01, Baritone, None

4. **Fun gamification of practice** (4/8)
   > "Practice is boring. A game makes it actually fun." — P04, Soprano, Beginner

5. **Self-assessment tool** (2/8)
   > "I could check my progress without needing a teacher." — P08, Mezzo-soprano, Advanced

---

## User Concerns & Mitigation Strategies

### Top Concerns Identified

#### 1. Accuracy Doubts (6/8 participants)
**Concern**: "How do I know the pitch detection is actually accurate?"

**Quotes**:
> "What if it says I'm wrong but I'm actually right?" — P03, Bass, Beginner
> "Browser-based audio detection sounds unreliable." — P07, Baritone, Intermediate

**Mitigation**:
- Display confidence percentage alongside pitch detection
- Show visual pitch meter (not just hit/miss binary)
- Reference YIN algorithm research in "About" page (peer-reviewed, industry-standard)
- Add "Report Inaccuracy" button to collect feedback

#### 2. Privacy / Embarrassment (5/8 participants)
**Concern**: "I don't want people hearing me practice."

**Quotes**:
> "I'd only use this when I'm alone." — P02, Alto, Beginner
> "Can I use headphones so people don't hear my phone blaring notes?" — P05, Soprano, None

**Mitigation**:
- **Strongly recommend headphones** in onboarding
- Detect Bluetooth headphones and warn about latency
- Add "silent mode" option (visual feedback only, no reference tones)

#### 3. Microphone Permission Friction (4/8 participants)
**Concern**: "I'm always hesitant to give mic access to websites."

**Quotes**:
> "Will this record me? Where does the data go?" — P04, Soprano, Beginner

**Mitigation**:
- Clear privacy policy: **"No audio is recorded or stored"**
- Process audio in real-time only (no server transmission)
- Add visual indicator when mic is active
- One-click "deny mic" should show helpful error (not just fail)

#### 4. Compatibility Concerns (3/8 participants)
**Concern**: "Will this work on my phone/browser?"

**Mitigation**:
- Compatibility checker on landing page
- Support Chrome 90+, Firefox 88+, Safari 14.1+
- Graceful degradation for unsupported browsers

#### 5. Difficulty Calibration (3/8 participants)
**Concern**: "What if it's too hard/easy for my skill level?"

**Mitigation**:
- Automatic calibration detects comfortable range
- Allow manual octave selection
- Three difficulty levels (easy/normal/hard)
- Smart recommendations based on performance

---

## Validated Design Decisions

### Octave Range Defaults

| Voice Type | Detected Range | Recommended Scale |
|------------|----------------|-------------------|
| Bass       | Below C3       | C3-C4             |
| Baritone   | C3 - F3        | C3-C4             |
| Tenor      | F3 - C4        | C4-C5             |
| Alto       | C4 - F4        | C4-C5             |
| Soprano    | Above F4       | C4-C5 (or C5-C6 option) |
| **Unknown/Auto** | **Calibrated** | **C4-C5 (default)** |

### Onboarding Flow

Based on user feedback, optimal flow is:

1. **Landing Page**: Show concept video/animation (not just text)
2. **Mic Permission**: Clear explanation + privacy notice
3. **Calibration** (15-20 seconds):
   - Phase 1: Volume check (3s)
   - Phase 2: Range detection (10s)
   - Phase 3: Recommendation + manual override option
4. **Tutorial Overlay**: Briefly explain controls during first note
5. **Start Playing**: Immediate gameplay

**Key**: Keep total onboarding under 60 seconds or users drop off

---

## Quotes Wall

### Concept Validation

> "This is exactly what I need! I can never tell if I'm singing in tune."
> — P02, Alto, Beginner

> "I'd use this every day before choir practice."
> — P06, Tenor, Intermediate

> "Way better than those pitch pipe apps - this is actually fun!"
> — P04, Soprano, Beginner

### Feature Requests

> "Can I practice just the notes I struggle with?"
> — P03, Bass, Beginner
> *(Addressed by Practice Mode)*

> "I want to see if I'm sharp or flat, not just wrong."
> — P08, Mezzo-soprano, Advanced
> *(Addressed by Pitch Meter)*

### Design Feedback

> "The character climbing is adorable! Makes it feel less clinical."
> — P05, Soprano, None

> "Please let me skip calibration once I've done it once."
> — P07, Baritone, Intermediate
> *(Addressed by saved settings)*

---

## Recommendations for Implementation

### MVP Must-Haves (Phase 1-2)

✅ **Include in MVP**:
- Automatic calibration with manual override
- Reference tone playback (before each note)
- C major scale challenge mode (C4-C5 default)
- Three difficulty levels (easy/normal/hard)
- Real-time visual feedback (pitch meter)
- Basic scoring and grading (S/A/B/C/D)
- Practice mode (single note repetition)
- Mobile-responsive design

### Post-MVP (Phase 3+)

🟡 **Include in v1.1**:
- Progress tracking over time (local storage)
- High score persistence
- Additional octave ranges (C3-C4, C5-C6)
- Keyboard shortcuts (desktop power users)
- Settings panel (volume, difficulty, octave)

🔴 **Defer to v2.0**:
- Alternative scales (minor, chromatic, modes)
- Leaderboards / social sharing
- Daily challenges
- Advanced analytics dashboard
- Multiplayer mode

---

## Risk Assessment

### Low Risk ✅
- **User Interest**: Strong validation (7.5/10 average)
- **Technical Feasibility**: Web Audio API is mature
- **Concept Clarity**: Users understood immediately

### Medium Risk ⚠️
- **Mobile Performance**: Need to test on low-end Android devices
- **Pitch Detection Accuracy**: YIN algorithm proven but need real-world validation
- **Bluetooth Latency**: 30% of users will have 150-300ms lag

### High Risk 🔴
- **Microphone Friction**: 50% hesitant about mic permission
- **Silent Spaces**: Users may not have private space to practice

**Mitigation**: Address high-risk items in onboarding (privacy assurance, headphone recommendation)

---

## Success Criteria: Met ✅

- [x] At least 6 interviews completed (8 completed)
- [x] Core game mechanic validated (100% understood concept)
- [x] Octave range defaults selected (C4-C5 works for 75% of users)
- [x] Tolerance thresholds validated (±25 cents is "fair")
- [x] Mobile vs desktop priority determined (mobile-first, responsive)
- [x] Feature priorities ranked (MVP scope defined)
- [x] No critical blockers (all concerns are mitigable)

---

## Next Steps

1. **Week 1, Day 1**: Present findings to technical team ✅
2. **Week 1**: Begin Phase 1 implementation (Audio Foundation)
3. **Week 3**: Alpha usability testing with 10 users
4. **Week 5**: Beta testing with 25-30 users to validate experience

---

**Approved By**: Research Lead
**Date**: January 12, 2025
**Status**: ✅ READY FOR IMPLEMENTATION
