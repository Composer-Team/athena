---
sidebar_position: 1
---

# Athena Intro

Athena is an end-to-end framework for Retrieval-Augmented Generation (RAG) applications. It allows users to build flexible RAG systems and provides system design guidelines through different kinds of metrics. This is the open-source version, optimized for clarity and usability. It is organized into multiple submodules that hide the complexity of the backends (vector database, LLM, etc) and enable flexible builds for RAG systems for different purposes.

## Getting Started

This version of Athena consists of the following submodules:

- [Vector Database Interface](./submodules/database): Nearest Neighbor Search, Data Insertion/Deletion, etc

- [Embedding Model Interface](./submodules/Embedding): Embedding Vector Model Hosting and Generation

- [LLM Interface](./submodules/LLM): LLM Querying and Evaluation

- [Profiling](./submodules/Profiling): How to collect metrics using Athena

- [Configuration Reference](./submodules/Configuration): All config.yaml fields explained

## Citation

If you use Athena for your research, please cite [our paper](https://users.cs.duke.edu/~lkw34/papers/ma-pytfhe-ispass2023.pdf):

```bibtex

@INPROCEEDINGS{11241995,
  author={Liang, Ning and Wenz, Fabian and Giceva, Jana and Wills, Lisa Wu},
  booktitle={2025 IEEE International Symposium on Workload Characterization (IISWC)}, 
  title={Athena: A Plug-and-Play Advisor for Retrieval-Augmented Generation using VectorDB}, 
  year={2025},
  volume={},
  number={},
  pages={28-41},
  keywords={Systematics;Accuracy;Databases;Large language models;Retrieval augmented generation;Pipelines;Benchmark testing;Throughput;Vectors;Complexity theory;Retrieval Augmented Generation (RAG);Vector Database;Large Language Model (LLM)},
  doi={10.1109/IISWC66894.2025.00013}}


```
