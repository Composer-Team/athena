---
title: Database Interface
sidebar_position: 2
---

# Database Interface

Athena provides two database interface classes with unified APIs: `MilvusInterface` and `PostgresInterface`. This design allows RAG pipelines to swap between vector databases without changing orchestration code.

## Overview

**MilvusInterface** wraps the official `MilvusClient` SDK to manage collections, indexes, and vector search operations against Milvus.

**PostgresInterface** uses `psycopg2` to interact with PostgreSQL with the `pgvector` extension, mirroring the Milvus API via SQL statements.

## API Reference

### `__init__(...)`

Initializes the database connection.

**Milvus**: Accepts connection parameters (`alias`, `host`, `port`, `uri`, `token`), creates a `MilvusClient` instance, and stores connection metadata for later use.

**Postgres**: Opens a `psycopg2` connection using the provided database credentials (`dbname`, `user`, `password`, `host`, `port`) and enables `autocommit` mode so schema changes are immediately durable.

### `_ensure_connection()`

**Milvus only.** Creates a connection entry in `pymilvus.Connections` if one doesn't already exist for the configured alias, ensuring later SDK calls have an active channel to the server.

### `_make_client(uri, token)`

**Milvus only.** Internal factory method that constructs and returns a `MilvusClient` with the specified URI and token. Called by `__init__`.

### `_datatype(type_name)`

**Milvus only.** Maps string type names (e.g., `"float_vector"`, `"varchar"`, `"int64"`) to pymilvus `DataType` enum values for schema construction.

### `_build_field(field_def, is_primary=False)`

**Milvus only.** Constructs a `FieldSchema` object from a field definition dictionary. Enforces requirements such as vector dimensions for vector fields and max length for varchar fields.

### `_apply_session_settings(settings)`

**Postgres only.** Issues `SET` SQL statements to configure session-level parameters such as query planner settings or extension-specific tuning (e.g., `ivfflat.probes`, `hnsw.ef_search`).

### `_column_sql(column)`

**Postgres only.** Generates a SQL column definition string from a column specification dictionary, handling specialized types like `vector(dim)` and constraints such as `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, and `DEFAULT`.

### `create_collection(collection_name, primary_field, vector_field, extra_fields=None, ...)`

Creates a new collection (Milvus) or table (Postgres) with the specified schema.

**Milvus**: Assembles a `CollectionSchema` from the primary field, vector field, and any extra fields. Supports optional parameters including `shards_num`, `consistency_level`, `enable_dynamic_field`, and `properties`.

**Postgres**: Constructs and executes a `CREATE TABLE IF NOT EXISTS` statement where the primary field becomes the primary key, the vector field uses the pgvector type, and extra fields are appended as additional columns.

### `drop_collection(collection_name)` / `drop_table(table_name)`

Deletes a collection or table.

**Milvus**: Checks if the collection exists and drops it via the SDK.

**Postgres**: Executes `DROP TABLE IF EXISTS` for the specified table.

### `create_index(collection_name, field_name, index_type, metric_type, index_name, params)`

Builds a vector index on the specified field.

**Milvus**: Prepares index parameters via `prepare_index_params()`, adds the field/index/metric configuration, and creates the index. Supports various index types including HNSW, IVF, DiskANN, and SCANN.

**Postgres**: Currently supports HNSW indexes. Constructs a `CREATE INDEX` statement with a `WITH` clause built from the `params` dictionary (expects keys like `m` and `ef_c` for HNSW construction parameters).

### `drop_index(collection_name, index_name)` / `drop_index(index_name)`

Removes an index.

**Milvus**: Ensures the connection exists, opens the collection, and drops the named index. Takes both `collection_name` and `index_name` as parameters.

**Postgres**: Executes `DROP INDEX IF EXISTS` for the specified index name.

### `load_collection(collection_name)`

**Milvus only.** Loads a collection into memory, making it available for search queries. Milvus requires collections to be loaded before they can be queried.

### `release_collection(collection_name)`

**Milvus only.** Releases a collection from memory to free resources when queries are no longer needed.

### `wait_for_index_build(collection_name)`

**Milvus only.** Blocks execution until Milvus reports that index building has completed for the specified collection.

### `check_index_progress(collection_name)`

**Milvus only.** Polls the index building progress and returns a status string indicating the current state:
- `"index fully done"`: All rows are indexed
- `"searchable"`: Index is in finished state but not all rows may be indexed
- `"building"`: Index construction is still in progress

### `bulk_insert_data(collection_name, fields)`

**Milvus only.** Performs bulk data insertion using `utility.do_bulk_insert()`. Expects a list of file paths where each file name matches a collection field name and contains the data for that field.

### `insert_rows(collection_name, data)`

Inserts data rows into the collection or table.

**Milvus**: Accepts a list of dictionaries where each dictionary represents a row with field names as keys. Forwards the data directly to `client.insert()`.

**Postgres**: Accepts a dictionary mapping column names to lists of values. Zips the value lists into rows and executes a single multi-value `INSERT` statement using `mogrify()` for SQL safety.

### `search(...)`

Performs top-K vector similarity search.

**Milvus**: Executes a vector search via `client.search()`. Parameters include:
- `collection_name`: Target collection
- `anns_field_name`: Name of the vector field to search
- `emb_in`: Query embedding vectors (supports multiple queries)
- `limit`: Number of top results to return
- `search_params`: Dictionary with parameters like `metric_type` and `ef`
- `output_fields`: List of fields to include in results

Returns search results containing matched IDs, distances, and requested output fields.

**Postgres**: Performs similarity search using SQL with the pgvector distance operator. Parameters include:
- `table_name`: Target table
- `vector_column`: Name of the vector column
- `query_vector`: Single query embedding vector
- `output_columns`: List of columns to return (ID should be first)
- `limit`: Number of top results to return
- `session_settings`: Optional query optimization parameters
- `order_expression`: Optional custom ORDER BY expression (defaults to `<->` L2 distance)

Returns a tuple of `(ids, results)` where `ids` is a numpy array and `results` contains full row data.

### `_format_vector(values)`

**Postgres only.** Converts a Python list or numpy array of floats into pgvector's required string format: `[v1,v2,...]`.

## Examples

<!-- Add end-to-end usage examples here -->
