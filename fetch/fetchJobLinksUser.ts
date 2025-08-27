import { ElementHandle, Page } from 'puppeteer';
import LanguageDetect from 'languagedetect';

import buildUrl from '../utils/buildUrl';
import wait from '../utils/wait';
import selectors from '../selectors';
import { buildJobSearchUrl } from '../utils/urlUtils';

const MAX_PAGE_SIZE = 7;
const languageDetector = new LanguageDetect();

interface fetchJobLinksUserParams {
  page: Page,
  jobSearchMetadata: {
    geoId: string,
    numAvailableJobs: number
  },
  location: string,
  keywords: string,
  workplace: { remote: boolean, onSite: boolean, hybrid: boolean },
  jobTitle: string,
  jobDescription: string,
  jobDescriptionLanguages: string[]
}

export async function getJobSearchMetadata({ page, location, keywords }: { page: Page, location: string, keywords: string }) {
  // Verificar si ya estamos en una página de búsqueda de LinkedIn
  const currentUrl = page.url();
  const isAlreadyOnJobSearch = currentUrl.includes('linkedin.com/jobs') && currentUrl.includes('keywords=');
  
  if (!isAlreadyOnJobSearch) {
    console.log("📍 Navegando a página de búsqueda de LinkedIn...");
    await page.goto('https://linkedin.com/jobs', { waitUntil: "load" });

    await page.type(selectors.keywordInput, keywords);
    await page.waitForSelector(selectors.locationInput, { visible: true });
    await page.$eval(selectors.locationInput, (el, location) => (el as HTMLInputElement).value = location, location);
    await page.type(selectors.locationInput, ' ');
    await page.$eval('button.jobs-search-box__submit-button', (el) => el.click());
  }
  
  // Esperar a que la URL tenga geoId con timeout más largo y mejor manejo de errores
  try {
    await page.waitForFunction(() => new URLSearchParams(document.location.search).has('geoId'), { timeout: 15000 });
  } catch (error) {
    console.log("⚠️ Timeout esperando geoId, intentando extraer de URL actual...");
    // Intentar continuar sin geoId si es posible
  }

  const geoId = await page.evaluate(() => new URLSearchParams(document.location.search).get('geoId'));

  const numJobsHandle = await page.waitForSelector(selectors.searchResultListText, { timeout: 10000 }) as ElementHandle<HTMLElement>;
  const numAvailableJobs = await numJobsHandle.evaluate((el) => parseInt((el as HTMLElement).innerText.replace(',', '')));

  console.log(`📊 Metadatos obtenidos: ${numAvailableJobs} empleos disponibles, geoId: ${geoId}`);

  return {
    geoId,
    numAvailableJobs
  };
};

interface PARAMS {
  page: Page,
  location: string,
  keywords: string,
  workplace: { remote: boolean, onSite: boolean, hybrid: boolean },
  jobTitle: string,
  jobDescription: string,
  jobDescriptionLanguages: string[],
  limit: number
};

/**
 * Fetches job links as a user (logged in)
 */
export async function fetchJobLinksUser(
  {
    page, location, keywords, workplace: { remote, onSite, hybrid }, jobTitle, jobDescription, jobDescriptionLanguages, limit
  }: PARAMS){
  var numSeenJobs = 0;
  let numMatchingJobs = 0;
  const fWt = [onSite, remote, hybrid].reduce((acc, c, i) => c ? [...acc, i + 1] : acc, [] as number[]).join(',');

  const jobs: { link: string; title: string; companyName: string; }[] = [];

  const { geoId, numAvailableJobs } = await getJobSearchMetadata({ page, location, keywords });

  const searchParams: { [key: string]: string } = {
    keywords,
    location,
    start: numSeenJobs.toString(),
    f_WT: fWt,
    f_AL: 'true'
  };

  if(geoId) {
    searchParams.geoId = geoId.toString();
  }

  const url = buildUrl('https://www.linkedin.com/jobs/search', searchParams);

  const maxCapacity = limit * 2;

  while (numSeenJobs < numAvailableJobs && jobs.length < maxCapacity) {
    try {
    url.searchParams.set('start', numSeenJobs.toString());

    await page.goto(url.toString(), { waitUntil: "load" });
        
    const jobElements = await page.$$(`${selectors.searchResultList} li`);
    
    numSeenJobs++;
    console.log(`    🔍 Analizando ${jobElements.length} empleos (${numSeenJobs}/${numAvailableJobs})...`);
    
    for (const li of jobElements) {
      try {
        const link = await li.$eval('a', el => el.href).catch(() => null);
        const title = await li.$eval('strong', el => el.textContent).catch(() => null);
        let companyName = 'Unknown';
        if (!link || !title) continue;

        await page.goto(buildJobSearchUrl(link), { waitUntil: "load" });

        await wait(2000)

        //Encontrar nombre de Compañia
        const companyNameElement = await page.$(selectors.searchResultListItemCompanyName).catch(() => null);
        if(companyNameElement){
          companyName = await companyNameElement?.evaluate(el => el?.textContent)?.catch(() => 'Unknown') ?? 'Unknown';
        }
        // const list = await page.$$eval(selectors.searchResultListItemCompanyName, el => el.flatMap(el => el.textContent));

        // if(list && list?.length > 0){
        //   list.filter((el) => el?.trim() !== '' || el?.trim() !== '/n');
        //   companyName = list[0] ?? 'Unknown';
        // }

        // Verificar si tiene Easy Apply disponible
        const easyApplyButton = await page.$(selectors.easyApplyButtonEnabled);
        const alreadyApplied = await page.$(selectors.appliedToJobFeedback);

        if (alreadyApplied) {
          console.log(`    ⏭️ Ya aplicado anteriormente: ${title}`);
          continue;
        }
        
        if (!easyApplyButton) {
          console.log(`    ❌ No tiene Easy Apply disponible: ${title}`);
          continue;
        }

        console.log(`    ✅ Easy Apply disponible para: ${title}`);
    
        jobs.push({
          link: buildJobSearchUrl(link),
          title,
          companyName: companyName || 'Unknown'
        });
        
        numMatchingJobs++;
      } catch (e: any) {
        console.log(`    ❌ Error procesando elemento: ${e?.message}`);
      }
    }
      } catch (e:any) {
        console.log(`    ❌ Error procesando empleo: ${e?.message}`);
      }

    await wait(2000);

    //numSeenJobs += jobListings.length;
  }

  return {
    jobs,
    numSeenJobs,
    numMatchingJobs
  };
}