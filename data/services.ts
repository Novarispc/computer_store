/** The six services listed on esquirecomputers.com/services. */

export type Service = {
  slug: string;
  title: string;
  body: string;
  icon: string; // lucide-react icon name
};

export const services: Service[] = [
  {
    slug: "onsite-support",
    title: "Expert onsite support",
    body: "Fast, efficient, and handled by trained professionals who understand your business needs.",
    icon: "Wrench",
  },
  {
    slug: "after-sales-care",
    title: "Comprehensive after-sales care",
    body: "Direct support from our own service centre for every product we sell, warranty included. One number to call, whoever made the hardware.",
    icon: "LifeBuoy",
  },
  {
    slug: "user-training",
    title: "Free user training",
    body: "We train your people to run the system themselves, which cuts downtime and the number of calls you need to make.",
    icon: "GraduationCap",
  },
  {
    slug: "standby-systems",
    title: "Standby systems",
    body: "Replacement units or components while yours is being serviced under warranty, on selected desktop configurations.",
    icon: "Server",
  },
  {
    slug: "preventive-maintenance",
    title: "Preventive maintenance",
    body: "Quarterly hardware clean-ups at no charge for the duration of the warranty and any Annual Maintenance Contract.",
    icon: "ShieldCheck",
  },
  {
    slug: "extended-support",
    title: "Extended support",
    body: "Continuing service for systems covered by an active Annual Maintenance Contract, long after the warranty ends.",
    icon: "CalendarClock",
  },
];
