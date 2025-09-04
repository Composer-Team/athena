---
sidebar_position: 3
---

# TFHE Assembly (TASM) Tools

## Purpose
The `asm_tools` module provides utilities for loading and parsing binary assembly formats used in the PyTFHE system. It handles two main binary formats: TNFS (Threshold Network File System) binary format and LUT (Look-Up Table) binary format. These formats represent compiled circuits in a form optimized for FHE execution.

## Core Components

### TNFS Binary Format (`load_tnfs_bin.py`)
Utilities for loading and parsing TNFS binary format files, which represent circuits in a binary format optimized for threshold network execution.

**Key Functions:**
- `load_tnfs_bin(raw_bin: bytes, compression: bool = False) -> (AigerGraph, tuple)`
  - Loads TNFS binary format and converts to AigerGraph
  - Returns AigerGraph and statistics tuple (M, I, L, O, A)
  - Supports optional gzip compression
  - Statistics: M=total nodes, I=inputs, L=latches, O=outputs, A=AND gates

- `parse_u64_signal_source(raw: bytes) -> (int, bool)`
  - Parses 8-byte signal source encoding
  - Returns node index and inversion flag
  - Uses big-endian byte order

- `pprint_tnfs_bin(bin: bytes, limit=1024)`
  - Pretty-prints TNFS binary content in hexadecimal format
  - Useful for debugging and inspection
  - Skips padding bytes (0xffffffff patterns)

**Binary Format Structure:**
- 16-byte chunks representing circuit nodes
- Each chunk contains two 8-byte signal sources
- Special patterns identify node types:
  - `0x0000000000000000` + `0x0000000000000000`: Header
  - `0xffffffffffffffff` + `0xffffffffffffffff` with both inverts: Input node
  - First field `0xffffffffffffffff`, invert=false: Output node
  - First field `0xffffffffffffffff`, invert=true: Latch node
  - Regular values: AND gate with two inputs

### LUT Binary Format (`load_lut_bin.py`)
Utilities for loading and parsing LUT (Look-Up Table) binary format files, which represent circuits as lookup tables for efficient FHE execution.

**Key Functions:**
- `load_lut_bin_stat(bytes) -> statistics`
  - Analyzes LUT binary format and returns statistics
  - Counts inputs, outputs, and LUT operations
  - Does not return AigerGraph (statistics only)

- `parse_row(lhs: int, rhs: int) -> (int, int, int)`
  - Parses a single LUT row from two 64-bit values
  - Extracts left/right indices and 4-bit LUT value
  - LUT encoding: `lut = (lut01 << 2) | lut23`

**LUT Format Structure:**
- 16-byte chunks representing LUT operations
- Each chunk contains two 8-byte operands
- LUT values encoded in lower 2 bits of each operand
- Node indices encoded in upper 62 bits
- Special patterns for different node types similar to TNFS format

## Data Flow

### TNFS Binary Processing
1. **Input**: Raw binary data (optionally gzip compressed)
2. **Parsing**: 16-byte chunks → node definitions
3. **Graph Construction**: Build NetworkX DiGraph with typed nodes
4. **Output**: AigerGraph + statistics

### LUT Binary Processing  
1. **Input**: Raw binary LUT data
2. **Parsing**: 16-byte chunks → LUT operations
3. **Analysis**: Count different operation types
4. **Output**: Statistics only (no graph construction)

## Usage Examples

### Loading TNFS Binary
```python
from pyTNFS.asm_tools.load_tnfs_bin import load_tnfs_bin

# Load compressed TNFS binary
with open("circuit.tnfs.gz", "rb") as f:
    raw_data = f.read()

aiger_graph, (total, inputs, latches, outputs, ands) = load_tnfs_bin(raw_data, compression=True)

print(f"Circuit has {inputs} inputs, {outputs} outputs, {ands} AND gates")
```

### Inspecting TNFS Binary
```python
from pyTNFS.asm_tools.load_tnfs_bin import pprint_tnfs_bin

# Pretty print first 100 chunks
with open("circuit.tnfs", "rb") as f:
    binary_data = f.read()
    
pprint_tnfs_bin(binary_data, limit=100)
```

### Analyzing LUT Binary
```python
from pyTNFS.asm_tools.load_lut_bin import load_lut_bin_stat

with open("circuit.lut", "rb") as f:
    lut_data = f.read()

stats = load_lut_bin_stat(lut_data)
print(f"LUT statistics: {stats}")
```

## Binary Format Details

### Signal Encoding
Both formats use a common signal encoding scheme:
- **Index**: Upper bits contain node index
- **Invert Flag**: LSB indicates whether signal should be inverted
- **Special Values**: `0xffffffffffffffff` used as sentinel for special node types

### Node Types
- **Header**: Metadata chunk (usually ignored)
- **Input**: Primary input to the circuit
- **Output**: Primary output from the circuit  
- **Latch**: Sequential element (state storage)
- **AND Gate**: Combinational logic element with two inputs

### Compression Support
TNFS format supports gzip compression for reduced file sizes, automatically detected and handled by the loader.
