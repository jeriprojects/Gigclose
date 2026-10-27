import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t border-[#C7C4D8] bg-white py-10">
    <div className="container grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
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
      <FooterColumn
        title="Platform"
        links={[
          { label: "How it works", to: "/how-it-works" },
          { label: "For Enterprise", to: "/explore" },
          { label: "Pricing", to: "/how-it-works" },
          { label: "Security", to: "/about" },
        ]}
      />
      <FooterColumn
        title="Company"
        links={[
          { label: "About Us", to: "/about" },
          { label: "Careers", to: "/about" },
          { label: "Press", to: "/about" },
          { label: "Contact", to: "/contact" },
        ]}
      />
      <FooterColumn
        title="Resources"
        links={[
          { label: "Help Center", to: "/contact" },
          { label: "Blog", to: "/explore" },
          { label: "Community", to: "/explore" },
          { label: "Legal", to: "/about" },
        ]}
      />
    </div>
    <div className="container mt-10 border-t border-[#C7C4D8] pt-6 text-base leading-6 text-[#464555]">
      © {new Date().getFullYear()} GigClose. All rights reserved.
    </div>
  </footer>
);

const FooterColumn = ({ title, links }: { title: string; links: { label: string; to: string }[] }) => (
  <div>
    <h3 className="text-base font-semibold leading-6 text-[#191C1E]">{title}</h3>
    <div className="mt-4 flex flex-col gap-2">
      {links.map((link) => (
        <Link key={link.label} to={link.to} className="text-base leading-6 text-[#464555] transition hover:text-[#0081FF]">
          {link.label}
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
