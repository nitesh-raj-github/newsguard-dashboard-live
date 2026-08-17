# NewsGuard Lab

Train a browser-local fake-news text classifier on your own labeled CSV, then optionally ask Groq to explain its output. The Groq API is deliberately used for explanation only; it does not replace the trained classifier or claim to fact-check the text.

## Run locally

Requires Node.js 18 or newer.

```sh
export GROQ_API_KEY="your_groq_api_key"
node server.js
```

Open `http://localhost:3000`.

Without `GROQ_API_KEY`, local training and prediction still work; the explanation button reports the missing configuration.

## Dataset format

Upload a UTF-8 CSV with exactly these required headers:

```csv
text,label
"The health ministry published the report.",real
"Secret miracle cure exposed!",fake
```

Labels must be `real` or `fake`. Start with the sample at `data/sample-news.csv`, then replace it with a balanced, manually verified dataset. The app uses an 80/20 random split for a simple held-out accuracy score. Treat this as a baseline; use separate time/source splits and review per-class precision/recall before reporting results.

## Prepare the supplied Kaggle dataset

The `emineyetm/fake-news-detection-datasets` download contains separate `Fake.csv` and `True.csv` files with `title`, `text`, `subject`, and `date` columns. Convert them into the app's `text,label` format:

```sh
python3 scripts/prepare_kaggle_dataset.py \
  --source "/Users/kumar7003/.cache/kagglehub/datasets/emineyetm/fake-news-detection-datasets/versions/1/News _dataset" \
  --output data/kaggle-news.csv
```

Upload `data/kaggle-news.csv` in the browser. It contains about 45,000 records, so training in the browser may take a few seconds. This file is ignored by Git because it is a generated copy of the Kaggle data.

## BERT + CNN training (Mac)

Use the Python BERT + CNN trainer for the deep-learning layer. In VS Code's terminal:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-ml.txt
python scripts/train_bert_cnn.py --data data/kaggle-news.csv --max-records 5000 --epochs 3
```

Start with 5,000 records on a MacBook, then increase the dataset size after confirming memory and training time. Apple Silicon uses the MPS accelerator automatically when PyTorch supports it. The trained weights are saved to `models/bert_cnn.pt`; accuracy, macro F1, precision, and recall are saved to `models/metrics.json`.

## Security

Do not put your Groq key in `index.html` or commit `.env` files. `server.js` keeps it on the server and calls Groq through `/api/explain`.

## Deploy on Vercel

The `api/explain.mjs` file is a Vercel serverless function. It securely calls Groq, while Vercel serves `index.html` as the website.

1. Create a GitHub repository and push this project to it. Do **not** commit your API key or `.env` files.
2. At [Vercel](https://vercel.com/new), import the GitHub repository. Keep the detected project settings; there is no build command or framework required.
3. Before deploying, open **Settings → Environment Variables** and add:

   ```text
   Name: GROQ_API_KEY
   Value: your fresh Groq API key
   Environments: Production, Preview, Development
   ```

4. Deploy. Your public URL will look like `https://your-project.vercel.app`.

Or deploy through the VS Code terminal after logging in to Vercel:

```sh
npx vercel
npx vercel env add GROQ_API_KEY
npx vercel --prod
```

Enter the key only when Vercel prompts for it. Never paste it into a source file or commit it to Git.
