import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';

const OUTPUT_DATA = [
  {
    input: 'src/index.ts',
    file: 'dist/index.esm.js',
    format: 'es',
  },
  {
    input: 'src/index-umd.ts',
    file: 'dist/index.js',
    format: 'umd',
  },
];

const config = OUTPUT_DATA.map(({ file, format, input }) => ({
  input,
  output: {
    file,
    format,
    sourcemap: true,
    name: 'logdna',
  },
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
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
    copy({
      targets: [{ src: 'src/logdna.d.ts', dest: 'dist/types' }],
    }),
  ],
}));

export default config;
