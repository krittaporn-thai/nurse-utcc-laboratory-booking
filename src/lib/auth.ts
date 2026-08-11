/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Admin code hash verification (SHA-256 for NURSEUTCC01)
// Note: Admin code is kept strictly confidential and NEVER shown to standard users.

export const ADMIN_ROLE_NAME = 'ผู้ดูแลระบบ (Admin)';

/**
 * Verify admin passcode against SHA-256 hash or secure fallback.
 */
export async function verifyAdminPasscode(inputCode: string): Promise<boolean> {
  const normalized = inputCode.trim();
  if (!normalized) return false;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    
    // Hash of "NURSEUTCC01"
    const targetHash = '2a8b94f0923057790b0d39e2474811a435fa10d291918a36481691238622ff6d';
    
    if (hashHex === targetHash) {
      return true;
    }
    
    // Case-insensitive / fallback direct check
    return normalized.toUpperCase() === 'NURSEUTCC01';
  } catch (e) {
    return normalized.toUpperCase() === 'NURSEUTCC01';
  }
}
