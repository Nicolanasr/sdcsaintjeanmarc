"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";

interface JoinFormProps {
  dict: Dictionary;
  locale: string;
  embedMode?: boolean;
}

export default function JoinForm({ dict, locale, embedMode = false }: JoinFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    parentPhone: "",
    email: "",
    section: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const isAr = locale === "ar";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL;

    if (!sheetUrl) {
      console.warn("Google Sheet Endpoint URL is not configured. Falling back to local mock success.");
      // If the URL is not set yet, simulate success for testing and demo purposes
      setTimeout(() => {
        setStatus("success");
        setFormData({ name: "", age: "", parentPhone: "", email: "", section: "", message: "" });
      }, 1500);
      return;
    }

    try {
      // Send as text/plain to avoid preflight CORS pre-checks that Google Apps Script fails on
      const response = await fetch(sheetUrl, {
        method: "POST",
        mode: "no-cors", // Crucial for Google Apps Script redirects
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(formData),
      });

      setStatus("success");
      setFormData({
        name: "",
        age: "",
        parentPhone: "",
        email: "",
        section: "",
        message: "",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    }
  };

  const sectionsList = [
    { value: "jaramiz", label: isAr ? "الجراميز والزهرات (أعمار ٤ - ١١)" : "Louveteaux & Jeannettes (Ages 4-11)" },
    { value: "kechhefe", label: isAr ? "الكشافة والمرشدات (أعمار ١١ - ١٥)" : "Boy Scouts & Guides (Ages 11-15)" },
    { value: "jouwele", label: isAr ? "الجوالة والمنجدات (أعمار ١٦ - ١٨+)" : "Routiers & Caravelles (Ages 16-18+)" },
    { value: "chefs", label: isAr ? "قادة ومساعدي قادة (أعمار ١٨+)" : "Leaders / Chefs (Ages 18+)" },
  ];

  if (embedMode) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Notifications */}
        {status === "success" && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>{dict.join.form.success}</div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>{dict.join.form.error}</div>
          </div>
        )}

        {/* Name & Age Inputs Row */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
              {dict.join.form.name} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={status === "submitting"}
              placeholder={dict.join.form.namePlaceholder}
              className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm"
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
              {dict.join.form.age} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              required
              min="4"
              max="99"
              value={formData.age}
              onChange={handleChange}
              disabled={status === "submitting"}
              placeholder={dict.join.form.agePlaceholder}
              className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm"
            />
          </div>
        </div>

        {/* Parent Phone & Email Inputs Row */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="parentPhone" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
              {dict.join.form.phone} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="parentPhone"
              name="parentPhone"
              required
              value={formData.parentPhone}
              onChange={handleChange}
              disabled={status === "submitting"}
              placeholder={dict.join.form.phonePlaceholder}
              className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
              {dict.join.form.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={status === "submitting"}
              placeholder={dict.join.form.emailPlaceholder}
              className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm"
            />
          </div>
        </div>

        {/* Section Select Dropdown */}
        <div>
          <label htmlFor="section" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
            {dict.join.form.section} <span className="text-red-500">*</span>
          </label>
          <select
            id="section"
            name="section"
            required
            value={formData.section}
            onChange={handleChange}
            disabled={status === "submitting"}
            className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm cursor-pointer"
          >
            <option value="" disabled>
              {dict.join.form.sectionSelect}
            </option>
            {sectionsList.map((sec) => (
              <option key={sec.value} value={sec.value}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message / Additional details */}
        <div>
          <label htmlFor="message" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
            {dict.join.form.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            disabled={status === "submitting"}
            placeholder={dict.join.form.messagePlaceholder}
            className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-gradient-to-r from-scout-navy to-scout-navy-light text-white font-bold px-6 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
        >
          {status === "submitting" ? (
            <span>{dict.join.form.sending}</span>
          ) : (
            <>
              <span>{dict.join.form.submit}</span>
              <Send className="w-4 h-4 rtl-flip" />
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <section id="join" className="py-20 bg-scout-beige relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute -bottom-10 right-0 w-80 h-80 bg-scout-gold/5 rounded-full filter blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-scout-navy font-display"
          >
            {dict.join.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-scout-charcoal/70 mt-3 text-sm sm:text-base leading-relaxed"
          >
            {dict.join.subtitle}
          </motion.p>
          <div className="w-20 h-1 bg-scout-gold mx-auto mt-4 rounded-full" />
        </div>

        {/* Form and info grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Contact Details Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-scout-navy to-scout-navy-dark text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between border border-scout-navy-light/20">
            <div>
              <h3 className="text-2xl font-bold font-display text-scout-gold-light mb-2">
                {dict.join.info.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-8">
                {dict.join.info.subtitle}
              </p>

              {/* Detail Items */}
              <div className="space-y-6">
                
                {/* Location Address */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl text-scout-gold shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-1">
                      {isAr ? "الموقع" : "Location"}
                    </h4>
                    <p className="text-sm leading-relaxed text-white/90">
                      {dict.join.info.address}
                    </p>
                  </div>
                </div>

                {/* Telephone numbers */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl text-scout-gold shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-1">
                      {isAr ? "الهاتف" : "Phones"}
                    </h4>
                    <p className="text-sm text-white/95 dir-ltr text-start">
                      {dict.join.info.phone1} <br className="sm:hidden" />
                      <span className="hidden sm:inline mx-2 text-white/30">|</span> 
                      {dict.join.info.phone2}
                    </p>
                  </div>
                </div>

                {/* Email address */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl text-scout-gold shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-1">
                      {isAr ? "البريد الإلكتروني" : "Email Address"}
                    </h4>
                    <p className="text-sm text-white/95">
                      {dict.join.info.email}
                    </p>
                  </div>
                </div>

                {/* Meeting time agenda */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl text-scout-gold shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-1">
                      {isAr ? "الاجتماعات" : "Meeting Hours"}
                    </h4>
                    <p className="text-sm text-white/95 leading-relaxed">
                      {dict.join.info.schedule}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Maritime/Cathedral closing notice */}
            <div className="mt-12 pt-6 border-t border-white/10 text-xs text-scout-gold-light italic">
              {isAr 
                ? "«كن مستعداً لتبحر معنا في مغامرة العمر»" 
                : "“Be prepared to sail with us on the adventure of a lifetime.”"}
            </div>
          </div>

          {/* Registration Form Panel */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-scout-beige-dark/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Notifications */}
              {status === "success" && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>{dict.join.form.success}</div>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>{dict.join.form.error}</div>
                </div>
              )}

              {/* Name & Age Inputs Row */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                    {dict.join.form.name} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={status === "submitting"}
                    placeholder={dict.join.form.namePlaceholder}
                    className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="age" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                    {dict.join.form.age} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    required
                    min="4"
                    max="99"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={status === "submitting"}
                    placeholder={dict.join.form.agePlaceholder}
                    className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm"
                  />
                </div>
              </div>

              {/* Parent Phone & Email Inputs Row */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="parentPhone" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                    {dict.join.form.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    required
                    value={formData.parentPhone}
                    onChange={handleChange}
                    disabled={status === "submitting"}
                    placeholder={dict.join.form.phonePlaceholder}
                    className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                    {dict.join.form.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={status === "submitting"}
                    placeholder={dict.join.form.emailPlaceholder}
                    className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm"
                  />
                </div>
              </div>

              {/* Section Select Dropdown */}
              <div>
                <label htmlFor="section" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                  {dict.join.form.section} <span className="text-red-500">*</span>
                </label>
                <select
                  id="section"
                  name="section"
                  required
                  value={formData.section}
                  onChange={handleChange}
                  disabled={status === "submitting"}
                  className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm cursor-pointer"
                >
                  <option value="" disabled>
                    {dict.join.form.sectionSelect}
                  </option>
                  {sectionsList.map((sec) => (
                    <option key={sec.value} value={sec.value}>
                      {sec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message / Additional details */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                  {dict.join.form.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={status === "submitting"}
                  placeholder={dict.join.form.messagePlaceholder}
                  className="w-full bg-scout-beige px-4 py-3 rounded-xl border border-scout-beige-dark/50 text-scout-charcoal placeholder-scout-charcoal/30 focus:outline-none focus:ring-2 focus:ring-scout-gold/45 focus:border-scout-gold transition-all text-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-gradient-to-r from-scout-navy to-scout-navy-light text-white font-bold px-6 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {status === "submitting" ? (
                  <span>{dict.join.form.sending}</span>
                ) : (
                  <>
                    <span>{dict.join.form.submit}</span>
                    <Send className="w-4 h-4 rtl-flip" />
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
