module.exports = {
  configureWebpack: {
    node: false, // remove buffer polyfill
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Socket.IO Admin UI";
      return args;
    });
    config.plugin("define").tap((args) => {
      const version = require("./package.json").version;
      args[0]["process.env"]["VERSION"] = JSON.stringify(version);
      return args;
    });
    // exclude moment package (included by chart.js@2)
    config.externals({ moment: "moment" });
  },

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: false,
    },
  },

  transpileDependencies: ["vuetify"],
};
