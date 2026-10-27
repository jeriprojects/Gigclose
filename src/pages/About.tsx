import { Link } from "react-router-dom";
import { PublicSiteShell } from "@/components/gigclose/PublicSiteShell";
import aboutHeroImage from "@/assets/gigclose-about.jpg";
import gigcloseStartedImage from "@/assets/gigclose-started.jpg";


const principles = [
  {
    title: "Quality First",
    text: "We vet for excellence, ensuring every connection leads to high-impact results and professional growth.",
  },
  {
    title: "Global Connection",
    text: "Breaking geographical borders to bring the world's most talented minds to your most pressing challenges.",
  },
  {
    title: "Trust & Security",
    text: "Integrated escrow and contract systems designed to protect both the freelancer and the client at every step.",
  },
  {
    title: "Innovation",
    text: "We continuously evolve our tools to match the rapid pace of the modern digital workspace and talent economy.",
  },
];

const leaders = [
  { name: "Sarah J. Miller", role: "CEO & Co-Founder" },
  { name: "David Chen", role: "CTO & Co-Founder" },
  { name: "Elena Rodriguez", role: "Head of Product" },
];

const About = () => (
  <PublicSiteShell>
    <main className="overflow-hidden bg-white text-slate-950">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">About us</p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Empowering the Future of Work
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
              Connecting top-tier freelance talent with visionary companies to build the products, services, and experiences of tomorrow.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-lg bg-sky-400 px-8 py-4 text-base font-semibold text-white transition hover:bg-sky-500"
              >
                Get Started
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                View Projects
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_45px_-20px_rgba(0,0,0,0.2)]">
            <img
              src={aboutHeroImage}
              alt="GigClose team collaborating"
              className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[520px]"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Our mission</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Bridging the gap between talent and opportunity.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              At GigClose, we believe the best work happens when high-caliber expertise meets ambitious vision. Our mission is to dismantle the barriers of traditional employment and create a seamless, secure, and efficient platform for freelancers and companies alike.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((item, index) => (
              <article
                key={item.title}
                style={{ animationDelay: `${index * 120}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm duration-700 transition-all hover:-translate-y-2 hover:border-sky-300 hover:shadow-xl motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                  <div className="h-5 w-5 rounded-full bg-sky-600 transition-colors duration-300 group-hover:bg-sky-500 motion-reduce:transition-none" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <img
              src={gigcloseStartedImage}
              alt="GigClose story"
              className="h-[280px] w-full object-cover sm:h-[360px]"
            />
          </div>

          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              The GigClose Story
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
              <p>
                GigClose started in 2021 with a simple observation: the friction between finding top-tier talent and executing high-level projects was slowing down innovation.
              </p>
              <p>
                We began with a small group of verified designers and engineers, focusing on the quality of interactions rather than the volume of users. This commitment to &quot;Closing the Gap&quot; quickly resonated with startups and enterprise teams alike.
              </p>
              <p>
                Today, GigClose serves thousands of professionals globally, continuing to innovate on how contracts are managed, how talent is discovered, and how the future of work is defined.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Meet the Leadership
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              The visionaries behind the GigClose platform.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {leaders.map((person) => (
              <div
                key={person.name}
                className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm"
              >
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 text-3xl font-semibold text-slate-600">
                  {person.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-950">{person.name}</h3>
                <p className="mt-2 text-base text-sky-600">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative mx-auto overflow-hidden rounded-[2rem] bg-[#0081FF] px-6 py-16 text-center text-white sm:px-10 lg:px-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.32),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(125,211,252,0.34),transparent_44%)]" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your workflow?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
              Join the thousands of companies and talent already shaping the future of work on GigClose.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 font-semibold text-[#0081FF] transition hover:bg-slate-100"
              >
                Find Talent
              </Link>
              <Link
                to="/auth?role=worker"
                className="inline-flex items-center justify-center rounded-lg border border-white/60 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Start Working
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  </PublicSiteShell>
);

export default About;
