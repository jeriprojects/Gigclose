import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, FileText, ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Visibility = Database["public"]["Enums"]["professional_visibility"];
type ProfessionalSettings = Database["public"]["Tables"]["worker_professional_settings"]["Row"];
type Cv = Database["public"]["Tables"]["worker_cvs"]["Row"];
type Experience = Database["public"]["Tables"]["worker_experience"]["Row"];
type PortfolioItem = Database["public"]["Tables"]["worker_portfolio_items"]["Row"];
type PortfolioItemWithUrl = PortfolioItem & { mediaUrl: string };
type Section = "cv" | "portfolio" | "experience";

const STORAGE_BUCKET = "worker-professional-media";
const MAX_MEDIA_SIZE = 50 * 1024 * 1024;
const FILE_TYPES: Record<string, { type: "image" | "video"; extension: string }> = {
  "image/jpeg": { type: "image", extension: "jpg" },
  "image/png": { type: "image", extension: "png" },
  "image/webp": { type: "image", extension: "webp" },
  "image/gif": { type: "image", extension: "gif" },
  "video/mp4": { type: "video", extension: "mp4" },
  "video/webm": { type: "video", extension: "webm" },
  "video/quicktime": { type: "video", extension: "mov" },
};

const DEFAULT_SETTINGS: Omit<ProfessionalSettings, "user_id" | "updated_at"> = {
  cv_visibility: "private",
  portfolio_visibility: "private",
  experience_visibility: "private",
};

const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "Public — anyone can view",
  employers: "All signed-in employers",
  applied_employers: "Employers whose jobs I apply to",
  private: "Private — only me",
};

const visibilityDescription: Record<Visibility, string> = {
  public: "Anyone viewing your worker profile can see this section.",
  employers: "Only signed-in employer accounts can see this section.",
  applied_employers: "Only employers whose jobs you have applied to can see this section.",
  private: "This section is hidden from everyone else.",
};

const ProfessionalProfileSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const experienceFormRef = useRef<HTMLFormElement>(null);
  const portfolioFormRef = useRef<HTMLFormElement>(null);
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [isCurrentRole, setIsCurrentRole] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["professional-settings", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Sign in to manage your professional profile.");
      const { data, error } = await supabase
        .from("worker_professional_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? { user_id: user.id, ...DEFAULT_SETTINGS, updated_at: "" };
    },
    enabled: !!user,
  });

  const cvQuery = useQuery({
    queryKey: ["worker-cv", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Sign in to manage your CV.");
      const { data, error } = await supabase.from("worker_cvs").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const experienceQuery = useQuery({
    queryKey: ["worker-experience", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Sign in to manage your work experience.");
      const { data, error } = await supabase
        .from("worker_experience")
        .select("*")
        .eq("worker_id", user.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const portfolioQuery = useQuery({
    queryKey: ["worker-portfolio", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Sign in to manage your portfolio.");
      const { data, error } = await supabase
        .from("worker_portfolio_items")
        .select("*")
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Promise.all(data.map(async (item): Promise<PortfolioItemWithUrl> => {
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(item.media_path, 15 * 60);
        if (urlError) throw urlError;
        return { ...item, mediaUrl: signedUrl.signedUrl };
      }));
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!cvQuery.data) return;
    setHeadline(cvQuery.data.headline);
    setSummary(cvQuery.data.summary);
    setSkills(cvQuery.data.skills.join(", "));
    setEducation(cvQuery.data.education);
    setCertifications(cvQuery.data.certifications);
  }, [cvQuery.data]);

  const saveSettings = useMutation({
    mutationFn: async ({ section, visibility }: { section: Section; visibility: Visibility }) => {
      if (!user) throw new Error("Sign in to update visibility.");
      const current = settingsQuery.data ?? { user_id: user.id, ...DEFAULT_SETTINGS, updated_at: "" };
      const { error } = await supabase
        .from("worker_professional_settings")
        .upsert({
          user_id: user.id,
          cv_visibility: section === "cv" ? visibility : current.cv_visibility,
          portfolio_visibility: section === "portfolio" ? visibility : current.portfolio_visibility,
          experience_visibility: section === "experience" ? visibility : current.experience_visibility,
        }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["professional-settings", user?.id] });
      toast.success("Visibility updated");
    },
    onError: (error: Error) => toast.error("Could not update visibility", { description: error.message }),
  });

  const saveCv = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to save your CV.");
      const cleanSkills = skills.split(",").map((skill) => skill.trim()).filter(Boolean);
      if (headline.trim().length > 120 || summary.trim().length > 5000 || education.trim().length > 3000 || certifications.trim().length > 3000) {
        throw new Error("One or more CV fields exceed the allowed length.");
      }
      if (cleanSkills.length > 30 || cleanSkills.some((skill) => skill.length > 80)) {
        throw new Error("Add up to 30 skills, with no more than 80 characters per skill.");
      }
      const { error } = await supabase.from("worker_cvs").upsert({
        user_id: user.id,
        headline: headline.trim(),
        summary: summary.trim(),
        skills: cleanSkills,
        education: education.trim(),
        certifications: certifications.trim(),
      }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["worker-cv", user?.id] });
      toast.success("CV saved");
    },
    onError: (error: Error) => toast.error("Could not save your CV", { description: error.message }),
  });

  const addExperience = useMutation({
    mutationFn: async (experience: Omit<Database["public"]["Tables"]["worker_experience"]["Insert"], "worker_id">) => {
      if (!user) throw new Error("Sign in to add work experience.");
      const { error } = await supabase.from("worker_experience").insert({ ...experience, worker_id: user.id });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["worker-experience", user?.id] });
      experienceFormRef.current?.reset();
      setIsCurrentRole(false);
      toast.success("Experience added");
    },
    onError: (error: Error) => toast.error("Could not add experience", { description: error.message }),
  });

  const deleteExperience = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Sign in to manage work experience.");
      const { error } = await supabase.from("worker_experience").delete().eq("id", id).eq("worker_id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["worker-experience", user?.id] });
      toast.success("Experience removed");
    },
    onError: (error: Error) => toast.error("Could not remove experience", { description: error.message }),
  });

  const addPortfolioItem = useMutation({
    mutationFn: async ({ title, description, file }: { title: string; description: string; file: File }) => {
      if (!user) throw new Error("Sign in to add portfolio work.");
      const mediaDetails = FILE_TYPES[file.type];
      if (!mediaDetails) throw new Error("Choose a supported image or video file.");
      if (file.size > MAX_MEDIA_SIZE) throw new Error("Files must be 50 MB or smaller.");
      if (!title.trim() || title.length > 160 || description.length > 3000) {
        throw new Error("Add a title (up to 160 characters) and keep the description under 3,000 characters.");
      }

      const path = `${user.id}/${crypto.randomUUID()}.${mediaDetails.extension}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        contentType: file.type,
        cacheControl: "60",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("worker_portfolio_items").insert({
        worker_id: user.id,
        title: title.trim(),
        description: description.trim(),
        media_path: path,
        media_type: mediaDetails.type,
      });
      if (insertError) {
        const { error: cleanupError } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        if (cleanupError) {
          console.error("Could not remove portfolio upload after database insert failed.", cleanupError);
          throw new Error(`${insertError.message} The uploaded file could not be cleaned up.`);
        }
        throw insertError;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["worker-portfolio", user?.id] });
      portfolioFormRef.current?.reset();
      toast.success("Portfolio item added");
    },
    onError: (error: Error) => toast.error("Could not add portfolio item", { description: error.message }),
  });

  const deletePortfolioItem = useMutation({
    mutationFn: async (item: PortfolioItem) => {
      if (!user) throw new Error("Sign in to manage your portfolio.");
      const { error: deleteError } = await supabase
        .from("worker_portfolio_items")
        .delete()
        .eq("id", item.id)
        .eq("worker_id", user.id);
      if (deleteError) throw deleteError;
      const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([item.media_path]);
      return storageError?.message ?? null;
    },
    onSuccess: async (cleanupError) => {
      await queryClient.invalidateQueries({ queryKey: ["worker-portfolio", user?.id] });
      if (cleanupError) {
        toast.error("Portfolio item removed, but its media could not be deleted", { description: cleanupError });
      } else {
        toast.success("Portfolio item removed");
      }
    },
    onError: (error: Error) => toast.error("Could not remove portfolio item", { description: error.message }),
  });

  const handleExperienceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addExperience.mutate({
      job_title: String(formData.get("job_title") ?? "").trim(),
      organization: String(formData.get("organization") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      start_date: String(formData.get("start_date") ?? ""),
      end_date: isCurrentRole ? null : String(formData.get("end_date") ?? "") || null,
      is_current: isCurrentRole,
      description: String(formData.get("description") ?? "").trim(),
    });
  };

  const handlePortfolioSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("media");
    if (!(file instanceof File) || file.size === 0) {
      toast.error("Choose an image or video to upload");
      return;
    }
    addPortfolioItem.mutate({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      file,
    });
  };

  if (!user) return null;

  return (
    <section className="gig-panel p-4 sm:p-5">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold">Your professional profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Build your CV, showcase portfolio work, and manage your experience. Each section starts private.
        </p>
      </div>

      <Tabs defaultValue="cv">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted p-1">
          <TabsTrigger value="cv" className="gap-1.5 rounded-lg px-2 py-2 text-xs sm:text-sm"><FileText className="h-4 w-4" /> CV</TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5 rounded-lg px-2 py-2 text-xs sm:text-sm"><ImagePlus className="h-4 w-4" /> Portfolio</TabsTrigger>
          <TabsTrigger value="experience" className="gap-1.5 rounded-lg px-2 py-2 text-xs sm:text-sm"><BriefcaseBusiness className="h-4 w-4" /> Experience</TabsTrigger>
        </TabsList>

        <TabsContent value="cv" className="mt-5">
          {cvQuery.isError && <QueryError message="Your CV could not be loaded." />}
          {settingsQuery.isError && <QueryError message="Visibility settings could not be loaded." />}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">CV details</h3>
              <p className="text-sm text-muted-foreground">Add a headline, summary, skills, education, and certifications.</p>
            </div>
            <VisibilitySelect
              label="CV visibility"
              value={settingsQuery.data?.cv_visibility ?? "private"}
              disabled={settingsQuery.isLoading || saveSettings.isPending}
              onChange={(visibility) => saveSettings.mutate({ section: "cv", visibility })}
            />
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveCv.mutate();
            }}
          >
            <Field label="Professional headline" htmlFor="cv-headline">
              <Input id="cv-headline" value={headline} maxLength={120} onChange={(event) => setHeadline(event.target.value)} placeholder="e.g. Experienced electrician and maintenance technician" />
            </Field>
            <Field label="Professional summary" htmlFor="cv-summary">
              <Textarea id="cv-summary" value={summary} maxLength={5000} onChange={(event) => setSummary(event.target.value)} placeholder="Summarize your experience, strengths, and the work you do best." rows={5} />
            </Field>
            <Field label="Skills" htmlFor="cv-skills" hint="Separate skills with commas.">
              <Input id="cv-skills" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Electrical installation, troubleshooting, safety" />
            </Field>
            <Field label="Education and training" htmlFor="cv-education">
              <Textarea id="cv-education" value={education} maxLength={3000} onChange={(event) => setEducation(event.target.value)} placeholder="Schools, qualifications, and relevant training" rows={3} />
            </Field>
            <Field label="Certifications" htmlFor="cv-certifications">
              <Textarea id="cv-certifications" value={certifications} maxLength={3000} onChange={(event) => setCertifications(event.target.value)} placeholder="Relevant licenses and professional certifications" rows={3} />
            </Field>
            <Button type="submit" disabled={saveCv.isPending}>{saveCv.isPending ? "Saving CV..." : "Save CV"}</Button>
          </form>
          {!cvQuery.isLoading && !cvQuery.isError && !hasCv(cvQuery.data) && (
            <EmptyContentMessage message="No CV added yet." />
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="mt-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">Portfolio work</h3>
              <p className="text-sm text-muted-foreground">Upload an image or video with details about the work.</p>
            </div>
            <VisibilitySelect
              label="Portfolio visibility"
              value={settingsQuery.data?.portfolio_visibility ?? "private"}
              disabled={settingsQuery.isLoading || saveSettings.isPending}
              onChange={(visibility) => saveSettings.mutate({ section: "portfolio", visibility })}
            />
          </div>
          <form ref={portfolioFormRef} onSubmit={handlePortfolioSubmit} className="space-y-4 rounded-2xl border border-border p-4">
            <Field label="Project title" htmlFor="portfolio-title">
              <Input id="portfolio-title" name="title" required maxLength={160} placeholder="What did you work on?" />
            </Field>
            <Field label="Description and details" htmlFor="portfolio-description">
              <Textarea id="portfolio-description" name="description" maxLength={3000} placeholder="Describe the project, your role, tools, or outcome." rows={4} />
            </Field>
            <Field label="Image or video" htmlFor="portfolio-media" hint="JPEG, PNG, WebP, GIF, MP4, WebM, or MOV. Maximum 50 MB.">
              <Input id="portfolio-media" name="media" type="file" required accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" className="file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:font-semibold file:text-primary" />
            </Field>
            <Button type="submit" disabled={addPortfolioItem.isPending} className="gap-2">
              <Plus className="h-4 w-4" /> {addPortfolioItem.isPending ? "Uploading..." : "Add portfolio item"}
            </Button>
          </form>

          {portfolioQuery.isError && <QueryError message="Portfolio could not be loaded." />}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {portfolioQuery.data?.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-border bg-background">
                {item.media_type === "video" ? (
                  <video src={item.mediaUrl} controls preload="metadata" className="aspect-video w-full bg-black" aria-label={item.title} />
                ) : (
                  <img src={item.mediaUrl} alt={item.title} className="aspect-video w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${item.title}`} disabled={deletePortfolioItem.isPending} onClick={() => deletePortfolioItem.mutate(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                  {item.description && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
          {!portfolioQuery.isLoading && !portfolioQuery.isError && portfolioQuery.data?.length === 0 && (
            <EmptyContentMessage message="No portfolio items added yet." />
          )}
        </TabsContent>

        <TabsContent value="experience" className="mt-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">Work history and experience</h3>
              <p className="text-sm text-muted-foreground">Add roles and projects that help employers understand your background.</p>
            </div>
            <VisibilitySelect
              label="Experience visibility"
              value={settingsQuery.data?.experience_visibility ?? "private"}
              disabled={settingsQuery.isLoading || saveSettings.isPending}
              onChange={(visibility) => saveSettings.mutate({ section: "experience", visibility })}
            />
          </div>
          <form ref={experienceFormRef} onSubmit={handleExperienceSubmit} className="space-y-4 rounded-2xl border border-border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role or job title" htmlFor="experience-title">
                <Input id="experience-title" name="job_title" required maxLength={120} placeholder="e.g. Freelance Graphic Designer" />
              </Field>
              <Field label="Company or client" htmlFor="experience-organization">
                <Input id="experience-organization" name="organization" required maxLength={160} placeholder="Company or client name" />
              </Field>
              <Field label="Location" htmlFor="experience-location">
                <Input id="experience-location" name="location" maxLength={160} placeholder="City, country, or remote" />
              </Field>
              <Field label="Start date" htmlFor="experience-start">
                <Input id="experience-start" name="start_date" type="date" required />
              </Field>
              <Field label="End date" htmlFor="experience-end">
                <Input id="experience-end" name="end_date" type="date" disabled={isCurrentRole} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isCurrentRole} onChange={(event) => setIsCurrentRole(event.target.checked)} className="h-4 w-4 accent-primary" />
              I currently work in this role
            </label>
            <Field label="Description" htmlFor="experience-description">
              <Textarea id="experience-description" name="description" maxLength={3000} placeholder="Describe your responsibilities, achievements, or relevant projects." rows={4} />
            </Field>
            <Button type="submit" disabled={addExperience.isPending} className="gap-2"><Plus className="h-4 w-4" /> {addExperience.isPending ? "Adding..." : "Add experience"}</Button>
          </form>

          {experienceQuery.isError && <QueryError message="Work history could not be loaded." />}
          <div className="mt-5 space-y-3">
            {experienceQuery.data?.map((item) => (
              <ExperienceCard
                key={item.id}
                item={item}
                deleting={deleteExperience.isPending}
                onDelete={() => deleteExperience.mutate(item.id)}
              />
            ))}
          </div>
          {!experienceQuery.isLoading && !experienceQuery.isError && experienceQuery.data?.length === 0 && (
            <EmptyContentMessage message="No work history or experience added yet." />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

const VisibilitySelect = ({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: Visibility;
  disabled: boolean;
  onChange: (value: Visibility) => void;
}) => (
  <div className="w-full max-w-sm">
    <Label className="text-xs" htmlFor={`visibility-${label.toLowerCase().replace(/\s+/g, "-")}`}>{label}</Label>
    <select
      id={`visibility-${label.toLowerCase().replace(/\s+/g, "-")}`}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as Visibility)}
      className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
    >
      {(Object.keys(VISIBILITY_LABELS) as Visibility[]).map((visibility) => (
        <option key={visibility} value={visibility}>{VISIBILITY_LABELS[visibility]}</option>
      ))}
    </select>
    <p className="mt-1 text-xs text-muted-foreground">{visibilityDescription[value]}</p>
  </div>
);

const Field = ({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const ExperienceCard = ({ item, deleting, onDelete }: { item: Experience; deleting: boolean; onDelete: () => void }) => (
  <article className="rounded-2xl border border-border bg-background p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h4 className="font-semibold">{item.job_title}</h4>
        <p className="text-sm text-primary">{item.organization}{item.location ? ` · ${item.location}` : ""}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatMonth(item.start_date)} – {item.is_current ? "Present" : item.end_date ? formatMonth(item.end_date) : "End date not set"}
        </p>
      </div>
      <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${item.job_title} at ${item.organization}`} disabled={deleting} onClick={onDelete}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
    {item.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.description}</p>}
  </article>
);

const formatMonth = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short" });

const QueryError = ({ message }: { message: string }) => (
  <p role="alert" className="mt-4 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-900">{message}</p>
);

const hasCv = (cv: Cv | null | undefined) => Boolean(cv && (
  cv.headline || cv.summary || cv.skills.length || cv.education || cv.certifications
));

const EmptyContentMessage = ({ message }: { message: string }) => (
  <p className="mt-5 rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900">
    {message}
  </p>
);

export default ProfessionalProfileSettings;
