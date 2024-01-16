import * as miscreant from "miscreant";
import { toUtf8 } from "@cosmjs/encoding";
import secp256k1 from "secp256k1/elliptic.js";

const provider = new miscreant.PolyfillCryptoProvider();

let ciphertext;

const secret_pubKey = new Uint8Array([
  2, 142, 61, 32, 164, 57, 39, 167, 153, 37, 7, 189, 151, 17, 168, 75, 223, 241,
  92, 216, 54, 220, 129, 78, 241, 225, 70, 248, 161, 168, 62, 181, 141,
]);

// const privateKey = dotenv.config().parsed.MY_PRIV_KEY;
const privateKey =
  "42,109,8,139,0,54,17,131,66,245,109,177,99,184,32,210,25,12,190,76,18,2,83,242,114,89,196,56,15,117,115,25";
const byteArray = privateKey.split(",").map((num) => parseInt(num, 10));
const privateKeyUint8Array = new Uint8Array(byteArray);

const ecdhPointX = secp256k1.ecdh(secret_pubKey, privateKeyUint8Array);

const keyData = Uint8Array.from(ecdhPointX);

const encrypt = async (msg, associatedData = []) => {
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

export default encrypt;
