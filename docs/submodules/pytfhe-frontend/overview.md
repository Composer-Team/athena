---
sidebar_position: 1
---

# PyTFHE-Frontend Overview

## Introduction

PyTFHE-Frontend is a comprehensive Python framework for Fully Homomorphic Encryption (FHE) circuit execution. It serves as the frontend interface for PyTFHE libraries, providing scheduling, assembly, and execution capabilities for encrypted computations. The project enables developers to run complex Boolean circuits on encrypted data while maintaining cryptographic security.

## Project Architecture

### High-Level Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Circuit Input │    │   Scheduling    │    │   Execution     │
│                 │    │                 │    │                 │
│ • AIGER Format  │───▶│ • Greedy        │───▶│ • CPU (Serial)  │
│ • XLS IR        │    │ • LUT-based     │    │ • CPU (Ray)     │
│ • Binary TASM   │    │ • Dependency    │    │ • GPU (CUDA)    │
│                 │    │   Resolution    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Data Flow

1. **Circuit Loading**: Import circuits from various formats (AIGER, XLS IR, TASM binary)
2. **Graph Representation**: Convert to NetworkX-based AigerGraph objects
3. **Scheduling**: Generate execution order using dependency-aware algorithms
4. **Execution**: Run on CPU (serial/distributed) or GPU with FHE operations
5. **Result Collection**: Decrypt and return computed outputs

## Supported Circuit Formats

### AIGER Format
- **Purpose**: Standard format for And-Inverter Graphs
- **Usage**: Circuit specification and interchange
- **File Extension**: `.aag` (ASCII), `.aig` (binary)
- **Processing**: Parsed into NetworkX graphs via `aiger_tools`

### XLS Intermediate Representation
- **Purpose**: Google's XLS hardware synthesis tool output
- **Usage**: High-level synthesis to Boolean circuits
- **File Extension**: `.bool.ir` (boolean-optimized IR)
- **Processing**: Converted to TASM via `xls_ir2tasm`

### TASM Binary Format
- **Purpose**: Optimized binary format for FHE execution
- **Usage**: Direct input to execution engines
- **File Extension**: `.tasm` (optionally gzip compressed)
- **Processing**: Native format for `runner` modules

## Execution Backends

### CPU Execution
- **Serial Mode**: Single-threaded execution for debugging and small circuits
- **Ray Distributed**: Multi-worker parallel execution across CPU cores/machines
- **Library**: pyTFHE (CPU-optimized FHE operations)
- **Use Cases**: Development, testing, moderate-scale computation

### GPU Execution  
- **CUDA Acceleration**: High-performance GPU execution
- **Batch Processing**: Configurable batch sizes for memory optimization
- **Library**: pyTFHEGPU (CUDA-accelerated FHE operations)
- **Use Cases**: Large-scale computation, high-throughput applications

### Alternative Backends
- **cuFHE Integration**: Alternative GPU FHE library support
- **Hybrid Execution**: Combining CPU and GPU resources

## Development Workflow

### Circuit Development Pipeline
1. **Design**: Create circuit specification (AIGER, XLS)
2. **Convert**: Transform to optimized TASM binary format
3. **Simulate**: Validate with plain-text simulation
4. **Test**: Run small-scale FHE execution
5. **Scale**: Deploy on distributed/GPU infrastructure
6. **Benchmark**: Measure performance and optimize

### Testing Strategy
- **Unit Tests**: Individual module functionality
- **Integration Tests**: Multi-module workflows
- **Performance Tests**: Throughput and latency measurement
- **Stress Tests**: Long-running stability validation
- **Regression Tests**: Continuous integration validation

## Performance Characteristics

### Scalability Factors
- **Circuit Size**: Number of gates and circuit depth
- **Batch Size**: Operations processed simultaneously
- **Worker Count**: Parallel execution threads/processes
- **Memory**: Available RAM for ciphertext storage

### Optimization Strategies
- **Scheduling**: Dependency-aware parallel execution
- **Batching**: Group operations for efficiency
- **Caching**: Reuse computed intermediate results
- **Memory Management**: Efficient ciphertext lifecycle

## Installation and Setup

### Prerequisites
```bash
# Create conda environment
conda create -n pytfhe python=3.9.13
conda activate pytfhe

# Update submodules (for backend libraries)
git submodule update --init --recursive

# Install dependencies
pip install -r requirements.txt
```

### Backend Configuration
- **pyTFHE**: Symbolic link to `../pyTFHE-CPU`
- **pyTFHE_GPU**: Symbolic link to `../pyTFHE-CUDA`
- **Verification**: Ensure backend directories exist and are properly compiled

## Common Usage Patterns

### Basic Circuit Execution
```bash
# CPU execution with 8 workers
python -m pyTNFS.runner.main -i circuit.lut -c 8

# GPU execution with batching  
python -m pyTNFS.runner.main_gpu circuit.lut.gz 1024 102400

# Distributed Ray execution
python -m pyTNFS.runner.main -i circuit.lut -c 16 --ray ray://head:10001
```

### Circuit Format Conversion
```bash
# XLS IR to TASM
python -m pyTNFS.xls_ir2tasm.ir2tasm circuit.bool.ir

# Results in circuit.bool.ir.tasm (compressed)
```

### Simulation and Testing
```bash
# Run basic simulation
python -m pyTNFS.simulate.simulate

# Run performance benchmarks
python -m pyTNFS.benchmark.ray_benchmark --num 10000 --num_threads 8
```
