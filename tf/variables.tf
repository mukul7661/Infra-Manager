variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "Cluster name"
  type        = string
  sensitive   = true
}

variable "principal_arn" {
  description = "Principal arn"
  type        = string
  sensitive   = true
}
