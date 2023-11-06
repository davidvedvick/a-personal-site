import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from "@rollup/plugin-node-resolve";
import {getBabelOutputPlugin} from '@rollup/plugin-babel';

const babelOptions = {
  presets: [
    ['@babel/preset-env', {
      "targets": "node 16",
      "modules": 'auto',
    }],
    '@babel/preset-react'
  ],
  plugins: ['@babel/transform-runtime', '@babel/plugin-proposal-optional-chaining'],
  parserOpts: {
    allowImportExportEverywhere: true
  }
};

export default {
  plugins: [
    commonjs({
      ignoreDynamicRequires: true,
    }),
    nodeResolve({
      preferBuiltins: true,
      // include: "node_modules/**",
    }),
    json(),
    getBabelOutputPlugin(babelOptions)
  ]
};