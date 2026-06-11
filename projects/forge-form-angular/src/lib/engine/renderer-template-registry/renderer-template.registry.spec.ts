import { Component, Type } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldRenderer } from '../../schema/form-control.model';
import {
  RendererRegistry,
  RendererDef,
  RENDERERS,
} from './renderer-template.registry';
import { TestBed } from '@angular/core/testing';

@Component({ selector: 'forge-form-mock-text', template: '' })
class MockTextRenderer implements FieldRenderer {
  control!: FormControl;
  controlSchema: unknown;
}

@Component({ selector: 'forge-form-mock-number', template: '' })
class MockNumberRenderer implements FieldRenderer {
  control!: FormControl;
  controlSchema: unknown;
}

describe('RendererRegistry', () => {
  const createRegistry = (...groups: RendererDef[][]): RendererRegistry => {
    TestBed.configureTestingModule({
      providers: [
        RendererRegistry,
        { provide: RENDERERS, useValue: [], multi: true },
        ...groups.map((group) => ({
          provide: RENDERERS,
          useValue: group,
          multi: true,
        })),
      ],
    });
    return TestBed.inject(RendererRegistry);
  };

  describe('registration', () => {
    it('should register renderers and retrieve them by type', () => {
      const registry = createRegistry([
        { type: 'text', component: MockTextRenderer },
      ]);

      expect(registry.get('text')).toBe(MockTextRenderer);
    });

    it('should flatten multiple renderer arrays into a single map', () => {
      const registry = createRegistry(
        [{ type: 'text', component: MockTextRenderer }],
        [{ type: 'number', component: MockNumberRenderer }],
      );

      expect(registry.get('text')).toBe(MockTextRenderer);
      expect(registry.get('number')).toBe(MockNumberRenderer);
    });
  });

  describe('get', () => {
    it('should throw a descriptive error for an unregistered type', () => {
      const registry = createRegistry();

      expect(() => registry.get('unknown')).toThrowError(
        'No renderer for type: unknown',
      );
    });

    it('should return the exact component Type reference', () => {
      const registry = createRegistry([
        { type: 'text', component: MockTextRenderer },
      ]);

      const result: Type<FieldRenderer> = registry.get('text');
      expect(result).toBe(MockTextRenderer);
    });
  });
});
