/*
 * More ball mastery: sole work, one-foot touches, moves and running with the ball.
 * Same diagram format as drills-extra.js. Lime prints = left foot, white = right.
 */

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
const STANCE = [[0.64, 0.95, "L", UP], [0.96, 0.95, "R", UP]];

// A single-lane "beat the cone" layout used by the moves drill and its variations.
const coneLane = (note, frames) => ({
  field: { type: "grid", w: 14, h: 6 },
  cones: [[7, 3, "w"]],
  players: [{ id: "a1", t: "a", x: 1, y: 3 }],
  ball: "a1",
  note,
  frames: frames.map(([pos, text]) => ({ move: { a1: pos }, note: text })),
});

export const MASTERY_DRILLS = [
  {
    id: "figure-eight-dribble",
    title: "Figure-8 Dribble",
    category: "ball-mastery",
    ages: ["U6-8", "U9-12", "U13-15"],
    positions: ["DEF", "MID", "FWD"],
    format: "Individual",
    players: "Any (1 per pair of cones)",
    duration: 8,
    intensity: 2,
    area: "8 × 4 m each",
    summary:
      "Two cones, one ball, a figure of eight. The constant curve forces players to use the inside and outside of both feet and to keep the ball close as they change direction.",
    setup: ["Two cones 4 m apart per player. Start in the middle between them."],
    steps: [
      "Dribble a figure of eight round the cones for 45 s.",
      "Round one: inside of the foot only. Round two: outside only.",
      "Round three: sole rolls round each cone. Then reverse direction.",
    ],
    points: [
      "Use the foot nearest the cone to turn round it.",
      "Tiny touches on the turn, a slightly bigger one across the middle.",
      "Head up in the middle to check the next cone.",
    ],
    progressions: [
      "Count the laps in 45 s.",
      "Weaker foot only.",
      "Race a partner doing the same figure of eight next to you.",
    ],
    videos: [
      { id: "_gOORygHlLE", title: "The Figure 8 Soccer Drill", channel: "SOCCSTER" },
      { id: "vnngDOCy9C8", title: "6 Simple Cone Weave Dribbling Drills for Beginners", channel: "Kreider Academy" },
    ],
    search: "figure 8 dribbling drill soccer cones",
    diagram: {
      field: { type: "grid", w: 8, h: 4, bare: true },
      cones: [[2, 2], [6, 2]],
      players: [{ id: "a1", t: "a", x: 4, y: 2 }],
      ball: "a1",
      note: "Two cones, start in the middle.",
      frames: [
        { note: "Across the middle towards the right cone.", move: { a1: [6, 0.9] } },
        { note: "Round the cone with the outside of the right foot.", move: { a1: [7.1, 2] } },
        { move: { a1: [6, 3.1] } },
        { note: "Back across the middle: that's the cross of the 8.", move: { a1: [2, 0.9] } },
        { note: "Round the left cone with the outside of the left foot.", move: { a1: [0.9, 2] } },
        { move: { a1: [2, 3.1] } },
        { note: "And back to the middle.", move: { a1: [4, 2] } },
      ],
    },
  },
  {
    id: "sole-roll-combos",
    title: "Sole Roll Combos: Roll-Stop, Croqueta, L-Drag",
    category: "ball-mastery",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Individual",
    players: "Any",
    duration: 10,
    intensity: 1,
    area: "Personal space",
    summary:
      "Three sole-based moves, close up. The sole lets you move the ball sideways and backwards without losing sight of the pitch. These moves are how good players escape pressure in tight spaces.",
    setup: ["One ball each. 30 s per move, 15 s rest. Learn slowly, then speed up."],
    steps: [
      "Roll-stop: roll across the body with one sole, stop it with the other.",
      "La Croqueta: tap from the inside of one foot to the inside of the other in one quick motion.",
      "L-drag: pull back with the sole, then push it behind the standing leg with the inside of the same foot.",
    ],
    points: [
      "Light contact with the sole; roll the ball, don't stamp on it.",
      "Step with the ball so it stays under your body.",
      "Eyes up as soon as you know the move.",
    ],
    progressions: [
      "Chain them: roll-stop, croqueta, L-drag, repeat.",
      "Do each move while travelling across the grid.",
      "Use them to beat a passive defender.",
    ],
    videos: [
      { id: "Wq-hhEUO4eM", title: "La Croqueta Tutorial", channel: "AllAttack" },
      { id: "rkerCiTxrHY", title: "5 L Drag Mastery Skills", channel: "7mlc" },
    ],
    search: "sole roll combinations ball mastery la croqueta l drag",
    diagramName: "Roll-stop",
    diagram: closeUp(
      "Ball in front.",
      [0.9, 0.55],
      STANCE,
      [
        [[0.45, 0.55], [[0.3, 0.9, "L", UP], [0.62, 0.5, "R", UP]], "Right sole rolls it across the body…"],
        [null, [[0.28, 0.5, "L", UP], [0.62, 0.9, "R", UP]], "…left sole stops it dead."],
        [[1.1, 0.55], [[0.9, 0.5, "L", UP], [1.3, 0.9, "R", UP]], "Left sole rolls it back…"],
        [null, [[0.92, 0.9, "L", UP], [1.3, 0.5, "R", UP]], "…right sole stops it."],
      ],
    ),
    variations: [
      {
        name: "La Croqueta",
        summary: "Inside of the right foot taps it straight into the inside of the left, which carries it away. One smooth movement.",
        diagram: closeUp(
          "Ball on the inside of the right foot.",
          [1.0, 0.6],
          [[0.55, 0.9, "L", UP], [1.2, 0.62, "R", UP]],
          [
            [[0.62, 0.6], [[0.4, 0.62, "L", UP], [1.05, 0.62, "R", UP]], "Right inside taps it across to the left inside…"],
            [[0.3, 0.45], [[0.12, 0.55, "L", UP], [0.7, 0.9, "R", UP]], "…and the left carries it away. Shift the body with it."],
            [[0.68, 0.6], [[0.45, 0.62, "L", UP], [0.9, 0.62, "R", UP]], "Back the other way."],
            [[1.1, 0.45], [[0.9, 0.9, "L", UP], [1.35, 0.55, "R", UP]], "Right foot carries it on."],
          ],
        ),
      },
      {
        name: "L-drag",
        summary: "Right sole pulls it back, then the inside of the right pushes it behind the left leg. The ball draws an L.",
        diagram: closeUp(
          "Ball in front of the right foot.",
          [0.95, 0.5],
          STANCE,
          [
            [[0.95, 0.8], [[0.64, 0.95, "L", UP], [0.95, 0.55, "R", UP]], "Right sole pulls it straight back."],
            [[0.3, 0.95], [[0.64, 0.75, "L", UP], [0.95, 0.9, "R", -150]], "Inside of the right pushes it behind the left leg."],
            [[0.15, 0.6], [[0.3, 0.75, "L", -120], [0.72, 0.95, "R", UP]], "Left foot takes it away: you've changed direction 90°."],
          ],
        ),
      },
    ],
  },
  {
    id: "v-pull-series",
    title: "V-Pull Series: Inside, Outside, Cut",
    category: "ball-mastery",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Individual",
    players: "Any",
    duration: 10,
    intensity: 2,
    area: "Personal space",
    summary:
      "Pull the ball back with the sole and push it out at an angle, drawing a V. Three versions: out with the inside, out with the outside, and a pull into a sharp cut across the body. The foundation of most changes of direction.",
    setup: ["One ball each. 30 s per version on each foot."],
    steps: [
      "Inside V: pull back with the right sole, push out left with the inside of the right.",
      "Outside V: pull back with the right sole, push out right with the outside of the right.",
      "Pull & cut: pull back, then cut it hard across the body with the inside and explode.",
    ],
    points: [
      "Pull the ball back under your body, not just a few centimetres.",
      "The push out is at 45°, into space, and you follow it.",
      "Stay on your toes; hop on the standing foot.",
    ],
    progressions: [
      "Alternate feet every rep.",
      "Coach calls the version as you pull back.",
      "Do it at a cone with a passive defender, then accelerate away.",
    ],
    videos: [
      { id: "3ImgZ2yJ39s", title: "5 V Cut Ball Mastery Skills", channel: "7mlc" },
      { id: "ISgCIMTDAkE", title: "Ball Mastery: V-Pulls", channel: "Christchurch United FC" },
    ],
    search: "v pull ball mastery drill inside outside",
    diagramName: "Inside V",
    diagram: closeUp(
      "Ball in front of the right foot.",
      [0.95, 0.45],
      STANCE,
      [
        [[0.95, 0.78], [[0.64, 0.95, "L", UP], [0.95, 0.5, "R", UP]], "Right sole pulls it back."],
        [[0.5, 0.4], [[0.64, 0.95, "L", UP], [1.0, 0.78, "R", -120]], "Inside of the right pushes it out to the left at 45°."],
        [[0.5, 0.75], [[0.5, 0.45, "L", UP], [0.95, 0.95, "R", UP]], "Left sole pulls it back…"],
        [[1.1, 0.4], [[0.5, 0.8, "L", -60], [0.95, 0.95, "R", UP]], "…inside of the left pushes it out to the right."],
      ],
    ),
    variations: [
      {
        name: "Outside V",
        summary: "Pull back with the sole, push out to the same side with the outside of the same foot.",
        diagram: closeUp(
          "Ball in front of the right foot.",
          [0.95, 0.45],
          STANCE,
          [
            [[0.95, 0.78], [[0.64, 0.95, "L", UP], [0.95, 0.5, "R", UP]], "Right sole pulls it back."],
            [[1.35, 0.4], [[0.64, 0.95, "L", UP], [1.05, 0.72, "R", -60]], "Outside of the right pushes it out to the right."],
            [[1.35, 0.72], [[0.9, 0.95, "L", UP], [1.35, 0.45, "R", UP]], "Step to it and pull back again."],
          ],
        ),
      },
      {
        name: "Pull & cut",
        summary: "Pull back, then a hard cut across the body with the inside of the same foot, and away.",
        diagram: closeUp(
          "Ball in front of the right foot.",
          [0.95, 0.4],
          STANCE,
          [
            [[0.95, 0.75], [[0.64, 0.95, "L", UP], [0.95, 0.45, "R", UP]], "Pull back with the sole."],
            [[0.2, 0.7], [[0.64, 0.95, "L", UP], [1.0, 0.72, "R", 180]], "Cut hard across the body with the inside."],
            [[0.1, 0.3], [[0.25, 0.8, "L", -120], [0.55, 0.9, "R", -150]], "Explode away the other way."],
          ],
        ),
      },
    ],
  },
  {
    id: "one-foot-inside-outside",
    title: "One-Foot Inside–Outside Touches",
    category: "ball-mastery",
    ages: ["U6-8", "U9-12", "U13-15"],
    positions: ["DEF", "MID", "FWD"],
    format: "Individual",
    players: "Any",
    duration: 8,
    intensity: 2,
    area: "Personal space, then 15 m",
    summary:
      "Inside, outside, inside, outside, all with the same foot while hopping on the other. It's the touch that lets dribblers shift the ball either way without changing feet. First on the spot, then travelling.",
    setup: ["One ball each. 30 s on the right, 30 s on the left, 20 s rest."],
    steps: [
      "On the spot: inside touch, outside touch, same foot, small hops on the other.",
      "Inside–inside–outside–outside: two touches each way.",
      "Travel: move forward across the grid with inside–outside touches.",
    ],
    points: [
      "Tiny touches: the ball moves 20–30 cm each time.",
      "Toe pointing down for the outside touch.",
      "Stay on the balls of your feet; the standing foot hops to keep rhythm.",
    ],
    progressions: [
      "Coach calls 'switch' to change feet without stopping.",
      "Travel in a zig-zag between cones.",
      "Add a sole roll every fourth touch.",
    ],
    videos: [
      { id: "bY8b-flvo50", title: "Inside & Outside Touches (One Foot)", channel: "SoccerDrive" },
      { id: "qcWU68ncumw", title: "Inside, Inside, Outside, Outside Touches", channel: "Reece Hands" },
    ],
    search: "one foot inside outside touches ball mastery",
    diagramName: "On the spot",
    diagram: closeUp(
      "Right foot only. Left foot hops.",
      [0.95, 0.5],
      [[0.5, 0.85, "L", UP], [1.15, 0.55, "R", UP]],
      [
        [[0.75, 0.5], [[0.5, 0.85, "L", UP], [1.15, 0.52, "R", UP]], "Inside of the right taps it left."],
        [[1.05, 0.5], [[0.52, 0.88, "L", UP], [0.6, 0.52, "R", UP]], "Outside of the right taps it back right."],
        [[0.75, 0.5], [[0.5, 0.85, "L", UP], [1.2, 0.52, "R", UP]], "Inside…"],
        [[1.05, 0.5], [[0.52, 0.88, "L", UP], [0.6, 0.52, "R", UP]], "…outside. Hop on the left to keep the rhythm."],
      ],
    ),
    variations: [
      {
        name: "Travelling",
        summary: "The same touches while moving forward: the ball zig-zags up the grid on one foot.",
        diagram: {
          field: { type: "grid", w: 6, h: 16, bare: true },
          cones: [[1, 1], [5, 1], [1, 15], [5, 15]],
          players: [{ id: "a1", t: "a", x: 3, y: 14 }],
          ball: "a1",
          note: "Travel up the grid on one foot.",
          frames: [
            { note: "Inside: ball goes left and forward.", move: { a1: [2.2, 12] } },
            { note: "Outside: right and forward.", move: { a1: [3.8, 10] } },
            { move: { a1: [2.2, 8] } },
            { move: { a1: [3.8, 6] } },
            { move: { a1: [2.2, 4] } },
            { note: "Switch feet on the way back.", move: { a1: [3, 2] } },
          ],
        },
      },
    ],
  },
  {
    id: "running-with-the-ball",
    title: "Running With the Ball",
    category: "ball-mastery",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD"],
    format: "Small group",
    players: "4–12",
    duration: 10,
    intensity: 3,
    area: "30 × 12 m",
    summary:
      "Dribbling in tight spaces uses lots of small touches; running with the ball into open space uses a few big ones. Push it ahead with the laces and sprint after it, as fast as possible without losing control.",
    setup: ["Lanes 30 m long. Players queue at the start line, a ball each. End line and a halfway line of cones."],
    steps: [
      "Push the ball ahead with the laces and sprint after it.",
      "Take as few touches as possible to the end line (aim for 4–6).",
      "At the end, stop the ball with the sole on the line. Jog back.",
    ],
    points: [
      "Laces, toe pointing down, touch through the middle of the ball.",
      "Touch with the stride: don't break your running rhythm.",
      "Head up between touches to see what's ahead.",
    ],
    progressions: [
      "Race a partner in the next lane.",
      "Coach calls 'turn' at halfway: stop, turn and run back.",
      "A defender chases from 3 m behind.",
    ],
    videos: [
      { id: "xc9cx7DQa10", title: "Running with the Ball", channel: "Lexington United Soccer Club" },
      { id: "_tHAD1Quyao", title: "How to Dribble While Sprinting", channel: "Unisport" },
    ],
    search: "running with the ball drill soccer laces",
    diagram: {
      field: { type: "grid", w: 30, h: 12 },
      lines: [[15, 0, 15, 12], [0, 6, 30, 6]],
      players: [
        { id: "a1", t: "a", x: 1, y: 3 },
        { id: "a2", t: "a", x: 1, y: 9 },
      ],
      balls: { b1: "a1", b2: "a2" },
      note: "Two lanes, 30 m to the end line.",
      frames: [
        { note: "Big push ahead with the laces…", balls: { b1: [7, 3], b2: [6, 9] }, move: { a1: [3, 3], a2: [3, 9] } },
        { note: "…sprint onto it.", balls: { b1: "a1", b2: "a2" }, move: { a1: [7, 3], a2: [6, 9] } },
        { note: "Touch with the stride, head up.", balls: { b1: [15, 3], b2: [13, 9] }, move: { a1: [9, 3], a2: [8, 9] } },
        { balls: { b1: "a1", b2: "a2" }, move: { a1: [15, 3], a2: [13, 9] } },
        { balls: { b1: [23, 3], b2: [21, 9] }, move: { a1: [17, 3], a2: [15, 9] } },
        { balls: { b1: "a1", b2: "a2" }, move: { a1: [23, 3], a2: [21, 9] } },
        { note: "Smaller touch to stop on the line.", move: { a1: [29.5, 3], a2: [29.5, 9] } },
      ],
    },
  },
  {
    id: "beat-the-cone-moves",
    title: "Beat the Cone: Matthews, Chop, Step-Over",
    category: "ball-mastery",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["MID", "FWD", "DEF"],
    format: "Individual",
    players: "Any (3 per lane)",
    duration: 15,
    intensity: 2,
    area: "14 × 6 m per lane",
    summary:
      "Three 1v1 moves learned against a cone before a defender: the Matthews (feint in, go out), the Ronaldo chop (cut behind the standing leg) and the step-over. Same lane, same cone, a different move each block.",
    setup: ["A cone halfway down each lane. Players queue at one end with a ball each."],
    steps: [
      "Dribble at the cone at half speed.",
      "One step before it, do the move for this block.",
      "Accelerate for 3 m after the move, then jog back round the outside.",
    ],
    points: [
      "Matthews: small inside touch to shift the defender, then outside of the same foot and go.",
      "Chop: plant beside the ball, cut it behind the standing leg with the inside.",
      "Step-over: step around the ball from inside to outside, take it away with the other foot.",
    ],
    progressions: [
      "Replace the cone with a passive defender, then a live one.",
      "Players pick the move; the coach checks the change of pace after it.",
      "Finish with a shot on a mini-goal.",
    ],
    videos: [
      { id: "7UVm3kAfSdM", title: "How to do the Matthews Move", channel: "Football Skills Coach" },
      { id: "t5TDr1lfh8g", title: "How to do the Ronaldo Chop", channel: "Football Skills Coach" },
    ],
    search: "matthews move ronaldo chop stepover drill cones",
    diagramName: "Matthews",
    diagram: coneLane("Cone halfway down the lane.", [
      [[5.5, 3], "Dribble at the cone."],
      [[5.8, 2.4], "Small inside touch: the 'defender' shifts."],
      [[8, 4.3], "Outside of the same foot, the other way."],
      [[13, 4.3], "Explode away."],
    ]),
    variations: [
      {
        name: "Ronaldo chop",
        summary: "Plant beside the ball and cut it behind the standing leg with the inside of the other foot, then go.",
        diagram: coneLane("Cone halfway down the lane.", [
          [[5.5, 3], "Dribble at the cone, ball on the right."],
          [[5.2, 1.6], "Chop: cut it behind the left leg to the left."],
          [[8.5, 1.4], "Past the cone on the other side."],
          [[13, 2], "Accelerate."],
        ]),
      },
      {
        name: "Step-over",
        summary: "Step round the ball with the right, from inside to outside, then take it away with the outside of the left.",
        diagram: coneLane("Cone halfway down the lane.", [
          [[5.5, 3], "Dribble at the cone."],
          [[5.6, 3.1], "Step over with the right: sell it with the shoulder."],
          [[8.3, 1.5], "Take it away with the outside of the left."],
          [[13, 1.8], "Explode away."],
        ]),
      },
    ],
  },
  {
    id: "simon-says-ball-mastery",
    title: "Simon Says: Ball Mastery",
    category: "ball-mastery",
    ages: ["U6-8"],
    positions: ["DEF", "MID", "FWD"],
    format: "Team",
    players: "Any",
    duration: 8,
    intensity: 1,
    area: "20 × 15 m",
    summary:
      "The classic game with a ball at every player's feet. 'Simon says: sole on top!' Players only move if the command starts with 'Simon says'. Young players learn the names of each touch while laughing.",
    setup: ["A ball each, spread out in the area. Coach in front where everyone can see."],
    steps: [
      "Coach gives ball commands: toe taps, sole on top, dribble, stop, turn.",
      "Only do it if the coach says 'Simon says' first.",
      "Anyone caught out does 5 toe taps and stays in: no one is ever eliminated.",
    ],
    points: [
      "Coach demonstrates each new move first.",
      "Mix fast and slow commands to keep them listening.",
      "Praise the best touches, not only the quickest reactions.",
    ],
    progressions: [
      "Let a player be Simon.",
      "Silent Simon: show the move instead of saying it.",
      "Add moves: 'Simon says: pull back and turn!'",
    ],
    videos: [
      { id: "GUCCYCNwc7Y", title: "Simon Says: Animated Soccer Drill", channel: "Coaches College" },
      { id: "pZgCXoCm0MM", title: "U6–U8 Simon Says", channel: "WoodburySoccerMN" },
    ],
    search: "simon says soccer ball mastery kids",
    diagram: {
      field: { type: "grid", w: 20, h: 15 },
      players: [
        { id: "c", t: "c", x: 10, y: 1 },
        { id: "a1", t: "a", x: 4, y: 5 },
        { id: "a2", t: "a", x: 10, y: 6 },
        { id: "a3", t: "a", x: 16, y: 5 },
        { id: "a4", t: "a", x: 6, y: 11 },
        { id: "a5", t: "a", x: 14, y: 11 },
      ],
      balls: { b1: "a1", b2: "a2", b3: "a3", b4: "a4", b5: "a5" },
      note: "A ball each, facing the coach.",
      frames: [
        { note: "'Simon says: toe taps!'", call: { id: "c", text: "SIMON SAYS: TAPS", color: "g" } },
        { note: "'Simon says: dribble!'", call: { id: "c", text: "SIMON SAYS: DRIBBLE", color: "g" }, move: { a1: [6, 8], a2: [12, 9], a3: [15, 8], a4: [4, 13], a5: [17, 13] } },
        { note: "'Stop!' No 'Simon says', so nobody moves.", call: { id: "c", text: "STOP!", color: "r" } },
        { note: "'Simon says: sole on top!'", call: { id: "c", text: "SIMON SAYS: SOLE", color: "g" } },
      ],
    },
  },
  {
    id: "thousand-touches",
    title: "1,000 Touches Homework Routine",
    category: "ball-mastery",
    ages: ["U9-12", "U13-15", "U16+"],
    positions: ["DEF", "MID", "FWD", "GK"],
    format: "Individual",
    players: "1",
    duration: 15,
    intensity: 2,
    area: "Personal space",
    summary:
      "A take-home routine: eight moves, 50 touches each foot, around 1,000 touches in 15 minutes. Done three times a week, it does more for a young player's touch than any single session.",
    setup: ["One ball, a small space at home or in the park. A timer or a friend counting."],
    steps: [
      "Toe taps: 100 (50 each foot).",
      "Foundations (inside–inside): 100.",
      "Sole rolls: 100. Pull–push: 100.",
      "Inside–outside, one foot: 100 each foot.",
      "V-pulls: 100. Croquetas: 100. Juggling: as many as you can in 2 minutes.",
    ],
    points: [
      "Quality over speed: clean touches first, then faster.",
      "Keep a diary of your fastest time for the full routine.",
      "Spend more reps on your weaker foot.",
    ],
    progressions: [
      "Race the clock: full routine under 12 minutes.",
      "Eyes closed for toe taps and foundations.",
      "Add a new move every week.",
    ],
    videos: [
      { id: "thYuSdMjKxQ", title: "1000 Touch Home Workout", channel: "7mlc" },
      { id: "yFLbExa6FNI", title: "10 Minute Ball Mastery Workout", channel: "7mlc" },
    ],
    search: "1000 touches ball mastery routine home",
    diagram: closeUp(
      "Eight moves, one after another.",
      [0.8, 0.55],
      STANCE,
      [
        [null, [[0.64, 0.95, "L", UP], [0.8, 0.46, "R", UP]], "Toe taps × 100."],
        [[0.92, 0.6], [[0.64, 0.62, "L", UP], [1.07, 0.64, "R", UP]], "Foundations × 100."],
        [[0.45, 0.55], [[0.3, 0.88, "L", UP], [0.5, 0.47, "R", UP]], "Sole rolls × 100."],
        [[0.8, 0.8], [[0.64, 0.95, "L", UP], [0.82, 0.7, "R", UP]], "Pull–push × 100."],
        [[1.05, 0.5], [[0.52, 0.88, "L", UP], [0.7, 0.52, "R", UP]], "Inside–outside × 100 each foot."],
        [[0.5, 0.4], [[0.64, 0.95, "L", UP], [1.0, 0.78, "R", -120]], "V-pulls × 100."],
        [[0.8, 0.55], [[0.62, 0.62, "L", UP], [1.05, 0.62, "R", UP]], "Croquetas × 100, then juggle."],
      ],
    ),
  },
];
