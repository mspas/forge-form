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
import { ErrorMessageService } from '../error-messages/error-messages.service';
import { ErrorMessageRegistry } from '../error-messages/error-messages.registry';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'forge-form-error-renderer',
  templateUrl: './error-renderer.component.html',
  imports: [ReactiveFormsModule, NgComponentOutlet],
  providers: [ErrorMessageService, ErrorMessageRegistry],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorRendererComponent implements OnInit {
  control = input.required<AbstractControl>();
  controlSchema = input.required<ControlSchema>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly errorMessageService = inject(ErrorMessageService);

  controlErrors = signal<ValidationErrors | null>(null);
  resolvedErrors = computed(() => {
    const errors = this.controlErrors();

    return !!errors && !!this.controlSchema().validators
      ? this.errorMessageService.getErrors(
          this.control(),
          this.controlSchema().validators!,
        )
      : null;
  });

  ngOnInit(): void {
    this.control()
      .statusChanges.pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.controlErrors.set(this.control().errors));
  }
}
