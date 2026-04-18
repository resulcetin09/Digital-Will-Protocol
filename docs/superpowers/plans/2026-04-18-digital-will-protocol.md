# Digital Will Protocol Implementation Plan

## PHASE 1: Soroban Contract

### Task 1: Proje iskeletini kur
- [ ] Step 1: rustup target add wasm32-unknown-unknown
- [ ] Step 2: cargo install --locked soroban-cli
- [ ] Step 3: contract/Cargo.toml olustur
- [ ] Step 4: contract/src/error.rs olustur
- [ ] Step 5: contract/src/state.rs olustur
- [ ] Step 6: contract/src/lib.rs stub olustur
- [ ] Step 7: cargo build --target wasm32-unknown-unknown --release
- [ ] Step 8: git commit

### Task 2: initialize ve deposit
- [ ] Step 1: test.rs olustur, testleri yaz
- [ ] Step 2: cargo test fail dogrula
- [ ] Step 3: implement et
- [ ] Step 4: cargo test PASS dogrula
- [ ] Step 5: git commit

### Task 3: heartbeat ve trigger
- [ ] Step 1: testleri yaz
- [ ] Step 2: fail dogrula
- [ ] Step 3: implement et
- [ ] Step 4: PASS dogrula
- [ ] Step 5: git commit

### Task 4: execute ve withdraw
- [ ] Step 1: testleri yaz (reserve edge case dahil)
- [ ] Step 2: fail dogrula
- [ ] Step 3: implement et
- [ ] Step 4: cargo test -- --nocapture
- [ ] Step 5: git commit

### Task 5: Integration testi
- [ ] Step 1: lifecycle testi yaz
- [ ] Step 2: zaman manipulasyonu
- [ ] Step 3: cargo test
- [ ] Step 4: git commit

## PHASE 2: Frontend

### Task 6: React projesi kur
- [ ] Step 1: Vite + React + TypeScript
- [ ] Step 2: stellar-sdk ve freighter-api ekle
- [ ] Step 3: routing kur
- [ ] Step 4: npm run build dogrula
- [ ] Step 5: git commit

### Task 7: contract client ve types
- [ ] Step 1: WillState enum ve WillInfo interface
- [ ] Step 2: kontrat fonksiyon wrappers
- [ ] Step 3: getState ve getBalance
- [ ] Step 4: git commit

### Task 8: hooks
- [ ] Step 1: useWallet
- [ ] Step 2: useWill polling
- [ ] Step 3: git commit

### Task 9: Setup ekrani
- [ ] Step 1: form inputlar
- [ ] Step 2: 2 XLM validasyon
- [ ] Step 3: Freighter imzalama
- [ ] Step 4: git commit

### Task 10: Dashboard ekrani
- [ ] Step 1: StateDisplay
- [ ] Step 2: CountdownBanner
- [ ] Step 3: Heartbeat butonu
- [ ] Step 4: Itiraz Et butonu
- [ ] Step 5: Withdraw
- [ ] Step 6: testler
- [ ] Step 7: git commit

### Task 11: Beneficiary ekrani
- [ ] Step 1: URL param kontrat adresi
- [ ] Step 2: state ve countdown
- [ ] Step 3: Execute butonu
- [ ] Step 4: sifir bakiye kontrolu
- [ ] Step 5: git commit
