export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Escapar "<" evita cerrar la etiqueta script desde el contenido.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
