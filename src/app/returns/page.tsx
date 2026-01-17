
'use client';

import { useState, useEffect } from 'react';

export default function ReturnsPage() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">POLÍTICA DE DEVOLUCIONES Y REEMBOLSOS</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: {date}</p>

      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <p>Esta política se establece conforme a la Ley N.º 1334/98 de Defensa del Consumidor y demás disposiciones aplicables en la República del Paraguay.</p>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">1. Derecho de devolución</h2>
          <p>El consumidor podrá solicitar la devolución del producto dentro de un plazo de 7 (siete) días corridos contados desde la recepción, siempre que se cumplan las condiciones establecidas.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">2. Condiciones para la devolución</h2>
          <p>El producto deberá:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Encontrarse sin uso.</li>
            <li>Conservar su embalaje original.</li>
            <li>Incluir todos sus accesorios, manuales y etiquetas.</li>
            <li>No presentar daños ni signos de manipulación indebida.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">3. Exclusiones</h2>
          <p>No se aceptarán devoluciones de:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Productos personalizados o hechos a medida.</li>
            <li>Productos dañados por mal uso.</li>
            <li>Productos incompletos o sin su empaque original.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">4. Procedimiento</h2>
          <p>El consumidor deberá:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Contactar a la Empresa por los canales oficiales.</li>
            <li>Informar número de pedido y motivo de la devolución.</li>
            <li>Seguir las instrucciones de envío proporcionadas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">5. Reembolsos</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Los reembolsos se efectuarán por el mismo medio de pago utilizado.</li>
            <li>En el caso de pago contra entrega, se coordinará el reembolso por transferencia u otro medio acordado.</li>
            <li>El plazo máximo para el reembolso será de 7 (siete) días hábiles desde la aprobación de la devolución.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-3">6. Costos de envío</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Si la devolución obedece a un error de la Empresa o defecto del producto, los costos serán asumidos por la Empresa.</li>
            <li>En otros casos, los costos correrán por cuenta del consumidor.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
