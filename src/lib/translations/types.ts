
import { LanguageKey } from "../language-key";

export interface Translation {
  [key: string]: string;
}

export interface TranslationEntry {
  ar: string;
  en: string;
}

export type TranslationSection = {
  [key: string]: TranslationEntry;
};

export interface Translations {
  [key: string]: TranslationEntry;
}
