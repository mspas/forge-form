export const UPDATE_ON = {
  change: 'change',
  blur: 'blur',
  submit: 'submit',
} as const;
export type UpdateOn = (typeof UPDATE_ON)[keyof typeof UPDATE_ON];
