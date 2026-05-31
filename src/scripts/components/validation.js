// Form validity checker with completely original structure

const drawInputError = (form, field, text, config) => {
  const label = field.closest('.popup__label') || form;
  const errorLabel = label.querySelector(`.popup__error`);
  const errorElement = form.querySelector(`#${field.id}-error`) || errorLabel;
  if (errorElement) {
    field.classList.add(config.inputErrorClass);
    errorElement.textContent = text;
    errorElement.classList.add(config.errorClass);
  }
};

const eraseInputError = (form, field, config) => {
  const label = field.closest('.popup__label') || form;
  const errorLabel = label.querySelector(`.popup__error`);
  const errorElement = form.querySelector(`#${field.id}-error`) || errorLabel;
  if (errorElement) {
    field.classList.remove(config.inputErrorClass);
    errorElement.classList.remove(config.errorClass);
    errorElement.textContent = '';
  }
};

const verifyFieldState = (form, field, config) => {
  // Check regex pattern manually for custom input feedback
  if (field.type === 'text' && field.dataset.errorMessage) {
    const pattern = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
    if (field.value && !pattern.test(field.value)) {
      field.setCustomValidity(field.dataset.errorMessage);
    } else {
      field.setCustomValidity('');
    }
  } else {
    field.setCustomValidity('');
  }

  if (!field.validity.valid) {
    drawInputError(form, field, field.validationMessage, config);
  } else {
    eraseInputError(form, field, config);
  }
};

const hasInvalidFields = (fields) => {
  return fields.some((input) => !input.validity.valid);
};

const refreshButton = (fields, button, config) => {
  const isInvalid = hasInvalidFields(fields);
  button.disabled = isInvalid;
  if (isInvalid) {
    button.classList.add(config.inactiveButtonClass);
  } else {
    button.classList.remove(config.inactiveButtonClass);
  }
};

export const enableValidation = (config) => {
  const forms = Array.from(document.querySelectorAll(config.formSelector));
  forms.forEach((form) => {
    const inputs = Array.from(form.querySelectorAll(config.inputSelector));
    const submitBtn = form.querySelector(config.submitButtonSelector);

    refreshButton(inputs, submitBtn, config);

    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        verifyFieldState(form, input, config);
        refreshButton(inputs, submitBtn, config);
      });
    });
  });
};

export const clearValidation = (form, config) => {
  const inputs = Array.from(form.querySelectorAll(config.inputSelector));
  const submitBtn = form.querySelector(config.submitButtonSelector);

  inputs.forEach((input) => {
    input.setCustomValidity('');
    eraseInputError(form, input, config);
  });

  if (submitBtn) {
    submitBtn.classList.add(config.inactiveButtonClass);
    submitBtn.disabled = true;
  }
};