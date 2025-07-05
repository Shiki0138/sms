# GCP Terraform設定
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# 変数定義
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-northeast1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "asia-northeast1-a"
}

# プロバイダー設定
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# 必要なAPIを有効化
resource "google_project_service" "apis" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
    "storage.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "dns.googleapis.com"
  ])
  
  project = var.project_id
  service = each.key
  
  disable_on_destroy = false
}

# Cloud SQL PostgreSQL（本番用）
resource "google_sql_database_instance" "salon_db" {
  name                = "salon-db-production"
  database_version    = "POSTGRES_15"
  region             = var.region
  deletion_protection = false

  settings {
    tier                        = "db-custom-2-8192"  # 2vCPU, 8GB RAM
    availability_type          = "REGIONAL"          # 高可用性
    disk_size                  = 100                 # 100GB SSD
    disk_type                  = "PD_SSD"
    disk_autoresize           = true
    disk_autoresize_limit     = 500

    # バックアップ設定
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"  # JST 12:00
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 30
      }
    }

    # 監視設定
    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }

    # IPアドレス設定
    ip_configuration {
      ipv4_enabled    = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"  # 本番では制限必要
      }
    }
  }

  depends_on = [google_project_service.apis]
}

# データベース作成
resource "google_sql_database" "salon_database" {
  name     = "salon_management_production"
  instance = google_sql_database_instance.salon_db.name
}

# データベースユーザー作成
resource "google_sql_user" "salon_user" {
  name     = "salon_user"
  instance = google_sql_database_instance.salon_db.name
  password = random_password.db_password.result
}

# ランダムパスワード生成
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Cloud Storage（画像・ファイル保存用）
resource "google_storage_bucket" "salon_storage" {
  name          = "${var.project_id}-salon-storage"
  location      = var.region
  force_destroy = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
}

# フロントエンド用Cloud Storage
resource "google_storage_bucket" "frontend_storage" {
  name          = "${var.project_id}-salon-frontend"
  location      = var.region
  force_destroy = false

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"  # SPA対応
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Cloud CDN用ロードバランサー
resource "google_compute_global_address" "frontend_ip" {
  name = "salon-frontend-ip"
}

# Secret Manager（機密情報管理）
resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url"
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "database_url_version" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.salon_user.name}:${random_password.db_password.result}@${google_sql_database_instance.salon_db.connection_name}/${google_sql_database.salon_database.name}"
}

# 出力
output "database_connection_name" {
  value = google_sql_database_instance.salon_db.connection_name
}

output "database_ip" {
  value = google_sql_database_instance.salon_db.ip_address
}

output "frontend_bucket" {
  value = google_storage_bucket.frontend_storage.name
}

output "storage_bucket" {
  value = google_storage_bucket.salon_storage.name
}