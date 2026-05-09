import { Injectable, Type } from '@angular/core';
import { HintMessage } from './hint-messages.model';

export type ResolvedHint =
  | { type: 'text'; message: string }
  | {
      type: 'component';
      component: Type<unknown>;
      inputs?: Record<string, unknown>;
    };

@Injectable()
export class HintMessageService {
  getHint(hint: HintMessage | undefined): ResolvedHint | undefined {
    if (!hint) return undefined;

    return hint instanceof Object && 'component' in hint
      ? {
          type: 'component',
          component: hint.component,
          inputs: hint.inputs,
        }
      : { type: 'text', message: hint };
  }
}
