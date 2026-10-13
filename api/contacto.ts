import { Resend } from 'resend';
import { aviso, confirmacion } from './_emails.js';

// Sin comillas, <>, comas ni ; para que no rompa el replyTo
const EMAIL_VALIDO = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;
const DESTINO = 'franszdev.web@gmail.com';

const texto = (valor: unknown, max: number) =>
    typeof valor === 'string' ? valor.trim().slice(0, max) : '';

// El nombre va al asunto y al replyTo: un salto de línea o un <> ahí hace que
// Resend rechace el envío aunque el resto esté bien.
const unaLinea = (valor: string) =>
    valor.replace(/[\r\n\t]+/g, ' ').replace(/["<>]/g, '').trim();

// Un navegador siempre manda Origin en un POST: así otro sitio no puede usar
// el endpoint desde su página. Un script puede falsificarlo, no es anti-bots.
const mismoOrigen = (request: Request) => {
    const origen = request.headers.get('origin');
    if (!origen) return false;
    try {
        return new URL(origen).host === request.headers.get('host');
    } catch {
        return false;
    }
};

// Turnstile responde si el token lo generó una persona en este sitio. Cada
// token sirve una sola vez, por eso el form pide uno nuevo después de enviar.
const esHumano = async (token: string, secreto: string, ip: string | null) => {
    const cuerpo = new URLSearchParams({ secret: secreto, response: token });
    if (ip) cuerpo.set('remoteip', ip);

    try {
        const res = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            { method: 'POST', body: cuerpo, signal: AbortSignal.timeout(5000) }
        );
        const { success } = (await res.json()) as { success?: boolean };
        return success === true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export async function POST(request: Request) {
    if (!mismoOrigen(request)) {
        return Response.json({ error: 'Origen no permitido' }, { status: 403 });
    }

    let datos: Record<string, unknown>;
    try {
        datos = await request.json();
    } catch {
        return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // El campo trampa solo lo completan los bots: se responde ok sin enviar
    if (datos['sitio-web']) return Response.json({ ok: true });

    const nombre = unaLinea(texto(datos.nombre, 100));
    const email = texto(datos.email, 200);
    const mensaje = texto(datos.mensaje, 5000);

    if (!nombre || !mensaje || !EMAIL_VALIDO.test(email)) {
        return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const clave = process.env.RESEND_API_KEY;
    // En local el form usa la clave de prueba, así que acá también. Vercel
    // enruta por host: un pedido con host localhost nunca llega a producción.
    const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(
        request.headers.get('host') ?? ''
    );
    const secreto = local
        ? '1x0000000000000000000000000000000AA'
        : process.env.TURNSTILE_SECRET_KEY;
    if (!clave || !secreto) {
        console.error('Falta RESEND_API_KEY o TURNSTILE_SECRET_KEY');
        return Response.json({ error: 'No se pudo enviar' }, { status: 500 });
    }

    const token = texto(datos.turnstile, 2048);
    const ip = request.headers.get('x-real-ip');
    if (!token || !(await esHumano(token, secreto, ip))) {
        return Response.json({ error: 'Verificación fallida' }, { status: 403 });
    }

    const resend = new Resend(clave);

    // Resend no tira excepción si falla el envío: devuelve el error
    const { error } = await resend.emails.send({
        from: 'Portfolio <contacto@franszdev.com>',
        to: DESTINO,
        replyTo: `"${nombre}" <${email}>`,
        subject: `Nuevo mensaje de ${nombre}`,
        html: aviso({ nombre, email, mensaje }),
        text: `Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`,
    });

    if (error) {
        console.error(error);
        return Response.json({ error: 'No se pudo enviar' }, { status: 500 });
    }

    // El mensaje ya llegó: si falla la confirmación no se le avisa error al
    // usuario, solo queda en el log.
    const { error: errorConfirmacion } = await resend.emails.send({
        from: 'Francisco Jarusz <contacto@franszdev.com>',
        to: email,
        replyTo: DESTINO,
        subject: 'Recibí tu mensaje',
        html: confirmacion({ nombre }),
        text: `¡Gracias, ${nombre.split(' ')[0]}!\n\nRecibí tu mensaje y te respondo a la brevedad. Si querés sumar algo más, respondé este mail y me llega directo.\n\nFrancisco Jarusz\nDesarrollador web & diseñador UX/UI\nhttps://franszdev.com`,
    });

    if (errorConfirmacion) console.error(errorConfirmacion);

    return Response.json({ ok: true });
}
