import { useTranslation } from "react-i18next";

export default function FeaturesSection() {
  const { t } = useTranslation();
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

          {/* TODO: Quando trocar o placeholder da imagem, pegar uma que tenha um tamanho horizontal bom e um vertical pequeno, para ficar com as proporções legais. */}
          <div className="mt-10 max-w-xl overflow-hidden rounded-lg">
            <img
              src="src/assets/DeMoviefy-Demo.png"
              alt="Interface do DeMoviefy"
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
              <span className="text-blue-600 dark:text-blue-400">Timestamps</span>
            </h3>

            <p className="mt-3 max-w-xl text-base leading-7 text-neutral-400">
              {t("timestampDescription")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
