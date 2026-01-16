export default function PrivacyPage() {
  const date = new Date().toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">POLÍTICA DE PRIVACIDAD</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: {date}</p>
      
      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <p>Averon Market PY se compromete a proteger la privacidad y los datos personales de sus usuarios, conforme a la Constitución Nacional, la Ley N.º 1682/01 y sus modificatorias, así como demás normas aplicables en la República del Paraguay.</p>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">1. Datos personales recolectados</h2>
          <p>Podrán ser recolectados:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Datos identificatorios y de contacto.</li>
            <li>Información necesaria para la facturación, envío y gestión de pedidos.</li>
            <li>Datos técnicos vinculados al uso del sitio.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">2. Finalidad del tratamiento</h2>
          <p>Los datos personales serán utilizados exclusivamente para:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Procesar compras y gestionar pedidos.</li>
            <li>Realizar entregas y comunicaciones vinculadas al servicio.</li>
            <li>Cumplir obligaciones legales y contractuales.</li>
            <li>Enviar información comercial, cuando el usuario lo autorice expresamente.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">3. Base legal</h2>
          <p>El tratamiento de datos se basa en el consentimiento del titular, en la ejecución de un contrato y en el cumplimiento de obligaciones legales, conforme a la normativa paraguaya.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">4. Confidencialidad y seguridad</h2>
          <p>La Empresa adopta medidas técnicas, organizativas y administrativas razonables para garantizar la seguridad, confidencialidad e integridad de los datos personales.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">5. Cesión de datos</h2>
          <p>Los datos personales no serán cedidos a terceros, salvo cuando sea necesario para:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Procesar pagos.</li>
            <li>Realizar envíos.</li>
            <li>Cumplir obligaciones legales o requerimientos de autoridad competente.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">6. Derechos del titular de los datos</h2>
          <p>El usuario podrá ejercer los derechos de:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Acceso.</li>
            <li>Rectificación.</li>
            <li>Actualización.</li>
            <li>Supresión.</li>
            <li>Oposición.</li>
          </ul>
          <p className="mt-4">Para ello, deberá contactar a la Empresa a través de los canales oficiales.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">7. Conservación de los datos</h2>
          <p>Los datos serán conservados únicamente durante el tiempo necesario para cumplir con las finalidades para las cuales fueron recolectados, salvo obligación legal en contrario.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">8. Modificaciones</h2>
          <p>La Empresa podrá modificar esta Política de Privacidad, publicando la versión actualizada en el sitio.</p>
        </section>
      </div>
    </div>
  );
}
