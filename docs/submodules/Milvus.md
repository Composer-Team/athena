---
sidebar_position: 3
---

# Milvus Vector Database

This page covers Milvus environment setup and important characteristics for working with the Milvus database.

## Milvus Installation

Follow the installation guide on the [Milvus website](https://milvus.io/docs/install_standalone-docker.md). We strongly recommend using the pre-built Docker container due to complex Milvus environment dependencies. Building from source requires working with Conan, the default package manager of Milvus, which can result in broken builds after system upgrades.

## Upgrading Milvus

If you are using Docker, upgrade by changing the version in the `docker-compose.yml` file. **Important**: Upgrading Milvus may trigger a rebuild of all vector indices, which can be time-consuming for large datasets.

## Starting Milvus Server

Follow the official Milvus documentation for starting the server using Docker or standalone deployment.

## Milvus Interface

Athena provides a unified interface to access both Milvus and Postgres. For information on how to query Milvus using Athena, see the [Database Interface](database.md) page. This page provides information about Milvus's native behavior that is not clearly documented in the official Milvus documentation, useful for modifying Athena or understanding Milvus in general.

### Terminologies

Milvus is a column-based database with specific terminology:

- **Collection**: Equivalent to a table in relational databases
- **Field**: Equivalent to a column
- **Entity**: Equivalent to a row
- **Segment**: A group of consecutive entities used internally for index optimization

For more information, check the [Milvus documentation](https://milvus.io/docs/glossary.md).

### Create a Collection

Collections are created using the `create_collection()` method in the Athena interface. See the [Database Interface](database.md) page for details.

### Build an Index

By default, index building is a non-blocking function call. In some Milvus versions, setting `non-blocking=False` may not change the behavior. The most reliable way to check index creation status is by calling the progress monitoring functions.

**Important characteristics**:
- An index can be searchable even if pending rows are not zero
- Milvus continues optimizing indices after the initial build
- Searching when pending is not zero incurs additional search latency
- Internally, indices are built per segment rather than per collection to reduce complexity and optimize search time

To enable brute-force search, build an index with type `"FLAT"`. Note that you cannot build two indices on the same field.

### Loading and Releasing

Milvus is an in-memory database. When using in-memory indices, both collections and indices must be loaded into memory before querying. **Always release collections after use**. Shutting down Milvus without releasing loaded collections may cause undefined behavior on the next startup.

### Query a Collection

When a query includes a vector field, Milvus automatically uses the index built on it. Milvus does not support brute-force search if an index has already been built on the field.

### GPU Index

Athena has not been tested with GPU indices supported by Milvus. However, adding support should be straightforward.

### System Requirements

- Linux (tested on Ubuntu/CentOS)
- CUDA-compatible GPU (for GPU support)
- Python 3.6 or later

#### Required Dependencies (for building from source)

- **CUDA Toolkit** (version 13.0 or compatible)
- **pybind11** - Python binding generator
- **python3-dev** - Python development headers
- **clang-15** (preferred) or **clang** - C++ compiler
- **CMake 3.12+** - Build system
- **Conan** - C++ package manager


