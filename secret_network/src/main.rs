use aes_siv::aead::generic_array::GenericArray;
use aes_siv::siv::Aes128Siv;
use log::*;
use secp256k1::ecdh::SharedSecret;
use secp256k1::{PublicKey, SecretKey};
use secret_encryption::CryptoError;

fn main() {
    // Hardcoded encrypted data
    let encrypted_data = [
        63, 222, 102, 124, 209, 137, 122, 47, 69, 56, 61, 13, 252, 106, 20, 110, 253, 131, 24, 95,
        66, 156, 161, 119, 221, 144, 64, 16, 97, 39, 249, 107, 9, 134, 129, 94, 205, 37, 153, 61,
        31, 57, 171, 198, 127, 72, 175, 90, 75, 125, 221, 184,
    ];

    let encrypted_data_vec = vec![encrypted_data.to_vec()];

    let other_public_key = [
        2, 151, 142, 171, 162, 214, 185, 135, 244, 246, 185, 98, 150, 43, 38, 243, 247, 218, 165,
        250, 199, 227, 76, 0, 171, 197, 25, 112, 59, 196, 178, 27, 245,
    ];

    let my_private_key = [
        5, 235, 171, 38, 245, 27, 57, 248, 115, 21, 12, 246, 106, 234, 193, 17, 90, 215, 108, 97,
        60, 56, 16, 193, 146, 150, 243, 104, 236, 18, 197, 134,
    ];

    let my_private_key = SecretKey::from_slice(my_private_key.as_slice()).unwrap();

    let my_public_key = PublicKey::from_slice(other_public_key.as_slice()).unwrap();

    let key = SharedSecret::new(&my_public_key, &my_private_key).to_vec();

    // println!("SharedSecret: {:?}", key);

    // Convert associated data to the correct type
    let ad_data: &[&[u8]] = &[];
    let ad = Some(ad_data);

    // Decrypt
    match aes_siv_decrypt(encrypted_data_vec, ad, &key) {
        Ok(decrypted_data_vec) => {
            for (index, decrypted_data) in decrypted_data_vec.iter().enumerate() {
                match String::from_utf8(decrypted_data.clone()) {
                    Ok(decrypted_string) => {
                        println!("Decrypted data {}: {:?}", index, decrypted_string);
                    }
                    Err(e) => {
                        warn!(
                            "Error converting decrypted data {} to string: {:?}",
                            index, e
                        );
                    }
                }
            }
        }
        Err(e) => {
            warn!("Error decrypting data: {:?}", e);
        }
    }
}

pub fn aes_siv_decrypt(
    ciphertexts: Vec<Vec<u8>>, // Changed to a vector of Vec<u8>
    ad: Option<&[&[u8]]>,
    key: &[u8],
) -> Result<Vec<Vec<u8>>, CryptoError> {
    let ad = ad.unwrap_or(&[&[]]);
    let mut cipher = Aes128Siv::new(GenericArray::clone_from_slice(key));

    let mut decrypted_data_vec = Vec::new();

    for ciphertext in ciphertexts {
        match cipher.decrypt(ad, &ciphertext) {
            Ok(decrypted_data) => {
                decrypted_data_vec.push(decrypted_data);
            }
            Err(e) => {
                warn!("aes_siv_decrypt error: {:?}", e);
                return Err(CryptoError::DecryptionError);
            }
        }
    }

    Ok(decrypted_data_vec)
}
