import requireGlob from 'require-glob';
import path from "path";

// Load the app configs, starting from the working directory of the process
function loadConfigs() {
  const configs = requireGlob
    .sync("./**/app-config.json", {
      cwd: process.cwd(),
      reducer: (_, result, file) => {
        result.push({ path: file.path, exports: file.exports });
        return result;
      },
      initialValue: [],
    })
    .sort((a, b) => b.path.split(path.sep).length - a.path.split(path.sep).length);

  let appConfig = {};
  for (const config of configs) {
    appConfig = Object.assign(appConfig, config.exports);
  }

  let ssl = appConfig.ssl;
  if (process.env.SSL_PRIVATE_KEY || process.env.SSL_CERT) {
    ssl = {
      privateKey: process.env.SSL_PRIVATE_KEY ?? ssl?.privateKey,
      certificate: process.env.SSL_CERT ?? ssl?.certificate,
    };
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
    projectsLocation: process.env.PROJECTS_LOCATION ?? appConfig.projectsLocation,
    wellKnownLocation: process.env.WELL_KNOWN_LOCATION ?? appConfig.wellKnownLocation,
    ssl: ssl
  };
}

export default loadConfigs();