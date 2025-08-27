import { Page } from 'puppeteer';
import selectors from '../selectors';
import { ApplicationFormData } from '../apply';
import { interpreterAI } from './ai/interpreterAI';
import verifyField from './verifyField';

interface MultipleChoiceFields {
  [labelRegex: string]: string;
}

/**
 * Selecciona un valor por defecto basado en las opciones disponibles
 * @param options - Array de opciones del select
 * @returns Valor por defecto a seleccionar
 */
function getDefaultValue(options: HTMLOptionElement[]): string | null {
  if (options.length === 0) return null;

  // Filtrar opciones vacías o de placeholder
  const validOptions = options.filter(option => 
    option.value && 
    option.value.trim() !== '' && 
    !option.text.toLowerCase().includes('select') &&
    !option.text.toLowerCase().includes('choose')
  );

  if (validOptions.length === 0) return null;

  // Regla 1: Si tiene números, escoger 5 o el más cercano
  const numberOptions = validOptions.filter(option => /\d/.test(option.value) || /\d/.test(option.text));
  if (numberOptions.length > 0) {
    // Buscar exactamente "5" o el número más cercano a 5
    const fiveOption = numberOptions.find(option => 
      option.value.includes('5') || option.text.includes('5')
    );
    if (fiveOption) return fiveOption.value;
    
    // Si no hay "5", buscar el número más cercano a 5
    const numbers = numberOptions.map(option => {
      const match = option.value.match(/\d+/) || option.text.match(/\d+/);
      return match ? { option, num: parseInt(match[0]) } : null;
    }).filter(Boolean);
    
    if (numbers.length > 0) {
      const closest = numbers.reduce((prev, curr) => 
        Math.abs(curr!.num - 5) < Math.abs(prev!.num - 5) ? curr : prev
      );
      return closest!.option.value;
    }
  }

  // Regla 2: Si tiene opciones sí/no, escoger sí/yes
  const yesNoOptions = validOptions.filter(option => {
    const text = option.text.toLowerCase();
    const value = option.value.toLowerCase();
    return text.includes('sí') || text.includes('si') || text.includes('yes') || 
           text.includes('no') || value.includes('yes') || value.includes('no');
  });
  
  if (yesNoOptions.length > 0) {
    const yesOption = yesNoOptions.find(option => {
      const text = option.text.toLowerCase();
      const value = option.value.toLowerCase();
      return text.includes('sí') || text.includes('si') || text.includes('yes') || 
             value.includes('yes');
    });
    if (yesOption) return yesOption.value;
  }

  // Regla 3: Para strings, escoger la primera opción válida
  return validOptions[1].value;
}

async function fillMultipleChoiceFields(page: Page, formData: ApplicationFormData): Promise<void> {
  const selects = await verifyField(await page.$$(selectors.select));

  const multipleChoiceFields = {
    ...formData.yearsOfExperience,
    ...formData.languageProficiency,
  }

  for (const select of selects) {
    const id = await select.evaluate((el) => el.id);
    const label = await page.$eval(`label[for="${id}"]`, (el) => el.innerText).catch(() => 'Unknown');
    
    let optionSelected = false;

    // Intentar encontrar match con configuración
    for (const [labelRegex, value] of Object.entries(multipleChoiceFields)) {
      if (new RegExp(labelRegex, 'i').test(label)) {
        const option = await select.$$eval(selectors.option, (options, value) => {
          const option = (options as HTMLOptionElement[]).find((option) => 
            option.value.toLowerCase() === value?.toString()?.toLowerCase()
          );
          return option && option.value;
        }, value);

        if (option) {
          await select.select(option);
          optionSelected = true;
          console.log(`✅ Campo "${label}" rellenado con valor configurado: "${value}"`);
          break;
        }
      }
    }

    // Si no se encontró match, usar valor por defecto
    if (!optionSelected) {
      try {
        // Obtener todas las opciones disponibles del select
        const availableOptions = await select.$$eval(selectors.option, (options) => 
          (options as HTMLOptionElement[]).map(option => option.value).filter(value => value && value.trim() !== '')
        );
        
        const aiResponse = await interpreterAI(multipleChoiceFields, 'multipleChoice', label, availableOptions);
        await select.select(aiResponse);
        console.log(`✅ Campo de selección "${label}" rellenado con valor generado: "${aiResponse}"`, 'success');
      } catch (error) {

        //Intentar con valor Default
        const defaultValue = getDefaultValue(await select.$$eval(selectors.option, (options) => options as HTMLOptionElement[]));

        if (defaultValue) {
          await select.select(defaultValue);
          console.log(`🔄 Campo "${label}" rellenado con valor por defecto: "${defaultValue}"`, 'info');
        } else {
          console.log(`⚠️ No se pudo rellenar el campo "${label}" - sin opciones válidas`, 'warning');
        }
      }
    }
  }
}

export default fillMultipleChoiceFields;
