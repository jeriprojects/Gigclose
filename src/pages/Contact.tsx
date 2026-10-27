import { ReactNode, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Clock3, Mail, MapPin, MessageSquare, Phone, Send, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/gigclose/PublicSiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const roles = ["Freelancer", "Client / Company", "Enterprise Partner"] as const;

const faqs = [
  {
    question: "How quickly will the team respond to my inquiry?",
    answer: "We aim to reply to general inquiries within 24 hours. Include any relevant details in your message so we can direct it to the right team.",
  },
  {
    question: "How does escrow work on GigClose?",
    answer: "GigClose uses escrow-backed payments for eligible work. The parties agree on the work and milestones, and funds are handled through the platform as the work progresses.",
  },
  {
    question: "Can I contact GigClose about a milestone or payment issue?",
    answer: "Yes. Select the role that best describes you and include the relevant job or contract details in your message so our team can review your inquiry.",
  },
  {
    question: "Can a company contact GigClose about hiring a team?",
    answer: "Yes. Choose Client / Company or Enterprise Partner and tell us about your hiring needs, team requirements, or project scope.",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [role, setRole] = useState<(typeof roles)[number]>(roles[0]);

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contact_inquiries").insert({
        ...form,
        message: `Current role: ${role}\n\n${form.message}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Message sent", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setRole(roles[0]);
    },
    onError: (error: Error) => toast({ title: "Could not send", description: error.message, variant: "destructive" }),
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <PublicSiteShell>
      <section className="relative isolate overflow-hidden bg-white pb-20 pt-12 sm:pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[350px] w-[900px] -translate-x-1/2 rounded-full bg-[#c0c1ff]/20 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[-8rem] top-[28rem] -z-10 h-[400px] w-[500px] rounded-full bg-sky-400/10 blur-[100px]" />

        <div className="container space-y-12">
          <header className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-sky-600">Contact</p>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-[#0f2d4a] sm:text-5xl lg:text-[56px] lg:leading-[1.14]">
              <span className="text-[#459cff]">Get in touch with the</span>
              <br className="hidden sm:block" /> GigClose <span className="text-[#459cff]">team</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Whether you&apos;re closing an enterprise contract, need help with escrow, or are looking for great talent, our team is here to help.
            </p>

            <div className="mx-auto mt-8 grid max-w-3xl gap-3 rounded-2xl bg-[#459cff] p-4 text-white shadow-sm sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                <Clock3 aria-hidden="true" className="h-4 w-4 shrink-0" />
                We aim to reply within 24 hours
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                <Users aria-hidden="true" className="h-4 w-4 shrink-0" />
                Support for workers &amp; clients
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold sm:col-span-2 lg:col-span-1">
                <MessageSquare aria-hidden="true" className="h-4 w-4 shrink-0" />
                Escrow &amp; milestone support
              </div>
            </div>
          </header>

          <section className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-br from-[#459cff] to-sky-600 p-5 shadow-[0_20px_50px_-30px_rgba(14,116,214,0.55)] sm:p-8 lg:p-10">
            <div className="mb-7">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Transmit an inquiry</h2>
              <p className="mt-2 text-sm leading-6 text-white/85 sm:text-base">
                Direct routing to our support team and talent leads.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submit.mutate();
              }}
              className="space-y-5"
              aria-label="Contact form"
            >
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-white">Select your current role</legend>
                <div className="grid grid-cols-1 gap-2 rounded-lg bg-white p-1 sm:grid-cols-3">
                  {roles.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={role === option}
                      onClick={() => setRole(option)}
                      className={`min-h-10 rounded-md px-3 py-2 text-sm font-semibold transition ${
                        role === option
                          ? "bg-[#459cff] text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="contact-name" label="Full name">
                  <Input id="contact-name" autoComplete="name" required value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your name" className="h-11 rounded-lg border-white bg-white text-slate-900 placeholder:text-slate-400" />
                </Field>
                <Field id="contact-email" label="Work email">
                  <Input id="contact-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@company.com" className="h-11 rounded-lg border-white bg-white text-slate-900 placeholder:text-slate-400" />
                </Field>
                <Field id="contact-phone" label="Phone">
                  <Input id="contact-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Optional" className="h-11 rounded-lg border-white bg-white text-slate-900 placeholder:text-slate-400" />
                </Field>
                <Field id="contact-subject" label="Inquiry type">
                  <Input id="contact-subject" required value={form.subject} onChange={(event) => updateField("subject", event.target.value)} placeholder="What can we help you with?" className="h-11 rounded-lg border-white bg-white text-slate-900 placeholder:text-slate-400" />
                </Field>
              </div>

              <Field id="contact-message" label="Message & specifications">
                <Textarea
                  id="contact-message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Describe your request, milestone, or project scope. Include a contract ID if applicable."
                  className="resize-y rounded-lg border-white bg-white text-slate-900 placeholder:text-slate-400"
                />
              </Field>

              <div className="flex flex-col gap-3 border-t border-white/25 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-white/80">
                  Please don&apos;t include passwords or sensitive payment details.
                </p>
                <Button type="submit" disabled={submit.isPending} className="h-12 gap-2 rounded-lg bg-black px-6 font-bold text-white hover:bg-slate-800">
                  <Send aria-hidden="true" className="h-4 w-4" />
                  {submit.isPending ? "Sending..." : "Send message"}
                </Button>
              </div>
            </form>
          </section>

          <section className="mx-auto max-w-3xl">
            <header className="mb-6 text-center">
              <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">Frequently resolved questions</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                Quick answers about support, payments, and hiring.
              </p>
            </header>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white px-5 shadow-sm">
                  <AccordionTrigger className="gap-4 text-left text-sm font-semibold text-slate-900 hover:no-underline sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <aside className="mx-auto flex max-w-5xl flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-600">
                <Mail aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900">Want to learn more about GigClose?</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Explore how workers and clients use the platform.
                </p>
              </div>
            </div>
            <Link to="/how-it-works" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Explore how it works <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </aside>

          <div className="mx-auto grid max-w-5xl gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-4">
              <MapPin aria-hidden="true" className="h-4 w-4 text-sky-600" />
              Abuja, Nigeria
            </div>
            <a href="tel:+2348000000000" className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-4 transition hover:text-sky-700">
              <Phone aria-hidden="true" className="h-4 w-4 text-sky-600" />
              +234 800 000 0000
            </a>
            <a href="mailto:hello@gigsclose.com" className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-4 transition hover:text-sky-700">
              <Mail aria-hidden="true" className="h-4 w-4 text-sky-600" />
              hello@gigsclose.com
            </a>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
};

const Field = ({ id, label, children }: { id: string; label: string; children: ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-medium text-white">{label}</Label>
    {children}
  </div>
);

export default Contact;
