import { RULES, getActiveRules } from './rules.js';
import { CONFIG } from '../core/constants.js';
import { rng } from '../core/rng.js';

const STREETS = [
  'Maple Crest Dr','Oak Ridge Ln','Birchwood Ave','Cedar Park Rd',
  'Elm Grove Ct','Pine Hill Way','Willow Brook St','Aspen Terrace',
  'Sycamore Bend','Hawthorne Pl','Juniper Row','Magnolia Ct',
];
const SURNAMES = [
  'Hoffmann','Nakamura','Patel','Okafor','Chen','Almeida',
  'Kowalski','Rivera','Johansson','Mendoza','Ferreira','Singh',
  'Ostrowski','Aslam','Dubois','Hernandez','O\u2019Brien','Tanaka',
];
const INITIALS = ['A.','B.','C.','D.','E.','F.','J.','K.','L.','M.','N.','P.','R.','S.','T.','V.'];
function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }

function zonePool(wave) {
  const pool = ['R1', 'R2'];
  if (wave >= 5) pool.push('flood');
  if (wave >= 7) pool.push('R3', 'historic');
  if (wave >= 9) pool.push('HOA-A');
  return pool;
}

export function createBaseBlueprint(wave, cardIndex) {
  const lotSize = 4000 + Math.floor(rng() * 80) * 100;
  const footprintPct = 0.20 + rng() * 0.18;
  const zone = pick(zonePool(wave));

  const bp = {
    id: 'BP-' + String(4000 + cardIndex),
    cardIndex,
    address: (1 + Math.floor(rng() * 99)) + ' ' + pick(STREETS),
    applicant: pick(INITIALS) + ' ' + pick(SURNAMES),
    zone,
    floors: 1 + Math.floor(rng() * 2),
    roofType: pick(['gable','hip']),
    garageSize: pick(['none','single','double']),
    lotSize,
    footprint: Math.floor(lotSize * footprintPct),
    setback: 7 + Math.floor(rng() * 14),
    foundation: pick(['slab','crawl','pier']),
    solarPanels: rng() < 0.3,
    treeRemoval: rng() < 0.25,
    violations: [],
  };

  if (bp.zone === 'R1') bp.floors = Math.min(2, bp.floors);
  if (bp.zone === 'R3' && bp.floors > 3) bp.floors = 3;

  if (wave >= 5 && rng() < 0.3) bp.setback = 6;
  if (wave >= 5 && rng() < 0.25) bp.footprint = Math.floor(bp.lotSize * 0.39);
  if (wave >= 7 && rng() < 0.15 && bp.zone === 'R3') bp.floors = 3;

  return bp;
}

export function applyViolation(bp, rule) {
  rule.mutate(bp);
}

export function generateBlueprint(wave, cardIndex) {
  const bp = createBaseBlueprint(wave, cardIndex);
  const active = getActiveRules(wave);
  const makeInvalid = rng() < CONFIG.INVALID_RATIO;

  if (makeInvalid && active.length > 0) {
    const numViolations = (wave >= 5 && rng() < 0.25) ? 2 : 1;
    const pool = [...active].sort(() => rng() - 0.5);
    for (let i = 0; i < numViolations && i < pool.length; i++) {
      applyViolation(bp, pool[i]);
    }
  }

  bp.violations = active.filter(r => r.check(bp)).map(r => r.id);
  return bp;
}
