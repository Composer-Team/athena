---
sidebar_position: 3
---

# PyTFHE-CUDA

PyTFHE-CUDA is the CUDA backend for Boolean TFHE program execution.
It can be used as a low-level standalone library, and also by other components in PyTFHE.
The implementation is based on [cuFHE](https://github.com/vernamlab/cuFHE).

## Installation

### System Requirements
- Linux (tested on Ubuntu/CentOS)
- CUDA-compatible GPU
- Python 3.6 or later

#### Required Dependencies
- **CUDA Toolkit** (version 13.0 or compatible)
- **pybind11** - Python binding generator
- **python3-dev** - Python development headers
- **clang-15** (preferred) or **clang** - C++ compiler
- **CMake 3.12+** - Build system

#### Installing Dependencies

Ubuntu/Debian
```bash
# Install basic dependencies
sudo apt update
sudo apt install python3-dev cmake ninja-build

# Install CUDA Toolkit (replace with your preferred version)
# Follow NVIDIA's official installation guide for CUDA 11.8

# Install clang-15 (recommended)
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"

# Install pybind11
pip3 install pybind11
```

CentOS/RHEL
```bash
# Install basic dependencies  
sudo yum install python3-devel cmake ninja-build

# Install CUDA Toolkit from NVIDIA repositories
# Install clang-15 or clang from EPEL/developer repositories

# Install pybind11
pip3 install pybind11
```

#### Installation

```bash
# Clone the repository
git clone https://github.com/jiaaom/pyTFHE-CUDA
cd pyTFHE-CUDA

# Install directly
pip3 install .
```

## Core TFHE Types

### Parameters (`include/tfhe.h`)

The TFHE library uses a `Param` struct to configure cryptographic parameters:

```cpp
struct Param {
    uint32_t lwe_n_;                        // LWE dimension (default: 500)
    uint32_t tlwe_n_;                       // TLWE dimension (default: 1024)
    uint32_t tlwe_k_;                       // TLWE rank (default: 1)
    uint32_t tgsw_decomp_bits_;             // TGSW decomposition bits (default: 10)
    uint32_t tgsw_decomp_size_;             // TGSW decomposition size (default: 2)
    uint32_t keyswitching_decomp_bits_;     // Key switching decomp bits (default: 2)
    uint32_t keyswitching_decomp_size_;     // Key switching decomp size (default: 8)
    double lwe_noise_;                      // LWE noise level (default: 2^-15)
    double tlwe_noise_;                     // TLWE noise level (default: 9e-9)
};
```

### Key Types

**Private Key (`PriKey`)**
- Contains LWE and TLWE keys for encryption/decryption
- Required for client-side operations

**Public Key (`PubKey`)**
- Contains bootstrapping key and key-switching key
- Used for homomorphic evaluation on server

**Ciphertext (`Ctxt`)**
- Encrypts binary plaintexts {0, 1}
- Maintains both host and device copies of LWE samples

**Plaintext (`Ptxt`)**
- Simple wrapper for binary messages
- Automatically constrains values to {0, 1}

## Graph-Based Evaluation

### BTGM Class (`include/tfhe_graph.cuh`)

The **BTGM** (Boolean TFHE Graph Manager) class provides graph-based homomorphic evaluation:

**Core Methods:**

```cpp
// Initialize CUDA and generate/load keypairs
void init();
void load_keys();

// Build computation graph
void add_ctxt(Batch* batch, int ctxt_id, int value);
void add_gate(Batch* batch, int gate_id, int op_type, int input1, int input2, int output);
void add_lut2(Batch* batch, int lut_value, int input1, int input2, int output, int uid=-1);

// Execute computation
void build_dependency_graph(Batch* batch, bool verbose = false);
void eval(Batch* batch, bool non_blocking);

// Retrieve results
int get_value(Batch* batch, int ctxt_id);

// Persistence
void save_ctxt(Batch* batch, int ctxt_id, const char* filename);
void reset(Batch* batch);
```

### Batch Class

The `Batch` class manages GPU graph execution:
- CUDA graph representation of operations
- Ciphertext storage and device memory management
- Dependency tracking between gates

### Gate Types

The following gate types are supported (defined in `tfhe_graph.cuh`):

| Gate | Internal Op ID | Description |
|------|-------|-------------|
| NAND | 0 | Not AND |
| OR | 1 | Logical OR |
| AND | 2 | Logical AND |
| NOR | 3 | Not OR |
| XOR | 4 | Exclusive OR |
| XNOR | 5 | Not XOR |
| ANDNY | 6 | (NOT input1) AND input2 |
| ANDYN | 7 | input1 AND (NOT input2) |
| ORNY | 8 | (NOT input1) OR input2 |
| ORYN | 9 | input1 OR (NOT input2) |
| NOT | 10 | Logical NOT |
| CONST_0 | 11 | Constant 0 |
| CONST_1 | 12 | Constant 1 |
| COPY | 13 | Copy operation |

## GPU Kernels

### Bootstrapping Operations

**Key Functions:**
```cpp
// Transform bootstrapping key to NTT domain
void BootstrappingKeyToNTT_(const BootstrappingKey* bk,
                           BootstrappingKeyNTT*& bk_ntt,
                           CuNTTHandler<>*& ntt_handler,
                           MemoryDeleter*& bk_ntt_deleter);

// Copy key-switching key to GPU device
void KeySwitchingKeyToDevice_(const KeySwitchingKey* ksk,
                             KeySwitchingKey*& ksk_dev,
                             MemoryDeleter*& ksk_dev_deleter);
```

**Memory Transfer:**
```cpp
// Copy ciphertext between host and device
void CtxtCopyH2D(const Ctxt& c, cudaStream_t stream);
void CtxtCopyD2H(const Ctxt& c, cudaStream_t stream);
```

## Client/Server API Functions

### Key Management

```cpp
void SetSeed(uint32_t seed);
void PriKeyGen(PriKey& pri_key);
void PubKeyGen(PubKey& pub_key, const PriKey& pri_key);
void KeyGen(PubKey& pub_key, PriKey& pri_key);
```

### Encryption/Decryption

```cpp
void Encrypt(Ctxt& ctxt, const Ptxt& ptxt, const PriKey& pri_key);
void Encrypt(Ctxt& ctxt, int msg, const PriKey& pri_key);
void Decrypt(Ptxt& ptxt, const Ctxt& ctxt, const PriKey& pri_key);
int Decrypt(Ctxt& ctxt, const PriKey& pri_key);
```

### File I/O

```cpp
void WritePriKeyToFile(const PriKey& pri_key, FileName file);
void ReadPriKeyFromFile(PriKey& pri_key, FileName file);
void WritePubKeyToFile(const PubKey& pub_key, FileName file);
void ReadPubKeyFromFile(PubKey& pub_key, FileName file);
void WriteCtxtToFile(const Ctxt& ct, FileName file);
void ReadCtxtFromFile(Ctxt& ct, FileName file);
```

## Usage Example

```cpp
#include "tfhe_graph.cuh"

// Initialize CUDA
init_cuda();
BTGM evaluator;
Batch batch;

// Add ciphertexts
evaluator.add_ctxt(&batch, 0, 0);  // ctxt[0] = encrypt(0)
evaluator.add_ctxt(&batch, 1, 1);  // ctxt[1] = encrypt(1)

// Add gates
evaluator.add_gate(&batch, 0, XOR, 0, 1, 2);  // ctxt[2] = ctxt[0] XOR ctxt[1]

// Build and execute
evaluator.build_dependency_graph(&batch);
evaluator.eval(&batch, false);

// Get result
int result = evaluator.get_value(&batch, 2);  // Should be 1
```
