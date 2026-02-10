-- Seed data for kjch personal website
-- All data from lib/data.ts inserted into database

-- ============================================================
-- Projects
-- ============================================================
INSERT INTO `projects` (`id`, `slug`, `title_zh`, `title_en`, `description_zh`, `description_en`, `category`, `tags`, `date`, `link`, `source`, `featured`, `sort_order`) VALUES
('zdschool', 'zdschool', 'ZDSchool Project', 'ZDSchool Project', '为Minecraft中学校建筑制作的一个站，用于展示三期同学的建筑成就。', 'A website for Minecraft school architecture, showcasing student building achievements.', 'website', '["Website","Minecraft"]', '2022', 'https://zdschool.kjchmc.cn', NULL, 1, 1),
('frc-robotics', 'frc-robotics', 'FRC Robotics Strategy Charts', 'FRC Robotics Strategy Charts', '为机器人团队设计和制作的战略数据图表工具', 'Strategy data charting tool designed for the robotics team', 'tool', '["FRC","Robotics","Team 695"]', '2023.12 - 2024.1', NULL, NULL, 1, 2),
('frc695-website', 'frc695-website', 'FRC Team 695 官方网站', 'FRC Team 695 Official Website', '为学校机器人队设计和制作的官方网站', 'Official website designed and built for the school robotics team', 'website', '["FRC","Official Website","React"]', '2024.7', NULL, 'https://github.com', 1, 3),
('zdschool-mc', 'zdschool-mc', 'ZDSchool on Minecraft', 'ZDSchool on Minecraft', '2022暑假几个小学校友一起发起的游戏联机，共同在Minecraft中还原学校。', 'A multiplayer Minecraft project to recreate our school during 2022 summer.', 'game', '["Minecraft","Game"]', '2022.6.25 - 2023.9', NULL, NULL, 0, 4),
('graduation-video', 'graduation-video', '2022届初三毕业生毕业回忆视频', '2022 Graduation Memorial Video', '毕业时为留念而制作的视频。个人认为本次编剧制作已十分优秀。', 'A memorial video created for graduation. A deeply personal creative project.', 'design', '["Video","Design"]', '2022.7.1-7.8', NULL, NULL, 0, 5),
('makesome-cool', 'makesome-cool', 'MAKESOME.COOL', 'MAKESOME.COOL', '为存有趣的开源项目且提供免费子域名。', 'A platform for hosting interesting open source projects with free subdomains.', 'tool', '["Open Source"]', '2022.11.11', NULL, 'https://github.com', 0, 6),
('moe-counter', 'moe-counter', 'Moe-Counter PHP+Mysql', 'Moe-Counter PHP+MySQL', '记录网站访问量数据并实时显示', 'Website visit counter with real-time display', 'tool', '["PHP","MySQL","Counter"]', '2022', NULL, 'https://github.com', 0, 7),
('reference', 'reference', 'Reference (开源贡献)', 'Reference (Open Source Contribution)', '为开发人员分享快速参考清单速查表', 'Quick reference cheat sheets for developers', 'contribution', '["GitHub","Contribution"]', '2022', NULL, 'https://github.com', 0, 8)
ON DUPLICATE KEY UPDATE `title_zh`=VALUES(`title_zh`);

-- ============================================================
-- Experiences
-- ============================================================
INSERT INTO `experiences` (`id`, `title_zh`, `title_en`, `org_zh`, `org_en`, `description_zh`, `description_en`, `start_date`, `end_date`, `icon`, `sort_order`) VALUES
('beachwood-hs', '高中在读', 'High School Student', 'Beachwood High School, 俄亥俄州', 'Beachwood High School, Ohio', '目前在美国俄亥俄州上高中，同时参与FRC机器人团队#695的开发工作。', 'Currently attending high school in Ohio, USA. Participating in FRC robotics team #695 development.', '2023', NULL, 'mdi:school', 1),
('frc-695', 'FRC #695 Bison Robotics - Scouting 前后端开发', 'FRC #695 Bison Robotics - Scouting Frontend & Backend Dev', 'Beachwood FRC Team 695', 'Beachwood FRC Team 695', '负责Scouting系统的前后端开发，优化数据收集和分析流程。', 'Responsible for Scouting system frontend & backend development, optimizing data collection and analysis.', '2023.12', NULL, 'mdi:robot-industrial', 2),
('zhongde', '初中毕业', 'Middle School Graduate', '北京市忠德学校', 'Beijing Zhongde School', '在北京市忠德学校度过了初中三年(七年级-九年级)的时光，毕业时开发了ZDSchool项目。', 'Spent three years of middle school (Grade 7-9) at Beijing Zhongde School. Developed the ZDSchool project upon graduation.', '2019', '2022', 'mdi:school-outline', 3)
ON DUPLICATE KEY UPDATE `title_zh`=VALUES(`title_zh`);

