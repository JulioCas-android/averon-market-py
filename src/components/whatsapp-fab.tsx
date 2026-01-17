"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const PHONE = "595986230534";

const MESSAGES = [
  "Hola 👋, vengo desde la web de Averon Market PY y quiero más información sobre sus productos.",
  "Hola 👋, estoy interesado/a en comprar un producto que vi en su página web. ¿Me podrían ayudar?",
  "Hola 👋, vi sus ofertas en la web de Averon Market PY y quisiera conocer precios y disponibilidad.",
  "Hola 👋, quisiera consultar sobre métodos de pago y opciones de entrega. Vengo desde su página web.",
  "Hola 👋, necesito asesoramiento sobre un producto tecnológico que vi en su tienda online. ¿Me ayudan, por favor?",
  "Hola 👋, quiero realizar una compra desde su tienda online y coordinar el pago y la entrega."
];

export default function WhatsappFab() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 4000);
    }, 20000); // cada 20 segundos

    return () => clearInterval(interval);
  }, []);

  const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          aria-label="Abrir chat de WhatsApp"
          className="
            relative flex items-center justify-center
            w-14 h-14 rounded-full
            bg-[#25D366] text-white
            shadow-lg hover:shadow-xl
            hover:scale-105 active:scale-95
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-green-300
          "
        >
          {/* Radar pulse */}
          {pulse && !open && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
          )}

          {open ? <X className="w-6 h-6 z-10" /> : <MessageCircle className="w-7 h-7 z-10" />}
        </button>
      </div>

      {/* Message Selector */}
      {open && (
        <div
          className="
            fixed bottom-24 right-6 z-50
            w-72 rounded-xl bg-white shadow-2xl
            border border-gray-200
            animate-in fade-in zoom-in duration-200
          "
        >
          <div className="p-4 border-b font-semibold text-gray-800">
            ¿En qué podemos ayudarte?
          </div>
          <div className="p-2 space-y-2">
            {MESSAGES.map((msg, index) => (
              <button
                key={index}
                onClick={() => openWhatsApp(msg)}
                className="
                  w-full text-left p-2 rounded-lg text-sm
                  hover:bg-gray-100 transition
                "
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
