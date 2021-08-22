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

  // eslint-disable-next-line class-methods-use-this
  _getParamsToSendMessages(params) {
    if (!Array.isArray(params)) {
      throw new Error('Params must be array');
    }

    const batches = [];
    let entries = [];
    let batchSize = 0;

    params.forEach((param) => {
      const attributes = {
        Id: `${param.id}`, /* required */
        MessageBody: JSON.stringify(param), /* required */
        // DelaySeconds: 'NUMBER_VALUE',
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
      };

      entries.push(attributes);
      batchSize += 1;

      if (batchSize === 10) {
        batches.push({
          Entries: entries,
          QueueUrl: `${process.env.SQS_URL}`,
        });
        entries = [];
        batchSize = 0;
      }
    });

    return batches;
  }

  // eslint-disable-next-line consistent-return
  sendSimpleMessage(params) {
    try {
      const batches = this._getParamsToSendSimpleMessage(params);

      const promises = [];
      batches.forEach((batch) => promises.push(this.SQS.sendMessage(batch).promise()));

      return Promise.allSettled(promises);
    } catch (error) {
      throw new Error(error);
    }
  }

  sendBatchMessages(params) {
    try {
      const batches = this._getParamsToSendMessages(params);

      console.log(`Total batches: ${batches.length}`);

      const promises = [];
      batches.forEach((batch, i) => {
        console.log(`Total entries for batch[${i}]: ${batch.Entries.length}`);
        promises.push(this.SQS.sendMessageBatch(batch).promise());
      });

      return Promise.all(promises);
    } catch (error) {
      throw new Error(error);
    }
  }
};
