export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primary mb-2">Política de Privacidad</h1>
      <p className="text-text-secondary text-sm mb-10">Última actualización: junio de 2025</p>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">1. Responsable del tratamiento</h2>
          <p className="text-text-secondary leading-relaxed">
            <strong>ConImpulso</strong> (en adelante "la Plataforma"), operada por Cristian García, con correo de contacto{' '}
            <a href="mailto:informacion@cristiangarcia.co" className="text-accent hover:underline">informacion@cristiangarcia.co</a>,
            es responsable del tratamiento de los datos personales recopilados a través de{' '}
            <a href="https://conimpulso.com" className="text-accent hover:underline">conimpulso.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">2. Datos que recopilamos</h2>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li><strong>Datos de registro:</strong> nombre, correo electrónico, teléfono y contraseña.</li>
            <li><strong>Datos de perfil:</strong> foto de perfil, descripción, ubicación, redes sociales.</li>
            <li><strong>Datos de Google:</strong> cuando usas "Iniciar sesión con Google" recibimos tu nombre, correo y foto de perfil de tu cuenta Google.</li>
            <li><strong>Datos de uso:</strong> páginas visitadas, búsquedas realizadas, productos vistos.</li>
            <li><strong>Datos de transacción:</strong> historial de compras, ventas, recargas de billetera.</li>
            <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">3. Finalidad del tratamiento</h2>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Crear y gestionar tu cuenta de usuario.</li>
            <li>Facilitar la compra y venta de productos y servicios entre usuarios.</li>
            <li>Procesar pagos y recargas de billetera virtual.</li>
            <li>Enviar notificaciones relacionadas con tu actividad en la plataforma.</li>
            <li>Mejorar nuestros servicios mediante análisis de uso.</li>
            <li>Cumplir con obligaciones legales aplicables.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">4. Base legal del tratamiento</h2>
          <p className="text-text-secondary leading-relaxed">
            El tratamiento de tus datos se basa en: (a) la ejecución del contrato de uso de la plataforma
            que aceptas al registrarte, (b) tu consentimiento expreso cuando aplique, y (c) el interés
            legítimo de ConImpulso en mejorar sus servicios.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">5. Compartición de datos</h2>
          <p className="text-text-secondary leading-relaxed mb-3">
            No vendemos tus datos personales. Podemos compartirlos únicamente con:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li><strong>Otros usuarios:</strong> la información de tu tienda y perfil público es visible para compradores.</li>
            <li><strong>Proveedores de servicios:</strong> plataformas de pago, servicios de correo, infraestructura cloud, bajo acuerdo de confidencialidad.</li>
            <li><strong>Google:</strong> utilizamos Google Sign-In; los datos que Google nos entrega (nombre, email, foto) se rigen también por la <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-accent hover:underline">Política de Privacidad de Google</a>.</li>
            <li><strong>Autoridades:</strong> cuando sea requerido por ley o resolución judicial.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">6. Retención de datos</h2>
          <p className="text-text-secondary leading-relaxed">
            Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, tus datos
            personales se borran en un plazo máximo de 30 días, excepto aquellos que debamos conservar
            por obligaciones legales (registros de transacciones financieras: hasta 5 años).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">7. Tus derechos</h2>
          <p className="text-text-secondary leading-relaxed mb-3">Tienes derecho a:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li><strong>Acceso:</strong> solicitar una copia de tus datos personales.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos desde tu perfil o contactándonos.</li>
            <li><strong>Eliminación:</strong> solicitar el borrado de tu cuenta y datos.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado (CSV/JSON).</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
          </ul>
          <p className="text-text-secondary mt-3">
            Ejerce tus derechos escribiendo a{' '}
            <a href="mailto:informacion@cristiangarcia.co" className="text-accent hover:underline">informacion@cristiangarcia.co</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">8. Seguridad</h2>
          <p className="text-text-secondary leading-relaxed">
            Implementamos medidas técnicas y organizativas para proteger tus datos: cifrado HTTPS,
            tokens de autenticación seguros, acceso restringido a bases de datos y auditoría de actividad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">9. Cookies</h2>
          <p className="text-text-secondary leading-relaxed">
            Usamos cookies esenciales para el funcionamiento de la sesión. No usamos cookies de
            seguimiento de terceros para publicidad externa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">10. Cambios a esta política</h2>
          <p className="text-text-secondary leading-relaxed">
            Podemos actualizar esta política ocasionalmente. Te notificaremos por correo electrónico
            o mediante un aviso en la plataforma ante cambios relevantes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">11. Contacto</h2>
          <p className="text-text-secondary leading-relaxed">
            Para cualquier consulta sobre esta política de privacidad, contáctanos en:{' '}
            <a href="mailto:informacion@cristiangarcia.co" className="text-accent hover:underline">
              informacion@cristiangarcia.co
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