-- ============================================================
-- Skills
-- ============================================================
INSERT INTO `skills` (`name`, `icon`, `category`, `sort_order`) VALUES
('HTML5', 'devicon:html5', 'frontend', 1),
('CSS3', 'devicon:css3', 'frontend', 2),
('JavaScript', 'devicon:javascript', 'frontend', 3),
('TypeScript', 'devicon:typescript', 'frontend', 4),
('React', 'devicon:react', 'frontend', 5),
('Vue.js', 'devicon:vuejs', 'frontend', 6),
('Next.js', 'devicon:nextjs', 'frontend', 7),
('Tailwind CSS', 'devicon:tailwindcss', 'frontend', 8),
('Sass', 'devicon:sass', 'frontend', 9),
('Bootstrap', 'devicon:bootstrap', 'frontend', 10),
('PHP', 'devicon:php', 'backend', 11),
('Node.js', 'devicon:nodejs', 'backend', 12),
('Python', 'devicon:python', 'backend', 13),
('MySQL', 'devicon:mysql', 'backend', 14),
('MongoDB', 'devicon:mongodb', 'backend', 15),
('Nginx', 'devicon:nginx', 'backend', 16),
('Flask', 'devicon:flask', 'backend', 17),
('Git', 'devicon:git', 'devops', 18),
('GitHub', 'mdi:github', 'devops', 19),
('Docker', 'devicon:docker', 'devops', 20),
('VS Code', 'devicon:vscode', 'devops', 21),
('Vercel', 'devicon:vercel', 'devops', 22),
('Cloudflare', 'devicon:cloudflare', 'devops', 23),
('LaTeX', 'devicon:latex', 'devops', 24),
('Photoshop', 'devicon:photoshop', 'design', 25),
('Illustrator', 'devicon:illustrator', 'design', 26),
('Premiere Pro', 'devicon:premierepro', 'design', 27),
('After Effects', 'devicon:aftereffects', 'design', 28),
('AutoCAD', 'devicon:autocad', 'design', 29),
('Figma', 'devicon:figma', 'design', 30),
('Windows', 'devicon:windows11', 'os', 31),
('macOS', 'devicon:apple', 'os', 32),
('Linux', 'devicon:linux', 'os', 33),
('Ubuntu', 'devicon:ubuntu', 'os', 34),
('Android', 'devicon:android', 'os', 35),
('SSH', 'mdi:console', 'ops', 36),
('VMware', 'simple-icons:vmware', 'ops', 37);

-- ============================================================
-- Social Links
-- ============================================================
INSERT INTO `social_links` (`name`, `icon`, `url`, `color`, `sort_order`) VALUES
('GitHub', 'mdi:github', 'https://github.com/1834423612', '#f0f0f0', 1),
('WeChat', 'mdi:wechat', '#', '#07c160', 2),
('Telegram', 'mdi:telegram', '#', '#26a5e4', 3),
('Email', 'mdi:email-outline', 'mailto:admin@kjchmc.cn', '#ea4335', 4),
('Twitter/X', 'mdi:twitter', '#', '#1da1f2', 5),
('Weibo', 'mdi:sina-weibo', '#', '#e6162d', 6),
('Instagram', 'mdi:instagram', '#', '#e4405f', 7),
('Bilibili', 'simple-icons:bilibili', '#', '#00a1d6', 8);

-- ============================================================
-- Sites
-- ============================================================
INSERT INTO `sites` (`id`, `title_zh`, `title_en`, `description_zh`, `description_en`, `url`, `since`, `tags`, `sort_order`) VALUES
('file-drive', '老况的文件库', 'kjch''s File Drive', '一个存储着许多资源材料的站点', 'A site storing various resources and materials', '#', '2022', '["Cloud Drive"]', 1),
('blog', '老况的小窝', 'kjch''s Blog', '学习笔记，目前记好的学术文章。', 'Study notes and academic articles.', '#', '2022', '["Blog"]', 2),
('startpage', 'kjch起始页', 'kjch Start Page', '多功能起始页和收藏导航', 'Multi-functional start page and bookmark navigation', '#', '2021', '["Start Page","Design"]', 3),
('status', '网站状态监控', 'Status Monitor', '网站服务器在线状态实时监控站点', 'Real-time server status monitoring site', '#', '2021', '["Status","Monitoring"]', 4)
ON DUPLICATE KEY UPDATE `title_zh`=VALUES(`title_zh`);

-- ============================================================
-- Awards
-- ============================================================
INSERT INTO `awards` (`id`, `slug`, `title_zh`, `title_en`, `description_zh`, `description_en`, `detail_zh`, `detail_en`, `org_zh`, `org_en`, `date`, `level`, `official_links`, `sort_order`) VALUES
('frc-2024', 'frc-2024-competition', 'FRC 2024赛季 区域赛', 'FRC 2024 Season Regional Competition', '作为Team 695 Bison Robotics的Scouting前后端开发成员参与比赛', 'Participated as Scouting frontend & backend dev member of Team 695 Bison Robotics', '在2024 FRC赛季中，作为Beachwood High School Team 695的技术成员，负责Scouting系统的前后端开发工作。系统帮助团队在比赛中实时收集和分析对手数据，为战略决策提供支持。', 'During the 2024 FRC season, served as a technical member of Beachwood High School Team 695, responsible for Scouting system frontend and backend development. The system helped the team collect and analyze opponent data in real-time during competitions.', 'FIRST Robotics Competition', 'FIRST Robotics Competition', '2024', 'Regional', '[{"title":"FRC Official","url":"https://www.firstinspires.org/robotics/frc"},{"title":"Team 695","url":"https://www.thebluealliance.com/team/695"}]', 1)
ON DUPLICATE KEY UPDATE `title_zh`=VALUES(`title_zh`);

-- ============================================================
-- Tools
-- ============================================================
INSERT INTO `tools` (`id`, `title_zh`, `title_en`, `description_zh`, `description_en`, `url`, `icon`, `tags`, `type`, `sort_order`) VALUES
('random-anime', '随机二次元图片', 'Random Anime Image', '随机展示一张二次元壁纸', 'Random anime wallpaper display', '#', 'mdi:image-outline', '["API"]', 'tool', 1),
('ip-sign', 'IP签名墙', 'IP Signature Wall', '快速生成一张带有IP信息的小图片', 'Generate a small image with IP info', '#', 'mdi:card-account-details-outline', '["API"]', 'tool', 2)
ON DUPLICATE KEY UPDATE `title_zh`=VALUES(`title_zh`);
