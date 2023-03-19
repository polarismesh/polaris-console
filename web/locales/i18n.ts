import i18n from 'i18next'
import detector from 'i18next-browser-languagedetector'
import React from 'react'
import { initReactI18next } from 'react-i18next'

import en from './en/translation.json'

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
      lng: 'zh',
      fallbackLng: 'zh',
      interpolation: {
        escapeValue: false,
      },
    })
}

export default i18n

export function Slot(props: { content: React.ReactNode }) {
  return React.createElement(React.Fragment, null, props.content)
}
