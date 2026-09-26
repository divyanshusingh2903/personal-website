export const CATEGORIES = [
  { id: "fundamentals", label: "Fundamentals" },
  { id: "ball-mastery", label: "Ball Mastery" },
  { id: "footwork", label: "Footwork & Agility" },
  { id: "passing", label: "Passing & Receiving" },
  { id: "patterns", label: "Passing Patterns" },
  { id: "dribbling", label: "Dribbling & 1v1" },
  { id: "finishing", label: "Finishing" },
  { id: "possession", label: "Possession & Positional Play" },
  { id: "defending", label: "Individual Defending" },
  { id: "structure", label: "Defensive Structure" },
  { id: "transition", label: "Transition" },
  { id: "attacking", label: "Attacking Patterns" },
  { id: "set-pieces", label: "Set Pieces" },
  { id: "goalkeeping", label: "Goalkeeping" },
  { id: "fitness", label: "Fitness" },
];

export const AGES = [
  { id: "U6-8", label: "U6–U8" },
  { id: "U9-12", label: "U9–U12" },
  { id: "U13-15", label: "U13–U15" },
  { id: "U16+", label: "U16+" },
];

export const POSITIONS = [
  { id: "GK", label: "Goalkeepers" },
  { id: "DEF", label: "Defenders" },
  { id: "MID", label: "Midfielders" },
  { id: "FWD", label: "Forwards" },
];

export const FORMATS = ["Individual", "Pairs", "Small group", "Unit", "Team"];

export const AGE_GUIDE = [
  {
    age: "U6–U8",
    focus: "Play, not drills",
    text: "One ball per player, hundreds of touches, games with stories. 3v3 and 4v4, no lines, no laps. No heading.",
  },
  {
    age: "U9–U12",
    focus: "The skill window",
    text: "Technique under light pressure: rondos, 1v1s, small-sided games. Rotate positions. No heading at 10 and under.",
  },
  {
    age: "U13–U15",
    focus: "Ideas & units",
    text: "Introduce pressing, lines and transitions. Growth spurts arrive, so manage load and keep conditioning ball-based.",
  },
  {
    age: "U16+",
    focus: "The full game",
    text: "Positional detail, team structure and set pieces, plus periodized conditioning around the match week.",
  },
];

export const categoryLabel = (id) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const ageLabel = (id) => AGES.find((a) => a.id === id)?.label ?? id;

export const ageRange = (ages) => {
  const idx = ages.map((a) => AGES.findIndex((x) => x.id === a)).sort((a, b) => a - b);
  const first = AGES[idx[0]];
  const last = AGES[idx[idx.length - 1]];
  if (first === last) return first.label;
  if (last.id === "U16+") return `${first.label.split("–")[0]}+`;
  return `${first.label.split("–")[0]}–${last.label.split("–").pop()}`;
};

export const youtubeSearch = (q) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
