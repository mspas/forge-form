import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, Subscription } from 'rxjs';
import {
  BaseControlSchema,
  ControlSchema,
} from '../../schema/form-control.model';
import { FormSchema } from '../../schema/form-schema.model';
import { FormBuilderService } from '../../services/form-builder.service';
import { FormGroup } from '@angular/forms';

@Injectable()
export class FormService<TModel> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilderService);

  form = signal<FormGroup | null>(null);
  value = signal<TModel | null>(null);
  valid = signal<boolean>(false);

  private disabledByVisibility = new Set<string>();
  private valueChangesSubscription?: Subscription;

  init(formSchema: FormSchema): void {
    if (!formSchema) {
      return;
    }

    this.valueChangesSubscription?.unsubscribe();

    const form = this.formBuilder.buildForm(formSchema);
    this.form.set(form);
    this.value.set(form.value);
    this.valid.set(form.valid);

    this.valueChangesSubscription = this.form()!
      .valueChanges.pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.value.set(this.form()!.value);
        this.valid.set(this.form()!.valid);
      });
  }

  applyVisibility(
    controlSchema: ControlSchema,
    visible: boolean,
    clearOnHide: boolean,
  ): void {
    const visibilitySchema = controlSchema.visibility;

    if (!visibilitySchema) {
      return;
    }

    const changed = visible
      ? this.enableControlByVisibility(controlSchema.controlName)
      : this.disableControlByVisibility(controlSchema.controlName, clearOnHide);

    if (changed) {
      this.value.set(this.form()!.value);
      this.valid.set(this.form()!.valid);
    }
  }

  private getControl(controlName: BaseControlSchema['controlName']) {
    if (!this.form()) {
      console.error("Couldn't get control. Form is not initialized!");
      return null;
    }

    const control = this.form()!.get(controlName);

    if (!control) {
      console.error(
        `Couldn't get control. Control with name "${controlName}" not found!`,
      );
      return null;
    }
    return control;
  }

  private disableControlByVisibility(
    controlName: BaseControlSchema['controlName'],
    clearOnHide?: boolean,
  ): boolean {
    const control = this.getControl(controlName);
    if (!control) return false;

    let changed = false;

    if (clearOnHide && !this.disabledByVisibility.has(controlName)) {
      control.reset(null, { emitEvent: false });
      changed = true;
    }

    if (control.enabled) {
      control.disable({ emitEvent: false });
      this.disabledByVisibility.add(controlName);
      changed = true;
    }

    return changed;
  }

  private enableControlByVisibility(
    controlName: BaseControlSchema['controlName'],
  ): boolean {
    const control = this.getControl(controlName);
    if (!control) return false;

    if (this.disabledByVisibility.has(controlName)) {
      control.enable({ emitEvent: false });
      this.disabledByVisibility.delete(controlName);
      return true;
    }

    return false;
  }
}
