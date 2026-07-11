import crypto from 'crypto';
import { db } from './db';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// The Key Encryption Key (KEK) is derived from the master secret environment variable
const MASTER_SECRET = process.env.MASTER_SECRET || 'proventa-root-master-key-encryption-secret-999!';

/**
 * Derives a consistent 32-byte key from the master secret for the KEK
 */
function getMasterKEK(): Buffer {
  return crypto.scryptSync(MASTER_SECRET, 'master-salt', 32);
}

/**
 * Generates a unique, random 256-bit (32-byte) Data Encryption Key (DEK) for a tenant
 */
export function generateDEK(): Buffer {
  return crypto.randomBytes(32);
}

/**
 * Encrypts a Data Encryption Key (DEK) using the Master Key (KEK)
 * Returns { encryptedDEK: hex, iv: hex }
 */
export function encryptDEK(dek: Buffer): { encryptedDEK: string; iv: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const kek = getMasterKEK();
  const cipher = crypto.createCipheriv(ALGORITHM, kek, iv);
  
  let encrypted = cipher.update(dek as any, 'binary', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    encryptedDEK: `${encrypted}:${tag.toString('hex')}`,
    iv: iv.toString('hex')
  };
}

/**
 * Decrypts a Data Encryption Key (DEK) using the Master Key (KEK)
 */
export function decryptDEK(encryptedDEK: string, ivHex: string): Buffer {
  const parts = encryptedDEK.split(':');
  if (parts.length !== 2) throw new Error('Invalid encrypted DEK format');
  
  const encrypted = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const kek = getMasterKEK();
  
  const decipher = crypto.createDecipheriv(ALGORITHM, kek, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted as any, 'binary', 'binary');
  decrypted += decipher.final('binary');
  
  return Buffer.from(decrypted, 'binary');
}

/**
 * Encrypts data using a tenant's decrypted DEK
 * Returns hex values: iv : ciphertext : tag
 */
export function encryptWithDEK(text: string, dek: Buffer): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}

/**
 * Decrypts data using a tenant's decrypted DEK
 */
export function decryptWithDEK(ciphertext: string, dek: Buffer): string {
  if (!ciphertext || !ciphertext.includes(':')) return ciphertext;
  const parts = ciphertext.split(':');
  if (parts.length !== 3) return ciphertext; // Not encrypted format
  
  try {
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, dek, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted as any, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption failed, returning ciphertext:', err);
    return ciphertext;
  }
}

/**
 * Helper to retrieve and decrypt a tenant's DEK from the database
 */
export async function getTenantDEK(organizationId: string): Promise<Buffer> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { encryptedDEK: true, dekIV: true }
  });

  if (!org || !org.encryptedDEK || !org.dekIV) {
    // If DEK doesn't exist (e.g. legacy organization), generate and save one
    const newDEK = generateDEK();
    const { encryptedDEK, iv } = encryptDEK(newDEK);
    await db.organization.update({
      where: { id: organizationId },
      data: { encryptedDEK, dekIV: iv }
    });
    return newDEK;
  }

  return decryptDEK(org.encryptedDEK, org.dekIV);
}

// Backward compatibility fallbacks
export function encryptData(text: string): string {
  const fallbackDEK = crypto.scryptSync(MASTER_SECRET, 'fallback-salt', 32);
  return encryptWithDEK(text, fallbackDEK);
}

export function decryptData(ciphertext: string): string {
  const fallbackDEK = crypto.scryptSync(MASTER_SECRET, 'fallback-salt', 32);
  return decryptWithDEK(ciphertext, fallbackDEK);
}
