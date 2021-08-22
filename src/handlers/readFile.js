/* eslint-disable no-console */
// console.log('Loading function');
// eslint-disable-next-line import/no-extraneous-dependencies
const aws = require('aws-sdk');
const PushSQS = require('../service/pushSQS');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

module.exports.index = async (event) => {
  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  try {
    const object = await s3.getObject({
      Bucket: bucket,
      Key: key,
    }).promise();

    const data = Buffer.from(object.Body).toString('utf8');
    const movies = JSON.parse(data);

    console.log(`Total movies: ${movies.length}`);

    const pushSQS = new PushSQS();

    // Simple Message
    /* const promises = [];
    Object.values(movies).forEach((movie) => {
      promises.push(pushSQS.sendSimpleMessage(movie));
    });

    await Promise.allSettled(promises); */

    // Batch Message
    await pushSQS.sendBatchMessages(movies);
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error(err.message);
  }
};
