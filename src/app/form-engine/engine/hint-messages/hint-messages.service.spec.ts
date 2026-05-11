import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HintMessageService } from './hint-messages.service';
import { HintComponentDef } from './hint-messages.model';

@Component({ selector: 'app-mock-hint', template: '' })
class MockHintComponent {}

describe('HintMessageService', () => {
  let service: HintMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HintMessageService],
    });
    service = TestBed.inject(HintMessageService);
  });

  describe('getHint', () => {
    it('should return undefined when hint is undefined', () => {
      const result = service.getHint(undefined);

      expect(result).toBeUndefined();
    });

    it('should resolve a text hint from a string', () => {
      const result = service.getHint('Enter your full name');

      expect(result).toEqual({
        type: 'text',
        message: 'Enter your full name',
      });
    });

    it('should resolve a component hint without inputs', () => {
      const hint: HintComponentDef = {
        component: MockHintComponent,
      };

      const result = service.getHint(hint);

      expect(result).toEqual({
        type: 'component',
        component: MockHintComponent,
        inputs: undefined,
      });
    });

    it('should resolve a component hint with inputs', () => {
      const hint: HintComponentDef = {
        component: MockHintComponent,
        inputs: { maxLength: 100, pattern: '[a-z]+' },
      };

      const result = service.getHint(hint);

      expect(result).toEqual({
        type: 'component',
        component: MockHintComponent,
        inputs: { maxLength: 100, pattern: '[a-z]+' },
      });
    });

    it('should return undefined for an empty string hint', () => {
      const result = service.getHint('');

      expect(result).toBeUndefined();
    });
  });
});
