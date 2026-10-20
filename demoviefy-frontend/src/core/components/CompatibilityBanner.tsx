// src/pages/Dashboard/components/CompatibilityBanner.tsx

import { CompatibilityService } from "src/core/services/compatibilityService";
import type { BackendVersionResponse } from "src/core/types/compatibility";
import { useTranslation } from "react-i18next";

type CompatibilityStatus = "checking" | "compatible" | "mismatch" | "unavailable"

interface CompatibilityBannerProps {
  status: CompatibilityStatus
  message: string
  backendInfo: BackendVersionResponse | null
  onRetry: () => void
}

export function CompatibilityBanner({ status, message, backendInfo, onRetry }: CompatibilityBannerProps) {
  const { t } = useTranslation();
  const { frontendAppVersion, frontendApiContractVersion } = CompatibilityService.getVersionInfo()

  return (
    <div className="workspace">
      <section className={`surface compatibility-banner is-${status}`}>
        <div>
          <span className="eyebrow">{t("compatibilityLabel")}</span>
          <h2>
            {status === "checking"
              ? t("validatingSystemVersions")
              : t("compatibilityUpdateRequired")}
          </h2>
          <p>{message}</p>
          <p className="compatibility-meta">
            {t("frontendLabel")} {frontendAppVersion} · {t("contractLabel")} {frontendApiContractVersion}
            {backendInfo
              ? ` · ${t("backendLabel")} ${backendInfo.backend_app_version} · ${t("contractLabel")} ${backendInfo.api_contract_version}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={onRetry}
          disabled={status === "checking"}
        >
          {status === "checking" ? t("checkingCompatibility") : t("retryCompatibility")}
        </button>
      </section>
    </div>
  )
}
