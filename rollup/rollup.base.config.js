import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import analyzer from 'rollup-plugin-analyzer';
import htmlString from 'rollup-plugin-html';
import postcss from 'rollup-plugin-postcss';
import { string } from "rollup-plugin-string";
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import autoPreprocess from 'svelte-preprocess';

export default (
  {
    cwd,
    pkg,
    entry = './src/index.ts',
    external = [],
    libraryName,
    minify = false,
    extensions = ['js', 'jsx', 'mjs', 'ts', 'tsx', 'svelte'],
    globals,
  },
  sourcemap = true,
) => {
  const commonPlugins = [
    string({
      include: ['**/report/standalone.js']
      // include: ['**/*.html', '**/report/standalone.js']
    }),
  ];
  
  const rollupESMConfig = {
    input: `${cwd}/${entry}`,
    output: [
      {
        file: pkg.module,
        format: 'esm',
        exports: 'named',
        sourcemap: sourcemap,
      },
    ],
    external,
    plugins: [
      svelte({
        include: './src/**/*.svelte',
        preprocess: autoPreprocess({
          typescript: {
            tsconfigFile: `${cwd}/tsconfig.json`,
          },
        }),
      }),
      typescript({ tsconfig: `${cwd}/tsconfig.json`, exclude: ['./demo/**/*'] }),
      htmlString({
        htmlMinifierOptions: {
          caseSensitive: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          conservativeCollapse: true,
          // minifyCSS: true,
          minifyJS: true,
        },
      }),
      postcss({ minimize: true }),
      // Some libraries (such as React) needs to be in production mode, or you risk have unusable code
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      // Tells the compiler the preference of modules when importing a library.
      resolve({
        mainFields: ['module', 'main'], // Since the target of this is ESM, we will prioritise modules, and then main
        extensions: extensions, // List of extensions of files to be included
      }),
      minify && terser({ module: true, output: { comments: false } }), // If minify is true, the code will be minified
      analyzer({ summaryOnly: true }), // Useful plugin to check what is using most of the space in the bundle
      ...commonPlugins
    ],
  };

  const rollupUMDConfig = {
    input: `${cwd}/${entry}`,
    output: [
      {
        file: pkg.main,
        format: 'umd',
        name: libraryName,
        exports: 'named',
        sourcemap: sourcemap,
        globals,
      },
    ],
    external,
    plugins: [
      svelte({
        include: './src/**/*.svelte',
        preprocess: autoPreprocess({
          typescript: {
            tsconfigFile: `${cwd}/tsconfig.json`,
          },
        }),
      }),
      typescript({ lib: ['es5', 'es6', 'dom'], target: 'es5', exclude: ['./demo/**/*'] }),
      htmlString({
        htmlMinifierOptions: {
          caseSensitive: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          conservativeCollapse: true,
          // minifyCSS: true,
          minifyJS: true,
        },
      }),
      postcss(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      resolve({
        mainFields: ['main'],
        modulesOnly: false,
        extensions: extensions,
      }),
      commonjs(),
      minify && terser({ output: { comments: false } }),
      analyzer({ summaryOnly: true }),   
      ...commonPlugins
    ],
  };

  return [rollupESMConfig, rollupUMDConfig];
};
