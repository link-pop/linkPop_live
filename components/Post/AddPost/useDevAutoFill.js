"use client";

import { useEffect } from "react";

export default function useDevAutoFill({ isDev, updatingPost }) {
  useEffect(() => {
    if (isDev && !updatingPost) {
      // Generate a random number for this form fill session
      const randomNum = Math.floor(Math.random() * 10000);

      // Auto-fill all inputs with placeholder data in dev mode
      const inputs = document.querySelectorAll("input:not(.sr-only), textarea");

      // Handle regular inputs
      inputs.forEach((input) => {
        const type = input.type;
        if (type === "text" || type === "textarea") {
          input.value = `Sample ${input.name} #${randomNum}`;
        } else if (type === "number") {
          input.value = randomNum.toString();
        } else if (type === "email") {
          input.value = `test${randomNum}@example.com`;
        } else if (type === "date") {
          input.value = new Date().toISOString().split("T")[0];
        } else if (type === "datetime-local") {
          input.value = new Date().toISOString().slice(0, 16);
        }

        // Trigger change event
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });

      // Handle LocationSelector components
      const locationComponents = document.querySelectorAll('[role="combobox"]');
      locationComponents.forEach((locationInput) => {
        // Trigger click to open dropdown
        locationInput.click();

        // Small delay to allow dropdown to populate
        setTimeout(() => {
          // Find and click the first command item (country/state option)
          const options = document.querySelectorAll('[role="option"]');
          if (options.length > 0) {
            options[0].click();
          }
        }, 100);
      });

      // Handle RadioGroup components
      const radioGroups = document.querySelectorAll('[role="radiogroup"]');
      radioGroups.forEach((radioGroup) => {
        // Find all radio buttons in this group
        const radioButtons = radioGroup.querySelectorAll('[role="radio"]');
        if (radioButtons.length > 0) {
          // Select the first radio button
          const firstRadio = radioButtons[0];
          firstRadio.click();
          firstRadio.setAttribute("aria-checked", "true");

          // Find and update the hidden input for this radio group
          const hiddenInput = radioGroup.querySelector('input[type="hidden"]');
          if (hiddenInput) {
            hiddenInput.value = firstRadio.id;
            hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      });

      // Handle PhoneInput components
      const phoneInputs = document.querySelectorAll(".PhoneInputInput");
      phoneInputs.forEach((input) => {
        if (input) {
          // Create a phone number with random digits
          const randomPhone = `+38050${randomNum.toString().padStart(7, '0')}`;
          
          // Create and dispatch an input event with the phone number
          const inputEvent = new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: randomPhone,
          });

          // Set the value and dispatch events
          input.value = randomPhone;
          input.dispatchEvent(inputEvent);

          // Create a keyboard event to simulate typing
          const keyEvent = new KeyboardEvent("keydown", {
            key: "5",
            code: "Digit5",
            bubbles: true,
            cancelable: true,
          });
          input.dispatchEvent(keyEvent);

          // Dispatch change event
          const changeEvent = new Event("change", { bubbles: true });
          input.dispatchEvent(changeEvent);

          // Small delay to allow validation to complete
          setTimeout(() => {
            // Find the parent PhoneInput element
            const phoneInputWrapper = input.closest(".PhoneInput");
            if (phoneInputWrapper) {
              // Find and update the validation input
              const validationInput =
                phoneInputWrapper.parentElement.querySelector(
                  'input[tabindex="-1"]'
                );
              if (validationInput) {
                validationInput.value = "valid";
                validationInput.dispatchEvent(
                  new Event("change", { bubbles: true })
                );
              }
            }
          }, 100);
        }
      });

      // Handle Radix UI Checkbox and Switch components
      const radixComponents = document.querySelectorAll('[data-state]');
      radixComponents.forEach((component) => {
        if (component.getAttribute('data-state') === 'unchecked') {
          // Click to check
          component.click();
          component.setAttribute('data-state', 'checked');
          component.setAttribute('aria-checked', 'true');

          // Find and update the hidden input
          const form = component.closest('form');
          if (form) {
            const name = component.id;
            if (name) {
              const hiddenInput = form.querySelector(`input[name="${name}"].sr-only`);
              if (hiddenInput) {
                if (hiddenInput.type === 'checkbox') {
                  hiddenInput.checked = true;
                } else {
                  hiddenInput.value = 'true';
                }
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }
        }
      });
    }
  }, [isDev, updatingPost]);
}
