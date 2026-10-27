import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Code2,
  CreditCard,
  FileText,
  Megaphone,
  Palette,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PublicSiteShell } from "@/components/gigclose/PublicSiteShell";
import { Logo } from "@/components/gigclose/Logo";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/gigs";
import heroBackground from "@/assets/download (2).jpg";
import readyToStartBackground from "@/assets/ready-to-start.jpg";
import clientThinkAboutIt from "@/assets/Have you ever encountered a client that used those words ΓÇ£i will think about itΓÇ¥_.jpg";
import chefBg from "@/assets/African american professional chef working in the kitchen _ Premium AI-generated image.jpg";
import houseHelpBg from "@/assets/How to Find a Trustworthy _ Reliable House Help in Nairobi_ A Practical Guide for Kenyan Families.jpg";
import download6Bg from "@/assets/download (6).jpg";
import download5Bg from "@/assets/download (5).jpg";
import download3Bg from "@/assets/download (3).jpg";
import download4Bg from "@/assets/download (4).jpg";
import securityBg from "@/assets/Security Company London _ Leading Security Group uk.jpg";
import seamstressBg from "@/assets/Une Couturière Africaine Coud Avec Diligence Des Vêtements à Laide De Machines Dans Son Bureau De Tailleur Photo Et Image en Téléchargement Gratuit - Pngtree.jpg";
import developerBg from "@/assets/Young developer working at his workplace with computer _ Premium Photo.jpg";

import technicianIcon from "@/assets/Technician.png";
import techIcon from "@/assets/Tech.png";
import teachingIcon from "@/assets/Teaching.png";
import securityIcon from "@/assets/Security.png";
import nurseIcon from "@/assets/nurse.png";
import laundryIcon from "@/assets/Laundry.png";
import instrumentalistIcon from "@/assets/Instrumentalist.png";
import hotelIcon from "@/assets/Hotel.png";
import cleanerIcon from "@/assets/cleaner.png";
import accountingIcon from "@/assets/Accounting-and-Management.png";
import teacherPic from "@/assets/teacher-pic.jpg";
import nursePic from "@/assets/nurse-pic.jpg";
import plumbingPic from "@/assets/plumbing-pic.jpg";
import laundryPic from "@/assets/laundry-pic.jpg";
import accountingPic from "@/assets/accounting-pic.jpg";
import hotelPic from "@/assets/hotel-pic.jpg";

const heroImages = [
  heroBackground,
  chefBg,
  houseHelpBg,
  download6Bg,
  download3Bg,
  download4Bg,
  securityBg,
  seamstressBg,
  developerBg,
];

const fetchOpenJobs = async () => {
  const { data, error } = await supabase.from("jobs").select("*").eq("status", "open").limit(100);
  if (error) throw error;
  return data as Job[];
};

const stats = [
  { value: "450k+", label: "Active Jobs" },
  { value: "$2.4B", label: "Total Earnings" },
  { value: "12k+", label: "Expert Freelancers" },
  { value: "98%", label: "Client Satisfaction" },
];

const principles = [
  {
    number: "01",
    title: "Proximity first",
    body: "Nearby jobs rise to the top so every match starts within practical reach.",
  },
  {
    number: "02",
    title: "Fast response",
    body: "Workers and clients move from posted need to live conversation quickly.",
  },
  {
    number: "03",
    title: "Clear payments",
    body: "Visible rates and payout flow keep expectations sharp before work begins.",
  },
  {
    number: "04",
    title: "Trusted system",
    body: "Profiles, activity, and job context help both sides choose with confidence.",
  },
];

