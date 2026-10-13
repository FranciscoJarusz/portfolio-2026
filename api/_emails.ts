const SITIO = 'https://franszdev.com';

const C = {
    negro: '#1a1a1a',
    blanco: '#f8f9fa',
    tarjeta: '#f8f9fa',
    amarillo: '#ffd23f',
    verde: '#bbfda3',
    gris: '#5f5f5f',
};

const TITULOS = `'Bricolage Grotesque', 'Arial Black', Arial, sans-serif`;
const TEXTO = `'Work Sans', Arial, Helvetica, sans-serif`;

const escapar = (valor: string) =>
    valor
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const parrafos = (valor: string) => escapar(valor).replace(/\r?\n/g, '<br>');

const borde = (grosor: number, sombra: number) =>
    `border:${grosor}px solid ${C.negro};border-right-width:${sombra}px;border-bottom-width:${sombra}px;`;

const etiqueta = (texto: string, fondo: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="background:${fondo};${borde(2, 2)}border-radius:12px;padding:6px 14px;font-family:${TEXTO};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.negro};">
            ${texto}
        </td>
    </tr>
</table>`;

const boton = (texto: string, href: string, fondo: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="background:${fondo};${borde(2, 4)}border-radius:12px;">
            <a href="${href}" style="display:inline-block;padding:12px 28px;font-family:${TEXTO};font-size:14px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:${C.negro};text-decoration:none;">
                ${texto}
            </a>
        </td>
    </tr>
</table>`;

const marco = ({
    titulo,
    resumen,
    contenido,
    pie,
}: {
    titulo: string;
    resumen: string;
    contenido: string;
    pie: string;
}) => `<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <title>${titulo}</title>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Work+Sans:wght@400;700&display=swap" rel="stylesheet">
    <style>
        @media (max-width: 520px) {
            .contenedor { padding: 24px 12px !important; }
            .tarjeta { padding: 28px 20px !important; }
            .titulo { font-size: 32px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background:${C.tarjeta};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${resumen}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.tarjeta};">
        <tr>
            <td align="center" class="contenedor" style="padding:40px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
                    <tr>
                        <td class="tarjeta" style="background:${C.tarjeta};${borde(3, 7)}border-radius:24px;padding:36px 32px;font-family:${TEXTO};font-size:16px;line-height:1.6;color:${C.negro};">
                            <a href="${SITIO}" style="text-decoration:none;">
                                <img src="${SITIO}/logotipo-mail.png" width="160" height="34" alt="fransz" style="display:block;width:160px;height:auto;border:0;">
                            </a>
                            <div style="margin:32px 0 0;">
                                ${contenido}
                            </div>
                            <p style="margin:32px 0 0;padding:20px 0 0;border-top:2px solid ${C.negro};font-size:12px;line-height:1.6;color:${C.gris};">
                                ${pie}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const tituloHtml = (texto: string) => `
<h1 class="titulo" style="margin:20px 0 0;font-family:${TITULOS};font-size:40px;line-height:1.05;font-weight:800;color:${C.negro};">
    ${texto}
</h1>`;

export const aviso = ({
    nombre,
    email,
    mensaje,
}: {
    nombre: string;
    email: string;
    mensaje: string;
}) => {
    const fecha = new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date());

    const respuesta = `mailto:${escapar(email)}?subject=${encodeURIComponent('Re: tu mensaje en franszdev.com')}`;

    return marco({
        titulo: `Nuevo mensaje de ${escapar(nombre)}`,
        resumen: escapar(mensaje.slice(0, 120)),
        contenido: `
            ${etiqueta('Nuevo mensaje', C.amarillo)}
            ${tituloHtml(`${escapar(nombre)} te escribió`)}
            <p style="margin:12px 0 0;font-size:14px;color:${C.gris};">
                <a href="mailto:${escapar(email)}" style="color:${C.negro};font-weight:700;">${escapar(email)}</a>
                &nbsp;-&nbsp; ${fecha}
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
                <tr>
                    <td style="background:${C.blanco};${borde(3, 3)}border-radius:16px;padding:20px 22px;font-size:16px;line-height:1.6;color:${C.negro};word-break:break-word;">
                        ${parrafos(mensaje)}
                    </td>
                </tr>
            </table>
            <div style="margin:28px 0 0;">
                ${boton(`Responder a ${escapar(nombre.split(' ')[0])}`, respuesta, C.verde)}
            </div>`,
        pie: `Te llegó desde el formulario de <a href="${SITIO}" style="color:${C.negro};font-weight:700;">franszdev.com</a>. Si respondés este mail le contestás directamente.`,
    });
};

export const confirmacion = ({ nombre }: { nombre: string }) => {
    const primerNombre = escapar(nombre.split(' ')[0].slice(0, 30));

    return marco({
        titulo: 'Recibí tu mensaje',
        resumen: 'Gracias por escribirme, te respondo a la brevedad.',
        contenido: `
            ${etiqueta('Mensaje recibido', C.verde)}
            ${tituloHtml(`¡Gracias, ${primerNombre}!`)}
            <p style="margin:20px 0 0;">
                Recibí tu mensaje y te respondo a la brevedad. Si querés sumar
                algo más, respondé este mail y me llega directo.
            </p>
            <p style="margin:16px 0 0;">
                Mientras tanto, podés ver en qué estuve trabajando.
            </p>
            <div style="margin:28px 0 0;">
                ${boton('Ver proyectos', `${SITIO}/#proyectos`, C.amarillo)}
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
                <tr>
                    <td style="border-top:3px solid ${C.negro};padding:20px 0 0;">
                        <p style="margin:0;font-family:${TITULOS};font-size:20px;font-weight:800;color:${C.negro};">Francisco Jarusz</p>
                        <p style="margin:2px 0 0;font-size:14px;color:${C.gris};">Desarrollador web &amp; diseñador UX/UI · Buenos Aires</p>
                        <p style="margin:10px 0 0;font-size:14px;">
                            <a href="https://www.linkedin.com/in/franciscojarusz/" style="color:${C.negro};font-weight:700;">LinkedIn</a>
                            &nbsp;·&nbsp;
                            <a href="https://github.com/FranciscoJarusz" style="color:${C.negro};font-weight:700;">GitHub</a>
                            &nbsp;·&nbsp;
                            <a href="${SITIO}" style="color:${C.negro};font-weight:700;">franszdev.com</a>
                        </p>
                    </td>
                </tr>
            </table>`,
        pie: 'Te llegó este mail porque alguien usó esta dirección en el formulario de franszdev.com. Si no fuiste vos, podés ignorarlo.',
    });
};
