import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from "@rollup/plugin-node-resolve";
import {getBabelOutputPlugin} from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

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
    }),
    json(),
    getBabelOutputPlugin(babelOptions),
    terser({ compress: { passes: 2, unsafe: true } }),
  ]
};