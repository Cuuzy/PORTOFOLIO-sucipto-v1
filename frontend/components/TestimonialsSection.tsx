import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Quote, User, Building } from 'lucide-react';
import backend from '~backend/client';
import type { Testimonial, ListTestimonialsResponse } from '~backend/profile/manage_testimonials';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const response: ListTestimonialsResponse = await backend.profile.getPublicTestimonials({
        limit: 20
      });
      setTestimonials(response.testimonials);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="h-20 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5"></div>
          
          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Quote className="w-6 h-6 text-teal-400" />
                Testimonials
              </h2>
              <p className="text-gray-400">What people say about working with me</p>
            </div>

            {/* Testimonial Content */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center">
                {/* Quote Icon */}
                <Quote className="w-12 h-12 text-teal-400/30 mx-auto mb-6" />
                
                {/* Rating */}
                <div className="flex justify-center">
                  {renderStars(currentTestimonial.rating)}
                </div>

                {/* Content */}
                <blockquote className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 italic">
                  "{currentTestimonial.content}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center justify-center gap-4">
                  {currentTestimonial.avatar_url ? (
                    <img
                      src={currentTestimonial.avatar_url}
                      alt={currentTestimonial.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  <div className="text-left">
                    <div className="font-semibold text-white">{currentTestimonial.name}</div>
                    {(currentTestimonial.position || currentTestimonial.company) && (
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        {currentTestimonial.position && (
                          <span>{currentTestimonial.position}</span>
                        )}
                        {currentTestimonial.position && currentTestimonial.company && (
                          <span>at</span>
                        )}
                        {currentTestimonial.company && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <span>{currentTestimonial.company}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTestimonial}
                  className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Indicators */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-teal-400 w-8'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTestimonial}
                  className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Counter */}
            {testimonials.length > 1 && (
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {testimonials.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}