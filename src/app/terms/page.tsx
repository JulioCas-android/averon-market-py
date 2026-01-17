'use client';

import { useState, useEffect } from 'react';

export default function TermsPage() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">TÉRMINOS Y CONDICIONES DE SERVICIO</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: {date}</p>
      
      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <p>El presente documento regula el acceso, navegación y uso del sitio web de Averon Market PY (en adelante, “la Empresa”), así como las transacciones realizadas a través de la plataforma. Al acceder o utilizar este sitio, el usuario declara haber leído, comprendido y aceptado íntegramente estos Términos y Condiciones.</p>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">1. Identificación del proveedor</h2>
          <p>Averon Market PY es una tienda online dedicada a la comercialización de productos tecnológicos, accesorios, artículos para el hogar y bienes de uso cotidiano, operando conforme a las leyes de la República del Paraguay.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">2. Capacidad legal del usuario</h2>
          <p>Los servicios ofrecidos están disponibles únicamente para personas con capacidad legal para contratar conforme al Código Civil Paraguayo. Quienes no reúnan esta condición deberán abstenerse de utilizar el sitio.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">3. Uso de la plataforma</h2>
          <p>El usuario se compromete a utilizar el sitio de manera lícita, responsable y conforme a la legislación vigente, absteniéndose de realizar actos que puedan dañar, inutilizar o sobrecargar la plataforma o afectar derechos de terceros.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">4. Registro y veracidad de la información</h2>
          <p>El usuario garantiza que la información proporcionada es exacta, completa y actualizada. La Empresa no será responsable por perjuicios derivados de datos incorrectos suministrados por el usuario.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">5. Productos, precios y disponibilidad</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Todos los precios se expresan en Guaraní Paraguayo (Gs.).</li>
            <li>La Empresa se reserva el derecho de modificar precios, promociones, productos y disponibilidad sin previo aviso, conforme a la normativa vigente.</li>
            <li>Las imágenes de los productos son referenciales y pueden diferir levemente del producto final.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">6. Formación del consentimiento contractual</h2>
          <p>El contrato de compraventa se perfecciona cuando el usuario confirma el pedido y:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>El pago en línea es aprobado, o</li>
            <li>El pedido es aceptado para modalidad de pago contra entrega.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">7. Medios de pago</h2>
          <p>La plataforma ofrece:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Pago en línea, a través de medios electrónicos habilitados.</li>
            <li>Pago contra entrega, en efectivo u otros medios acordados.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">8. Envíos y entrega</h2>
          <p>La Empresa realizará entregas en las zonas habilitadas, dentro de los plazos informados al momento de la compra. El usuario deberá proporcionar una dirección válida y estar disponible para la recepción.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">9. Derecho de retracto y cancelaciones</h2>
          <p>El usuario podrá cancelar su pedido antes del despacho. Una vez enviado, regirá lo dispuesto en la Política de Devoluciones, conforme a la Ley N.º 1334/98 de Defensa del Consumidor.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">10. Responsabilidad</h2>
          <p>La Empresa no será responsable por:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Daños derivados del uso indebido o no autorizado de los productos.</li>
            <li>Fallas técnicas temporales ajenas a su control razonable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">11. Modificaciones</h2>
          <p>La Empresa podrá modificar estos Términos en cualquier momento, publicando la versión actualizada en el sitio. Las modificaciones entrarán en vigor desde su publicación.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">12. Legislación y jurisdicción</h2>
          <p>Estos Términos se rigen por las leyes de la República del Paraguay. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de Asunción.</p>
        </section>
      </div>
    </div>
  );
}
