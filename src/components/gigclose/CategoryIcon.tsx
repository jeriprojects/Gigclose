import { CATEGORY_META, JobCategory } from "@/lib/gigs";

type CategoryIconProps = {
  category: JobCategory;
  className?: string;
};

export const CategoryIcon = ({ category, className }: CategoryIconProps) => {
  const Icon = CATEGORY_META[category].icon;
  return <Icon aria-hidden="true" className={className} />;
};
