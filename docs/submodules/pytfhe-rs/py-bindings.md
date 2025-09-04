---
sidebar_position: 3
---

# Python Bindings

PyTFHE-rs provides Python bindings via PyO3.

## Installation

### Prerequisites

- Python 3.9 or later
- Rust toolchain
- maturin for building Python extensions

### Setup

```bash
# Create conda environment (recommended)
conda create -n pytfhe python=3.9.13
conda activate pytfhe

# Install maturin
pip install maturin

# Build and install bindings
cd pyTFHE-rs
maturin develop
```

### Verify Installation

```python
import tnfs
print(tnfs.py_greedy_scheduler)  # Should show function info
print(tnfs.py_lut_greedy_scheduler)  # Should show function info
```

## API Reference

### `tnfs.py_greedy_scheduler`

Generates execution schedules for AIGER circuits using a greedy scheduling algorithm.

#### Signature

```python
def py_greedy_scheduler(
    aig_bytes: bytes, 
    batch_size: int
) -> List[Tuple[SignalSource, SignalSource, SignalSource]]
```

#### Parameters

- `aig_bytes` (bytes): Binary AIGER circuit data
- `batch_size` (int): Batch size for scheduling (currently unused in implementation)

#### Returns

List of tuples representing scheduled AND gate operations:
- Each tuple contains `(output, input1, input2)` as `SignalSource` objects
- `SignalSource` has fields: `idx` (signal index), `invert` (boolean)

#### Example

```python
import tnfs

# Read AIGER file
with open('circuit.aig', 'rb') as f:
    aig_data = f.read()

# Generate schedule
schedule = tnfs.py_greedy_scheduler(aig_data, batch_size=1000)

print(f"Generated {len(schedule)} operations")
for i, (output, input1, input2) in enumerate(schedule[:5]):  # Show first 5
    print(f"Op {i}: {output.idx}{'!' if output.invert else ''} = "
          f"{input1.idx}{'!' if input1.invert else ''} & "
          f"{input2.idx}{'!' if input2.invert else ''}")
```

### `tnfs.py_lut_greedy_scheduler`

Generates execution schedules for LUT-based circuits.

#### Signature

```python
def py_lut_greedy_scheduler(
    lut_bytes: bytes,
    batch_size: int  
) -> List[LUTOperation]
```

#### Parameters

- `lut_bytes` (bytes): Binary LUT circuit data
- `batch_size` (int): Batch size for scheduling

#### Returns

List of LUT operations in execution order.

#### Example

```python
import tnfs

# Read LUT file
with open('circuit.lut', 'rb') as f:
    lut_data = f.read()

# Generate LUT schedule
lut_schedule = tnfs.py_lut_greedy_scheduler(lut_data, batch_size=500)

print(f"Generated {len(lut_schedule)} LUT operations")
```

## Working with Signal Sources

The `SignalSource` class represents circuit signals:

```python
# SignalSource properties
signal = schedule[0][0]  # First output signal
print(f"Signal index: {signal.idx}")
print(f"Inverted: {signal.invert}")

# Convert to different representations
signal_value = signal.idx * 2 + (1 if signal.invert else 0)
```

## Complete Examples

### Basic Circuit Processing

```python
import tnfs
import sys

def process_circuit(aig_path):
    """Process an AIGER circuit and generate execution schedule."""
    try:
        # Load circuit
        with open(aig_path, 'rb') as f:
            aig_data = f.read()
        
        print(f"Loaded circuit: {len(aig_data)} bytes")
        
        # Generate schedule
        schedule = tnfs.py_greedy_scheduler(aig_data, batch_size=1000)
        
        # Analyze schedule
        print(f"Schedule contains {len(schedule)} operations")
        
        # Count unique signals
        all_signals = set()
        for output, input1, input2 in schedule:
            all_signals.add(output.idx)
            all_signals.add(input1.idx) 
            all_signals.add(input2.idx)
        
        print(f"Circuit uses {len(all_signals)} unique signals")
        
        return schedule
        
    except FileNotFoundError:
        print(f"Error: Could not find file {aig_path}")
        return None
    except Exception as e:
        print(f"Error processing circuit: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_circuit.py <aig_file>")
        sys.exit(1)
    
    schedule = process_circuit(sys.argv[1])
    if schedule:
        print("✓ Circuit processed successfully")
```

### Batch Processing

