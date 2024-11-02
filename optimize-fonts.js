import fs from 'fs';
import path from 'path';
import Fontmin from 'fontmin';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取项目的源文件路径
const srcPath = path.resolve(__dirname, 'src');
const fontPath = path.resolve(__dirname, 'src/assets/fonts');
const ttfFontNames = ['XiaolaiSC-Regular.ttf']; // 在这里列出你要处理的 TTF 文件
const outputFontName = 'XiaolaiSC-Regular.woff2'; // 输出 WOFF2 文件名

async function getTextFromFiles(directory) {
    let text = '';
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            text += await getTextFromFiles(filePath); // 递归目录
        } else if (file.endsWith('.html') || file.endsWith('.vue')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            text += content; // 获取 HTML/Vue 内容
        }
    }
    return text;
}

async function optimizeFonts() {
    try {
        // 获取所有需要检查的文本
        const text = await getTextFromFiles(srcPath);
        
        // 提取独特的字符
        const uniqueCharacters = Array.from(new Set(text));

        // 确保字体目录存在
        if (!fs.existsSync(fontPath)) {
            fs.mkdirSync(fontPath, { recursive: true });
        }

        // 处理每个 TTF 字体文件
        for (const ttfFontName of ttfFontNames) {
            const fontFilePath = path.join(fontPath, ttfFontName);
            const outputFontPath = path.join(fontPath, outputFontName);

            const fontmin = new Fontmin()
                .src(fontFilePath)
                .dest(fontPath)
                .use(Fontmin.glyph({ text: uniqueCharacters.join('') })) // 使用提取的字符
                .use(Fontmin.ttf2woff2()) // 转换为 WOFF2 格式

            await new Promise((resolve, reject) => {
                fontmin.run((err, files) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`Optimized font has been saved to: ${outputFontPath}`);
                        resolve(files);
                    }
                });
            });
        }
    } catch (error) {
        console.error(`Error optimizing fonts: ${error.message}`);
    }
}

// 运行字体优化
optimizeFonts();