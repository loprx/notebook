import { resolve, join, sep } from "path";
import { readdirSync, statSync, readFileSync, existsSync } from "fs";
import { DefaultTheme } from "vitepress";
import matter from "gray-matter";

interface SidebarGenerateConfig {
  dirName?: string;
  ignoreFileName?: string;
  ignoreDirNames?: string[];
}

interface SideBarItem {
  text: string;
  collapsible?: boolean;
  collapsed?: boolean;
  items?: SideBarItem[];
  link?: string;
}

interface NavGenerateConfig {
  dirName?: string;
  maxLevel?: number;
}

function isMarkdownFile(fileName: string) {
  return !!fileName.match(/.+\.md$/);
}

const docsDirFullPath = join(__dirname, "../");
const docsDirFullPathLen = docsDirFullPath.length;

function getDocsDirNameAfterStr(dirOrFileFullName: string) {
  return `${sep}${dirOrFileFullName.substring(docsDirFullPathLen)}`;
}

/**
 * 读取文件 frontmatter 中 order 和 title，
 * 目录则尝试读取其下 index.md 的 frontmatter 作为排序依据
 */
function getOrderAndTitle(fullPath: string, defaultTitle: string) {
  try {
    if (!existsSync(fullPath)) return { order: 999, title: defaultTitle };
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      // 目录则去找index.md读取
      const indexMd = join(fullPath, "index.md");
      if (existsSync(indexMd)) {
        const raw = readFileSync(indexMd, "utf-8");
        const { data } = matter(raw);
        return {
          order: typeof data?.order === "number" ? data.order : 999,
          title: typeof data?.title === "string" ? data.title : defaultTitle,
        };
      }
      return { order: 999, title: defaultTitle };
    }
    // 文件则读取自身frontmatter
    if (stat.isFile()) {
      const raw = readFileSync(fullPath, "utf-8");
      const { data } = matter(raw);
      return {
        order: typeof data?.order === "number" ? data.order : 999,
        title: typeof data?.title === "string" ? data.title : defaultTitle,
      };
    }
    return { order: 999, title: defaultTitle };
  } catch {
    return { order: 999, title: defaultTitle };
  }
}

export function getSidebarData(
  sidebarGenerateConfig: SidebarGenerateConfig = {}
) {
  const {
    dirName = "articles",
    ignoreFileName = "index.md",
    ignoreDirNames = ["demo", "asserts"],
  } = sidebarGenerateConfig;

  const dirFullPath = resolve(__dirname, `../${dirName}`);

  // 先读取目录，过滤掉忽略文件夹，只保留目录
  const dirEntries = readdirSync(dirFullPath)
    .filter((name) => {
      if (ignoreDirNames.includes(name)) return false;
      return statSync(join(dirFullPath, name)).isDirectory();
    })
    .sort((a, b) => {
      const aInfo = getOrderAndTitle(join(dirFullPath, a), a);
      const bInfo = getOrderAndTitle(join(dirFullPath, b), b);
      if (aInfo.order !== bInfo.order) return aInfo.order - bInfo.order;
      return aInfo.title.localeCompare(bInfo.title);
    });

  const obj: Record<string, SideBarItem[]> = {};

  dirEntries.forEach((dirName) => {
    const subDirFullName = join(dirFullPath, dirName);
    const property =
      getDocsDirNameAfterStr(subDirFullName).replace(/\\/g, "/") + "/";
    const arr = getSideBarItemTreeData(
      subDirFullName,
      1,
      3,
      ignoreFileName,
      ignoreDirNames
    );

    obj[property] = arr;
  });

  return obj;
}

