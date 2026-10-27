import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_SKILL_GROUPS } from "@/lib/worker-skills";
import { cn } from "@/lib/utils";

type WorkerSkillsSelectorProps = {
  value: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
};

export const WorkerSkillsSelector = ({
  value,
  onChange,
  disabled = false,
}: WorkerSkillsSelectorProps) => {
  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (skill: string) => {
    onChange(
      value.includes(skill)
        ? value.filter((selected) => selected !== skill)
        : [...value, skill],
    );
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (!skill || value.some((selected) => selected.toLocaleLowerCase() === skill.toLocaleLowerCase())) return;
    onChange([...value, skill]);
    setCustomSkill("");
  };

  return (
    <div className="space-y-4">
      {WORKER_SKILL_GROUPS.map((group) => (
        <fieldset key={group.category}>
          <legend className="mb-2 text-xs font-semibold text-slate-700">{group.label}</legend>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => {
              const selected = value.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/50",
                  )}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold text-slate-700">Custom skills</legend>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            addCustomSkill();
          }}
        >
          <Input
            value={customSkill}
            onChange={(event) => setCustomSkill(event.target.value)}
            placeholder="Add a skill not listed"
            aria-label="Custom skill"
            maxLength={50}
            disabled={disabled}
          />
          <Button type="submit" variant="outline" disabled={disabled || !customSkill.trim()}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </form>
        {value.some((skill) =>
          WORKER_SKILL_GROUPS.every((group) =>
            group.skills.every((suggestedSkill) => suggestedSkill.toLocaleLowerCase() !== skill.toLocaleLowerCase()),
          ),
        ) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {value.filter((skill) =>
              WORKER_SKILL_GROUPS.every((group) =>
                group.skills.every((suggestedSkill) => suggestedSkill.toLocaleLowerCase() !== skill.toLocaleLowerCase()),
              ),
            ).map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  disabled={disabled}
                  onClick={() => onChange(value.filter((selected) => selected !== skill))}
                  className="rounded-full p-0.5 hover:bg-primary/15 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  );
};
