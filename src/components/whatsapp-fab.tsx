'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MessageSquare, Phone } from 'lucide-react';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.77.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2M7.49 17.38c-.14-.24-.49-.39-.99-.68-.5-.29-2.98-1.46-3.44-1.63s-.79-.24-.79.24c0 .49.79 1.63.94 1.82.15.19 1.63 2.59 3.96 3.5.59.24.94.39 1.27.49.59.19 1.13.16 1.56.1.48-.07 1.49-.61 1.71-1.21.22-.59.22-1.11.15-1.21-.07-.1-.22-.16-.47-.29zm6.6-1.49c-.2-.35-.4-.4-.57-.4-.17 0-.36.01-.52.01-.33 0-.66.09-.96.39-.3.3-.99 1.13-.99 2.18s1.02 2.52 1.17 2.69c.15.17 2.01 3.2 4.88 4.25.68.27 1.22.43 1.64.56.66.19 1.26.16 1.71.1.5-.07 1.52-.62 1.74-1.22.23-.6.23-1.12.16-1.22-.07-.1-.23-.16-.48-.28s-1.52-.75-1.75-.83c-.23-.08-.39-.13-.56.13-.17.26-.66.83-.81.99-.15.16-.29.18-.54.06-.25-.12-1.07-.39-2.04-1.26-.76-.66-1.27-1.47-1.42-1.72s-.02-.38.11-.51c.12-.11.26-.29.39-.43.13-.14.18-.23.28-.39.09-.15.05-.29-.02-.41s-.56-1.35-.77-1.84c-.2-.5-.41-.43-.56-.43-.14 0-.3 0-.45 0z"/>
    </svg>
);

const predefinedMessages = [
    { id: 'buy', text: 'Hola 👋, estoy interesado/a en comprar un producto que vi en su página web. ¿Me podrían ayudar?' },
    { id: 'offers', text: 'Hola 👋, vi sus ofertas en la web de Averon Market PY y quisiera conocer precios y disponibilidad.' },
    { id: 'payment', text: 'Hola 👋, quisiera consultar sobre métodos de pago y opciones de entrega. Vengo desde su página web.' },
    { id: 'advice', text: 'Hola 👋, necesito asesoramiento sobre un producto tecnológico que vi en su tienda online. ¿Me ayudan, por favor?' },
    { id: 'coordinate', text: 'Hola 👋, quiero realizar una compra desde su tienda online y coordinar el pago y la entrega.' },
];

export function WhatsAppFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '595986230534';

  const handleMessageClick = (message: string) => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
            <Button
                variant="default"
                className="fixed bottom-6 right-6 z-50 rounded-full h-16 w-16 bg-[#25D366] hover:bg-[#128C7E] shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                aria-label="Contactar por WhatsApp"
            >
                 <WhatsAppIcon className="h-8 w-8 text-white" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 mr-4 mb-2 p-0 border-0 bg-transparent shadow-none" side="top" align="end">
           <div className="bg-card rounded-xl shadow-2xl border">
             <div className="bg-muted p-4 rounded-t-xl">
                <h3 className="font-semibold text-center">¡Chatea con nosotros!</h3>
                <p className="text-sm text-muted-foreground text-center">Elige un mensaje para empezar</p>
            </div>
            <div className="p-2 space-y-1">
                {predefinedMessages.map((msg) => (
                    <Button
                        key={msg.id}
                        variant="ghost"
                        className="w-full justify-start h-auto text-wrap text-left"
                        onClick={() => handleMessageClick(msg.text)}
                    >
                        <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span>{msg.text}</span>
                    </Button>
                ))}
                 <Button
                    variant="ghost"
                    className="w-full justify-start h-auto"
                    asChild
                 >
                    <a href={`tel:+${phoneNumber}`}>
                        <Phone className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span>Prefiero llamar</span>
                    </a>
                </Button>
            </div>
           </div>
        </PopoverContent>
    </Popover>
  );
}
