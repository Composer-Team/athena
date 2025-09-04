---
sidebar_position: 2
---

# CLI Tools

PyTFHE-rs provides several command-line tools for circuit synthesis, simulation, and analysis.

## tnfs_syn - Logic Synthesizer

The main synthesis tool that converts FIRRTL circuits to optimized formats.

### Basic Usage

```bash
cargo run --bin tnfs_syn -- <input_file> [OPTIONS]
```

### Arguments

- `<input_file>` - Path to input FIRRTL file (`.fir` extension)

### Options

- `--compress` - Enable output compression
- `--output-dir <DIR>` - Specify output directory (default: current directory)
- `--format <FORMAT>` - Output format: `aiger` (default) or `lut`
- `--optimize` - Enable optimization passes
- `--verbose` - Verbose output

### Examples

```bash
# Basic synthesis
cargo run --bin tnfs_syn -- test_files/Adder.lo.fir

# With compression
cargo run --bin tnfs_syn -- --compress test_files/Sum3D.gates.json

# Specify output format
cargo run --bin tnfs_syn -- --format lut test_files/Adder.lo.fir

# Enable optimizations
cargo run --bin tnfs_syn -- --optimize --verbose test_files/Adder.lo.fir
```

### Output Files

The synthesizer generates several output files:

- `<name>.aig` - AIGER binary format
- `<name>.aag` - AIGER ASCII format (if requested)
- `<name>.lut` - LUT assembly format (if LUT backend used)
- `<name>.gates.json` - Gate-level JSON representation
- `<name>.dot` - GraphViz visualization (if enabled)

## tnfs_sim - Circuit Simulator

Plaintext simulator for testing circuit functionality.

### Basic Usage

```bash
cargo run --bin tnfs_sim -- <input_file> [OPTIONS]
```

### Arguments

- `<input_file>` - Path to compiled circuit file (`.aig`, `.lut`, or `.json`)

### Options

- `--compress` - Input file is compressed
- `--inputs <FILE>` - Input vector file
- `--cycles <N>` - Number of simulation cycles (default: 1)
- `--random-inputs` - Generate random test inputs
- `--output-traces` - Save signal traces
- `--verbose` - Detailed simulation output

### Examples

```bash
# Basic simulation
cargo run --bin tnfs_sim -- test_files/Adder.aig

# With compressed input
cargo run --bin tnfs_sim -- --compress test_files/Adder.aig.gz

# Multiple cycles with random inputs
cargo run --bin tnfs_sim -- --cycles 100 --random-inputs test_files/Sum3D.aig

# Custom input vectors
cargo run --bin tnfs_sim -- --inputs vectors.txt test_files/Adder.aig
```

### Input Vector Format

Input vectors are specified in a text file with one vector per line:

```
# Comments start with #
# Each line represents one simulation cycle
# Binary values: 0, 1, x (don't care)
001  # inputs: a=0, b=0, cin=1  
101  # inputs: a=1, b=0, cin=1
110  # inputs: a=1, b=1, cin=0
```

## tnfs_asm - Assembly Generator

Generates human-readable assembly from compiled circuits.

### Basic Usage

```bash
cargo run --bin tnfs_asm -- <input_file> [OPTIONS]
```

### Options

- `--format <FORMAT>` - Output assembly format: `lut` or `aig`
- `--optimize` - Apply assembly-level optimizations
- `--annotate` - Add comments and annotations

### Examples

```bash
# Generate LUT assembly
cargo run --bin tnfs_asm -- --format lut test_files/Adder.lut

# With optimization and annotations
cargo run --bin tnfs_asm -- --optimize --annotate test_files/Adder.aig
```

## tnfs_ln - Analysis Tool

Circuit analysis and profiling tool.

### Basic Usage

```bash
cargo run --bin tnfs_ln -- <input_file> [OPTIONS]
```

### Analysis Types

- `--gate-count` - Count gates by type
- `--critical-path` - Find critical path delay
- `--fanout-analysis` - Analyze signal fanout
- `--complexity` - Circuit complexity metrics
- `--schedule-stats` - Scheduling statistics

### Examples

```bash
# Gate count analysis
cargo run --bin tnfs_ln -- --gate-count test_files/Adder.aig

# Critical path analysis
cargo run --bin tnfs_ln -- --critical-path test_files/Sum3D.aig

# Complete analysis
cargo run --bin tnfs_ln -- --gate-count --critical-path --complexity test_files/Adder.aig
```

## Common Options

All CLI tools support these common options:

- `--help` - Show help message
- `--version` - Show version information
- `--quiet` - Suppress non-error output
- `--log-level <LEVEL>` - Set logging level: `error`, `warn`, `info`, `debug`, `trace`

## Configuration Files

Tools can read configuration from `tnfs.toml`:

```toml
[synthesis]
default_format = "aiger"
enable_compression = true
optimization_level = 2

[simulation]
default_cycles = 1000
random_seed = 42
trace_signals = true

[output]
base_directory = "./output"
keep_intermediate = false
```

## Environment Variables

- `TNFS_LOG` - Set default log level
- `TNFS_CONFIG` - Path to configuration file
- `TNFS_TEMP_DIR` - Temporary file directory

## Error Codes

CLI tools return standard exit codes:

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - File not found
- `4` - Parse error
- `5` - Compilation error
- `6` - Simulation error

## Batch Processing

Use shell scripting for batch processing:

```bash
#!/bin/bash
# Process all FIRRTL files in a directory

for file in circuits/*.fir; do
    echo "Processing $file"
    cargo run --bin tnfs_syn -- "$file" --compress
    
    # Check if synthesis succeeded
    if [ $? -eq 0 ]; then
        echo "✓ Successfully processed $file"
        
        # Run simulation
        base=$(basename "$file" .fir)
        cargo run --bin tnfs_sim -- "${base}.aig" --random-inputs --cycles 100
    else
        echo "✗ Failed to process $file"
    fi
done
```

## Performance Tips

1. **Use Release Build**: Always use `cargo build --release` for production
2. **Compression**: Enable compression for large circuits to reduce I/O
3. **Parallel Processing**: Process multiple files concurrently
4. **Memory Usage**: Monitor memory usage for very large circuits
5. **Temporary Files**: Clean up intermediate files to save disk space

## Debugging

Enable debug output:

```bash
# Debug synthesis
RUST_LOG=debug cargo run --bin tnfs_syn -- --verbose test_files/Adder.lo.fir

# Trace-level logging
RUST_LOG=trace cargo run --bin tnfs_sim -- test_files/Adder.aig
```

Use visualization for debugging:

```bash
# Generate GraphViz output
cargo run --bin tnfs_syn -- --format dot test_files/Adder.lo.fir

# Convert to image
dot -Tpng Adder.dot -o Adder.png
```