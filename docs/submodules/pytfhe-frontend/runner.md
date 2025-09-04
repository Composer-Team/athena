---
sidebar_position: 4
---

# Boolean TFHE Program Runner

The `runner` module provides the core execution engines for running FHE circuits. It supports multiple execution backends including CPU (serial and Ray distributed), GPU (CUDA), and various FHE libraries (pyTFHE, cuFHE). The module handles scheduling, batching, and parallel execution of FHE operations.

## Core Components

### Main Execution Engines

#### CPU Execution (`main.py`)
Main entry point for CPU-based FHE circuit execution with Ray distributed computing.

**Key Features:**
- Command-line interface for circuit execution
- Ray cluster integration for distributed computing
- LUT-based circuit execution
- Support for both serial and parallel modes

**Usage:**
```bash
python -m pyTNFS.runner.main -i circuit.lut -c 8 --ray ray://cluster:10001
```

**Workflow:**
1. Load and decompress LUT binary circuit
2. Initialize FHE parameters and keys
3. Create input ciphertexts
4. Schedule operations using greedy scheduler
5. Execute using Ray workers or serial execution
6. Collect and decrypt outputs

#### GPU Execution (`main_gpu.py`)
CUDA GPU-accelerated execution using pyTFHEGPU backend.

**Key Features:**
- CUDA acceleration for FHE operations
- Batch processing with configurable batch sizes
- Megabatch support for large circuits
- GPU memory management

**Key Function:**
- `gpu_execute(filename: str, batchsize: int, megabatch_size: int)`
  - Loads circuit from file (supports gzip compression)
  - Schedules operations using LUT greedy scheduler
  - Executes in batches on GPU
  - Manages GPU memory and timing

### Ray-Based Distributed Computing

#### Worker Pool (`ray_worker.py`)
Distributed worker management for parallel FHE execution.

**Key Classes:**
- `TFHEWorker` - Remote Ray actor for FHE operations
- `TFHETqdm` - Distributed progress tracking
- `WorkerPool` - Manages pool of TFHEWorker instances

**TFHEWorker Operations:**
- `and_invert(a, a_ivt, b, b_ivt)` - AND with optional input inversion
- `lut2(lut, a, b)` - 2-input LUT evaluation
- `lut1(lut, a)` - 1-input LUT evaluation
- `copy_ct(ct)` - Ciphertext copying

**WorkerPool Features:**
- Automatic load balancing across workers
- Progress tracking with tqdm
- Configurable worker count
- Efficient task distribution

### Circuit Execution Runners

#### LUT-Based Runner (`tnfs_lut2_runner.py`)
Executes circuits using Look-Up Table (LUT) representation.

**Key Functions:**
- `tnfs_lut2_runner(schedule, input_state, output, bk, num_workers=8)`
  - Distributed execution using Ray workers
  - Handles 2-input LUT operations
  - Manages circuit state throughout execution

- `tnfs_lut2_runner_serial(schedule, input_state, output, bk, num_workers=1)`
  - Serial execution for single-threaded mode
  - Same functionality as distributed version
  - Useful for debugging and small circuits

#### TFHE Runners (`tfhe_*.py`)
Various TFHE execution strategies:

- **`tfhe_serial.py`** - Single-threaded TFHE execution
- **`tfhe_ray.py`** - Ray distributed TFHE execution  
- **`tfhe_ray_schedule.py`** - Advanced Ray scheduling strategies

### Alternative FHE Backends

#### cuFHE Integration (`cuFHE_runner.py`, `cufhe_benchmark_driver.py`)
Integration with cuFHE library for GPU acceleration.

- Supports cuFHE GPU kernels
- Benchmark drivers for performance measurement
- Alternative to pyTFHEGPU backend

#### LibFHE Support (`libfhe.py`)
Generic FHE library integration interface.

### Benchmarking and Profiling

#### GPU Benchmarking (`gpu_benchmark_driver.py`)
Performance measurement for GPU execution:
- Throughput measurement
- Latency profiling
- Memory usage tracking
- Batch size optimization

#### Sweep Testing (`sweep.py`)
Parameter sweep testing for optimization:
- Batch size sweeps
- Worker count optimization
- Performance parameter tuning

## Execution Modes

### Serial Execution
- Single-threaded execution on CPU
- Good for debugging and small circuits
- Minimal resource requirements
- Command: `python -m pyTNFS.runner.main -i circuit.lut -c 1`

### Ray Distributed Execution
- Multi-worker parallel execution on CPU cluster
- Scalable across multiple machines
- Automatic load balancing
- Command: `python -m pyTNFS.runner.main -i circuit.lut -c 16 --ray ray://head:10001`

### GPU Execution
- CUDA-accelerated execution
- High throughput for large circuits
- Requires NVIDIA GPU with CUDA support
- Command: `python -m pyTNFS.runner.main_gpu circuit.lut 1024 102400`

## Circuit Format Support

### LUT Binary Format
- Look-Up Table representation of circuits
- Efficient 2-input gate operations
- Compressed storage with gzip support
- Optimized for parallel execution

### TNFS Binary Format
- Threshold Network File System format
- Direct circuit representation
- Support for various gate types
- Compatible with scheduling algorithms

## Performance Optimization

### Batching Strategies
- **Batch Size**: Controls memory vs. parallelism trade-off
- **Megabatches**: Handle very large circuits by subdividing
- **Dynamic Batching**: Adjust batch sizes based on circuit characteristics

### Memory Management
- Ray object store for distributed ciphertext sharing
- GPU memory allocation and deallocation
- Garbage collection integration for large circuits

### Scheduling Integration
- Uses `tnfs` module scheduling algorithms
- Greedy scheduling for LUT-based circuits
- Optimization for both serial and parallel execution

## Usage Examples

### Basic Circuit Execution
```python
from pyTNFS.runner.main import *
import pyTFHE as t

# Setup FHE parameters
params = t.new_default_gate_bootstrapping_parameters(110)
sk = t.new_random_gate_bootstrapping_secret_keyset(params)

# Load and execute circuit
with open("circuit.lut", "rb") as f:
    binary_data = f.read()
    
# Execute with 8 workers
results = execute_circuit(binary_data, sk, num_workers=8)
```

### GPU Execution
```python
from pyTNFS.runner.main_gpu import gpu_execute

# Execute on GPU with specified batch sizes
gpu_execute("circuit.lut.gz", batchsize=1024, megabatch_size=102400)
```

### Ray Cluster Setup
```python
import ray
from pyTNFS.runner.tnfs_lut2_runner import tnfs_lut2_runner

# Connect to Ray cluster
ray.init(address="ray://cluster-head:10001")

# Execute distributed
results = tnfs_lut2_runner(schedule, inputs, outputs, bk, num_workers=32)
```
