import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Utf8.parse(process.env.AES_KEY || 'jiangziyiaeskeys'); // 16位
const iv = CryptoJS.enc.Utf8.parse(process.env.AES_IV || 'abcdefghijklmnop');
const dataConst = {
  iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
};

/**
 * aes加密
 * param word
 * returns {string}
 */
export function encipher(word: string): string {
  let encrypted: any = '';
  if (typeof word === 'string') {
    const source = CryptoJS.enc.Utf8.parse(word);
    encrypted = CryptoJS.AES.encrypt(source, key, dataConst);
  } else if (typeof word === 'object') {
    // 对象格式的转成json字符串
    const data = JSON.stringify(word);
    const source = CryptoJS.enc.Utf8.parse(data);
    encrypted = CryptoJS.AES.encrypt(source, key, dataConst);
  }
  return encrypted.ciphertext.toString();
}

/**
 * aes解密
 * param word
 * returns {string}
 */
export function decipher(word: string): string {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  const source = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(source, key, dataConst);
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}
