import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from "@rollup/plugin-node-resolve";
import {babel} from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from "@rollup/plugin-json";
import nodePolyfills from 'rollup-plugin-polyfill-node';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

const babelOptions = {
  babelHelpers: 'bundled',
  exclude: 'node_modules/**',
  presets: [
    ['@babel/preset-env', {
      "targets": {
        "browsers": ["last 2 versions"]
      },
      "modules": 'auto',
    }],
    '@babel/preset-react'
  ],
};

export default {
  plugins: [
    nodePolyfills(),
    commonjs(),
    nodeResolve({
      preferBuiltins: true,
      browser: true,
    }),
    json(),
    babel(babelOptions),
    injectProcessEnv({
      NODE_ENV: process.env.NODE_ENV,
    }),
    terser({ compress: { passes: 2, unsafe: true } })
  ]
};