provider "aws" {
  region = "us-east-1"
}

# -------------------------------------------------------------------------------------------------
# ECR Repositories
# -------------------------------------------------------------------------------------------------
resource "aws_ecr_repository" "backend" {
  name = "study-app-backend"
  force_delete = true
}

resource "aws_ecr_repository" "frontend" {
  name = "study-app-frontend"
  force_delete = true
}

# -------------------------------------------------------------------------------------------------
# S3 Bucket for Artifacts
# -------------------------------------------------------------------------------------------------
resource "aws_s3_bucket" "pipeline_artifacts" {
  bucket_prefix = "study-app-pipeline-"
  force_destroy = true
}

# -------------------------------------------------------------------------------------------------
# CodeStar Connection (Connects to GitHub)
# -------------------------------------------------------------------------------------------------
resource "aws_codestarconnections_connection" "github" {
  name          = "study-app-github-connection"
  provider_type = "GitHub"
}

# -------------------------------------------------------------------------------------------------
# IAM Roles
# -------------------------------------------------------------------------------------------------
# CodeBuild Role
resource "aws_iam_role" "codebuild_role" {
  name = "study-app-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "codebuild.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "codebuild_policy" {
  role = aws_iam_role.codebuild_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.pipeline_artifacts.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:GetAuthorizationToken",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
        Resource = "*"
      }
    ]
  })
}

# CodePipeline Role
resource "aws_iam_role" "codepipeline_role" {
  name = "study-app-pipeline-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "codepipeline.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "codepipeline_policy" {
  role = aws_iam_role.codepipeline_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketVersioning",
          "s3:PutObjectAcl",
          "s3:PutObject"
        ]
        Resource = [
          aws_s3_bucket.pipeline_artifacts.arn,
          "${aws_s3_bucket.pipeline_artifacts.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "codestar-connections:UseConnection"
        ]
        Resource = aws_codestarconnections_connection.github.arn
      },
      {
        Effect = "Allow"
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild"
        ]
        Resource = "*"
      }
    ]
  })
}

# -------------------------------------------------------------------------------------------------
# CodeBuild Project
# -------------------------------------------------------------------------------------------------
resource "aws_codebuild_project" "build" {
  name          = "study-app-build"
  description   = "Builds the Docker images"
  build_timeout = "5"
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:4.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true # Required for Docker

    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }
    environment_variable {
      name  = "AWS_REGION"
      value = "us-east-1"
    }
  }

  source {
    type = "CODEPIPELINE"
    buildspec = "buildspec.yml"
  }
}

data "aws_caller_identity" "current" {}

# -------------------------------------------------------------------------------------------------
# CodePipeline
# -------------------------------------------------------------------------------------------------
resource "aws_codepipeline" "pipeline" {
  name     = "study-app-pipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.pipeline_artifacts.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn    = aws_codestarconnections_connection.github.arn
        FullRepositoryId = "karanmoreshwar-hue/fullstck-study-app"
        BranchName       = "main"
      }
    }
  }

  stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"

      configuration = {
        ProjectName = aws_codebuild_project.build.name
      }
    }
  }
}

output "pipeline_url" {
  value = "https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/${aws_codepipeline.pipeline.name}/view?region=us-east-1"
}

output "connection_status_url" {
  value = "https://us-east-1.console.aws.amazon.com/codesuite/settings/connections?region=us-east-1"
}
