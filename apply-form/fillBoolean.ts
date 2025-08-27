import { ElementHandle, Page } from 'puppeteer';

import selectors from '../selectors';
import verifyField from './verifyField';

/**
 * Busca la opción afirmativa en un array de opciones
 * @param options - Array de opciones HTML
 * @returns Índice de la opción afirmativa o 0 por defecto
 */
async function findAffirmativeOption(options: ElementHandle[]): Promise<number> {
  for (let i = 0; i < options.length; i++) {
    const text = await options[i].evaluate((el) => (el as HTMLOptionElement).text.toLowerCase());
    const value = await options[i].evaluate((el) => (el as HTMLOptionElement).value.toLowerCase());
    
    // Buscar palabras afirmativas en múltiples idiomas
    const affirmativeWords = ['yes', 'sí', 'si', 'true', 'oui', 'ja', 'sim', 'tak'];
    
    if (affirmativeWords.some(word => text.includes(word) || value.includes(word))) {
      return i;
    }
  }
  
  // Si no encuentra opción afirmativa, devuelve la primera opción válida
  return 0;
}

/**
 * Busca el radio button afirmativo en un fieldset
 * @param fieldset - Elemento fieldset
 * @returns ElementHandle del radio button afirmativo o null
 */
async function findAffirmativeRadio(fieldset: ElementHandle): Promise<ElementHandle | null> {
  const options = await fieldset.$$(selectors.radioInput);
  
  for (const option of options) {
    const value = await option.evaluate((el) => (el as HTMLInputElement).value.toLowerCase());
    const label = await option.evaluate((el) => {
      const input = el as HTMLInputElement;
      const labelEl = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
      return labelEl ? labelEl.textContent?.toLowerCase() || '' : '';
    });
    
    // Buscar palabras afirmativas
    const affirmativeWords = ['yes', 'sí', 'si', 'true', 'oui', 'ja', 'sim', 'tak'];
    
    if (affirmativeWords.some(word => value.includes(word) || label.includes(word))) {
      return option;
    }
  }
  
  // Si no encuentra opción afirmativa, devuelve la primera
  return options[1] || null;
}

