// Checks PAN formatting constraints (5 letters, 4 numbers, 1 letter)
export function validatePanChecksum(pan: string): boolean {
  const cleanPan = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(cleanPan);
}

// Checks GSTIN formatting constraints (2 numbers, PAN code, 1 number/letter, 1 Z, 1 number/letter)
export function validateGstChecksum(gstin: string): boolean {
  const cleanGst = gstin.trim().toUpperCase();
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(cleanGst);
}

// 1. Verifies PAN details
export async function verifyPan(pan: string): Promise<{ valid: boolean; holderName: string }> {
  const isValidFormat = validatePanChecksum(pan);
  if (!isValidFormat) {
    return { valid: false, holderName: 'N/A' };
  }

  // Simulated Karza/Government registry API validation lookup
  return {
    valid: true,
    holderName: 'PROVENTA CREDIT SERVICES PVT LTD'
  };
}

// 2. Verifies GSTIN details
export async function verifyGst(gstin: string): Promise<{ valid: boolean; tradeName: string; activeStatus: boolean }> {
  const isValidFormat = validateGstChecksum(gstin);
  if (!isValidFormat) {
    return { valid: false, tradeName: 'N/A', activeStatus: false };
  }

  // Simulated GST Portal API validation lookup
  return {
    valid: true,
    tradeName: 'PROVENTA INDIA',
    activeStatus: true
  };
}

// 3. Fetches MCA/ROC registries company profile details
export async function fetchMcaData(cin: string): Promise<{
  valid: boolean;
  companyName: string;
  incorporationDate: string;
  legalStatus: string;
  authorizedCapital: number;
  paidUpCapital: number;
}> {
  const cleanCin = cin.trim().toUpperCase();
  const cinRegex = /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[PTC]{3}[0-9]{6}$/;

  if (!cinRegex.test(cleanCin)) {
    return {
      valid: false,
      companyName: 'N/A',
      incorporationDate: 'N/A',
      legalStatus: 'N/A',
      authorizedCapital: 0,
      paidUpCapital: 0
    };
  }

  return {
    valid: true,
    companyName: 'PROVENTA ANALYTICS INDIA PRIVATE LIMITED',
    incorporationDate: '2022-04-12',
    legalStatus: 'ACTIVE',
    authorizedCapital: 10000000,
    paidUpCapital: 5000000
  };
}
