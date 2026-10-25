# THE SKY CRACKED: Day 1 (script draft, awaiting approval)

Rules applied: 80% story / 20% teaching, image-first hook, atempo 1.14, multi-voice, hero responsible for a group, rank + map growth in the HUD.

## Series bible
- **Premise:** The sky split open over the mountains. Things fall out of the crack, and something is pushing through.
- **You:** park ranger at Ridge Tower. Responsible for 7 hikers (HUD: SURVIVORS 7/7).
- **Power loop (status):** "Sky shards" fall from the crack. Holding one gives a power. RANK goes up each day (RANGER LVL 1 → ...).
- **Map loop (unknown):** the valley map fills in each day. Day 1 unlocks: Ridge Tower. Next: Hollow Creek town (11 km).
- **The Thing:** the voice behind the crack. Never seen in full until late in the series.

## Cast and voices
| Role | Voice |
|---|---|
| Narrator (you, second person) | Brian `nPczCjzI2devNBz1zQrb` |
| Dana, hiker | Jessica `cgSgspJ2msm6clMCkdW9` |
| Reyes, retired soldier | Harry `SOYHLrjzK2X1ezoPC6cr` |
| Eli, young hiker | Liam `TX3LPaxmHKxFdv7VOQHJ` |
| The Thing | Callum `N2lVS1w4EtoT3dr4eOWO` |

## First 3 seconds
- **0.0 s:** black crack tears across a burning orange sunset, a clawed hand pushes through, thunder-tear sound hit, no fade-in. Big text "THE SKY CRACKED" from frame 0.
- **0.0–1.5 s:** NARR "The sky just split open."
- **1.5–3 s:** Dana screams, camera whip to the group on the tower balcony, HUD pops (6:12 PM, CRACK 4 KM, SURVIVORS 7/7). Small tag top-left: ● DAY 1 · THE SKY CRACKED.

## Narration (≈170 words)
1. NARR: The sky just split open.
2. DANA: What is THAT?!
3. NARR: You're the ranger. Seven hikers. One tower. And nobody trained you for this.
4. REYES: Ranger! Tell us what to do!
5. NARR: Don't answer yet. First, ask how far it is. Lightning flashes. You count. One. Two. Three. Boom.
6. NARR: Three seconds. About one kilometer. Light is instant. Sound walks, three hundred forty meters every second.
7. NARR: Another flash. Count. Two seconds. It's walking toward you.
8. ELI: Under the tree! Everybody under the tree!
9. NARR: No. A tree is a lightning rod. You point at the truck.
10. NARR: Metal shell. The current runs around the outside, not through you. Everybody in. Now.
11. NARR: Doors slam. One second later, the tree explodes.
12. DANA: That's where we were standing.
13. NARR: Then the crack starts raining light. Shards of sky, humming, glowing blue. Reyes catches one. His hand ignites.
14. NARR: Rank up. Level two. The crack opens wider, and something speaks.
15. THE THING: Found you.
16. NARR: Eleven kilometers to the town of Hollow Creek. Or climb the tower and signal for help. Run, or climb? Choose in the comments. Day two follows.

## Fact sources (the 20%, real)
- Speed of sound in air ≈ 343 m/s at 20 °C, so 3 s ≈ 1 km (flash-to-bang rule; NOAA / National Weather Service lightning safety).
- Standing under an isolated tree is a leading cause of lightning casualties; lightning favours the tallest object (NWS "When thunder roars, go indoors").
- A hard-topped metal vehicle with windows closed protects because the metal shell carries the current around the occupants (NWS). It's the shell, not the tyres.
- Everything else (crack, shards, the Thing, powers) is fiction.

## Cliffhanger
A: Run to Hollow Creek (11 km, the map opens) / B: Climb the tower and signal. Day 2 resolves the comment vote.

## Build notes
- New kit: `skyKit.tsx` (mountain ridge low-poly, Ridge Tower, pickup truck, 7 puppet hikers, crack mesh with emissive edge, lightning bolts, shards, tree that explodes into flat-shaded chunks).
- Words module + voice from 5 clips (one per speaker), concat then atempo=1.14.
