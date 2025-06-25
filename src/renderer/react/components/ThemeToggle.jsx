import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle({ onToggle }) {
  const { t } = useTranslation();
  return (
    <button
      id="theme-toggle"
      className="ico-bttn"
      title={t('title-theme-toggle')}
      onClick={onToggle}
    >
    </button>
  );
}