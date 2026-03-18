// src/app/(shop)/contact/page.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
};

const contactMethods = [
  {
    icon: Phone,
    title: 'Téléphone',
    content: '+221 77 649 06 34',
    description: 'Disponible 7j/7 · 8h – 20h',
    color: 'from-green-500/10 to-green-600/10',
    iconColor: 'text-green-600',
    href: 'tel:+221776490634',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'contact@cheikhdistribution.sn',
    description: 'Réponse sous 24h',
    color: 'from-red-500/10 to-red-600/10',
    iconColor: 'text-red-600',
    href: 'mailto:contact@cheikhdistribution.sn',
  },
  {
    icon: MapPin,
    title: 'Adresse',
    content: '272, Holding Baobab',
    description: 'Mbao Gare, Dakar, Sénégal',
    color: 'from-blue-500/10 to-blue-600/10',
    iconColor: 'text-blue-600',
    href: 'https://maps.google.com/?q=Mbao+Gare+Dakar+Senegal',
  },
  {
    icon: Clock,
    title: 'Horaires',
    content: 'Lun – Dim',
    description: '8h00 – 20h00',
    color: 'from-purple-500/10 to-purple-600/10',
    iconColor: 'text-purple-600',
    href: undefined,
  },
];

const supportFeatures = [
  {
    icon: Users,
    title: 'Équipe dédiée',
    description: 'Des conseillers spécialisés à votre service'
  },
  {
    icon: Clock,
    title: '7j/7',
    description: 'Disponible du lundi au dimanche'
  },
  {
    icon: CheckCircle,
    title: 'Solution rapide',
    description: 'Résolution efficace de vos demandes'
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-[#001489] to-[#001070] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.1&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10" />
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20"
            >
              <MessageCircle className="h-5 w-5 mr-2 text-[#FFB500]" />
              <span className="text-sm font-medium">Contactez-nous</span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Parlons de vos <span className="text-[#F9461C]">besoins</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg text-blue-100 leading-relaxed max-w-2xl mx-auto"
            >
              Notre équipe est disponible 7j/7 pour répondre à toutes vos questions.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16 relative -mt-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <method.icon className={`h-7 w-7 ${method.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-[#001489] transition-colors">{method.title}</h3>
                    {method.href ? (
                      <a
                        href={method.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 font-medium text-sm hover:text-[#001489] transition-colors block mb-1"
                      >
                        {method.content}
                      </a>
                    ) : (
                      <p className="text-gray-800 font-medium mb-1 text-sm">{method.content}</p>
                    )}
                    <p className="text-gray-500 text-xs">{method.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Location */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#F9461C]" />
              Notre localisation
            </h3>
            <p className="text-gray-800 font-semibold mb-1">272, Holding Baobab</p>
            <p className="text-gray-600 mb-4">Mbao Gare, Dakar, Sénégal</p>
            <a
              href="https://maps.google.com/?q=Mbao+Gare+Dakar+Senegal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#001489] font-medium text-sm hover:underline"
            >
              Voir sur Google Maps
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Support section */}
      <section className="py-20 bg-gradient-to-br from-[#001489] to-[#001070] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.1&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10" />

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20"
            >
              <Star className="h-5 w-5 mr-2 text-[#FFB500]" />
              <span className="text-sm font-medium">Support Premium</span>
            </motion.div>

            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-6">
              Support Client <span className="text-[#FFB500]">7j/7</span>
            </motion.h2>

            <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {supportFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="w-12 h-12 mx-auto bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#001489] hover:bg-gray-100 px-8 py-3 rounded-full font-semibold"
              >
                <a href="tel:+221776490634">
                  <Phone className="h-5 w-5 mr-2" />
                  Appeler maintenant
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#001489] px-8 py-3 rounded-full font-semibold"
              >
                <a href="mailto:contact@cheikhdistribution.sn">
                  <Mail className="h-5 w-5 mr-2" />
                  Envoyer un email
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
