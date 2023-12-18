const miscreant = require("miscreant");
const { toUtf8 } = require("@cosmjs/encoding");
const secp256k1 = require("secp256k1/elliptic.js");
const dotenv = require("dotenv");

let provider = new miscreant.PolyfillCryptoProvider();
let ciphertext;

let secret_pubKey = new Uint8Array([
  2, 30, 202, 38, 43, 20, 172, 162, 220, 14, 61, 238, 28, 234, 160, 206, 198,
  217, 245, 236, 68, 83, 92, 231, 76, 184, 168, 252, 136, 26, 147, 124, 116,
]);

let privateKey = dotenv.config().parsed.MY_PRIV_KEY;
let byteArray = privateKey.split(",").map((num) => parseInt(num, 10));
let privateKeyUint8Array = new Uint8Array(byteArray);
// console.log(privateKeyUint8Array);

const ecdhPointX = secp256k1.ecdh(secret_pubKey, privateKeyUint8Array);

let keyData = Uint8Array.from(ecdhPointX);

let encrypt = async (msg, associatedData = []) => {
  const siv = await miscreant.SIV.importKey(keyData, "AES-SIV", provider);
  const plaintext = toUtf8(JSON.stringify(msg));

  try {
    ciphertext = await siv.seal(plaintext, associatedData);
    console.log("Encrypted data:", ciphertext);
    return ciphertext;
  } catch (e) {
    console.warn("Error encrypting data:", e);
    throw e;
  }
};

module.exports = { encrypt };
