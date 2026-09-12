import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const to = body.to;
    const message = body.message;

    if (!to || !message) {
      return NextResponse.json({ error: "Numéro et message requis." }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      return NextResponse.json(
        {
          error:
            "Configuration SMS incomplète. Ajoute TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER dans les variables d’environnement.",
        },
        { status: 500 }
      );
    }

    const bodyForm = new URLSearchParams({
      To: to,
      From: from,
      Body: message,
    });

    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyForm.toString(),
    });

    const raw = await twilioResponse.text();

    if (!twilioResponse.ok) {
      return NextResponse.json(
        {
          error: `Erreur Twilio: ${raw}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, response: raw });
  } catch (error) {
    console.error("Erreur envoi SMS", error);
    return NextResponse.json({ error: "Erreur serveur lors de l’envoi SMS." }, { status: 500 });
  }
}
