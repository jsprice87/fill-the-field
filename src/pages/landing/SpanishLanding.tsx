
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const SpanishLanding: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Soccer Stars</h1>
          <nav className="hidden md:flex space-x-4">
            <Link to={`/${franchiseeId}/landing-page`} className="hover:underline">Inicio</Link>
            <Link to={`/${franchiseeId}/landing-page/find-classes`} className="hover:underline">Buscar Clases</Link>
            <Link to={`/${franchiseeId}/landing-page/contact-us`} className="hover:underline">Contacto</Link>
            <Link to={`/${franchiseeId}/landing-page`} className="hover:underline">English</Link>
          </nav>
          <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="bg-white text-indigo-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">
            Reservar Ahora
          </Link>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="bg-indigo-500 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">¡Aprenda Fútbol con las Estrellas!</h2>
            <p className="text-xl mb-8">Clases de fútbol divertidas y atractivas para niños de todas las edades.</p>
            <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition text-lg">
              Inscríbete en una Clase
            </Link>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nuestros Programas</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-3">Fútbol para Niños Pequeños</h3>
                <p className="text-gray-600 mb-4">Introducción a los conceptos básicos de fútbol para edades de 2-4 años. Enfoque en habilidades motoras y diversión.</p>
                <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="text-indigo-600 hover:underline">Más información</Link>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-3">Desarrollo Juvenil</h3>
                <p className="text-gray-600 mb-4">Programa de desarrollo de habilidades para edades de 5-8 años. Enfoque en técnica y trabajo en equipo.</p>
                <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="text-indigo-600 hover:underline">Más información</Link>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-3">Entrenamiento Avanzado</h3>
                <p className="text-gray-600 mb-4">Entrenamiento competitivo para edades de 9-14 años. Estrategia y habilidades avanzadas.</p>
                <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="text-indigo-600 hover:underline">Más información</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-bold mb-2">Soccer Stars</h3>
              <p className="text-gray-300">Haciendo que el fútbol sea divertido para los niños desde 2005</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Enlaces Rápidos</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/${franchiseeId}/landing-page`} className="text-gray-300 hover:text-white">Inicio</Link>
                <Link to={`/${franchiseeId}/landing-page/find-classes`} className="text-gray-300 hover:text-white">Buscar Clases</Link>
                <Link to={`/${franchiseeId}/landing-page/contact-us`} className="text-gray-300 hover:text-white">Contacto</Link>
                <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="text-gray-300 hover:text-white">Reservar una Clase</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Soccer Stars. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SpanishLanding;
