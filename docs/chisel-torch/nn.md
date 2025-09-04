---
sidebar_position: 4
---

# Neural Network Modules

The neural network module package (`chiseltorch.nn.module`) provides PyTorch-like neural network layers implemented in Chisel for hardware acceleration.

## Overview

All neural network modules extend the base `Module` trait and implement a common interface for hardware neural networks. The modules support automatic shape inference and parameter management.

## Base Module Interface

```scala
trait Module extends chisel3.Module {
    def input: Data              // Input port
    def output: Data             // Output port
    def in_shape: Seq[Int]       // Input tensor shape
    def out_shape: Seq[Int]      // Output tensor shape  
    def param_input: Seq[Data]   // Parameter input ports
}
```

## Core Modules

### Conv2D - 2D Convolution Layer

Implements 2D convolution with optional padding and configurable stride.

#### Constructor
```scala
class Conv2D(in_channels: Int, out_channels: Int, kernel_size: Int, stride: Int, padding: Int)(in_size: Seq[Int])
```

#### Factory Methods
```scala
Conv2D(in_channels, out_channels, (kernel_h, kernel_w), stride)(input_shape)           // No padding
Conv2D(in_channels, out_channels, (kernel_h, kernel_w), stride, padding)(input_shape) // With padding
```

#### Features
- **Input**: 4D tensor (batch=1, channels, height, width)
- **Weight**: 4D tensor (out_channels, in_channels, kernel_height, kernel_width)
- **Output**: 4D tensor with computed dimensions
- **Hierarchical Design**: Uses instantiable modules for efficient hardware generation
- **Progress Tracking**: Shows compilation progress for large convolutions

#### Output Size Calculation
```
output_height = (input_height + 2*padding - kernel_height) / stride + 1
output_width = (input_width + 2*padding - kernel_width) / stride + 1
```

#### Example
```scala
val conv = Conv2D(in_channels=3, out_channels=16, (3, 3), stride=1)(Seq(1, 3, 32, 32))
// Input: (1, 3, 32, 32) -> Output: (1, 16, 30, 30)
```

### Linear - Fully Connected Layer

Implements matrix multiplication for fully connected neural network layers.

#### Constructor
```scala
class Linear(input_dim: Int, output_dim: Int)(input_shape: Seq[Int])
```

#### Factory Method
```scala
Linear(input_dim, output_dim)(input_shape)
```

#### Features
- **Input**: 2D tensor (batch=1, input_features)
- **Weight**: 2D tensor (input_features, output_features)
- **Output**: 2D tensor (batch=1, output_features)
- **Hardware**: Uses dedicated MatrixMultiplication hardware module
- **Requirements**: Input must be exactly 2D

#### Example
```scala
val linear = Linear(input_dim=784, output_dim=10)(Seq(1, 784))
// Input: (1, 784) -> Output: (1, 10)
```

### ReLU - Rectified Linear Unit

Implements element-wise ReLU activation function: `max(0, x)`.

#### Constructor
```scala
class ReLU()(input_shape: Seq[Int])
```

#### Factory Method
```scala
ReLU()(input_shape)
```

#### Features
- **Input/Output**: Same shape tensor
- **Operation**: Element-wise `max(0, x)`
- **No Parameters**: No learnable parameters
- **Hardware**: Uses Mux for conditional logic

#### Example
```scala
val relu = ReLU()(Seq(1, 16, 28, 28))
// Input: (1, 16, 28, 28) -> Output: (1, 16, 28, 28)
```

### MaxPool2D - 2D Max Pooling

Implements 2D max pooling with configurable kernel size, stride, and padding.

#### Constructor
```scala
class MaxPool2D(kernel_size: (Int, Int), stride: Int, padding: Int)(input_shape: Seq[Int])
```

#### Factory Methods
```scala
MaxPool2D((kernel_h, kernel_w), stride)(input_shape)           // No padding
MaxPool2D((kernel_h, kernel_w), stride, padding)(input_shape) // With padding
```

#### Features
- **Input**: 4D tensor (batch=1, channels, height, width)
- **Output**: 4D tensor with reduced spatial dimensions
- **Square Kernels**: Currently only supports square pooling windows
- **Hierarchical**: Uses per-channel MaxPool2DOne modules
- **Hardware**: Uses dedicated MaxPoolKernel hardware

