import pkg from 'crypto-js';
const { AES, enc } = pkg;

const decrypt = async (ciphertext) => {
  const bytes = AES.decrypt(ciphertext, process.env.encryptDecryptKey);
  const originalText = bytes.toString(enc.Utf8);
  return originalText;
};


const encrypt = (text) => {
  const cipherText = AES.encrypt(text, process.env.encryptDecryptKey);
  return cipherText.toString();
};

export  {decrypt,encrypt};