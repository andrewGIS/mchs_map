module.exports = {
  transpileDependencies: ["vuetify"],
  lintOnSave: false,
  publicPath: process.env.PUBLIC_PATH,
  configureWebpack: {
    devtool: "source-map"
  }
};
