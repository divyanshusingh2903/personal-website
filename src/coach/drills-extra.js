/*
 * Fundamentals, footwork, passing patterns and positional games.
 * Same diagram format as drills.js, plus:
 *   frame.feet   [[x, y, "L" | "R", angle?]] footprints for that step
 *   frame.face   { id: degrees } which way a player faces (0 = right, 90 = down)
 *   frame.call   { id, text, color } a coach's call shown above that player
 *   frame.team   { id: team } change a player's team colour mid-drill
 *   frame.quiet  reposition players without drawing arrows
 *   frame.reset  like quiet, and also clears the trail (rotations, next rep)
 *   player.ghost outline-only player so footprints stay visible
 */

/* ─── Shared layouts ─────────────────────────────────────── */

// Agility ladder: ten 45 cm squares. LX(i) is the centre of square i.
const LX = (i) => 0.725 + 0.45 * i;
const LY = 1.1;

const ladder = (note, start, frames) => ({
  field: { type: "grid", w: 6, h: 2.2, bare: true },
  ladders: [{ x: 0.5, y: 0.85, len: 4.5 }],
  players: [{ id: "a1", t: "a", x: start[0], y: start[1], ghost: true }],
  note,
  frames: frames.map(([pos, feet, text]) => ({ quiet: true, move: { a1: pos }, feet, note: text })),
});

// Close-up of the ball and both feet, roughly 1.6 × 1.2 m. The player faces up the screen.
const closeUp = (note, ball, feet, frames) => ({
  field: { type: "grid", w: 1.6, h: 1.2, bare: true },
  r: 0.25,
  players: [],
  ball,
  feet,
  note,
  frames: frames.map(([b, f, text]) => ({ ball: b ?? undefined, feet: f, note: text })),
});

const UP = -90;

// Five cones on a circle for the passing star.
const STAR = [
  [12, 2],
  [21.5, 8.9],
  [17.9, 20.1],
  [6.1, 20.1],
  [2.5, 8.9],
];
// Where a runner stops when following a pass to cone i (just inside it).
const STAR_ARRIVE = [
  [12, 3.3],
  [20.3, 9.3],
  [17.2, 19],
  [6.8, 19],
  [3.7, 9.3],
];
const starPlayers = () => [
  ...STAR.map(([x, y], i) => ({ id: `s${i + 1}`, t: "a", x, y })),
  { id: "s6", t: "a", x: 12, y: 0.4 },
];

const numbered = () =>
  [
    [4, 5], [12, 3], [20, 6], [21, 14], [18, 21], [10, 20], [4, 14], [12, 12],
  ].map(([x, y], i) => ({ id: `p${i + 1}`, t: "a", x, y, n: String(i + 1) }));

