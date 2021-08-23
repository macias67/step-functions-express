/* eslint-disable no-console */
/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
const StepFunctions = require('aws-sdk/clients/stepfunctions');

// const SaveImage = require('../service/saveImage');

module.exports.index = async (event, context, callback) => {
  console.log(`Total records: ${event.Records.length} --------`);

  const stateMachines = [];
  const records = [];
  const failedRecords = [];

  event.Records.forEach(({ body }) => {
    const movie = JSON.parse(body);

    const inputStep = {
      movie,
      posterInfo: {
        sizes: [
          { size: 'w92', movie },
          { size: 'w154', movie },
          { size: 'w185', movie },
          { size: 'w342', movie },
          { size: 'w500', movie },
          { size: 'w780', movie },
          { size: 'original', movie },
        ],
      },
    };

    const stepfunctions = new StepFunctions({ apiVersion: '2016-11-23', region: process.env.AWS_REGION });

    const params = {
      stateMachineArn: process.env.STATE_MACHINE_ARN, /* required */
      input: JSON.stringify(inputStep),
      name: `ìd-${movie.id}`,
    };

    const promise = stepfunctions.startExecution(params).promise();
    promise.catch((error) => {
      failedRecords.push([body, error]);
    });

    console.log('startStateMachine', JSON.stringify(params));

    records.push(body);
    stateMachines.push(promise);
  });

  /*
  try {
    const promises = [];
    event.Records.forEach(({ body }) => {
      const saveImage = new SaveImage();
      const movie = JSON.parse(body);
      promises.push(saveImage.saveImageToBucket(movie));
    });

    const responses = await Promise.allSettled(promises);
    const allFulfilled = responses.filter((response) => response.status === 'fulfilled');
    const allRejected = responses.filter((response) => response.status === 'rejected');

    console.log(`Total de subidas: ${allFulfilled.length}`);
    console.log(`Total de errores: ${allRejected.length}`);

    allRejected.forEach((e) => console.log(JSON.stringify(e)));
  } catch (error) {
    throw new Error(error.message);
  } * */

  return Promise.allSettled(stateMachines)
    .then((response) => {
      response.forEach((item, index) => {
        console.log('executionSuccess', JSON.stringify({ eventName: `ìd-${records[index].id}`, executionArn: item.value.executionArn }));
      });

      failedRecords.forEach((item, index) => {
        console.log('executionFailed', JSON.stringify({ eventName: `ìd-${item[index][0].id}`, executionArn: item.value.executionArn }));
      });

      return callback(null, 'StateMachineStartExecutionSuccess');
    })
    .catch((error) => {
      console.log('promiseStateMachineError', JSON.stringify(error));

      return callback(null, 'StateMachineStartExecutionFailed');
    });
};
