// .vitepress/config.ts
import { defineConfig } from "vitepress";
import { getSidebarData, getNavData } from "./nav-sidebar";

export default defineConfig({
  base: "/notebook/",
  title: "挖掘机驾驶技巧",
  description: "这是使用 VitePress 构建的文档站点",
  head: [["link", { rel: "icon", href: "/assets/image/favicon.ico" }]],
  themeConfig: {
    logo: "/assets/image/favicon.ico",
    nav: getNavData({
      dirName: "guide",
    }),
    sidebar: getSidebarData({
      dirName: "guide", // 👈 指定你自己的目录名
      ignoreFileName: "README.md", // 👈 如果你用的是 README
      ignoreDirNames: ["drafts", "images"], // 👈 忽略这些目录
    }),
  },
});
