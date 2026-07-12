export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export const MOCK_OWNED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Payment Gateway",
    slug: "payment-gateway",
    isOwned: true,
  },
  {
    id: "proj-2",
    name: "Event Bus Platform",
    slug: "event-bus-platform",
    isOwned: true,
  },
];

export const MOCK_SHARED_PROJECTS: Project[] = [
  {
    id: "proj-3",
    name: "Analytics Pipeline",
    slug: "analytics-pipeline",
    isOwned: false,
  },
];
