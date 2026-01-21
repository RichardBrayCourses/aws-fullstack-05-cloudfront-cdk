#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { UiCloudFrontStack } from "../lib/uiCloudFrontStack";

const app = new cdk.App();

if (!process.env.CDK_UI_BUCKET) {
  throw Error(
    "Error: bucket name not found.  Please set env var process.env.CDK_UI_BUCKET",
  );
}

const bucketName = process.env.CDK_UI_BUCKET;

// Create UI CloudFront stack (creates its own S3 bucket)
new UiCloudFrontStack(app, "system-ui-cloudfront", {
  env: {
    region: "us-east-1", // CloudFront is global, but we need to specify a region for the stack
  },
  bucketName,
});
