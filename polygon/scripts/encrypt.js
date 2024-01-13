const miscreant = require("miscreant");
const { toUtf8 } = require("@cosmjs/encoding");
const secp256k1 = require("secp256k1/elliptic.js");
const dotenv = require("dotenv");

let provider = new miscreant.PolyfillCryptoProvider();
let ciphertext;

let secret_pubKey = new Uint8Array([
  2, 142, 61, 32, 164, 57, 39, 167, 153, 37, 7, 189, 151, 17, 168, 75, 223, 241,
  92, 216, 54, 220, 129, 78, 241, 225, 70, 248, 161, 168, 62, 181, 141,
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
