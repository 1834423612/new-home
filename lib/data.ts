// Static data for the site - will be replaced by DB data when admin is set up

export interface ProjectLink {
  title: { zh: string; en: string }
  url: string
  icon?: string
}

export interface Project {
  id: string
  slug: string
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  detail?: { zh: string; en: string }
  links?: ProjectLink[]
  category: string
  tags: string[]
  image?: string
  link?: string
  source?: string
  date: string
  featured?: boolean
}

export interface Award {
  id: string
  slug: string
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  detail?: { zh: string; en: string }
  org: { zh: string; en: string }
  date: string
  level?: string
  image?: string
  officialLinks?: { title: string; url: string }[]
}

export interface Tool {
  id: string
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  url: string
  icon?: string
  tags: string[]
  type: "personal" | "tool"
}

export interface Experience {
  id: string
  title: { zh: string; en: string }
  org: { zh: string; en: string }
  description: { zh: string; en: string }
  startDate: string
  endDate?: string
  icon?: string
}

export interface Skill {
  name: string
  icon: string
  category: string
}

export interface SocialLink {
  name: string
  icon: string
  url: string
  color: string
}

export interface Site {
  id: string
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  url: string
  since: string
  tags: string[]
}

export const projects: Project[] = [
  {
    id: "zdschool",
    slug: "zdschool",
    title: { zh: "ZDSchool Project", en: "ZDSchool Project" },
    description: {
      zh: "为Minecraft中学校建筑制作的一个站，用于展示三期同学的建筑成就。",
      en: "A website for Minecraft school architecture, showcasing student building achievements.",
    },
    category: "website",
    tags: ["Website", "Minecraft"],
    date: "2022",
    link: "https://zdschool.kjchmc.cn",
    featured: true,
  },
  {
    id: "frc-robotics",
    slug: "frc-robotics",
    title: { zh: "FRC Robotics Strategy Charts", en: "FRC Robotics Strategy Charts" },
    description: {
      zh: "为机器人团队设计和制作的战略数据图表工具",
      en: "Strategy data charting tool designed for the robotics team",
    },
    category: "tool",
    tags: ["FRC", "Robotics", "Team 695"],
    date: "2023.12 - 2024.1",
    featured: true,
  },
  {
    id: "frc695-website",
    slug: "frc695-website",
    title: { zh: "FRC Team 695 官方网站", en: "FRC Team 695 Official Website" },
    description: {
      zh: "为学校机器人队设计和制作的官方网站",
      en: "Official website designed and built for the school robotics team",
    },
    category: "website",
    tags: ["FRC", "Official Website", "React"],
    date: "2024.7",
    source: "https://github.com",
    featured: true,
  },
  {
    id: "zdschool-mc",
    slug: "zdschool-mc",
    title: { zh: "ZDSchool on Minecraft", en: "ZDSchool on Minecraft" },
    description: {
      zh: "2022暑假几个小学校友一起发起的游戏联机，共同在Minecraft中还原学校。",
      en: "A multiplayer Minecraft project to recreate our school during 2022 summer.",
    },
    category: "game",
    tags: ["Minecraft", "Game"],
    date: "2022.6.25 - 2023.9",
  },
  {
    id: "graduation-video",
    slug: "graduation-video",
    title: { zh: "2022届初三毕业生毕业回忆视频", en: "2022 Graduation Memorial Video" },
    description: {
      zh: "毕业时为留念而制作的视频。个人认为本次编剧制作已十分优秀。",
      en: "A memorial video created for graduation. A deeply personal creative project.",
    },
    category: "design",
    tags: ["Video", "Design"],
    date: "2022.7.1-7.8",
  },
  {
    id: "makesome-cool",
    slug: "makesome-cool",
    title: { zh: "MAKESOME.COOL", en: "MAKESOME.COOL" },
    description: {
      zh: "为存有趣的开源项目且提供免费子域名。",
      en: "A platform for hosting interesting open source projects with free subdomains.",
    },
    category: "tool",
    tags: ["Open Source"],
    date: "2022.11.11",
    source: "https://github.com",
  },
  {
    id: "moe-counter",
    slug: "moe-counter",
    title: { zh: "Moe-Counter PHP+Mysql", en: "Moe-Counter PHP+MySQL" },
    description: {
      zh: "记录网站访问量数据并实时显示",
      en: "Website visit counter with real-time display",
    },
    category: "tool",
    tags: ["PHP", "MySQL", "Counter"],
    date: "2022",
    source: "https://github.com",
  },
  {
    id: "reference",
    slug: "reference",
    title: { zh: "Reference (开源贡献)", en: "Reference (Open Source Contribution)" },
    description: {
      zh: "为开发人员分享快速参考清单速查表",
      en: "Quick reference cheat sheets for developers",
    },
    category: "contribution",
    tags: ["GitHub", "Contribution"],
    date: "2022",
    source: "https://github.com",
  },
]

