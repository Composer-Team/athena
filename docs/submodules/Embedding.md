---
sidebar_position: 1
---

# Generating Embeddings

For offline embedding generation with high batch sizes, use the offline generation script provided in the `emb/` directory.

## Hosting Embedding Models

To host an embedding model and generate embedding vectors online, we recommend using [vLLM](https://github.com/vllm-project/vllm). vLLM provides significantly better throughput and lower per-request tail latency compared to native implementations. The standard HuggingFace Transformers or PyTorch interfaces serialize requests sequentially, causing latency to accumulate across requests.

### Configuration

Set the embedding model in the project-root `config.yaml`:

```yaml
embedding_model: "BAAI/bge-small-en-v1.5"  # Replace with your model
```

### Starting the Embedding Server

```bash
cd emb/
python emb_server_vllm.py
```

The server will:
- Launch on port `8000` and bind to `0.0.0.0`
- Read the embedding model name from `config.yaml`
- Provide an OpenAI-compatible API endpoint at `/v1/embeddings`

### Querying Embeddings

Use the provided client library to generate embeddings:

```python
from emb.emb_query import fetch_embeddings

# Single text embedding - returns 1D numpy array
embedding = fetch_embeddings("Your text here", model="BAAI/bge-small-en-v1.5")

# Batch embedding - returns 2D numpy array
embeddings = fetch_embeddings(
    ["Text 1", "Text 2", "Text 3"],
    model="BAAI/bge-small-en-v1.5",
)

# With optional parameters
embeddings = fetch_embeddings(
    texts=["Text 1", "Text 2"],
    model="BAAI/bge-small-en-v1.5",
    api_url="http://localhost:8000/v1/embeddings",
)
```

The `model` parameter is required. When running via the CLI, pass it with `--model`:

```bash
python emb/emb_query.py "Your text here" --model BAAI/bge-small-en-v1.5
```

## Selecting an Embedding Model

[MTEB](https://huggingface.co/spaces/mteb/leaderboard) (Massive Text Embedding Benchmark) is a widely-used benchmark that evaluates open-source embedding models across multiple tasks. However, our research shows that MTEB scores do not strongly correlate with embedding accuracy in real-world RAG workloads.

### Recommended Approach

1. **Select candidate models**: Choose several embedding models with high MTEB scores and appropriate model sizes for your deployment constraints
2. **Benchmark end-to-end**: Evaluate the complete RAG pipeline using Athena to measure both retrieval accuracy and system performance
3. **Fine-tune if needed**: Consider fine-tuning the selected model specifically for your target workload to maximize accuracy