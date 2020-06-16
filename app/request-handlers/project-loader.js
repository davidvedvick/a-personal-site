const portfolio = require('codefolio');
const path = require('path');
const fs = require('fs').promises;

module.exports = (projectLocation) => async (projectData) => {
    const projects = await Promise.all(JSON.parse(projectData).map(async project => {
        const filePath = path.join(projectLocation, project.name);
  
        console.log(project.headlineImage);
  
        const examples = project.images.map(i => {
          return {
            url: path.join('imgs', i.path),
            alt: i.description,
            title: i.description
          }
        });

        let logo = null;
        if (project.headlineImage) {
          logo = {
            url: path.join('imgs', project.headlineImage.path),
            alt: project.headlineImage.description,
            title: project.headlineImage.description
          };
        }
  
        return {
          location: filePath,
          bodyCopy: 'features.md',
          logo: logo,
          examples: examples
        };
      }));
  
    return await portfolio.promisePortfolios(projects);
};