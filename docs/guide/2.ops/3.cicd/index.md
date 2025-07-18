---
title: CI / CD
order: 3
---

# CI / CD

CI/CD 是软件开发过程中的两个关键概念，分别是：

---

## 🛠 CI（Continuous Integration，持续集成）

CI 的目标是：

* **频繁地将代码合并到主分支**
* **自动构建、自动测试**
* **尽早发现问题，防止“集成地狱”**

### 🔁 流程示意

开发者提交代码（push） →
CI 工具自动构建 →
自动运行测试 →
如果成功则继续流程，如果失败立即反馈

### 🧰 常用工具

* Jenkins
* GitLab CI
* GitHub Actions
* Travis CI
* CircleCI

---

## 🚀 CD（有两种解释）

### 1. Continuous Delivery（持续交付）

持续交付是在 CI 的基础上，**实现构建后的自动部署到测试或预生产环境**，但**需要人工批准才能上线到生产环境**。

### 2. Continuous Deployment（持续部署）

持续部署更进一步，**构建成功并通过测试后自动部署到生产环境**，**全流程自动化，无需人工干预**。

---

## 🧱 CI/CD 的意义

| 优点       | 说明                 |
| -------- | ------------------ |
| ✅ 提高开发效率 | 每次提交自动测试和集成，避免手动流程 |
| ✅ 提高代码质量 | 自动测试减少人为错误         |
| ✅ 快速交付   | 支持敏捷开发和快速迭代        |
| ✅ 快速回滚   | 自动化流程更容易追踪和回退问题版本  |

---

## 📦 一个完整的 CI/CD 流水线可能包括

```text
开发 → Git 提交 → 自动构建（CI） → 自动测试 → 自动打包 → 自动部署（CD） → 线上发布
```

---

## 📌 举个简单例子（GitLab CI）

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script: npm run build

test:
  stage: test
  script: npm run test

deploy:
  stage: deploy
  script: bash deploy.sh
```

当你推送代码到 GitLab 仓库，这个 `.gitlab-ci.yml` 就会被自动执行，实现 CI/CD。
