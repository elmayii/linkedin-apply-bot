import { Page } from 'puppeteer';

import selectors from '../selectors';
import fillFields from '../apply-form/fillFields';
import waitForNoError from '../apply-form/waitForNoError';
import clickNextButton from '../apply-form/clickNextButton';
import { link } from 'fs';
import wait from '../utils/wait';

const noop = () => { };

async function clickEasyApplyButton(page: Page): Promise<void> {
  //await page.waitForSelector(selectors.easyApplyButtonEnabled, { timeout: 10000 })?.catch(noop)
  

    await wait(5000);
    await page.click(selectors.easyApplyButtonEnabled);
}

export interface ApplicationFormData {
  phone: string;
  cvPath: string;
  homeCity: string;
  coverLetterPath: string;
  yearsOfExperience: { [key: string]: number };
  languageProficiency: { [key: string]: string };
  requiresVisaSponsorship: boolean;
  booleans: { [key: string]: boolean };
  textFields: { [key: string]: string };
  multipleChoiceFields: { [key: string]: string };
}

interface Params {
  page: Page;
  link: string;
  formData: ApplicationFormData;
  shouldSubmit: boolean;
}

async function apply({ page, link, formData, shouldSubmit }: Params): Promise<void> {
  await page.goto(link, { waitUntil: 'load', timeout: 60000 });

  try {
    await clickEasyApplyButton(page);

  let maxPages = 5;

  while (await page.$(selectors.nextButton)?.catch(noop) && maxPages > 0) {
    await fillFields(page, formData).catch(noop);

    await clickNextButton(page).catch(noop);

    await waitForNoError(page).catch(noop);

    maxPages--;
  }

  await wait(7000);

  if(!(await page.$(selectors.postApplyModal)?.catch(noop))) {
    throw new Error('Post apply modal not found');
  }

  //const submitButton = await page.$(selectors.submit);

  // if (!submitButton) {
  //   throw new Error('Submit button not found');
  // }

  // if (shouldSubmit) {
  //   await submitButton.click();
  // }
  }
  catch (error) {
    console.log(`Fail Apply: ${link}`);
    console.log(error);
    throw error;
    //return;
  }
}

export default apply;
