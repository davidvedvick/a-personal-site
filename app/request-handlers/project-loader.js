import * as portfolio from 'codefolio';
import path from 'path';
import {globby} from 'globby';
import appConfig from "../app-config.cjs";

export default async (contentPath) => {
  const pattern = path.join(appConfig.projectsLocation, "*", "README.md");

  console.log("Searching for projects using `%s`...", pattern);

  const projectReadmes = await globby(pattern);
  console.log("Projects found:", projectReadmes);

  const promisedPortfolios = projectReadmes
    .map(async r => {
      const portfolios = await portfolio.promisePortfolios([r]);
      for (const portfolio of portfolios) {
        const portfolioDir = path.dirname(r);
        const contentDir = contentPath ? path.join(contentPath, path.basename(portfolioDir)) : portfolioDir;
        const portfolioImage = portfolio.image;
        if (portfolioImage) {
          portfolioImage.url = path.join(contentDir, portfolioImage.url);
        }

        for (const example of portfolio.examples) {
          example.url = path.join(contentDir, example.url);
        }

        const additionalExamples = await globby(path.join(portfolioDir, "examples", "*.{png,svg}"));

        portfolio.examples = portfolio.examples.concat(additionalExamples.map(p => {
          let examplePath = p;
          if (contentPath) {
            const relativePath = path.relative(portfolioDir, p);
            examplePath = path.join(contentDir, relativePath);
          }
          return {
            url: examplePath,
          }
        }));
      }

      return portfolios;
    });

  const portfolios = await Promise.all(promisedPortfolios);
  return portfolios.flatMap(p => p);
};