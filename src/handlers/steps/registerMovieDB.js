/* eslint-disable no-console */
module.exports.index = async (event) => {
  console.log(JSON.stringify(event));

  return event;
};
