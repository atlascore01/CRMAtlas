import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "una-clave-secreta-falsa-para-desarrollo-32145",
  providers: [
    CredentialsProvider({
      name: "Credenciales Administrativas",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        // Validación contra las credenciales estáticas especificadas
        const isValid = 
          credentials.username === 'atlascoreadm' && 
          credentials.password === '4322S$S0HJ$:qj@';

        if (isValid) {
          // Si es válido, retornamos el objeto del usuario simulado
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
