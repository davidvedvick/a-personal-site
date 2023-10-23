const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs')
const nodeResolve = require("@rollup/plugin-node-resolve");
const babel = require('@rollup/plugin-babel');

const babelOptions = {
  presets: [
    ['@babel/preset-env', {
      "targets": "node 16",
      "modules": 'cjs',
    }],
    '@babel/preset-react'
  ],
  plugins: ['@babel/transform-runtime', '@babel/plugin-proposal-optional-chaining'/*, '@babel/plugin-transform-modules-commonjs', '@babel/plugin-syntax-dynamic-import'*/],
  parserOpts: {
    allowImportExportEverywhere: true
  }
};

module.exports = {
  plugins: [
    commonjs({ ignoreDynamicRequires: true }),
    nodeResolve({ preferBuiltins: true }),
    json(),
    babel.getBabelOutputPlugin(babelOptions)
  ]
};