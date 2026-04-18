use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract already initialized
    AlreadyInitialized = 1,
    /// Contract not initialized
    NotInitialized = 2,
    /// Caller is not the owner
    Unauthorized = 3,
    /// Grace period has not expired yet
    GracePeriodNotExpired = 4,
    /// Owner is still alive (heartbeat is recent)
    OwnerStillAlive = 5,
    /// Invalid beneficiary address
    InvalidBeneficiary = 6,
    /// Invalid heartbeat interval
    InvalidInterval = 7,
    /// Insufficient balance
    InsufficientBalance = 8,
}
