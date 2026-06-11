export const ORIENTATION_OPTIONS = {
  row: 'row',
  column: 'column',
} as const;
export type OrientationOption =
  (typeof ORIENTATION_OPTIONS)[keyof typeof ORIENTATION_OPTIONS];

export const THEMES = {
  none: 'none',
  default: 'default',
} as const;
export type ThemeOption = (typeof THEMES)[keyof typeof THEMES];

interface BaseFormOptions {
  orientation?: OrientationOption;
  labelOrientation?: OrientationOption;
}

export interface FormOptions extends BaseFormOptions {
  theme?: ThemeOption;
}

export type ElementFormOptions = BaseFormOptions;

export interface FormFieldOptions extends BaseFormOptions {
  width?: number | string;
}
