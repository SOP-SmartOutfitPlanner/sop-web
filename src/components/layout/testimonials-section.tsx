"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechCorp",
    avatar: "SC",
    quote: "SOP has completely transformed my morning routine. I no longer waste 20 minutes deciding what to wear. The AI suggestions are surprisingly accurate!",
    rating: 5,
  },
  {
    id: 2,
    name: "Marcus Thompson",
    role: "Creative Director",
    company: "Design Studio",
    avatar: "MT",
    quote: "As someone who values personal style, I was skeptical at first. But SOP helped me rediscover pieces I forgot I owned and create fresh combinations.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Marketing Executive",
    company: "BrandCo",
    avatar: "ER",
    quote: "The calendar integration is a game-changer. SOP knows when I have client meetings and suggests appropriate outfits automatically. Worth every penny!",
    rating: 5,
  },
  {
    id: 4,
    name: "David Park",
    role: "Software Engineer",
    company: "StartupXYZ",
    avatar: "DP",
    quote: "I never thought I needed an outfit planner until I tried SOP. Now it's an essential part of my daily routine. The weather integration alone is worth it.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials-section" className="py-24 px-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Floating decoration */}
      <motion.div
        initial={{ x: -400, opacity: 0, rotate: -20 }}
        animate={{ x: 0, opacity: 1, rotate: -15 }}
        transition={{
          duration: 1.8,
          ease: [0.34, 1.56, 0.64, 1],
          delay: 0.3
        }}
        className="absolute left-16 top-20 z-0 pointer-events-none"
      >
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [-15, -20, -15],
            scale: [1, 1.08, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img
            src="/hat.png"
            alt="Dress decoration"
            style={{ width: '500px', height: '500px' }}
            className="opacity-40 drop-shadow-2xl filter blur-[0.5px]"
          />
        </motion.div>
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-bricolage font-semibold text-blue-600 mb-4"
          >
            Testimonials
          </motion.div>
          <h2 className="font-dela-gothic text-4xl md:text-5xl text-gray-900 mb-6">
            Loved by
            <span className="text-blue-600"> Thousands</span>
          </h2>
          <p className="font-bricolage text-xl text-gray-600 max-w-2xl mx-auto">
            See what our users have to say about their experience with Smart Outfit Planner.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all border border-blue-100/50"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Star className="text-white fill-white" size={26} />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-bricolage text-gray-700 text-lg leading-relaxed mb-6">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Author info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bricolage font-bold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bricolage font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="font-bricolage text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="font-bricolage text-gray-600 mb-6">Trusted by fashion enthusiasts worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {['StyleHub', 'FashionTech', 'WardrobeAI', 'OutfitPro', 'TrendSet'].map((company) => (
              <div key={company} className="font-dela-gothic text-2xl text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