async function fillBoolean(page: Page, booleans: { [key: string]: boolean }): Promise<void> {
  const fieldsets = await page.$$(selectors.fieldset);

  // fill 2 option radio button field sets
  for (const fieldset of fieldsets) {
    const options = await fieldset.$$(selectors.radioInput);

    if (options.length === 2) {
      const label = await fieldset.$eval('legend', el => el.innerText).catch(() => 'Unknown');
      let optionSelected = false;

      // Intentar encontrar match con configuración
      for (const [labelRegex, value] of Object.entries(booleans)) {
        if (new RegExp(labelRegex, "i").test(label)) {
          // Buscar por valor específico (Yes/No, Sí/No, etc.)
          let input = await fieldset.$(`${selectors.radioInput}[value='${value ? 'Yes' : 'No'}']`) as ElementHandle;
          
          // Si no encuentra Yes/No, buscar por Sí/No
          if (!input) {
            input = await fieldset.$(`${selectors.radioInput}[value='${value ? 'Sí' : 'No'}']`) as ElementHandle;
          }
          
          // Si no encuentra por valor específico, usar índice (0=afirmativo, 1=negativo)
          if (!input && options.length === 2) {
            input = options[value ? 0 : 1];
          }

          if (input) {
            await input.click();
            optionSelected = true;
            console.log(`✅ Radio button "${label}" seleccionado con valor configurado: "${value ? 'Afirmativo' : 'Negativo'}"`);
            break;
          }
        }
      }

      // Si no se encontró match, usar valor por defecto (afirmativo)
      if (!optionSelected) {
        const affirmativeRadio = await findAffirmativeRadio(fieldset);
        if (affirmativeRadio) {
          await affirmativeRadio.click();
          console.log(`🔄 Radio button "${label}" seleccionado con valor por defecto: "Afirmativo"`);
        }
      }
    }
  }

 // fill checkboxes
  const allCheckboxes = await page.$$(selectors.checkbox) as ElementHandle<HTMLInputElement>[];
  const followCompanySelector = selectors.followCompanyCheckbox;
  
  const checkboxes = [];
  for (const checkbox of allCheckboxes) {
    const isFollowCompany = await checkbox.evaluate((el, selector) => el.matches(selector), followCompanySelector);
    if (!isFollowCompany) {
      checkboxes.push(checkbox);
    }
  }

  for (const checkbox of checkboxes) {
    const id = await checkbox.evaluate(el => el.id);
    const label = await page.$eval(`label[for="${id}"]`, el => el.innerText).catch(() => 'Unknown');
    let checkboxHandled = false;

    // Intentar encontrar match con configuración
    for (const [labelRegex, value] of Object.entries(booleans)) {
      if (new RegExp(labelRegex, "i").test(label)) {
        const previousValue = await checkbox.evaluate(el => el.checked);

        if (value !== previousValue) {
          await checkbox.evaluate(el => el.click());
        }
        checkboxHandled = true;
        console.log(`✅ Checkbox "${label}" configurado como: "${value ? 'Marcado' : 'Desmarcado'}"`);
        break;
      }
    }

    // Si no se encontró match, marcar por defecto (valor afirmativo)
    if (!checkboxHandled) {
      const isChecked = await checkbox.evaluate(el => el.checked);
      if (!isChecked) {
        await checkbox.evaluate(el => el.click());
        console.log(`🔄 Checkbox "${label}" marcado por defecto`);
      } else {
        console.log(`⏭️ Checkbox "${label}" ya estaba marcado`);
      }
    }
  }

  // fill selects with boolean-like options (2+ options)
  const selects = await verifyField(await page.$$(selectors.select));

  for (const select of selects) {
    const options = (await select.$$(selectors.option));

    options.shift(); // Remover primera opción (placeholder)

    // Procesar selects con 2 o más opciones que contengan valores booleanos
    if (options.length >= 2) {
      const id = await select.evaluate(el => el.id);
      const label = await page.$eval(`label[for="${id}"]`, el => el.innerText).catch(() => 'Unknown');
      let selectHandled = false;

      // Intentar encontrar match con configuración
      for (const [labelRegex, value] of Object.entries(booleans)) {
        if (new RegExp(labelRegex, "i").test(label)) {
          
          // Buscar opción específica basada en el valor booleano
          let targetOption = null;
          
          if (value) {
            // Buscar opción afirmativa
            const affirmativeIndex = await findAffirmativeOption(options);
            targetOption = await options[affirmativeIndex].evaluate((el) => (el as HTMLOptionElement).value);
          } else {
            // Buscar opción negativa
            for (let i = 0; i < options.length; i++) {
              const text = await options[i].evaluate((el) => (el as HTMLOptionElement).text.toLowerCase());
              const optionValue = await options[i].evaluate((el) => (el as HTMLOptionElement).value.toLowerCase());
              
              const negativeWords = ['no', 'false', 'non', 'nein', 'não', 'nie'];
              
              if (negativeWords.some(word => text.includes(word) || optionValue.includes(word))) {
                targetOption = await options[i].evaluate((el) => (el as HTMLOptionElement).value);
                break;
              }
            }
            
            // Si no encuentra opción negativa específica, usar la segunda opción
            if (!targetOption && options.length >= 2) {
              targetOption = await options[1].evaluate((el) => (el as HTMLOptionElement).value);
            }
          }

          if (targetOption) {
            await select.select(targetOption);
            selectHandled = true;
            console.log(`✅ Select "${label}" seleccionado con valor configurado: "${value ? 'Afirmativo' : 'Negativo'}" (${options.length} opciones disponibles)`);
            break;
          }
        }
      }

      // Si no se encontró match, usar valor por defecto (afirmativo)
      if (!selectHandled) {
        const affirmativeIndex = await findAffirmativeOption(options);
        const defaultOption = await options[affirmativeIndex].evaluate((el) => (el as HTMLOptionElement).value);
        
        await select.select(defaultOption);
        console.log(`🔄 Select "${label}" seleccionado con valor por defecto: "Afirmativo" (${options.length} opciones disponibles)`);
      }
    }
  }
}

export default fillBoolean;
