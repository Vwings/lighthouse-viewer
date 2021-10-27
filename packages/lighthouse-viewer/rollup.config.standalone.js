import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-import-css';
import { string } from "rollup-plugin-string";
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/imported/clients/standalone.js',
    output: {
      file: 'dist/report/standalone.js',
      format: 'iife'
    },
    plugins: [
    string({
        include: ['**/*.html', '**/report/standalone.js']
    }),
    css(),
      commonjs(),
      terser()
    ]
  };