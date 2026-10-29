export const slideIds = ['welcome', 'team', 'timetable', 'rule'] as const

export type TossSlideId = (typeof slideIds)[number]

type TimetableItem = {
  readonly time: string
  readonly title: string
  readonly accent: string
  readonly note?: string
}

type TeamMember = {
  readonly name: string
  readonly role: string
  readonly body: string
  readonly link: string
  readonly keywords: readonly string[]
  readonly accent: string
}

export const toolLogos = [
  { src: '/ralphthon.png', alt: 'Ralph', side: 'left', className: 'top-[10%] left-[5%] w-24 bg-transparent lg:w-36' },
  { src: '/toss-slides/openai.svg', alt: 'OpenAI', side: 'left', className: 'bottom-[17%] left-[8%] w-24 lg:w-32 invert' },
  { src: '/toss-slides/claudecode.svg', alt: 'Claude Code', side: 'right', className: 'top-[15%] right-[6%] w-28 lg:w-40' },
  { src: '/toss-slides/lazycodex-logo.png', alt: 'LazyCodex', side: 'right', className: 'bottom-[14%] right-[7%] w-28 lg:w-40' },
  { src: '/toss-slides/gajae-hero.png', alt: 'Gajae Code', side: 'right', className: 'top-[48%] right-[2%] w-24 lg:w-36' },
] as const

export const teamMembers: readonly TeamMember[] = [
  {
    name: '정구봉',
    role: 'Ralphthon Host',
    body: 'SF·Singapore 등에서 Ralphthon을 열고, 1인 빌더를 위한 해커하우스를 만들고 있습니다.',
    link: 'linkedin.com/in/gb-jeong',
    keywords: ['Ralphthon', 'Hacker House', '1인 빌더'],
    accent: '#FFD90F',
  },
  {
    name: '김우영',
    role: 'Builder',
    body: '개발자로 일하다 AI 흐름을 타고 1인 빌더로 전향. 프로덕트로 먹고살기 위해 분투중입니다.',
    link: 'kr.linkedin.com/in/wooing',
    keywords: ['AI', '1인개발', '빌드 인 퍼블릭'],
    accent: '#45B649',
  },
  {
    name: '이정민',
    role: 'Investor · Founder · Builder',
    body: '투자자로 시작해 35억원 규모의 자금을 직접 유치한 AI 스타트업 창업을 거쳐, 지금은 1인 빌더로 이것저것 시도 중입니다.',
    link: 'linkedin.com/in/jyoung105',
    keywords: ['AI', 'World Cup', 'Startup'],
    accent: '#E63946',
  },
  {
    name: '이호연',
    role: 'Builder · Educator',
    body: '스타트업 10년차 개발자. 쏘카 데이터 엔지니어로 시작해 뉴욕 금융 스타트업 테크리드로 일했고, 지금은 빌더이자 교육자로 시도 중입니다.',
    link: 'linkedin.com/in/hoyeonleekr',
    keywords: ['AX', 'Harness 구축', '건강'],
    accent: '#FFD90F',
  },
  {
    name: '박준영',
    role: 'AI Native Founder',
    body: '화이트해커 출신. 네이버 보안팀과 스타트업 CTO를 거쳐, 지금은 callva.ai와 AI Native 1인 법인을 운영 중입니다.',
    link: 'linkedin.com/in/jooneyp',
    keywords: ['AI Agent', 'Zero Communication Cost', 'UX가 답이다'],
    accent: '#45B649',
  },
] as const

export const timetableItems: readonly TimetableItem[] = [
  {
    time: '2:00 ~ 2:30',
    title: '팀어텐션 소개 및 오프닝 세션',
    accent: '#45B649',
  },
  {
    time: '2:30 ~ 3:30',
    title: '스펙 작성, 전략 짜기',
    accent: '#FFD90F',
  },
  {
    time: '3:30 ~ 5:00',
    title: '랄프 돌리기',
    note: '랄프를 돌린 이후에는 팀어텐션 분들과 자유롭게 네트워킹 해보세요!',
    accent: '#E63946',
  },
  {
    time: '5:00 ~ 5:30',
    title: '랄프 이어 돌리기 + 데모 준비, 슬랙에 제출',
    accent: '#FFD90F',
  },
  {
    time: '5:30 ~ 7:00',
    title: '전체 발표(각 5분) 및 심사 진행',
    note: '1위~3위를 슬랙에서 투표를 통해 선정합니다. 본인 팀을 제외한 팀에 투표해 주세요. 상품은 당일에 공개됩니다!',
    accent: '#45B649',
  },
] as const

export const ruleItems = [
  {
    label: '01',
    title: '가재존',
    body: '랄프 돌리기를 시작한 후, 컴퓨터를 만지고 싶으시다면 앞쪽 가재존에 와서 가재탈을 쓰고 진행합니다.',
    accent: '#E63946',
  },
  {
    label: '02',
    title: '데모 필수',
    body: '발표 시에 꼭 PT 자료가 있어야 할 필요는 없으며, 데모는 포함되어야 합니다!',
    accent: '#FFD90F',
  },
  {
    label: '03',
    title: 'Google Meet',
    body: '발표는 Ralphthon 캘린더에 있는 구글밋으로 개별 접속하셔서 화면을 공유하는 형태로 진행합니다. 구체적인 내용은 당일에 설명해 드릴게요.',
    accent: '#45B649',
  },
] as const
