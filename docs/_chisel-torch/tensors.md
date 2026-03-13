---
sidebar_position: 2
---


# Tensor Module

The tensor module (`chiseltorch.tensor`) provides the core tensor abstraction for ChiselTorch, implementing hardware-aware multi-dimensional arrays with PyTorch-like operations.

## Overview

The tensor module consists of two main components:
- **Tensor class**: The main tensor data structure for storing and manipulating multi-dimensional data
- **Ops object**: Collection of tensor operations (convolutions, matrix multiplication, etc.)

## Tensor Class

### Constructor
```scala
class Tensor[T <: DType[T]](val shape: Seq[Int], val data: Seq[T])
```

A generic tensor parameterized by data type `T` that extends `DType[T]`.

### Key Properties
- **shape**: `Seq[Int]` - Dimensions of the tensor
- **data**: `Seq[T]` - Flattened data elements stored in row-major order

### Indexing Operations

#### Single Index Access
```scala
def apply(index: Int): Tensor[T]
```
Returns a tensor with one less dimension by selecting along the first axis.

#### Multi-Index Access  
```scala
def apply(index: Int*): Tensor[T]
```
Supports multi-dimensional indexing like `tensor(i, j, k)`.

#### Dimension Selection
```scala
def indexDim(dim: Int, sel: Int): Tensor[T]
```
Selects a specific index along a given dimension.

### Functional Operations

#### Map Operation
```scala
def map[U <: DType[U]](f: T => U): Tensor[U]
```
Applies a function to each element, potentially changing the data type.

#### Element-wise Addition
```scala
def +(that: Tensor[T]): Tensor[T]
```
Element-wise addition of two tensors.

### Hardware Interface

#### Chisel Vec Conversion
```scala
def toVec: chisel3.Vec[T]        // Convert to Chisel Vec
def asVecType: chisel3.Vec[T]    // Get Vec type for IO
```

#### Assignment Operations
```scala
def :=(that: chisel3.Vec[T]): Unit      // Assign from Vec
def :=(that: Tensor[T]): Unit           // Assign from Tensor  
def :=(that: T): Unit                   // Broadcast assignment
def :=(that: chisel3.UInt): Unit        // Assign from UInt
```

#### Reshape
```scala
def reshape(new_shape: Seq[Int]): Tensor[T]
```
Changes tensor shape while preserving total number of elements.

## Tensor Object (Factory Methods)

### Construction Methods
```scala
def apply[T <: DType[T]](shape: Seq[Int], data: Seq[T]): Tensor[T]
def empty[T <: DType[T]](shape: Seq[Int], dtype_constructor: () => T): Tensor[T]
def zeros[T <: DType[T]](shape: Seq[Int], dtype_constructor: () => T): Tensor[T]
def Lit[T <: DType[T]](shape: Seq[Int], data: Seq[Float], dtype_constructor: () => T): Tensor[T]
```

### Hardware Constructors
```scala
def Wire[T <: DType[T]](tensor: Tensor[T]): Tensor[T]    // Wire version
def Reg[T <: DType[T]](tensor: Tensor[T]): Tensor[T]     // Register version
```

## Tensor Operations (Ops Object)

### Reduction Operations
```scala
def sum[T <: DType[T]](a: Tensor[T]): T                  // Sum all elements
def max[T <: DType[T]](a: Tensor[T]): T                  // Max element
```

### Activation Functions
```scala
def relu[T <: DType[T]](a: Tensor[T]): Tensor[T]         // ReLU activation
```

### Linear Algebra
```scala
def mm[T <: DType[T]](a: Tensor[T], b: Tensor[T]): Tensor[T]      // Matrix multiplication
def matmul[T <: DType[T]](a: Tensor[T], b: Tensor[T]): Tensor[T]  // Alias for mm
```

### Convolution Operations
```scala
def conv2d[T <: DType[T]](input: Tensor[T], weight: Tensor[T], stride: Int): Tensor[T]
```
2D convolution with configurable stride. Expects:
- **input**: 4D tensor (batch, channels, height, width)  
- **weight**: 4D tensor (out_channels, in_channels, kernel_height, kernel_width)
- **stride**: Step size for convolution

```scala
def zero_padding[T <: DType[T]](in_tensor: Tensor[T], padding: Int): Tensor[T]
```
Adds zero padding around tensor borders.

### Pooling Operations
```scala
def max_pool2d[T <: DType[T]](input: Tensor[T], kernel_size: (Int, Int), stride: Option[Int]): Tensor[T]
```
2D max pooling with configurable kernel size and stride.

### Normalization
```scala
def batch_norm[T <: DType[T]](input: Tensor[T], mean: T, variance: T, epsilon: T): Tensor[T]
```
Batch normalization: `(x - mean) / (variance + epsilon)`

### Tensor Concatenation
```scala
def concat[T <: DType[T]](inputs: Seq[Tensor[T]], dim: Int): Tensor[T]
```
Concatenates tensors along specified dimension (currently only supports channel dimension).

## Usage Examples

### Creating Tensors
```scala
// Create empty tensor
val tensor = Tensor.empty(Seq(2, 3, 4), () => chiseltorch.dtypes.UInt(8.W))

// Create wire version for hardware
val wire_tensor = Tensor.Wire(tensor)

// Create zero tensor
val zeros = Tensor.zeros(Seq(10, 10), () => chiseltorch.dtypes.Float())
```

### Matrix Operations
```scala
val a = Tensor(Seq(2, 3), data_a)
val b = Tensor(Seq(3, 4), data_b)
val result = Ops.mm(a, b)  // 2x4 result
```

### Convolution Example
```scala
val input = Tensor.empty(Seq(1, 3, 32, 32), () => UInt(8.W))    // Batch=1, RGB, 32x32
val weight = Tensor.empty(Seq(16, 3, 3, 3), () => UInt(8.W))    // 16 filters, 3x3 kernels
val output = Ops.conv2d(input, weight, stride = 1)              // Result: (1, 16, 30, 30)
```
