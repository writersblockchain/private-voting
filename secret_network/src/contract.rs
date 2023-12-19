use crate::error::{ContractError, CryptoError};
use crate::msg::{ExecuteMsg, InstantiateMsg, KeysResponse, QueryMsg};
use crate::state::{MyKeys, Votes, ALL_VOTES, MY_KEYS};
use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult,
};

use secp256k1::ecdh::SharedSecret;
use secp256k1::{PublicKey, Secp256k1, SecretKey};

//
use aes_siv::aead::generic_array::GenericArray;
use aes_siv::siv::Aes128Siv;
use ethabi::{decode, ParamType, Token};
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

        ExecuteMsg::ReceiveMessageEvm {
            source_chain,
            source_address,
            payload,
        } => receive_message_evm(deps, source_chain, source_address, payload),
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

pub fn receive_message_evm(
    deps: DepsMut,
    _source_chain: String,
    _source_address: String,
    payload: Binary,
) -> Result<Response, ContractError> {
    let decoded = decode(&vec![ParamType::Bytes], payload.as_slice()).unwrap();

    // Extract the byte array
    let bytes = if let Token::Bytes(b) = decoded[0].clone() {
        b
    } else {
        return Err(ContractError::CustomError {
            val: "Unexpected token type".to_string(),
        });
    };

    // Load existing votes or initialize if none exist
    let mut previous_votes: Vec<Vec<u8>> = match ALL_VOTES.may_load(deps.storage) {
        Ok(Some(votes_data)) => votes_data.votes,
        Ok(None) => Vec::new(),
        Err(_) => {
            return Err(ContractError::CustomError {
                val: "loading error".to_string(),
            })
        }
    };

    // Append the new bytes to the existing data
    previous_votes.push(bytes.to_vec());

    ALL_VOTES.save(
        deps.storage,
        &Votes {
            votes: previous_votes,
        },
    )?;

    Ok(Response::new())
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetKeys {} => to_binary(&query_keys(deps)?),

        QueryMsg::GetStoredVotes { public_key } => to_binary(&get_stored_votes(deps, public_key)?),
        QueryMsg::GetStored {} => to_binary(&get_stored(deps)?),
    }
}

fn get_stored(deps: Deps) -> StdResult<Vec<Vec<u8>>> {
    let message = ALL_VOTES
        .may_load(deps.storage)?
        .ok_or_else(|| StdError::generic_err("No votes found in storage"))?;

    // let votes_string = String::from_utf8(message.votes)
    //     .map_err(|_| StdError::generic_err("Failed to convert votes to string"))?;

    Ok(message.votes)
}

pub fn get_stored_votes(deps: Deps, public_key: Vec<u8>) -> StdResult<Vec<String>> {
    let message = ALL_VOTES
        .may_load(deps.storage)?
        .ok_or_else(|| StdError::generic_err("No votes found in storage"))?;

    let ciphertexts = message.votes;

    let my_keys = MY_KEYS.load(deps.storage)?;
    let my_private_key = SecretKey::from_slice(&my_keys.private_key)
        .map_err(|_| StdError::generic_err("Invalid private key"))?;
    let other_public_key = PublicKey::from_slice(&public_key)
        .map_err(|_| StdError::generic_err("Invalid public key"))?;

    let shared_secret = SharedSecret::new(&other_public_key, &my_private_key);
    let key = shared_secret.to_vec();

    let ad_data: &[&[u8]] = &[];
    let ad = Some(ad_data);

    // Decrypt
    let decrypted_data_vec = aes_siv_decrypt(ciphertexts, ad, &key)
        .map_err(|e| StdError::generic_err(format!("Error decrypting data: {:?}", e)))?;

    let mut decrypted_strings = Vec::new();
    for decrypted_data in decrypted_data_vec {
        let decrypted_string = String::from_utf8(decrypted_data).map_err(|e| {
            StdError::generic_err(format!("Error converting data to string: {:?}", e))
        })?;
        decrypted_strings.push(decrypted_string);
    }

    Ok(decrypted_strings)
}

fn query_keys(deps: Deps) -> StdResult<KeysResponse> {
    let my_keys = MY_KEYS.load(deps.storage)?;
    Ok(KeysResponse {
        public_key: my_keys.public_key,
    })
}
