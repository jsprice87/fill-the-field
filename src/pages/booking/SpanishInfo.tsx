
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const SpanishInfo: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-2xl">SOCCER STARS - INFORMACIÓN EN ESPAÑOL</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-agrandir text-3xl text-brand-navy mb-8">
            Información Importante
          </h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 text-left">
            <p className="font-poppins text-lg mb-4">
              <strong>Todas las clases se imparten completamente en inglés.</strong>
            </p>
            <p className="font-poppins text-gray-700 mb-4">
              Nuestros entrenadores utilizan el inglés para todas las instrucciones, 
              explicaciones y comunicación durante las clases. Para que su hijo tenga 
              la mejor experiencia posible, recomendamos que tenga un nivel básico de 
              comprensión del inglés.
            </p>
            <p className="font-poppins text-gray-700">
              Cuando esté listo para continuar con el registro, puede volver a intentarlo.
            </p>
          </div>
          
          <Link 
            to={`/${franchiseeId}/free-trial`}
            className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins font-semibold px-8 py-3 rounded-lg inline-block"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpanishInfo;
