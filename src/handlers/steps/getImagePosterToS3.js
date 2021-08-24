/* eslint-disable no-console */
const log = require('lambda-log');
const SaveImage = require('../../service/saveImage');

module.exports.index = async (event) => {
  // console.log(JSON.stringify(event));
  log.options.meta.event = event;
  // log.options.tags.push(event.env);
  log.options.debug = true;

  try {
    const { size, movie } = event;

    const saveImage = new SaveImage(size);
    const infoS3 = await saveImage.saveImageToBucket(movie);

    log.debug('image saved into bucket', {
      size, id: movie.id, tittle: movie.original_title, file: movie.poster_path, infoS3,
    });

    return movie;
  } catch (error) {
    throw new Error(error.message);
  }
};
