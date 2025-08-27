import { Page } from 'puppeteer';

import fillMultipleChoiceFields from './fillMultipleChoiceFields';
import fillBoolean from './fillBoolean';
import fillTextFields from './fillTextFields';
import insertHomeCity from './insertHomeCity';
import insertPhone from './insertPhone';
import uncheckFollowCompany from './uncheckFollowCompany';
import uploadDocs from './uploadDocs';
import { ApplicationFormData } from '../apply';
import { randomDelay, smallRandomDelay } from '../scripts/apply';

const noop = () => { };

async function fillFields(page: Page, formData: ApplicationFormData): Promise<void> {
  await insertHomeCity(page, formData.homeCity).catch(noop);
  
  await smallRandomDelay();

  await insertPhone(page, formData.phone).catch(noop);

  await smallRandomDelay();

  await uncheckFollowCompany(page);

  await smallRandomDelay();

  await uploadDocs(page, '', '').catch(noop);

  await smallRandomDelay();

  await fillTextFields(page, formData).catch((error) => console.log(`Error en fillTextFields: ${error}`, 'error'));

  await smallRandomDelay();

  const booleans = formData.booleans;

  booleans['sponsorship'] = false;

  await fillBoolean(page, booleans).catch((error) => console.log(`Error en fillBoolean: ${error}`, 'error'));

  await smallRandomDelay();

  await fillMultipleChoiceFields(page, formData).catch((error) => console.log(`Error en fillMultipleChoiceFields: ${error}`, 'error'));
}

export default fillFields;
