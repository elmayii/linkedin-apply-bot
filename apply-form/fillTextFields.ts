import { Page } from 'puppeteer';

import selectors from '../selectors';
import changeTextInput from './changeTextInput';
import { ApplicationFormData } from '../apply';
import { interpreterAI } from './ai/interpreterAI';

interface TextFields {
  [labelRegex: string]: string | number;
}

/**
 * Genera un valor por defecto aleatorio entre 0 y 100
 * @returns Número aleatorio como string
 */
function getRandomDefaultValue(): string {
  return Math.floor(Math.random() * 101).toString(); // 0-100 inclusive
}

async function fillTextFields(page: Page, formData: ApplicationFormData): Promise<void> {
  const inputs = await page.$$(selectors.textInput);

  const textFields = {
    salary: formData.textFields.salary,
    ...formData.yearsOfExperience,
    ...formData.languageProficiency,
  }

  for (const input of inputs) {

    // Verificar si el input coincide con selectores de phone o homeCity
    const inputSelector = await input.evaluate((el) => {
      // Verificar si el elemento coincide con el selector de phone
      if (el.matches(".jobs-easy-apply-modal input[id*='easyApplyFormElement'][id*='phoneNumber']")) {
        return 'phone';
      }
      // Verificar si el elemento coincide con el selector de homeCity
      if (el.matches(".jobs-easy-apply-modal input[id*='easyApplyFormElement'][id*='city-HOME-CITY']")) {
        return 'homeCity';
      }
      return null;
    });

    // Si coincide con phone o homeCity, terminar la ejecución
    if (inputSelector === 'phone' || inputSelector === 'homeCity') {
      console.log(`⏹️ Terminando fillTextFields - encontrado campo ${inputSelector}`);
      return;
    }

    const id = await input.evaluate((el) => el.id);
    const label = await page.$eval(`label[for="${id}"]`, (el) => el.innerText).catch(() => 'Unknown');
    
    let fieldFilled = false;

    // Intentar encontrar match con configuración
    for (const [labelRegex, value] of Object.entries(textFields)) {
      if (new RegExp(labelRegex, 'i').test(label)) {
        await changeTextInput(input, '', value.toString());
        fieldFilled = true;
        console.log(`✅ Campo de texto "${label}" rellenado con valor configurado: "${value}"`);
        break;
      }
    }

    // Si no se encontró match, hacer uso de LLM
    if (!fieldFilled) {
      try {
        const aiResponse = await interpreterAI(textFields, 'text', label);
        await changeTextInput(input, '', aiResponse);
        console.log(`✅ Campo de texto "${label}" rellenado con valor generado: "${aiResponse}"`, 'success');
      } catch (error) {
        // Verificar si el campo está vacío antes de rellenarlo
        const currentValue = await input.evaluate((el) => (el as HTMLInputElement)?.value);
        
        if (!currentValue || currentValue?.trim() === '') {
          const randomValue = getRandomDefaultValue();
          await changeTextInput(input, '', randomValue);
          console.log(`🎲 Campo de texto "${label}" rellenado con valor aleatorio: "${randomValue}"`);
        } else {
          console.log(`⏭️ Campo de texto "${label}" ya tiene valor: "${currentValue}"`);
        }
      }
      
    }
  }
}

export default fillTextFields;
