const portfolio = require('codefolio');
const path = require('path');
const glob = require('globby');

module.exports = (projectLocation) => () => {
  const projectReadmes = glob(path.join(projectLocation, "*", "README.md"));
  return portfolio.promisePortfolios(projectReadmes);
};