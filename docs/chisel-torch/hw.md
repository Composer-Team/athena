---
sidebar_position: 3
---

# Hardware Primitives

The hardware operations package (`chiseltorch.hw`) provides optimized hardware implementations of fundamental operations used by higher-level neural network modules.

## Overview

Hardware operations are designed as reusable, instantiable modules that can be efficiently composed into larger neural network architectures. They focus on performance-critical operations like matrix multiplication, pooling, and vector operations.

## Matrix Operations

### DotProduct - Vector Dot Product

Computes the dot product (inner product) of two equal-length vectors.

#### Constructor
```scala
class DotProduct[T <: DType[T]](length: Int, in_dtype_constructor: () => T)
```

#### Features
- **Generic Type**: Supports any `DType[T]` data type
- **Input**: Two vectors of length `length`
- **Output**: Single scalar value (sum of element-wise products)
- **Operation**: `∑(a[i] * b[i])` for i = 0 to length-1
- **Instantiable**: Marked with `@instantiable` for hierarchical reuse

#### Hardware Implementation
```scala
val output_data = tensor_a.data.zip(tensor_b.data).map { case (a, b) => a * b }.reduce(_ + _)
```

#### IO Interface
```scala
val io = IO(new Bundle {
    val a = Input(tensor_a.asVecType)    // First vector input
    val b = Input(tensor_b.asVecType)    // Second vector input  
    val c = Output(output_tensor.asVecType) // Scalar result
})
```

### MatrixMultiplication - 2D Matrix Multiply

Implements general matrix multiplication using a grid of dot product units.

#### Constructor
```scala
class MatrixMultiplication[T <: DType[T]](shape_a: Seq[Int], shape_b: Seq[Int], dtype_constructor: () => T)
```

#### Parameters
- **shape_a**: `Seq(M, K)` - Dimensions of first matrix
- **shape_b**: `Seq(K, N)` - Dimensions of second matrix  
- **Output**: `Seq(M, N)` - Result matrix dimensions

#### Features
- **Shape Validation**: Ensures inner dimensions match (`K` must be equal)
- **Hierarchical Design**: Creates `M × N` DotProduct instances
- **Progress Tracking**: Shows compilation progress for large matrices
- **Generic Types**: Supports any `DType[T]` data type

#### Hardware Architecture
```scala
// Creates M×N dot product units in a grid
for (i <- 0 until shape_a(0)) {        // M rows
    for (j <- 0 until shape_b(1)) {    // N columns
        val dot_prod = Instance(ref_dot_prod)
        dot_prod.io.a := tensor_a(i).toVec           // Row i of A
        dot_prod.io.b := tensor_b.indexDim(1, j).toVec  // Column j of B
        tensor_c(i, j) := dot_prod.io.c              // Result element
    }
}
```

#### Usage Example
```scala
val matmul = Module(new MatrixMultiplication(Seq(64, 128), Seq(128, 32), () => UInt(8.W)))
// Multiplies 64×128 matrix with 128×32 matrix to get 64×32 result
```

## Pooling Operations  

### MaxPoolKernel - Pooling Window

Finds the maximum value within a pooling window.

#### Constructor
```scala
class MaxPoolKernel[T <: DType[T]](kernel_size: (Int, Int), dtype_constructor: () => T)
```

#### Features
- **Input**: Flattened pooling window (`kernel_height × kernel_width` elements)
- **Output**: Single maximum value
- **Generic Type**: Works with any comparable `DType[T]`
- **Operation**: Uses `Ops.max()` to find maximum element

#### IO Interface
```scala
val io = IO(new Bundle {
    val in = Input(input_tensor.asVecType)   // Flattened window
    val out = Output(output.cloneType)       // Maximum value
})
```

#### Usage in Higher-Level Modules
```scala
val maxpool_kernel = Instance(maxpool_kernel_ref)
maxpool_kernel.io.in := VecInit(pooling_window)
val max_value = maxpool_kernel.io.out
```

