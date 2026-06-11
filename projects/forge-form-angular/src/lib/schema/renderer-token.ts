import { InjectionToken, Type } from '@angular/core';
import { FieldRenderer } from './form-control.model';

export interface RendererDef {
  type: string;
  component: Type<FieldRenderer>;
}

export const RENDERERS = new InjectionToken<RendererDef[]>('RENDERERS');
