import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Asegurar fallback de NEXTAUTH_SECRET para producción
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "atlascore-crm-production-secret-token-key-2026";
}

// Auto-detección de dominio en Vercel si NEXTAUTH_URL no fue cargada manualmente
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "atlascore-crm-production-secret-token-key-2026",
  providers: [
    CredentialsProvider({
      name: "Credenciales Administrativas",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        const username = credentials.username?.trim().toLowerCase();
        const password = credentials.password?.trim();

        // Validación: tolera tanto '4322S$S0HJ$:qj@' como '43`22S$S0HJ$:qj@' y espacios accidentales
        const isUserValid = username === 'atlascoreadm';
        const isPassValid = 
          password === '4322S$S0HJ$:qj@' || 
          password === '43`22S$S0HJ$:qj@';

        if (isUserValid && isPassValid) {
          return { 
            id: "1", 
            name: "Atlas Admin", 
            email: "admin@atlascore.com", 
            role: "ADMIN" 
          };
        }
        
        // Si no coincide, retornamos null (login fallido)
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Redirige a nuestra página custom
  },
  session: {
    strategy: "jwt",
  }
};
