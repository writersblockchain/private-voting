const miscreant = require("miscreant");
const { toUtf8 } = require("@cosmjs/encoding");
const secp256k1 = require("secp256k1/elliptic.js");
const dotenv = require("dotenv");

let provider = new miscreant.PolyfillCryptoProvider();
let ciphertext;

let secret_pubKey = new Uint8Array([
  3, 110, 72, 15, 137, 103, 38, 202, 92, 3, 222, 227, 157, 231, 79, 30, 135, 82,
  221, 199, 2, 183, 189, 216, 136, 135, 108, 56, 222, 202, 118, 183, 165,
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
