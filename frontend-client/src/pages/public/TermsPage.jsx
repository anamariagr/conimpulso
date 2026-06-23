export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primary mb-2">Términos y Condiciones</h1>
      <p className="text-text-secondary text-sm mb-10">Última actualización: junio de 2025</p>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">1. Aceptación</h2>
          <p className="text-text-secondary leading-relaxed">
            Al acceder y usar <strong>ConImpulso</strong> (<a href="https://conimpulso.com" className="text-accent hover:underline">conimpulso.com</a>),
            aceptas estos Términos y Condiciones. Si no estás de acuerdo, por favor no uses la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">2. Descripción del servicio</h2>
          <p className="text-text-secondary leading-relaxed">
            ConImpulso es una plataforma marketplace que conecta productores, fabricantes, artesanos y
            emprendedores con compradores directos. Ofrecemos herramientas para publicar productos y
            servicios, gestionar tiendas, comunicarse con clientes y procesar transacciones.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">3. Registro y cuenta</h2>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Debes tener al menos 18 años para registrarte.</li>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>Debes proporcionar información veraz y actualizada.</li>
            <li>Puedes registrarte con tu cuenta de Google; en ese caso aplican también los <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-accent hover:underline">Términos de Google</a>.</li>
            <li>Una persona puede tener una sola cuenta personal.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">4. Uso permitido</h2>
          <p className="text-text-secondary leading-relaxed mb-3">Está permitido:</p>
          <ul className="list-disc list-inside space-y-1 text-text-secondary mb-4">
            <li>Publicar productos y servicios reales que puedas entregar.</li>
            <li>Comprar y vender de manera honesta y transparente.</li>
            <li>Comunicarte con otros usuarios de forma respetuosa.</li>
          </ul>
          <p className="text-text-secondary leading-relaxed mb-3">Está prohibido:</p>
          <ul className="list-disc list-inside space-y-1 text-text-secondary">
            <li>Publicar contenido falso, engañoso o fraudulento.</li>
            <li>Vender productos ilegales, falsificados o peligrosos.</li>
            <li>Usar la plataforma para spam, phishing o estafas.</li>
            <li>Intentar acceder a cuentas o sistemas de otros usuarios sin autorización.</li>
            <li>Compartir información de contacto fuera de los canales habilitados para evadir comisiones.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">5. Publicación de productos</h2>
          <p className="text-text-secondary leading-relaxed">
            El vendedor es responsable de la exactitud de la información de sus productos (precio,
            descripción, imágenes, disponibilidad). ConImpulso se reserva el derecho de eliminar
            publicaciones que violen estas condiciones sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">6. Transacciones y pagos</h2>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Las transacciones se realizan a través de la billetera virtual de la plataforma.</li>
            <li>ConImpulso puede cobrar una comisión por transacciones completadas, indicada en el plan de membresía.</li>
            <li>Los reembolsos están sujetos a la política de cada vendedor y a la resolución de disputas de ConImpulso.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">7. Propiedad intelectual</h2>
          <p className="text-text-secondary leading-relaxed">
            El contenido que publicas (fotos, descripciones, logos) debe ser de tu propiedad o contar
            con licencia para usarlo. Al publicarlo en ConImpulso, nos otorgas una licencia no exclusiva
            para mostrarlo en la plataforma. ConImpulso y su marca son propiedad de sus creadores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">8. Suspensión y eliminación</h2>
          <p className="text-text-secondary leading-relaxed">
            Podemos suspender o eliminar cuentas que violen estos términos, realicen actividades
            fraudulentas o generen disputas reiteradas. El usuario puede eliminar su cuenta en cualquier
            momento desde la configuración de su perfil.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">9. Limitación de responsabilidad</h2>
          <p className="text-text-secondary leading-relaxed">
            ConImpulso actúa como intermediario entre compradores y vendedores. No somos responsables
            por: la calidad de los productos entregados, disputas entre usuarios, o pérdidas derivadas
            del uso de la plataforma más allá de lo establecido por la ley aplicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">10. Modificaciones</h2>
          <p className="text-text-secondary leading-relaxed">
            Podemos modificar estos términos en cualquier momento. Los cambios significativos se
            notificarán con al menos 15 días de anticipación. El uso continuado de la plataforma
            implica aceptación de los términos actualizados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">11. Ley aplicable</h2>
          <p className="text-text-secondary leading-relaxed">
            Estos términos se rigen por las leyes de Colombia. Cualquier disputa se resolverá
            ante los tribunales competentes de Colombia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">12. Contacto</h2>
          <p className="text-text-secondary leading-relaxed">
            Para consultas sobre estos términos:{' '}
            <a href="mailto:informacion@cristiangarcia.co" className="text-accent hover:underline">
              informacion@cristiangarcia.co
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
