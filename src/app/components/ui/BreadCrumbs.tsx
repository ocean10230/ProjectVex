import { ChevronRight } from "lucide-react";
import React from "react";

interface CrumbProps {
  ClassName?: string;
  Items: string[];
}

interface BreadCrumbsProps {
  Crumb: CrumbProps;
}

const Breadcrumb: React.FC<BreadCrumbsProps> = ({
  Crumb,
}) => {
  const { ClassName = "", Items = [] } = Crumb;

  if (!Items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 ${ClassName}`}>
      <ol className="flex items-center gap-1">
        {Items.map((item, index) => {
          const isLast = index === Items.length - 1;

          return (
            <li key={`${item}-${index}`} className="flex items-center gap-1">
              <span
                aria-current={isLast ? "page" : undefined}
              >
                {item}
              </span>
              {!isLast && (
                <ChevronRight className="size-3.5" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb