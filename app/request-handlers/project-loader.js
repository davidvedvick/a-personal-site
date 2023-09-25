const portfolio = require('codefolio');
const path = require('path');
const glob = require('globby');

module.exports = (projectLocation) => async () => {
  const pattern = path.join(projectLocation, "*", "README.md");

  console.log(`Searching for projects using '${pattern}'...`);

  const projectReadmes = await glob(pattern);
  console.log("Projects found: ", projectReadmes);
  return portfolio.promisePortfolios(projectReadmes);
};