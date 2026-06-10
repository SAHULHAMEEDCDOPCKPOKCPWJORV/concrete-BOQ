// ── Concrete Calculation Engine (IS 456 / IS 10262) ─────────────────────────

export type ConcreteGrade =
  | 'M5' | 'M7.5' | 'M10' | 'M15' | 'M20'
  | 'M25' | 'M30' | 'M35' | 'M40' | 'M45' | 'M50' | 'M55' | 'M60';

export type MixType = 'Nominal' | 'Design';

export interface DesignMixInput {
  cementKgPerM3: number;
  fineAggKgPerM3: number;
  coarseAggKgPerM3: number;
}

export interface AdmixtureInput {
  required: boolean;
  type: string;
  manufacturer: string;
  dosagePercent: number;
}

export interface ConcreteInput {
  grade: ConcreteGrade;
  wetVolume: number;
  wcRatio: number;
  designMixInput?: DesignMixInput;
  admixture: AdmixtureInput;
}

export interface CalculationStep {
  label: string;
  formula: string;
  value: string;
  unit: string;
}

export interface ConcreteResult {
  grade: ConcreteGrade;
  mixType: MixType;
  mixRatio: string;
  wetVolume: number;
  dryVolume: number;
  wcRatio: number;
  cementVolume: number;
  cementWeightKg: number;
  cementBags: number;
  fineAggregateVolume: number;
  fineAggregateWeight: number;
  coarseAggregateVolume: number;
  coarseAggregateWeight: number;
  waterLitres: number;
  waterKL: number;
  admixture: {
    required: boolean;
    type: string;
    manufacturer: string;
    dosagePercent: number;
    quantityKg: number;
    quantityLitres: number;
  };
  steps: CalculationStep[];
}

// W/C Ratio table as per IS 456
export const WC_RATIO_TABLE: Record<ConcreteGrade, number> = {
  'M5':   0.70,
  'M7.5': 0.65,
  'M10':  0.60,
  'M15':  0.55,
  'M20':  0.50,
  'M25':  0.45,
  'M30':  0.40,
  'M35':  0.38,
  'M40':  0.36,
  'M45':  0.34,
  'M50':  0.32,
  'M55':  0.30,
  'M60':  0.28,
};

// Nominal mix ratios (C : FA : CA)
const NOMINAL_MIX: Record<string, [number, number, number]> = {
  'M5':   [1, 5,   10],
  'M7.5': [1, 4,   8 ],
  'M10':  [1, 3,   6 ],
  'M15':  [1, 2,   4 ],
  'M20':  [1, 1.5, 3 ],
};

const NOMINAL_GRADES = ['M5', 'M7.5', 'M10', 'M15', 'M20'];
const CEMENT_DENSITY = 1440; // kg/m³
const FA_DENSITY     = 1600; // kg/m³
const CA_DENSITY     = 1500; // kg/m³
const BAG_WEIGHT     = 50;   // kg
const DRY_FACTOR     = 1.54;

export function getMixType(grade: ConcreteGrade): MixType {
  return NOMINAL_GRADES.includes(grade) ? 'Nominal' : 'Design';
}

