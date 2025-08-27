import { Page } from 'puppeteer';

import selectors from '../selectors';
import wait from '../utils/wait';

async function clickNextButton(page: Page): Promise<void> {

  if(await page.waitForSelector(selectors.nextButton)){
    if(await page.$(selectors.postApplyModal)){
      return;
    }
    await page.click(selectors.nextButton);

    wait(2000)
  }

  //await page.waitForSelector(selectors.enabledSubmitOrNextButton, { timeout: 10000 });
}

export default clickNextButton;
