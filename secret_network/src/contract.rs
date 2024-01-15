use crate::error::{ContractError, CryptoError};
use crate::msg::{ExecuteMsg, InstantiateMsg, KeysResponse, QueryMsg, VotesResponse};
use crate::state::{MyKeys, VoteResults, MY_KEYS, VOTE_RESULTS};
use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult,
};

use secp256k1::ecdh::SharedSecret;
use secp256k1::{PublicKey, Secp256k1, SecretKey};

//
use aes_siv::aead::generic_array::GenericArray;
use aes_siv::siv::Aes128Siv;
use hex;
use log::*;

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, StdError> {
    deps.api
        .debug(&format!("Contract was initialized by {}", info.sender));

    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateKeys {} => try_create_keys(deps, env),

        ExecuteMsg::DecryptTally {
            public_key,
            encrypted_message,
            encrypted_message_description,
        } => try_decrypt_tally(
            deps,
            env,
            public_key,
            encrypted_message,
            encrypted_message_description,
        ),
    }
}

pub fn try_create_keys(deps: DepsMut, env: Env) -> Result<Response, ContractError> {
    let rng = env.block.random.unwrap().0;
    let secp = Secp256k1::new();

    let private_key = SecretKey::from_slice(&rng).unwrap();
    let private_key_string = private_key.to_string();
    let private_key_bytes = hex::decode(private_key_string).unwrap();

    let public_key = PublicKey::from_secret_key(&secp, &private_key);
    let public_key_bytes = public_key.serialize().to_vec();

    let my_keys = MyKeys {
        private_key: private_key_bytes,
        public_key: public_key_bytes,
    };

    MY_KEYS.save(deps.storage, &my_keys)?;

    Ok(Response::default())
}

pub fn try_decrypt_tally(
    deps: DepsMut,
    _env: Env,
    public_key: Vec<u8>,
    encrypted_message: Vec<String>,
    encrypted_message_description: String,
) -> Result<Response, ContractError> {
    let my_keys = MY_KEYS.load(deps.storage)?;

    let my_private_key = SecretKey::from_slice(&my_keys.private_key)
        .map_err(|_| StdError::generic_err("Invalid private key"))?;

    let other_public_key = PublicKey::from_slice(&public_key)
        .map_err(|_| StdError::generic_err("Invalid public key"))?;

    let shared_secret = SharedSecret::new(&other_public_key, &my_private_key);
    let key = shared_secret.to_vec();

    let ad_data: &[&[u8]] = &[];
    let ad = Some(ad_data);

    //convert hex strings to Vec<u8> for decryption function
    let encrypted_message_vecs = hex_to_vec(&encrypted_message);

    // Decrypt the data
    let decrypted_data_vec = aes_siv_decrypt(encrypted_message_vecs, ad, &key)
        .map_err(|e| StdError::generic_err(format!("Error decrypting data: {:?}", e)))?;

    //push decrypted strings into a Vec
    let mut decrypted_strings = Vec::new();
    for decrypted_data in decrypted_data_vec {
        let decrypted_string = String::from_utf8(decrypted_data).map_err(|e| {
            StdError::generic_err(format!("Error converting data to string: {:?}", e))
        })?;
        decrypted_strings.push(decrypted_string);
    }

    // Tally the votes
    let final_result = tally_answers(decrypted_strings);

    let final_result_str = format!("{} : {}", encrypted_message_description, final_result);

    // Load existing vote results or initialize if not present
    let mut vote_results = VOTE_RESULTS.may_load(deps.storage)?.unwrap_or(VoteResults {
        final_result: Vec::new(),
    });

    // Add to vote results if not already present
    if !vote_results.final_result.contains(&final_result_str) {
        vote_results.final_result.push(final_result_str);
    }

    // Save the updated vote results
    VOTE_RESULTS.save(deps.storage, &vote_results)?;

    Ok(Response::default())
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

fn hex_to_vec(hex_vec: &[String]) -> Vec<Vec<u8>> {
    hex_vec
        .iter()
        .map(|hex| {
            hex.trim_start_matches("0x")
                .chars()
                .collect::<Vec<char>>()
                .chunks(2)
                .filter_map(|chunk| {
                    let hex_byte = chunk.iter().collect::<String>();
                    u8::from_str_radix(&hex_byte, 16).ok()
                })
                .collect::<Vec<u8>>()
        })
        .collect()
}

fn tally_answers(data: Vec<String>) -> String {
    let mut yes_count = 0;
    let mut no_count = 0;

    for item in &data {
        if item.contains("yes") {
            yes_count += 1;
        } else if item.contains("no") {
            no_count += 1;
        }
        // Ignore any strings that don't match "yes" or "no"
    }

    if yes_count > no_count {
        "yes".to_string()
    } else if no_count > yes_count {
        "no".to_string()
    } else if yes_count > 0 || no_count > 0 {
        "tie".to_string()
    } else {
        // No votes, return something appropriate
        "no votes".to_string()
    }
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetKeys {} => to_binary(&query_keys(deps)?),
        QueryMsg::GetResults {} => to_binary(&query_results(deps)?),
    }
}

fn query_keys(deps: Deps) -> StdResult<KeysResponse> {
    let my_keys = MY_KEYS.load(deps.storage)?;
    Ok(KeysResponse {
        public_key: my_keys.public_key,
        private_key: my_keys.private_key,
    })
}

fn query_results(deps: Deps) -> StdResult<VotesResponse> {
    let my_results = VOTE_RESULTS.load(deps.storage)?;
    Ok(VotesResponse {
        final_result: my_results.final_result,
    })
}
