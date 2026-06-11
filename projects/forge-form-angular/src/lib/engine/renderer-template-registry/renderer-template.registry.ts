import { Inject, Injectable, InjectionToken, Type } from '@angular/core';
import { FieldRenderer } from '../../schema/form-control.model';

export interface RendererDef {
  type: string;
  component: Type<FieldRenderer>;
}

export const RENDERERS = new InjectionToken<RendererDef[]>('RENDERERS');

@Injectable()
export class RendererRegistry {
  private map = new Map<string, Type<FieldRenderer>>();

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(@Inject(RENDERERS) renderers: RendererDef[][] = []) {
    renderers.flat().forEach((r) => {
      this.map.set(r.type, r.component);
    });
  }

  get(type: string): Type<FieldRenderer> {
    const cmp = this.map.get(type);
    if (!cmp) {
      throw new Error(`No renderer for type: ${type}`);
    }
    return cmp;
  }
}
