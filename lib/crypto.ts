// https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb

import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac
} from "crypto";
import { assert } from "console";

const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string, key: Buffer) {
  let iv = randomBytes(IV_LENGTH);
  let cipher = createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string, key: Buffer) {
  assert(text, "text argument is required");

  let textParts = text.split(":");
  if (textParts.length < 2) {
    throw new Error("invalid ciphertext (missing iv?)");
  }

  let iv = Buffer.from(textParts.shift()!, "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export function encryptAndSign(
  data: string,
  key: Buffer,
  signatureKey: Buffer
) {
  const encrypted = encrypt(data, key);

  const cipher = createHmac("sha256", signatureKey);
  cipher.update(encrypted);

  return cipher.digest("hex") + "$" + encrypted;
}

export function verifySignature(data: string, signatureKey: Buffer) {
  try {
    const [signature, message] = data.split("$");

    const cipher = createHmac("sha256", signatureKey);
    cipher.update(message);
    
    if (signature === cipher.digest('hex')) {
      return message
    }
    
  } catch (e) {
    return false;
  }
  
  return false
}

export function keyToBuffer(cryptoKey: string) {
  return createHash("sha256")
    .update(String(cryptoKey))
    .digest();
}
