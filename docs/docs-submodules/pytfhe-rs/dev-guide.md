---
sidebar_position: 4
---

# Dev Guide and Architecture

Developer guide of PyTFHE-rs.

## Overview

PyTFHE-rs is a modular circuit compilation toolchain designed for homomorphic encryption circuits. The system follows a traditional compiler architecture with clear separation between frontend parsing, intermediate representation, optimization passes, and backend code generation.

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontends  │ -> │      IR      │ -> │   Passes    │ -> │  Backends   │
│   (Parse)   │    │ (Graph IR)   │    │ (Optimize)  │    │ (Generate)  │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
       ^                   ^                   ^                   ^
       │                   │                   │                   │
   FIRRTL/Yosys      Directed Graph      Optimization        AIGER/LUT
   Input Files        Representation        Passes           Output Files
```

## Core Components

### 1. Frontend Layer (`src/frontends/`)

**Purpose**: Parse various hardware description formats into internal IR.

**Key Modules**:
- `firrtl/` - FIRRTL parser using tree-sitter grammar
- `yosys/` - Yosys JSON and RTLIL support

**Design Principles**:
- Modular parsers for different input formats
- Common IR output regardless of input format
- Comprehensive error reporting with source locations
- Extensible for new input formats

### 2. Intermediate Representation (`src/ir/`)

**Purpose**: Central graph-based representation of circuits.

**Key Components**:
- `graph_ir.rs` - Main graph data structures
- `infer_type.rs` - Type inference system
- `translate.rs` - Frontend AST to IR translation
- `check.rs` - IR validation and consistency checking

**Design Decisions**:
- **Directed Graph**: Uses `petgraph::StableDiGraph` for efficient graph operations
- **Node-based**: Each circuit element is a node with typed connections
- **Immutable Operations**: Most operations create new nodes rather than modifying existing ones
- **Type System**: Rich type system supporting bit widths, signs, and special types

#### Graph IR Node Types

```rust
pub enum GraphIRNodeType {
    Input,                    // Primary inputs
    Output,                   // Primary outputs
    Wire,                     // Internal connections
    Constant(BigInt),         // Literal values
    Register,                 // Sequential elements
    Op(PrimOp<NodeIx>),      // Primitive operations
    Scatter(Vec<NodeIx>),     // Bit decomposition
    Gather(Vec<NodeIx>),      // Bit composition
    Inst(Instance),           // Module instantiation
}
```

### 3. Compilation Passes (`src/passes/`)

**Purpose**: Transform and optimize the IR for backend generation.

**Pass Types**:
- **Connection Mapping** (`connection_map.rs`) - Resolve wire connections
- **Operation Mapping** (`op_map.rs`) - Map high-level operations to gates
- **Wire Mapping** (`wire_map.rs`) - Optimize wire usage
- **IO Mapping** (`io_map.rs`) - Handle input/output interfaces
- **Cleanup** (`clean.rs`) - Remove dead code and optimize
- **Gate Generation** (`gates_gen.rs`) - Generate gate-level implementations

**Pass Pipeline**:
```
Raw IR -> Connection Map -> Op Map -> Wire Map -> IO Map -> Clean -> Gate Gen -> Optimized IR
```

### 4. Backend Layer (`src/backends/`)

**Purpose**: Generate optimized output formats from IR.

**Supported Backends**:
- **AIGER** (`aiger/`) - And-Inverter Graph format
- **LUT** (`lut/`) - Look-Up Table based format

**Common Features**:
- Binary and ASCII output formats
- Compression support
- Optimized data structures
- Validation and error checking

### 5. Execution Layer (`src/runner/`)

**Purpose**: Schedule and simulate circuit execution.

**Key Components**:
- `scheduler.rs` - Greedy scheduling algorithms
- `lut_scheduler.rs` - LUT-specific scheduling
- `simulate/` - Simulation engines and support

## Data Flow Architecture

### 1. Parsing Phase
```
Input File -> Tree-sitter AST -> Frontend Parser -> FIRRTL IR -> Translation -> Graph IR
```

### 2. Analysis Phase
```
Graph IR -> Type Inference -> Validation -> Annotated IR
```

### 3. Optimization Phase
```
Annotated IR -> Pass 1 -> Pass 2 -> ... -> Pass N -> Optimized IR
```

### 4. Code Generation Phase
```
Optimized IR -> Backend Mapping -> Output Format -> Binary/Text File
```

### 5. Execution Phase
```
Output Format -> Scheduler -> Execution Order -> Simulation Engine -> Results
```

## Key Design Patterns

### 1. Visitor Pattern
Used extensively for IR traversal:

```rust
pub trait Visitor<T> {
    fn visit_node(&mut self, node: &GraphIRNode) -> Result<T, Error>;
    fn visit_children(&mut self, node: &GraphIRNode) -> Result<Vec<T>, Error>;
}
```

### 2. Builder Pattern
For constructing complex IR structures:

```rust
let mut graph_builder = ModuleGraphBuilder::new();
graph_builder
    .add_input("clk", Type::Clock)
    .add_input("data", Type::UInt(32))
    .add_operation(PrimOp::Add(data, constant))
    .build()
```

### 3. Strategy Pattern
For different backend implementations:

```rust
pub trait Backend {
    type Output;
    fn generate(&self, ir: &ModuleGraph) -> Result<Self::Output, Error>;
}
```

### 4. Pipeline Pattern
For compilation passes:

```rust
pub trait Pass {
    fn run(&self, ir: &mut ModuleGraph) -> Result<(), PassError>;
    fn name(&self) -> &str;
}

pub struct PassManager {
    passes: Vec<Box<dyn Pass>>,
}
```
