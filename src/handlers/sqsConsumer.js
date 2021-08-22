module.exports.index = (event) => {
  console.log(`Total records: ${event.Records.length} --------`);

  // event.Records.forEach((record) => console.log(record));
};
