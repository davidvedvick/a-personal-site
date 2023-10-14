const requireGlob = require('require-glob');
const path = require("path");

// Load the app configs, starting from the working directory of the process
function loadConfigs() {
  const configs = requireGlob.sync("./**/app-config.json", {
    cwd: process.cwd(),
    reducer: (opts, result, file, i, files) => {
      result.push({ path: file.path, exports: file.exports });
      return result;
    },
    initialValue: [],
  });
  configs.sort((a, b) => b.path.split(path.sep).length - a.path.split(path.sep).length);
  let appConfig = {};
  for (const config of configs) {
    try {
      appConfig = Object.assign(appConfig, config.exports);
    } catch {
      // ignored
    }
  }

  return {
    bio: {
      authorPicture: process.env.BIO_AUTHOR_PICTURE ?? appConfig.bio?.authorPicture,
      path: process.env.BIO_PATH ?? appConfig.bio?.path
    },
    notes: {
      path: process.env.NOTES_PATH ?? appConfig.notes?.path,
      content: process.env.NOTES_CONTENT ?? appConfig.notes?.content,
      gitPath: process.env.NOTES_GIT_PATH ?? appConfig.notes?.gitPath
    },
    resumeLocation: process.env.RESUME_LOCATION ?? appConfig.resumeLocation,
    projectsLocation: process.env.PROJECTS_LOCATION ?? appConfig.projectsLocation
  };
}

module.exports = loadConfigs();