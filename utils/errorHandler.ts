import wait from './wait';

interface ErrorHandlerOptions {
  context: string;
  waitTime?: number;
  maxRetries?: number;
}

class ErrorHandler {
  private static defaultWaitTime = 30000; // 30 segundos
  private static defaultMaxRetries = 3;

  static async handleError(
    error: any, 
    options: ErrorHandlerOptions
  ): Promise<void> {
    const { context, waitTime = this.defaultWaitTime, maxRetries = this.defaultMaxRetries } = options;
    
    console.error(`❌ Error en ${context}:`, error.message || error);
    console.log(`⏳ Esperando ${waitTime / 1000} segundos antes de continuar...`);
    
    await wait(waitTime);
    
    console.log(`✅ Continuando ejecución después del error en ${context}`);
  }

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions
  ): Promise<T | null> {
    const { context, maxRetries = this.defaultMaxRetries } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error:any) {
        console.error(`❌ Intento ${attempt}/${maxRetries} falló en ${context}:`, error?.message || error);
        
        if (attempt === maxRetries) {
          console.error(`💥 Todos los intentos fallaron en ${context}`);
          await this.handleError(error, options);
          return null;
        }
        
        console.log(`🔄 Reintentando en 20 segundos... (${attempt + 1}/${maxRetries})`);
        await wait(20000);
      }
    }
    
    return null;
  }
}

export default ErrorHandler;