const categories = [
  {
    title: "Technician",
    body: "Electrical repairs, plumbing, appliance installation, and maintenance.",
    meta: "4.8/5 rating - 18k+ talent",
    iconImg: technicianIcon,
    color: "bg-[#E2DFFF]",
    bgImage: plumbingPic,
  },
  {
    title: "Tech",
    body: "Software developers, IT support specialists, and cybersecurity experts.",
    meta: "4.9/5 rating - 35k+ talent",
    iconImg: techIcon,
    color: "bg-[#D0E1FB]",
    bgImage: developerBg,
  },
  {
    title: "Teaching",
    body: "Private tutors, language instructors, and academic mentors.",
    meta: "4.9/5 rating - 14k+ talent",
    iconImg: teachingIcon,
    color: "bg-[#FFDAD6]",
    bgImage: teacherPic,
  },
  {
    title: "Security",
    body: "Event security, private guards, and surveillance personnel.",
    meta: "4.7/5 rating - 10k+ talent",
    iconImg: securityIcon,
    color: "bg-[#C9E6FF]",
    bgImage: securityBg,
  },
  {
    title: "Nurse",
    body: "Home care nurses, elderly assistance, and wellness practitioners.",
    meta: "4.9/5 rating - 12k+ talent",
    iconImg: nurseIcon,
    color: "bg-[#E2DFFF]",
    bgImage: nursePic,
  },
  {
    title: "Laundry",
    body: "Professional dry cleaning, garment care, and laundry services.",
    meta: "4.8/5 rating - 9k+ talent",
    iconImg: laundryIcon,
    color: "bg-[#D0E1FB]",
    bgImage: laundryPic,
  },
  {
    title: "Instrumentalist",
    body: "Live musicians, studio session players, and music instructors.",
    meta: "4.9/5 rating - 7k+ talent",
    iconImg: instrumentalistIcon,
    color: "bg-[#C3C0FF]",
    bgImage: download5Bg,
  },
  {
    title: "Hotel",
    body: "Hospitality staff, concierges, receptionists, and event hosts.",
    meta: "4.7/5 rating - 16k+ talent",
    iconImg: hotelIcon,
    color: "bg-[#FFDAD6]",
    bgImage: hotelPic,
  },
  {
    title: "Cleaner",
    body: "Residential house cleaners, office janitors, and deep cleaning specialists.",
    meta: "4.8/5 rating - 22k+ talent",
    iconImg: cleanerIcon,
    color: "bg-[#C9E6FF]",
    bgImage: houseHelpBg,
  },
  {
    title: "Accounting & Management",
    body: "Bookkeepers, financial advisors, and project management experts.",
    meta: "4.9/5 rating - 15k+ talent",
    iconImg: accountingIcon,
    color: "bg-[#C3C0FF]",
    bgImage: accountingPic,
  },
];

const processSteps = [
  {
    title: "1. Post a job",
    body: "Define your project requirements and budget to reach top-tier local talent instantly.",
    icon: FileText,
  },
  {
    title: "2. Select talent",
    body: "Browse profiles, check reviews, and interview candidates to find the perfect fit.",
    icon: Users,
  },
  {
    title: "3. Secure payments",
    body: "Use clear payment flows so work is delivered and payouts stay easy to track.",
    icon: CreditCard,
  },
];

const companies = ["METASYS", "STRYKE", "VOLT.AI", "ORBIT", "PIXEL+"];

const testimonials = [
  {
    quote:
      "GigClose has completely transformed how we scale our field team. The quality of talent we have found here is consistently reliable and the process is seamless.",
    name: "Sarah Jenkins",
    role: "Product Manager at TechNova",
  },
  {
    quote:
      "The platform makes it easy to manage complex, multi-step projects. The payment flow gives both us and the workers real peace of mind throughout.",
    name: "Marcus Chen",
    role: "CTO at Volt.ai",
  },
  {
    quote:
      "We found our lead designer on GigClose in just three days. The rating system is reliable and the communication tools are built for modern work.",
    name: "Elena Rodriguez",
    role: "Creative Director at Pixel+",
  },
  {
    quote:
      "As a startup founder, I need reliable results fast. GigClose has been our secret weapon for finding experts who actually deliver.",
    name: "David Park",
    role: "Founder of Orbit App",
  },
];

