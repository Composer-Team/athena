---
sidebar_position: 1
---

# ChiselTorch Overview

ChiselTorch is a Chisel implementation of a PyTorch-like interface for neural network accelerator generation.


## Quick Start

### Installation
1. Install Java 11+ and SBT (can be via [SDKMan](https://sdkman.io))
2. Install Berkeley HardFloat locally by `git clone` and `sbt publishLocal`
3. Clone [ChiselTorch](https://github.com/jiaaom/chisel-torch)
4. Generate hardware: `sbt "runMain chiseltorch.nn.module.SequentialBuild"`

### Basic Usage
```scala
// Define a neural network
val network = new Sequential(Seq(
    Conv2D(3, 16, (3, 3), 1),     // 3 to 16 channels, 3x3 kernel
    ReLU(),                        // Activation
    MaxPool2D((2, 2), 2),         // 2x2 pooling
    Flatten(),                     // Reshape for linear
    Linear(784, 10),              // Classification layer
    ReLU()                        // Final activation
))(Seq(1, 3, 32, 32))            // 32x32 RGB input

// Generate Verilog
(new ChiselStage).emitVerilog(network)
```
