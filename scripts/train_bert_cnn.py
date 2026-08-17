#!/usr/bin/env python3
"""Train a BERT-token-embedding + CNN fake-news classifier from text,label CSV."""
import argparse, json
from pathlib import Path
import pandas as pd
import torch
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from torch import nn
from torch.utils.data import DataLoader, Dataset
from tqdm import tqdm
from transformers import AutoModel, AutoTokenizer

LABELS = {"real": 0, "fake": 1}

class NewsDataset(Dataset):
    def __init__(self, frame, tokenizer, length): self.frame, self.tokenizer, self.length = frame.reset_index(drop=True), tokenizer, length
    def __len__(self): return len(self.frame)
    def __getitem__(self, i):
        row = self.frame.iloc[i]
        item = self.tokenizer(row.text, truncation=True, padding="max_length", max_length=self.length, return_tensors="pt")
        return {k:v.squeeze(0) for k,v in item.items()} | {"labels": torch.tensor(LABELS[row.label])}

class BertCNN(nn.Module):
    def __init__(self, name, filters=128, kernels=(2,3,4)):
        super().__init__(); self.bert = AutoModel.from_pretrained(name); hidden = self.bert.config.hidden_size
        self.convs = nn.ModuleList(nn.Conv1d(hidden, filters, k) for k in kernels)
        self.dropout, self.head = nn.Dropout(.25), nn.Linear(filters * len(kernels), 2)
    def forward(self, input_ids, attention_mask):
        x = self.bert(input_ids=input_ids, attention_mask=attention_mask).last_hidden_state.transpose(1,2)
        pooled = [torch.relu(conv(x)).amax(dim=2) for conv in self.convs]
        return self.head(self.dropout(torch.cat(pooled, dim=1)))

def batches(dataset, size, shuffle=False): return DataLoader(dataset, batch_size=size, shuffle=shuffle, num_workers=0)

def main():
    p=argparse.ArgumentParser(); p.add_argument('--data',type=Path,default=Path('data/kaggle-news.csv')); p.add_argument('--model',default='distilbert-base-uncased'); p.add_argument('--epochs',type=int,default=3); p.add_argument('--batch-size',type=int,default=8); p.add_argument('--max-length',type=int,default=192); p.add_argument('--max-records',type=int,default=5000); p.add_argument('--output',type=Path,default=Path('models')); a=p.parse_args()
    df=pd.read_csv(a.data,usecols=['text','label']).dropna(); df.label=df.label.astype(str).str.lower().str.strip(); df=df[df.label.isin(LABELS)]
    if a.max_records: df=df.groupby('label',group_keys=False).sample(n=min(a.max_records//2,df.label.value_counts().min()),random_state=42)
    train,valid=train_test_split(df,test_size=.2,stratify=df.label,random_state=42)
    tok=AutoTokenizer.from_pretrained(a.model); train,valid=NewsDataset(train,tok,a.max_length),NewsDataset(valid,tok,a.max_length)
    device=torch.device('mps' if torch.backends.mps.is_available() else 'cuda' if torch.cuda.is_available() else 'cpu'); model=BertCNN(a.model).to(device); optim=torch.optim.AdamW(model.parameters(),lr=2e-5); loss_fn=nn.CrossEntropyLoss()
    for e in range(a.epochs):
        model.train()
        for b in tqdm(batches(train,a.batch_size,True),desc=f'Epoch {e+1}/{a.epochs}'):
            labels=b.pop('labels').to(device); optim.zero_grad(); loss=loss_fn(model(**{k:v.to(device) for k,v in b.items()}),labels); loss.backward(); torch.nn.utils.clip_grad_norm_(model.parameters(),1.); optim.step()
    model.eval(); actual=[]; predicted=[]
    with torch.no_grad():
        for b in tqdm(batches(valid,a.batch_size),desc='Validating'):
            labels=b.pop('labels'); logits=model(**{k:v.to(device) for k,v in b.items()}); actual+=labels.tolist(); predicted+=logits.argmax(1).cpu().tolist()
    metrics={'model':a.model,'device':str(device),'train_records':len(train),'validation_records':len(valid),'accuracy':accuracy_score(actual,predicted),'f1_macro':f1_score(actual,predicted,average='macro'),'report':classification_report(actual,predicted,target_names=['real','fake'],output_dict=True,zero_division=0)}
    a.output.mkdir(parents=True,exist_ok=True); torch.save({'model_name':a.model,'state_dict':model.state_dict(),'max_length':a.max_length,'labels':LABELS},a.output/'bert_cnn.pt'); (a.output/'metrics.json').write_text(json.dumps(metrics,indent=2)); print(json.dumps({k:v for k,v in metrics.items() if k!='report'},indent=2))
if __name__=='__main__': main()
