import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';


export interface HitCounterProps {
    /** the funtion for which we want to count url hits */
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

    /** allows accessinfo the counter function. This acction is accesible from export class */ 
    public readonly handler: lambda.Function;
    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: HitCounterProps){
        super( scope, id);

        const table = new dynamodb.Table( this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
        });

        this.table = table;

        this.handler = new lambda.Function( this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });

        // grant the lambda role read/write permissions to our table permissions to our table
        table.grantReadWriteData( this.handler );

        props.downstream.grantInvoke( this.handler );


    }
}