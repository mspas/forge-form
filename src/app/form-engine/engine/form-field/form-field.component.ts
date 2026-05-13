import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  computed,
  OnInit,
  signal,
  DestroyRef,
  effect,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ControlSchema } from '../../schema/form-control.model';
import { RendererRegistry } from '../renderer-template-registry/renderer-template.registry';
import { FORM_OPTIONS } from '../../schema/form-options-token';
import { ORIENTATION_OPTIONS } from '../../schema/form-options.model';
import { debouncedValueChanges } from '../../utils/debouncedSignal';
import { UPDATE_ON } from '../../schema/update-on.model';
import { ErrorRendererComponent } from '../error-renderer/error-renderer.component';
import { HintRendererComponent } from '../hint-renderer/hint-renderer.component';
import { FormService } from '../form-renderer/form.service';
import { VISIBILITY_BEHAVIORS } from '../../schema/visibility.model';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  imports: [
    ReactiveFormsModule,
    NgComponentOutlet,
    ErrorRendererComponent,
    HintRendererComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent<TModel> implements OnInit {
  readonly control = input.required<AbstractControl>();
  readonly controlSchema = input.required<ControlSchema>();

  readonly VALUE_CHANGE_DELAY = 300;
  private readonly registry = inject(RendererRegistry);
  private readonly formOptions = inject(FORM_OPTIONS, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly formService = inject(FormService<TModel>);

  private wasVisible = true;

  readonly formSignal = this.formService.form;

  componentType = computed(() => this.registry.get(this.controlSchema().type));

  labelOrientation = computed(
    () =>
      this.controlSchema().options?.labelOrientation ??
      this.formOptions?.labelOrientation ??
      ORIENTATION_OPTIONS.column,
  );

  valueChanges = signal(null);

  shouldApplyDelay = computed(
    () =>
      this.controlSchema().updateOn === UPDATE_ON.change &&
      this.controlSchema().type !== 'checkbox',
  );

  visibilityResolved = computed(() => {
    const visibilitySchema = this.controlSchema().visibility;
    const formValue = this.formService.value();
    const visible = visibilitySchema?.fn({
      value: formValue,
      form: this.formSignal()!,
      control: this.control(),
    });

    return visibilitySchema ? visible : true;
  });

  showControl = computed(() => {
    const visibilitySchema = this.controlSchema().visibility;

    return (
      (!this.visibilityResolved() &&
        visibilitySchema?.behavior === VISIBILITY_BEHAVIORS.hide) ||
      !visibilitySchema ||
      visibilitySchema?.behavior !== VISIBILITY_BEHAVIORS.hide
    );
  });

  constructor() {
    effect(() => {
      const visibilitySchema = this.controlSchema().visibility;
      const visible = !!this.visibilityResolved();
      const becameHidden = this.wasVisible && !visible;

      if (!visibilitySchema) {
        return;
      }

      this.formService.applyVisibility(
        this.controlSchema(),
        visible,
        becameHidden && !!visibilitySchema.clearOnHide,
      );

      this.wasVisible = !!visible;
    });
  }

  ngOnInit(): void {
    debouncedValueChanges(
      this.control().valueChanges,
      this.shouldApplyDelay() ? this.VALUE_CHANGE_DELAY : 0,
      this.destroyRef,
    ).subscribe((value) => this.valueChanges.set(value));
  }
}
