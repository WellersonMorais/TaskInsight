module.exports = function parseDate(value) {
  if (!value) return undefined;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? undefined
    : date;
};