export const experiences: Experience[] = [
  {
    id: "beachwood-hs",
    title: {
      zh: "高中在读",
      en: "High School Student",
    },
    org: {
      zh: "Beachwood High School, 俄亥俄州",
      en: "Beachwood High School, Ohio",
    },
    description: {
      zh: "目前在美国俄亥俄州上高中，同时参与FRC机器人团队#695的开发工作。",
      en: "Currently attending high school in Ohio, USA. Participating in FRC robotics team #695 development.",
    },
    startDate: "2023",
    icon: "mdi:school",
  },
  {
    id: "frc-695",
    title: {
      zh: "FRC #695 Bison Robotics - Scouting 前后端开发",
      en: "FRC #695 Bison Robotics - Scouting Frontend & Backend Dev",
    },
    org: {
      zh: "Beachwood FRC Team 695",
      en: "Beachwood FRC Team 695",
    },
    description: {
      zh: "负责Scouting系统的前后端开发，优化数据收集和分析流程。",
      en: "Responsible for Scouting system frontend & backend development, optimizing data collection and analysis.",
    },
    startDate: "2023.12",
    icon: "mdi:robot-industrial",
  },
  {
    id: "zhongde",
    title: {
      zh: "初中毕业",
      en: "Middle School Graduate",
    },
    org: {
      zh: "北京市忠德学校",
      en: "Beijing Zhongde School",
    },
    description: {
      zh: "在北京市忠德学校度过了初中三年(七年级-九年级)的时光，毕业时开发了ZDSchool项目。",
      en: "Spent three years of middle school (Grade 7-9) at Beijing Zhongde School. Developed the ZDSchool project upon graduation.",
    },
    startDate: "2019",
    endDate: "2022",
    icon: "mdi:school-outline",
  },
]

export const skills: Skill[] = [
  // Frontend
  { name: "HTML5", icon: "devicon:html5", category: "frontend" },
  { name: "CSS3", icon: "devicon:css3", category: "frontend" },
  { name: "JavaScript", icon: "devicon:javascript", category: "frontend" },
  { name: "TypeScript", icon: "devicon:typescript", category: "frontend" },
  { name: "React", icon: "devicon:react", category: "frontend" },
  { name: "Vue.js", icon: "devicon:vuejs", category: "frontend" },
  { name: "Next.js", icon: "devicon:nextjs", category: "frontend" },
  { name: "Tailwind CSS", icon: "devicon:tailwindcss", category: "frontend" },
  { name: "Sass", icon: "devicon:sass", category: "frontend" },
  { name: "Bootstrap", icon: "devicon:bootstrap", category: "frontend" },
  // Backend
  { name: "PHP", icon: "devicon:php", category: "backend" },
  { name: "Node.js", icon: "devicon:nodejs", category: "backend" },
  { name: "Python", icon: "devicon:python", category: "backend" },
  { name: "MySQL", icon: "devicon:mysql", category: "backend" },
  { name: "MongoDB", icon: "devicon:mongodb", category: "backend" },
  { name: "Nginx", icon: "devicon:nginx", category: "backend" },
  { name: "Flask", icon: "devicon:flask", category: "backend" },
  // DevOps
  { name: "Git", icon: "devicon:git", category: "devops" },
  { name: "GitHub", icon: "mdi:github", category: "devops" },
  { name: "Docker", icon: "devicon:docker", category: "devops" },
  { name: "VS Code", icon: "devicon:vscode", category: "devops" },
  { name: "Vercel", icon: "devicon:vercel", category: "devops" },
  { name: "Cloudflare", icon: "devicon:cloudflare", category: "devops" },
  { name: "LaTeX", icon: "devicon:latex", category: "devops" },
  // Design
  { name: "Photoshop", icon: "devicon:photoshop", category: "design" },
  { name: "Illustrator", icon: "devicon:illustrator", category: "design" },
  { name: "Premiere Pro", icon: "devicon:premierepro", category: "design" },
  { name: "After Effects", icon: "devicon:aftereffects", category: "design" },
  { name: "AutoCAD", icon: "devicon:autocad", category: "design" },
  { name: "Figma", icon: "devicon:figma", category: "design" },
  // OS
  { name: "Windows", icon: "devicon:windows11", category: "os" },
  { name: "macOS", icon: "devicon:apple", category: "os" },
  { name: "Linux", icon: "devicon:linux", category: "os" },
  { name: "Ubuntu", icon: "devicon:ubuntu", category: "os" },
  { name: "Android", icon: "devicon:android", category: "os" },
  // Ops
  { name: "SSH", icon: "mdi:console", category: "ops" },
  { name: "VMware", icon: "simple-icons:vmware", category: "ops" },
]

