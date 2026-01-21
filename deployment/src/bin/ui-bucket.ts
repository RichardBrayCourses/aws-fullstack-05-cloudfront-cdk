#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/uiBucketStack.js";

const app = new cdk.App();

if (!process.env.CDK_UI_BUCKET) {
  throw Error(
    "Error: bucket name not found.  Please set env var process.env.CDK_UI_BUCKET",
  );
}

const bucketName = process.env.CDK_UI_BUCKET;

new AppStack(app, `system-ui-bucket`, {
  env: {
    region: "us-east-1", // CloudFront is global, but we need to specify a region for the stack
  },
  bucketName,
});
