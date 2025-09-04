---
sidebar_position: 4
---

# Core Modules API Reference

The core modules and their APIs in PyTFHE-rs.

## lib.rs - Python Module Interface

The main library interface for Python bindings.

### Functions

#### `tnfs` Module
The PyO3 module exposing core functionality to Python.

```rust
#[pymodule]
fn tnfs(_py: Python<'_>, m: &PyModule) -> PyResult<()>
```

**Exported Functions:**
- `py_greedy_scheduler` - Standard greedy scheduling algorithm
- `py_lut_greedy_scheduler` - LUT-based greedy scheduling algorithm

## ir - Intermediate Representation

Core data structures for representing circuits internally.

### graph_ir.rs

Central graph-based intermediate representation for circuits.

#### Key Types

##### `GraphIRNodeType`
Represents different types of nodes in the circuit graph:

```rust
pub enum GraphIRNodeType {
    Input,                    // Circuit input
    Output,                   // Circuit output  
    Wire,                     // Internal wire
    Constant(BigInt),         // Constant value
    Register,                 // Sequential element
    Op(PrimOp<NodeIx>),      // Primitive operation
    Scatter(Vec<NodeIx>),     // Bit scattering
    Gather(Vec<NodeIx>),      // Bit gathering
    Inst(Instance),           // Module instantiation
}
```

##### `Instance`
Represents module instantiations:

```rust
pub struct Instance {
    pub instance_name: String,
    pub parameters: HashMap<String, String>,
    pub inputs: Vec<NodeIx>,
    pub outputs: Vec<NodeIx>,
}
```

##### `ModuleGraph`
Main graph structure containing the circuit representation:

```rust
pub struct ModuleGraph {
    pub graph: StableDiGraph<GraphIRNode, EdgeIx>,
    pub inputs: Vec<NodeIx>,
    pub outputs: Vec<NodeIx>,
    pub registers: Vec<NodeIx>,
    // ... additional fields
}
```

#### Key Traits

##### `WithCheckReferences`
Interface for reference validation:

```rust
pub trait WithCheckReferences {
    fn reference_to_predecessors(&self) -> Vec<NodeIx>;
    fn reference_to_successors(&self) -> Vec<NodeIx>;
}
```

### infer_type.rs

Type inference system for circuit signals.

#### Functions

##### `infer_type`
Performs type inference on the circuit graph:

```rust
pub fn infer_type(module: &mut ModuleGraph) -> Result<(), InferenceError>
```

Infers bit widths and signal types throughout the circuit based on operations and connections.

### translate.rs

Translation between different IR representations.

#### Functions

##### `translate_circuit`
Converts frontend AST to internal graph IR:

```rust
pub fn translate_circuit(circuit: Circuit) -> Result<ModuleGraph, TranslationError>
```

## error.rs

Error handling types used throughout the system.

### Error Types

#### `TraversalError`
Errors during AST traversal:
```rust
pub enum TraversalError {
    ParseError(String),
    UnsupportedConstruct(String),
    // ... other variants
}
```

#### `MapError`
Errors during compilation passes:
```rust
pub enum MapError {
    NodeNotFound,
    InvalidOperation(String),
    // ... other variants  
}
```

#### `SimulationError`
Errors during circuit simulation:
```rust
pub enum SimulationError {
    InvalidState,
    UnknownSignal(String),
    // ... other variants
}
```

## Usage Examples

### Creating a Circuit Graph

```rust
use pytfhe_rs::ir::graph_ir::{ModuleGraph, GraphIRNodeType};
use pytfhe_rs::frontends::firrtl::traverse::traverse;

// Parse FIRRTL and create graph
let circuit = traverse(firrtl_ast)?;
let mut graph = translate_circuit(circuit)?;

// Perform type inference
infer_type(&mut graph)?;
```

### Working with Node Types

```rust
match node.node_type {
    GraphIRNodeType::Input => {
        // Handle input node
    },
    GraphIRNodeType::Op(ref op) => {
        // Handle operation node
        match op {
            PrimOp::Add(a, b) => { /* addition */ },
            PrimOp::And(a, b) => { /* bitwise and */ },
            // ... other operations
        }
    },
    // ... other node types
}
```

