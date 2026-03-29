import { ChartPatternType, Candle, ChartPatternCategory } from '@/types/api'

export interface PatternDefinition {
  type: ChartPatternType
  category: ChartPatternCategory
  name: string
  description: string
  exampleCandles: Candle[]
}

export const PATTERN_INFO: Record<ChartPatternType, PatternDefinition> = {
  BULLISH_ENGULFING: {
    type: 'BULLISH_ENGULFING',
    category: 'BULLISH',
    name: 'Avalement Haussier',
    description: 'Une figure de retournement haussier composée de deux bougies. La première est baissière, la seconde est haussière et "avale" complètement le corps de la précédente. Cela indique une forte reprise de contrôle par les acheteurs.',
    exampleCandles: [
      { date: '2026-01-01', open: 110, high: 112, low: 108, close: 105, volume: 100 },
      { date: '2026-01-02', open: 104, high: 112, low: 103, close: 111, volume: 150 },
    ]
  },
  BEARISH_ENGULFING: {
    type: 'BEARISH_ENGULFING',
    category: 'BEARISH',
    name: 'Avalement Baissier',
    description: 'Une figure de retournement baissier. La première bougie est haussière, la seconde est baissière et avale complètement le corps de la première. Signale une forte pression vendeuse.',
    exampleCandles: [
      { date: '2026-01-01', open: 105, high: 110, low: 104, close: 108, volume: 100 },
      { date: '2026-01-02', open: 109, high: 110, low: 102, close: 103, volume: 150 },
    ]
  },
  MORNING_STAR: {
    type: 'MORNING_STAR',
    category: 'BULLISH',
    name: 'Étoile du Matin',
    description: 'Une figure de retournement haussier en trois bougies : une longue bougie rouge, une petite bougie (étoile) ouvrant avec un gap, puis une longue bougie verte confirmant le retournement.',
    exampleCandles: [
      { date: '2026-01-01', open: 120, high: 121, low: 110, close: 112, volume: 100 },
      { date: '2026-01-02', open: 108, high: 110, low: 106, close: 107, volume: 50 },
      { date: '2026-01-03', open: 110, high: 120, low: 109, close: 118, volume: 120 },
    ]
  },
  EVENING_STAR: {
    type: 'EVENING_STAR',
    category: 'BEARISH',
    name: 'Étoile du Soir',
    description: 'L\'inverse de l\'étoile du matin. Une figure de retournement baissier en trois bougies montrant l\'épuisement des acheteurs et l\'arrivée des vendeurs.',
    exampleCandles: [
      { date: '2026-01-01', open: 100, high: 112, low: 99, close: 110, volume: 100 },
      { date: '2026-01-02', open: 112, high: 114, low: 111, close: 113, volume: 50 },
      { date: '2026-01-03', open: 112, high: 113, low: 101, close: 103, volume: 120 },
    ]
  },
  HAMMER: {
    type: 'HAMMER',
    category: 'BULLISH',
    name: 'Marteau',
    description: 'Une seule bougie avec un petit corps en haut et une longue mèche basse (au moins deux fois la taille du corps). Suggère que les acheteurs ont repoussé les prix après une forte baisse.',
    exampleCandles: [
      { date: '2026-01-01', open: 110, high: 111, low: 100, close: 109, volume: 100 },
    ]
  },
  SHOOTING_STAR: {
    type: 'SHOOTING_STAR',
    category: 'BEARISH',
    name: 'Étoile Filante',
    description: 'Un petit corps en bas avec une longue mèche haute. Apparaît souvent après une hausse et indique un possible retournement baissier.',
    exampleCandles: [
      { date: '2026-01-01', open: 102, high: 115, low: 101, close: 103, volume: 100 },
    ]
  },
  DRAGONFLY_DOJI: {
    type: 'DRAGONFLY_DOJI',
    category: 'BULLISH',
    name: 'Doji Libellule',
    description: 'Une bougie où les prix d\'ouverture et de fermeture sont au même niveau (le plus haut), créant une très longue mèche basse. Signe de capitulation des vendeurs.',
    exampleCandles: [
      { date: '2026-01-01', open: 110, high: 110, low: 100, close: 110, volume: 100 },
    ]
  },
  GRAVESTONE_DOJI: {
    type: 'GRAVESTONE_DOJI',
    category: 'BEARISH',
    name: 'Doji Pierre Tombale',
    description: 'Prix d\'ouverture et de fermeture au plus bas de la séance avec une longue mèche haute. Suggère que les acheteurs n\'ont pas pu maintenir la hausse.',
    exampleCandles: [
      { date: '2026-01-01', open: 100, high: 115, low: 100, close: 100, volume: 100 },
    ]
  },
  DOJI: {
    type: 'DOJI',
    category: 'NEUTRAL',
    name: 'Doji',
    description: 'Bougie où les prix d\'ouverture et de fermeture sont quasiment identiques. Indique une indécision totale sur le marché.',
    exampleCandles: [
      { date: '2026-01-01', open: 105, high: 108, low: 102, close: 105, volume: 100 },
    ]
  },
  SMALL_RANGED_CANDLE: {
    type: 'SMALL_RANGED_CANDLE',
    category: 'NEUTRAL',
    name: 'Petite Amplitude',
    description: 'Une bougie avec une faible différence entre le plus haut et le plus bas. Indique une pause dans la volatilité.',
    exampleCandles: [
      { date: '2026-01-01', open: 105, high: 106, low: 104, close: 105.5, volume: 80 },
    ]
  },
  SMALL_BODIED_CANDLE: {
    type: 'SMALL_BODIED_CANDLE',
    category: 'NEUTRAL',
    name: 'Petit Corps',
    description: 'Une bougie avec un corps très court par rapport à la taille totale des mèches. Signe d\'épuisement de la tendance.',
    exampleCandles: [
      { date: '2026-01-01', open: 105, high: 110, low: 100, close: 105.5, volume: 90 },
    ]
  }
}
