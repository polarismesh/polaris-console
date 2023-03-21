import i18n from 'i18next'
import detector from 'i18next-browser-languagedetector'
import React from 'react'
import { initReactI18next } from 'react-i18next'

import en from '../../../../locales/en/translation.json'

export function initI18n() {
  i18n
    .use(detector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: en,
        },
      },
      lng: localStorage.getItem(LANGUAGE_CACHE_KEY) ?? 'zh',
      fallbackLng: 'zh',
      interpolation: {
        escapeValue: false,
      },
    })
}

export const LANGUAGE_CACHE_KEY = 'polaris_language'

i18n.on('languageChanged', lang => {
  localStorage.setItem(LANGUAGE_CACHE_KEY, lang)
  // console.log('languageChanged', lang)
})

i18n.on('initialized', () => {
  // console.log('initialized',)
  // i18n.changeLanguage(localStorage.getItem(LANGUAGE_CACHE_KEY))
})

export default i18n

export function Slot(props: { content: React.ReactNode }) {
  return React.createElement(React.Fragment, null, props.content)
}
