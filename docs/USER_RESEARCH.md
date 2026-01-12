# Scale Climber - User Research Documentation

## Phase 0: Discovery Research

### Research Objectives

The primary goal of this research phase is to validate core assumptions about Scale Climber before full development begins. This minimizes the risk of building features that users don't need or value.

### Key Research Questions

1. **Concept Understanding**: Do users understand the pitch training concept without extensive tutorial?
2. **Voice Range Appropriateness**: What octave ranges are most appropriate for different voice types?
3. **Difficulty Calibration**: How tight should pitch tolerance be to feel "fair" vs "challenging"?
4. **Motivation & Retention**: What motivates users to replay the game?
5. **Platform Priority**: Are mobile users a primary or secondary audience?

---

## Interview Methodology

### Participant Recruitment

**Target Participants**: 8-10 users across different musical backgrounds

**Screening Criteria**:
- Age 16+ (vocal range typically stabilized)
- Mix of musical backgrounds: none, beginner, intermediate, advanced
- Mix of voice types: bass, baritone, alto, soprano (if known)
- Mix of device preferences: desktop, mobile, both
- No hearing impairments that would affect pitch discrimination

**Recruitment Channels**:
- Reddit: /r/singing, /r/learnmusic, /r/choir
- Music teacher communities
- Local community centers / music schools
- Social media (Twitter/X music education hashtags)

---

## Interview Script

### Introduction (2 min)

"Hi [Name], thanks for joining! I'm researching a browser-based game to help people train their vocal pitch. There are no right or wrong answers - I'm just trying to understand if this concept would be helpful for people like you. This will take about 20 minutes. Is it okay if I record this for my notes?"

### Demographics & Context (2 min)

1. "Tell me about your musical background."
   - Follow-up: Years of experience, formal training, instruments

2. "How would you describe your singing experience?"
   - Casual, choir member, voice lessons, professional

3. "If you know, what's your voice type?"
   - Bass, baritone, tenor, alto, mezzo-soprano, soprano, unsure

4. "What devices do you typically use for apps or games?"
   - Desktop/laptop, smartphone, tablet, mix

### Current Behavior (5 min)

5. "Tell me about a time you tried to improve your singing."
   - What did you do? What worked? What didn't?

6. "What challenges do you face with pitch accuracy?"
   - Can you hear when you're off? Can you correct it?

7. "Have you used any apps or tools for vocal training?"
   - Which ones? What did you like? What frustrated you?

8. "How often do you practice singing, if at all?"
   - Daily, weekly, occasionally, rarely, never

### Concept Validation (8 min)

*[Show mockup/diagram of game concept]*

9. "What do you think this game does?"
   - Observe: Do they understand without explanation?

10. "Would you try this? Why or why not?"
    - Look for: Interest level, concerns, barriers

11. "What concerns do you have about using something like this?"
    - Common: Mic privacy, embarrassment, accuracy doubts

12. "Imagine you just completed one round. What would make you want to play again?"
    - Look for: Score improvement, unlocks, social sharing, habit building

13. "On a scale of 1-10, how likely would you be to recommend this to a friend learning to sing?"
    - Follow-up: Why that number?

### Feature Prioritization (5 min)

14. "I'll show you some potential features. Please rank them from most to least important to you:"
    - Reference tone playback (hear the note before singing)
    - Multiple difficulty levels (easy/normal/hard tolerance)
    - Practice mode (single notes, no pressure)
    - Leaderboard / social features
    - Progress tracking over time
    - Different scales (minor, chromatic, modes)

15. "Are there any other features you'd want that I didn't mention?"

### Wrap-up (2 min)

16. "If we build an early version, would you be willing to test it and give feedback?"
    - Get contact info if yes

17. "Any final thoughts or questions?"

---

## Interview Synthesis Template

### Participant Profile

- **ID**: P01, P02, etc. (anonymized)
- **Age Range**: 16-25, 26-35, 36-45, 46+
- **Musical Background**: None / Beginner / Intermediate / Advanced
- **Singing Experience**: Casual / Choir / Lessons / Professional
- **Voice Type**: Bass / Baritone / Tenor / Alto / Mezzo-soprano / Soprano / Unknown
- **Primary Device**: Desktop / Mobile / Both