```python
import tnfs
import os
import glob
from concurrent.futures import ThreadPoolExecutor

def process_single_circuit(aig_path):
    """Process a single circuit file."""
    try:
        with open(aig_path, 'rb') as f:
            aig_data = f.read()
        
        schedule = tnfs.py_greedy_scheduler(aig_data, batch_size=1000)
        return {
            'file': aig_path,
            'operations': len(schedule),
            'status': 'success'
        }
    except Exception as e:
        return {
            'file': aig_path,
            'error': str(e),
            'status': 'error'
        }

def batch_process_circuits(circuit_dir, max_workers=4):
    """Process multiple circuit files in parallel."""
    aig_files = glob.glob(os.path.join(circuit_dir, "*.aig"))
    
    if not aig_files:
        print(f"No .aig files found in {circuit_dir}")
        return
    
    print(f"Found {len(aig_files)} circuit files")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(process_single_circuit, aig_files))
    
    # Summary
    successful = sum(1 for r in results if r['status'] == 'success')
    failed = len(results) - successful
    
    print(f"\nProcessing complete:")
    print(f"✓ Successful: {successful}")
    print(f"✗ Failed: {failed}")
    
    # Show failed files
    for result in results:
        if result['status'] == 'error':
            print(f"  Error in {result['file']}: {result['error']}")
    
    return results

# Usage
if __name__ == "__main__":
    results = batch_process_circuits("./test_files")
```

### Schedule Analysis

```python
import tnfs
from collections import defaultdict

def analyze_schedule(schedule):
    """Analyze properties of a generated schedule."""
    if not schedule:
        print("Empty schedule")
        return
    
    # Signal usage statistics
    signal_usage = defaultdict(int)
    invert_count = 0
    
    for output, input1, input2 in schedule:
        signal_usage[output.idx] += 1
        signal_usage[input1.idx] += 1
        signal_usage[input2.idx] += 1
        
        if output.invert or input1.invert or input2.invert:
            invert_count += 1
    
    print(f"Schedule Analysis:")
    print(f"  Total operations: {len(schedule)}")
    print(f"  Unique signals: {len(signal_usage)}")
    print(f"  Operations with inversions: {invert_count}")
    
    # Most used signals
    top_signals = sorted(signal_usage.items(), key=lambda x: x[1], reverse=True)[:5]
    print(f"  Most used signals:")
    for signal_id, usage in top_signals:
        print(f"    Signal {signal_id}: used {usage} times")
    
    # Critical path approximation (simplified)
    levels = {}
    for i, (output, input1, input2) in enumerate(schedule):
        input_level = max(
            levels.get(input1.idx, 0),
            levels.get(input2.idx, 0)
        )
        levels[output.idx] = input_level + 1
    
    max_level = max(levels.values()) if levels else 0
    print(f"  Estimated circuit depth: {max_level} levels")

# Example usage
with open('test_files/Adder.aig', 'rb') as f:
    aig_data = f.read()

schedule = tnfs.py_greedy_scheduler(aig_data, batch_size=1000)
analyze_schedule(schedule)
```

### Integration with NumPy

```python
import tnfs
import numpy as np

def schedule_to_numpy(schedule):
    """Convert schedule to NumPy arrays for efficient processing."""
    n_ops = len(schedule)
    
    # Arrays for outputs and inputs
    outputs = np.zeros((n_ops, 2), dtype=np.int32)  # [idx, invert]
    input1s = np.zeros((n_ops, 2), dtype=np.int32)
    input2s = np.zeros((n_ops, 2), dtype=np.int32)
    
    for i, (output, input1, input2) in enumerate(schedule):
        outputs[i] = [output.idx, int(output.invert)]
        input1s[i] = [input1.idx, int(input1.invert)]
        input2s[i] = [input2.idx, int(input2.invert)]
    
    return outputs, input1s, input2s

def simulate_with_numpy(schedule, input_values):
    """Simple simulation using NumPy operations."""
    outputs, input1s, input2s = schedule_to_numpy(schedule)
    
    # Initialize signal values
    max_signal = max(
        outputs[:, 0].max(),
        input1s[:, 0].max(), 
        input2s[:, 0].max()
    ) + 1
    
    signals = np.zeros(max_signal, dtype=bool)
    
    # Set input values
    signals[:len(input_values)] = input_values
    
    # Execute operations
    for i in range(len(schedule)):
        # Get input values with inversion
        val1 = signals[input1s[i, 0]] ^ bool(input1s[i, 1])
        val2 = signals[input2s[i, 0]] ^ bool(input2s[i, 1])
        
        # AND operation with output inversion
        result = (val1 & val2) ^ bool(outputs[i, 1])
        signals[outputs[i, 0]] = result
    
    return signals

# Example
with open('test_files/Adder.aig', 'rb') as f:
    aig_data = f.read()

schedule = tnfs.py_greedy_scheduler(aig_data, batch_size=1000)

# Simulate with different inputs
test_inputs = [True, False, True]  # Example input vector
final_signals = simulate_with_numpy(schedule, test_inputs)
print(f"Final signal values: {final_signals}")
```
