let sshConfig = {}
try {
  sshConfig = require('./ssh-config.json');
} catch {
  // ignored
}
module.exports = {
  username: process.env.SSH_USERNAME ?? sshConfig.username,
  password: process.env.SSH_PASSWORD ?? sshConfig.password,
  privateKey: process.env.PRIVATE_KEY ?? sshConfig.privateKey,
  publicKey: process.env.PUBLIC_KEY ?? sshConfig.publicKey
}