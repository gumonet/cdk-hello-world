import { Duration, lambda_layer_awscli, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcouter';
import {TableViewer} from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //defines an aws Lambda resource
    const hello = new lambda.Function( this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X, //excecution environment
      code: lambda.Code.fromAsset('lambda'), //code loaded from lambda directory
      handler:'hello.handler' //file is "hello", function is "handler"
    })

    const helloWithCounter = new HitCounter( this, 
      'HelloHitCounter', {
        downstream: hello
      })

    //defines an API Gateway REST API resource backend by our hello funtion.
    new apigw.LambdaRestApi( this, 'Endpoint', {
      handler: helloWithCounter.handler
    });
    new TableViewer ( this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table:helloWithCounter.table
    })
    

  }
}
