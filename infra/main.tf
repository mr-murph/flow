# Setup Base Infrastruttura Google Cloud (IaC)
# Eseguire con: terraform init && terraform apply

provider "google" {
  # IL TUO PROJECT ID REALE (Recuperato dai log di errore)
  project = "gen-lang-client-0226862932"
  
  # Regione di default per le risorse standard (Milano)
  region  = "europe-west8" 
}

# 1. Database (Cloud SQL Postgres)
resource "google_sql_database_instance" "main" {
  name             = "dental-db-primary"
  database_version = "POSTGRES_15"
  region           = "europe-west8"
  
  # IMPORTANTE: In sviluppo mettiamo false per poterlo distruggere facilmente.
  # In produzione DEVE essere true per evitare disastri.
  deletion_protection = false 

  settings {
    tier = "db-custom-2-7680" # 2 vCPU, 7.5 GB RAM (Start small)
    
    # Backup automatici
    backup_configuration {
      enabled = true
      start_time = "02:00" # Notte italiana
    }

    # Integrazione Cloud Run (IP Privato non necessario se usi Cloud SQL Auth Proxy)
    ip_configuration {
      ipv4_enabled = true
      
      # CORREZIONE: require_ssl rimosso da settings e spostato qui come ssl_mode
      ssl_mode = "ENCRYPTED_ONLY" 
    }
  }
}

# 2. Storage Bucket (Files Medici)
resource "google_storage_bucket" "medical_files" {
  # I nomi dei bucket devono essere globalmente univoci.
  # Aggiungiamo un suffisso basato sul project ID per evitare conflitti.
  name          = "dental-files-${var.project_id_suffix}"
  location      = "europe-west8"
  storage_class = "STANDARD"

  uniform_bucket_level_access = true # Sicurezza moderna

  # CORS per permettere upload diretto dal Browser (Frontend)
  cors {
    origin          = ["http://localhost:3000", "https://app.dentalsaas.it"]
    method          = ["PUT", "GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Variabile per il suffisso del bucket (rende il nome univoco)
variable "project_id_suffix" {
  default = "0226862932" 
}

# 3. Artifact Registry (Per le immagini Docker)
resource "google_artifact_registry_repository" "repo" {
  location      = "europe-west8"
  repository_id = "dental-containers"
  description   = "Docker repository for Backend & Frontend"
  format        = "DOCKER"
}

# 4. Service Account per Cloud Run (Identità del Backend)
resource "google_service_account" "backend_sa" {
  account_id   = "backend-service-account"
  display_name = "NestJS Backend Identity"
}

# 5. Healthcare API (PACS Server)
# NOTA: Spostato in US-CENTRAL1 per compatibilità con l'account sandbox/trial.
# In produzione reale, richiedere quota per europe-west8.
resource "google_healthcare_dataset" "dataset" {
  name      = "dental-dataset"
  location  = "us-central1" 
  time_zone = "Europe/Rome"
}

resource "google_healthcare_dicom_store" "dicom_store" {
  name    = "dental-dicom-store"
  dataset = google_healthcare_dataset.dataset.id

  # Opzionale: Pubblica su Pub/Sub quando arriva una nuova immagine
  # notification_config {
  #   pubsub_topic = google_pubsub_topic.topic.id
  # }
}

# --- ASSEGNAZIONE PERMESSI IAM ---
# Diamo alla Service Account del backend i permessi minimi necessari

resource "google_project_iam_binding" "backend_storage" {
  project = "gen-lang-client-0226862932"
  role    = "roles/storage.objectAdmin" # Può leggere/scrivere/firmare URL
  members = ["serviceAccount:${google_service_account.backend_sa.email}"]
}

resource "google_project_iam_binding" "backend_sql" {
  project = "gen-lang-client-0226862932"
  role    = "roles/cloudsql.client"
  members = ["serviceAccount:${google_service_account.backend_sa.email}"]
}

resource "google_project_iam_binding" "backend_healthcare" {
  project = "gen-lang-client-0226862932"
  role    = "roles/healthcare.dicomEditor"
  members = ["serviceAccount:${google_service_account.backend_sa.email}"]
}
