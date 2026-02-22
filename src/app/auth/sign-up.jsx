import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/autoplay';
import { motion } from "framer-motion";
import { UserPlus, Mail, Phone, Calendar, MapPin, User, Loader2, Building } from "lucide-react";
import { toast } from "sonner";
import BASE_URL from "@/config/base-url";
// import logoLogin from "@/assets/receipt/fts_log.png";
import moment from "moment";

const sliderImages = [
  {
    id: 1,
    title: "Join Our Community",
    description: "Become part of a movement empowering tribal communities through education and development",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 2,
    title: "Make a Difference",
    description: "Together we can create lasting change and build better futures",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }
];

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    full_name: "",
    email: "",
    phone: "",
    user_birthday: "",
    user_add: "",
    user_chapter: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const nameInputRef = useRef(null);

  const loadingMessages = [
    "Creating your account...",
    "Setting up your profile...",
    "Almost done...",
    "Welcome to FTS Champ...",
  ];

  // Auto-focus on name input
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let messageIndex = 0;
    let intervalId;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.name.trim()) {
      newErrors.name = "Username is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      newErrors.name = "Username can only contain letters, numbers, and underscores";
    }
    
    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    // Birthday validation (optional)
    if (formData.user_birthday) {
      const birthDate = moment(formData.user_birthday);
      const today = moment();
      if (birthDate.isAfter(today)) {
        newErrors.user_birthday = "Birthday cannot be in the future";
      } 
    }
    
  
    // Chapter validation
    if (!formData.user_chapter.trim()) {
      newErrors.user_chapter = "Chapter name is required";
    } else if (formData.user_chapter.length < 3) {
      newErrors.user_chapter = "Chapter name must be at least 3 characters";
    }
    
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handlePhoneChange = (value) => {
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    
    
    handleInputChange('phone', formatted);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare the data for API
      const signupData = {
        name: formData.name.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''), // Send only digits
        user_birthday: formData.user_birthday || null,
        user_add: formData.user_add.trim(),
        user_chapter: formData.user_chapter.trim(),
      };
      
      const res = await axios.post(`${BASE_URL}/api/panel-signup`, signupData);
      
      if (res.data.code === 201) {
        toast.success("Account created successfully! An admin will contact you with login credentials.");

          navigate("/");
     
      } else {
        toast.error(res.data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !isLoading) {
      handleSubmit(event);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob login-blob-1 bg-purple-300"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 login-blob-2 bg-pink-300"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 login-blob-3 bg-blue-300"></div>
      </div>

      <motion.div
        className="flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden max-w-6xl w-full relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Left Side - Slider */}
        <div className="hidden md:flex flex-col items-center justify-center p-1 w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg">
            <Swiper
              modules={[Autoplay, EffectFade]}
              effect="fade"
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={true}
              className="w-full h-full"
            >
              {sliderImages.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="relative w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {slide.title}
                      </h3>
                      <p className="text-white/90">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

       
      </motion.div>

      {/* Add CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}