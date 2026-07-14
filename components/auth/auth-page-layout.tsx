import { Brain, FileText, Share2, type LucideIcon } from "lucide-react";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Architecture Generation",
    description:
      "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description:
      "Work together on the same canvas with live cursors and presence.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description:
      "Turn your finished architecture into a persistent Markdown technical spec.",
  },
];

function FeatureItem({ icon: Icon, title, description }: Feature) {
  return (
    <li className="flex gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-brand">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <p className="font-medium text-copy">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-copy-muted">
          {description}
        </p>
      </div>
    </li>
  );
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-base font-sans">
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16 xl:px-20">
        <div className="max-w-lg">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-copy">
              G
            </div>
            <span className="text-lg font-semibold text-copy">Ghost Assistant</span>
          </div>

          <h1 className="mt-10 text-3xl font-semibold leading-tight tracking-tight text-copy xl:text-4xl">
            Design systems at the speed of thought.
          </h1>

          <p className="mt-4 text-base leading-relaxed text-copy-secondary">
            Describe your architecture in plain English. Ghost Assistant maps it to a
            shared canvas your whole team can refine in real time.
          </p>

          <ul className="mt-10 space-y-6">
            {features.map((feature) => (
              <FeatureItem key={feature.title} {...feature} />
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        {children}
      </div>
    </div>
  );
}