function getSideBarItemTreeData(
  dirFullPath: string,
  level: number,
  maxLevel: number,
  ignoreFileName: string,
  ignoreDirNames: string[]
): SideBarItem[] {
  const allNames = readdirSync(dirFullPath).filter(
    (name) => !ignoreDirNames.includes(name)
  );

  // 构建带order和title的列表，方便排序
  const entries = allNames.map((name) => {
    const fullPath = join(dirFullPath, name);
    const isDir = statSync(fullPath).isDirectory();
    const defaultTitle = name.match(/^[0-9]{2}-(.+)/)
      ? name.replace(/^[0-9]{2}-/, "")
      : name;
    const { order, title } = getOrderAndTitle(
      isDir ? join(fullPath, "index.md") : fullPath,
      defaultTitle
    );
    return { name, fullPath, isDir, order, title };
  });

  entries.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });

  const result: SideBarItem[] = [];

  for (const entry of entries) {
    const { name, fullPath, isDir, title } = entry;
    if (isDir) {
      const dirData: SideBarItem = {
        text: title,
        collapsed: false,
      };

      // 设置 items
      if (level !== maxLevel) {
        const subItems = getSideBarItemTreeData(
          fullPath,
          level + 1,
          maxLevel,
          ignoreFileName,
          ignoreDirNames
        );
        if (subItems.length > 0) {
          dirData.items = subItems;
          dirData.collapsible = true;
        }
      }

      // ✅ 设置 link 指向该目录下的 index.md（如果存在）
      const indexMdPath = join(fullPath, "index.md");
      if (existsSync(indexMdPath)) {
        dirData.link = getDocsDirNameAfterStr(indexMdPath)
          .replace(".md", "")
          .replace(/\\/g, "/");
      }

      result.push(dirData);
    } else if (
      isMarkdownFile(name) &&
      ignoreFileName !== name &&
      name !== "index.md"
    ) {
      result.push({
        text: title,
        link: getDocsDirNameAfterStr(fullPath)
          .replace(".md", "")
          .replace(/\\/g, "/"),
      });
    }
  }

  return result;
}

export function getNavData(navGenerateConfig: NavGenerateConfig = {}) {
  const { dirName = "articles", maxLevel = 2 } = navGenerateConfig;
  const dirFullPath = resolve(__dirname, `../${dirName}`);
  return getNavDataArr(dirFullPath, 1, maxLevel);
}

function getNavDataArr(
  dirFullPath: string,
  level: number,
  maxLevel: number
): DefaultTheme.NavItem[] {
  const allDirAndFileNameArr = readdirSync(dirFullPath);
  const result: DefaultTheme.NavItem[] = [];

  allDirAndFileNameArr.forEach((fileOrDirName) => {
    const fileOrDirFullPath = join(dirFullPath, fileOrDirName);
    const stats = statSync(fileOrDirFullPath);
    const link = getDocsDirNameAfterStr(fileOrDirFullPath)
      .replace(".md", "")
      .replace(/\\/g, "/");

    let title = fileOrDirName;
    let sort = 0;

    if (stats.isDirectory()) {
      // 如果是目录，尝试读取 index.md 的 title 和 sort
      const indexPath = join(fileOrDirFullPath, "index.md");
      if (existsSync(indexPath)) {
        const content = readFileSync(indexPath, "utf-8");
        const frontmatter = matter(content).data;
        if (frontmatter.title) title = frontmatter.title;
        if (frontmatter.sort !== undefined) sort = frontmatter.sort;
      } else {
        title = fileOrDirName.match(/^[0-9]{2}-.+/)
          ? fileOrDirName.substring(3)
          : fileOrDirName;
      }

      const dirData: any = {
        text: title,
        link: `${link}/`,
        sort,
      };

      if (level !== maxLevel) {
        const arr = getNavDataArr(fileOrDirFullPath, level + 1, maxLevel).filter(
          (v) => v.text !== "index.md"
        );
        if (arr.length > 0) {
          dirData.items = arr;
          delete dirData.link;
        }
      }

      dirData.activeMatch = link + "/";
      result.push(dirData);
    } else if (isMarkdownFile(fileOrDirName)) {
      if (fileOrDirName === "index.md") return; // index.md 不直接作为 nav 添加

      // 获取 md 文件 title 和 sort
      const content = readFileSync(fileOrDirFullPath, "utf-8");
      const frontmatter = matter(content).data;
      if (frontmatter.title) title = frontmatter.title;
      if (frontmatter.sort !== undefined) sort = frontmatter.sort;
      else {
        title = fileOrDirName.match(/^[0-9]{2}-.+/)
          ? fileOrDirName.substring(3).replace(/\.md$/, "")
          : fileOrDirName.replace(/\.md$/, "");
      }

      const fileData: DefaultTheme.NavItem & { sort?: number } = {
        text: title,
        link,
        sort,
      };
      fileData.activeMatch = link + "/";
      result.push(fileData);
    }
  });

  // 按 sort 排序
  result.sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0));

  return result;
}