#### Output Size Calculation
```
output_height = (input_height + 2*padding - kernel_height) / stride + 1
output_width = (input_width + 2*padding - kernel_width) / stride + 1
```

#### Example
```scala
val maxpool = MaxPool2D((2, 2), stride=2)(Seq(1, 16, 28, 28))
// Input: (1, 16, 28, 28) -> Output: (1, 16, 14, 14)
```

### BatchNorm2d - 2D Batch Normalization

Implements batch normalization for 2D feature maps.

#### Constructor
```scala
class BatchNorm2d(num_features: Int, epsilon: Double)(input_shape: Seq[Int])
```

#### Factory Method
```scala
BatchNorm2d(num_features, epsilon)(input_shape)
```

#### Features
- **Input**: 4D tensor (batch=1, channels, height, width)
- **Parameters**: Mean and variance tensors
- **Output**: Normalized tensor with same shape
- **Formula**: `(x - mean) / (variance + epsilon)`

#### Example
```scala
val bn = BatchNorm2d(num_features=16, epsilon=1e-5)(Seq(1, 16, 32, 32))
// Normalizes each of the 16 channels independently
```

### Flatten - Tensor Flattening

Reshapes multi-dimensional tensors to 2D for use with Linear layers.

#### Constructor
```scala
class Flatten()(input_shape: Seq[Int])
```

#### Factory Method
```scala
Flatten()(input_shape)
```

#### Features
- **Input**: N-dimensional tensor
- **Output**: 2D tensor (batch=1, flattened_features)
- **Operation**: Preserves data order, only changes shape
- **No Parameters**: No learnable parameters

#### Example
```scala
val flatten = Flatten()(Seq(1, 16, 7, 7))
// Input: (1, 16, 7, 7) -> Output: (1, 784)
```

### Pipe - Pipeline Register

Adds a register stage for pipelining neural networks.

#### Constructor
```scala
class Pipe()(input_shape: Seq[Int])
```

#### Factory Method
```scala
Pipe()(input_shape)
```

#### Features
- **Input/Output**: Same shape tensor
- **Operation**: `RegNext(input)` - one clock cycle delay
- **Purpose**: Pipeline staging for timing closure
- **No Parameters**: No learnable parameters

## Sequential - Neural Network Composition

Composes multiple layers into a complete neural network with automatic parameter management.

#### Constructor
```scala
class Sequential(layers: Seq[Seq[Int] => Module])(input_shape: Seq[Int])
```

#### Features
- **Layer Composition**: Automatically connects layer outputs to inputs
- **Shape Inference**: Automatically computes shapes between layers  
- **Parameter Management**: Creates IO ports for each layer's parameters
- **Logging**: Prints layer information during elaboration

#### Example Usage
```scala
val network = new Sequential(
    Seq(
        Conv2D(3, 16, (3, 3), 1),     // 3->16 channels, 3x3 kernel
        ReLU(),                        // Activation
        MaxPool2D((2, 2), 2),         // 2x2 pooling, stride 2
        Flatten(),                     // Reshape for linear
        Linear(784, 10),              // Fully connected
        ReLU()                        // Final activation
    )
)(Seq(1, 3, 32, 32))                  // Input: 32x32 RGB images
```

## Usage Patterns

### Creating Individual Modules
```scala
// Convolution with automatic shape inference
val conv = Conv2D(in_channels=3, out_channels=64, (5, 5), stride=1, padding=2)(input_shape)

// Connect inputs and parameters
conv.input := input_tensor.toVec
conv.param_input.head := weight_tensor.toVec
output_tensor := conv.output
```

### Building Complete Networks
```scala
// Define layer sequence
val layers = Seq(
    Pipe(),                           // Input pipeline stage
    Conv2D(3, 32, (3, 3), 1),        // First convolution
    ReLU(),                           // Activation
    Pipe(),                           // Pipeline stage
    MaxPool2D((2, 2), 2),            // Pooling
    Flatten(),                        // Reshape
    Linear(8192, 1000),              // Classification layer
    ReLU()                            // Output activation
)

val network = new Sequential(layers)(Seq(1, 3, 224, 224))
```

### Hardware Generation
```scala
// Generate Verilog for individual modules
(new ChiselStage).emitVerilog(new Conv2D(3, 16, 3, 1, 0)(Seq(1, 3, 32, 32)))

// Generate FIRRTL for complete networks
(new ChiselStage).emitChirrtl(network)
```
