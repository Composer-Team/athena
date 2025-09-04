---
sidebar_position: 5
---

# Benchmark Submodule

The `benchmark` module provides performance measurement utilities for evaluating FHE (Fully Homomorphic Encryption) operations. It includes both distributed (Ray-based) and serial benchmarking capabilities to measure throughput and latency of various FHE gate operations.

## Core Components

### Ray-Based Distributed Benchmarking (`ray_benchmark.py`)
Benchmarks FHE operations using Ray for parallel execution across multiple workers.

**Key Function:**
- `ray_benchmark(num: int, num_threads: int = 8)`
  - Benchmarks AND operations with inversion using distributed workers
  - Creates `num` ciphertext pairs (0,1) for testing
  - Uses `num_threads` Ray workers for parallel execution
  - Measures total throughput and average operation time

**Workflow:**
1. **Setup**: Create FHE parameters and secret key
2. **Data Preparation**: Generate `num` ciphertext pairs with values (0,1)
3. **Worker Pool**: Initialize Ray worker pool with specified thread count
4. **Execution**: Perform AND-with-invert operations in parallel
5. **Measurement**: Calculate throughput (ops/sec) and average time (μs)

**Command Line Interface:**
```bash
python -m pyTNFS.benchmark.ray_benchmark --num 10000 --num_threads 8 --ray <ray_address>
```

**Output Metrics:**
- **Throughput**: Operations per second
- **Average Time**: Microseconds per operation

### Serial Benchmarking (`serial_benchmark.py`)
Benchmarks individual FHE operations in single-threaded mode for baseline performance measurement.

**Key Functions:**
- `benchmark_imm_gen(n: int, bk)` - Benchmark immediate value generation
- `benchmark_not_gate(n: int, bk)` - Benchmark NOT gate operations  
- `benchmark_and_gate(n: int, bk)` - Benchmark AND gate operations

**Operation Types Benchmarked:**

#### Immediate Generation (`bootsCONSTANT`)
- Creates ciphertexts with constant values (0 or 1)
- Measures time to generate fresh constant ciphertexts
- Useful for measuring encryption overhead

#### NOT Gate (`bootsNOT`)
- Tests unary NOT operation on encrypted bits
- Measures single-input gate performance
- In-place operation (output overwrites input)

#### AND Gate (`bootsAND`)
- Tests binary AND operation between two encrypted bits
- Measures two-input gate performance
- Most fundamental binary FHE operation

**Measurement Process:**
1. **Preparation**: Create required ciphertexts and encrypt with random/fixed values
2. **Timing**: Measure wall-clock time for batch operations
3. **Calculation**: Compute average time per operation in microseconds
4. **Output**: Print performance metrics to console

## Usage Examples

### Distributed Benchmarking
```python
from pyTNFS.benchmark.ray_benchmark import ray_benchmark
import ray

# Initialize Ray cluster
ray.init()

# Benchmark 10,000 AND operations with 8 workers
ray_benchmark(num=10000, num_threads=8)
```

### Serial Benchmarking
```python
from pyTNFS.benchmark.serial_benchmark import *
import pyTFHE as t

# Setup FHE parameters
params = t.new_default_gate_bootstrapping_parameters(110)
sk = t.new_random_gate_bootstrapping_secret_keyset(params)
bk = sk.cloud

# Benchmark different operations
benchmark_and_gate(1000, bk)      # 1000 AND operations
benchmark_not_gate(1000, bk)      # 1000 NOT operations  
benchmark_imm_gen(1000, bk)       # 1000 constant generations
```

### Ray Cluster Benchmarking
```bash
# Connect to existing Ray cluster and run benchmark
python -m pyTNFS.benchmark.ray_benchmark \
    --num 50000 \
    --num_threads 16 \
    --ray ray://cluster-head:10001
```

## Performance Metrics

### Throughput Measurement
- **Definition**: Total operations completed per second
- **Calculation**: `num_operations / total_time`
- **Use Case**: Measuring parallel execution efficiency

### Latency Measurement  
- **Definition**: Average time per individual operation
- **Units**: Microseconds (μs) for precision
- **Calculation**: `total_time / num_operations * 1e6`
- **Use Case**: Measuring single operation performance
