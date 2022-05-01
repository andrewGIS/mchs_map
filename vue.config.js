module.exports = {
  transpileDependencies: ["vuetify"],
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === "production" ? "/mchs_map" : "/",
  configureWebpack: {
    devtool: "source-map",
  },
};
