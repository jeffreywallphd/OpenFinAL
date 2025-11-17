



import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset

#This data set consists of various Queries of the users, used for tuning the model
data = pd.read_csv("FINAL_BALANCED_DATASET.csv")


tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')


intent_labels = {intent: idx for idx, intent in enumerate(data['INTENT'].unique())}
data['label'] = data['INTENT'].map(intent_labels)  # Ensure the label column is present


def tokenize_function(examples):
    return tokenizer(examples['QUERY'], padding="max_length", truncation=True)


dataset = Dataset.from_pandas(data[['QUERY', 'label']])
tokenized_dataset = dataset.map(tokenize_function, batched=True)

tokenized_dataset = tokenized_dataset.rename_column("label", "labels")


train_test_split = tokenized_dataset.train_test_split(test_size=0.2)
train_dataset = train_test_split['train']
test_dataset = train_test_split['test']

#BERT model
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=len(intent_labels))

#Training arguments
training_args = TrainingArguments(
    output_dir='./results_intent',
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs_intent',
    logging_steps=10,
)

#Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset
)

#Fine-tuning
trainer.train()

# Saving the model
model.save_pretrained('./fine_tuned_intent_model')
tokenizer.save_pretrained('./fine_tuned_intent_model')

#Evaluate the model
trainer.evaluate()

model.save_pretrained("./fine_tuned_intent_model1")
tokenizer.save_pretrained("./fine_tuned_intent_model1")

#from google.colab import drive
#drive.mount('/content/drive')

#fine-tuned Intent model
model.save_pretrained('/content/drive/MyDrive/fine_tuned_intent_model1')
tokenizer.save_pretrained('/content/drive/MyDrive/fine_tuned_intent_model1')



from transformers import BertTokenizer, BertForSequenceClassification

Intent_model = BertForSequenceClassification.from_pretrained('/content/drive/MyDrive/fine_tuned_intent_model1')
Intent_tokenizer = BertTokenizer.from_pretrained('/content/drive/MyDrive/fine_tuned_intent_model1')

# Fine tuning Price_Type

import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset

#Loading the dataset
data = pd.read_csv("FINAL_BALANCED_DATASET.csv")


tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

price_type_labels = {price_type: idx for idx, price_type in enumerate(data['PRICE_TYPE'].unique())}
data['label'] = data['PRICE_TYPE'].map(price_type_labels)

def tokenize_function(examples):
    return tokenizer(examples['QUERY'], padding="max_length", truncation=True)

dataset = Dataset.from_pandas(data[['QUERY', 'label']])
tokenized_dataset = dataset.map(tokenize_function, batched=True)

tokenized_dataset = tokenized_dataset.rename_column("label", "labels")

# train and test sets
train_test_split = tokenized_dataset.train_test_split(test_size=0.2)
train_dataset = train_test_split['train']
test_dataset = train_test_split['test']

#BERT model
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=len(price_type_labels))

# Training arguments
training_args = TrainingArguments(
    output_dir='./results_price_type',
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs_price_type',
    logging_steps=10,
)

#Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset
)

#Fine-tuning
trainer.train()

# Saving the model
model.save_pretrained('./fine_tuned_price_type_model')
tokenizer.save_pretrained('./fine_tuned_price_type_model')

trainer.evaluate()

model.save_pretrained('./fine_tuned_price_type_model')
tokenizer.save_pretrained('./fine_tuned_price_type_model')


#from google.colab import drive
#drive.mount('/content/drive')

model.save_pretrained('/content/drive/MyDrive/fine_tuned_price_type_model')
tokenizer.save_pretrained('/content/drive/MyDrive/fine_tuned_price_type_model')

intent_labels = {intent: idx for idx, intent in enumerate(data['INTENT'].unique())}
print(intent_labels)

price_labels = {price_type: idx for idx, price_type in enumerate(data['PRICE_TYPE'].unique())}
print(price_labels)

#Finetuning the model with Time Period

import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset

#Load the dataset
data = pd.read_csv("FINAL_BALANCED_DATASET.csv")


tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')


time_labels = {time_period: idx for idx, time_period in enumerate(data['TIME_PERIOD'].unique())}
data['label'] = data['TIME_PERIOD'].map(time_labels)  # Ensure the label column is present


def tokenize_function(examples):
    return tokenizer(examples['QUERY'], padding="max_length", truncation=True)


dataset = Dataset.from_pandas(data[['QUERY', 'label']])
tokenized_dataset = dataset.map(tokenize_function, batched=True)


tokenized_dataset = tokenized_dataset.rename_column("label", "labels")

#train and test sets
train_test_split = tokenized_dataset.train_test_split(test_size=0.2)
train_dataset = train_test_split['train']
test_dataset = train_test_split['test']

# Load BERT model
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=len(time_labels))

# Training arguments
training_args = TrainingArguments(
    output_dir='./results_time_period',
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs_time_period',
    logging_steps=10,
)

# Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset
)

#Fine-tuning
trainer.train()

# Saving the model
model.save_pretrained('./fine_tuned_time_period_model')
tokenizer.save_pretrained('./fine_tuned_time_period_model')

# Evaluate
trainer.evaluate()



model.save_pretrained('/content/drive/MyDrive/fine_tuned_time_period_model')
tokenizer.save_pretrained('/content/drive/MyDrive/fine_tuned_time_period_model')

# I saved all the fine tuned models in my Drive

from transformers import BertTokenizer, BertForSequenceClassification
import torch

# Load the fine-tuned intent model and tokenizer
intent_model = BertForSequenceClassification.from_pretrained('/content/drive/MyDrive/fine_tuned_intent_model1') #path file
intent_tokenizer = BertTokenizer.from_pretrained('/content/drive/MyDrive/fine_tuned_intent_model1')

# Load the fine-tuned price type model and tokenizer
price_model = BertForSequenceClassification.from_pretrained('/content/drive/MyDrive/fine_tuned_price_type_model')
price_tokenizer = BertTokenizer.from_pretrained('/content/drive/MyDrive/fine_tuned_price_type_model')

# Load the fine-tuned time period model and tokenizer
time_model = BertForSequenceClassification.from_pretrained('/content/drive/MyDrive/fine_tuned_time_period_model')
time_tokenizer = BertTokenizer.from_pretrained('/content/drive/MyDrive/fine_tuned_time_period_model')



# You can download the above fine tuned model from the below links attached to my google drive.

#Download the necessary modules(which identifies Intent, Price_type, time_period) attached before running this code.

#intent_model = https://drive.google.com/drive/folders/1hykYr6Z9nqAuY9_Zqk22fj3LYwATGZ9Q?usp=sharing



#price_model = https://drive.google.com/drive/folders/10lFL2WT3A6kS3Ii6fT00BMZH-rZNb5Vg?usp=sharing



#time_model = https://drive.google.com/drive/folders/10V9Lh2NQoiOoGB4s_qIXJnkkxNq5dugE?usp=drive_link
