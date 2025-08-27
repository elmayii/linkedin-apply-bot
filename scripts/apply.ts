import puppeteer, { Page } from "puppeteer";
import config from "../config";

import login from "../login";
import apply, { ApplicationFormData } from "../apply";
import {fetchJobLinksUser,getJobSearchMetadata} from "../fetch/fetchJobLinksUser";
import KeyboardHandler from "../utils/keyboardHandler";
import AuthService from "../utils/authService";
import DatabaseService from "../utils/database";
import { buildJobSearchUrl } from "../utils/urlUtils";

const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

// Función para generar intervalos aleatorios entre 3-5 segundos
export const randomDelay = () => {
  const delay = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
  console.log(`⏳ Esperando ${delay/1000}s antes del siguiente paso...`);
  return wait(delay);
};

// Función para generar intervalos aleatorios entre 0.1 y 1 segundos
export const smallRandomDelay = () => {
  const delay = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  console.log(`⏳ Esperando ${delay/1000}s antes del siguiente paso...`);
  return wait(delay);
};

const definedDelay = (time: number) => {
  console.log(`⏳ Esperando ${time/1000}s antes del siguiente paso...`);
  return wait(time);
};

const func = async () => {
  // Inicializar servicios
  const keyboardHandler = KeyboardHandler.getInstance();
  const authService = AuthService.getInstance();
  const dbService = DatabaseService.getInstance();
  
  keyboardHandler.startListening();

  console.log("🚀 Iniciando LinkedIn Easy Apply Bot...");
  console.log("🗄️ Conectando a base de datos...");
  await randomDelay();

  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [
      "--disable-setuid-sandbox", 
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--window-size=1366,768"
    ],
    defaultViewport: {
      width: 1366,
      height: 768,
    },
  });
  const context = await browser.createBrowserContext();
  const listingPage = await context.newPage();

  const pages = await browser.pages();
  await pages[0].close();

  console.log("🔐 Iniciando proceso de autenticación...");
  await randomDelay();

  try {
    await login({
      page: listingPage,
      email: config.LINKEDIN_EMAIL,
      password: config.LINKEDIN_PASSWORD
    });

    console.log("🔍 Configurando búsqueda de empleos...");
    await randomDelay();

    const dataConfig = {
      page: listingPage,
      location: config.LOCATION,
      keywords: config.KEYWORDS,
      workplace: {
        remote: config.WORKPLACE.REMOTE,
        onSite: config.WORKPLACE.ON_SITE,
        hybrid: config.WORKPLACE.HYBRID,
      },
      jobTitle: config.JOB_TITLE,
      jobDescription: config.JOB_DESCRIPTION,
      jobDescriptionLanguages: config.JOB_DESCRIPTION_LANGUAGES,
      limit: process.env?.LIMIT ? parseInt(process.env?.LIMIT) : 10,
    };

    console.log("📋 Comenzando aplicaciones automáticas...");
    // console.log(listingPage.url());
    // if(listingPage.url().includes("linkedin.com/jobs"))
    //   await definedDelay(30000);
    await randomDelay()

    //const jobSearchMetadata = await getJobSearchMetadata({ page: listingPage, location: config.LOCATION, keywords: config.KEYWORDS });

    let applicationPage: Page | null = null;
    let jobCount = 0;
    let appliedCount = 0;
    let skippedCount = 0;
    let totalCount = 0

    var linksJob = await fetchJobLinksUser(dataConfig);

    while(appliedCount < dataConfig.limit) {
    const {link, title, companyName} = linksJob.jobs[jobCount];
        // Verificar si está pausado antes de cada aplicación
      await keyboardHandler.waitWhilePaused();

      jobCount++;
      console.log(`\n📝 Procesando trabajo ${jobCount}: ${title} en ${companyName}`);

      await randomDelay();

      
      applicationPage = await context.newPage();
      // await applicationPage.goto(link, { waitUntil: 'load' });

      // await applicationPage?.bringToFront();

      try {
        const formData: ApplicationFormData = {
          phone: config.PHONE,
          cvPath: config.CV_PATH,
          homeCity: config.HOME_CITY,
          coverLetterPath: config.COVER_LETTER_PATH,
          yearsOfExperience: config.YEARS_OF_EXPERIENCE,
          languageProficiency: config.LANGUAGE_PROFICIENCY,
          requiresVisaSponsorship: config.REQUIRES_VISA_SPONSORSHIP,
          booleans: config.BOOLEANS,
          textFields: config.TEXT_FIELDS,
          multipleChoiceFields: config.MULTIPLE_CHOICE_FIELDS,
        };

        await apply({
          page: applicationPage!,
          link,
          formData,
          shouldSubmit: process.argv[2] === "SUBMIT",
        });

        // Registrar aplicación exitosa
        await authService.logJobApplication(
          title, 
          companyName, 
          link, 
          config.LINKEDIN_EMAIL, 
          'applied'
        );

        appliedCount++;
        console.log(`✅ Aplicado a ${title} en ${companyName}`);
      } catch (error:any) {
        // Registrar aplicación con error
        await authService.logJobApplication(
          title, 
          companyName, 
          link, 
          config.LINKEDIN_EMAIL, 
          'error'
        );

        const dif = linksJob.jobs.length - jobCount;

        if(dif === 0) {
          console.log("🔄 Recapturando empleos...");
          
          // Asegurar que la página esté en el contexto correcto para la búsqueda
          await listingPage.bringToFront();
          
          // Crear una nueva configuración con la página correcta
          const recaptureConfig = {
            ...dataConfig,
            page: listingPage // Usar listingPage en lugar de la página de aplicación
          };

          totalCount += jobCount;
          jobCount = 0;
          
          try {
            linksJob = await fetchJobLinksUser(recaptureConfig);
            console.log(`✅ Recapturados ${linksJob.jobs.length} empleos adicionales`);
          } catch (recaptureError: any) {
            console.log(`❌ Error recapturando empleos: ${recaptureError?.message}`);
            // Si falla la recaptura, salir del bucle para evitar bucle infinito
            break;
          }
        }
        console.log(`❌ Error aplicando a ${title} en ${companyName}:`, error?.message);
      }

      await listingPage.bringToFront();
      
      console.log("🔄 Regresando a la lista de empleos...");
      await randomDelay();

      // Verificar pausa después de cada aplicación
      await keyboardHandler.waitWhilePaused();
      };

    totalCount+= jobCount;

    console.log(`\n🎉 Proceso completado!`);
    console.log(`📊 Estadísticas:`);
    console.log(`   • Total procesados: ${totalCount}`);
    console.log(`   • Aplicaciones enviadas: ${appliedCount}`);
    console.log(`   • Omitidos (ya aplicados): ${skippedCount}`);
    console.log(`   • Errores: ${totalCount - appliedCount}`);
    
  } catch (error) {
    console.error('❌ Error crítico en el proceso:', error);
    console.error('🔄 Intentando de nuevo...');
    await randomDelay();
    func();
  } finally {
    // Limpiar recursos
    keyboardHandler.cleanup();
    await dbService.disconnect();
    console.log('🧹 Recursos limpiados');
    // await browser.close();
  }
};

func()


//https://www.linkedin.com/jobs/search/?currentJobId=4271178653&f_AL=true&f_WT=1%2C2%2C3&geoId=105646813&keywords=javascript&location=Espa%C3%B1a