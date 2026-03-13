---
sidebar_position: 5
---

# Large Language Models

Athena provides interfaces for vLLM for server-grade or performance-sensitive workloads and Ollama for simple LLM hosting on personal desktops.

## Hosting LLM Servers

### Starting a vLLM Server

```bash
cd llm/
python llm_server_vllm.py
```

The server will:
- Launch on port `8001` and bind to `0.0.0.0`
- Read the LLM model name from `config.yaml` (key: `llm_model`)
- Provide an OpenAI-compatible API endpoint at `/v1/completions`

### Starting an Ollama Server

```bash
cd llm/
python llm_server_ollama.py
```

Alternatively, use the native Ollama command:

```bash
ollama serve
```

The Ollama server runs on port `11434` by default.

## Querying and Evaluation

The `llm_eval.py` script provides a unified interface for querying both vLLM and Ollama servers. The `LLM` class handles prompt construction, streaming responses with first-token latency measurement, and concurrent query processing using threads. The `bulk_eval()` function processes questions in batches and outputs evaluation results to CSV.

## Evaluating Generation Accuracy

Generation accuracy is hard to measure objectively. Common evaluation methods include:

- **Embedding scores**: Compare the similarity between an embedding of the generated answer and the embedding of the ground truth answer
- **ROUGE score**: Recall-Oriented Understudy for Gisting Evaluation, measures n-gram overlap between generated and reference text
- **BLEU score**: Bilingual Evaluation Understudy, primarily used for machine translation, measures precision of n-gram matches

### Extractive Prompting Approach

For knowledge-intensive question answering in RAG systems, Athena prompts the model to directly extract the answer from the retrieved documents instead of simply asking it a question. This approach is chosen for the following reasons:

- **State-of-the-art LLMs can memorize answers from training**: This makes it difficult to isolate the contribution of the retrieval component
- **Token mismatch issues**: The model may generate a long answer which has the same meaning as the ground truth answer but results in low scores due to different word choices

### Using ROUGE-1 as the Accuracy Metric

Athena uses ROUGE-1 scores as the generation accuracy metric. This is appropriate because the extractive prompt encourages short responses and the ground truth answers from datasets like Natural Questions (NQ) are typically short phrases.