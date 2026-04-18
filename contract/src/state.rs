use soroban_sdk::{contracttype, Address};

/// Main contract state
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WillState {
    /// Owner of the will
    pub owner: Address,
    /// Beneficiary who will receive assets
    pub beneficiary: Address,
    /// Heartbeat interval in seconds
    pub heartbeat_interval: u64,
    /// Last heartbeat timestamp
    pub last_heartbeat: u64,
    /// Grace period in seconds (default 72 hours)
    pub grace_period: u64,
    /// Whether the contract is initialized
    pub initialized: bool,
}

impl WillState {
    pub fn new(
        owner: Address,
        beneficiary: Address,
        heartbeat_interval: u64,
        current_time: u64,
    ) -> Self {
        Self {
            owner,
            beneficiary,
            heartbeat_interval,
            last_heartbeat: current_time,
            grace_period: 72 * 60 * 60, // 72 hours
            initialized: true,
        }
    }

    /// Check if owner is considered alive
    pub fn is_owner_alive(&self, current_time: u64) -> bool {
        current_time < self.last_heartbeat + self.heartbeat_interval + self.grace_period
    }

    /// Check if grace period has expired
    pub fn can_execute(&self, current_time: u64) -> bool {
        current_time >= self.last_heartbeat + self.heartbeat_interval + self.grace_period
    }
}

/// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    State,
}
