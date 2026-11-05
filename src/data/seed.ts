import type { Project, Stage, ApprovalStatus, RecordType } from '../domain/projects';
import { countryCodes } from '../domain/projects';
const rows: [
  string,
  string,
  Project['country'],
  Stage,
  ApprovalStatus,
  number,
  number,
  RecordType,
][] = [
  [
    'DEMO-KE-101',
    'Growing resilient communities',
    'Kenya',
    'Project Outline',
    'Waiting Submission',
    185000,
    1250,
    'Project',
  ],
  [
    'DEMO-RW-102',
    'Harvesting opportunity',
    'Rwanda',
    'Project Design',
    'Waiting Submission',
    320000,
    2100,
    'Project',
  ],
  [
    'DEMO-UG-103',
    'Water for a brighter future',
    'Uganda',
    'Project Outline',
    'Pending Thematic Approval',
    245000,
    1800,
    'Project',
  ],
  [
    'DEMO-ET-104',
    'Stronger livelihoods together',
    'Ethiopia',
    'Seeking Lead Funding',
    'Approved',
    480000,
    3200,
    'Project',
  ],
  ['DEMO-MW-105', 'Seeds of change', 'Malawi', 'Active', 'Approved', 275000, 1650, 'Project'],
  [
    'DEMO-ZM-106',
    'Community food futures',
    'Zambia',
    'Project Design',
    'Rejected',
    198000,
    1400,
    'Project',
  ],
  [
    'DEMO-KE-107',
    'Landscape learning assessment',
    'Kenya',
    'Project Outline',
    'Waiting Submission',
    25000,
    180,
    'CAST',
  ],
  [
    'DEMO-RW-108',
    'Healthy soils, thriving families',
    'Rwanda',
    'Closed',
    'Approved',
    210000,
    1500,
    'Project',
  ],
];
export function seedProjects(): Project[] {
  return rows.map(
    ([code, name, country, stage, approvalStatus, budget, participants, recordType], i) => ({
      id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
      version: 1,
      code,
      name,
      country,
      countryCode: countryCodes[country],
      stage,
      approvalStatus,
      recordType,
      budget,
      participants,
      designStatus:
        stage === 'Project Design'
          ? 'In Design'
          : stage === 'Project Outline'
            ? 'Not started'
            : 'Fully Designed',
      startDate: '2027-01-01',
      endDate: '2029-12-31',
      summary:
        recordType === 'CAST'
          ? 'A fictional community assessment exploring priorities, local strengths and opportunities for a future programme.'
          : 'A fictional programme supporting families to strengthen food security, develop sustainable livelihoods and build resilience through community-led learning.',
      documents: [
        {
          label: recordType === 'CAST' ? 'Assessment brief (example)' : 'Project brief (example)',
          url: 'https://example.com/fictional-project-brief',
        },
      ],
      parentId: i === 6 ? '00000000-0000-4000-8000-000000000001' : undefined,
      history: [
        {
          id: `seed-${i}`,
          at: '2026-11-01T09:00:00.000Z',
          title: 'Demo project added',
          detail: 'Fictional example for exploring the workspace. No approval was sent.',
          source: 'demo',
        },
        ...(approvalStatus === 'Rejected'
          ? [
              {
                id: `review-${i}`,
                at: '2026-11-03T14:00:00.000Z',
                title: 'Example design returned for revision',
                detail: 'Fictional feedback: clarify the delivery plan and budget assumptions.',
                source: 'demo' as const,
              },
            ]
          : []),
      ],
    }),
  );
}
