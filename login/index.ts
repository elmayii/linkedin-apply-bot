import { Page } from 'puppeteer';
import selectors from '../selectors';
import ErrorHandler from '../utils/errorHandler';
import AuthService from '../utils/authService';

interface LoginParams {
  page: Page;
  email: string;
  password: string;
}

const randomDelay = () => {
  const delay = Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
  console.log(`  ⏳ Esperando ${delay/1000}s...`);
  return new Promise(resolve => setTimeout(resolve, delay));
};

export default async function login({ page, email, password }: LoginParams): Promise<void> {
  const authService = AuthService.getInstance();

  // Intentar autenticación con cookie guardada primero
  console.log('🔐 Intentando autenticación con cookie guardada...');
  const cookieAuthSuccess = await authService.tryAuthWithSavedCookie(page, email);

  const currentPageUrl = page.url();
  
  if (cookieAuthSuccess) {
    console.log('✅ Autenticación exitosa con cookie guardada');
    return;
  }
  else if(currentPageUrl.includes('feed')){
    console.log('✅ Autenticación exitosa con cookie guardada');
    return;
  }
  
  // Si no funciona la cookie, proceder con login tradicional
  console.log('🔑 Procediendo con login tradicional...');
  await randomDelay();

  // Navegar a la página de login con manejo de errores
  await ErrorHandler.executeWithRetry(
    async () => {
      console.log(' Navegando a LinkedIn...');
      await page.goto('https://linkedin.com/login', { waitUntil: 'load', timeout: 30000 });
      return true;
    },
    { context: 'Navegación a LinkedIn' }
  );

  await randomDelay();

  // Verificar si hay captcha
  const captcha = await page.$(selectors.captcha);
  if (captcha) {
    console.log('⚠️ CAPTCHA detectado. Por favor, resuélvelo manualmente y presiona Enter para continuar...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve(void 0));
    });
  }

  await randomDelay();

  // Introducir credenciales con manejo de errores
  await ErrorHandler.executeWithRetry(
    async () => {
      console.log(' Introduciendo credenciales...');
      await page.type(selectors.emailInput, email);
      await page.type(selectors.passwordInput, password);
      return true;
    },
    { context: 'Introducción de credenciales' }
  );

  await randomDelay();

  // Hacer clic en login con manejo de errores
  await ErrorHandler.executeWithRetry(
    async () => {
      console.log(' Iniciando sesión...');
      await page.click(selectors.loginSubmit);
      return true;
    },
    { context: 'Clic en botón de login' }
  );

  await randomDelay();

  // Esperar navegación con manejo de errores
  await ErrorHandler.executeWithRetry(
    async () => {
      console.log(' Esperando confirmación de login...');
      await page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });
      return true;
    },
    { context: 'Confirmación de login' }
  );

  console.log(' Sesión iniciada correctamente en LinkedIn');

  // Guardar cookie después del login exitoso
  await authService.saveCookieAfterLogin(page, email);

  await randomDelay();

  // Verificar si hay botón skip y manejarlo
  try {
    const skipButton = await page.$(selectors.skipButton);
    if (skipButton) {
      console.log(' Haciendo clic en Skip...');
      await skipButton.click();
      await page.waitForNavigation({ waitUntil: 'load', timeout: 10000 });
      console.log(' Botón Skip presionado');
    } else {
      console.log(' No se encontró botón skip (normal)');
    }
  } catch (error) {
    console.log(' No se encontró botón skip (normal)');
  }

  await randomDelay();
}
