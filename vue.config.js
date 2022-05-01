module.exports = {
  transpileDependencies: ["vuetify"],
  lintOnSave: false,
  //TODO test it
  publicPath: process.env.NODE_ENV === "production"
      ? "/~master/mchs_map" :
      process.env.NODE_ENV === "github" ? "/mchs_map" : "/" ,
  configureWebpack: {
    devtool: "source-map",
  },
};
