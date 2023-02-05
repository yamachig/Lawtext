import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { parse } from "dotenv";
import * as fs from "fs";
import * as path from "path";


export class CdkStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const dotenv_path = path.join(__dirname, "../.env");
        const dotenv_variables = fs.existsSync(dotenv_path) ? parse(fs.readFileSync(dotenv_path)) : {};

        const namePrefix = props?.stackName ?? dotenv_variables.NAME_PREFIX ?? "lawtext_api";
        const functionRole = new iam.Role(
            this,
            `${namePrefix}_function_role`,
            {
                assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
                managedPolicies: [
                    iam.ManagedPolicy.fromAwsManagedPolicyName(
                        "service-role/AWSLambdaBasicExecutionRole"
                    ),
                    new iam.ManagedPolicy(this, `${namePrefix}_policy_dynamodb`, {
                        document: iam.PolicyDocument.fromJson({
                            "Version": "2012-10-17",
                            "Statement": [
                                {
                                    "Effect": "Allow",
                                    "Action": ["dynamodb:*"],
                                    "Resource": "*",
                                },
                            ],
                        }),
                    }),
                ],
            }
        );

        const lambdaFunction = new lambda.DockerImageFunction(this, `${namePrefix}_function`, {
            code: lambda.DockerImageCode.fromImageAsset("../lambda"),
            timeout: cdk.Duration.seconds(300),
            role: functionRole,
        });

        const integration = new HttpLambdaIntegration(`${namePrefix}_integration`, lambdaFunction);

        const api = new apigwv2.HttpApi(this, `${namePrefix}_api`);
        api.addRoutes({ path: "/{proxy+}", integration });
        lambdaFunction.addEnvironment("API_ENDPOINT", api.apiEndpoint);

        new cdk.CfnOutput(this, "ApiEndpoint", {
            value: api.apiEndpoint,
        });
    }
}
