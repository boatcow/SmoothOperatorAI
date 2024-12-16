# Project id: smooth-operator-715d9

export PATH="~/Downloads/google-cloud-sdk/bin:$PATH"

gcloud builds submit --tag gcr.io/smooth-operator-715d9/api
gcloud run deploy api --image gcr.io/smooth-operator-715d9/api --region us-central1