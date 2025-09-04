---
sidebar_position: 1
---

# Getting Started

The PyTFHE-rs submodule is the swiss army knife of circuit compilation and scheduling for homomorphic encryption circuits.

PyTFHE-rs is a Rust-based toolchain that processes hardware description language inputs and generates optimized execution schedules for encrypted computation.
It provides both Rust APIs and Python bindings for flexibility in different environments.
Although can be used standalone, it is one of the necessary support libraries of PyTFHE.


## Key Features

- **Multi-format Support**: FIRRTL, Yosys JSON, RTLIL input formats
- **Optimized Backends**: AIGER and LUT output formats
- **Fast Scheduling**: Greedy scheduling algorithms for optimal execution
- **Python Integration**: PyO3-based bindings


## Prerequisites

### System Requirements
- Rust toolchain (latest stable)
- Python 3.9+ (for Python bindings)
- Git with submodules support
- Node.js and npm (for tree-sitter grammar)

### Platform-specific Dependencies
```bash
# Ubuntu/Debian
sudo apt install patchelf

# RHEL
sudo dnf install patchelf
```

## Quick Start

```bash
# Build the project
cargo build --release

# Synthesize a circuit
cargo run --bin tnfs_syn -- input.fir

# Simulate a circuit
cargo run --bin tnfs_sim -- input.aig

# Create conda environment
conda create -n pytfhe python=3.9.13
conda activate pytfhe
pip install maturin

# Build and install bindings
maturin develop
```

## Basic Usage

### Command Line Tools

#### Circuit Synthesis
Convert FIRRTL circuits to optimized formats:
```bash
# Synthesize to AIGER format
cargo run --bin tnfs_syn -- test_files/Adder.lo.fir

# With compression
cargo run --bin tnfs_syn -- --compress test_files/Adder.lo.fir
```

#### Circuit Simulation
Run plaintext simulation on compiled circuits:
```bash
# Simulate AIGER circuit
cargo run --bin tnfs_sim -- test_files/Adder.aig

# With compression
cargo run --bin tnfs_sim -- --compress test_files/Adder.aig.gz
```

### Python API

#### Basic Scheduling
```python
import tnfs

# Load circuit data (binary AIGER format)
with open('circuit.aig', 'rb') as f:
    aig_data = f.read()

# Generate execution schedule
schedule = tnfs.py_greedy_scheduler(aig_data, batch_size=1000)
print(f"Generated {len(schedule)} operations")

# For LUT-based circuits
lut_schedule = tnfs.py_lut_greedy_scheduler(lut_data, batch_size=1000)
```

## Testing the Installation

### Rust Tests
```bash
# Run all tests
cargo test

# Run specific test module
cargo test scheduler_test
cargo test simulation_test
```

### Python Binding Test
```python
import tnfs
print(tnfs.py_greedy_scheduler)  # Should print function info
```

### Example Circuit
Test with a provided example:
```bash
# Synthesize the adder example
cargo run --bin tnfs_syn -- test_files/Adder.lo.fir

# Check output files
ls -la Adder.*
```
