import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';

export const debouncedValueChanges = <T>(
  valueChanges: Observable<T>,
  time = 0,
  destroyRef: DestroyRef,
) =>
  valueChanges.pipe(
    distinctUntilChanged(),
    takeUntilDestroyed(destroyRef),
    debounceTime(time),
  );
