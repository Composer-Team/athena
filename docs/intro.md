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

## Citation

If you use PyTFHE for your research, please cite [our paper](https://users.cs.duke.edu/~lkw34/papers/ma-pytfhe-ispass2023.pdf):

```bibtex
@inproceedings{PyTFHE,
  title = {{{PyTFHE}}: {{An End-to-End Compilation}} and {{Execution Framework}} for {{Fully Homomorphic Encryption Applications}}},
  shorttitle = {{{PyTFHE}}},
  booktitle = {2023 {{IEEE International Symposium}} on {{Performance Analysis}} of {{Systems}} and {{Software}} ({{ISPASS}})},
  author = {Ma, Jiaao and Xu, Ceyu and Wills, Lisa Wu},
  year = {2023},
  month = apr,
  pages = {24--34},
  publisher = {IEEE},
  address = {Raleigh, NC, USA},
  doi = {10.1109/ISPASS57527.2023.00012},
  isbn = {979-8-3503-9739-0},
}

```
