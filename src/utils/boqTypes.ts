export interface BOQRow {
  id: string;
  sno: number;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BillingSummary {
  subTotal: number;
  gstPercent: number;
  contingenciesPercent: number;
  overheadPercent: number;
  profitPercent: number;
  roundOff: number;
  netPayable: number;
}

let _id = 1;
export const generateId = () => `row_${Date.now()}_${_id++}`;

export function createDefaultBOQRows(result?: {
  cementBags: number;
  fineAggregateVolume: number;
  coarseAggregateVolume: number;
  waterLitres: number;
  admixture: { required: boolean; quantityKg: number };
}): BOQRow[] {
  const rows: Omit<BOQRow,'id'>[] = [
    { sno:1,  description:'Cement (OPC 53 Grade)',                          unit:'Bags',       quantity: result?.cementBags                                                     ?? 0,  rate:420,  amount:0 },
    { sno:2,  description:'Fine Aggregate (River Sand)',                    unit:'m³',         quantity: result ? parseFloat(result.fineAggregateVolume.toFixed(3))              : 0,  rate:1800, amount:0 },
    { sno:3,  description:'Coarse Aggregate (20mm)',                        unit:'m³',         quantity: result ? parseFloat(result.coarseAggregateVolume.toFixed(3))            : 0,  rate:1500, amount:0 },
    { sno:4,  description:'Water',                                          unit:'Litres',     quantity: result ? parseFloat(result.waterLitres.toFixed(2))                      : 0,  rate:0.05, amount:0 },
    { sno:5,  description:'Admixture',                                      unit:'kg',         quantity: result?.admixture.required ? parseFloat(result.admixture.quantityKg.toFixed(3)) : 0, rate:85, amount:0 },
    { sno:6,  description:'Labour (Batching, Mixing, Placing & Finishing)', unit:'Lump Sum',   quantity:1, rate:2500, amount:0 },
    { sno:7,  description:'T&P (Tools & Plants)',                           unit:'Lump Sum',   quantity:1, rate:1000, amount:0 },
    { sno:8,  description:'Transit Mixer Charges',                          unit:'Trip',       quantity:1, rate:3500, amount:0 },
    { sno:9,  description:'Concrete Pumping Charges',                       unit:'Lump Sum',   quantity:1, rate:2000, amount:0 },
    { sno:10, description:'Testing Charges (Cube Test)',                    unit:'Nos',        quantity:3, rate:150,  amount:0 },
  ];
  return rows.map(r => ({ ...r, id: generateId(), amount: parseFloat((r.quantity * r.rate).toFixed(2)) }));
}

export function computeBillingSummary(
  rows: BOQRow[],
  gstPercent: number,
  contingenciesPercent: number,
  overheadPercent: number,
  profitPercent: number,
): BillingSummary {
  const subTotal = rows.reduce((s, r) => s + r.amount, 0);
  const gst   = (subTotal * gstPercent)   / 100;
  const cont  = (subTotal * contingenciesPercent) / 100;
  const oh    = (subTotal * overheadPercent) / 100;
  const profit= (subTotal * profitPercent) / 100;
  const total = subTotal + gst + cont + oh + profit;
  const roundOff = Math.round(total) - total;
  return { subTotal, gstPercent, contingenciesPercent, overheadPercent, profitPercent, roundOff, netPayable: Math.round(total) };
}