export const socialLinks: SocialLink[] = [
  { name: "GitHub", icon: "mdi:github", url: "https://github.com/1834423612", color: "#f0f0f0" },
  { name: "WeChat", icon: "mdi:wechat", url: "#", color: "#07c160" },
  { name: "Telegram", icon: "mdi:telegram", url: "#", color: "#26a5e4" },
  { name: "Email", icon: "mdi:email-outline", url: "mailto:admin@kjchmc.cn", color: "#ea4335" },
  { name: "Twitter/X", icon: "mdi:twitter", url: "#", color: "#1da1f2" },
  { name: "Weibo", icon: "mdi:sina-weibo", url: "#", color: "#e6162d" },
  { name: "Instagram", icon: "mdi:instagram", url: "#", color: "#e4405f" },
  { name: "Bilibili", icon: "simple-icons:bilibili", url: "#", color: "#00a1d6" },
]

export const sites: Site[] = [
  {
    id: "file-drive",
    title: { zh: "老况的文件库", en: "kjch's File Drive" },
    description: {
      zh: "一个存储着许多资源材料的站点",
      en: "A site storing various resources and materials",
    },
    url: "#",
    since: "2022",
    tags: ["Cloud Drive"],
  },
  {
    id: "blog",
    title: { zh: "老况的小窝", en: "kjch's Blog" },
    description: {
      zh: "学习笔记，目前记好的学术文章。",
      en: "Study notes and academic articles.",
    },
    url: "#",
    since: "2022",
    tags: ["Blog"],
  },
  {
    id: "startpage",
    title: { zh: "kjch起始页", en: "kjch Start Page" },
    description: {
      zh: "多功能起始页和收藏导航",
      en: "Multi-functional start page and bookmark navigation",
    },
    url: "#",
    since: "2021",
    tags: ["Start Page", "Design"],
  },
  {
    id: "status",
    title: { zh: "网站状态监控", en: "Status Monitor" },
    description: {
      zh: "网站服务器在线状态实时监控站点",
      en: "Real-time server status monitoring site",
    },
    url: "#",
    since: "2021",
    tags: ["Status", "Monitoring"],
  },
]

export const awards: Award[] = [
  {
    id: "frc-2024",
    slug: "frc-2024-competition",
    title: {
      zh: "FRC 2024赛季 区域赛",
      en: "FRC 2024 Season Regional Competition",
    },
    description: {
      zh: "作为Team 695 Bison Robotics的Scouting前后端开发成员参与比赛",
      en: "Participated as Scouting frontend & backend dev member of Team 695 Bison Robotics",
    },
    detail: {
      zh: "在2024 FRC赛季中，作为Beachwood High School Team 695的技术成员，负责Scouting系统的前后端开发工作。系统帮助团队在比赛中实时收集和分析对手数据，为战略决策提供支持。",
      en: "During the 2024 FRC season, served as a technical member of Beachwood High School Team 695, responsible for Scouting system frontend and backend development. The system helped the team collect and analyze opponent data in real-time during competitions.",
    },
    org: {
      zh: "FIRST Robotics Competition",
      en: "FIRST Robotics Competition",
    },
    date: "2024",
    level: "Regional",
    officialLinks: [
      { title: "FRC Official", url: "https://www.firstinspires.org/robotics/frc" },
      { title: "Team 695", url: "https://www.thebluealliance.com/team/695" },
    ],
  },
]

export const tools: Tool[] = [
  {
    id: "random-anime",
    title: { zh: "随机二次元图片", en: "Random Anime Image" },
    description: { zh: "随机展示一张二次元壁纸", en: "Random anime wallpaper display" },
    url: "#",
    icon: "mdi:image-outline",
    tags: ["API"],
    type: "tool",
  },
  {
    id: "ip-sign",
    title: { zh: "IP签名墙", en: "IP Signature Wall" },
    description: { zh: "快速生成一张带有IP信息的小图片", en: "Generate a small image with IP info" },
    url: "#",
    icon: "mdi:card-account-details-outline",
    tags: ["API"],
    type: "tool",
  },
]