export function calculateConcrete(input: ConcreteInput): ConcreteResult {
  const { grade, wetVolume, wcRatio, designMixInput, admixture } = input;
  const mixType   = getMixType(grade);
  const dryVolume = wetVolume * DRY_FACTOR;
  const steps: CalculationStep[] = [];

  steps.push({ label: 'Wet Volume', formula: 'Given input', value: wetVolume.toFixed(3), unit: 'm³' });
  steps.push({ label: 'Dry Volume', formula: `${wetVolume} × 1.54`, value: dryVolume.toFixed(3), unit: 'm³' });

  let cementVol = 0, faVol = 0, caVol = 0, mixRatioStr = '';

  if (mixType === 'Nominal') {
    const [c, fa, ca] = NOMINAL_MIX[grade];
    const total = c + fa + ca;
    mixRatioStr = `1 : ${fa} : ${ca}`;
    cementVol = (dryVolume * c)  / total;
    faVol     = (dryVolume * fa) / total;
    caVol     = (dryVolume * ca) / total;
    steps.push({ label: 'Mix Ratio', formula: `${grade} Nominal Mix`, value: mixRatioStr, unit: '' });
    steps.push({ label: 'Total Parts', formula: `${c}+${fa}+${ca}`, value: String(total), unit: 'parts' });
    steps.push({ label: 'Cement Volume', formula: `(${dryVolume.toFixed(3)}×${c})/${total}`, value: cementVol.toFixed(4), unit: 'm³' });
    steps.push({ label: 'Fine Agg Volume', formula: `(${dryVolume.toFixed(3)}×${fa})/${total}`, value: faVol.toFixed(4), unit: 'm³' });
    steps.push({ label: 'Coarse Agg Volume', formula: `(${dryVolume.toFixed(3)}×${ca})/${total}`, value: caVol.toFixed(4), unit: 'm³' });
  } else {
    mixRatioStr = 'Design Mix (IS 10262)';
    if (designMixInput) {
      const { cementKgPerM3, fineAggKgPerM3, coarseAggKgPerM3 } = designMixInput;
      cementVol = (cementKgPerM3     * wetVolume) / CEMENT_DENSITY;
      faVol     = (fineAggKgPerM3    * wetVolume) / FA_DENSITY;
      caVol     = (coarseAggKgPerM3  * wetVolume) / CA_DENSITY;
      steps.push({ label: 'Mix Type', formula: `${grade} — Design Mix`, value: mixRatioStr, unit: '' });
      steps.push({ label: 'Cement Volume', formula: `(${cementKgPerM3}×${wetVolume})/${CEMENT_DENSITY}`, value: cementVol.toFixed(4), unit: 'm³' });
    } else {
      steps.push({ label: 'Mix Type', formula: `${grade} — Design Mix`, value: 'Enter inputs', unit: '' });
    }
  }

  const cementWeightKg = cementVol * CEMENT_DENSITY;
  const cementBags     = Math.ceil(cementWeightKg / BAG_WEIGHT);
  const waterLitres    = cementWeightKg * wcRatio;

  steps.push({ label: 'Cement Weight', formula: `${cementVol.toFixed(4)} × ${CEMENT_DENSITY}`, value: cementWeightKg.toFixed(2), unit: 'kg' });
  steps.push({ label: 'Cement Bags',   formula: `${cementWeightKg.toFixed(2)} ÷ 50`, value: String(cementBags), unit: 'Bags' });
  steps.push({ label: 'Water Required', formula: `${cementWeightKg.toFixed(2)} × ${wcRatio}`, value: waterLitres.toFixed(2), unit: 'Litres' });

  let admixtureKg = 0;
  if (admixture.required && admixture.dosagePercent > 0) {
    admixtureKg = (cementWeightKg * admixture.dosagePercent) / 100;
    steps.push({ label: 'Admixture', formula: `${cementWeightKg.toFixed(2)} × ${admixture.dosagePercent}% / 100`, value: admixtureKg.toFixed(3), unit: 'kg' });
  }

  return {
    grade, mixType, mixRatio: mixRatioStr,
    wetVolume, dryVolume, wcRatio,
    cementVolume: cementVol,
    cementWeightKg,
    cementBags,
    fineAggregateVolume: faVol,
    fineAggregateWeight: faVol * FA_DENSITY,
    coarseAggregateVolume: caVol,
    coarseAggregateWeight: caVol * CA_DENSITY,
    waterLitres,
    waterKL: waterLitres / 1000,
    admixture: {
      required: admixture.required,
      type: admixture.type,
      manufacturer: admixture.manufacturer,
      dosagePercent: admixture.dosagePercent,
      quantityKg: admixtureKg,
      quantityLitres: admixtureKg,
    },
    steps,
  };
}

export const CONCRETE_GRADES: ConcreteGrade[] = [
  'M5','M7.5','M10','M15','M20','M25','M30','M35','M40','M45','M50','M55','M60'
];
export const ADMIXTURE_TYPES = [
  'Plasticizer','Super Plasticizer','Retarder','Accelerator',
  'Waterproofing Compound','Silica Fume','Fly Ash','GGBS','Custom'
];
export const ADMIXTURE_MANUFACTURERS = [
  'Fosroc','Sika','Master Builders','Dr. Fixit','MYK Arment','Choksey','Custom'
];
