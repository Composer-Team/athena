---
sidebar_position: 2
---

# Circuit Applications with AIGER Tools

## Overview

The `aiger_tools/` directory under `pyTFHE-CPU` provides comprehensive utilities for working with Boolean circuits in the AIGER (And-Inverter Graph) format using PyTFHE.
AIGER is a standard format for representing Boolean circuits as directed acyclic graphs.

## Key Components

### Circuit Parsing (`parse_aiger.py`)
Converts AIGER format files into NetworkX directed graphs for processing.

```python
from aiger_tools.parse_aiger import parse_aiger_to_nxg

# Parse an AIGER file into a graph structure
graph, inputs_map, outputs_map = parse_aiger_to_nxg("circuit.aig")
```

**Features:**
- Parses standard AIGER format files
- Maps symbolic input/output names to node IDs
- Converts circuits into NetworkX DiGraph objects
- Handles inversion flags for gate inputs

### Circuit Simulation (`simulate.py`)
Provides both plaintext and homomorphic encrypted simulation of Boolean circuits.

#### Plaintext Simulation
```python
from aiger_tools.simulate import pt_simulate

# Simulate circuit in plaintext
inputs = {input_node1: 1, input_node2: 0}  # Input values
outputs = [output_node1, output_node2]     # Output nodes to evaluate
result = pt_simulate(circuit_graph, inputs, outputs)
```

#### Homomorphic Encrypted Simulation
```python
from aiger_tools.simulate import tfhe_simulate

# Simulate circuit homomorphically (fully encrypted)
inputs = {input_node1: 1, input_node2: 0}
outputs = [output_node1, output_node2]
encrypted_result = tfhe_simulate(circuit_graph, inputs, outputs, verbose=True)
```

**Key Functions:**
- `encrypt_input()`: Encrypts plaintext inputs for homomorphic computation
- `tfhe_encrypted_simulate()`: Core homomorphic circuit evaluation
- `decrypt_output()`: Decrypts homomorphic results back to plaintext
- `poke_input()`: Helper for converting integers to binary input vectors

## Practical Use Cases

### 1. Arithmetic Circuits
Example from the codebase shows 8-bit addition:

```python
# Parse an 8-bit adder circuit
graph, inputs_map, outputs_map = parse_aiger_to_nxg("add.aig")

# Create inputs for 4 + 4
inputs_dict = poke_input(4, 4, list(inputs_map.values()))

# Run homomorphic addition
tfhe_result = tfhe_simulate(graph, inputs_dict, list(outputs_map.values()))
plaintext_result = pt_simulate(graph, inputs_dict, list(outputs_map.values()))

# Results should match
assert tfhe_result == plaintext_result
```

### 2. Performance Benchmarking (`benchmark.py`)
Measure performance of different TFHE operations:

```python
from aiger_tools.benchmark import benchmark_and_gate, benchmark_not_gate

# Setup TFHE parameters
params = pyTFHE.new_default_gate_bootstrapping_parameters(110)
sk = pyTFHE.new_random_gate_bootstrapping_secret_keyset(params)
bk = sk.cloud

# Benchmark different operations
benchmark_and_gate(100, bk)    # ~100ms per AND gate
benchmark_not_gate(100, bk)    # ~50ms per NOT gate
```

**Benchmark Results:**
- **Constant generation**: ~microseconds
- **NOT gate**: ~50ms per operation
- **AND gate**: ~100ms per operation

### 3. Distributed Computing (`and_test.py`)
Scale TFHE computations across multiple workers using Ray:

```python
import ray
from aiger_tools.and_test import test_and_tfhe

# Distributed AND-tree computation
@ray.remote
def test_and_tfhe(depth=10):
    # Creates an AND tree with given depth
    # Returns 0 if any input is 0, 1 if all inputs are 1

ray.init()
# Run 100 parallel AND computations with depth 1000
results = ray.get([test_and_tfhe.remote(depth=1000) for _ in range(100)])
```

### 4. Circuit Fuzzing and Verification (`fuzzing.py`)
Automated testing to verify TFHE computation correctness:

```python
from aiger_tools.fuzzing import fuzzing_one
from aiger_tools.random_aig_gen import random_aig_gen

# Generate random circuit
circuit, inputs, outputs = random_aig_gen(nodes=100, edges=200)

# Random input testing
input_dict = {inp: random.randint(0, 1) for inp in inputs}

# Verify TFHE matches plaintext
_, pt_result, tfhe_result = fuzzing_one(circuit, input_dict, outputs)
assert pt_result == tfhe_result, "TFHE computation error!"
```

### 5. Random Circuit Generation (`random_aig_gen.py`)
Generate synthetic circuits for testing and benchmarking:

```python
from aiger_tools.random_aig_gen import random_aig_gen

# Generate random DAG-based circuit
graph, inputs, outputs = random_aig_gen(
    n=1000,     # Number of nodes
    m=2000,     # Number of edges  
    verbose=True
)

# Circuit characteristics
num_gates = len(graph.nodes) - len(inputs)
circuit_depth = nx.dag_longest_path_length(graph)
```
