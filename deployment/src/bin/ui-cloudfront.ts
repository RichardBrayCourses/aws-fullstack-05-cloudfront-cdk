#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { config } from "dotenv";
import { resolve } from "path";
import { UiCloudFrontStack } from "../lib/uiCloudFrontStack";

// Load environment variables from .env file
config({ path: resolve(__dirname, "../../../.env") });

const app = new cdk.App();

if (!process.env.CDK_UI_BUCKETNAME) {
  throw Error(
    "Error: bucket name not found. Please set CDK_UI_BUCKETNAME in .env file or as an environment variable.",
  );
}

const bucketName = process.env.CDK_UI_BUCKETNAME;

// Create UI CloudFront stack (creates its own S3 bucket)
new UiCloudFrontStack(app, "system-ui-cloudfront", {
  env: {
    region: "us-east-1", // CloudFront is global, but we need to specify a region for the stack
  },
  bucketName,
});
