/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
const aws = require('aws-sdk');
const axios = require('axios').default;

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

module.exports = class SaveImage {
  constructor() {
    this.size = `${process.env.IMAGE_SIZE}`;
    this.baseUrl = `https://image.tmdb.org/t/p/${this.size}`;
  }

  async _getImageFromURL(fileName) {
    try {
      const options = {
        method: 'GET',
        url: `${this.baseUrl}/${fileName}`,
        responseType: 'arraybuffer',
      };
      const { data } = await axios.request(options);
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async saveImageToBucket(movieData) {
    try {
      const {
        id,
        original_title,
        original_language,
        poster_path,
        adult,
      } = movieData;

      const data = await this._getImageFromURL(poster_path);

      const params = {
        Bucket: `${process.env.POSTER_BUCKET_NAME}`,
        Key: `${this.size}${poster_path}`,
        Body: data,
        ContentType: 'image/jpeg',
        Tagging: `id=${id}&size=${this.size}&adult=${adult}`,
        Metadata: {
          size: this.size,
          id: `${id}`,
          lng: original_language,
          adult: `${adult}`,
        },
      };

      console.log(`Id: ${id} - Title: ${original_title}`);

      const promise = s3.putObject(params).promise();
      promise.catch((error) => {
        console.log(`Error al subir Id: ${id} - Title: ${original_title}`);
        console.log(error);
      });
    } catch (error) {
      throw new Error(error);
    }
  }
};
