import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

export default {
    input: './lib/index.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
    },
    plugins: [
        babel(babelrc({
            path: './.babelrc-build'
        }))
    ]
};
