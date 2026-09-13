import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Protegemos todas las rutas bajo /dashboard
     */
    "/dashboard/:path*",
  ]
};
