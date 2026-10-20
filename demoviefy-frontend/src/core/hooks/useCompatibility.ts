// src/pages/Dashboard/hooks/useCompatibility.ts

// Remover a mensagem de verificando compatibilidade de gerar texto na tela, somente quando houver mismatch

import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next";
import { CompatibilityService } from "src/core/services/compatibilityService";
import type { BackendVersionResponse } from "src/core/types/compatibility"

type CompatibilityState =
  | { status: "checking"; message: string; backendInfo: null }
  | { status: "compatible" | "mismatch" | "unavailable"; message: string; backendInfo: BackendVersionResponse | null }

export function useCompatibility() {
  const { t } = useTranslation();
  const [compatibility, setCompatibility] = useState<CompatibilityState>({
    status: "checking",
    message: t("checkingCompatibilityMessage"),
    backendInfo: null,
  })

  const checkBackendCompatibility = useCallback(async () => {
    setCompatibility({ status: "checking", message: t("checkingCompatibilityMessage"), backendInfo: null })

    const { isCompatible, backendInfo, reason } = await CompatibilityService.checkCompatibility()

    setCompatibility({
      status: reason,
      backendInfo,
      message: reason === "compatible"
        ? t("contractValidated", { version: backendInfo?.api_contract_version })
        : reason === "mismatch"
          ? t("contractMismatch")
          : t("backendVersionUnavailable"),
    })

    return isCompatible
  }, [t])

  return { compatibility, checkBackendCompatibility }
}