### Error Handling

```rust
match result {
    Ok(graph) => { /* process graph */ },
    Err(TraversalError::ParseError(msg)) => {
        eprintln!("Parse error: {}", msg);
    },
    Err(TraversalError::UnsupportedConstruct(construct)) => {
        eprintln!("Unsupported construct: {}", construct);
    },
}
```

# Backends API Reference

The backend modules generate optimized output formats from the internal IR representation.

## AIGER Backend

Located in `src/backends/aiger/`, generates And-Inverter Graph (AIG) format output.

### aiger_data_structure.rs

Core data structures for AIGER representation.

#### Key Types

##### `AigerGraph`
Main AIGER graph structure:

```rust
pub struct AigerGraph {
    pub id_map: HashMap<SignalIx, AigInstruction>,
    pub inputs: Vec<SignalIx>,
    pub outputs: Vec<SignalIx>,
    pub latches: Vec<SignalIx>,
    pub max_var: SignalIx,
}
```

**Methods:**
```rust
impl AigerGraph {
    pub fn new() -> Self;
    pub fn from_bin(bytes: Vec<u8>) -> Self;        // Parse binary AIGER
    pub fn to_bin(&self) -> Vec<u8>;                // Generate binary AIGER
    pub fn add_input(&mut self) -> SignalIx;        // Add input signal
    pub fn add_latch(&mut self, input: SignalSource) -> SignalIx;  // Add latch
    pub fn add_and_gate(&mut self, lhs: SignalSource, rhs: SignalSource) -> SignalIx;
    pub fn add_output(&mut self, input: SignalSource);
}
```

##### `SignalSource`
Represents a signal with optional inversion:

```rust
#[pyclass]
pub struct SignalSource {
    pub idx: SignalIx,      // Signal index
    pub invert: bool,       // Whether signal is inverted
}
```

**Methods:**
```rust
impl SignalSource {
    pub fn to_bin(&self) -> Vec<u8>;        // Binary representation
    pub fn to_usize(&self) -> usize;        // Convert to index
    pub fn new(idx: SignalIx, invert: bool) -> Self;
}
```

##### `AigInstruction`
Individual AIGER instructions:

```rust
pub enum AigInstruction {
    Input,                              // Primary input
    Latch(SignalSource),               // Sequential element
    And(SignalSource, SignalSource),   // AND gate
    Output(SignalSource),              // Primary output
}
```

#### Traits

##### `AigerGraphGen`
Trait for generating AIGER from other representations:

```rust
pub trait AigerGraphGen {
    fn to_aiger_graph(&self) -> AigerGraph;
}
```

### aig_map.rs

Mapping functions from internal IR to AIGER format.

#### Key Functions

##### `aig_map`
Main mapping function:

```rust
pub fn aig_map(module: &ModuleGraph) -> Result<AigerGraph, MapError>
```

Converts a `ModuleGraph` to `AigerGraph`, handling:
- Wire mapping and connection resolution
- Operation decomposition to AND gates
- Input/output port mapping
- Sequential element (register) handling

##### Helper Functions

```rust
pub fn map_operation(op: &PrimOp<NodeIx>, aig: &mut AigerGraph) -> Result<SignalIx, MapError>;
pub fn map_wire_connections(module: &ModuleGraph, aig: &mut AigerGraph) -> Result<(), MapError>;
```

## LUT Backend

Located in `src/backends/lut/`, generates Look-Up Table based implementations.

### lut_asm_gen.rs

LUT assembly generation and data structures.

#### Key Types

##### `LUTInstruction`
LUT-based instruction set:

```rust
pub enum LUTInstruction {
    Header,                 // File header
    Input,                  // Input declaration  
    Output(usize),          // Output declaration with index
    LUT(usize, usize, u32), // LUT with two inputs and truth table
}
```

**Methods:**
```rust
impl LUTInstruction {
    pub fn to_bytes(&self) -> Vec<u8>;          // Binary encoding
    pub fn from_bytes(bytes: &[u8]) -> Self;    // Binary decoding
}
```

##### `LUTGraph`
Graph structure for LUT-based circuits:

