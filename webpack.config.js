var webpack = require('webpack');
//var HtmlWebpackPlugin = require('html-webpack-plugin');
var newDate = new Date();
var AnyChatSDKVersion = 'window.AnyChatSDKVersion = "V1.0.0 buildtime: '+ newDate.toLocaleDateString() + ' ' + newDate.toLocaleTimeString() +' commit: 2c2f087b20d6e41f0d0f6bb3f6ea4ef8f0d2f1a0"'; 
module.exports = {
    entry: __dirname + '/app/js/main.js',
    output: {
        path: __dirname + '/dist',
        /*path: __dirname+'/test',*/
        filename: 'anychat4html5.js'
    },
    module: {
        loaders: [{
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.css$/,
                loader: 'style!css'
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /main\.js$/,
                loader:'webpack-append',
                query:AnyChatSDKVersion
            }

        ]
    },
    plugins: [

        new webpack.BannerPlugin('Copyright (c) 2005--2017 BaiRuiTech.Co.Ltd. All rights reserved.'),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // })
        /*new HtmlWebpackPlugin()
        /*new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          }
        })*/
    ],
    resolve: {
        extensions: ['', '.ts', '.js']
    }
}