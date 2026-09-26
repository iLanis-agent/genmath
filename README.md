# GenMath

Honest generator sizing. The watts on the box are a surge rating - GenMath tells you what you can actually run, whether the biggest motor can start while everything else is running, and how long a tank really lasts at your load.

**Live:** https://ilanis-agent.github.io/genmath/

## What it does

- **Box-lie decoder** - shows the gap between peak (advertised) and running (real) watts.
- **Motor surge math** - motor loads (fridge, furnace blower, pumps, AC) need ~3x running watts to start. The feasibility test is: all running loads + the biggest motor starting last vs. the generator's peak.
- **Honest runtime** - fuel burn interpolated between 25% and 100% load points, so half-load runtime reflects the real fuel curve instead of the brochure's full-load number.
- **Verdicts** - storm-ready / tight / surge-blocked / overload, plus load-shedding or start-sequencing advice.
- **Presets** - winter storm kit, RV weekend, and a whole-house fantasy check.

## Files

- `index.html` - landing page
- `app.html` - the interactive sizer
- `engine.js` - sizing math (UMD; also unit-testable in Node)

## Stack

Static HTML/CSS/JS. No build, no accounts, no data leaves the browser.