```rust
pub struct LUTGraph {
    pub instructions: Vec<LUTInstruction>,
    pub num_inputs: usize,
    pub num_outputs: usize,
    pub num_luts: usize,
}
```

#### Traits

##### `WithConvertToLUTAsm`
Conversion trait for LUT assembly:

```rust
pub trait WithConvertToLUTAsm {
    fn to_lut_asm(&self) -> Result<LUTGraph, ConversionError>;
    fn to_lut_asm_bytes(&self) -> Result<Vec<u8>, ConversionError>;
}
```

#### Key Functions

##### `generate_lut_asm`
Generate LUT assembly from graph IR:

```rust
pub fn generate_lut_asm(module: &ModuleGraph) -> Result<LUTGraph, MapError>
```

### lut_map.rs

Mapping functions for LUT-based backend.

#### Key Functions

##### `lut_map`
Main LUT mapping function:

```rust
pub fn lut_map(module: &ModuleGraph) -> Result<LUTGraph, MapError>
```

Converts internal IR to LUT representation, handling:
- Operation decomposition to 2-input LUTs
- Truth table generation
- Wire routing optimization
- Input/output mapping

##### `optimize_lut_graph`
LUT graph optimization:

```rust
pub fn optimize_lut_graph(lut_graph: &mut LUTGraph) -> Result<(), MapError>
```

## Common Backend Types

### Compression Support

Both backends support compression through the `common::compression` module:

```rust
pub fn compress_data(data: &[u8]) -> Result<Vec<u8>, CompressionError>;
pub fn decompress_data(data: &[u8]) -> Result<Vec<u8>, CompressionError>;
```

### Binary Encoding

All backends support binary encoding for efficient storage:

```rust
pub trait WithConvertToBytes {
    fn to_bytes(&self) -> Vec<u8>;
    fn from_bytes(bytes: &[u8]) -> Self;
}
```

## Usage Examples

### AIGER Generation

```rust
use pytfhe_rs::backends::aiger::aig_map::aig_map;
use pytfhe_rs::backends::aiger::aiger_data_structure::AigerGraph;

// Convert module graph to AIGER
let aig_graph = aig_map(&module_graph)?;

// Generate binary AIGER format
let aiger_binary = aig_graph.to_bin();

// Write to file
std::fs::write("output.aig", aiger_binary)?;
```

### Working with AIGER Instructions

```rust
use pytfhe_rs::backends::aiger::aiger_data_structure::{AigInstruction, SignalSource};

// Create AIGER graph
let mut aig = AigerGraph::new();

// Add inputs
let input_a = aig.add_input();
let input_b = aig.add_input();

// Add AND gate
let and_result = aig.add_and_gate(
    SignalSource::new(input_a, false),
    SignalSource::new(input_b, false)
);

// Add output
aig.add_output(SignalSource::new(and_result, false));
```

### LUT Generation

```rust
use pytfhe_rs::backends::lut::lut_map::lut_map;
use pytfhe_rs::backends::lut::lut_asm_gen::WithConvertToLUTAsm;

// Convert to LUT representation
let lut_graph = lut_map(&module_graph)?;

// Generate LUT assembly
let lut_asm = module_graph.to_lut_asm()?;
let lut_binary = module_graph.to_lut_asm_bytes()?;

// Write LUT assembly
std::fs::write("output.lut", lut_binary)?;
```

### Working with LUT Instructions

```rust
use pytfhe_rs::backends::lut::lut_asm_gen::{LUTInstruction, LUTGraph};

// Create LUT graph
let mut lut_graph = LUTGraph {
    instructions: vec![
        LUTInstruction::Header,
        LUTInstruction::Input,
        LUTInstruction::Input,
        LUTInstruction::LUT(0, 1, 0b1000), // AND gate truth table
        LUTInstruction::Output(2),
    ],
    num_inputs: 2,
    num_outputs: 1,
    num_luts: 1,
};

// Convert to binary
let binary_data: Vec<u8> = lut_graph.instructions
    .iter()
    .flat_map(|inst| inst.to_bytes())
    .collect();
```

### Compression

