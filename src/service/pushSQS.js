/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');

module.exports = class PushSQS {
  constructor() {
    AWS.config.update({ region: `${process.env.AWS_REGION}` });
    this.SQS = new AWS.SQS({ apiVersion: '2012-11-05' });
  }

  // eslint-disable-next-line class-methods-use-this
  _getParamsToSendSimpleMessage(params) {
    if (typeof params !== 'object') {
      throw new Error('Params must be object');
    }

    return {
      MessageAttributes: {
        Id: {
          DataType: 'String',
          StringValue: `${params.id}`,
        },
        Title: {
          DataType: 'String',
          StringValue: `${params.title}`.toLowerCase(),
        },
      },
      MessageBody: JSON.stringify(params),
      QueueUrl: `${process.env.SQS_URL}`,
    };
  }

  // eslint-disable-next-line consistent-return
  sendSimpleMessage(params) {
    try {
      const message = this._getParamsToSendSimpleMessage(params);

      return this.SQS.sendMessage(message).promise();
    } catch (error) {
      throw new Error(error);
    }
  }
};
