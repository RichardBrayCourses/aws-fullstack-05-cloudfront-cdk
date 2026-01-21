import { Construct } from 'constructs';
import { dirname, join } from 'path';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Stack, StackProps } from 'aws-cdk-lib';
import { fileURLToPath } from 'url';

interface AppStackProps extends StackProps {}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const appDist = join(__dirname, '..', '..', '..', 'uptickart', 'dist');

    const bucketName = StringParameter.valueForStringParameter(
      this,
      `/cloudfront/uptick/bucket-name`
    );
    const bucket = Bucket.fromBucketName(this, 'ImportedBucket', bucketName);

    const distId = StringParameter.valueForStringParameter(
      this,
      `/cloudfront/uptick/distribution-id`
    );
    const distribution = Distribution.fromDistributionAttributes(
      this,
      'ImportedDist',
      {
        distributionId: distId,
        domainName: `${distId}.cloudfront.net`, // required but not used for deployment
      }
    );

    new BucketDeployment(this, `uptick-cloudfront-uptickart-deployment`, {
      sources: [Source.asset(appDist)],
      destinationBucket: bucket,
      destinationKeyPrefix: `apps/uptickart/latest`,
      distribution,
      distributionPaths: ['/*'],
    });
  }
}