```rust
use pytfhe_rs::common::compression::{compress_data, decompress_data};

// Compress AIGER output
let aiger_binary = aig_graph.to_bin();
let compressed = compress_data(&aiger_binary)?;

// Later, decompress
let decompressed = decompress_data(&compressed)?;
let restored_aig = AigerGraph::from_bin(decompressed);
```

### Error Handling

```rust
use pytfhe_rs::error::MapError;

match aig_map(&module_graph) {
    Ok(aig) => {
        // Process AIGER graph
        println!("Generated {} gates", aig.id_map.len());
    },
    Err(MapError::NodeNotFound) => {
        eprintln!("Graph contains invalid node references");
    },
    Err(MapError::InvalidOperation(op)) => {
        eprintln!("Unsupported operation: {}", op);
    },
    Err(e) => {
        eprintln!("Mapping error: {:?}", e);
    }
}
```

# Frontends API Reference

The frontend modules handle parsing of various hardware description language formats into the internal IR.

## FIRRTL Frontend

Located in `src/frontends/firrtl/`, this module provides parsing support for FIRRTL (Flexible Intermediate Representation for RTL).

### ir.rs - FIRRTL IR Types

Core data structures representing FIRRTL constructs.

#### Types

##### `Type`
FIRRTL type system:

```rust
pub enum Type {
    Clock,              // Clock signal
    AsyncReset,         // Asynchronous reset
    Reset,              // Synchronous reset  
    UInt(u64),          // Unsigned integer with width
    SInt(u64),          // Signed integer with width
    Const(u64),         // Constant with width
    Unknown,            // Unknown/inferred type
}
```

**Methods:**
```rust
impl Type {
    pub fn get_width(&self) -> u64;  // Get bit width of type
}
```

##### `Direction`
Port directions:

```rust
pub enum Direction {
    Input,              // Input port
    Output,             // Output port
}
```

##### `Expression`
FIRRTL expressions:

```rust
pub enum Expression {
    Reference(ID),                    // Signal reference
    Literal(BigInt, Type),           // Literal value
    PrimOp(PrimOp<Expression>),      // Primitive operation
    SubField(Box<Expression>, ID),    // Field access
    SubIndex(Box<Expression>, u64),   // Array index
    Mux(Box<Expression>, Box<Expression>, Box<Expression>), // Multiplexer
    // ... additional expression types
}
```

##### `Statement`
FIRRTL statements:

```rust
pub enum Statement {
    DefWire(ID, Type),               // Wire definition
    DefReg(ID, Type, Expression),    // Register definition
    DefNode(ID, Expression),         // Node definition
    Connect(Expression, Expression), // Connection
    When(Expression, Vec<Statement>), // Conditional
    // ... additional statement types
}
```

##### `Port`
Module port definition:

```rust
pub struct Port {
    pub name: ID,
    pub direction: Direction,
    pub port_type: Type,
}
```

##### `Module`
FIRRTL module:

```rust
pub struct Module {
    pub name: ID,
    pub ports: Vec<Port>,
    pub statements: Vec<Statement>,
}
```

##### `Circuit`
Top-level FIRRTL circuit:

```rust
pub struct Circuit {
    pub modules: Vec<Module>,
    pub main: ID,  // Name of main module
}
```

### op.rs - Primitive Operations

FIRRTL primitive operations.

#### `PrimOp<T>`
Generic primitive operation type:

```rust
pub enum PrimOp<T> {
    // Arithmetic
    Add(T, T),
    Sub(T, T), 
    Mul(T, T),
    Div(T, T),
    Rem(T, T),
    
    // Bitwise
    And(T, T),
    Or(T, T),
    Xor(T, T),
    Not(T),
    
    // Comparison
    Lt(T, T),
    Leq(T, T),
    Gt(T, T),
    Geq(T, T),
    Eq(T, T),
    Neq(T, T),
    
    // Bit manipulation
    Shl(T, T),      // Shift left
    Shr(T, T),      // Shift right
    Dshl(T, T),     // Dynamic shift left
    Dshr(T, T),     // Dynamic shift right
    
    // Type conversion
    AsUInt(T),      // Convert to unsigned
    AsSInt(T),      // Convert to signed
    AsClock(T),     // Convert to clock
    
    // Bit extraction
    Bits(T, u64, u64), // Extract bits [high:low]
    Head(T, u64),      // Take high bits
    Tail(T, u64),      // Take low bits
    Pad(T, u64),       // Pad to width
    
    // Concatenation
    Cat(T, T),      // Concatenate bits
    
    // Reduction
    AndR(T),        // Reduce with AND
    OrR(T),         // Reduce with OR
    XorR(T),        // Reduce with XOR
}
```

