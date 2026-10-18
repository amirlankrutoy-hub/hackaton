"use client";
import {
  Calculator, Sigma, Triangle, Languages, PenTool, Globe, BookOpen, Landmark, Earth, Map, Dna, FlaskConical, Atom, Cpu,
  Scale, PiggyBank, Sprout, Heart, Hammer, Ruler, Smile, Shirt, Frame, Sparkles, Palette, Image, Zap, HelpCircle,
} from "lucide-react";

// Иконки, на которые ссылаются данные (предметы, категории магазина) по имени.
const ICONS = {
  Calculator, Sigma, Triangle, Languages, PenTool, Globe, BookOpen, Landmark, Earth, Map, Dna, FlaskConical, Atom, Cpu,
  Scale, PiggyBank, Sprout, Heart, Hammer, Ruler, Smile, Shirt, Frame, Sparkles, Palette, Image, Zap,
};

export default function Icon({ name, ...props }) {
  const C = ICONS[name] || HelpCircle;
  return <C {...props} />;
}
