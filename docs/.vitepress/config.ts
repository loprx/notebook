// .vitepress/config.ts
import { defineConfig } from "vitepress";
import { getSidebarData, getNavData } from "./nav-sidebar";

export default defineConfig({
  base: "/notebook/",
  title: "挖掘机驾驶技巧",
  description: "这是使用 VitePress 构建的文档站点",
  head: [["link", { rel: "icon", href: "/notebook/assets/image/favicon.ico" }]],
  themeConfig: {
    logo: "/assets/image/favicon.ico",
    outline: [2, 3],
    nav: getNavData({
      dirName: "guide",
    }),
    sidebar: getSidebarData({
      dirName: "guide", 
      ignoreFileName: "README.md", 
      ignoreDirNames: ["drafts", "images"], 
    }),
  },
});
