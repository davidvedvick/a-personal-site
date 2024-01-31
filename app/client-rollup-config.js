import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from "@rollup/plugin-node-resolve";
import {babel} from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from "@rollup/plugin-json";
import nodePolyfills from 'rollup-plugin-polyfill-node';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

const babelOptions = {
  babelHelpers: 'bundled',
  presets: [
    '@babel/preset-react',
    ['@babel/preset-env', {
      "targets": {"browsers": ["last 2 versions"]},
    }],
  ],
};

const plugins = [
  nodeResolve({
    browser: true,
    dedupe: ['react', 'react-dom'],
  }),
  commonjs(),
  babel(babelOptions),
  json(),
  injectProcessEnv({
    NODE_ENV: process.env.NODE_ENV,
  }),
  nodePolyfills()
];

if (process.env.NODE_ENV === "production") {
  plugins.push(terser({ compress: { passes: 2, unsafe: true } }));
}

export default {
  plugins: plugins
};