const secp256k1 = require("secp256k1/elliptic.js");
const { randomBytes } = require("crypto");
const fs = require("fs");
const path = require("path");

function getPrivateKey() {
  while (true) {
    const privKey = randomBytes(32);
    if (secp256k1.privateKeyVerify(privKey)) return privKey;
  }
}

let privateKey = getPrivateKey();
let publicKey;

// get the public key in a compressed format
publicKey = secp256k1.publicKeyCreate(privateKey);

//add public and private keys to env file:

// Path to your .env file
const envFilePath = path.join(__dirname, "../.env");

// Read the current contents of the file
let envContents = "";
if (fs.existsSync(envFilePath)) {
  envContents = fs.readFileSync(envFilePath, "utf8");
}

// Function to replace or append a key-value pair in the .env file
function updateEnvVariable(keyName, keyValue) {
  const keyPattern = new RegExp(`^${keyName}=.*`, "m");
  if (keyPattern.test(envContents)) {
    // Replace the existing line
    envContents = envContents.replace(keyPattern, `${keyName}=${keyValue}`);
  } else {
    // Append the new key, ensure it starts on a new line
    envContents +=
      (envContents.endsWith("\n") ? "" : "\n") + `${keyName}=${keyValue}\n`;
  }
}

// Update the MY_PUB_KEY and MY_PRIV_KEY variables
updateEnvVariable("MY_PUB_KEY", publicKey);
updateEnvVariable("MY_PRIV_KEY", new Uint8Array(privateKey));

// Write the updated contents back to the file
fs.writeFileSync(envFilePath, envContents);
