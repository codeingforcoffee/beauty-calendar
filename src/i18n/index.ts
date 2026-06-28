import { zhCN } from "./locales/zh-cn";
import { en } from "./locales/en";
import { zhTW } from "./locales/zh-tw";
import { ja } from "./locales/ja";
import type { LocaleKey, LocaleMessages } from "./types";

export type { LocaleMessages, LocaleKey } from "./types";

/** Built-in locales, keyed by BCP-47-ish code. */
export const builtinLocales: Record<string, LocaleMessages> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  en,
  ja,
};

export const DEFAULT_LOCALE: LocaleKey = "zh-CN";

/** Replace `{key}` placeholders in a template string. */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    params[k] != null ? String(params[k]) : `{${k}}`,
  );
}

/**
 * Resolve the active messages for a locale key, allowing a partial override map
 * to be merged on top of a built-in (or English) base.
 */
export function resolveMessages(
  locale: LocaleKey,
  overrides?: Partial<Record<string, Partial<LocaleMessages>>>,
): LocaleMessages {
  const base = builtinLocales[locale] ?? builtinLocales.en;
  const override = overrides?.[locale];
  if (!override) return base;
  return {
    ...base,
    ...override,
    views: { ...base.views, ...override.views },
    titleFormat: { ...base.titleFormat, ...override.titleFormat },
  };
}

export { zhCN, zhTW, en, ja };