### Key Insights

- **Concept Understanding**: [Did they get it? What confused them?]
- **Interest Level**: [1-10 scale, qualitative observations]
- **Primary Motivators**: [What would make them use this?]
- **Concerns/Barriers**: [What worries them?]
- **Feature Priorities**: [Ranked features]

### Quotes

*Capture verbatim quotes that illustrate key insights*

---

## Synthesis Report Template

*To be completed after all interviews*

### Executive Summary

- Number of interviews conducted: X/10
- Overall reception: Positive / Mixed / Negative
- Core hypothesis validated: Yes / No / Partially
- Major insights: [3-5 key takeaways]

### Voice Type Distribution

| Voice Type | Count | Preferred Octave Range |
|------------|-------|------------------------|
| Bass       | X     | C2-C3                  |
| Baritone   | X     | C3-C4                  |
| Tenor      | X     | C3-C4 or C4-C5         |
| Alto       | X     | C4-C5                  |
| Soprano    | X     | C4-C5 or C5-C6         |
| Unknown    | X     | Default to C4-C5       |

### Tolerance Threshold Validation

Based on user feedback:

- **Easy Mode**: ±50 cents (half semitone) - "forgiving, good for beginners"
- **Normal Mode**: ±25 cents (quarter semitone) - "fair challenge"
- **Hard Mode**: ±10 cents - "very strict, for trained singers"

*Adjust if user feedback suggests different values*

### Platform Priority

- Desktop preference: X%
- Mobile preference: X%
- Both equally: X%

**Decision**: [Primary platform for MVP]

### Feature Priority Ranking

| Rank | Feature | Votes | Implementation Priority |
|------|---------|-------|------------------------|
| 1    | [Feature] | X/10 | Phase 1 / 2 / 3 / Defer |
| 2    | [Feature] | X/10 | Phase 1 / 2 / 3 / Defer |
| ...  | ...       | ...  | ...                     |

### User Motivations (Why They'd Use It)

1. [Most common reason cited - e.g., "Want to improve choir performance"]
2. [Second most common - e.g., "Fun way to warm up"]
3. [Third most common]

### User Concerns (Potential Barriers)

1. [Most common concern - e.g., "Worried about accuracy"]
2. [Second concern - e.g., "Self-conscious about singing aloud"]
3. [Third concern]

**Mitigation Strategies**:
- [For Concern 1]: [How we'll address it]
- [For Concern 2]: [How we'll address it]

### Recommended Design Changes

Based on user feedback, consider:

1. [Change 1 - e.g., "Add visual confidence indicator for pitch detection"]
2. [Change 2 - e.g., "Provide headphone recommendation upfront"]
3. [Change 3]

### Quotes Wall

*Most impactful user quotes*

> "I love the idea! I never know if I'm singing the right pitch in choir."
> — P03, Alto, Beginner

> "Would be better if I could practice just one note at a time first."
> — P07, Tenor, Intermediate

---

## Success Criteria Checklist

- [ ] At least 6 interviews completed before Week 1 ends
- [ ] Core game mechanic validated (70%+ positive reception)
- [ ] Octave range defaults selected based on user voice distribution
- [ ] Tolerance thresholds adjusted if >50% of testers find default too strict/lenient
- [ ] Mobile vs desktop priority determined by user preference data
- [ ] Feature priorities ranked and incorporated into roadmap
- [ ] No critical blockers identified that invalidate core concept

---

## Next Steps

1. **Immediate**: Schedule and conduct interviews (Week 0, Days 3-4)
2. **Synthesis**: Analyze findings and create synthesis report (Week 0, Day 5)
3. **Team Review**: Present findings to technical team (Week 1, Day 1)
4. **Adjust Roadmap**: Incorporate validated assumptions into implementation plan

---

**Note**: If actual user interviews cannot be conducted, use the following validated defaults based on industry research:

- **Default Octave**: C4-C5 (middle octave, works for most adults)
- **Default Tolerances**: ±10 cents (perfect), ±25 cents (great), ±50 cents (ok)
- **Platform Priority**: Desktop-first with responsive mobile support
- **MVP Features**: Calibration, challenge mode, basic scoring (defer practice mode, leaderboards, alternate scales)
