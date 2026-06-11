import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  OnInit,
  DestroyRef,
  signal,
  computed,
} from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { ControlSchema } from '../../schema/form-control.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';
import { NgComponentOutlet } from '@angular/common';
import { HintMessageService } from '../hint-messages/hint-messages.service';

@Component({
  selector: 'forge-form-hint-renderer',
  templateUrl: './hint-renderer.component.html',
  imports: [ReactiveFormsModule, NgComponentOutlet],
  providers: [HintMessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HintRendererComponent implements OnInit {
  control = input.required<AbstractControl>();
  controlSchema = input.required<ControlSchema>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly hintMessageService = inject(HintMessageService);

  controlErrors = signal<ValidationErrors | null>(null);
  controlValue = signal<unknown>(null);
  resolvedHint = computed(() => {
    const errors = this.controlErrors();

    return !errors && !!this.controlSchema().hint
      ? this.hintMessageService.getHint(this.controlSchema().hint)
      : null;
  });

  mergedInputs = computed(() => {
    const hint = this.resolvedHint();

    if (!hint || hint.type !== 'component') {
      return {};
    }

    return {
      control: this.control(),
      controlValue: this.controlValue(),
      controlErrors: this.controlErrors(),
      controlSchema: this.controlSchema(),
      ...hint.inputs,
    };
  });

  ngOnInit(): void {
    this.controlValue.set(this.control().value);

    this.control()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.controlValue.set(value);
      });

    this.control()
      .statusChanges.pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.controlErrors.set(this.control().errors));
  }
}
