---
sidebar_position: 1
---

# PyTFHE-CPU

## Overview

This submodule provides the Python binding for executing Boolean TFHE programs on CPU.

The original C implementation is based on [libtfhe](https://github.com/tfhe/tfhe).

This submodule can be used standalone as low-level APIs for TFHE program developers, it is also required by other modules in PyTFHE.

## Installation Guide

### Prerequisites

`clang` (`clang-15` tested)


### Clone the repository

```bash
git clone https://github.com/jiaaom/pyTFHE-CPU
cd pyTFHE-CPU
```

### Install the package
pip install .

You should see output confirming successful installation:

`Successfully installed pyTFHE-0.9`

## Usage Guide

### Serialization:

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

`new_default_gate_bootstrapping_parameters(minimum_lambda: int)`

Generate default secure parameters for gate bootstrapping.

  `params = pyTFHE.new_default_gate_bootstrapping_parameters(110)`

Parameters:
  - minimum_lambda (int): Security parameter (typically 110 or 128)

Returns: TFheGateBootstrappingParameterSet

  `new_random_gate_bootstrapping_secret_keyset(params)`

  Generate a random secret key set.

  `sk = pyTFHE.new_random_gate_bootstrapping_secret_keyset(params)`

  Parameters:
  - params (TFheGateBootstrappingParameterSet): Parameter set

  Returns: `TFheGateBootstrappingSecretKeySet`

### Encryption/Decryption

  `new_gate_bootstrapping_ciphertext(params)`

  Create a new uninitialized ciphertext.

  `ct = pyTFHE.new_gate_bootstrapping_ciphertext(params)`

  `bootsSymEncrypt(ciphertext, plaintext, secret_key)`

  Encrypt a bit using symmetric encryption.

  ```python
  pyTFHE.bootsSymEncrypt(ct, 1, sk)  # Encrypt bit value 1
  ```

  Parameters:
  - ciphertext (LweSample): Output ciphertext
  - plaintext (int): Bit to encrypt (0 or 1)
  - secret_key (TFheGateBootstrappingSecretKeySet): Secret key

  `bootsSymDecrypt(ciphertext, secret_key)`

  Decrypt a ciphertext to recover the bit.

  ```python
  bit = pyTFHE.bootsSymDecrypt(ct, sk)
  ```

  Returns: int (0 or 1)

### Homomorphic Boolean Gates

All gate functions perform homomorphic operations on encrypted bits:

#### Basic Gates

  # AND gate
  pyTFHE.bootsAND(result, input1, input2, cloud_key)

  # OR gate
  pyTFHE.bootsOR(result, input1, input2, cloud_key)

  # XOR gate
  pyTFHE.bootsXOR(result, input1, input2, cloud_key)

  # NOT gate
  pyTFHE.bootsNOT(result, input, cloud_key)

  # NAND gate
  pyTFHE.bootsNAND(result, input1, input2, cloud_key)

#### Extended Gates

  # NOR gate
  pyTFHE.bootsNOR(result, input1, input2, cloud_key)

  # XNOR gate
  pyTFHE.bootsXNOR(result, input1, input2, cloud_key)

  # Copy operation
  pyTFHE.bootsCOPY(result, input, cloud_key)

  # Multiplexer (if input1 then input2 else input3)
  pyTFHE.bootsMUX(result, input1, input2, input3, cloud_key)

#### Compound Gates

  # AND with second input negated
  pyTFHE.bootsANDYN(result, input1, input2, cloud_key)

  # AND with first input negated
  pyTFHE.bootsANDNY(result, input1, input2, cloud_key)

  # OR with second input negated
  pyTFHE.bootsORYN(result, input1, input2, cloud_key)

  # OR with first input negated
  pyTFHE.bootsORNY(result, input1, input2, cloud_key)

#### Look-Up Table

  lut2(lut_value, result, input1, input2, bootstrapping_key)

  Evaluate a 2-input lookup table homomorphically.

- Define truth table (4 bits for 2-input function)
  ```python
  lut_value = 0b1000  # AND function: only 1 when both inputs are 1
  pyTFHE.lut2(lut_value, result, input1, input2, cloud_key)
  ```


### Memory Management

  Deletion Functions

  # Clean up ciphertexts
  pyTFHE.delete_gate_bootstrapping_ciphertext(ct)

  # Clean up key sets
  pyTFHE.delete_gate_bootstrapping_secret_keyset(sk)
  pyTFHE.delete_gate_bootstrapping_cloud_keyset(bk)

  # Clean up parameters
  pyTFHE.delete_gate_bootstrapping_parameters(params)


  Example Usage

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