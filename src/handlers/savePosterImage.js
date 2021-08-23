/* eslint-disable no-console */
const SaveImage = require('../service/saveImage');

module.exports.index = async (event) => {
  console.log(JSON.stringify(event));
  const { size, movie } = event;
  try {
    const saveImage = new SaveImage(size);
    return saveImage.saveImageToBucket(movie);
  } catch (error) {
    throw new Error(error.message);
  }
};
