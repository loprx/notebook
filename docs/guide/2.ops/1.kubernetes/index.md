---
title: "Kubernetes"
order: 1
---

# Kubernetes

**Kubernetes** 一个用于**自动化容器化应用部署、扩缩和管理的开源系统**。它最初由 Google 设计开发，现在由 Cloud Native Computing Foundation（CNCF）维护。

---

## ✅ 简单理解

Kubernetes 就像一个“**容器编排系统**”，它可以自动帮你：

* 启动应用容器
* 保证应用高可用（自动重启、自动迁移）
* 自动扩容缩容
* 发布更新时实现“滚动升级”不影响服务
* 应对故障（自动修复 Pod）

---

## 📦 关键概念

| 概念                     | 简单解释                          |
| ---------------------- | ----------------------------- |
| **Pod**                | Kubernetes 中最小的部署单位，通常运行一个容器。 |
| **Node**               | 工作节点，实际运行容器的服务器（虚拟或物理）。       |
| **Cluster**            | 整个 Kubernetes 系统，由多个 Node 组成。 |
| **Deployment**         | 控制 Pod 的部署和升级策略。              |
| **Service**            | 暴露 Pod 的访问方式，提供负载均衡能力。        |
| **Ingress**            | 通过域名或路径访问服务的入口。               |
| **ConfigMap / Secret** | 配置管理和敏感信息（如密码）的管理方式。          |

---

## 🌐 为什么用 Kubernetes？

* 实现**应用高可用**
* 管理**大规模容器集群**
* 快速部署、更新、回滚服务
* 更好地利用资源（支持自动调度）

---

## 📌 举例

假设你有一个 Web 应用放在 Docker 容器中，你可以通过 K8s：

* 定义一个 Deployment，自动运行 3 个副本
* 用 Service 暴露访问接口
* 如果一个副本挂了，K8s 自动再起一个

## 🗺️ 学习地图

```mermaid
graph LR
    A[核心生态 & 基础能力] 

    %% 安全与合规
    A --> B[安全与合规]
    B --> B1["🔴 Kyverno"]
    B --> B4["🔴 Trivy"]
    B --> B2["🟠 OPA Gatekeeper"]
    B --> B3["🟠 Falco"]

    %% 网络与服务治理
    A --> C[网络与服务治理]
    C --> C1["🔴 Calico"]
    C --> C2["🟠 Cilium"]
    C --> C6["🟠 Traefik"]
    C --> C7["🔴 NGINX Ingress Controller"]

    %% 存储与数据管理
    A --> D[存储与数据管理]
    D --> D1["🟠 Longhorn"]
    D --> D2["🟠 Rook"]
    D --> D3["🟠 Local-path-storage"]

    %% 可观测性与监控
    A --> E[可观测性与监控]
    E --> E1["🔴 Prometheus"]
    E --> E2["🔴 Grafana"]
    E --> E3["🟠 Loki"]
    E --> E6["🟠 OpenTelemetry"]

    %% 运维与自动化 / GitOps
    A --> F[运维与自动化 / GitOps]
    F --> F1["🔴 ArgoCD"]
    F --> F5["🔴 Helm"]
    F --> F6["🔴 Kustomize"]
    F --> F2["🟠 Flux"]

    %% 调度与资源优化
    A --> G[调度与资源优化]
    G --> G5["🔴 Cluster Autoscaler"]
    G --> G1["🟠 Karpenter"]

    %% 灾备与备份
    A --> H[灾备与备份]
    H --> H1["🟠 Velero"]

    %% 集群管理与多租户
    A --> I[集群管理与多租户]
    I --> I1["🟠 Rancher"]
    I --> I2["🟠 KubeSphere"]
```

```mermaid
graph LR
    A[辅助 & 周边生态] 

    %% CLI & 开发工具
    A --> L[CLI & 开发工具]
    L --> L1["🔴 kubectl"]
    L --> L2["🔴 helm"]
    L --> L3["🔴 kubectx"]
    L --> L4["🔴 kubens"]
    L --> L5["🟠 krew（kubectl 插件管理器）"]
    L --> L6["🟠 kubectl-neat（清理 YAML）"]
    L --> L8["🔴 k9s"]

    %% 本地集群 / 轻量化
    A --> M[本地集群 / 轻量化]
    M --> M1["🔴 kind"]
    M --> M2["🔴 minikube"]
    M --> M3["🔴 k3s"]
    M --> M4["🟠 microk8s"]
    M --> M5["🟠 kubeadm"]

    %% 云端 & 编排 / Provisioning
    A --> N[云端 & 编排 / Provisioning]
    N --> N1["🟠 eksctl"]
    N --> N3["🟠 terraform"]
    N --> N4["🟠 aws-cli / gcloud / az CLI"]

    %% 镜像构建 / CI/CD
    A --> O[镜像构建 / CI/CD]
    O --> O1["🔴 docker / podman"]
    O --> O2["🟠 kaniko"]
    O --> O4["🟠 GitHub Actions / GitLab CI / Jenkins"]

    %% 故障排查 & 日志 / 调试
    A --> P[故障排查 & 日志 / 调试]
    P --> P1["🔴 stern"]
    P --> P3["🟠 kubectl-debug"]
    P --> P4["🟠 telepresence"]
```