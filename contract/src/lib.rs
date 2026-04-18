#![no_std]

mod error;
mod state;

use soroban_sdk::{contract, contractimpl, token, Address, Env};

use error::Error;
use state::{DataKey, WillState};

#[contract]
pub struct DigitalWillContract;

#[contractimpl]
impl DigitalWillContract {
    /// Initialize the will contract
    /// 
    /// # Arguments
    /// * `owner` - The owner of the will
    /// * `beneficiary` - The beneficiary who will receive assets
    /// * `heartbeat_interval` - Time in seconds between required heartbeats
    pub fn initialize(
        env: Env,
        owner: Address,
        beneficiary: Address,
        heartbeat_interval: u64,
    ) -> Result<(), Error> {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::State) {
            return Err(Error::AlreadyInitialized);
        }

        // Validate inputs
        if heartbeat_interval < 60 {
            return Err(Error::InvalidInterval);
        }

        // Require owner authorization
        owner.require_auth();

        // Create initial state
        let current_time = env.ledger().timestamp();
        let state = WillState::new(owner, beneficiary, heartbeat_interval, current_time);

        // Store state
        env.storage().instance().set(&DataKey::State, &state);

        Ok(())
    }

    /// Send heartbeat to prove owner is alive
    pub fn heartbeat(env: Env) -> Result<(), Error> {
        let mut state: WillState = env
            .storage()
            .instance()
            .get(&DataKey::State)
            .ok_or(Error::NotInitialized)?;

        // Require owner authorization
        state.owner.require_auth();

        // Update last heartbeat
        state.last_heartbeat = env.ledger().timestamp();
        env.storage().instance().set(&DataKey::State, &state);

        Ok(())
    }

    /// Execute the will and transfer assets to beneficiary
    pub fn execute(env: Env, token_address: Address) -> Result<(), Error> {
        let state: WillState = env
            .storage()
            .instance()
            .get(&DataKey::State)
            .ok_or(Error::NotInitialized)?;

        let current_time = env.ledger().timestamp();

        // Check if grace period has expired
        if !state.can_execute(current_time) {
            return Err(Error::GracePeriodNotExpired);
        }

        // Get contract's token balance
        let token_client = token::TokenClient::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        let balance = token_client.balance(&contract_address);

        if balance == 0 {
            return Err(Error::InsufficientBalance);
        }

        // Transfer all tokens to beneficiary
        token_client.transfer(&contract_address, &state.beneficiary, &balance);

        Ok(())
    }

    /// Get current will state
    pub fn get_state(env: Env) -> Result<WillState, Error> {
        env.storage()
            .instance()
            .get(&DataKey::State)
            .ok_or(Error::NotInitialized)
    }

    /// Check if owner is still alive
    pub fn is_alive(env: Env) -> Result<bool, Error> {
        let state: WillState = env
            .storage()
            .instance()
            .get(&DataKey::State)
            .ok_or(Error::NotInitialized)?;

        let current_time = env.ledger().timestamp();
        Ok(state.is_owner_alive(current_time))
    }

    /// Get time until execution is possible
    pub fn time_until_execution(env: Env) -> Result<u64, Error> {
        let state: WillState = env
            .storage()
            .instance()
            .get(&DataKey::State)
            .ok_or(Error::NotInitialized)?;

        let current_time = env.ledger().timestamp();
        let execution_time = state.last_heartbeat + state.heartbeat_interval + state.grace_period;

        if current_time >= execution_time {
            Ok(0)
        } else {
            Ok(execution_time - current_time)
        }
    }

    /// Update beneficiary (only owner can call)
    pub fn update_beneficiary(env: Env, new_beneficiary: Address) -> Result<(), Error> {
        let mut state: WillState = env
            .storage()
            .instance()
            .get(&DataKey::State)
            .ok_or(Error::NotInitialized)?;

        // Require owner authorization
        state.owner.require_auth();

        // Update beneficiary
        state.beneficiary = new_beneficiary;
        env.storage().instance().set(&DataKey::State, &state);

        Ok(())
    }

    /// Update heartbeat interval (only owner can call)
    pub fn update_interval(env: Env, new_interval: u64) -> Result<(), Error> {
        let mut state: WillState = env
            .storage()
            .instance()
            .get(&DataKey::State)
            .ok_or(Error::NotInitialized)?;

        // Validate interval
        if new_interval < 60 {
            return Err(Error::InvalidInterval);
        }

        // Require owner authorization
        state.owner.require_auth();

        // Update interval
        state.heartbeat_interval = new_interval;
        env.storage().instance().set(&DataKey::State, &state);

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DigitalWillContract);
        let client = DigitalWillContractClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let beneficiary = Address::generate(&env);
        let interval = 30 * 24 * 60 * 60; // 30 days

        env.mock_all_auths();

        client.initialize(&owner, &beneficiary, &interval);

        let state = client.get_state();
        assert_eq!(state.owner, owner);
        assert_eq!(state.beneficiary, beneficiary);
        assert_eq!(state.heartbeat_interval, interval);
    }

    #[test]
    fn test_heartbeat() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DigitalWillContract);
        let client = DigitalWillContractClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let beneficiary = Address::generate(&env);
        let interval = 30 * 24 * 60 * 60;

        env.mock_all_auths();

        client.initialize(&owner, &beneficiary, &interval);

        let initial_state = client.get_state();
        let initial_heartbeat = initial_state.last_heartbeat;

        // Advance time
        env.ledger().with_mut(|li| li.timestamp = initial_heartbeat + 1000);

        client.heartbeat();

        let updated_state = client.get_state();
        assert!(updated_state.last_heartbeat > initial_heartbeat);
    }

    #[test]
    fn test_is_alive() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DigitalWillContract);
        let client = DigitalWillContractClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let beneficiary = Address::generate(&env);
        let interval = 7 * 24 * 60 * 60; // 7 days

        env.mock_all_auths();

        client.initialize(&owner, &beneficiary, &interval);

        // Should be alive initially
        assert!(client.is_alive());

        // Advance time past interval but within grace period
        let state = client.get_state();
        env.ledger().with_mut(|li| {
            li.timestamp = state.last_heartbeat + interval + (24 * 60 * 60);
        });

        // Should still be alive (grace period)
        assert!(client.is_alive());

        // Advance time past grace period
        env.ledger().with_mut(|li| {
            li.timestamp = state.last_heartbeat + interval + state.grace_period + 1;
        });

        // Should be dead
        assert!(!client.is_alive());
    }
}
