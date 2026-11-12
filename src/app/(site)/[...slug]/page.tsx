import { notFound } from "next/navigation";

// Cualquier ruta desconocida muestra la página 404 con la cabecera y el pie del sitio.
export default function CatchAll() {
  notFound();
}
