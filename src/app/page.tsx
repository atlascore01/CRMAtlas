import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir la raíz a la pantalla de dashboard principal
  redirect('/dashboard');
}
