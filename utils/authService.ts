import { Page } from 'puppeteer';
import DatabaseService from './database';

export class AuthService {
  private static instance: AuthService;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Intenta autenticar usando cookie guardada
   */
  async tryAuthWithSavedCookie(page: Page, email: string): Promise<boolean> {
    try {
      console.log(`🔍 Buscando cookie guardada para ${email}...`);
      
      const savedCookie = await this.dbService.getLinkedInAuth(email);
      
      if (!savedCookie) {
        console.log('❌ No se encontró cookie guardada');
        return false;
      }

      console.log('🍪 Configurando cookie li_at en el navegador...');
      
      // Navegar a LinkedIn primero
      await page.goto('https://www.linkedin.com', { waitUntil: 'networkidle0' });
      
      // Configurar la cookie li_at
      await page.setCookie({
        name: 'li_at',
        value: savedCookie,
        domain: '.linkedin.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None'
      });

      // Navegar a una página que requiera autenticación para verificar
      console.log('🔐 Verificando autenticación...');
      await page.goto('https://www.linkedin.com/feed/', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });

      // Verificar si estamos autenticados
      const isAuthenticated = await this.verifyAuthentication(page);
      
      if (isAuthenticated) {
        console.log('✅ Autenticación exitosa con cookie guardada');
        return true;
      } else {
        console.log('❌ Cookie expirada o inválida, eliminando de BD...');
        await this.dbService.removeLinkedInAuth(email);
        return false;
      }

    } catch (error) {
      console.error('❌ Error en autenticación con cookie:', error);
      return false;
    }
  }

  /**
   * Guarda la cookie li_at después de un login exitoso
   */
  async saveCookieAfterLogin(page: Page, email: string): Promise<void> {
    try {
      console.log('🍪 Extrayendo cookie li_at...');
      
      const cookies = await page.cookies();
      const liAtCookie = cookies.find(cookie => cookie.name === 'li_at');
      
      if (liAtCookie) {
        // Calcular fecha de expiración (LinkedIn cookies suelen durar ~1 año)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        
        await this.dbService.saveLinkedInAuth(email, liAtCookie.value, expiresAt);
        console.log('✅ Cookie li_at guardada exitosamente');
      } else {
        console.log('⚠️ No se encontró cookie li_at para guardar');
      }
    } catch (error) {
      console.error('❌ Error guardando cookie:', error);
    }
  }

  /**
   * Verifica si el usuario está autenticado en LinkedIn
   */
  private async verifyAuthentication(page: Page): Promise<boolean> {
    try {
      // Buscar elementos que indiquen que estamos autenticados
      const authIndicators = [
        'nav.global-nav', // Barra de navegación principal
        '[data-control-name="nav.settings"]', // Menú de configuración
        '.global-nav__me', // Menú de perfil
        '.feed-identity-module' // Módulo de identidad en el feed
      ];

      for (const selector of authIndicators) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          return true;
        } catch {
          // Continuar con el siguiente selector
        }
      }

      // Si llegamos aquí, no encontramos indicadores de autenticación
      return false;
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  }

  /**
   * Limpia todas las cookies de autenticación
   */
  async clearAuthCookies(page: Page): Promise<void> {
    try {
      console.log('🧹 Limpiando cookies de autenticación...');
      
      const cookies = await page.cookies();
      const authCookies = cookies.filter(cookie => 
        cookie.name.includes('li_') || 
        cookie.name.includes('linkedin') ||
        cookie.name.includes('JSESSIONID')
      );

      for (const cookie of authCookies) {
        await page.deleteCookie(cookie);
      }

      console.log('✅ Cookies de autenticación limpiadas');
    } catch (error) {
      console.error('❌ Error limpiando cookies:', error);
    }
  }

  /**
   * Registra una aplicación de trabajo en la base de datos
   */
  async logJobApplication(
    jobTitle: string, 
    companyName: string, 
    jobUrl: string, 
    userEmail: string, 
    status: string = 'applied'
  ): Promise<void> {
    await this.dbService.logJobApplication(jobTitle, companyName, jobUrl, userEmail, status);
  }

  /**
   * Verifica si ya se aplicó a un trabajo
   */
  async hasAppliedToJob(jobUrl: string): Promise<boolean> {
    return await this.dbService.hasAppliedToJob(jobUrl);
  }
}

export default AuthService;
