---
sidebar_position: 4
---

# PostgreSQL and pgvector

Unlike Milvus, PostgreSQL is a row-oriented traditional relational database. pgvector is a lightweight vector search extension built for PostgreSQL. To install PostgreSQL with pgvector enabled, see the [official pgvector installation guide](https://github.com/pgvector/pgvector#installation).

## pgvector Performance

pgvector does not fully utilize system resources such as CPU cores and memory, even when PostgreSQL is configured with full resource access. This is because:

1. pgvector does not fully parallelize index search operations
2. PostgreSQL is primarily IO-bound, and pgvector does not optimize page access patterns—it relies entirely on PostgreSQL's native buffer manager

As a result, pgvector exhibits lower performance compared to Milvus, especially under high concurrent query traffic. There is a high-throughput optimized pgvector variant called pgvectorscale. Unfortunately, Athena does not currently support it.

## pgvector Interface

For information on how to query pgvector using Athena, see the [Database Interface](database.md) page. This page provides information about pgvector's native behavior that is not clearly documented in the official documentation, useful for modifying Athena or understanding pgvector in general. For a high-level understanding, refer to the [pgvector documentation](https://github.com/pgvector/pgvector).

## Index

pgvector currently supports HNSW and IVF indices. Building an index using pgvector can be extremely slow without proper configuration. To improve index build performance, increase PostgreSQL's `maintenance_work_mem` parameter to allocate more memory for index construction.

## Search

pgvector's vector search uses PostgreSQL's native query optimizer. As a result, even if an index is built, PostgreSQL may choose to use a sequential scan (brute-force search) in some circumstances (e.g., if the table is small or if the optimizer determines it to be more efficient).

To confirm whether an index is being used, prepend `EXPLAIN ANALYZE` to your query and verify that the execution plan shows an index scan rather than a sequential scan.

Similar to Milvus, to run a brute-force k-NN search, create a separate table without an index. 