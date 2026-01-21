import { Construct } from "constructs";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { Stack, StackProps } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface UiCloudFrontParameterStackProps extends StackProps {
  bucketName: string;
  distributionId: string;
}

export class UiCloudFrontParameterStack extends Stack {
  public readonly distribution: Distribution;
  public readonly cloudfrontUrl: string;

  constructor(
    scope: Construct,
    id: string,
    props: UiCloudFrontParameterStackProps,
  ) {
    super(scope, id, props);

    const { bucketName, distributionId } = props;

    new StringParameter(this, "CloudFrontBucketName", {
      parameterName: `/cloudfront/uptick/bucket-name`,
      stringValue: bucketName,
    });

    new StringParameter(this, "CloudFrontDistributionId", {
      parameterName: `/cloudfront/uptick/distribution-id`,
      stringValue: distributionId,
    });
  }
}
