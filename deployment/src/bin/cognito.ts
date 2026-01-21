#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CognitoPostConfirmationStack } from "../lib/cognitoPostConfirmationStack";
import { CognitoStack } from "../lib/cognitoStack";

const app = new cdk.App();

const systemName = "uptickart";

const postConfirmationStack = new CognitoPostConfirmationStack(
  app,
  "system-cognito-post-confirmation",
  {
    systemName,
  },
);

// Create Cognito stack
new CognitoStack(app, "system-cognito", {
  systemName,
  postConfirmationLambda: postConfirmationStack.lambda,
});
