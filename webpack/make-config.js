var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CompressionPlugin = require("compression-webpack-plugin");

module.exports = function (options) {
    var isDevelopment = options.isDevelopment;

    var plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                __DEV__: isDevelopment,
                NODE_ENV: JSON.stringify(isDevelopment ? 'development' :
                    'production'),
                IS_BROWSER: true
            }
        })
    ];

    if (isDevelopment) {
        plugins.push(new webpack.NoErrorsPlugin());
    } else {
        plugins.push(
            new webpack.PrefetchPlugin("react"),
            new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment"),
            new ExtractTextPlugin('bundle.min.css', {
                allChunks: true
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new CompressionPlugin({
                asset: "{file}",
                algorithm: "gzip",
                regExp: /\.js$|\.css/,
                minRatio: 0.8
            })
        );
    }

    var entry = [];
    if (isDevelopment) {
        entry = {
          bundle: [
            'webpack-dev-server/client?http://0.0.0.0:3000',
            'webpack/hot/only-dev-server',
            './src/styles/kbc.less',
            './node_modules/intl/Intl.js',
            './node_modules/intl/locale-data/jsonp/en.js',
            options.entry
          ],
          parts: ['./src/scripts/parts']
        };
    } else {
        entry = {
          bundle: [
            './node_modules/intl/Intl.js',
            './node_modules/intl/locale-data/jsonp/en.js',
            './src/scripts/app'],
          parts: ['./src/scripts/parts']
        };
    }

    return {
        devtool: isDevelopment ? 'eval' : 'source-map',
        entry: entry,
        output: {
            path: isDevelopment ? './dist' : './dist/' + process.env.KBC_REVISION,
            filename: isDevelopment ? '[name].js' : '[name].min.js',
            publicPath: isDevelopment ? '/scripts/' : ''
        },
        plugins: plugins,
        resolve: {
            extensions: ['', '.js', '.jsx', '.coffee'],
            fallback: path.join(__dirname, '../node_modules')
        },
        resolveLoader: { fallback: path.join(__dirname, '../node_modules') },
        coffeelint: {
            configFile: 'coffeelint.json'
        },
        eslint: {
            failOnWarning: false,
            failOnError: true,
            configFile: path.resolve(__dirname, '../.eslintrc')
        },
        module: {
            // via http://andrewhfarmer.com/aws-sdk-with-webpack/
            noParse: [
              /aws\-sdk/,
            ],
            preLoaders: [
                {
                    test: /\.jsx?$/,
                    loader: 'eslint-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.coffee$/,
                    loader: "coffee-lint-loader",
                    exclude: /node_modules/
                }
            ],
            loaders: [
                {
                    exclude: /node_modules/,
                    include:  path.resolve(__dirname, "../src/scripts"),
                    test: /\.jsx?$/,
                    loaders: isDevelopment ? ['react-hot', 'babel'] : ['babel']
                },
                {
                    exclude: /node_modules/,
                    test: /\.coffee$/,
                    loaders: isDevelopment ? ['react-hot', 'coffee'] : ['coffee']
                },
                {
                    test: /\.less$/,
                    loader: isDevelopment ? "style-loader!css-loader!less-loader" : ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
                },
                {
                    loader: 'file-loader',
                    test: /.(png|woff|woff2|eot|ttf|svg|jpg|mp3)/
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader'
                }

            ]
        }
    };

};
