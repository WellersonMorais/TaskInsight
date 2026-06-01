module.exports = function parseNumber(value) {
  const number = Number(value);

  return Number.isNaN(number)
    ? undefined
    : number;
};