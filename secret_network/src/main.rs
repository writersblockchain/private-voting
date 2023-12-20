use aes_siv::aead::generic_array::GenericArray;
use aes_siv::siv::Aes128Siv;
use log::*;
use secp256k1::ecdh::SharedSecret;
use secp256k1::{PublicKey, SecretKey};
use secret_encryption::CryptoError;

fn main() {
    // Hardcoded encrypted data
    let encrypted_data = [
        183, 106, 30, 78, 77, 71, 7, 177, 95, 228, 115, 46, 218, 233, 210, 203, 128, 57, 96, 42,
        122, 233, 225, 49, 147, 216, 41, 47, 203, 117, 33, 59, 140, 38, 26, 172, 246, 203, 182,
        143, 110, 37, 118, 56, 255, 171, 10, 83,
    ];

    let encrypted_data_vec = vec![encrypted_data.to_vec()];

    let other_public_key = [
        2, 205, 150, 187, 68, 68, 194, 2, 77, 164, 192, 40, 76, 92, 51, 189, 246, 253, 191, 133,
        56, 199, 169, 60, 140, 167, 96, 187, 7, 226, 178, 146, 212,
    ];

    let my_private_key = [
        255, 230, 123, 169, 202, 41, 109, 219, 133, 96, 69, 90, 211, 80, 16, 118, 99, 228, 124, 9,
        191, 184, 80, 242, 209, 62, 237, 106, 77, 20, 98, 246,
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
