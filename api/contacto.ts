import { Resend } from 'resend';
import { aviso, confirmacion } from './_emails.js';

const EMAIL_VALIDO = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;
const DESTINO = 'franszdev.web@gmail.com';

const texto = (valor: unknown, max: number) =>
    typeof valor === 'string' ? valor.trim().slice(0, max) : '';

const unaLinea = (valor: string) =>
    valor.replace(/[\r\n\t]+/g, ' ').replace(/["<>]/g, '').trim();

const mismoOrigen = (request: Request) => {
    const origen = request.headers.get('origin');
    if (!origen) return false;
    try {
        return new URL(origen).host === request.headers.get('host');
    } catch {
        return false;
    }
};

const VENTANA = 10 * 60 * 1000;
const MAXIMO = 3;
const intentos = new Map<string, number[]>();

const limitado = (clave: string) => {
    const ahora = Date.now();
    const recientes = (intentos.get(clave) ?? []).filter(
        (momento) => ahora - momento < VENTANA
    );

    if (recientes.length >= MAXIMO) {
        intentos.set(clave, recientes);
        return true;
    }

    recientes.push(ahora);
    intentos.set(clave, recientes);

    if (intentos.size > 1000) {
        for (const [otra, momentos] of intentos) {
            if (momentos.every((momento) => ahora - momento >= VENTANA))
                intentos.delete(otra);
        }
    }

    return false;
};

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

    if (datos['sitio-web']) return Response.json({ ok: true });

    const nombre = unaLinea(texto(datos.nombre, 100));
    const email = texto(datos.email, 200);
    const mensaje = texto(datos.mensaje, 5000);

    if (!nombre || !mensaje || !EMAIL_VALIDO.test(email)) {
        return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const clave = process.env.RESEND_API_KEY;
    const entorno = process.env.VERCEL_ENV;
    const local = !entorno || entorno === 'development';
    const secreto = local
        ? '1x0000000000000000000000000000000AA'
        : process.env.TURNSTILE_SECRET_KEY;
    if (!clave || !secreto) {
        console.error('Falta RESEND_API_KEY o TURNSTILE_SECRET_KEY');
        return Response.json({ error: 'No se pudo enviar' }, { status: 500 });
    }

    const ip = request.headers.get('x-real-ip');
    if (
        (ip && limitado(`ip:${ip}`)) ||
        limitado(`email:${email.toLowerCase()}`)
    ) {
        return Response.json({ error: 'Demasiados envíos' }, { status: 429 });
    }

    const token = texto(datos.turnstile, 2048);
    if (!token || !(await esHumano(token, secreto, ip))) {
        return Response.json({ error: 'Verificación fallida' }, { status: 403 });
    }

    const resend = new Resend(clave);

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

    const { error: errorConfirmacion } = await resend.emails.send({
        from: 'Francisco Jarusz <contacto@franszdev.com>',
        to: email,
        replyTo: DESTINO,
        subject: 'Recibí tu mensaje',
        html: confirmacion({ nombre }),
        text: `¡Gracias, ${nombre.split(' ')[0].slice(0, 30)}!\n\nRecibí tu mensaje y te respondo a la brevedad. Si querés sumar algo más, respondé este mail y me llega directo.\n\nFrancisco Jarusz\nDesarrollador web & diseñador UX/UI\nhttps://franszdev.com`,
    });

    if (errorConfirmacion) console.error(errorConfirmacion);

    return Response.json({ ok: true });
}
