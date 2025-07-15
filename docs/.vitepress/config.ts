// .vitepress/config.ts
import { defineConfig } from "vitepress";
import { getSidebarData, getNavData } from "./nav-sidebar";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    base: "/notebook/",
    title: "挖掘机驾驶技巧",
    description: "这是使用 VitePress 构建的文档站点",
    head: [["link", { rel: "icon", href: "/notebook/assets/image/favicon.ico" }]],
    mermaid: {
      // 你可以在这里设置 Mermaid 的默认配置
    },
    mermaidPlugin: {
      class: "mermaid my-class", // 设置 mermaid 图表的容器类名
    },
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
  })
);
