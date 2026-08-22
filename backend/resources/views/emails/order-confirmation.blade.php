<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Compra confirmada</title>
</head>
<body style="margin:0; padding:0; background-color:#FAFAFA; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFA; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color:#ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eee;">
                    <tr>
                        <td style="background-color:#0A0A0A; padding: 24px 32px;">
                            <span style="color:#FFD700; font-weight: 700; font-size: 20px;">{{ \App\Services\SiteSettings::get('site_name', config('app.name')) }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px;">
                            <h1 style="font-size: 22px; color:#0A0A0A; margin: 0 0 8px;">¡Tu compra fue exitosa!</h1>
                            <p style="color:#555; font-size: 15px; line-height: 1.5; margin: 0 0 24px;">
                                Ya estamos alistando tu pedido. Te contactaremos para coordinar la entrega.
                            </p>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFA; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                                @foreach ($orders as $order)
                                <tr>
                                    <td style="padding: 8px 16px; font-size: 14px; color:#0A0A0A;">{{ $order->product->name }} <span style="color:#999;">x{{ $order->quantity }}</span></td>
                                    <td style="padding: 8px 16px; font-size: 14px; color:#0A0A0A; font-weight: 600; text-align: right; white-space: nowrap;">${{ number_format((float) $order->total_amount, 0, ',', '.') }}</td>
                                </tr>
                                @endforeach
                            </table>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFA; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 8px 16px; font-size: 14px; color:#777;">Total</td>
                                    <td style="padding: 8px 16px; font-size: 14px; color:#0A0A0A; font-weight: 600; text-align: right;">${{ number_format((float) $total, 0, ',', '.') }} COP</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 16px; font-size: 14px; color:#777;">Método de pago</td>
                                    <td style="padding: 8px 16px; font-size: 14px; color:#0A0A0A; font-weight: 600; text-align: right;">
                                        {{ $paymentMethod === 'wompi' ? 'Wompi' : ($paymentMethod === 'cod' ? 'Pago en casa' : 'Coordinado con el vendedor') }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 16px; font-size: 14px; color:#777;">Referencia</td>
                                    <td style="padding: 8px 16px; font-size: 14px; color:#0A0A0A; font-weight: 600; text-align: right;">{{ $reference }}</td>
                                </tr>
                            </table>

                            <p style="color:#999; font-size: 12px; line-height: 1.5; margin: 0;">
                                Si tienes alguna pregunta sobre tu pedido, respóndenos a través de la sección de Mensajes en tu cuenta.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
