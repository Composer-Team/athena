---
sidebar_position: 1
---

# PyTFHE Intro

PyTFHE is an end-to-end compilation and execution framework for fully homomorphic encryption (FHE) applications.
Specifically, we use the FHE over the Torus (TFHE) scheme [CITE] as our main focus.

PyTFHE-OSS is the open-source version that optimized for cleaness and usability.
It consists of multiple submodules that decouples the frontend (compilation and assemble) and backend (execution on various platforms). 

## Getting Started

PyTFHE-OSS has been tested under Ubuntu 22.04 and RHEL9.
It consists of the following submodules:

[CPU Engine](https://github.com/jiaaom/pyTFHE-CPU) is the CPU execution backend.

[CUDA Engine](https://github.com/jiaaom/CUDA_TFHE) is the CUDA execution backend.

[PyTFHE-rs](https://github.com/jiaaom/pyTFHE-rs) contains the support library for building graphs, IR support, and scheduler.

[Frontend](https://github.com/jiaaom/pyTFHE-Frontend) is the frontend for compilation, scheduler, and execution engines.

[Benchmarks](https://github.com/jiaaom/tnfs-benchmarks) contains some optional benchmarks used for performance testing.
