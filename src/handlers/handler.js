/* eslint-disable no-console */
module.exports.hello = async () => {
  await new Promise((r) => setTimeout(r, 5000));

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        // input: event,
      },
      null,
      2,
    ),
  };
};