### traverse.rs - AST Traversal

Functions for parsing FIRRTL using tree-sitter and converting to internal IR.

#### Core Functions

##### `traverse`
Main entry point for FIRRTL parsing:

```rust
pub fn traverse(tree: Tree, source_code: &[u8]) -> Result<Circuit, TraversalError>
```

Parses a tree-sitter AST into FIRRTL IR.

##### `traverse_circuit`
Parse circuit node:

```rust
pub fn traverse_circuit(node: Node, source_code: &[u8]) -> Result<Circuit, TraversalError>
```

##### `traverse_module` 
Parse module node:

```rust
pub fn traverse_module(node: Node, source_code: &[u8]) -> Result<Module, TraversalError>
```

##### `traverse_statement`
Parse statement node:

```rust
pub fn traverse_statement(node: Node, source_code: &[u8]) -> Result<Statement, TraversalError>
```

##### `traverse_expression`
Parse expression node:

```rust
pub fn traverse_expression(node: Node, source_code: &[u8]) -> Result<Expression, TraversalError>
```

##### `traverse_type`
Parse type node:

```rust
pub fn traverse_type(node: Node, source_code: &[u8]) -> Result<Type, TraversalError>
```

#### Helper Functions

##### `print_node`
Debug helper for printing AST nodes:

```rust
pub fn print_node(base_name: &str, node: Node, source: &[u8])
```

##### `traverse_width`
Parse bit width from AST:

```rust
pub fn traverse_width(node: Node, source_code: &[u8]) -> Result<u64, TraversalError>
```

## Yosys Frontend

Located in `src/frontends/yosys/`, supports Yosys JSON and RTLIL formats.

### yosys_json.rs

Parser for Yosys JSON netlists.

#### Key Functions

##### `parse_yosys_json`
Parse Yosys JSON format:

```rust
pub fn parse_yosys_json(json_str: &str) -> Result<ModuleGraph, ParseError>
```

### rtlil.rs

Parser for RTLIL (Register Transfer Level Intermediate Language).

#### Key Functions

##### `parse_rtlil`
Parse RTLIL format:

```rust
pub fn parse_rtlil(rtlil_str: &str) -> Result<ModuleGraph, ParseError>
```

### yosys_op_map.rs

Operation mapping for Yosys primitives to internal IR.

## Usage Examples

### Parsing FIRRTL

```rust
use pytfhe_rs::frontends::firrtl::traverse::traverse;
use tree_sitter::{Language, Parser};

extern "C" { fn tree_sitter_firrtl() -> Language; }

let mut parser = Parser::new();
parser.set_language(unsafe { tree_sitter_firrtl() })?;

let source_code = std::fs::read("circuit.fir")?;
let tree = parser.parse(&source_code, None).unwrap();

let circuit = traverse(tree, &source_code)?;
println!("Parsed {} modules", circuit.modules.len());
```

### Working with Types

```rust
use pytfhe_rs::frontends::firrtl::ir::Type;

let wire_type = Type::UInt(32);
println!("Width: {}", wire_type.get_width()); // Prints: Width: 32

match wire_type {
    Type::UInt(w) => println!("Unsigned {}-bit", w),
    Type::SInt(w) => println!("Signed {}-bit", w),
    Type::Clock => println!("Clock signal"),
    _ => println!("Other type"),
}
```

### Handling Operations

```rust
use pytfhe_rs::frontends::firrtl::op::PrimOp;

match operation {
    PrimOp::Add(a, b) => {
        // Handle addition
        println!("Adding {} + {}", a, b);
    },
    PrimOp::Bits(signal, high, low) => {
        // Handle bit extraction
        println!("Extract bits [{}:{}] from {}", high, low, signal);
    },
    // ... handle other operations
}
```
