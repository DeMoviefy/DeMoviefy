import { useTranslation } from "react-i18next";
import { useThemeStore } from "src/core/stores/useThemeStore";

import imagem5EngDark from "src/pages/Home/assets/Imagem5/Imagem5-ENG-Dark.png";
import imagem5EngLight from "src/pages/Home/assets/Imagem5/Imagem5-ENG-Light.png";
import imagem5PorDark from "src/pages/Home/assets/Imagem5/Imagem5-POR-Dark.png";
import imagem5PorLight from "src/pages/Home/assets/Imagem5/Imagem5-POR-Light.png";

export default function FeaturesSection() {
  const { t, i18n } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const isPortuguese = i18n.resolvedLanguage?.toLowerCase().startsWith("pt") ?? false;
  const screenshot = isPortuguese
    ? theme === "dark" ? imagem5PorDark : imagem5PorLight
    : theme === "dark" ? imagem5EngDark : imagem5EngLight;
  return (
    <section className="w-full pb-24 pt-8 lg:pb-32 lg:pt-16">
      <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            {t("featureTitle")}
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-400 lg:text-xl">
            {t("featureDescription")}
          </p>

          <div className="mt-10 max-w-xl overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
            <img
              src={screenshot}
              alt={t("videoInterfaceAlt")}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid gap-10 lg:pt-2">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              {t("subtitles")}
            </h3>

            <p className="mt-3 max-w-xl text-base leading-7 text-neutral-400">
              {t("autoCaptionDescription")}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              <span className="text-blue-600 dark:text-blue-400">{t("sensitiveContent")}</span>
            </h3>

            <p className="mt-3 max-w-xl text-base leading-7 text-neutral-400">
              {t("sensitiveDescription")}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              {t("rating")}
            </h3>

            <p className="mt-3 max-w-xl text-base leading-7 text-neutral-400">
              {t("ratingDescription")}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              <span className="text-blue-600 dark:text-blue-400">{t("objectDetection")}</span>
            </h3>

            <p className="mt-3 max-w-xl text-base leading-7 text-neutral-400">
              {t("objectDetectionDescription")}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              {t("parallelAIProcessing")}
            </h3>

            <p className="mt-3 max-w-xl text-base leading-7 text-neutral-400">
              {t("parallelAIProcessingDescription")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
