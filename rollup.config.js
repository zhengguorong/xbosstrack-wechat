import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const config = {
  input: process.env.entry,
  output: {
    file: process.env.dest,
    format: 'umd',
    name: 'xbosstrack',
    strict: false,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['transform-class-properties'],
    }),
  ],
};

if (process.env.uglify) {
  config.plugins.push(uglify());
}

export default config;
