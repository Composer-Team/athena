---
sidebar_position: 1
---

# PyTFHE Intro

PyTFHE is an end-to-end compilation and execution framework for fully homomorphic encryption (FHE) applications.  
In particular, it focuses on the [TFHE scheme](https://eprint.iacr.org/2018/421).

PyTFHE-OSS is the open-source version, optimized for clarity and usability.  
It is organized into multiple submodules that decouple the frontend (compilation and assembly) from the backend (execution on various platforms).

## Getting Started

PyTFHE-OSS has been tested on Ubuntu 22.04 and RHEL 9/10.  
It consists of the following submodules, which we recommend exploring and installing in the order listed:

- [CPU Engine](https://github.com/jiaaom/pyTFHE-CPU): CPU execution backend.

- [CUDA Engine](https://github.com/jiaaom/pyTFHE-CUDA): CUDA execution backend.

- [PyTFHE-rs](https://github.com/jiaaom/pyTFHE-rs): Support library for graph construction, IR support, and scheduling.

- [Frontend](https://github.com/jiaaom/pyTFHE-Frontend): Frontend for compilation, scheduling, and integration with execution engines.

- [ChiselTorch](https://github.com/jiaaom/chisel-torch): A Chisel implementation of a PyTorch-like interface for accelerator generation.

- [Benchmarks](https://github.com/jiaaom/pyTFHE-Benchmarks): Optional benchmark suite for performance testing.