import {
  CfnManagedLoginBranding,
  OAuthScope,
  UserPool,
  CfnUserPoolGroup,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface CognitoStackProps extends StackProps {
  systemName: string;
  postConfirmationLambda: NodejsFunction;
}

export class CognitoStack extends Stack {
  public readonly userPool: UserPool;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const { systemName, postConfirmationLambda } = props;
    const uniquePrefix = `${systemName}`.replaceAll(".", "-");

    this.userPool = new UserPool(this, "uptick-userpool", {
      userPoolName: "uptick-userpool",
      removalPolicy: RemovalPolicy.DESTROY,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
      selfSignUpEnabled: true,
      lambdaTriggers: {
        postConfirmation: postConfirmationLambda,
      },
    });

    const cognitoDomain = this.userPool.addDomain(`${uniquePrefix}-domain`, {
      cognitoDomain: {
        domainPrefix: uniquePrefix,
      },
      managedLoginVersion: 2,
    });

    const callbackUrls = [`http://localhost:3000/callback`];
    const logoutUrls = [`http://localhost:3000`];

    const spaClient = this.userPool.addClient("uptick-spa-client", {
      userPoolClientName: "uptick-spa-client",
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PHONE],
        callbackUrls,
        logoutUrls,
      },
      generateSecret: false,
    });

    new CfnManagedLoginBranding(
      this,
      "uptick-web-server-managed-login-branding",
      {
        userPoolId: this.userPool.userPoolId,
        clientId: spaClient.userPoolClientId,
        returnMergedResources: true,
        settings: {
          components: {
            primaryButton: {
              lightMode: {
                defaults: {
                  backgroundColor: "0972d3ff",
                  textColor: "ffffffff",
                },
                hover: {
                  backgroundColor: "033160ff",
                  textColor: "ffffffff",
                },
                active: {
                  backgroundColor: "033160ff",
                  textColor: "ffffffff",
                },
              },
              darkMode: {
                defaults: {
                  backgroundColor: "539fe5ff",
                  textColor: "000716ff",
                },
                hover: {
                  backgroundColor: "89bdeeff",
                  textColor: "000716ff",
                },
                active: {
                  backgroundColor: "539fe5ff",
                  textColor: "000716ff",
                },
              },
            },
            pageBackground: {
              lightMode: {
                color: "ffffffff",
              },
              darkMode: {
                color: "044444ff",
              },
              image: {
                enabled: false,
              },
            },
          },
          categories: {
            auth: {
              authMethodOrder: [
                [
                  {
                    display: "BUTTON",
                    type: "FEDERATED",
                  },
                  {
                    display: "INPUT",
                    type: "USERNAME_PASSWORD",
                  },
                ],
              ],
              federation: {
                interfaceStyle: "BUTTON_LIST",
                order: [],
              },
            },
            global: {
              colorSchemeMode: "DARK",
              pageHeader: {
                enabled: false,
              },
              pageFooter: {
                enabled: false,
              },
            },
          },
        },
      },
    );

    // Construct the full Cognito domain URL
    const cognitoDomainUrl = `https://${cognitoDomain.domainName}.auth.${this.region}.amazoncognito.com`;
    new CfnOutput(this, "cognito-domain-output", { value: cognitoDomainUrl });

    const clientId = spaClient.userPoolClientId;
    new CfnOutput(this, "cognito-client-id-output", { value: clientId });

    // Create administrators group
    new CfnUserPoolGroup(this, "AdministratorsGroup", {
      userPoolId: this.userPool.userPoolId,
      groupName: "administrators",
      description: "Administrator users with elevated permissions",
    });

    // Note: UserPool is now passed directly to API stacks as a prop, no SSM parameter needed

    // Output User Pool information for verification
    new CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      description: "Cognito User Pool ID",
    });

    new CfnOutput(this, "UserPoolArn", {
      value: this.userPool.userPoolArn,
      description: "Cognito User Pool ARN",
    });
  }
}
