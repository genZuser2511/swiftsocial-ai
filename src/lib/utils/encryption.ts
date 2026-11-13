import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || 'vE_9-Z_#8jX-6-k_7-p_4-h_3-r_2-s_1'; // 32 characters
const IV_LENGTH = 16; // For AES, this is always 16

// Ensure the key is exactly 32 bytes for aes-256-cbc to prevent crash
let validKey = Buffer.from(ENCRYPTION_KEY);
if (validKey.length !== 32) {
    validKey = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', validKey, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', validKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
