import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";

interface CognitoPostConfirmationStackProps extends StackProps {
  systemName: string;
}

export class CognitoPostConfirmationStack extends Stack {
  public readonly lambda: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    props: CognitoPostConfirmationStackProps,
  ) {
    super(scope, id, props);

    const { systemName } = props;

    const uniquePrefix = `${systemName}-post-confirmation`;

    this.lambda = new NodejsFunction(this, uniquePrefix, {
      entry: join(__dirname, "..", "lambdas", "postConfirmation.ts"),
      handler: "handler",
      functionName: uniquePrefix,
      runtime: Runtime.NODEJS_LATEST,
    });

  }
}
