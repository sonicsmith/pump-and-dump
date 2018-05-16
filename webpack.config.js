const path = require("path")
const webpack = require("webpack")

module.exports = {
  devtool: "eval",
  entry: ["./src/index"],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'build.js', // The final file will be created in dist/build.js
    publicPath: "/dist/"
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ["babel-loader"],
        include: path.join(__dirname, "src"),
      },
      {
        test: /\.json$/, // To load the json files
        loader: "json-loader",
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
  },
}
