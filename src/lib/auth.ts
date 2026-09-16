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

// Configuración de usuarios y credenciales administrativas
const USERS_CREDENTIALS: Record<string, { pass: string; name: string; email: string }> = {
  atlascoreadm: {
    pass: '4322S$S0HJ$:qj@',
    name: 'Atlas Admin',
    email: 'admin@atlascore.com',
  },
  nfrance: {
    pass: 'Nf8#mK9!vP2$',
    name: 'N. France',
    email: 'nfrance@atlascore.com',
  },
  estuyck: {
    pass: 'Es4@wT7*zL1^',
    name: 'E. Stuyck',
    email: 'estuyck@atlascore.com',
  },
  amelian: {
    pass: 'Am9$rX2!bQ8#',
    name: 'A. Melian',
    email: 'amelian@atlascore.com',
  },
  narcos: {
    pass: 'Na3*vY6&cM9@',
    name: 'N. Arcos',
    email: 'narcos@atlascore.com',
  },
  gbustos: {
    pass: 'Gb7!tZ4$pW2*',
    name: 'G. Bustos',
    email: 'gbustos@atlascore.com',
  },
  aquevedo: {
    pass: 'Aq5#sN8%kR3!',
    name: 'A. Quevedo',
    email: 'aquevedo@atlascore.com',
  },
};

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

        if (!username || !password) return null;

        const userAccount = USERS_CREDENTIALS[username];
        if (!userAccount) return null;

        // Validación de contraseña (tolera tildes invertidas accidentales en pass histórica de atlascoreadm)
        const isPassValid = 
          password === userAccount.pass || 
          (username === 'atlascoreadm' && password === '43`22S$S0HJ$:qj@');

        if (isPassValid) {
          return { 
            id: username, 
            name: userAccount.name, 
            email: userAccount.email, 
            role: "ADMIN" 
          };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: string; username?: string; name?: string | null; id?: string };
        token.role = u.role;
        token.username = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as { role?: unknown; username?: unknown; name?: string | null };
        sUser.role = token.role;
        sUser.username = token.username;
        session.user.name = token.name as string;
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

