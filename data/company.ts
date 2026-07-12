/**
 * Company facts sourced from public pages on esquirecomputers.com.
 *
 * This is SEED data only. At runtime the storefront reads the `store` Setting
 * row, so an admin can edit any of it — including removing the staff directory
 * — without a code change. See prisma/seed.ts.
 */

export type Person = {
  department: string;
  name: string;
  phone?: string;
  email?: string;
};

export type ServiceLine = {
  label: string;
  numbers: string[];
};

export const company = {
  name: "Esquire Computers",
  shortName: "Esquire",
  tagline: "Two Decades of Service. A Lifetime of Trust",
  vision: "Leadership in Multi-Brands and Technologies",
  foundedOn: "1998-10-07",
  certification: "ISO 9001:2015",
  ceo: "Mr. P. Sureshkumar",
  engineers: 20,
  coverage: "All Kerala delivery and service",
  hours: "10 hours a day, 6 days a week",

  about: [
    "Esquire was established on 7 October 1998 as a service-oriented organisation rather than a sales-driven one. The founding principle has not changed: true success lies in lasting customer satisfaction, not in transactions.",
    "Two decades on, Esquire is an ISO 9001:2015 certified multi-brand dealer covering computers, networking, surveillance and IT infrastructure, with a service network spanning Kerala and a team of more than twenty qualified engineers.",
  ],

  values: [
    {
      title: "Customer-centric",
      body: "Solutions are tailored to the client, not pulled from a catalogue.",
    },
    {
      title: "Quality and reliability",
      body: "Dependable hardware, backed by a service contract that means something.",
    },
    {
      title: "Personalised service",
      body: "One point of contact across sales, installation and after-sales support.",
    },
  ],

  address: {
    line1: "Mannath Lane",
    line2: "M.G Road",
    city: "Thrissur-1",
    state: "Kerala",
    country: "India",
  },

  primary: {
    phone: "+91 9447 030 932",
    email: "website@esquirecomputers.com",
    whatsapp: "+919447030932",
  },

  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },

  /**
   * Publicly listed on their contact page. Seeded into Setting so it can be
   * trimmed from the admin panel if Esquire would rather not publish direct
   * mobile numbers.
   */
  directory: [
    {
      department: "CEO & Operations",
      name: "Suresh Parekkat",
      phone: "+91 9447 030 932",
      email: "sureshp@esquirecomputers.com",
    },
    {
      department: "Sales",
      name: "Sandhya Poduval",
      phone: "+91 9745 015 900",
      email: "sales@esquirecomputers.com",
    },
    { department: "Service", name: "Francis Chalisserry", email: "service@esquirecomputers.com" },
    {
      department: "Purchase",
      name: "Muhammed Sahil",
      phone: "+91 7907 115 022",
      email: "purchase@esquirecomputers.com",
    },
    {
      department: "Marketing",
      name: "Amrutha Nair",
      phone: "+91 8086 807 887",
      email: "operations@esquirecomputers.com",
    },
    {
      department: "HR",
      name: "Reshma K Rajan",
      phone: "+91 8111 99 4816",
      email: "hresquire@esquirecomputers.com",
    },
    {
      department: "Finance",
      name: "Alan Franco",
      phone: "+91 8848 517 345",
      email: "accounts@esquirecomputers.com",
    },
    {
      department: "Customer Care",
      name: "Rejitha Anil",
      phone: "+91 860 6464 422",
      email: "customercare@esquirecomputers.com",
    },
  ] satisfies Person[],

  serviceLines: [
    { label: "Onsite service", numbers: ["0487-2330931", "+91 8111 994 800"] },
    { label: "Laptop service", numbers: ["+91 9778 674 918"] },
    { label: "CCTV service", numbers: ["+91 9446 430 932"] },
  ] satisfies ServiceLine[],

  trust: [
    { value: "1998", label: "Serving since" },
    { value: "ISO 9001:2015", label: "Certified" },
    { value: "20+", label: "Qualified engineers" },
    { value: "All Kerala", label: "Delivery & service" },
  ],
};

export type Company = typeof company;
