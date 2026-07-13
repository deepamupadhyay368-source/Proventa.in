export interface CompanyInfo {
  cin: string;
  companyName: string;
  rocCode: string;
  registrationNumber: string;
  companyCategory: string;
  companySubcategory: string;
  classOfCompany: 'Private' | 'Public' | 'One Person Company';
  authorizedCapital: number;
  paidUpCapital: number;
  dateOfIncorporation: string;
  status: 'Active' | 'Strike Off' | 'Amalgamated' | 'Dormant';
}

export interface Director {
  din: string;
  name: string;
  designation: string;
  dateOfAppointment: string;
}

export async function lookupCIN(cin: string): Promise<CompanyInfo | null> {
  if (!validateCINFormat(cin)) return null;

  return {
    cin,
    companyName: 'PROVENTA DEMO PVT LTD',
    rocCode: 'RoC-Delhi',
    registrationNumber: cin.substring(cin.length - 6),
    companyCategory: 'Company limited by Shares',
    companySubcategory: 'Non-govt company',
    classOfCompany: 'Private',
    authorizedCapital: 1000000,
    paidUpCapital: 500000,
    dateOfIncorporation: '2020-01-15T00:00:00Z',
    status: 'Active'
  };
}

export async function getDirectors(cin: string): Promise<Director[]> {
  if (!validateCINFormat(cin)) return [];

  return [
    { din: '01234567', name: 'RAJESH KUMAR', designation: 'Director', dateOfAppointment: '2020-01-15T00:00:00Z' },
    { din: '07654321', name: 'PRIYA SHARMA', designation: 'Director', dateOfAppointment: '2022-04-01T00:00:00Z' }
  ];
}

export function validateCINFormat(cin: string): boolean {
  // L/U + 5 digits + state (2 chars) + year (4 digits) + PVT/PLC/LLP + 6 digits
  const regex = /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
  return regex.test(cin);
}
