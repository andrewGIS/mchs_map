module.exports = {
  transpileDependencies: ["vuetify"],
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === "production" ? "/~master/mchs_map/" : "/",
  configureWebpack: {
    devtool: "source-map",
  },
};