const Home = () => {
  const { user } = useAuth();
  const { data: jobs = [] } = useQuery({ queryKey: ["home-open-jobs"], queryFn: fetchOpenJobs });
  const testimonialScrollerRef = useRef<HTMLDivElement>(null);
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const displayStats = useMemo(
    () =>
      stats.map((stat) =>
        stat.label === "Active Jobs" && jobs.length
          ? { ...stat, value: `${jobs.length}+` }
          : stat,
      ),
    [jobs.length],
  );

  const findTalentHref = user ? "/app/post" : "/auth?role=client&redirect=/app/post";
  const findWorkHref = user ? "/app" : "/auth?role=worker&redirect=/app";
  const scrollTestimonials = (direction: "previous" | "next") => {
    const scroller = testimonialScrollerRef.current;
    if (!scroller) return;

    const firstCard = scroller.querySelector<HTMLElement>("[data-testimonial-card]");
    const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : scroller.clientWidth * 0.8;

    scroller.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <PublicSiteShell showFooter={false}>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Professional services and talent"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentHeroImageIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
            } transition-transform duration-[4000ms]`}
          />
        ))}
        <div className="absolute inset-0 bg-black/60" />
        <div className="container px-4 sm:px-6 relative flex min-h-[522px] items-center py-20 sm:py-28">
          <div className="max-w-xl">
            <p className="text-base leading-6">
              The world's work
              <br />
              <span className="text-[#C3C0FF]">marketplace</span>
            </p>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/90">
              Connect with specialized freelancers, manage complex projects, and pay securely using our world-class ecosystem for professional growth.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to={findTalentHref} className="w-fit">
                <Button className="h-14 rounded-[8px] bg-[#0081FF] px-10 text-base font-normal text-white hover:bg-[#006fdc]">
                  Find Talent
                </Button>
              </Link>
              <Link to={findWorkHref} className="ml-auto w-fit sm:ml-0">
                <Button
                  variant="outline"
                  className="h-14 rounded-[8px] border-[#0081FF] bg-transparent px-10 text-base font-normal text-[#0081FF] hover:bg-[#0081FF] hover:text-white"
                >
                  Find Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#C7C4D8] bg-white py-10">
        <div className="container px-4 sm:px-6 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat) => (
            <div key={stat.label}>
              <div className="text-base leading-6 text-[#0081FF]">{stat.value}</div>
              <div className="mt-1 text-base uppercase leading-6 tracking-[0.05em] text-[#464555]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F2F4F6] pt-24 pb-32">
        <div className="container px-4 sm:px-6 grid items-center gap-12 lg:grid-cols-[0.95fr_0.9fr]">
          <div className="relative space-y-10 lg:space-y-12">
            <svg
              className="absolute left-[35px] top-6 bottom-6 h-[calc(100%-48px)] w-[64px] text-[#0081FF] pointer-events-none hidden lg:block overflow-visible"
              viewBox="0 0 64 300"
              preserveAspectRatio="none"
            >
              <path
                d="M 0,0 Q 15,30 16,75 Q 25,115 32,150 Q 40,195 48,225 Q 52,270 64,300"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="opacity-80"
              />
            </svg>
            {principles.map((item, index) => (
              <PrincipleCard key={item.title} {...item} offset={index} />
            ))}
          </div>
          <div className="relative mx-auto w-full max-w-[565px] rotate-0 p-6 lg:rotate-3">
            <div className="absolute inset-6 rotate-[-2deg] rounded-[28px] bg-[#0EA5E9]/10" />
            <div className="relative overflow-hidden rounded-[28px] border-4 border-[#0EA5E9] bg-white shadow-2xl">
              <img
                src={clientThinkAboutIt}
                alt="A team choosing local project talent"
                className="h-[520px] w-full object-cover sm:h-[575px]"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-12 text-white"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,50 C650,140 900,-20 1200,40 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container px-4 sm:px-6">
          <SectionHeader
            title="Browse by category"
            body="Find the perfect expert for any project scope."
            action={
              <Link to="/explore" className="inline-flex items-center gap-1 text-base leading-6 text-[#3525CD]">
                View all categories
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-base leading-6 text-[#191C1E]">Scale your business easily</h2>
            <p className="mt-2 text-base leading-6 text-[#464555]">A streamlined process designed for speed and security.</p>
          </div>
          <div className="mt-20 grid gap-10 md:grid-cols-3">
            {processSteps.map((step) => (
              <ProcessStep key={step.title} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container px-0 sm:px-4">
          <p className="text-center text-base uppercase leading-6 tracking-[0.1em] text-[#464555]">
            Trusted by 50,000+ companies worldwide
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-6 opacity-40 lg:gap-x-32">
            {companies.map((company) => (
              <span key={company} className="text-base font-bold leading-6 text-[#191C1E]">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-24">
        <div className="container px-4 sm:px-6">
          <SectionHeader
            title="What our clients say"
            body="Hear from the teams building the future with GigClose talent."
            action={
              <div className="flex gap-4">
                <IconButton label="Previous testimonial" onClick={() => scrollTestimonials("previous")}>
                  <ArrowLeft className="h-4 w-4" />
                </IconButton>
                <IconButton label="Next testimonial" onClick={() => scrollTestimonials("next")}>
                  <ArrowRight className="h-4 w-4" />
                </IconButton>
              </div>
            }
          />
          <div ref={testimonialScrollerRef} className="desktop-scrollbar-none mt-16 flex gap-6 overflow-x-auto scroll-smooth pb-2">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-20">
        <div
          className="container relative overflow-hidden rounded-[32px] bg-[#0081FF] px-6 py-20 text-white sm:px-16 lg:px-32 lg:py-32"
          style={user ? {
            backgroundImage: `linear-gradient(rgba(0, 145, 255, 0.78), rgba(0, 145, 255, 0.78)), url(${readyToStartBackground})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          } : {
            backgroundImage: "radial-gradient(ellipse at top left, rgba(125, 211, 252, 0.55), transparent 45%), radial-gradient(ellipse at bottom right, rgba(30, 64, 175, 0.4), transparent 50%)",
          }}
        >
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-base leading-6">Ready to get started?</h2>
            <p className="mt-4 text-base leading-7 text-white/90">
              Whether you're hiring for a critical project or looking for your next big opportunity, GigClose has the tools you need to succeed.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to={findTalentHref}>
                <Button className="h-14 rounded-[8px] bg-white px-10 text-base font-normal text-[#3525CD] hover:bg-white/90">
                  Hire Expert Talent
                </Button>
              </Link>
              <Link to={findWorkHref}>
                <Button
                  variant="outline"
                  className="h-14 rounded-[8px] border-2 border-white bg-transparent px-10 text-base font-normal text-white hover:bg-white hover:text-[#3525CD]"
                >
                  Find Freelance Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </PublicSiteShell>
  );
};

