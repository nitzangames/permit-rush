import { rng } from '../core/rng.js';

export const RULES = [
  {
    id: 'R01', waveUnlock: 1,
    shortText: 'R1 zone: max 2 floors',
    fullText: 'Zone R1 permits a maximum of 2 floors.',
    check: (bp) => bp.zone === 'R1' && bp.floors > 2,
    mutate: (bp) => { bp.zone = 'R1'; bp.floors = 3 + Math.floor(rng() * 2); },
  },
  {
    id: 'R02', waveUnlock: 1,
    shortText: 'No flat roofs in R-zones',
    fullText: 'Flat roofs are not permitted in residential zones (R1/R2/R3).',
    check: (bp) => ['R1','R2','R3'].includes(bp.zone) && bp.roofType === 'flat',
    mutate: (bp) => {
      if (!['R1','R2','R3'].includes(bp.zone)) bp.zone = 'R2';
      bp.roofType = 'flat';
    },
  },
  {
    id: 'R03', waveUnlock: 3,
    shortText: 'No oversized garages',
    fullText: 'Oversized garages are not permitted.',
    check: (bp) => bp.garageSize === 'oversized',
    mutate: (bp) => { bp.garageSize = 'oversized'; },
  },
  {
    id: 'R04', waveUnlock: 3,
    shortText: 'Min 6ft setback',
    fullText: 'Minimum setback from property line is 6 feet.',
    check: (bp) => bp.setback < 6,
    mutate: (bp) => { bp.setback = 1 + Math.floor(rng() * 5); },
  },
  {
    id: 'R05', waveUnlock: 5,
    shortText: 'No basements in flood zone',
    fullText: 'Basements are not permitted in flood zones.',
    check: (bp) => bp.zone === 'flood' && bp.foundation === 'basement',
    mutate: (bp) => { bp.zone = 'flood'; bp.foundation = 'basement'; },
  },
  {
    id: 'R06', waveUnlock: 5,
    shortText: 'Footprint ≤ 40% of lot',
    fullText: 'Building footprint may not exceed 40% of lot size.',
    check: (bp) => bp.footprint / bp.lotSize > 0.4,
    mutate: (bp) => { bp.footprint = Math.floor(bp.lotSize * (0.41 + rng() * 0.15)); },
  },
  {
    id: 'R07', waveUnlock: 7,
    shortText: 'Historic: no shed roofs',
    fullText: 'Historic zone does not permit shed roofs.',
    check: (bp) => bp.zone === 'historic' && bp.roofType === 'shed',
    mutate: (bp) => { bp.zone = 'historic'; bp.roofType = 'shed'; },
  },
  {
    id: 'R08', waveUnlock: 7,
    shortText: 'R3 zone: max 3 floors',
    fullText: 'Zone R3 permits a maximum of 3 floors.',
    check: (bp) => bp.zone === 'R3' && bp.floors > 3,
    mutate: (bp) => { bp.zone = 'R3'; bp.floors = 4; },
  },
  {
    id: 'R09', waveUnlock: 9,
    shortText: 'HOA-A: solar needs approval',
    fullText: 'Solar panels in HOA-A require board approval (not on file).',
    check: (bp) => bp.zone === 'HOA-A' && bp.solarPanels,
    mutate: (bp) => { bp.zone = 'HOA-A'; bp.solarPanels = true; },
  },
  {
    id: 'R10', waveUnlock: 9,
    shortText: 'Historic: tree removal needs notice',
    fullText: 'Tree removal in historic zone requires public notice.',
    check: (bp) => bp.zone === 'historic' && bp.treeRemoval,
    mutate: (bp) => { bp.zone = 'historic'; bp.treeRemoval = true; },
  },
];

export function getActiveRules(wave) {
  return RULES.filter(r => r.waveUnlock <= wave);
}

export function getNewRulesForWave(wave) {
  return RULES.filter(r => r.waveUnlock === wave);
}

export function getViolations(bp, wave) {
  return getActiveRules(wave).filter(r => r.check(bp)).map(r => r.id);
}