export const EXTRA_DRILLS = [
  /* ─── Fundamentals ───────────────────────────────────────── */
  {
    id: "red-light-green-light",
    title: "Red Light, Green Light",
    category: "fundamentals",
    ages: ["U6-8", "U9-12"],
    positions: ["DEF", "MID", "FWD"],
    format: "Team",
    players: "Any number",
    duration: 10,
    intensity: 2,
    area: "25 × 20 m",
    summary:
      "The first dribbling game most players learn. Dribble on green, stop the ball dead on red, toe taps on yellow. Teaches close control, stopping with the sole and listening while the ball is at your feet.",
    setup: ["Players on one line with a ball each. Coach on the far line."],
    steps: [
      "GREEN: dribble towards the coach.",
      "RED: stop the ball with the sole and freeze. Anyone still moving goes back three steps.",
      "YELLOW: toe taps on the spot. First to the coach's line wins.",
    ],
    points: [
      "Small touches so you can stop quickly.",
      "Stop with the sole on top of the ball, not by kicking it.",
      "Look up at the coach, not down at the ball.",
    ],
    progressions: [
      "Add calls: 'TURN!' (drag-back and go the other way), 'SWITCH!' (swap balls with a neighbour).",
      "Coach shows coloured cones instead of shouting, so players must look up.",
      "Weaker foot only.",
    ],
    videos: [
      { id: "oJWGpfUMTZk", title: "Red Light, Green Light: Fun Soccer Games for Kids", channel: "Coaches College" },
    ],
    search: "red light green light soccer drill kids",
    diagram: {
      field: { type: "grid", w: 25, h: 20 },
      players: [
        { id: "c", t: "c", x: 24, y: 10 },
        { id: "a1", t: "a", x: 1, y: 3 },
        { id: "a2", t: "a", x: 1, y: 6.5 },
        { id: "a3", t: "a", x: 1, y: 10 },
        { id: "a4", t: "a", x: 1, y: 13.5 },
        { id: "a5", t: "a", x: 1, y: 17 },
      ],
      balls: { b1: "a1", b2: "a2", b3: "a3", b4: "a4", b5: "a5" },
      note: "Everyone on the line with a ball.",
      frames: [
        {
          note: "GREEN: dribble towards the coach.",
          call: { id: "c", text: "GREEN!", color: "g" },
          move: { a1: [7, 3.5], a2: [6.5, 6.8], a3: [7.5, 10.3], a4: [6, 13.2], a5: [7, 16.5] },
        },
        { note: "RED: sole on the ball, freeze!", call: { id: "c", text: "RED!", color: "r" } },
        {
          note: "GREEN again.",
          call: { id: "c", text: "GREEN!", color: "g" },
          move: { a1: [14, 3], a2: [13, 7.2], a3: [14.5, 10], a4: [12.5, 13.8], a5: [14, 16.8] },
        },
        { note: "YELLOW: toe taps on the spot.", call: { id: "c", text: "YELLOW!", color: "y" } },
        {
          note: "GREEN: race to the line.",
          call: { id: "c", text: "GREEN!", color: "g" },
          move: { a1: [21, 3.4], a2: [20, 7], a3: [21.5, 10.6], a4: [19.5, 13.4], a5: [21, 16.6] },
        },
      ],
    },
  },
  {
    id: "inside-foot-passing",
    title: "Inside-Foot Passing Through a Gate",
    category: "fundamentals",
    ages: ["U6-8", "U9-12", "U13-15"],
    positions: ["DEF", "MID", "FWD", "GK"],
    format: "Pairs",
    players: "2",
    duration: 10,
    intensity: 1,
    area: "12 × 6 m",
    summary:
      "The pass everything is built on. Pairs pass through a small cone gate between them: plant foot pointing at the target, ankle locked, strike through the middle of the ball.",
    setup: ["Pairs 8–12 m apart with a 1.5 m gate halfway.", "One ball per pair."],
    steps: [
      "Pass through the gate to your partner.",
      "Partner controls, sets the ball and passes back.",
      "Count passes through the gate in 60 s. Swap to the weaker foot.",
    ],
    points: [
      "Standing foot beside the ball, toes pointing at your partner.",
      "Ankle locked, toes up. Strike through the middle with the inside of the foot.",
      "Follow through towards the target. Receive with a soft, 'giving' foot.",
    ],
    progressions: [
      "Narrow the gate to 1 m.",
      "Two touches, then one touch.",
      "On the move: see the second variation.",
    ],
    videos: [
      { id: "yk5Gku_Ojas", title: "How to teach: Passing › Inside foot", channel: "Prime Coaching Sport" },
      { id: "YtYPaxm0SoE", title: "Pairs: Passing › Inside foot", channel: "Prime Coaching Sport" },
    ],
    search: "inside foot passing technique kids soccer",
    diagramName: "Through the gate",
    diagram: {
      field: { type: "grid", w: 14, h: 6 },
      cones: [[7, 2.2], [7, 3.8]],
      players: [
        { id: "a1", t: "a", x: 2, y: 3, f: 0 },
        { id: "a2", t: "a", x: 12, y: 3, f: 180 },
      ],
      ball: "a1",
      note: "Pairs facing each other through a gate.",
      frames: [
        { note: "Plant the standing foot beside the ball, toes pointing at your partner." },
        { note: "Strike through the middle with the inside of the foot, ankle locked.", ball: "a2" },
        { note: "Receive with a soft foot, then set it out of your feet.", move: { a2: [11.4, 3.5] } },
        { note: "Pass back through the gate. Count passes in 60 s.", ball: "a1" },
      ],
    },
    variations: [
      {
        name: "On the move",
        summary: "Two gates. After each pass the receiver dribbles across to the other gate while the partner shuffles over to meet them.",
        diagram: {
          field: { type: "grid", w: 14, h: 6 },
          cones: [[7, 0.8], [7, 2.2], [7, 3.8], [7, 5.2]],
          players: [
            { id: "a1", t: "a", x: 2, y: 1.5, f: 0 },
            { id: "a2", t: "a", x: 12, y: 1.5, f: 180 },
          ],
          ball: "a1",
          note: "Two gates.",
          frames: [
            { note: "Pass through the top gate.", ball: "a2" },
            { note: "Receiver dribbles across; partner shuffles over.", move: { a2: [12, 4.5], a1: [2, 4.5] } },
            { note: "Pass back through the bottom gate.", ball: "a1" },
            { note: "Across again.", move: { a1: [2, 1.5], a2: [12, 1.5] } },
            { ball: "a2" },
          ],
        },
      },
    ],
  },
  {
    id: "body-shape-open-up",
    title: "Body Shape: Open Up to Receive",
    category: "fundamentals",
    ages: ["U9-12", "U13-15"],
    positions: ["DEF", "MID", "FWD"],
    format: "Small group",
    players: "3",
    duration: 12,
    intensity: 1,
    area: "24 × 8 m",
    summary:
      "Stand side-on before the ball arrives, so you can see the passer and where you want to go next. The white arrow shows which way the middle player is facing.",
    setup: ["Three in a line, 10 m apart. Middle player works, ends serve. Swap every 90 s."],
    steps: [
      "Middle player opens up before the pass arrives.",
      "Receive with the back foot, letting the ball run across the body.",
      "Pass to the far end in two touches. Then the far end serves.",
    ],
    points: [
      "Hips pointing between the passer and the target, not straight at the passer.",
      "Back foot = the foot furthest from the ball.",
      "Two touches: receive forward, pass. No extra touch to turn.",
    ],
    progressions: [
      "Add a passive defender behind the middle player.",
      "Coach calls 'turn' or 'bounce' as the ball travels.",
      "One-touch pass-through with the back foot.",
    ],
    videos: [
      { id: "pKLYl__cu-8", title: "Body Shape When Receiving", channel: "Coach Javi" },
      { id: "W0knRUN8Hdk", title: "Body Shape Receiving the Ball for Young Footballers", channel: "F90 Football Academy" },
    ],
    search: "open body shape receiving soccer drill",
    diagramName: "Open up",
    diagram: {
      field: { type: "grid", w: 24, h: 8 },
      players: [
        { id: "a1", t: "a", x: 2, y: 4, f: 0 },
        { id: "a2", t: "a", x: 12, y: 4, f: 180 },
        { id: "a3", t: "a", x: 22, y: 4, f: 180 },
      ],
      ball: "a1",
      note: "Three in a line. Watch the middle player's facing arrow.",
      frames: [
        { note: "Open up before the pass: side-on, seeing both ends.", move: { a2: [11.5, 4.4] }, face: { a2: 135 } },
        { note: "Pass in.", ball: "a2" },
        { note: "Receive with the back foot; the ball runs across the body.", move: { a2: [13.8, 4.6] }, face: { a2: 0 } },
        { note: "Play forward. Two touches.", ball: "a3" },
        { note: "Now the other way: open up to the new passer.", reset: true, move: { a2: [12.5, 4.4] }, face: { a2: 45 } },
        { ball: "a2" },
        { note: "Back foot again, across the body.", move: { a2: [10.2, 4.6] }, face: { a2: 180 } },
        { ball: "a1" },
      ],
    },
    variations: [
      {
        name: "Closed (what to avoid)",
        summary: "The same drill with a closed body shape: square-on to the passer. Count the touches it takes to face forward.",
        diagram: {
          field: { type: "grid", w: 24, h: 8 },
          players: [
            { id: "a1", t: "a", x: 2, y: 4, f: 0 },
            { id: "a2", t: "a", x: 12, y: 4, f: 180 },
            { id: "a3", t: "a", x: 22, y: 4, f: 180 },
          ],
          ball: "a1",
          note: "Middle player square-on to the passer.",
          frames: [
            { note: "Closed: facing the passer, back to the target.", ball: "a2" },
            { note: "Has to turn all the way round…", move: { a2: [11, 5.6] }, face: { a2: 90 } },
            { note: "…and again, before finally facing forward.", move: { a2: [13, 4.3] }, face: { a2: 0 } },
            { note: "Three touches and a lot of time. A defender would have arrived.", ball: "a3" },
          ],
        },
      },
    ],
  },
  {
    id: "soccer-bowling",
    title: "Soccer Bowling",
    category: "fundamentals",
    ages: ["U6-8", "U9-12"],
    positions: ["DEF", "MID", "FWD"],
    format: "Team",
    players: "4–12",
    duration: 10,
    intensity: 1,
    area: "16 × 10 m",
    summary:
      "Balls balanced on cones down the middle; teams on each side pass to knock them off. Accuracy and passing weight disguised as a game.",
    setup: ["A row of cones with a ball on top down the middle. Two teams 7–8 m away on each side, a ball each."],
    steps: [
      "Pass (don't shoot) at the targets. Inside of the foot only.",
      "Knock a ball off = 1 point. Collect your ball and go again.",
      "Reset the targets when they're all down.",
    ],
    points: [
      "Plant foot pointing at the target.",
      "Pass along the ground: strike the middle of the ball, not underneath.",
      "Accuracy before power.",
    ],
    progressions: ["Move the lines further back.", "Weaker foot counts double.", "Receive a pass from a teammate first, then shoot at the target."],
    videos: [
      { id: "B3_bheN-PWc", title: "Soccer Bowling U6–U12", channel: "Strike Sports Tasmania" },
    ],
    search: "soccer bowling knock ball off cone passing game",
    diagram: {
      field: { type: "grid", w: 16, h: 10 },
      cones: [[8, 2, "w"], [8, 4, "w"], [8, 6, "w"], [8, 8, "w"]],
      players: [
        { id: "a1", t: "a", x: 1, y: 2 },
        { id: "a2", t: "a", x: 1, y: 5 },
        { id: "a3", t: "a", x: 1, y: 8 },
        { id: "b1", t: "b", x: 15, y: 3.5 },
        { id: "b2", t: "b", x: 15, y: 6.5 },
      ],
      balls: { p1: "a1", p2: "a2", p3: "a3", p4: "b1", p5: "b2", t1: [8, 1.8], t2: [8, 3.8], t3: [8, 5.8], t4: [8, 7.8] },
      note: "Targets down the middle, a team on each side.",
      frames: [
        { note: "Inside-foot pass at a target. Knock it off = 1 point.", balls: { p1: [7.4, 2], t1: [9.6, 1] } },
        { note: "Other team too. Pass, don't blast.", balls: { p4: [8.6, 6], t3: [6.4, 7] } },
        { note: "Missed? Collect your ball and go again.", balls: { p3: [8.8, 9.3] } },
      ],
    },
  },
  {
    id: "line-passing",
    title: "Line Passing: Pass & Follow",
    category: "fundamentals",
    ages: ["U6-8", "U9-12"],
    positions: ["DEF", "MID", "FWD"],
    format: "Small group",
    players: "4–6 per group",
    duration: 10,
    intensity: 1,
    area: "15 × 8 m",
    summary:
      "Two lines facing each other. Pass across and follow your pass to the back of the other line. The simplest way to get lots of passes and moving after the pass.",
    setup: ["Two lines 10–12 m apart. Ball starts with the first player in one line."],
    steps: [
      "Pass to the first player in the other line.",
      "Follow your pass and join the back of that line.",
      "Receiver controls, passes back and follows. Keep it going.",
    ],
    points: [
      "Call the name of the player you're passing to.",
      "Move after you pass. Don't stand and watch.",
      "Receiver: step towards the ball as it comes.",
    ],
    progressions: ["One-touch passes.", "Weaker foot only.", "Add a middle player for a wall pass."],
    videos: [
      { id: "TUd-xDbmGv4", title: "Simple Passing Drills for Soccer (U4–U9)", channel: "Athlete Era" },
    ],
    search: "line passing drill pass and follow beginners soccer",
    diagramName: "Pass & follow",
    diagram: {
      field: { type: "grid", w: 18, h: 8 },
      players: [
        { id: "a1", t: "a", x: 3, y: 4 },
        { id: "a2", t: "a", x: 1.6, y: 4 },
        { id: "a3", t: "a", x: 15, y: 4 },
        { id: "a4", t: "a", x: 16.4, y: 4 },
      ],
      ball: "a1",
      note: "Two lines facing each other.",
      frames: [
        { note: "Pass across, then follow your pass to the other line.", ball: "a3", move: { a1: [17, 5.6], a2: [3, 4] } },
        { note: "Receive, pass back, follow.", ball: "a2", move: { a3: [1, 2.4], a4: [15, 4] } },
        { note: "Keep it going. Call names!", ball: "a4", move: { a2: [17, 2.4], a3: [3, 4] } },
      ],
    },
    variations: [
      {
        name: "Dribble & hand over",
        summary: "For the youngest players: dribble across with small touches and stop the ball with the sole in front of the next player.",
        diagram: {
          field: { type: "grid", w: 18, h: 8 },
          players: [
            { id: "a1", t: "a", x: 3, y: 4 },
            { id: "a2", t: "a", x: 1.6, y: 4 },
            { id: "a3", t: "a", x: 15, y: 4 },
            { id: "a4", t: "a", x: 16.4, y: 4 },
          ],
          ball: "a1",
          note: "Two lines, one ball.",
          frames: [
            { note: "Dribble across with small touches.", move: { a1: [13.4, 4.2] } },
            { note: "Sole stop in front of the next player, then join the back.", ball: "a3", move: { a1: [17, 5.6] } },
            { note: "Now they dribble back the other way.", move: { a3: [4.6, 3.8] } },
          ],
        },
      },
    ],
  },

  /* ─── Footwork & Agility ─────────────────────────────────── */
  {
    id: "agility-ladder-series",
    title: "Agility Ladder Series",
    category: "footwork",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["GK", "DEF", "MID", "FWD"],
    format: "Individual",
    players: "Any (3–4 per ladder)",
    duration: 12,
    intensity: 2,
    area: "Ladder + 5 m",
    summary:
      "Five ladder patterns, from simple to hard. Lime prints are the left foot, white are the right. Quick, light contacts train rhythm, coordination and foot speed. Turn on the trail to see the whole pattern.",
    setup: ["One ladder per 3–4 players. Cone 5 m past the end for the sprint-out."],
    steps: [
      "2 reps of each pattern, walk back recovery.",
      "Learn it slowly first, then speed up. Quality before speed.",
      "Always sprint 5 m out of the ladder.",
    ],
    points: [
      "On the balls of the feet. Heels never touch.",
      "Arms drive in rhythm with the feet.",
      "Eyes up after the first few squares.",
    ],
    progressions: [
      "Finish with a pass or a shot: see Ladder into Ball Work.",
      "Coach points a direction at the end: react and sprint.",
      "Race a partner on a parallel ladder.",
    ],
    videos: [
      { id: "9ZTRUVLjGzI", title: "10 Speed & Agility Ladder Drills: Level 1", channel: "I Know Football" },
      { id: "tMY5Cj39xN8", title: "15 Fast Footwork Exercises: Speed Ladder Drills", channel: "7mlc" },
    ],
    search: "agility ladder drills soccer footwork",
    diagramName: "Two-in",
    diagram: ladder(
      "Two feet in every square, running forward.",
      [0.15, LY],
      [
        ...[0, 1, 2, 3, 4, 5].map((i) => [
          [LX(i), LY],
          [[LX(i) - 0.05, 0.99, "L"], [LX(i) + 0.05, 1.21, "R"]],
          i === 0 ? "Left in, right in: two quick contacts per square." : "Two-in: left, right.",
        ]),
        [[5.7, LY], [], "Sprint out of the ladder."],
      ],
    ),
    variations: [
      {
        name: "One-in",
        summary: "Running through the ladder with one foot in each square. Short, fast, high-knee strides.",
        diagram: ladder(
          "One foot per square.",
          [0.15, LY],
          [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [
            [LX(i), LY],
            [[LX(i), i % 2 ? 1.18 : 1.02, i % 2 ? "R" : "L"]],
            i === 0 ? "One foot per square, knees up." : "Quick, light contacts.",
          ]),
        ),
      },
      {
        name: "Lateral",
        summary: "Side-on to the ladder, moving sideways. Lead foot in, trail foot in, next square. The feet never cross.",
        diagram: ladder(
          "Facing up the screen, moving sideways to the right.",
          [0.15, LY],
          [0, 1, 2, 3, 4, 5].map((i) => [
            [LX(i), LY],
            [[LX(i) + 0.08, LY, "R", UP], [LX(i) - 0.08, LY, "L", UP]],
            i === 0 ? "Right foot leads in, left follows." : "Right, left. Stay low, don't cross the feet.",
          ]),
        ),
      },
      {
        name: "Icky shuffle",
        summary: "In, in, out. Both feet into the square, then one foot out to the side, alternating sides. The pattern that trains quick changes of direction.",
        diagram: ladder("Start beside the ladder, on the left.", [0.3, 0.62], [
          [[LX(0), LY], [[LX(0), 1.18, "R"], [LX(0) + 0.02, 1.02, "L"]], "In: right, then left."],
          [[LX(0) + 0.18, 1.48], [[LX(0) + 0.22, 1.55, "R"]], "Out: right foot steps out to the right."],
          [[LX(1), LY], [[LX(1), 1.02, "L"], [LX(1) + 0.02, 1.18, "R"]], "In: left, then right."],
          [[LX(1) + 0.18, 0.72], [[LX(1) + 0.22, 0.65, "L"]], "Out: left foot steps out to the left."],
          [[LX(2), LY], [[LX(2), 1.18, "R"], [LX(2) + 0.02, 1.02, "L"]], "In, in…"],
          [[LX(2) + 0.18, 1.48], [[LX(2) + 0.22, 1.55, "R"]], "…out."],
          [[LX(3), LY], [[LX(3), 1.02, "L"], [LX(3) + 0.02, 1.18, "R"]], "In, in…"],
          [[LX(3) + 0.18, 0.72], [[LX(3) + 0.22, 0.65, "L"]], "…out. Keep the rhythm: 1-2-3, 1-2-3."],
        ]),
      },
      {
        name: "Hopscotch",
        summary: "One foot in, two feet out. Hop on a single leg into the square, then land with both feet straddling the ladder. Builds balance and ankle stiffness.",
        diagram: ladder(
          "Single-leg hop in, straddle out.",
          [0.15, LY],
          [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
            i % 2 === 0
              ? [[LX(i), LY], [[LX(i), LY, i % 4 === 0 ? "L" : "R"]], `Hop in on the ${i % 4 === 0 ? "left" : "right"} foot.`]
              : [[LX(i), LY], [[LX(i), 0.7, "L"], [LX(i), 1.5, "R"]], "Both feet out, straddling the ladder."],
          ),
        ),
      },
    ],
  },
  {
    id: "ladder-into-ball",
    title: "Ladder into Ball Work",
    category: "footwork",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Small group",
    players: "3–6",
    duration: 15,
    intensity: 3,
    area: "20 × 10 m",
    summary:
      "Fast feet on their own don't win games. Link the ladder straight into a football action: receive and finish, a one-two, or a 1v1.",
    setup: ["Ladder, a server with balls, a mini goal 12 m past the ladder."],
    steps: [
      "Run a ladder pattern.",
      "Server plays in as the player comes out.",
      "Finish the action (shot, one-two or 1v1), then back of the line.",
    ],
    points: [
      "Stay light on the feet through the transition from ladder to ball.",
      "First touch forward into space.",
      "Head up before receiving.",
    ],
    progressions: ["Server varies the pass: ground, bouncing, to either foot.", "Coach calls the ladder pattern as the player starts."],
    videos: [
      { id: "cws1X0AEEkU", title: "Ladder Drills to Improve Ball Control & Agility", channel: "KS Performance" },
      { id: "gf5zr92BBvc", title: "20 Ladder Drills: With & Without the Ball", channel: "Joner Football" },
    ],
    search: "agility ladder into passing finishing drill soccer",
    diagramName: "Ladder & finish",
    diagram: {
      field: { type: "grid", w: 20, h: 10 },
      ladders: [{ x: 1, y: 4.75, len: 4.5 }],
      goals: [{ x: 20, y: 5, dir: "l", size: "mini" }],
      players: [
        { id: "c", t: "c", x: 11, y: 1 },
        { id: "a1", t: "a", x: 0.2, y: 5 },
      ],
      ball: "c",
      note: "Ladder, server, mini goal.",
      frames: [
        { note: "Quick feet through the ladder.", move: { a1: [6.3, 5] } },
        { note: "Server plays in as they come out.", ball: "a1", move: { a1: [8, 5.3] } },
        { note: "First touch forward, attack the space.", move: { a1: [13.5, 6] } },
        { note: "Finish.", ball: [20.3, 5.2], kind: "shot" },
      ],
    },
    variations: [
      {
        name: "Ladder & one-two",
        summary: "Out of the ladder into a one-touch wall pass with the server, sprint onto the return and finish.",
        diagram: {
          field: { type: "grid", w: 20, h: 10 },
          ladders: [{ x: 1, y: 4.75, len: 4.5 }],
          goals: [{ x: 20, y: 5, dir: "l", size: "mini" }],
          players: [
            { id: "c", t: "c", x: 10, y: 2 },
            { id: "a1", t: "a", x: 0.2, y: 5 },
          ],
          ball: "c",
          note: "Server slightly ahead of the ladder.",
          frames: [
            { note: "Quick feet through the ladder.", move: { a1: [6.3, 5] } },
            { note: "Server plays in.", ball: "a1", move: { a1: [7.5, 5] } },
            { note: "One-touch back to the server, then sprint.", ball: "c", move: { a1: [12, 5] } },
            { note: "Server plays through into your path.", ball: "a1", move: { a1: [15, 5.5] } },
            { note: "Finish first time.", ball: [20.3, 4.8], kind: "shot" },
          ],
        },
      },
      {
        name: "Ladder & 1v1",
        summary: "A defender starts on the goal line as the attacker enters the ladder. Footwork, then beat a player.",
        diagram: {
          field: { type: "grid", w: 20, h: 10 },
          ladders: [{ x: 1, y: 4.75, len: 4.5 }],
          goals: [{ x: 20, y: 5, dir: "l", size: "mini" }],
          players: [
            { id: "c", t: "c", x: 11, y: 1 },
            { id: "a1", t: "a", x: 0.2, y: 5 },
            { id: "b1", t: "b", x: 19, y: 5 },
          ],
          ball: "c",
          note: "Defender waits on the goal line.",
          frames: [
            { note: "Ladder. Defender stays on the line.", move: { a1: [6.3, 5] } },
            { note: "Server plays in; defender steps out.", ball: "a1", move: { a1: [8, 5.3], b1: [15, 5] } },
            { note: "Attack the defender.", move: { a1: [11.5, 6.8], b1: [13.5, 5.8] } },
            { note: "Beat them on the outside.", move: { a1: [16, 8.3], b1: [14.2, 6.6] } },
            { note: "Finish.", ball: [20.3, 5.6], kind: "shot" },
          ],
        },
      },
    ],
  },
  {
    id: "fast-feet-closeup",
    title: "Fast Feet: Close-Up Technique",
    category: "footwork",
    ages: ["U6-8", "U9-12", "U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Individual",
    players: "Any",
    duration: 10,
    intensity: 2,
    area: "Personal space",
    summary:
      "Zoomed in to the ball and both feet: toe taps, foundations, sole rolls and pull–pushes step by step. Lime prints are the left foot, white the right. Great homework for any age.",
    setup: ["One ball per player. 30 s on, 15 s off per move."],
    steps: [
      "Learn each move slowly, looking at the ball.",
      "Then speed up while looking up.",
      "Finish with 3 × 30 s of your favourite move at full speed.",
    ],
    points: [
      "Stay on the balls of the feet with small hops.",
      "Touch the ball lightly: it should barely move.",
      "Arms relaxed, knees bent.",
    ],
    progressions: [
      "Combine moves: 4 toe taps + 2 foundations + 1 sole roll.",
      "Do it moving forward across the grid.",
      "Coach flashes fingers: shout the number while working.",
    ],
    videos: [
      { id: "SoijY4BUCtw", title: "Fast Feet Beginner Soccer Drills", channel: "Fast Feet Home Soccer Workouts" },
      { id: "nHxClhfQjlM", title: "Get Faster Feet in 10 Minutes", channel: "AllAttack" },
    ],
    search: "fast feet ball mastery toe taps foundations",
    diagramName: "Toe taps",
    diagram: closeUp(
      "Standing behind the ball.",
      [0.8, 0.55],
      [[0.64, 0.95, "L", UP], [0.96, 0.95, "R", UP]],
      [
        [null, [[0.64, 0.95, "L", UP], [0.8, 0.46, "R", UP]], "Right sole taps the top of the ball."],
        [null, [[0.8, 0.46, "L", UP], [0.96, 0.95, "R", UP]], "Switch: left sole on top, right foot back down."],
        [null, [[0.64, 0.95, "L", UP], [0.8, 0.46, "R", UP]], "Right…"],
        [null, [[0.8, 0.46, "L", UP], [0.96, 0.95, "R", UP]], "…left. Quick and light, on the balls of the feet."],
      ],
    ),
    variations: [
      {
        name: "Foundations",
        summary: "Inside–inside: tap the ball between the insides of both feet with small hops.",
        diagram: closeUp(
          "Ball between the feet.",
          [0.8, 0.6],
          [[0.55, 0.62, "L", UP], [1.05, 0.62, "R", UP]],
          [
            [[0.92, 0.6], [[0.64, 0.62, "L", UP], [1.07, 0.64, "R", UP]], "Inside of the left foot taps it across."],
            [[0.68, 0.6], [[0.53, 0.64, "L", UP], [0.96, 0.62, "R", UP]], "Inside of the right taps it back."],
            [[0.92, 0.6], [[0.64, 0.62, "L", UP], [1.07, 0.64, "R", UP]], "Left…"],
            [[0.68, 0.6], [[0.53, 0.64, "L", UP], [0.96, 0.62, "R", UP]], "…right. The ball never leaves the space between your feet."],
          ],
        ),
      },
      {
        name: "Sole rolls",
        summary: "Roll the ball across the body with the sole, then back with the other sole. Step with the ball.",
        diagram: closeUp(
          "Ball in front.",
          [0.8, 0.55],
          [[0.62, 0.92, "L", UP], [0.98, 0.92, "R", UP]],
          [
            [[0.45, 0.55], [[0.3, 0.88, "L", UP], [0.5, 0.47, "R", UP]], "Right sole rolls it across to the left."],
            [[1.15, 0.55], [[1.12, 0.47, "L", UP], [1.32, 0.88, "R", UP]], "Left sole rolls it back to the right."],
            [[0.45, 0.55], [[0.3, 0.88, "L", UP], [0.5, 0.47, "R", UP]], "Step with the ball each time."],
          ],
        ),
      },
      {
        name: "Pull–push",
        summary: "Pull back with the sole, then push out at 45° with the inside of the same foot. Alternate feet.",
        diagram: closeUp(
          "Ball in front.",
          [0.8, 0.5],
          [[0.64, 0.95, "L", UP], [0.96, 0.95, "R", UP]],
          [
            [[0.8, 0.75], [[0.64, 0.95, "L", UP], [0.82, 0.66, "R", UP]], "Right sole pulls it back."],
            [[1.12, 0.42], [[0.64, 0.95, "L", UP], [1.0, 0.62, "R", -60]], "Push it out at 45° with the inside of the right."],
            [[0.8, 0.75], [[0.78, 0.66, "L", UP], [0.98, 0.95, "R", UP]], "Left sole pulls it back to the middle."],
            [[0.48, 0.42], [[0.6, 0.62, "L", -120], [0.98, 0.95, "R", UP]], "Push out at 45° with the left."],
          ],
        ),
      },
    ],
  },
  {
    id: "colour-reaction",
    title: "Colour Reaction Star",
    category: "footwork",
    ages: ["U6-8", "U9-12", "U13-15", "U16+"],
    positions: ["GK", "DEF", "MID", "FWD"],
    format: "Individual",
    players: "1–2 per star",
    duration: 10,
    intensity: 3,
    area: "10 × 10 m",
    summary:
      "Four coloured cones around a centre point. The coach calls a colour; the player reacts, sprints to it and recovers to the middle. Trains first-step quickness and reacting to a call, with or without the ball.",
    setup: ["Four coloured cones 4–5 m from a centre cone. Coach where the player can hear (or see) them."],
    steps: [
      "Player jogs on the spot in the middle.",
      "Coach calls a colour: sprint, touch the cone, backpedal or shuffle back to the middle.",
      "6–8 calls per set, 3 sets. Full recovery between sets.",
    ],
    points: [
      "Low, ready stance: weight on the balls of the feet.",
      "First step in the direction of the call. No false step backwards.",
      "Decelerate under control before the cone.",
    ],
    progressions: [
      "Coach holds up a coloured bib instead of calling, so players have to look.",
      "Two colours at once: go to both in order.",
      "With the ball: see the variation.",
    ],
    videos: [
      { id: "Hthsp7fWtE0", title: "Colored Cones Cognitive Reaction Drill", channel: "Instant Speed" },
    ],
    search: "colored cones reaction agility drill soccer",
    diagramName: "Without the ball",
    diagram: {
      field: { type: "grid", w: 12, h: 12, bare: true },
      cones: [[6, 1.2, "r"], [10.8, 6, "b"], [6, 10.8, "y"], [1.2, 6, "w"]],
      players: [
        { id: "c", t: "c", x: 11, y: 11 },
        { id: "a1", t: "a", x: 6, y: 6 },
      ],
      note: "Four colours around the centre.",
      frames: [
        { note: "Coach calls a colour. First step towards it!", call: { id: "c", text: "BLUE!", color: "b" }, move: { a1: [10, 6] } },
        { note: "Back to the middle.", move: { a1: [6, 6] } },
        { call: { id: "c", text: "RED!", color: "r" }, move: { a1: [6, 2] }, note: "React and go." },
        { move: { a1: [6, 6] }, note: "Back to the middle." },
        { call: { id: "c", text: "YELLOW!", color: "y" }, move: { a1: [6, 10] }, note: "React and go." },
        { move: { a1: [6, 6] }, note: "Back to the middle." },
      ],
    },
    variations: [
      {
        name: "With the ball",
        summary: "Same calls, but dribble to the colour, turn at the cone and dribble back.",
        diagram: {
          field: { type: "grid", w: 12, h: 12, bare: true },
          cones: [[6, 1.2, "r"], [10.8, 6, "b"], [6, 10.8, "y"], [1.2, 6, "w"]],
          players: [
            { id: "c", t: "c", x: 11, y: 11 },
            { id: "a1", t: "a", x: 6, y: 6 },
          ],
          ball: "a1",
          note: "Ball at your feet in the middle.",
          frames: [
            { call: { id: "c", text: "WHITE!" }, move: { a1: [2.2, 6] }, note: "Dribble to the colour." },
            { move: { a1: [6, 6] }, note: "Turn at the cone and back." },
            { call: { id: "c", text: "BLUE!", color: "b" }, move: { a1: [9.8, 6] }, note: "React." },
            { move: { a1: [6, 6] }, note: "Turn and back." },
          ],
        },
      },
    ],
  },

  /* ─── Passing Patterns ───────────────────────────────────── */
  {
    id: "passing-star",
    title: "Passing Star",
    category: "patterns",
    ages: ["U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Small group",
    players: "6–8",
    duration: 12,
    intensity: 2,
    area: "22 × 22 m",
    summary:
      "Five cones in a circle, passing across the middle to every second cone so the ball draws a five-pointed star. Everyone follows their pass. Simple to set up, hard to keep going without concentrating.",
    setup: ["Five cones on a circle about 20 m across. One player per cone, two at the start."],
    steps: [
      "Pass to the cone two along (skip one).",
      "Follow your pass to that cone.",
      "Receiver takes a directional touch towards the next target and plays on.",
    ],
    points: [
      "Know your target before the ball arrives.",
      "Open your body to where the ball is going next.",
      "Pace of pass: firm enough that the rhythm never stops.",
    ],
    progressions: [
      "Add a second ball from the opposite cone.",
      "Coach calls 'reverse' and the direction changes.",
      "One-touch only.",
    ],
    videos: [
      { id: "I42b7aYo9Cg", title: "5–6 Players Passing Drill: 3 Variations", channel: "AD Football Training" },
    ],
    search: "passing star drill soccer 5 cones",
    diagramName: "Star",
    diagram: {
      field: { type: "grid", w: 24, h: 22, bare: true },
      cones: STAR,
      players: starPlayers(),
      ball: "s1",
      note: "Five cones. Pass to every second cone.",
      frames: [
        { note: "Skip a cone: pass across the middle, then follow.", ball: "s3", move: { s1: STAR_ARRIVE[2] } },
        { ball: "s5", move: { s3: STAR_ARRIVE[4] }, note: "Directional touch, pass, follow." },
        { ball: "s2", move: { s5: STAR_ARRIVE[1] }, note: "Everyone must know where the ball goes next." },
        { ball: "s4", move: { s2: STAR_ARRIVE[3] } },
        { ball: "s6", move: { s4: STAR_ARRIVE[0] }, note: "Back to the top: the ball has drawn a star." },
      ],
    },
    variations: [
      {
        name: "Pentagon",
        summary: "The warm-up version: pass to the next cone around the outside and follow. Learn the rhythm, then switch to the star.",
        diagram: {
          field: { type: "grid", w: 24, h: 22, bare: true },
          cones: STAR,
          players: starPlayers(),
          ball: "s1",
          note: "Pass to the next cone around.",
          frames: [
            { ball: "s2", move: { s1: STAR_ARRIVE[1] }, note: "Pass to the next cone and follow." },
            { ball: "s3", move: { s2: STAR_ARRIVE[2] } },
            { ball: "s4", move: { s3: STAR_ARRIVE[3] } },
            { ball: "s5", move: { s4: STAR_ARRIVE[4] } },
            { ball: "s6", move: { s5: STAR_ARRIVE[0] }, note: "Round the pentagon and back to the start." },
          ],
        },
      },
    ],
  },
  {
    id: "w-passing",
    title: "W Passing Pattern",
    category: "patterns",
    ages: ["U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Small group",
    players: "6–8",
    duration: 15,
    intensity: 2,
    area: "24 × 24 m",
    summary:
      "Five cones in a W. The ball zig-zags from one top corner to the other with a set-back in the middle and a switch across the bottom, then everyone rotates one cone along.",
    setup: ["Cones in a W. One player per cone plus one waiting at the start."],
    steps: [
      "Down to the first low cone, up to the middle.",
      "Middle sets it back, then the low player switches across the bottom.",
      "Up to the far top cone. Everyone moves one cone along the W.",
    ],
    points: [
      "Check away, then check to the ball, every time.",
      "Set passes are firm and to the front foot.",
      "Remember your next cone before the rotation.",
    ],
    progressions: ["Middle player must receive on the half-turn and play forward instead of setting.", "Add a defender at the middle cone."],
    videos: [
      { id: "3KPh8U416kE", title: "W Passing Drill: Continuous Passing & Combinations", channel: "KS Performance" },
    ],
    search: "W passing drill soccer",
    diagram: {
      field: { type: "grid", w: 24, h: 24, bare: true },
      cones: [[3, 4], [7, 20], [12, 8], [17, 20], [21, 4]],
      players: [
        { id: "w1", t: "a", x: 3, y: 4 },
        { id: "w2", t: "a", x: 7, y: 20 },
        { id: "w3", t: "a", x: 12, y: 8 },
        { id: "w4", t: "a", x: 17, y: 20 },
        { id: "w5", t: "a", x: 21, y: 4 },
        { id: "w6", t: "a", x: 1.6, y: 2.6 },
      ],
      ball: "w1",
      note: "Five cones in a W.",
      frames: [
        { note: "Down to the first low cone, who checks in.", ball: "w2", move: { w2: [7, 17.5] } },
        { note: "Up to the middle.", ball: "w3", move: { w3: [12, 10.5] } },
        { note: "Middle sets it back to the player stepping in.", ball: "w2", move: { w2: [8.5, 15.5] } },
        { note: "Switch across the bottom. Middle spins away.", ball: "w4", move: { w4: [16, 17.5], w3: [14, 7] } },
        { note: "Up to the far top cone.", ball: "w5", move: { w5: [20, 6.5] } },
        {
          note: "Rotate one cone along the W; the next ball starts.",
          reset: true,
          ball: "w6",
          move: { w1: [7, 20], w2: [12, 8], w3: [17, 20], w4: [21, 4], w5: [1.6, 2.6], w6: [3, 4] },
        },
      ],
    },
  },
  {
    id: "box-rotation",
    title: "Passing Square: Set & Switch",
    category: "patterns",
    ages: ["U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Small group",
    players: "6–8",
    duration: 15,
    intensity: 2,
    area: "22 × 22 m",
    summary:
      "Four corners and a middle player. Into the middle, set, switch across the top, down the line, across the bottom. Then everyone follows their pass one station on, so every player learns every role.",
    setup: ["A 20 m square with a player on each corner, one in the middle, one waiting at the start corner."],
    steps: [
      "A plays into the middle; the middle sets first time to B.",
      "B switches across the top to C; C plays down the line to D.",
      "D plays across to the next A. Everyone follows their pass one station.",
    ],
    points: [
      "Middle player: check away, then show on the half-turn.",
      "Receivers step inside to shorten the pass.",
      "Say the name, then pass. Communication keeps it flowing.",
    ],
    progressions: ["Two balls from opposite corners.", "Middle player turns and plays forward when the coach calls 'turn'.", "Overlap variation below."],
    videos: [
      { id: "jmznvOYRHGw", title: "3 Easy Square Passing Combinations", channel: "Onside - Training" },
      { id: "CCW9Rvypvv4", title: "Overlap Passing Drill", channel: "Onside - Training" },
    ],
    search: "passing square drill rotation soccer",
    diagramName: "Set & switch",
    diagram: {
      field: { type: "grid", w: 22, h: 22 },
      players: [
        { id: "a1", t: "a", x: 2, y: 20, n: "A" },
        { id: "a2", t: "a", x: 11, y: 11, n: "M" },
        { id: "a3", t: "a", x: 2, y: 2, n: "B" },
        { id: "a4", t: "a", x: 20, y: 2, n: "C" },
        { id: "a5", t: "a", x: 20, y: 20, n: "D" },
        { id: "a6", t: "a", x: 0.6, y: 21.4 },
      ],
      ball: "a1",
      note: "Four corners, a middle player.",
      frames: [
        { note: "A plays into the middle, who checks to the ball.", ball: "a2", move: { a2: [9, 13] } },
        { note: "Middle sets first time to B, who steps inside.", ball: "a3", move: { a3: [3.5, 5] } },
        { note: "B switches it across the top.", ball: "a4", move: { a4: [18.5, 3.5] } },
        { note: "C plays down the line to D.", ball: "a5", move: { a5: [19, 17] } },
        { note: "D plays across the bottom to the next player.", ball: "a6", move: { a6: [2, 20] } },
        {
          note: "Rotate: everyone follows their pass one station on.",
          reset: true,
          move: { a1: [11, 11], a2: [2, 2], a3: [20, 2], a4: [20, 20], a5: [0.6, 21.4] },
        },
      ],
    },
    variations: [
      {
        name: "Overlap",
        summary: "A plays up the line, B drives inside and A overlaps round the outside to receive and switch.",
        diagram: {
          field: { type: "grid", w: 22, h: 22 },
          players: [
            { id: "a1", t: "a", x: 2, y: 20, n: "A" },
            { id: "a3", t: "a", x: 2, y: 2, n: "B" },
            { id: "a4", t: "a", x: 20, y: 2, n: "C" },
            { id: "a5", t: "a", x: 20, y: 20, n: "D" },
          ],
          ball: "a1",
          note: "Four corners, no middle.",
          frames: [
            { note: "A plays up the line to B, who checks down.", ball: "a3", move: { a3: [2.5, 7] } },
            { note: "B drives inside; A overlaps round the outside.", move: { a3: [6, 5.5], a1: [1, 6] } },
            { note: "B releases the overlap.", ball: "a1", move: { a1: [5, 1.2] } },
            { note: "A plays across to C, and the pattern repeats on the next side.", ball: "a4" },
          ],
        },
      },
    ],
  },
  {
    id: "colour-call-square",
    title: "Colour-Call Passing Square",
    category: "patterns",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Small group",
    players: "5–6",
    duration: 12,
    intensity: 2,
    area: "20 × 20 m",
    summary:
      "Corner players on coloured cones feed a middle player. As each pass travels, the coach calls a colour and the middle player must turn and find it. Decision-making, scanning and body shape all at once.",
    setup: ["Square with a different coloured cone on each corner. One player per corner, one in the middle. Coach outside."],
    steps: [
      "A corner plays into the middle.",
      "While the ball travels, the coach calls a colour.",
      "Middle player receives, turns and passes to that colour. That corner plays the next ball in.",
    ],
    points: [
      "Open body shape so you can turn either way.",
      "Scan to know where every colour is before the ball arrives.",
      "Receive with the back foot and play in two touches.",
    ],
    progressions: [
      "Coach holds up a coloured bib instead of calling: the middle must look.",
      "Called colour = don't pass there (opposite logic).",
      "Two middle players, and the call includes a number: 'Blue, one!'",
    ],
    videos: [
      { id: "jiUVWk0E8_8", title: "Quick soccer drills: Colour calls (ages 5–12)", channel: "Prime Coaching Sport" },
      { id: "OXXKkwBkpEQ", title: "Target Passing with Scanning", channel: "ADVANCE.FOOTBALL" },
    ],
    search: "colour call passing drill soccer scanning",
    diagram: {
      field: { type: "grid", w: 20, h: 20, corners: false },
      cones: [[0.4, 0.4, "r"], [19.6, 0.4, "b"], [19.6, 19.6, "y"], [0.4, 19.6, "w"]],
      players: [
        { id: "c", t: "c", x: 10, y: 19.2 },
        { id: "a1", t: "a", x: 1.8, y: 1.8 },
        { id: "a2", t: "a", x: 18.2, y: 1.8 },
        { id: "a3", t: "a", x: 18.2, y: 18.2 },
        { id: "a4", t: "a", x: 1.8, y: 18.2 },
        { id: "a5", t: "a", x: 10, y: 10, f: 225 },
      ],
      ball: "a1",
      note: "Red, blue, yellow and white corners. Middle faces the ball.",
      frames: [
        { note: "Red plays in. The coach calls a colour as it travels.", ball: "a5", move: { a5: [8.8, 8.8] }, call: { id: "c", text: "YELLOW!", color: "y" } },
        { note: "Open up and turn towards yellow.", move: { a5: [10.2, 10.2] }, face: { a5: 45 } },
        { note: "Play to yellow.", ball: "a3" },
        { note: "Yellow plays back in. New call.", ball: "a5", move: { a5: [11.2, 11.2] }, call: { id: "c", text: "WHITE!" } },
        { note: "Half-turn to white.", move: { a5: [9.8, 12] }, face: { a5: 142 } },
        { note: "Play to white.", ball: "a4" },
      ],
    },
  },
  {
    id: "numbered-sequence",
    title: "Numbered Sequence Passing",
    category: "patterns",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD", "GK"],
    format: "Team",
    players: "8–12",
    duration: 12,
    intensity: 2,
    area: "25 × 25 m",
    summary:
      "Players numbered 1–8 move freely around the area and pass in order: 1 → 2 → 3… → 8 → 1. Everyone has to track two teammates while moving. Add a second ball and it becomes a real concentration test.",
    setup: ["Number the players. Everyone keeps moving inside the area. One ball to start."],
    steps: [
      "Pass in number order; after 8, back to 1.",
      "Always move after you pass. Find space to receive.",
      "When it flows, add a second ball: odds and evens.",
    ],
    points: [
      "Know where your passer and your receiver are at all times.",
      "Receive side-on, already facing your next target.",
      "Call your number when you want the ball.",
    ],
    progressions: ["Reverse the order on the coach's call.", "Add 2 defenders who try to intercept.", "One-touch passes."],
    videos: [
      { id: "NnzVIBSrZoc", title: "Soccer Passing Drills (Numbers Passing)", channel: "Coaches College" },
    ],
    search: "numbered passing sequence drill soccer",
    diagramName: "One ball",
    diagram: {
      field: { type: "grid", w: 25, h: 25 },
      players: numbered(),
      ball: "p1",
      note: "Numbered players moving freely.",
      frames: [
        { note: "1 → 2. Everyone keeps moving.", ball: "p2", move: { p2: [13, 5], p7: [6, 16], p5: [16, 19] } },
        { note: "2 → 3.", ball: "p3", move: { p3: [19, 8], p1: [8, 8], p8: [14, 14] } },
        { note: "3 → 4. Know who you get it from and who you give it to.", ball: "p4", move: { p4: [21, 12], p6: [9, 17] } },
        { note: "4 → 5.", ball: "p5", move: { p5: [17, 18], p2: [11, 4] } },
        { note: "5 → 6.", ball: "p6", move: { p6: [10, 18], p3: [21, 5] } },
        { note: "6 → 7.", ball: "p7", move: { p7: [6, 13], p4: [19, 15] } },
        { note: "7 → 8.", ball: "p8", move: { p8: [13, 11], p5: [15, 21] } },
        { note: "8 → 1, and round again.", ball: "p1", move: { p1: [7, 6] } },
      ],
    },
    variations: [
      {
        name: "Odds & evens",
        summary: "Two balls at once. Odds pass 1 → 3 → 5 → 7 and evens pass 2 → 4 → 6 → 8. Don't let the balls meet.",
        diagram: {
          field: { type: "grid", w: 25, h: 25 },
          players: numbered(),
          balls: { b1: "p1", b2: "p2" },
          note: "Two balls: one for odds, one for evens.",
          frames: [
            { note: "1 → 3 and 2 → 4, at the same time.", balls: { b1: "p3", b2: "p4" }, move: { p3: [19, 8], p4: [21, 12], p6: [9, 18] } },
            { note: "3 → 5 and 4 → 6.", balls: { b1: "p5", b2: "p6" }, move: { p5: [17, 18], p6: [10, 17], p1: [7, 7] } },
            { note: "5 → 7 and 6 → 8.", balls: { b1: "p7", b2: "p8" }, move: { p7: [6, 13], p8: [13, 11], p2: [12, 5] } },
            { note: "7 → 1 and 8 → 2. Keep your head up.", balls: { b1: "p1", b2: "p2" }, move: { p1: [8, 8] } },
          ],
        },
      },
    ],
  },
  {
    id: "scanning-gates",
    title: "Shoulder-Check Scanning",
    category: "patterns",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["MID", "DEF", "FWD"],
    format: "Small group",
    players: "3 + coach",
    duration: 12,
    intensity: 2,
    area: "24 × 16 m",
    summary:
      "The middle player has their back to three coloured gates. Before each pass they must check over the shoulder to see which colour the coach is showing, then receive, turn and play through that gate. No scan, no right answer.",
    setup: ["Server with balls, middle player facing them, three coloured gates behind the middle player, coach behind the gates."],
    steps: [
      "Coach holds up a colour behind the player.",
      "Player checks the shoulder, then faces the server as the ball is played.",
      "Receive, turn and pass through the gate that matches the colour.",
    ],
    points: [
      "Scan early and often: once before the pass, once as it travels.",
      "Quick glance, eyes back on the ball.",
      "Turn on the side of the gate you're playing through.",
    ],
    progressions: [
      "Coach changes the colour while the ball is travelling.",
      "Add a passive defender who blocks one gate.",
      "Coach shows fingers: that many touches allowed.",
    ],
    videos: [
      { id: "A7YR73ALZ1s", title: "Scanning Drill for Teams: Check Your Shoulder", channel: "KS Performance" },
    ],
    search: "scanning drill soccer shoulder check colours",
    diagram: {
      field: { type: "grid", w: 24, h: 16 },
      cones: [
        [20, 2.2, "r"], [20, 3.8, "r"],
        [21, 7.2, "b"], [21, 8.8, "b"],
        [20, 12.2, "y"], [20, 13.8, "y"],
      ],
      players: [
        { id: "c1", t: "c", x: 2, y: 8 },
        { id: "c2", t: "c", x: 23, y: 8 },
        { id: "a1", t: "a", x: 10, y: 8, f: 180 },
      ],
      balls: { b1: "c1", b2: [1.2, 9.4] },
      note: "Back to the gates, facing the server.",
      frames: [
        { note: "Shoulder check: which colour is the coach showing?", face: { a1: 15 }, call: { id: "c2", text: "BLUE", color: "b" } },
        { note: "Eyes back to the ball as it's played in.", face: { a1: 180 }, balls: { b1: "a1" }, move: { a1: [9.3, 8] } },
        { note: "Receive on the half-turn and turn away.", move: { a1: [12, 8.3] }, face: { a1: 0 } },
        { note: "Through the blue gate.", balls: { b1: [22.8, 8] } },
        { note: "Reset. Next ball.", reset: true, move: { a1: [10, 8] }, face: { a1: 180 } },
        { note: "Check again: a new colour.", face: { a1: 345 }, call: { id: "c2", text: "YELLOW", color: "y" } },
        { note: "Face the ball.", face: { a1: 180 }, balls: { b2: "a1" }, move: { a1: [9.3, 8] } },
        { note: "Turn towards yellow.", move: { a1: [12, 9.6] }, face: { a1: 45 } },
        { note: "Through the yellow gate.", balls: { b2: [22.4, 13.2] } },
      ],
    },
  },

  /* ─── Possession & Positional Play ───────────────────────── */
  {
    id: "positional-6v3",
    title: "6v3 Up, Back, Through",
    category: "possession",
    ages: ["U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Team",
    players: "9",
    duration: 18,
    intensity: 3,
    area: "24 × 20 m",
    summary:
      "Four players on the edges, two pivots inside, three defenders. The ball goes up into a pivot, back to a player facing forward, then through to the far side. The rhythm of positional play.",
    setup: ["Four attackers on the sides, two inside, three defenders. Attackers on the edges stay on their line."],
    steps: [
      "Keep possession. A completed up–back–through sequence = 1 point.",
      "Pivots must receive between the defenders.",
      "Defender wins it → swap with the player who lost it.",
    ],
    points: [
      "Pivots: stay between the defenders' lines, not level with them.",
      "Edge players: move along the line to open the passing angle.",
      "The 'back' pass must go to someone facing forward.",
    ],
    progressions: ["Pivots limited to one touch.", "Add a fourth defender (6v4).", "Point only if the 'through' pass splits two defenders."],
    videos: [
      { id: "-5nQMKW79Ug", title: "Tactical Rondo: 6v3 Up-Back-Through Possession", channel: "Formation Football" },
      { id: "yACiOKz4yNY", title: "Atletico Madrid 6v3 Pentagon Rondo", channel: "Modern Soccer Coach" },
    ],
    search: "6v3 positional rondo up back through",
    diagram: {
      field: { type: "grid", w: 24, h: 20 },
      players: [
        { id: "a1", t: "a", x: 12, y: 19.7 },
        { id: "a2", t: "a", x: 0.3, y: 10 },
        { id: "a3", t: "a", x: 23.7, y: 10 },
        { id: "a4", t: "a", x: 12, y: 0.3 },
        { id: "a5", t: "a", x: 8, y: 12 },
        { id: "a6", t: "a", x: 16, y: 8 },
        { id: "b1", t: "b", x: 12, y: 14.5 },
        { id: "b2", t: "b", x: 8, y: 6 },
        { id: "b3", t: "b", x: 16, y: 12 },
      ],
      ball: "a1",
      note: "Four on the edges, two pivots inside.",
      frames: [
        { note: "UP: into a pivot between the defenders.", ball: "a5", move: { a5: [9, 14], b1: [10.5, 15.2] } },
        { note: "BACK: pivot sets to a player facing forward.", ball: "a2", move: { a2: [0.3, 11], b2: [3.5, 12.5] } },
        { note: "THROUGH: play to the far side.", ball: "a4", move: { a4: [11, 0.3] } },
        { note: "Up again: into the other pivot.", ball: "a6", move: { a6: [14.5, 6], b3: [15.5, 9] } },
        { note: "Back…", ball: "a3", move: { a3: [23.7, 9] } },
        { note: "…and through.", ball: "a1" },
      ],
    },
  },
  {
    id: "three-team-rondo",
    title: "Three-Team Transition Rondo",
    category: "possession",
    ages: ["U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Team",
    players: "6 (3 pairs)",
    duration: 15,
    intensity: 3,
    area: "20 × 20 m",
    summary:
      "Three pairs: two keep the ball 4v2, one defends. Whoever loses it defends immediately, so players must switch between attacking and defending in an instant. Watch the colours change.",
    setup: ["Three teams of two, in different bibs. Two teams on the edges, one in the middle."],
    steps: [
      "Edge players keep possession, two touches.",
      "The pair whose player gives the ball away go into the middle straight away.",
      "The pair that won it take their places on the edges.",
    ],
    points: [
      "Transition in one second: no complaining, just defend.",
      "Defenders: one presses, one cuts the split pass.",
      "Attackers: keep the square big.",
    ],
    progressions: ["Add a neutral pivot in the middle.", "Winners must complete 3 passes before the swap counts."],
    videos: [
      { id: "Ne7Qq6Q51wk", title: "High Intensity 3 Team 4v2 (Nagelsmann)", channel: "Football Focus" },
      { id: "1eZDV06MC2k", title: "3 Team Transition Rondo", channel: "Formation Football" },
    ],
    search: "three team transition rondo 4v2",
    diagram: {
      field: { type: "grid", w: 20, h: 20 },
      players: [
        { id: "a1", t: "a", x: 10, y: 0.3 },
        { id: "n1", t: "n", x: 19.7, y: 10 },
        { id: "a2", t: "a", x: 10, y: 19.7 },
        { id: "n2", t: "n", x: 0.3, y: 10 },
        { id: "b1", t: "b", x: 8, y: 9 },
        { id: "b2", t: "b", x: 12, y: 11 },
      ],
      ball: "a1",
      note: "Lime and blue keep it; orange defends.",
      frames: [
        { note: "4v2 keep-away.", ball: "n1", move: { b1: [13, 7], b2: [11, 11] } },
        { note: "Keep it moving.", ball: "a2", move: { b1: [14, 12], b2: [9, 14] } },
        { note: "Orange intercepts a lime pass!", ball: "b2", move: { b2: [6.5, 13] } },
        {
          note: "Transition: lime now defends, orange takes the edges.",
          team: { a1: "b", a2: "b", b1: "a", b2: "a" },
          move: { b2: [10, 19.7], b1: [10, 0.3], a1: [9, 8], a2: [11, 12] },
        },
        { note: "New 4v2 straight away.", ball: "n2", move: { a2: [4, 12] } },
      ],
    },
  },
];
