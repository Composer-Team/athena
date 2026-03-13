---
title: Profiling
sidebar_position: 6
---

# Profiling

## RAG-Specific Metrics

The following metrics are easily captured using Athena. The functions are already implemented in the code—simply uncomment them as needed:

- **Throughput**: Requests processed per second for any component
- **Latency**: End-to-end or per-component response time
- **Latency distribution**: Percentile breakdowns (p50, p95, p99) for any component
- **Retrieval recall**: Fraction of relevant documents retrieved
- **LLM generation accuracy**: ROUGE scores comparing generated answers to ground truth
- **Embedding quality**: Measures of embedding effectiveness for retrieval tasks

## Hardware Profiling

### GPU (NVIDIA)

#### Basic Monitoring

The `gpu_power.py` script uses `nvidia-smi` to log GPU metrics during workload execution:

```bash
cd profile/
python gpu_power.py
```

Configurable via environment variables:
- `MODEL`: Embedding model to use
- `DURATION_SEC`: Profiling duration (default: 5)
- `SAMPLE_MS`: Sampling interval in milliseconds (default: 250)
- `LOG`: Output CSV file path
- `BATCH`: Batch size for embedding requests (default: 8)

Captured metrics: GPU utilization, memory utilization, temperature, and power draw.

#### Advanced Profiling

For kernel-level GPU analysis including SM utilization, memory bandwidth, PCIe traffic, and bank conflicts, use [NVIDIA Nsight Systems](https://developer.nvidia.com/nsight-systems).

### CPU (AMD)

The `uprof_script.sh` script uses AMD uProf to profile CPU-hosted workloads:

```bash
cd profile/
./uprof_script.sh <output_directory>
```

Captured metrics: IPC, L1/L2/L3 cache performance, memory bandwidth, and floating-point operations.

### CPU (Intel)

For Intel CPUs, use [Intel VTune Profiler](https://www.intel.com/content/www/us/en/developer/tools/oneapi/vtune-profiler.html). The setup is similar to AMD uProf—script not provided as the configuration changes are minimal.
