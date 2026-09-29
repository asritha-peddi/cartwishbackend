\# Cartwish AWS EKS Infrastructure



This directory contains Terraform configuration for provisioning an AWS EKS environment for the Cartwish application.



The configuration has been formatted and validated locally. It is not deployed because Amazon EKS and its supporting resources can incur charges.



\## Infrastructure



The configuration defines:



\- AWS VPC with a `10.0.0.0/16` CIDR range

\- Two public subnets across separate Availability Zones

\- Amazon EKS control plane

\- One EKS managed node group

\- Public Kubernetes API endpoint

\- AWS resource tags for project and environment identification

\- No NAT Gateway, to avoid unnecessary lab costs



\## Files



\- `versions.tf` - Terraform and provider requirements

\- `providers.tf` - AWS provider configuration

\- `variables.tf` - Configurable infrastructure values

\- `main.tf` - VPC, EKS cluster and managed node group

\- `outputs.tf` - Cluster and network outputs

\- `terraform.tfvars.example` - Example variable values



\## Validation



```powershell

terraform fmt

terraform init -backend=false

terraform validate

