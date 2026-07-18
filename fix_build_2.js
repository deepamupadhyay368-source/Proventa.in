const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchRegex, replacement) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${fullPath} - not found`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Patched ${filePath}`);
}

// 1. Prisma schema
const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');
if (!schema.includes('taxAmount')) {
  schema = schema.replace(/taxRate\s+Float\s+@default\(0\)/, 'taxRate Float @default(0)\n  taxAmount Float @default(0)\n  totalExposure Float @default(0)');
}
if (!schema.includes('dismissed')) {
  schema = schema.replace(/teamInvited\s+Boolean\s+@default\(false\)/, 'teamInvited Boolean @default(false)\n  dismissed Boolean @default(false)');
}
if (!schema.includes('companyName')) {
  schema = schema.replace(/logoUrl\s+String\?/, 'companyName String?\n  logoUrl String?');
}
fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Patched schema.prisma');

// 2. team/route.ts
replaceInFile('src/app/api/dashboard/team/route.ts', /getSession\(req\)/g, 'getSession()');
replaceInFile('src/app/api/dashboard/team/route.ts', /where: \{ email \}/g, 'where: { email: email || "" }');
replaceInFile('src/app/api/dashboard/team/route.ts', /email: email/g, 'email: email || ""');
replaceInFile('src/app/api/dashboard/team/route.ts', /const userId = searchParams\.get\('userId'\);/g, 'const userId = searchParams.get("userId") || "";');
replaceInFile('src/app/api/dashboard/team/route.ts', /const inviteId = searchParams\.get\('inviteId'\);/g, 'const inviteId = searchParams.get("inviteId") || "";');

// 3. onboarding/progress/route.ts
replaceInFile('src/app/api/onboarding/progress/route.ts', /getSession\(req\)/g, 'getSession()');
replaceInFile('src/app/api/onboarding/progress/route.ts', /where: \{ organizationId \}/g, 'where: { organizationId: organizationId || "" }');
replaceInFile('src/app/api/onboarding/progress/route.ts', /organizationId: organizationId/g, 'organizationId: organizationId || ""');

// 4. dashboard/team/page.tsx
replaceInFile('src/app/dashboard/team/page.tsx', /ROLE_COLORS\.USER/g, 'ROLE_COLORS.INACTIVE');
replaceInFile('src/app/dashboard/team/page.tsx', /USER:/g, 'INACTIVE:');
replaceInFile('src/app/dashboard/team/page.tsx', /role: "USER"/g, 'role: "INACTIVE"');
replaceInFile('src/app/dashboard/team/page.tsx', /type UserRole = 'ADMIN' \| 'ANALYST' \| 'VIEWER' \| 'AUDITOR';/, "type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER' | 'AUDITOR' | 'INACTIVE';");
replaceInFile('src/app/dashboard/team/page.tsx', /INACTIVE: 'INACTIVE'/g, '');
replaceInFile('src/app/dashboard/team/page.tsx', /export const ROLES = {/, 'export const ROLES = { INACTIVE: "INACTIVE",');

// 5. planGate.ts
replaceInFile('src/lib/planGate.ts', /type PlanLimits = \{[\s\S]*?\};/, 'type PlanLimits = Record<string, any>;');
replaceInFile('src/lib/planGate.ts', /const LIMITS: Record<string, PlanLimits> = \{/, 'const LIMITS: Record<string, any> = {');

// 6. gemini.ts
replaceInFile('src/lib/services/gemini.ts', /new GoogleGenerativeAI\(\{ apiKey: [^}]+\} \)/, 'new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")');
replaceInFile('src/lib/services/gemini.ts', /new GoogleGenerativeAI\(\{ apiKey: process\.env\.GEMINI_API_KEY \!\}\)/, 'new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")');

console.log('All patches applied!');
