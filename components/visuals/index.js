"use client";
import { Molecules, Phenomena, States, AtomModel, Symbols, Periodic, Reaction, ReactionTypes, Balancer, Ph } from "./chemistry";
import { PlaceValue, FractionPie, NumberLine, PercentGrid, AreaGrid, Measure, Motion, Density, Gravity } from "./mathphys";
import { Cards, Cell, Photosynthesis, FoodChain, Timeline, SilkRoad, Flag, Tense, WordCards, Binary, Robot, Computer } from "./other";

// Тип визуализации в данных урока → компонент. Новые визуализации
// добавляются сюда и сразу доступны в любом уроке через { type: "…" }.
const REGISTRY = {
  cards: Cards,
  phenomena: Phenomena,
  states: States,
  atom: AtomModel,
  molecules: Molecules,
  symbols: Symbols,
  periodic: Periodic,
  reaction: Reaction,
  "reaction-types": ReactionTypes,
  balancer: Balancer,
  ph: Ph,
  "place-value": PlaceValue,
  fraction: FractionPie,
  "number-line": NumberLine,
  percent: PercentGrid,
  area: AreaGrid,
  measure: Measure,
  motion: Motion,
  density: Density,
  gravity: Gravity,
  cell: Cell,
  photosynthesis: Photosynthesis,
  foodchain: FoodChain,
  timeline: Timeline,
  silkroad: SilkRoad,
  flag: Flag,
  tense: Tense,
  wordcards: WordCards,
  binary: Binary,
  robot: Robot,
  computer: Computer,
};

export default function Visual({ visual }) {
  if (!visual) return null;
  const { type, ...props } = visual;
  const C = REGISTRY[type];
  if (!C) return null;
  return <C {...props} />;
}
