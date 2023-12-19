use schemars::JsonSchema;
use secret_toolkit_storage::Item;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct MyKeys {
    pub public_key: Vec<u8>,
    pub private_key: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct Votes {
    pub votes: Vec<Vec<u8>>,
}

pub static MY_KEYS: Item<MyKeys> = Item::new(b"my_keys");

pub static ALL_VOTES: Item<Votes> = Item::new(b"all votes");
