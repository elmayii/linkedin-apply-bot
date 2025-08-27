import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

export class DatabaseService {
  private static instance: DatabaseService;
  private client: PrismaClient;

  private constructor() {
    this.client = prisma;
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Obtiene la cookie li_at para un email específico
   */
  async getLinkedInAuth(email: string): Promise<string | null> {
    try {
      const auth = await this.client.linkedInAuth.findUnique({
        where: { 
          email: email,
          isActive: true 
        }
      });

      if (auth && this.isAuthValid(auth.expiresAt)) {
        console.log(`✅ Cookie li_at encontrada para ${email}`);
        return auth.li_at;
      }

      if (auth && !this.isAuthValid(auth.expiresAt)) {
        console.log(`⚠️ Cookie li_at expirada para ${email}, eliminando...`);
        await this.removeLinkedInAuth(email);
      }

      return null;
    } catch (error) {
      console.error('❌ Error obteniendo autenticación:', error);
      return null;
    }
  }

  /**
   * Guarda o actualiza la cookie li_at para un email
   */
  async saveLinkedInAuth(email: string, li_at: string, expiresAt?: Date): Promise<void> {
    try {
      await this.client.linkedInAuth.upsert({
        where: { email },
        update: {
          li_at,
          expiresAt,
          updatedAt: new Date(),
          isActive: true
        },
        create: {
          email,
          li_at,
          expiresAt,
          isActive: true
        }
      });

      console.log(`✅ Cookie li_at guardada para ${email}`);
    } catch (error) {
      console.error('❌ Error guardando autenticación:', error);
      throw error;
    }
  }

  /**
   * Elimina la autenticación para un email
   */
  async removeLinkedInAuth(email: string): Promise<void> {
    try {
      await this.client.linkedInAuth.update({
        where: { email },
        data: { isActive: false }
      });

      console.log(`🗑️ Autenticación eliminada para ${email}`);
    } catch (error) {
      console.error('❌ Error eliminando autenticación:', error);
    }
  }

  /**
   * Registra una aplicación de trabajo
   */
  async logJobApplication(
    jobTitle: string, 
    companyName: string, 
    jobUrl: string, 
    userEmail: string, 
    status: string = 'applied'
  ): Promise<void> {
    try {
      await this.client.jobApplication.create({
        data: {
          jobTitle,
          companyName,
          jobUrl,
          userEmail,
          status
        }
      });

      console.log(`📝 Aplicación registrada: ${jobTitle} en ${companyName}`);
    } catch (error: any) {
      // Si ya existe la aplicación, la actualizamos
      if (error?.code === 'P2002') {
        await this.client.jobApplication.update({
          where: { jobUrl },
          data: { 
            status,
            appliedAt: new Date()
          }
        });
        console.log(`🔄 Aplicación actualizada: ${jobTitle} en ${companyName}`);
      } else {
        console.error('❌ Error registrando aplicación:', error);
      }
    }
  }

  /**
   * Verifica si ya se aplicó a un trabajo
   */
  async hasAppliedToJob(jobUrl: string): Promise<boolean> {
    try {
      const application = await this.client.jobApplication.findUnique({
        where: { jobUrl }
      });

      return !!application;
    } catch (error) {
      console.error('❌ Error verificando aplicación:', error);
      return false;
    }
  }

  /**
   * Verifica si la autenticación sigue siendo válida
   */
  private isAuthValid(expiresAt: Date | null): boolean {
    if (!expiresAt) return true; // Si no hay fecha de expiración, asumimos que es válida
    return new Date() < expiresAt;
  }

  /**
   * Cierra la conexión con la base de datos
   */
  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

export default DatabaseService;