## Vector Operations

### VectorOpSingle - Unary Vector Operations  

Applies a unary function element-wise to a tensor.

#### Constructor
```scala
class VectorOpSingle[T <: DType[T], U <: DType[U]](shape: Seq[Int], op: T => U, in_dtype_constructor: () => T)
```

#### Features
- **Generic Types**: Input type `T` and output type `U` can differ
- **Functional**: Takes a function `T => U` as parameter
- **Element-wise**: Applies operation to each tensor element independently
- **Shape Preserving**: Output has same shape as input

#### Example Operations
```scala
// ReLU operation
val relu_op = (x: UInt) => Mux(x > 0.U, x, 0.U)
val relu_vector = new VectorOpSingle(shape, relu_op, () => UInt(8.W))

// Type conversion
val float_convert = (x: UInt) => x.asTypeOf(Float())
val converter = new VectorOpSingle(shape, float_convert, () => UInt(8.W))
```

### VectorOpDouble - Binary Vector Operations

Applies a binary function element-wise to pairs of tensor elements.

#### Constructor  
```scala
class VectorOpDouble[T <: DType[T], U <: DType[U]](shape: Seq[Int], op: (T, T) => U, in_dtype_constructor: () => T)
```

#### Features
- **Two Inputs**: Takes two tensors of identical shape
- **Element-wise**: Applies `op(a[i], b[i])` to corresponding elements
- **Generic Output**: Output type `U` can differ from input type `T`
- **Functional**: Operation specified as `(T, T) => U` function

#### Hardware Implementation
```scala
val output_data = tensor_a.data.zip(tensor_b.data).map { case (a, b) => op(a, b) }
```

#### IO Interface
```scala
val io = IO(new Bundle {
    val a = Input(tensor_a.asVecType)      // First operand
    val b = Input(tensor_b.asVecType)      // Second operand
    val c = Output(output_tensor.asVecType) // Result
})
```

#### Example Operations
```scala
// Element-wise addition
val add_op = (x: UInt, y: UInt) => x + y
val adder = new VectorOpDouble(shape, add_op, () => UInt(8.W))

// Element-wise multiplication  
val mul_op = (x: UInt, y: UInt) => x * y
val multiplier = new VectorOpDouble(shape, mul_op, () => UInt(8.W))

// Comparison
val gt_op = (x: UInt, y: UInt) => Mux(x > y, 1.U, 0.U)
val comparator = new VectorOpDouble(shape, gt_op, () => UInt(8.W))
```

## Design Patterns

### Instantiable Modules

All hardware operations use the `@instantiable` annotation for efficient hierarchical design:

```scala
@instantiable
class MyHardwareOp extends Module {
    @public val io = IO(new Bundle { ... })
    // Implementation
}

// Usage in higher-level modules
val ref = Definition(new MyHardwareOp(...))
val instance = Instance(ref)  // Reuses the same definition
```

### Progress Tracking

Large operations provide progress feedback during compilation:

```scala
val pbar = new ProgressBar(total_operations)
for (i <- 0 until total_operations) {
    // Do work
    pbar.update(1)
}
pbar.finished()
```

### Type Safety

All operations are parameterized by `DType[T]` for type safety:

```scala
class MyOp[T <: DType[T]](dtype_constructor: () => T) extends Module {
    val data = Tensor.empty(shape, dtype_constructor)  // Type-safe tensor creation
}
```

## Hardware Generation

### Individual Modules
```scala
// Generate Verilog for matrix multiplication
(new ChiselStage).emitVerilog(
    new MatrixMultiplication(Seq(32, 64), Seq(64, 16), () => UInt(8.W))
)
```

### Integration Examples
```scala
// Use in neural network layer
val matmul_hw = Module(new MatrixMultiplication(input_shape, weight_shape, dtype_constructor))
matmul_hw.io.a := input_tensor.toVec
matmul_hw.io.b := weight_tensor.toVec
output_tensor := matmul_hw.io.c
```