const SectionHeader = ({ title, body, action }: { title: string; body: string; action?: ReactNode }) => (
  <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 className="text-base leading-6 text-[#191C1E]">{title}</h2>
      <p className="mt-1 text-base leading-6 text-[#464555]">{body}</p>
    </div>
    {action}
  </div>
);

const PrincipleCard = ({
  number,
  title,
  body,
  offset,
}: {
  number: string;
  title: string;
  body: string;
  offset: number;
}) => (
  <article
    className="relative flex gap-4 rounded-[16px] p-4 lg:translate-x-[calc(var(--offset)*16px)]"
    style={{ "--offset": offset } as React.CSSProperties}
  >
    <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#38BDF8] bg-[#0EA5E9] text-xs font-bold tracking-[0.16em] text-white shadow-md transition hover:scale-105">
      {number}
    </div>
    <div className="flex-1 border-b border-slate-200/80 pb-4">
      <h3 className="text-2xl font-bold leading-8 text-[#020617]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#475569]">{body}</p>
    </div>
  </article>
);

const CategoryCard = ({
  title,
  body,
  meta,
  color,
  iconImg,
  bgImage,
}: {
  title: string;
  body: string;
  meta: string;
  color: string;
  iconImg: string;
  bgImage: string;
}) => (
  <Link
    to="/explore"
    className="relative flex h-[254px] w-full flex-col overflow-hidden rounded-[12px] border border-[#C7C4D8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
  >
    <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-slate-950/65" />
    <div className="relative z-10 flex h-full flex-col gap-4 p-6">
      
      <div>
        <h3 className="text-base font-semibold leading-6 text-white">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-100">{body}</p>
      </div>
      <p className="mt-auto text-xs leading-5 text-[#A5C8FF]">{meta}</p>
    </div>
  </Link>
);

