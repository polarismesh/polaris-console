import i18n, { LANGUAGE_CACHE_KEY } from '@src/polaris/common/util/i18n'
import { useEffect, useState } from 'react'

export function useI18n() {
  const [lang, setLang] = useState(localStorage.getItem(LANGUAGE_CACHE_KEY) ?? 'zh')

  useEffect(() => {
    i18n.changeLanguage(lang)
  }, [lang])

  return setLang
}
