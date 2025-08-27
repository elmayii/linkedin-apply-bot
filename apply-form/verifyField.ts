import { ElementHandle } from 'puppeteer';

/**
 * Verifica si un elemento ya tiene datos y filtra los elementos que ya están completos
 * @param elements - Arreglo de elementos HTML (inputs, selects, etc.)
 * @returns Arreglo filtrado sin elementos que ya tienen datos
 */
async function verifyField(elements: ElementHandle[]): Promise<ElementHandle[]> {
  const emptyElements: ElementHandle[] = [];

  for (const element of elements) {
    try {
      // Verificar el tipo de elemento
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
      let isEmpty = false;

      if (tagName === 'select') {
        // Para elementos select, verificar si tiene una opción seleccionada válida
        const selectedValue = await element.evaluate((el) => {
          const selectEl = el as HTMLSelectElement;
          return selectEl.value;
        });

        const selectedIndex = await element.evaluate((el) => {
          const selectEl = el as HTMLSelectElement;
          return selectEl.selectedIndex;
        });

        // Considerar vacío si no hay valor seleccionado o está en la primera opción (placeholder)
        isEmpty = !selectedValue || selectedValue.trim() === '' || selectedIndex <= 0;

      } else if (tagName === 'input') {
        // Para elementos input, verificar el tipo y valor
        const inputType = await element.evaluate((el) => {
          const inputEl = el as HTMLInputElement;
          return inputEl.type.toLowerCase();
        });

        if (inputType === 'text' || inputType === 'email' || inputType === 'tel' || 
            inputType === 'number' || inputType === 'password' || inputType === 'search') {
          // Para inputs de texto, verificar si tiene contenido
          const value = await element.evaluate((el) => {
            const inputEl = el as HTMLInputElement;
            return inputEl.value;
          });
          
          isEmpty = !value || value.trim() === '';

        } else if (inputType === 'radio') {
          // Para radio buttons, verificar si está seleccionado
          const isChecked = await element.evaluate((el) => {
            const inputEl = el as HTMLInputElement;
            return inputEl.checked;
          });
          
          isEmpty = !isChecked;

        } else if (inputType === 'checkbox') {
          // Para checkboxes, verificar si está marcado
          const isChecked = await element.evaluate((el) => {
            const inputEl = el as HTMLInputElement;
            return inputEl.checked;
          });
          
          isEmpty = !isChecked;

        } else {
          // Para otros tipos de input, verificar valor
          const value = await element.evaluate((el) => {
            const inputEl = el as HTMLInputElement;
            return inputEl.value;
          });
          
          isEmpty = !value || value.trim() === '';
        }

      } else if (tagName === 'textarea') {
        // Para textarea, verificar contenido
        const value = await element.evaluate((el) => {
          const textareaEl = el as HTMLTextAreaElement;
          return textareaEl.value;
        });
        
        isEmpty = !value || value.trim() === '';

      } else {
        // Para otros elementos, asumir que están vacíos
        isEmpty = true;
      }

      // Solo agregar al arreglo si está vacío
      if (isEmpty) {
        emptyElements.push(element);
        console.log(`📝 Campo vacío encontrado: ${tagName}`);
      } else {
        console.log(`✅ Campo ya completado: ${tagName}`);
      }

    } catch (error) {
      console.log(`⚠️ Error verificando elemento: ${error}`);
      // En caso de error, incluir el elemento para procesarlo
      emptyElements.push(element);
    }
  }

  console.log(`🔍 Elementos filtrados: ${emptyElements.length}/${elements.length} campos vacíos`);
  return emptyElements;
}

export default verifyField;