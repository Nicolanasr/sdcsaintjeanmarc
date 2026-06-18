import { getDictionary } from "@/lib/dictionary";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Sections from "@/components/Sections";
import Agenda from "@/components/Agenda";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import FAQs from "@/components/FAQs";
import JoinForm from "@/components/JoinForm";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="flex-grow">
        <Hero dict={dict} locale={locale} />
        <About dict={dict} locale={locale} />
        <Sections dict={dict} locale={locale} />
        <Agenda dict={dict} locale={locale} />
        <Gallery dict={dict} locale={locale} />
        <Testimonials dict={dict} locale={locale} />
        <FAQs dict={dict} locale={locale} />
        <JoinForm dict={dict} locale={locale} />
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
