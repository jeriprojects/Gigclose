import { CATEGORY_META, normalizeSearchText, type Job } from "@/lib/gigs";

export const WORKER_SKILL_GROUPS = [
  {
    category: "cleaning",
    label: "Cleaning",
    skills: ["Home cleaning", "Deep cleaning", "Office cleaning"],
  },
  {
    category: "delivery",
    label: "Delivery",
    skills: ["Delivery", "Courier services", "Dispatch riding"],
  },
  {
    category: "electrical",
    label: "Electrical",
    skills: ["Electrical repairs", "Wiring", "Appliance installation"],
  },
  {
    category: "plumbing",
    label: "Plumbing",
    skills: ["Plumbing repairs", "Pipe installation", "Drain cleaning"],
  },
  {
    category: "moving",
    label: "Moving",
    skills: ["Moving assistance", "Packing", "Furniture assembly"],
  },
  {
    category: "creative",
    label: "Creative",
    skills: ["Graphic design", "Photography", "Video editing", "Content writing"],
  },
  {
    category: "handyman",
    label: "Handyman",
    skills: ["General repairs", "Carpentry", "Painting", "TV mounting"],
  },
  {
    category: "other",
    label: "Other services",
    skills: ["Event support", "Catering", "Gardening"],
  },
  {
    category: null,
    label: "IT",
    skills: [
      "IT support",
      "Software development",
      "Web development",
      "Mobile app development",
      "Data analysis",
      "Cybersecurity",
      "Networking",
      "Cloud computing",
      "Database management",
      "UI/UX design",
      "Computer repair",
    ],
  },
  {
    category: null,
    label: "All sectors",
    skills: [
      "Customer service",
      "Administration",
      "Sales",
      "Data entry",
      "Project coordination",
      "Event support",
      "Catering",
      "Gardening",
      "General labor",
      "Retail assistance",
    ],
  },
] as const satisfies ReadonlyArray<{
  category: Job["category"] | null;
  label: string;
  skills: readonly string[];
}>;

export function getMatchingWorkerSkills(job: Job, skills: string[]) {
  const jobText = normalizeSearchText(
    `${job.title} ${job.description ?? ""} ${CATEGORY_META[job.category].label}`,
  );

  return skills.filter((skill) => {
    const normalizedSkill = normalizeSearchText(skill);
    if (!normalizedSkill) return false;

    const group = WORKER_SKILL_GROUPS.find((item) =>
      item.skills.some((suggestedSkill) => normalizeSearchText(suggestedSkill) === normalizedSkill),
    );
    if (group?.category === job.category) return true;
    return jobText.includes(normalizedSkill);
  });
}

export function jobMatchesWorkerSkills(job: Job, skills: string[]) {
  return getMatchingWorkerSkills(job, skills).length > 0;
}
