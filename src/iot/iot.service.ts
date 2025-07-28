import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { connect, MqttClient } from 'mqtt';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { AWSDETAILS } from 'src/types/aws.details';

import { InvoiceService } from 'src/invoice/invoice.service';
import { ServerIDService } from 'src/serverId/server-id.service';
import { NotificationsService } from 'src/notification/notifications.service';

@Injectable()
export class IOTService {
  private client: MqttClient | null = null;
  private topicName: string;

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly ServerID: ServerIDService,
    private readonly notificationService: NotificationsService,
  ) {}

  private async loginAndGetToken(body: {
    username: string;
    password: string;
  }): Promise<string> {
    const poolData: { UserPoolId: string; ClientId: string } = {
      UserPoolId: AWSDETAILS.cognito?.UserPoolId,
      ClientId: AWSDETAILS.cognito?.ClientId,
    };
    const userPool = new CognitoUserPool(poolData);

    console.log('BODY :::: ', body);

    const authDetails = new AuthenticationDetails({
      Username: body.username,
      Password: body.password,
    });

    const cognitoUser = new CognitoUser({
      Username: body.username,
      Pool: userPool,
    });

    return await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          const idToken = session.getIdToken().getJwtToken();
          cognitoUser.getUserAttributes((err, result) => {
            if (err) {
              console.error('GetUserAttributes Error:', err);
            }

            const attributes: Record<string, string> = {};
            if (result) {
              result.forEach((attr) => {
                attributes[attr.getName()] = attr.getValue();
              });
            }
            console.log('attributes : ', attributes);
            this.topicName = attributes.given_name;
          });
          resolve(idToken);
        },
        onFailure: (err) => {
          console.error('Cognito Auth Error:', err);
          return reject(
            new UnauthorizedException('Invalid username or password'),
          );
        },
      });
    });
  }

  private async getTemporaryCredentials(
    idToken: string,
  ): Promise<AWS.Credentials> {
    AWS.config.region = AWSDETAILS.region;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWSDETAILS.cognito.IdentityPoolId,
      Logins: {
        [`cognito-idp.${AWSDETAILS.region}.amazonaws.com/${AWSDETAILS.cognito.UserPoolId}`]:
          idToken,
      },
    });

    return new Promise((resolve, reject) => {
      (AWS.config.credentials as AWS.Credentials).get((err) => {
        if (err) {
          console.error('Credential error:', err);
          reject(err);
        } else {
          resolve(AWS.config.credentials as AWS.Credentials);
        }
      });
    });
  }

  async connectToIoT(body: {
    username: string;
    password: string;
    topic: string;
  }) {
    const idToken = await this.loginAndGetToken(body);
    const creds = await this.getTemporaryCredentials(idToken);

    try {
      const ssm = new AWS.SSM({
        region: 'ap-south-1',
        credentials: creds,
      });

      const privateKey = await ssm
        .getParameter({
          Name: AWSDETAILS.systemManager.privateKey,
          WithDecryption: true,
        })
        .promise();
      const certificate = await ssm
        .getParameter({
          Name: AWSDETAILS.systemManager.certificatePem,
          WithDecryption: true,
        })
        .promise();
      const AmazonRootCA1 = await ssm
        .getParameter({
          Name: AWSDETAILS.systemManager.AmazonRootCA1,
          WithDecryption: true,
        })
        .promise();

      const HOST = AWSDETAILS.iot.HOST;

      const options = {
        host: HOST,
        port: 8883,
        protocol: 'mqtts' as const,
        key: privateKey.Parameter?.Value,
        cert: certificate.Parameter?.Value,
        ca: AmazonRootCA1.Parameter?.Value,
        rejectUnauthorized: true,
        clientId: 'MyNodeClient_' + Math.floor(Math.random() * 100000),
      };
      this.client = connect(options);

      this.client.on('connect', () => {
        console.log('✅ Connected to AWS IoT');
        this.client?.subscribe(`${this.topicName}/topic`, (err) => {
          if (err) console.error('❌ Subscribe error:', err);
          else console.log('📡 Subscribed to topic');
        });
      });

      this.client.on('message', (topic, message) => {
        console.log('📩 Topic:', message);

        void (async () => {
          try {
            const orderData = JSON.parse(message.toString());

            await this.invoiceService.printInvoice(orderData.data);

            this.notificationService.sendNewNotification({
              message: JSON.stringify(orderData.data),
            });
          } catch (err) {
            console.error(
              '❌ Error processing message or printing invoice:',
              err,
            );
          }
        })();
      });
    } catch (error) {
      if (error.code === 'ParameterNotFound') {
        throw new NotFoundException(`SSM Parameter not found`);
      }
      throw error;
    }

    return { ServerID: this.ServerID.getUUID() };
  }

  disconnectIOT(): string {
    if (this.client) {
      this.client.end(false, () => {
        console.log('🔌 Disconnected from AWS IoT');
      });
      this.client = null;
      return 'Disconnected from AWS IoT';
    }
    return 'No active IoT connection';
  }
}
