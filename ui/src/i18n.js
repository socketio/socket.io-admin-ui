import { createI18n } from "vue-i18n";

function loadLocaleMessages() {
  const locales = import.meta.glob("./locales/*.json", { eager: true });
  const messages = {};
  Object.entries(locales).forEach(([key, value]) => {
    const locale = key.split("/").pop().replace(".json", "");
    messages[locale] = value.default;
  });
  return messages;
}

export default createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: loadLocaleMessages(),
});
