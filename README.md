# NewsGuard Lab

NewsGuard Lab is a fake-news analysis dashboard for academic demonstrations and experimentation. It combines a browser-local baseline classifier, an optional BERT-CNN training workflow, source-review signals, saved feedback, and Groq-powered explanations.

> A model prediction is a risk signal, not a fact check. Always verify claims using original reporting and independent credible evidence.

## Features

- Dashboard pages for claim analysis, history, training, metrics, and settings
- Custom `text,label` CSV training in the browser
- Risk meter and highlighted sensational-language markers
- English and Hindi language detection/signals
- Optional source-domain profile and verification checklist
- Browser-local history, feedback labels, filtering, and CSV export
- BERT-CNN metrics import for baseline-vs-deep-model comparison
- Groq explanation endpoint that does not override the local verdict
- Dark/light theme and responsive mobile navigation

## Project structure

```text
api/explain.mjs                 Vercel serverless Groq endpoint
data/sample-news.csv            Small sample training dataset
scripts/prepare_kaggle_dataset.py
scripts/train_bert_cnn.py       Python BERT-CNN trainer
dashboard-enhancements.js       Local dashboard Home-page enhancement
index.html                      Main dashboard interface
index.js                        Vercel-safe Node entrypoint
local-server.cjs                Local development server
requirements-ml.txt             Python ML dependencies
```

## Run locally

Requires Node.js 20 or newer.

```sh
cd /Users/kumar7003/Documents/ChatGPT/skyreti
read -s "GROQ_API_KEY?Paste Groq key: "
echo
export GROQ_API_KEY
node local-server.cjs
```

Open [http://localhost:3000](http://localhost:3000).

Without `GROQ_API_KEY`, training and local predictions work normally; only the Groq explanation button is unavailable.

## Train the browser baseline

Upload a UTF-8 CSV containing `text` and `label` columns. Labels must be `real` or `fake`.

```csv
text,label
"The health ministry published the report.",real
"Secret miracle cure exposed!",fake
```

The dashboard performs a simple 80/20 local split and saves the baseline model only in the current browser. For credible reporting, use balanced, manually verified data and inspect precision, recall, and macro F1—not accuracy alone.

## BERT + CNN training

Train the deep-learning model locally on a Mac:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-ml.txt
python scripts/train_bert_cnn.py --data data/kaggle-news.csv --max-records 5000 --epochs 3
```

The trainer writes:

- `models/bert_cnn.pt` — trained weights
- `models/metrics.json` — validation accuracy, macro F1, precision, and recall

Import `models/metrics.json` in the dashboard Training page to compare BERT-CNN results with the browser baseline. Start with 5,000 records on a MacBook, then increase gradually.

## Kaggle dataset preparation

The supplied Kaggle download has separate `Fake.csv` and `True.csv` files. Convert them into the dashboard format:

```sh
python3 scripts/prepare_kaggle_dataset.py \
  --source "/path/to/News _dataset" \
  --output data/kaggle-news.csv
```

`data/kaggle-news.csv` is intentionally excluded from Git because it is large and generated from external data.

## Groq setup

Add a fresh Groq key as `GROQ_API_KEY`. Never put it in `index.html`, GitHub, or this README.

The project uses `openai/gpt-oss-20b` for explanations. The previous `llama-3.3-70b-versatile` ID is deprecated on Groq.

## Deploy on Vercel

1. Push this repository to GitHub.
2. In Vercel, import the repository and select the Node.js/Other preset as appropriate.
3. Under **Settings → Environment Variables**, add `GROQ_API_KEY` for Production, Preview, and Development.
4. Deploy.

Vercel uses `index.js` as the app entrypoint and `api/explain.mjs` for Groq. Do not use `local-server.cjs` on Vercel—it is only for local development.

## Security and privacy

- API keys and generated datasets are excluded by `.gitignore`.
- History, model state, feedback, and theme preferences are stored in the browser’s local storage.
- Groq receives the claim only when the user explicitly clicks **Ask Groq to explain**.
- The source URL is used for a basic domain profile; it does not fetch or verify the linked article.
