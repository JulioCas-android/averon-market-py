
import Image from 'next/image';
import { Building, Target, Users } from 'lucide-react';
import { heroImage } from '@/lib/placeholder-images';

export default function AboutUsPage() {
  return (
    <div className="bg-background">
      <section className="relative w-full h-[40vh] min-h-[300px] text-white">
        <Image
          src={heroImage.imageUrl}
          alt="Abstract background"
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Sobre AVERON Market PY</h1>
          <p className="text-lg md:text-xl max-w-2xl mt-4">Conoce nuestra historia y compromiso.</p>
        </div>
      </section>

      <section className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Nuestra Historia</h2>
          <p className="text-muted-foreground leading-relaxed">
            AVERON Market PY nació de la pasión por la tecnología y el deseo de hacerla accesible para todos en Paraguay. Fundada en 2024, nuestra misión es ofrecer una cuidada selección de productos que combinan innovación, calidad y buen precio. Creemos que la tecnología debe simplificar la vida, y por eso nos esforzamos en brindar una experiencia de compra cómoda, segura y con un servicio al cliente excepcional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mt-16">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
              <Building className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nuestra Misión</h3>
            <p className="text-muted-foreground">Facilitar el acceso a la tecnología y productos de calidad, mejorando la vida diaria de nuestros clientes con comodidad y confianza.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nuestra Visión</h3>
            <p className="text-muted-foreground">Ser la tienda en línea líder en Paraguay, reconocida por nuestra innovación, la calidad de nuestros productos y la excelencia en el servicio al cliente.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nuestros Valores</h3>
            <p className="text-muted-foreground">Compromiso, calidad, innovación, confianza y orientación al cliente son los pilares que guían cada una de nuestras acciones.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
