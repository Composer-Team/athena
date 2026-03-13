---
sidebar_position: 7
---

# Configuration Reference

The pipeline is driven by a single `config.yaml` file. Pass it to the orchestration script with:

```bash
python run_pipeline.py --config config.yaml
```

Below is a complete example followed by a description of every field.

```yaml
# Embedding
embedding_model: "infly/INF-retriever-v1-1.5b"
emb_api_url: "http://localhost:8000/v1/embeddings"

# Milvus
milvus_uri: "http://localhost:19530"
milvus_token: "root:Milvus"
collection_name: "my_collection"
vector_field: "embedding"
search_limit: 5
search_params: {"metric_type": "COSINE", "params": {"ef": 64}}
output_fields: ["id", "text"]

# LLM
llm_model: "llama3"
llm_provider: "ollama"
batch_size: 4

# Input/output
input_file: "prompts.json"
groundtruth_file: "answers.json"
output_file: "results.csv"

# Metrics
collect_metrics: true
metrics_output: "metrics.json"
```

## Embedding

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `embedding_model` | string | **yes** | — | HuggingFace model name passed to the embedding server (e.g. `"BAAI/bge-small-en-v1.5"`). |
| `emb_api_url` | string | no | `http://localhost:8000/v1/embeddings` | OpenAI-compatible embeddings endpoint exposed by the vLLM embedding server. |

## Milvus

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `milvus_uri` | string | no | `http://localhost:19530` | Milvus server URI. |
| `milvus_token` | string | no | `root:Milvus` | Authentication token for the Milvus server. |
| `collection_name` | string | **yes** | — | Name of the Milvus collection to search. |
| `vector_field` | string | no | `embedding` | Name of the vector field inside the collection used for ANN search. |
| `search_limit` | integer | no | `5` | Number of top-K results to return per query. |
| `search_params` | object | no | `{"metric_type": "COSINE"}` | Milvus search parameters. Must include `metric_type` (`COSINE`, `L2`, `IP`). The nested `params` key passes index-specific options (e.g. `ef` for HNSW). |
| `output_fields` | list of strings | no | `["id", "text"]` | Fields to return from each search hit. |

## LLM

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `llm_model` | string | no | `llama3` | Model name to request from the LLM server. |
| `llm_provider` | string | no | `ollama` | Backend to use. Either `"ollama"` or `"vllm"`. |
| `batch_size` | integer | no | `4` | Number of questions sent to the LLM concurrently in each batch. |

## Input / Output

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `input_file` | string | no | `prompts.json` | Path to a JSON file containing an array of objects, each with at least a `"question"` key. |
| `groundtruth_file` | string | no | `answers.json` | Path to a JSON file containing an array of ground-truth answer strings, one per question. Used for ROUGE scoring. If the file does not exist, ROUGE scores are computed against empty strings. |
| `output_file` | string | no | `results.csv` | Path where the per-question evaluation CSV is written. Columns: `question`, `prediction`, `reference`, `rouge-1`, `rouge-L`, `latency_first_token`. |

## Metrics

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `collect_metrics` | boolean | no | `false` | When `true`, the pipeline records wall-clock timing for each stage and writes a summary JSON. When `false`, all timing code is skipped (zero overhead). |
| `metrics_output` | string | no | `metrics.json` | Path where the metrics summary JSON is written. Only used when `collect_metrics` is `true`. |

### Collected Metrics

When `collect_metrics: true`, the following metrics are recorded:

| Metric key | Description |
|---|---|
| `embed_latency` | Wall-clock seconds to encode all query texts into vectors. |
| `search_latency` | Wall-clock seconds for the Milvus ANN search across all queries. |
| `llm_batch_latency` | Wall-clock seconds for the full LLM evaluation pass (all batches). |
| `end_to_end_latency` | Sum of `embed_latency` + `search_latency` + `llm_batch_latency`. |
| `avg_rouge1` | Mean ROUGE-1 score across all questions. |
| `avg_rougeL` | Mean ROUGE-L score across all questions. |

Per-query first-token latency is recorded in the `latency_first_token` column of the output CSV rather than the metrics JSON.