const ProcessStep = ({ title, body, icon: Icon }: { title: string; body: string; icon: typeof FileText }) => (
  <article className="flex flex-col items-center text-center">
    <div className="relative grid h-20 w-20 place-items-center rounded-full border border-[#C7C4D8] bg-white text-[#3525CD] shadow-lg">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="mt-6 text-base leading-6 text-[#191C1E]">{title}</h3>
    <p className="mt-2 max-w-sm text-base leading-6 text-[#464555]">{body}</p>
  </article>
);

const IconButton = ({ label, children, onClick }: { label: string; children: ReactNode; onClick: () => void }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="grid h-12 w-12 place-items-center rounded-full border border-[#C7C4D8] text-[#0081FF] transition hover:border-[#0081FF] hover:bg-[#0081FF]/5"
  >
    {children}
  </button>
);

const TestimonialCard = ({ quote, name, role }: { quote: string; name: string; role: string }) => (
  <article data-testimonial-card className="flex h-[274px] w-[394px] shrink-0 flex-col rounded-[12px] border border-[#C7C4D8] bg-white p-6 shadow-sm">
    <div className="flex gap-2 text-[#0081FF]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-5 w-5 fill-current" />
      ))}
    </div>
    <p className="mt-4 text-base italic leading-6 text-[#191C1E]">"{quote}"</p>
    <div className="mt-auto flex items-center gap-4 pt-6">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-[#C7C4D8] bg-[#ECEEF0] text-[#0081FF]">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <p className="text-base leading-6 text-[#191C1E]">{name}</p>
        <p className="text-base leading-6 text-[#464555]">{role}</p>
      </div>
    </div>
  </article>
);

const HomeFooter = () => (
  <footer className="border-t border-[#C7C4D8] bg-white py-10">
    <div className="container px-4 sm:px-6 grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div>
        <Logo size={56} />
        <p className="mt-4 max-w-xs text-base leading-6 text-[#464555]">
          The world's leading marketplace for high-end professional services and global talent acquisition.
        </p>
        <div className="mt-6 flex gap-4">
          <SocialButton label="Search GigClose">
            <Search className="h-5 w-5" />
          </SocialButton>
          <SocialButton label="GigClose trust">
            <ShieldCheck className="h-5 w-5" />
          </SocialButton>
        </div>
      </div>
      <FooterColumn title="Platform" links={["How it works", "For Enterprise", "Pricing", "Security"]} />
      <FooterColumn title="Company" links={["About Us", "Careers", "Press", "Contact"]} />
      <FooterColumn title="Resources" links={["Help Center", "Blog", "Community", "Legal"]} />
    </div>
    <div className="container mt-10 border-t border-[#C7C4D8] pt-6 text-base leading-6 text-[#464555]">
      © {new Date().getFullYear()} GigClose. All rights reserved.
    </div>
  </footer>
);

const FooterColumn = ({ title, links }: { title: string; links: string[] }) => (
  <div>
    <h3 className="text-base leading-6 text-[#191C1E]">{title}</h3>
    <div className="mt-4 flex flex-col gap-2">
      {links.map((link) => (
        <Link key={link} to={link === "Contact" ? "/contact" : "#"} className="text-base leading-6 text-[#464555] transition hover:text-[#0081FF]">
          {link}
        </Link>
      ))}
    </div>
  </div>
);

const SocialButton = ({ label, children }: { label: string; children: ReactNode }) => (
  <button type="button" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full bg-[#F2F4F6] text-[#464555] transition hover:text-[#0081FF]">
    {children}
  </button>
);

export default Home;
