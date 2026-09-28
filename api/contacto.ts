import nodemailer from 'nodemailer';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const transporte = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const texto = (valor: unknown, max: number) =>
    typeof valor === 'string' ? valor.trim().slice(0, max) : '';

export async function POST(request: Request) {
    let datos: Record<string, unknown>;
    try {
        datos = await request.json();
    } catch {
        return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // El campo trampa solo lo completan los bots: se responde ok sin enviar
    if (datos['sitio-web']) return Response.json({ ok: true });

    const nombre = texto(datos.nombre, 100);
    const email = texto(datos.email, 200);
    const mensaje = texto(datos.mensaje, 5000);

    if (!nombre || !mensaje || !EMAIL_VALIDO.test(email)) {
        return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    try {
        await transporte.sendMail({
            from: `"Portfolio" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: `"${nombre.replace(/"/g, '')}" <${email}>`,
            subject: `Nuevo mensaje de ${nombre}`,
            text: `Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`,
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'No se pudo enviar' }, { status: 500 });
    }

    return Response.json({ ok: true });
}
