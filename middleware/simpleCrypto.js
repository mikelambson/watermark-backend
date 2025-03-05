import { error } from 'console';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc'; // Encryption algorithm
const secretKey = process.env.SIMPLE_CRYPTO_SECRET;  // Key size must be 32 bytes for AES-256
const iv = crypto.randomBytes(16); // Initialization vector

// Function to encrypt a text
const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// Function to decrypt a text
const decrypt = (encryptedText, iv) => {
    try {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
    } catch {
        return error
    }
};

// // Example usage:
// console.log('key', secretKey)
// const loginField = 'admin'; // The value you want to encrypt
// const encrypted = encrypt(loginField);
// console.log(encrypted);

// const decrypted = decrypt(encrypted.encryptedData, encrypted.iv);
// console.log('Decrypted:', decrypted);

export { encrypt, decrypt };