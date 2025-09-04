---
sidebar_position: 1
---

# PyTFHE-CPU

## Overview

This submodule provides the Python binding for executing Boolean TFHE programs on CPU.

The original C implementation is based on [libtfhe](https://github.com/tfhe/tfhe).

This submodule can be used standalone as low-level APIs for TFHE program developers, and it is also required by other modules in PyTFHE.

## Installation Guide

### Prerequisites

- `clang` (`clang-15` tested)

### Clone the Repository

```bash
git clone https://github.com/jiaaom/pyTFHE-CPU
cd pyTFHE-CPU
```

### Install the Package

```bash
pip install .
```

Expected output:

```
Successfully installed pyTFHE-0.9
```

## Usage Guide

### Serialization

Supports Python pickling for distributed computing:

```python
import pickle
ct = LweSample(params)
# Serialize
data = pickle.dumps(ct)
# Deserialize
ct_restored = pickle.loads(data)
```

### Key Generation Functions

```python
params = pyTFHE.new_default_gate_bootstrapping_parameters(110)
sk = pyTFHE.new_random_gate_bootstrapping_secret_keyset(params)
```

- **`new_default_gate_bootstrapping_parameters(minimum_lambda: int)`**
  - Generate default secure parameters for gate bootstrapping.
  - Parameters:
    - `minimum_lambda (int)`: Security parameter (typically 110 or 128)
  - Returns: `TFheGateBootstrappingParameterSet`

- **`new_random_gate_bootstrapping_secret_keyset(params)`**
  - Generate a random secret key set.
  - Parameters:
    - `params (TFheGateBootstrappingParameterSet)`: Parameter set
  - Returns: `TFheGateBootstrappingSecretKeySet`

### Encryption / Decryption

```python
ct = pyTFHE.new_gate_bootstrapping_ciphertext(params)
pyTFHE.bootsSymEncrypt(ct, 1, sk)
bit = pyTFHE.bootsSymDecrypt(ct, sk)
```

- **`new_gate_bootstrapping_ciphertext(params)`**
  - Create a new uninitialized ciphertext.

- **`bootsSymEncrypt(ciphertext, plaintext, secret_key)`**
  - Encrypt a bit using symmetric encryption.
  - Parameters:
    - `ciphertext (LweSample)`: Output ciphertext
    - `plaintext (int)`: Bit to encrypt (0 or 1)
    - `secret_key (TFheGateBootstrappingSecretKeySet)`: Secret key

- **`bootsSymDecrypt(ciphertext, secret_key)`**
  - Decrypt a ciphertext to recover the bit.
  - Returns: `int` (0 or 1)

### Homomorphic Boolean Gates

All gate functions perform homomorphic operations on encrypted bits.

#### Basic Gates

```python
pyTFHE.bootsAND(result, input1, input2, cloud_key)
pyTFHE.bootsOR(result, input1, input2, cloud_key)
pyTFHE.bootsXOR(result, input1, input2, cloud_key)
pyTFHE.bootsNOT(result, input, cloud_key)
pyTFHE.bootsNAND(result, input1, input2, cloud_key)
```

#### Extended Gates

```python
pyTFHE.bootsNOR(result, input1, input2, cloud_key)
pyTFHE.bootsXNOR(result, input1, input2, cloud_key)
pyTFHE.bootsCOPY(result, input, cloud_key)
pyTFHE.bootsMUX(result, input1, input2, input3, cloud_key)
```

#### Compound Gates

```python
pyTFHE.bootsANDYN(result, input1, input2, cloud_key)
pyTFHE.bootsANDNY(result, input1, input2, cloud_key)
pyTFHE.bootsORYN(result, input1, input2, cloud_key)
pyTFHE.bootsORNY(result, input1, input2, cloud_key)
```

#### Look-Up Table

```python
lut_value = 0b1000  # AND function
pyTFHE.lut2(lut_value, result, input1, input2, cloud_key)
```

- `lut2(lut_value, result, input1, input2, bootstrapping_key)` evaluates a 2-input lookup table homomorphically.

### Memory Management

#### Deletion Functions

```python
pyTFHE.delete_gate_bootstrapping_ciphertext(ct)
pyTFHE.delete_gate_bootstrapping_secret_keyset(sk)
pyTFHE.delete_gate_bootstrapping_cloud_keyset(bk)
pyTFHE.delete_gate_bootstrapping_parameters(params)
```

#### Example Usage

```python
import pyTFHE as tfhe

# Setup
params = tfhe.new_default_gate_bootstrapping_parameters(110)
sk = tfhe.new_random_gate_bootstrapping_secret_keyset(params)
cloud_key = sk.cloud

# Create ciphertexts
ct1 = tfhe.new_gate_bootstrapping_ciphertext(params)
ct2 = tfhe.new_gate_bootstrapping_ciphertext(params)
result = tfhe.new_gate_bootstrapping_ciphertext(params)

# Encrypt bits
tfhe.bootsSymEncrypt(ct1, 1, sk)
tfhe.bootsSymEncrypt(ct2, 0, sk)

# Homomorphic AND operation
tfhe.bootsAND(result, ct1, ct2, cloud_key)

# Decrypt result
output = tfhe.bootsSymDecrypt(result, sk)
print(f"1 AND 0 = {output}")  # Should print 0

# Cleanup
tfhe.delete_gate_bootstrapping_ciphertext(ct1)
tfhe.delete_gate_bootstrapping_ciphertext(ct2)
tfhe.delete_gate_bootstrapping_ciphertext(result)
tfhe.delete_gate_bootstrapping_secret_keyset(sk)
tfhe.delete_gate_bootstrapping_parameters(params)
```
