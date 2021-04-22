import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

export default {
  input: `src/index.ts`,
  output: {
    dir: 'dist',
    format: 'umd',
    sourcemap: true,
    name: 'logdna',
  },
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    typescript(),
    commonjs(),
    resolve(),
    replace({
      'process.env.FORCE_SIMILAR_INSTEAD_OF_MAP': 'false',
    }),
    terser({
      format: {
        // I don't believe TSLib needs its license to be distributed with
        // the bundled JS
        comments: false,
      },
    }),
  ],
};
