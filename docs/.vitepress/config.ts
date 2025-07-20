// .vitepress/config.ts
import { defineConfig } from "vitepress";
import { getSidebarData, getNavData } from "./nav-sidebar";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    base: "/notebook/",
    title: "挖掘机驾驶宝典",
    description: "这是使用 VitePress 构建的文档站点",
    head: [
      ["link", { rel: "icon", href: "/notebook/assets/image/favicon.ico" }],
      [
        "script",
        {
          async: "",
          src: "https://www.googletagmanager.com/gtag/js?id=G-Y6YF5TZSRR",
        },
      ],
      [
        "script",
        {},
        `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-Y6YF5TZSRR');
      `,
      ],
    ],
    mermaid: {},
    sitemap: {
      hostname: "https://loprx.github.io/notebook",
      lastmodDateOnly: false,
    },
    markdown: {
      image: {
        // 默认禁用；设置为 true 可为所有图片启用懒加载。
        lazyLoading: true,
      },
    },
    mermaidPlugin: {
      class: "mermaid my-class", // 设置 mermaid 图表的容器类名
    },
    themeConfig: {
      logo: "/assets/image/favicon.ico",
      outline: [2, 5],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/loprx/notebook' },
      ],
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
