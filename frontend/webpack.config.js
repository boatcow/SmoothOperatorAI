const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

const babelConfig = require('./babel.config.js');
const { version } = require('./package.json');

const appDirectory = path.resolve(__dirname);
console.log('App Dir: ', appDirectory);

const compileNodeModules = [
	'@react-native/assets-registry',
	'@react-navigation/drawer',
	'@react-navigation/native',
	'react-native-animatable',
	'react-native-circular-progress',
	'react-native-gesture-handler',
	'react-native-native-ui',
	'react-native-progress',
	'react-native-reanimated',
	'react-native-screens',
	'react-native-svg',
	'react-native-vector-icons',
	'react-native-markdown-display'
].map((moduleName) => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
	test: /\.(js|jsx|ts|tsx|d\.ts)$/,
	// Add every directory that needs to be compiled by Babel during the build.
	include: [
		path.resolve(appDirectory, 'src'),
		...compileNodeModules,
	],
	use: {
		loader: 'babel-loader',
		options: {
			cacheDirectory: true,
			presets: babelConfig.presets,
			plugins: ['react-native-web', ...babelConfig.plugins]
		},
	},
};

const cssLoaderConfig = {
	test: /\.css$/i,
	use: ["style-loader", "css-loader"],
}

const svgLoaderConfiguration = {
	test: /\.svg$/,
	use: [{ loader: '@svgr/webpack' }],
};

const imageLoaderConfiguration = {
	test: /\.(gif|jpe?g|png)$/,
	use: {
		loader: 'url-loader',
		options: { name: '[name].[ext]' },
	},
};

const ttfLoaderConfiguration = {
    test: /\.ttf$/,
    loader: "url-loader", // or directly file-loader
    include: path.resolve(appDirectory, 'node_modules/react-native-vector-icons'),
};

const fileLoaderConfiguration = {
	test: /\.mp3$/,
	loader: 'file-loader'
};


const webviewConfig = {
	test: /(postMock.html)$/,
	use: {
		loader: 'file-loader',
		options: { name: '[name].[ext]' },
	},
}

module.exports = (env, argv) => {
	return ({
		entry: [
			'./src/index.web.tsx'
		],
		resolve: {
			extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js', '.jsx'],
			alias: {
				'react-native$': 'react-native-web',
				'process': 'process/browser'
			},
			fallback: {
				'crypto': false,
			},
		},
		module: {
			rules: [
				babelLoaderConfiguration,
				imageLoaderConfiguration,
				svgLoaderConfiguration,
				ttfLoaderConfiguration,
				cssLoaderConfig,
				fileLoaderConfiguration,
				webviewConfig
			],
		},
		plugins: [
			new HtmlWebpackPlugin({ template: path.resolve(appDirectory, 'public/index.html') }),
			new InterpolateHtmlPlugin({ PUBLIC_URL: '' }),
			new webpack.EnvironmentPlugin({ JEST_WORKER_ID: null }),
			new webpack.DefinePlugin({
				// See: https://github.com/necolas/react-native-web/issues/349
				__DEV__: argv.mode != "production" || false,
				process: { env: {} }
			}),
			new webpack.ProvidePlugin({ process: 'process/browser' }),
			new CopyPlugin({
				patterns: [
                    { from: "public/assets", to: "assets/" },
                    { from: "public/manifest.json" },
				],
			}),
			(argv.mode == "production" && new GenerateSW({
				cacheId: `pwa-v${version}`,
				clientsClaim: true,
				skipWaiting: true,
				runtimeCaching: [
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/, // Cache images
						handler: 'CacheFirst',
						options: {
							cacheName: 'images-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
							},
						},
					},
					{
						urlPattern: /\.(?:js|css)$/, // Cache JS and CSS files
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'static-resources',
						},
					},
				],
			})),
		],
		output: {
			filename: 'bundle.js',
			path: appDirectory + '/dist',
			publicPath: '/',
			clean: true,
		},
        devServer: {
            open: false,
            ...(argv.mode == 'production' && { static: './dist' }),
            historyApiFallback: true,
        },
	})
};