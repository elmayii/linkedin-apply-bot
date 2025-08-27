import * as readline from 'readline';

interface KeyboardState {
  isPaused: boolean;
  isListening: boolean;
}

class KeyboardHandler {
  private static instance: KeyboardHandler;
  private state: KeyboardState;
  private rl: readline.Interface;

  private constructor() {
    this.state = {
      isPaused: false,
      isListening: false
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.setupKeyboardListener();
  }

  static getInstance(): KeyboardHandler {
    if (!KeyboardHandler.instance) {
      KeyboardHandler.instance = new KeyboardHandler();
    }
    return KeyboardHandler.instance;
  }

  private setupKeyboardListener(): void {
    // Configurar stdin para capturar teclas individuales
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key: string) => {
      if (!this.state.isListening) return;

      const keyCode = key.toString();
      
      // Detectar tecla 'p' para pausar/reanudar
      if (keyCode.toLowerCase() === 'p') {
        this.togglePause();
      }
      
      // Detectar Ctrl+C para salir
      if (keyCode === '\u0003') {
        console.log('\n🛑 Saliendo del programa...');
        process.exit(0);
      }
    });

    this.state.isListening = true;
    this.showInstructions();
  }

  private togglePause(): void {
    this.state.isPaused = !this.state.isPaused;
    
    if (this.state.isPaused) {
      console.log('\n⏸️  PAUSADO - El bot se detendrá después de la operación actual');
      console.log('💡 Presiona "P" nuevamente para reanudar');
    } else {
      console.log('\n▶️  REANUDADO - El bot continuará con la ejecución');
      console.log('💡 Presiona "P" para pausar nuevamente');
    }
  }

  private showInstructions(): void {
    console.log('\n🎮 CONTROLES DEL BOT:');
    console.log('   • Presiona "P" para PAUSAR/REANUDAR');
    console.log('   • Presiona "Ctrl+C" para SALIR');
    console.log('   • Estado actual: ▶️  EJECUTANDO\n');
  }

  public isPaused(): boolean {
    return this.state.isPaused;
  }

  public startListening(): void {
    this.state.isListening = true;
    this.showInstructions();
  }

  public stopListening(): void {
    this.state.isListening = false;
  }

  public async waitWhilePaused(): Promise<void> {
    while (this.state.isPaused) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  public cleanup(): void {
    this.state.isListening = false;
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    this.rl.close();
  }
}

export default KeyboardHandler;
