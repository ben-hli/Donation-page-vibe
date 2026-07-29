export interface Charity {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  costPerWellby: number;
  confidenceScore: number;
  outcomeLabel: string;
  costPerOutcome: number;
  website: string;
  tier: 'top' | 'promising';
  defaultSplitPct: number;
  logoUrl?: string;
  reportUrl?: string;
}

export interface DonationOption {
  id: 'hlf' | 'recommended' | 'hli';
  name: string;
  shortName?: string;
  tagline: string;
  description: string;
  recommended: boolean;
}

export const charities: Charity[] = [
  {
    id: 'strongminds',
    name: 'StrongMinds',
    shortDescription: 'Group therapy for depression in sub-Saharan Africa',
    fullDescription:
      'StrongMinds provides group interpersonal psychotherapy to women suffering from depression in Uganda and Zambia. Their programme has strong evidence of effectiveness and reaches tens of thousands of people each year.',
    costPerWellby: 24.75,
    confidenceScore: 10,
    outcomeLabel: 'One-to-one psychotherapy courses funded',
    costPerOutcome: 44.56,
    website: 'https://strongminds.org',
    tier: 'top',
    defaultSplitPct: 33.33,
  },
  {
    id: 'friendship-bench',
    name: 'Friendship Bench',
    shortDescription: 'Problem-solving therapy delivered by trained grandmothers in Zimbabwe',
    fullDescription:
      'Friendship Bench trains older women to deliver evidence-based problem-solving therapy (PST) for depression in Zimbabwe. Their innovative community model combines local trust with clinical effectiveness.',
    costPerWellby: 20.62,
    confidenceScore: 9,
    outcomeLabel: 'Group psychotherapy courses funded',
    costPerOutcome: 16.50,
    website: 'https://www.friendshipbenchzimbabwe.org',
    tier: 'top',
    defaultSplitPct: 33.33,
  },
  {
    id: 'taimaka',
    name: 'Taimaka',
    shortDescription: 'Integrated mental and physical health support in West Africa',
    fullDescription:
      'Taimaka treats childhood acute malnutrition in northeastern Nigeria. They are a newer charity with a high cost-effectiveness estimate, but the evidence behind less robust than our Top Charities, making them a higher-risk, higher-reward option.',
    costPerWellby: 15.15,
    confidenceScore: 3,
    outcomeLabel: 'Children protected from malnutrition',
    costPerOutcome: 87.21,
    website: 'https://taimaka.org',
    tier: 'promising',
    defaultSplitPct: 13.33,
  },
  {
    id: 'pure-earth',
    name: 'Pure Earth',
    shortDescription: 'Reducing pollution to improve mental and physical health globally',
    fullDescription:
      'Pure Earth works with governments to identify and remove pollution hotspots in low- and middle-income countries. Money donated here funds their project to remove lead from eyeliner in Ghana often used on children. This is the most cost-effective project we have reviewed to date, but the evidence linking lead exposure in childhood to adult wellbeing is weaker than we would like, making this a higher risk, higher reward option.',
    costPerWellby: 9.23,
    confidenceScore: 4,
    outcomeLabel: 'Children protected from lead exposure',
    costPerOutcome: 0.23,
    website: 'https://www.pureearth.org',
    tier: 'promising',
    defaultSplitPct: 20,
  },
];

export const donationOptions: DonationOption[] = [
  {
    id: 'hlf',
    name: 'Happier Lives Fund',
    shortName: 'HLF',
    tagline: 'Expert-directed impact',
    description:
      'We use our independent research to direct your donation where it will have the greatest impact on wellbeing. 10% of funds supports HLI\'s ongoing research; the remainder goes to our highest-impact charities. Allocations are updated as evidence evolves.',
    recommended: true,
  },
  {
    id: 'recommended',
    name: 'Recommended Charities',
    tagline: 'Choose your own allocation',
    description:
      'Give directly to one or more of the four charities HLI currently recommends: StrongMinds, Friendship Bench, Taimaka, and Pure Earth. You decide how your donation is divided between them.',
    recommended: false,
  },
  {
    id: 'hli',
    name: 'Happier Lives Institute',
    shortName: 'HLI',
    tagline: 'Fund the research',
    description:
      'Support HLI\'s independent research directly. Your donation funds the rigorous work that identifies the most cost-effective ways to improve global wellbeing — the research that makes all our recommendations possible.',
    recommended: false,
  },
];
