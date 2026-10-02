# Diseño: El abismo de lo posible

Sitio estático experimental que transforma el ensayo de Germán Gómez Bonelli en una segunda lectura espacial.

La experiencia se mantiene deliberadamente monocromática: el negro es el campo común y cada capítulo cambia su forma de lectura. La portada funciona como umbral; el encuadre revela la limitación del framing; una trayectoria desplaza la idea de máximo local; una grilla hace visible la estructura; y el cierre convierte al sitio en uno de los proyectos del propio ensayo.

## Estructura

- `index.html`: contenido y estructura semántica.
- `css/style.css`: sistema editorial monocromo, composición adaptable y preferencias de movimiento reducido.
- `js/main.js`: transición de portada, revelados al recorrer el sitio y encuadre accesible.
- `assets/fragment.svg`: composición abstracta propia para la sección de framing.
- `assets/identity/`: favicon y variante para dispositivos móviles basados en una fisura tipográfica.

No usa dependencias ni proceso de compilación. Para verlo localmente, abrí `index.html` en un navegador.

## Publicar en GitHub Pages

1. En el repositorio de GitHub, abrir **Settings** → **Pages**.
2. En **Build and deployment**, elegir **Deploy from a branch**.
3. Elegir la rama `main` y la carpeta `/(root)`, y guardar.
4. Esperar la publicación: GitHub mostrará la URL pública en esa misma pantalla.

Al actualizar los archivos y subir los cambios a `main`, GitHub Pages volverá a publicar el sitio automáticamente.
