---
sidebar_position: 2
---

# XLS IR to TASM Converter

## Purpose
The `xls_ir2tasm` module provides conversion utilities from XLS (Accelerated HLS) Intermediate Representation (IR) to TASM (TFHE Assembly) format. XLS is Google's hardware synthesis tool that generates optimized hardware descriptions, and this module bridges XLS output to the PyTFHE execution format.

## Core Components

### IR to TASM Converter (`ir2tasm.py`)
Comprehensive parser and converter that transforms XLS boolean IR files into TASM binary format.

## Key Classes and Functions

### Parser Class
Main parsing engine that processes XLS IR and generates TASM binary output.

**Class Attributes:**
- `LUT_TYPE_TABLE` - Mapping of gate types to LUT encodings
- `not_table: Dict` - Tracks NOT gate relationships  
- `lut_entries: List` - LUT operations to be encoded
- `literals: List` - Constant values in the circuit
- `bit_slices: Set` - Primary input signals
- `id_to_line: Dict` - Maps IR node IDs to binary line numbers

**LUT Type Encoding:**
```python
LUT_TYPE_TABLE = {
    'and': {
        (False, False): 1,  # Regular AND
        (False, True): 2,   # AND with second input inverted  
        (True, False): 4,   # AND with first input inverted
        (True, True): 7     # AND with both inputs inverted (NAND)
    },
    'or': {
        (False, False): 7,  # Regular OR
        (False, True): 13,  # OR with second input inverted
        (True, False): 11,  # OR with first input inverted  
        (True, True): 1     # OR with both inputs inverted (NOR)
    },
    'xor': {
        (False, False): 6,  # Regular XOR
        (True, True): 6     # XOR with both inputs inverted (same result)
    }
}
```

### Parsing Functions

#### File Processing
- `extract_top_fn(filename: str) -> tuple`
  - Extracts the main function from XLS IR file
  - Looks for function boundaries (`fn` to `ret` statements)
  - Returns lines containing the function body
  - Validates `.bool.ir` file extension

#### Pattern Matching
- `match(re_str: str, text: str) -> str`
  - Utility function for regex pattern extraction
  - Safely handles failed matches with empty string return
  - Used throughout parsing for ID and value extraction

#### Multi-Pass Parsing Strategy

**Pass 0: Literal Parsing**
- `_parse_literal(line: str)`
- Extracts constant values from literal statements
- Format: `literal.5791: bits[1] = literal(value=0, id=5791)`
- Stores literal ID and constant value

**Pass 1: NOT Gate Parsing**  
- `_parse_not(line: str)`
- Builds mapping of NOT operations to their inputs
- Format: `not.8044: bits[1] = not(literal.5791, id=8044)`
- Creates inversion lookup table for later passes

**Pass 2: Logic Gate Parsing**
- `_parse_gate(line: str)`
- Processes AND, OR, XOR gates with optional input inversions
- Format: `and.8046: bits[1] = and(literal.5791, literal.5792, id=8046)`
- Resolves NOT gate references to determine LUT type
- Generates LUT entries with proper inversion flags

### Binary Assembly

#### Row Assembly
- `_assemble_row(lhs_idx: int, rhs_idx: int, lut: int) -> tuple`
  - Packs node indices and LUT values into 64-bit integers
  - LUT bits are encoded in lower 2 bits of each operand
  - Node indices are shifted left by 2 bits
  - Returns (lhs_packed, rhs_packed) tuple

#### Chunk Assembly  
- `_assemble_chunk(lhs_idx: int, rhs_idx: int, lut: int) -> bytes`
  - Converts packed integers to 16-byte binary chunks
  - Uses big-endian byte order for consistency
  - Each chunk represents one LUT operation
  - Returns 16 bytes (8 bytes per operand)

#### TASM Binary Generation
- `to_tasm_bytes() -> bytes`
  - Generates complete TASM binary format
  - **Header**: 16 bytes of zeros
  - **Literals**: 16 bytes of 0xFF for each literal
  - **Inputs**: 16 bytes of 0xFF for each input signal
  - **LUT Operations**: 16-byte chunks for each gate
  - Maintains ID-to-line mapping for cross-references

## File Format Support

### Input Format (XLS IR)
- **Extension**: `.bool.ir` (boolean-optimized intermediate representation)
- **Structure**: Text-based IR with function definitions
- **Gates**: Supports AND, OR, XOR, NOT operations
- **Literals**: Constant values (0 or 1)
- **Bit Slices**: Primary input signals

### Output Format (TASM Binary)
- **Extension**: `.tasm` (with optional gzip compression)
- **Structure**: Binary format compatible with PyTFHE execution engines
- **Compression**: Automatic gzip compression for storage efficiency
- **Compatibility**: Direct input to `runner` module executors

## Usage Examples

### Command Line Usage
```bash
# Convert specific IR file
python -m pyTNFS.xls_ir2tasm.ir2tasm circuit.bool.ir

# Default behavior (looks for ./IRs/flatten.opt.bool.ir)  
python -m pyTNFS.xls_ir2tasm.ir2tasm
```

### Programmatic Usage
```python
from pyTNFS.xls_ir2tasm.ir2tasm import extract_top_fn, Parser

# Load and parse XLS IR file
lines = extract_top_fn("multiplier.bool.ir")
parser = Parser(lines)

# Multi-pass parsing
parser.parse()

# Generate TASM binary
tasm_binary = parser.to_tasm_bytes()

# Save with compression
import gzip
compressed = gzip.compress(tasm_binary)
with open("multiplier.tasm", "wb") as f:
    f.write(compressed)

print(f"Generated {len(parser.lut_entries)} LUT operations")
print(f"Circuit has {len(parser.bit_slices)} inputs")
```

### Integration with Execution Pipeline
```python
# Complete workflow: XLS IR → TASM → FHE Execution
from pyTNFS.xls_ir2tasm.ir2tasm import *
from pyTNFS.runner.main_gpu import gpu_execute

# Convert IR to TASM
lines = extract_top_fn("circuit.bool.ir") 
parser = Parser(lines)
parser.parse()
tasm_binary = parser.to_tasm_bytes()

# Save compressed TASM
with open("circuit.tasm.gz", "wb") as f:
    f.write(gzip.compress(tasm_binary))

# Execute on GPU
gpu_execute("circuit.tasm.gz", batchsize=1024, megabatch_size=102400)
```

## Conversion Pipeline

### XLS to IR Generation
1. **XLS Input**: High-level hardware description
2. **Boolean Optimization**: XLS generates `.bool.ir` with gate-level operations
3. **Function Extraction**: IR contains optimized boolean function

### IR to TASM Conversion
1. **Parsing**: Multi-pass extraction of literals, NOTs, and gates
2. **LUT Mapping**: Convert gate operations to LUT table lookups
3. **Binary Encoding**: Pack operations into TASM binary format
4. **Compression**: Apply gzip for storage efficiency

### TASM to FHE Execution
1. **Loading**: TASM binary loaded by execution engines
2. **Scheduling**: Operations scheduled for parallel execution
3. **FHE Execution**: Gates executed as homomorphic operations
4. **Result Collection**: Encrypted outputs collected and decrypted
