---
title: Jenkins
order: 1
---

# 🧩 Jenkins 简介

**Jenkins** 是一个开源的自动化服务器，主要用于 **持续集成（CI）** 和 **持续部署/交付（CD）**。它能够自动化构建、测试、打包、部署等整个软件开发生命周期中的各种流程。

---

## 🌟 核心特点

| 特性         | 描述                                                 |
| ---------- | -------------------------------------------------- |
| ✅ 插件系统     | 提供 1800+ 插件支持 Git、Docker、Kubernetes、Slack、Maven 等  |
| ✅ 可扩展性     | 支持 Pipeline（流水线）脚本构建复杂流程，适配各种开发场景                  |
| ✅ 多语言支持    | 可用于构建 Java、Node.js、Python、Go、Rust、.NET 等项目         |
| ✅ 分布式构建    | 支持使用多台机器作为构建节点（Agent），加快并行构建                       |
| ✅ 易于集成     | 能与 GitHub/GitLab、JIRA、SonarQube、Harbor、K8s 等工具深度集成 |
| ✅ Web 管理界面 | 提供可视化的 Job 配置和执行监控界面                               |

---

## 🔧 工作原理

1. **开发者提交代码** 到 Git 仓库（如 GitHub）
2. Jenkins 通过 **Webhook 或定时任务** 触发构建
3. 拉取代码后执行 **Pipeline 流水线**
4. 自动完成：构建 → 测试 → 代码质量扫描 → 制品打包 → 部署
5. 构建结果可视化、发送通知（如邮件、Slack）

---

## 📦 什么是 Jenkins Pipeline？

Jenkins Pipeline 是 Jenkins 提供的一种 **以代码形式定义构建流程** 的方式。

* 使用 **Groovy DSL 脚本**
* 支持条件判断、并发构建、步骤封装、参数化构建等
* 支持 **Declarative（声明式）** 和 **Scripted（脚本式）** 两种语法

示例：

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo '正在构建...'
                sh 'mvn clean package'
            }
        }
        stage('Test') {
            steps {
                echo '正在测试...'
                sh 'mvn test'
            }
        }
        stage('Deploy') {
            steps {
                echo '部署到服务器'
                sh 'scp target/*.jar user@host:/deploy/'
            }
        }
    }
}
```

---

## 📚 使用场景举例

* 自动构建和测试新提交的代码
* 每晚定时构建 nightly build
* 自动部署到测试、预发布、生产环境
* 与 Kubernetes 结合实现云原生 CI/CD
* 分支/版本控制下的多环境部署

---

## 🚀 Jenkins vs 其他 CI/CD 工具

| 工具             | 优势                    | 劣势            |
| -------------- | --------------------- | ------------- |
| Jenkins        | 社区成熟、插件丰富、自定义性强、适配老系统 | UI 较旧、初始配置较繁琐 |
| GitHub Actions | GitHub 原生、简单易上手、无需安装  | 插件少、自定义灵活性较低  |
| GitLab CI      | GitLab 原生集成、语法简洁、易于上手 | 与 GitLab 绑定强  |
| CircleCI       | 云服务为主、自动扩容、快速构建       | 免费额度有限、定制性略弱  |

---

## 🛠 常用术语

| 名称         | 含义             |
| ---------- | -------------- |
| Job        | Jenkins 中的构建任务 |
| Node/Agent | 执行构建任务的节点      |
| Pipeline   | 定义构建流程的脚本（流水线） |
| Stage      | 构建流程中的一个阶段     |
| Step       | 一个阶段中的单个操作步骤   |
| Parameter  | 用户手动输入或选择的构建参数 |
