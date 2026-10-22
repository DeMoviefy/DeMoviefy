import { Link } from "react-router-dom"

import { useTranslation } from "react-i18next";
import { useThemeStore } from "src/core/stores/useThemeStore";

import imagem1EngDark from "src/pages/Home/assets/Imagem1/Imagem1-ENG-Dark.png";
import imagem1EngLight from "src/pages/Home/assets/Imagem1/Imagem1-ENG-Light.png";
import imagem1PorDark from "src/pages/Home/assets/Imagem1/Imagem1-POR-Dark.png";
import imagem1PorLight from "src/pages/Home/assets/Imagem1/Imagem1-POR-Light.png";

export default function Introduction() {
  const { t, i18n } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const isPortuguese = i18n.resolvedLanguage?.toLowerCase().startsWith("pt") ?? false;
  const screenshot = isPortuguese
    ? theme === "dark" ? imagem1PorDark : imagem1PorLight
    : theme === "dark" ? imagem1EngDark : imagem1EngLight;

    return (
        <section className="grid w-full items-center gap-16 pb-20 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24 lg:pb-20 lg:pt-8">
            <div className="max-w-2xl">
                <h1 className="text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                    {isPortuguese ? (
                        <>
                            Analise seus<br />vídeos.
                            <br />
                            Extraia mais<br />deles.
                        </>
                    ) : (
                        <>
                            {t("homeTitle")}
                            <br />
                            {t("homeSubtitle")}
                        </>
                    )}
                </h1>

                <p className="mt-6 text-lg leading-8 text-neutral-400 lg:text-xl">
                    {t("homeDescription")}
                </p>

                <Link
                    to="/dashboard"
                    className="mt-8 inline-block rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 dark:bg-blue-800 dark:hover:bg-blue-700"
                >
                    {t("startNow")}
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 lg:-ml-24 lg:w-[calc(100%+6rem)]">
                <img
                    src={screenshot}
                    alt={t("homeTitle")}
                    className="w-full"
                />
            </div>

        </section>
    )
}
