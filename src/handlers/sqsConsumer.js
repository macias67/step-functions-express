/* eslint-disable no-console */
/* eslint-disable camelcase */

const SaveImage = require('../service/saveImage');

module.exports.index = async (event) => {
  console.log(`Total records: ${event.Records.length} --------`);

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
  }
};
