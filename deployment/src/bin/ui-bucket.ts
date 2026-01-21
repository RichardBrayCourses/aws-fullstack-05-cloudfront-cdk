#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/uiBucketStack.js";

const app = new cdk.App();

new AppStack(app, `system-ui-bucket`, {
  env: {
    region: "us-east-1", // CloudFront is global, but we need to specify a region for the stack
  },
});
