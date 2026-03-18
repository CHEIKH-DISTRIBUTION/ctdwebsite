// src/app/about/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Eye, 
  Heart, 
  Award,
  CheckCircle,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  Truck,
  Star,
  MessageCircle,
  ShoppingCart,
  Home,
  Shirt,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

// Variantes d'animation corrigées
const fadeIn = (direction: string, delay: number): Variants => ({
  hidden: {
    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      delay,
      duration: 1.25,
    },
  },
});

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#001489] to-[#001070] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.1&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center bg-no-repeat opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeIn('up', 0.2)}
              className="inline-flex items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20"
            >
              <Award className="h-5 w-5 mr-2 text-[#FFB500]" />
              <span className="text-sm font-medium">Notre histoire</span>
            </motion.div>
            
            <motion.h1
              variants={fadeIn('up', 0.3)}
              className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
            >
              Qui sommes-<span className="text-[#f9461c]">nous</span>?
            </motion.h1>

            <motion.p
              variants={fadeIn('up', 0.4)}
              className="text-xl mb-4 max-w-2xl mx-auto text-white leading-relaxed font-medium"
            >
              Cheikh Distribution est une entreprise polyvalente sénégalaise spécialisée dans
              la vente, la livraison et la transformation de produits de consommation courante.
            </motion.p>

            <motion.p
              variants={fadeIn('up', 0.45)}
              className="text-base mb-10 max-w-2xl mx-auto text-blue-100 leading-relaxed"
            >
              Nous offrons une large gamme de produits alimentaires, électroménagers, vêtements et
              articles d&apos;hygiène pour satisfaire les besoins des familles, des commerçants et des professionnels à travers tout le Sénégal.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Nos atouts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn('up', 0.1)}
              className="inline-block mb-3"
            >
              <span className="text-[#001489] font-semibold bg-[#001489]/10 px-4 py-2 rounded-full">Nos avantages</span>
            </motion.div>
            <motion.h2
              variants={fadeIn('up', 0.2)}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Nos <span className="text-[#f9461c]">atouts</span>
            </motion.h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <ShoppingCart className="h-10 w-10 text-[#001489]" />,
                title: "Des prix compétitifs",
                description: "Nous offrons les meilleurs prix du marché pour tous nos produits.",
                delay: 0.1
              },
              {
                icon: <Home className="h-10 w-10 text-[#f9461c]" />,
                title: "Packs familiaux",
                description: "Des packs adaptés à chaque budget familial.",
                delay: 0.2
              },
              {
                icon: <Users className="h-10 w-10 text-[#001489]" />,
                title: "Service personnalisé",
                description: "Un accompagnement sur mesure pour chaque client.",
                delay: 0.3
              },
              {
                icon: <Clock className="h-10 w-10 text-[#f9461c]" />,
                title: "Disponibilité 7j/7",
                description: "Sur WhatsApp, Facebook et en boutique.",
                delay: 0.4
              },
              {
                icon: <Zap className="h-10 w-10 text-[#001489]" />,
                title: "Application mobile",
                description: "Commandez facilement depuis votre smartphone.",
                delay: 0.5
              },
              {
                icon: <Truck className="h-10 w-10 text-[#f9461c]" />,
                title: "Livraison rapide",
                description: "Partout au Sénégal, rapidement et efficacement.",
                delay: 0.6
              }
            ].map((advantage, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeIn('up', advantage.delay)}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-300 group border border-gray-100"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#001489]/10 to-[#f9461c]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos activités */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn('up', 0.1)}
              className="inline-block mb-3"
            >
              <span className="text-[#f9461c] font-semibold bg-[#f9461c]/10 px-4 py-2 rounded-full">Ce que nous faisons</span>
            </motion.div>
            <motion.h2
              variants={fadeIn('up', 0.2)}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Nos <span className="text-[#001489]">activités</span>
            </motion.h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn('up', 0.3)}
              className="text-center mb-12"
            >
              <h3 className="text-2xl font-bold text-[#f9461c] mb-6">Alimentaires</h3>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: <Shirt className="h-12 w-12 text-[#001489]" />,
                  title: "Vêtements",
                  description: "Une large gamme de vêtements pour toute la famille.",
                  delay: 0.4
                },
                {
                  icon: <Zap className="h-12 w-12 text-[#f9461c]" />,
                  title: "Hygiène",
                  description: "Produits d'hygiène et de soins personnels de qualité.",
                  delay: 0.5
                },
                {
                  icon: <Home className="h-12 w-12 text-[#001489]" />,
                  title: "Électroménager",
                  description: "Appareils électroménagers pour équiper votre maison.",
                  delay: 0.6
                },
                {
                  icon: <ShoppingCart className="h-12 w-12 text-[#f9461c]" />,
                  title: "Habillement",
                  description: "Vêtements et accessoires pour tous les styles.",
                  delay: 0.7
                }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeIn('up', activity.delay)}
                  className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-start space-x-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#001489]/10 to-[#f9461c]/10 rounded-2xl flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{activity.title}</h3>
                    <p className="text-gray-600">{activity.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notre mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn('left', 0.2)}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Cheikh Distribution, <span className="text-[#001489]">au cœur des besoins</span> quotidiens des sénégalais
              </h2>
              
              <div className="prose prose-lg text-gray-600">
                <p className="text-lg mb-4">
                  Cheikh Distribution est une entreprise polyvalente sénégalaise spécialisée dans
                  la vente, la livraison, la transformation de produits de consommation courante
                  et les services.
                </p>
                <p className="text-lg mb-6">
                  Nous offrons une large gamme de produits alimentaires, électroménagers, bétails, vêtements,
                  articles de sport et plus encore, pour satisfaire les besoins des familles, des commerçants,
                  des professionnels et de la diaspora.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <Button asChild className="bg-[#001489] hover:bg-[#001070]">
                  <Link href="/products">Découvrir nos produits</Link>
                </Button>
                <Button asChild variant="outline" className="border-[#001489] text-[#001489] hover:bg-[#001489]/10">
                  <Link href="/contact">Nous contacter</Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn('right', 0.4)}
              className="lg:w-1/2"
            >
              <div className="bg-gradient-to-br from-[#001489]/10 to-[#f9461c]/10 rounded-3xl p-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white p-8 rounded-2xl shadow-md">
                    <h3 className="text-2xl font-bold text-[#001489] mb-4">Notre engagement</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-[#f9461c] mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">Qualité garantie pour tous nos produits</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-[#f9461c] mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">Service client disponible 7j/7</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-[#f9461c] mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">Livraison rapide dans tout le Sénégal</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-[#f9461c] mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">Paiements sécurisés et multiples options</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-[#001489] to-[#001070] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn('up', 0.1)}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-10 max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-2">Nous contacter</h2>
            <div className="w-20 h-1 bg-[#f9461c] mx-auto mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                variants={fadeIn('up', 0.2)}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-[#FFB500]" />
                </div>
                <h3 className="font-semibold mb-2">Adresse</h3>
                <p className="text-blue-100">272, Holding Baobab - Mbao Gare</p>
              </motion.div>
              
              <motion.div
                variants={fadeIn('up', 0.3)}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-[#FFB500]" />
                </div>
                <h3 className="font-semibold mb-2">Téléphone</h3>
                <p className="text-blue-100">221 77 649 06 34</p>
              </motion.div>
              
              <motion.div
                variants={fadeIn('up', 0.4)}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-[#FFB500]" />
                </div>
                <h3 className="font-semibold mb-2">Site web</h3>
                <p className="text-blue-100">www.cheikhdistribution.sn</p>
              </motion.div>
            </div>
            
            <motion.div
              variants={fadeIn('up', 0.5)}
              className="mt-10"
            >
              <Button asChild size="lg" className="bg-[#f9461c] hover:bg-[#e03c15] rounded-full px-8">
                <Link href="/contact">Contactez-nous</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}