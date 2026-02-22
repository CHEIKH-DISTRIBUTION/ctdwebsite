// src/app/(shop)/contact/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  MessageCircle,
  HeadphonesIcon,
  ArrowRight,
  ChevronRight,
  Star,
  CheckCircle,
  Users,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Variantes d'animation
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuler l'envoi du formulaire
    setTimeout(() => {
      toast.success('Message envoyé avec succès !', {
        description: 'Nous vous répondrons dans les plus brefs délais.',
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#284bcc',
          color: 'white',
          border: 'none'
        }
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: MapPin,
      title: 'Adresse',
      content: '272, Holding Baobab - Mbao Gare',
      description: 'Dakar, Sénégal',
      color: 'from-blue-500/10 to-blue-600/10',
      iconColor: 'text-blue-600'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+221 77 649 06 34',
      description: 'Disponible 7j/7',
      color: 'from-green-500/10 to-green-600/10',
      iconColor: 'text-green-600'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@cheikhdistribution.sn',
      description: 'Réponse sous 24h',
      color: 'from-red-500/10 to-red-600/10',
      iconColor: 'text-red-600'
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: 'Lundi - Dimanche',
      description: '8h00 - 20h00',
      color: 'from-purple-500/10 to-purple-600/10',
      iconColor: 'text-purple-600'
    }
  ];

  const faqs = [
    {
      question: 'Quels sont les délais de livraison ?',
      answer: 'Nous livrons sous 24h dans Dakar et 48-72h dans les autres régions du Sénégal.'
    },
    {
      question: 'Quels modes de paiement acceptez-vous ?',
      answer: 'Wave, Orange Money, cartes bancaires Visa/Mastercard et paiement à la livraison.'
    },
    {
      question: 'Proposez-vous des produits locaux ?',
      answer: 'Oui, nous travaillons avec des producteurs locaux sénégalais pour vous offrir des produits frais et authentiques.'
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section Élégante */}
      <section className="relative py-20 bg-gradient-to-br from-[#284bcc] to-[#1d3aa3] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.1&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20"
            >
              <MessageCircle className="h-5 w-5 mr-2 text-[#f6c700]" />
              <span className="text-sm font-medium">Contactez-nous</span>
            </motion.div>
            
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Parlons de vos <span className="text-[#f9461c]">besoins</span>
            </motion.h1>
            
            <motion.p
              variants={fadeIn}
              className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              Nous sommes là pour vous accompagner. Discutons de la manière dont nous pouvons répondre à vos attentes.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods - Style Élégant */}
      <section className="py-16 relative -mt-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-6 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <method.icon className={`h-7 w-7 ${method.iconColor}`} />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-[#284bcc] transition-colors duration-300">{method.title}</h3>
                      <p className="text-gray-800 font-medium mb-1">{method.content}</p>
                      <p className="text-gray-600 text-sm">{method.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form Élégant */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-[#284bcc]/5 to-[#f9461c]/5 rounded-3xl blur-lg opacity-75"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#284bcc] to-[#1d3aa3] rounded-2xl flex items-center justify-center">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Envoyez-nous un message</h2>
                    <p className="text-gray-600">Nous vous répondrons rapidement</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">Nom complet *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        placeholder="Votre nom complet"
                        className="py-3 px-4 border-gray-300 focus:border-[#284bcc] focus:ring-[#284bcc] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Adresse email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        placeholder="votre@email.com"
                        className="py-3 px-4 border-gray-300 focus:border-[#284bcc] focus:ring-[#284bcc] transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700 font-medium">Sujet *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      placeholder="Objet de votre message"
                      className="py-3 px-4 border-gray-300 focus:border-[#284bcc] focus:ring-[#284bcc] transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={5}
                      placeholder="Décrivez-nous votre demande en détail..."
                      className="resize-none py-3 px-4 border-gray-300 focus:border-[#284bcc] focus:ring-[#284bcc] transition-colors"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#284bcc] to-[#1d3aa3] hover:from-[#1d3aa3] hover:to-[#284bcc] py-3 h-12 text-lg font-semibold transition-all duration-300 hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Envoi en cours...
                      </div>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Envoyer le message
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Informations & FAQ Élégantes */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Carte de localisation améliorée */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#f9461c]" />
                  Notre localisation
                </h3>
                <div className="bg-gradient-to-br from-[#284bcc]/5 to-[#f9461c]/5 rounded-xl p-4">
                  <div className="bg-white rounded-lg p-4 shadow-inner">
                    <p className="text-gray-800 font-semibold text-center mb-2">272, Holding Baobab</p>
                    <p className="text-gray-600 text-center">Mbao Gare, Dakar, Sénégal</p>
                    <div className="mt-4 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-[#284bcc] mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Carte interactive</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Élégante */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#284bcc] to-[#1d3aa3] rounded-xl flex items-center justify-center">
                    <HeadphonesIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Questions fréquentes</h2>
                </div>
                
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      className="border-l-4 border-[#284bcc]/20 pl-4 py-2 hover:border-[#284bcc] transition-colors"
                    >
                      <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-[#284bcc]" />
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 text-sm pl-6">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-6 border-[#284bcc] text-[#284bcc] hover:bg-[#284bcc] hover:text-white transition-colors group"
                >
                  Voir toutes les FAQs
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Section Élégante */}
      <section className="py-20 bg-gradient-to-br from-[#284bcc] to-[#1d3aa3] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.1&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        
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
              <Star className="h-5 w-5 mr-2 text-[#f6c700]" />
              <span className="text-sm font-medium">Support Premium</span>
            </motion.div>
            
            <motion.h2
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Support Client <span className="text-[#f6c700]">7j/7</span>
            </motion.h2>
            
            <motion.p
              variants={fadeIn}
              className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg"
            >
              Notre équipe dédiée est à votre service pour vous offrir une expérience client exceptionnelle
            </motion.p>

            {/* Features Grid */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
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

            {/* Call to Action */}
            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg"
                className="bg-white text-[#284bcc] hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 group"
              >
                <Phone className="h-5 w-5 mr-2" />
                Appeler maintenant
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-white text-[#284bcc] hover:bg-white hover:text-[#284bcc] px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 group"
              >
                <Mail className="h-5 w-5 mr-2" />
                Envoyer un email
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}