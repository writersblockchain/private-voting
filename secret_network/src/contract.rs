use crate::error::{ContractError, CryptoError};
use crate::msg::{ExecuteMsg, GetStoredVotesResp, InstantiateMsg, KeysResponse, QueryMsg};
use crate::state::{MyKeys, Votes, ALL_VOTES, MY_KEYS};
use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult,
};

use secp256k1::ecdh::SharedSecret;
use secp256k1::{PublicKey, Secp256k1, SecretKey};

//
use aes_siv::aead::generic_array::GenericArray;
use aes_siv::siv::Aes128Siv;
use ethabi::{decode, ParamType};
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
    // Decode the payload
    let decoded = decode(&vec![ParamType::String], payload.as_slice()).map_err(|_| {
        ContractError::CustomError {
            val: "decoding error".to_string(),
        }
    })?; // Added error handling for decoding
    let vote = decoded[0].to_string();

    // Load the existing votes or initialize an empty vector if none exist
    let mut previous_votes = match ALL_VOTES.may_load(deps.storage) {
        Ok(Some(votes_data)) => votes_data.votes,
        Ok(None) => Vec::new(), // Initialize an empty vector if no votes are present
        Err(_) => {
            return Err(ContractError::CustomError {
                val: "loading error".to_string(),
            })
        } // Handle potential loading error
    };

    // Add the new vote
    previous_votes.push(vote);

    // Save the updated list of votes
    ALL_VOTES.save(
        deps.storage,
        &Votes {
            votes: previous_votes,
        },
    )?;

    Ok(Response::new().add_attribute("method", "receive_message_evm"))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetKeys {} => to_binary(&query_keys(deps)?),

        QueryMsg::GetStoredVotes {
            public_key,
            ciphertexts,
        } => to_binary(&get_stored_votes(deps, public_key, ciphertexts)?),
    }
}

pub fn get_stored_votes(
    deps: Deps,
    public_key: Vec<u8>,
    ciphertexts: Vec<Vec<u8>>,
) -> StdResult<GetStoredVotesResp> {
    let message = ALL_VOTES.may_load(deps.storage).unwrap().unwrap();
    let resp = GetStoredVotesResp {
        votes: message.votes,
    };

    let my_keys = MY_KEYS.load(deps.storage)?;

    let my_private_key = SecretKey::from_slice(my_keys.private_key.as_slice()).unwrap();

    let other_public_key = PublicKey::from_slice(public_key.as_slice()).unwrap();

    let shared_secret = SharedSecret::new(&other_public_key, &my_private_key);
    let key = shared_secret.to_vec();

    let ad_data: &[&[u8]] = &[];
    let ad = Some(ad_data);

    let decryption_result = aes_siv_decrypt(ciphertexts, ad, &key);

    match decryption_result {
        Ok(decrypted_data_vec) => {
            // Handle the successful decryption
            for decrypted_data in decrypted_data_vec {
                // You can log or further process each decrypted data
                println!("Decrypted data: {:?}", decrypted_data);
            }
        }
        Err(e) => {
            // Log the error
            warn!("Decryption failed with error: {:?}", e);
        }
    }

    Ok(resp)
}

fn query_keys(deps: Deps) -> StdResult<KeysResponse> {
    let my_keys = MY_KEYS.load(deps.storage)?;
    Ok(KeysResponse {
        public_key: my_keys.public_key,
    })
}
