export interface GSTINData {
  gstin: string;
  legalName: string;
  tradeName: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  registrationDate: string;
  taxpayerType: string;
  stateCode: string;
}

export interface GSTReturnStatus {
  returnType: 'GSTR-1' | 'GSTR-3B' | 'GSTR-9';
  taxPeriod: string;
  status: 'Filed' | 'Not Filed' | 'Delayed';
  dateOfFiling: string | null;
}

export async function lookupGSTIN(gstin: string): Promise<GSTINData | null> {
  // Validate format
  if (!validateGSTINFormat(gstin)) return null;

  // Mock implementation for sandbox
  const stateCode = gstin.substring(0, 2);
  
  return {
    gstin,
    legalName: `M/S Example Enterprise ${stateCode}`,
    tradeName: `Example Corp ${stateCode}`,
    status: 'Active',
    registrationDate: '2019-04-01T00:00:00Z',
    taxpayerType: 'Regular',
    stateCode
  };
}

export async function getReturnStatus(gstin: string): Promise<GSTReturnStatus[]> {
  if (!validateGSTINFormat(gstin)) return [];

  // Mock filing history
  return [
    { returnType: 'GSTR-3B', taxPeriod: '032026', status: 'Filed', dateOfFiling: '2026-04-18T10:00:00Z' },
    { returnType: 'GSTR-1', taxPeriod: '032026', status: 'Filed', dateOfFiling: '2026-04-10T14:30:00Z' },
    { returnType: 'GSTR-3B', taxPeriod: '022026', status: 'Delayed', dateOfFiling: '2026-03-24T09:15:00Z' },
  ];
}

export function validateGSTINFormat(gstin: string): boolean {
  // 15 character alphanumeric GSTIN format
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin);
}
