import { Construct } from "constructs";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import {
  CachePolicy,
  Distribution,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";

interface UiCloudFrontStackProps extends StackProps {
  bucketName: string;
}

export class UiCloudFrontStack extends Stack {
  public readonly distribution: Distribution;
  public readonly cloudfrontUrl: string;

  constructor(scope: Construct, id: string, props: UiCloudFrontStackProps) {
    super(scope, id, props);

    const { bucketName } = props;

    // Create S3 bucket for UI
    const uiBucket = new Bucket(this, "UiBucket", {
      bucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    this.distribution = new Distribution(this, "ui-distribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(uiBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
      },
      defaultRootObject: "/uptickart/index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/uptickart/index.html",
          ttl: Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/uptickart/index.html",
          ttl: Duration.seconds(0),
        },
      ],
    });

    new CfnOutput(this, "UiCloudFrontDistributionIdOutput", {
      value: this.distribution.distributionId,
    });
  }
}
