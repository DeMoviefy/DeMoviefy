import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { i18nVideo } from "./pages/Video/i18nVideo";
import { i18nCadastro } from "./pages/Cadastro/i18nCadastro";
import { i18nLogin } from "./pages/Login/i18nLogin";
import { i18nHome } from "./pages/Home/i18nHome";
import { i18nDashboard } from "./pages/Dashboard/i18nDashboard";
import { i18nCommon } from "./i18nCommon";

const resources = {
  "pt-BR": { translation: {
    ...i18nCommon.ptBR,
    ...i18nVideo.ptBR,
    ...i18nCadastro.ptBR,
    ...i18nLogin.ptBR,
    ...i18nHome.ptBR,
    ...i18nDashboard.ptBR,
  } },
  en: { translation: {
    ...i18nCommon.en,
    ...i18nVideo.en,
    ...i18nCadastro.en,
    ...i18nLogin.en,
    ...i18nHome.en,
    ...i18nDashboard.en,
  } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "pt-BR",
  fallbackLng: "pt-BR",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;
