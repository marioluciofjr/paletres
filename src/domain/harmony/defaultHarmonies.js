/**
 * Fábrica do registro padrão com as 11 harmonias do Paletrês, na ordem do seletor.
 * Para adicionar uma harmonia nova, importe-a e registre-a aqui.
 */
import { HarmonyRegistry } from './HarmonyRegistry.js';
import { AnalogousHarmony } from './strategies/AnalogousHarmony.js';
import { ComplementaryHarmony } from './strategies/ComplementaryHarmony.js';
import { SplitComplementaryHarmony } from './strategies/SplitComplementaryHarmony.js';
import { TriadHarmony } from './strategies/TriadHarmony.js';
import { SquareHarmony } from './strategies/SquareHarmony.js';
import { CompoundHarmony } from './strategies/CompoundHarmony.js';
import { ShadesHarmony } from './strategies/ShadesHarmony.js';
import { MonochromaticHarmony } from './strategies/MonochromaticHarmony.js';
import { GoldenRatioHarmony } from './strategies/GoldenRatioHarmony.js';
import { FibonacciHarmony } from './strategies/FibonacciHarmony.js';
import { ContrastAnchorHarmony } from './strategies/ContrastAnchorHarmony.js';

export function createHarmonyRegistry() {
  return new HarmonyRegistry()
    .register(new AnalogousHarmony())
    .register(new ComplementaryHarmony())
    .register(new SplitComplementaryHarmony())
    .register(new TriadHarmony())
    .register(new SquareHarmony())
    .register(new CompoundHarmony())
    .register(new ShadesHarmony())
    .register(new MonochromaticHarmony())
    .register(new GoldenRatioHarmony())
    .register(new FibonacciHarmony())
    .register(new ContrastAnchorHarmony());
}
