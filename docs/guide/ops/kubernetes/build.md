---
title: 搭建
order: 2
---
# 搭建软件版本

+ Docker：20.10.0
+ k8s：1.23.6

## 初始操作

```shell
systemctl stop firewalld
systemctl disable firewalld

sed -i 's/enforcing/disabled/' /etc/selinux/config
setenforce

swapoff -a 
sed -ri 's/.*swap.*/#&/' /etc/fstab

# set static host mapping 
cat >> /etc/hosts << EOF
10.1.72.58 master
10.1.72.12 node1
EOF

# 将桥接IPv4流量传递到iptables链
cat > /etc/sysctl.d/k8s.conf << EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF

sysctl --system

yum install ntpdate -y 
ntpdate time.windows.com

# pid
echo "kernel.pid_max=4194304" | tee -a /etc/sysctl.conf && sysctl -w kernel.pid_max=4194304 && sysctl -p
# limits

ulimit -u 1000000

sysctl -w kernel.pid_max=8388608

```

```shell
set -e

# 1. 关闭防火墙（Ubuntu 使用 ufw）
systemctl stop ufw
systemctl disable ufw

# 2. 关闭 SELinux（Ubuntu 默认没有 SELinux，可以跳过）
# 但如果你装了 SELinux，可以这样禁用（一般不需要）
# apt install selinux-utils -y
# setenforce 0
# sed -i 's/^SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config

# 3. 关闭 swap
swapoff -a
sed -ri 's/^\s*(.+\s+)?swap\s+(\S+\s+){2}/#\0/' /etc/fstab

# 4. 设置 /etc/hosts 静态解析
cat >> /etc/hosts << EOF
172.16.4.121 master
172.16.4.122 node1
172.16.4.123 node3
EOF

# 5. 开启 iptables 处理桥接 IPv4 和 IPv6 流量
cat > /etc/sysctl.d/k8s.conf << EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

modprobe br_netfilter
sysctl --system


# 6. 时间同步（Ubuntu 推荐 systemd-timesyncd 或 chrony）
timedatectl set-timezone Asia/Shanghai
timedatectl set-ntp true

# 或者手动使用 ntpdate：
apt update && apt install ntpdate -y
ntpdate time.windows.com

# 7. 设置 PID 最大值
echo "kernel.pid_max=4194304" | tee -a /etc/sysctl.conf
sysctl -w kernel.pid_max=4194304
sysctl -p

# 8. 临时修改用户进程数限制（只对当前会话生效）
ulimit -u 1000000

# 永久修改 limits（推荐）
cat >> /etc/security/limits.conf << EOF
* soft nproc 1000000
* hard nproc 1000000
EOF

```

## 安装基础软件

```shell
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

cat > /etc/yum.repos.d/kubernetes.repo << EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

yum clean expire-cache
yum makecache
```

```shell
sudo yum install -y yum-utils

sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo


yum install -y docker-ce-20.10.0-3.el7 docker-ce-cli-20.10.0-3.el7 containerd.io

systemctl enable docker --now
```

```json
{

  "exec-opts": ["native.cgroupdriver=systemd"]
}
```

```shell
systemctl daemon-reload
systemctl restart docker
```

```shell
yum install -y kubelet-1.23.6 kubeadm-1.23.6 kubectl-1.23.6
systemctl enable kubelet --now
```

```shell
# ubuntu 24 没有20的docker，可以通过 dpkg -i 安装

# 添加 Kubernetes 阿里云 APT 源
cat <<EOF | tee /etc/apt/sources.list.d/kubernetes.list
deb https://mirrors.aliyun.com/kubernetes/apt kubernetes-xenial main
EOF

# 添加 GPG 密钥
curl -s https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | gpg --dearmor | tee /usr/share/keyrings/kubernetes-archive-keyring.gpg >/dev/null

# 配置签名
sed -i 's|^deb |deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] |' /etc/apt/sources.list.d/kubernetes.list

# 更新软件包索引
apt update

apt install -y kubelet=1.23.6-00 kubeadm=1.23.6-00 kubectl=1.23.6-00

# 防止被升级
apt-mark hold kubelet kubeadm kubectl

systemctl enable kubelet --now
```

```shell
# 写入配置文件
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
    "default-runtime": "nvidia",
    "runtimes": {
    "nvidia": {
        "path": "nvidia-container-runtime",
            "runtimeArgs": []
        }
    },
    "exec-opts": [
        "native.cgroupdriver=systemd"
    ],
    "graph": "/iflytek/docker/",
    "insecure-registries": [
        "172.29.101.173:8888"
    ],
    "log-driver": "json-file",
    "log-opts": {
        "max-file": "3",
        "max-size": "200m"
    }
}
EOF

# 重新加载 systemd 并重启 Docker 服务
sudo systemctl daemon-reexec
sudo systemctl restart docker

# 验证配置是否生效
docker info | grep -i cgroup
```

## 初始化Master

```yaml
cat <<EOF > kubeadm-config.yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
nodeRegistration:
  kubeletExtraArgs:
    root-dir: "/iflytek/kubelet"
localAPIEndpoint:
  advertiseAddress: 172.29.101.173
  bindPort: 6443

---
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: v1.23.6
imageRepository: registry.aliyuncs.com/google_containers
networking:
  podSubnet: 10.244.0.0/16
  serviceSubnet: 10.96.0.0/12
EOF
```

```shell
kubeadm init --config kubeadm-config.yaml
```

![](https://cdn.nlark.com/yuque/0/2024/png/12748464/1709968755185-e3540326-ea98-4130-b9d0-8a572895a0ea.png)

```shell
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

```shell
[root@k8s-master ~]# kubectl get node
NAME         STATUS     ROLES                  AGE     VERSION
k8s-master   NotReady   control-plane,master   3m28s   v1.23.6
```

## Node加入

node加入需要使用token，安装完成后会输出在终端，如果不小心清除可以用以下下方式查看

```shell
# 创建token
kubeadm token create
# 如果token没有过期，可以直接list查看token
kubeadm token list 

kubeadm token create --print-join-command
```

```shell
kubeadm join 192.168.52.134:6443 --token mppfaq.kl14qfww5fezbze0 \
        --discovery-token-ca-cert-hash sha256:f1b00c093f55bc2a2f61d8bd10a80df7609dd99e05f90d8817c6d4c73f420fb8

# --discovery-token-ca-cert-hash 获取
openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | \
  openssl dgst --sha256 -hex | sed 's/^.* //'
```

```shell
[root@k8s-master ~]# kubectl get node
NAME         STATUS     ROLES                  AGE   VERSION
k8s-master   NotReady   control-plane,master   20m   v1.23.6
k8s-node1    NotReady   <none>                 50s   v1.23.6
k8s-node2    NotReady   <none>                 4s    v1.23.6

```

## 初始化软件

```shell
kubeadm config images pull --kubernetes-version=v1.23.6 --image-repository k8s-gcr.m.daocloud.io

kubeadm config images pull --kubernetes-version=v1.23.6 --image-repository registry.cn-hangzhou.aliyuncs.com/google_containers

```

## 部署CNI网络插件

Master：

```shell
curl https://docs.projectcalico.org/manifests/calico.yaml -O 
```

下载完成后需要替换配置

```shell
# 上方初始化的IP
CALICO_IPV4POOL_CIDR
```

```shell
kubectl apply -f calico.yaml
```

构建过程中可能会因为网络问题慢，可以通过一下命令去观察状态

```shell
kubectl get po -n kube-system
kubectl get no -n kube-system
kubectl describe po-xxxx -n kube-sysetem


# 手动pull image
docker pull calico/kube-controllers:v3.25.0
docker pull calico/cni:v3.25.0
docker pull calico/node:v3.25.0
```

## 测试

```shell
kubectl create deployment nginx --image=nginx
```

```shell
kubectl expose deployment nginx --port=80 --type=NodePort
```

```shell
kubectl get pod,svc
```

## 节点

```shell
scp /etc/kubernetes/admin.conf root@k8s-node1:/etc/kubernetes
```

```shell
echo "export KUBECONFIG=/etc/kubernetes/admin.conf">> ~/.bash_profile 
source ~/.bash_profile
```

单机部署

```shell
kubectl taint nodes --all node-role.kubernetes.io/master-
# node/master untainted
```

## dashboard

```shell
wget  https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
#默认Dashboard只能集群内部访问，修改Service为NodePort类型，暴露到外部
vim recommended.yaml
# 指定类型，如果没有制定类型那么默认为 ClusterIP， ClusterIP 是无法在集群外部访问的，
# 所以我们需要修改一下这个Service的type NodePort
```

```shell
# 然后k8s的主节点当中去执行：
kubectl apply -f recommended.yaml
# 监控仪表盘是否安装完成
watch kubectl get all -o wide -n kubernetes-dashboard
# 访问 Dashboard 用户界面
# 查看 kubernetes-dashboard Service暴露的端口：
kubectl get svc -n kubernetes-dashboard -o wide

```

```shell
kubectl -n kubernetes-dashboard create token kubernetes-dashboard

# 创建用户
kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
# 用户授权
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin
# 获取用户Token
kubectl create token dashboard-admin -n kubernetes-dashboard
# 使用输出的token登录Dashboard。



```

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dashboard-admin
  namespace: kube-system
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dashboard-admin
subjects:
  - kind: ServiceAccount
    name: dashboard-admin
    namespace: kube-system
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: v1
kind: Secret
metadata:
  name: dashboard-admin-token
  annotations:
    kubernetes.io/service-account.name: "dashboard-admin"
type: kubernetes.io/service-account-token
```

```shell
kubectl get secret -n kube-system 

# 这个token也能用于和Java client
kubectl get secret dashboard-admin-token-xxxx  -n kube-system   -o jsonpath='{.data.token}' | base64 --decode
```

## NVIDIA GPU

```shell
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.12.3/nvidia-device-plugin.yml
```

镜像下载不下来，通过[helm管理 ](https://github.com/NVIDIA/k8s-device-plugin#deployment-via-helm)

```shell
helm repo add nvdp https://nvidia.github.io/k8s-device-plugin
helm repo update
```

```shell
kubectl label node master gpu-type=RTX3070  gpu-memory=8GB
```

### GPU Operator

[官方文档](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html#operator-install-guide)

[参考教程](https://www.lixueduan.com/posts/kubernetes/25-gpu-share-time-slicing/)

#### 安装

1. GPU 节点必须运行相同的操作系统，

+ 如果提前手动在节点上安装驱动的话，该节点可以使用不同的操作系统
+ CPU 节点操作系统没要求，因为 gpu-operator 只会在 GPU 节点上运行

2. GPU 节点必须配置相同容器引擎，例如都是 containerd 或者都是 docker
3. 如果使用了 Pod Security Admission (PSA) ，需要为 gpu-operator 标记特权模式

```shell
kubectl create ns gpu-operator
kubectl label --overwrite ns gpu-operator pod-security.kubernetes.io/enforce=privileged
```

``4.集群中不要安装 NFD，如果已经安装了需要再安装 gpu-operator 时禁用 NFD 部署。

```shell
kubectl get nodes -o json | jq '.items[].metadata.labels | keys | any(startswith("feature.node.kubernetes.io"))'
```

5. helm部署

```shell
# 添加 nvidia helm 仓库并更新
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia \
    && helm repo update
# 以默认配置安装
helm install --wait --generate-name \
    -n gpu-operator --create-namespace \
    nvidia/gpu-operator

# 如果提前手动安装了 gpu 驱动，operator 中要禁止 gpu 安装
helm install --wait --generate-name \
     -n gpu-operator --create-namespace \
     nvidia/gpu-operator \
     --set driver.enabled=false

helm list -A 
```

```shell
kubectl -n gpu-operator get all
NAME                                                           READY   STATUS      RESTARTS      AGE
gpu-feature-discovery-jdqpb                                    1/1     Running     0             35d
gpu-operator-67f8b59c9b-k989m                                  1/1     Running     6 (35d ago)   35d
nfd-node-feature-discovery-gc-5644575d55-957rp                 1/1     Running     6 (35d ago)   35d
nfd-node-feature-discovery-master-5bd568cf5c-c6t9s             1/1     Running     6 (35d ago)   35d
nfd-node-feature-discovery-worker-sqb7x                        1/1     Running     6 (35d ago)   35d
nvidia-container-toolkit-daemonset-rqgtv                       1/1     Running     0             35d
nvidia-cuda-validator-9kqnf                                    0/1     Completed   0             35d
nvidia-dcgm-exporter-8mb6v                                     1/1     Running     0             35d
nvidia-device-plugin-daemonset-7nkjw                           1/1     Running     0             35d
nvidia-driver-daemonset-5.15.0-105-generic-ubuntu22.04-g5dgx   1/1     Running     5 (35d ago)   35d
nvidia-operator-validator-6mqlm                                1/1     Running     0             35d

```

6. 验证

```bash
kubectl -n gpu-operator exec -it nvidia-driver-daemonset-5.15.0-105-generic-ubuntu22.04-g5dgx -- nvidia-smi
Defaulted container "nvidia-device-plugin" out of: nvidia-device-plugin, config-manager, toolkit-validation (init), config-manager-init (init)
Wed Jul 17 01:49:35 2024
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 525.147.05   Driver Version: 525.147.05   CUDA Version: 12.0     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA A40          Off  | 00000000:00:07.0 Off |                    0 |
|  0%   46C    P0    88W / 300W |    484MiB / 46068MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   1  NVIDIA A40          Off  | 00000000:00:08.0 Off |                    0 |
|  0%   48C    P0    92W / 300W |  40916MiB / 46068MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
+-----------------------------------------------------------------------------+
```

7. 查看node资源、标签

```yaml
$ kubectl get node xxx -oyaml
status:
  addresses:
  - address: 172.18.187.224
    type: InternalIP
  - address: izj6c5dnq07p1ic04ei9vwz
    type: Hostname
  allocatable:
    cpu: "4"
    ephemeral-storage: "189889991571"
    hugepages-1Gi: "0"
    hugepages-2Mi: "0"
    memory: 15246720Ki
    nvidia.com/gpu: "1"  # gpu
    pods: "110"
  capacity:
    cpu: "4"
    ephemeral-storage: 206043828Ki
    hugepages-1Gi: "0"
    hugepages-2Mi: "0"
    memory: 15349120Ki
    nvidia.com/gpu: "1"
    pods: "110"
```

#### 测试

1. 开启TimeSlicing

```yaml
# kubectl create -n gpu-operator -f nvidia-time-slicing.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: time-slicing-config-all
data:
  any: |-
    version: v1
    flags:
      migStrategy: none
    sharing:
      timeSlicing:
        renameByDefault: false
        failRequestsGreaterThanOne: false
        resources:
          - name: nvidia.com/gpu
            replicas: 4  
```

2. 修改集群策略

```bash
kubectl patch clusterpolicies.nvidia.com/cluster-policy \
    -n gpu-operator --type merge \
    -p '{"spec": {"devicePlugin": {"config": {"name": "time-slicing-config-all", "default": "any"}}}}'

# 查看修改重启过程
kubectl get events -n gpu-operator --sort-by='.lastTimestamp'

```

3. 再次运行 `node -oyaml`，查看GPU是不是超分配了
4. 启动pod

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: time-slicing-verification
  labels:
    app: time-slicing-verification
spec:
  replicas: 2
  selector:
    matchLabels:
      app: time-slicing-verification
  template:
    metadata:
      labels:
        app: time-slicing-verification
    spec:
      tolerations:
        - key: nvidia.com/gpu
          operator: Exists
          effect: NoSchedule
      hostPID: true
      containers:
        - name: cuda-sample-vector-add
          image: "nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda11.7.1-ubuntu20.04"
          command: ["/bin/bash", "-c", "--"]
          args:
            - while true; do /cuda-samples/vectorAdd; done
          resources:
           limits:
             nvidia.com/gpu: 1
```

### HAMi

[官方文档](https://github.com/Project-HAMi/HAMi/blob/master/README_cn.md)

```shell

helm repo add hami-charts https://project-hami.github.io/HAMi/

# 注意指定镜像版本
helm install hami hami-charts/hami --set scheduler.kubeScheduler.imageTag=v1.23.6 -n gpu-operator



```

### GPU分配问题

1. [如果您在使用设备插件时不请求 GPU，则插件会在容器内公开机器上的所有 GPU。](https://github.com/NVIDIA/k8s-device-plugin)
2. 如果想分配GPU使用MIG（Multi-Instance GPU）参考链接：[NVIDIA.com](https://developer.nvidia.com/zh-cn/blog/deploying-nvidia-triton-at-scale-with-mig-and-kubernetes/#:~:text=%E5%9C%A8%20Kubernetes%20%E7%8E%AF%E5%A2%83%E4%B8%AD%EF%BC%8C%E5%BF%85%E9%A1%BB%E5%AE%89%E8%A3%85%20NVIDIA%20%E8%AE%BE%E5%A4%87%E6%8F%92%E4%BB%B6%E5%92%8C%20GPU%20%E5%8A%9F%E8%83%BD%E5%8F%91%E7%8E%B0%E6%8F%92%E4%BB%B6%E6%89%8D%E8%83%BD%E4%BD%BF%E7%94%A8%20MIG,A100%20GPU%20%E6%9C%89%E4%B8%83%E4%B8%AA%20MIG%20%E8%AE%BE%E5%A4%87%EF%BC%8C%E8%80%8C%E5%8F%A6%E4%B8%80%E4%B8%AA%20A100%20MIG%20%E8%A2%AB%E7%A6%81%E7%94%A8%E3%80%82)、[CSDN.com](https://blog.csdn.net/qq_27815483/article/details/140813348)
   1. A100 支持最高分配7个
3. 同一Pod里面，可以有多个容器，多个容器可以共享Pod的资源

## Token

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dashboard-admin
  namespace: kube-system
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dashboard-admin
subjects:
  - kind: ServiceAccount
    name: dashboard-admin
    namespace: kube-system
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io

```

```shell
kubectl get secret -n kube-system|grep admin
# dashboard-admin-token-xxxx                      kubernetes.io/service-account-token   3      2m
kubectl describe secret dashboard-admin-token-xxxx -n kube-system
```

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ns-admin
  namespace: my-namespace
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ns-admin
  namespace: my-namespace
rules:
  - apiGroups: [""] # 核心资源（如 pods, services）
    resources: ["pods", "services", "configmaps", "secrets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["apps"] # deployment 等
    resources: ["deployments", "replicasets", "statefulsets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["batch"] # job, cronjob
    resources: ["jobs", "cronjobs"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ns-admin
  namespace: my-namespace
subjects:
  - kind: ServiceAccount
    name: ns-admin
    namespace: my-namespace
roleRef:
  kind: Role
  name: ns-admin
  apiGroup: rbac.authorization.k8s.io

```

## 预留空间

> K8s集群搭建完成后需要再每个节点保留相应的资源，用于基础环境运行，防止集群雪崩

```yaml
# 在每个节点的  中指定不同的值
systemReserved:
  cpu: "1"          # 针对节点A
  memory: "1Gi"
  ephemeral-storage: "50Gi"

kubeReserved:
  cpu: "1"
  memory: "1Gi"
  ephemeral-storage: "5Gi"

evictionHard:
  memory.available: "200Mi"
  nodefs.available: "10%"
  nodefs.inodesFree: "5%"
  imagefs.available: "15%"
```

## Ingress

> [官方文档](https://github.com/kubernetes/ingress-nginx?tab=readme-ov-file#supported-versions-table)
>
> 注意和k8s集群的版本对应关系
>
> https如果是自签的，需要单独信任
>
> Ingress属于七层应用，端口属于四层，非七层协议，还是用NodePort

```shell
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
# 指定版本号
# see https://github.com/kubernetes/ingress-nginx?tab=readme-ov-file#supported-versions-table

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --version 4.3.0 \
  --set controller.image.tag="v1.6.4" \
  -f ingress-values.yaml

helm upgrade ingress-nginx ingress-nginx/ingress-nginx \
  -n ingress-nginx \
  -f ingress-values.yaml \
```

```yaml
controller:
  extraVolumes:
    - name: ingress-ca-cert
      configMap:
        name: ingress-ca-cert
  extraVolumeMounts:
    - name: ingress-ca-cert
      mountPath: /etc/ingress-ca-cert
      readOnly: true
  tcp:
    enabled: true  # 如果 chart 支持此开关，可以加上
  tcpServicesConfigMapNamespace: ingress-nginx
  tcpServicesConfigMapName: tcp-services
```

### 局域网

+ MetalLB：解决私有云测试部署验证问题

### 授权管理

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  namespace: ai-flow
  resourceVersion: '41949573'
  generation: 3
  creationTimestamp: '2025-07-01T02:51:30Z'
  labels:
    k8slens-edit-resource-version: v1
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: >
      {"apiVersion":"networking.k8s.io/v1","kind":"Ingress","metadata":{"annotations":{},"name":"my-ingress","namespace":"ai-flow"},"spec":{"ingressClassName":"nginx","rules":[{"host":"dfdf.com","http":{"paths":[{"backend":{"service":{"name":"animal-pose-3-2","port":{"number":8080}}},"path":"/","pathType":"Prefix"}]}},{"host":"dsds.com","http":{"paths":[{"backend":{"service":{"name":"animal-pose-3-2","port":{"number":8888}}},"path":"/","pathType":"Prefix"}]}}]}}
    nginx.ingress.kubernetes.io/auth-response-headers: X-Auth-Request-User, X-Auth-Request-Email
    nginx.ingress.kubernetes.io/auth-signin: >-
      http://oauth.abc.com:9003/oauth2/start?rd=$scheme://$host$request_uri
    nginx.ingress.kubernetes.io/auth-url: http://oauth.abc.com:9003/oauth2/auth
  selfLink: /apis/networking.k8s.io/v1/namespaces/ai-flow/ingresses/my-ingress
status:
  loadBalancer:  # 
    ingress:
      - ip: 10.1.72.2  # 私有云通过MetalLB解决
spec:
  ingressClassName: nginx
  rules:
    - host: 8080.abc.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ffddsssss-1-1270
                port:
                  number: 8080
    - host: 8888.abc.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ffddsssss-1-1270
                port:
                  number: 8888

```

## Tool

### brew

```shell
yum install -y zsh
chsh -s /bin/zsh
yum install -y git
sudo mkdir /usr/local/Homebrew

sudo git clone https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git /usr/local/Homebrew
sudo ln -s /usr/local/Homebrew/bin/brew /usr/local/bin/brew
sudo mkdir -p /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core
 
sudo git clone https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core

sudo mkdir -p /usr/local/Homebrew/Library/Taps/homebrew/homebrew-cask
sudo git clone https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-cask.git /usr/local/Homebrew/Library/Taps/homebrew/homebrew-cask

sudo chown -R $(whoami) /usr/local/Cellar


brew -v


cd "$(brew --repo)"
 
git remote set-url origin git://mirrors.ustc.edu.cn/brew.git


echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.bash_profile
 
source ~/.bash_profile   #刷新


brew update

```

```shell
# brew macos上的包管理工具

# K9s
curl -sS https://webinstall.dev/k9s | bash
```

Kubectx Kubens Kubecolor Kubetail Kubebox Lens K9s

```shell
source <(kubectl completion bash)  # 对于 bash 用户
source ~/.bashrc  # 或 ~/.zshrc 根据你的 shell 配置文件
```

## 磁盘管理

### local-path

```shell
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.29/deploy/local-path-storage.yaml

```

```shell
cat > local-path-v2.yaml << EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"storage.k8s.io/v1","kind":"StorageClass","metadata":{"annotations":{},"name":"local-path-v2"},"parameters":{"blockCleanerCommand":"/scripts/delete-block.sh","blockCleanerCommandRetries":"5","blockCleanerCommandTimeout":"1m","mountPath":"/iflytek/local-path-v2"},"provisioner":"rancher.io/local-path"}
  name: local-path-v2
parameters:
  blockCleanerCommand: /scripts/delete-block.sh
  blockCleanerCommandRetries: "5"
  blockCleanerCommandTimeout: 1m
  mountPath: /iflytek/local-path-v2
provisioner: rancher.io/local-path
reclaimPolicy: Delete
volumeBindingMode: Immediate
EOF

cat > local-path.yaml << EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"storage.k8s.io/v1","kind":"StorageClass","metadata":{"annotations":{},"name":"local-path"},"provisioner":"rancher.io/local-path","reclaimPolicy":"Delete","volumeBindingMode":"WaitForFirstConsumer"}
  name: local-path
provisioner: rancher.io/local-path
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
EOF

```

### 临时卷

```nginx
featureGates:
  LocalStorageCapacityIsolation: true
```

```shell
sudo systemctl daemon-reload        # 重新加载 systemd 配置
sudo systemctl restart kubelet      # 重启 kubelet 服务
```

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx
  namespace: default
spec:
  selector:
    matchLabels:
      run: nginx
  template:
    metadata:
      labels:
        run: nginx
    spec:
      containers:
      - image: nginx
        name: nginx
        resources:
          limits:
            ephemeral-storage: 2Gi
          requests:
            ephemeral-storage: 2Gi
```

```shell
dd if=/dev/zero of=/test bs=4096 count=1024000
```

然后应该会退出，pod会重建

## 配置

### 端口范围修改

```shell
vim /etc/kubernetes/manifests/kube-apiserver.yaml
# 添加
- --service-node-port-range=20000-22767
# 在 kube-system 下查找API，然后删除，然后通过describe查询配置是否生效
```

### 迁移数据盘

```shell
systemctl stop kubelet
```

```shell
mkdir -p /iflytek/kubelet
cp -rf /var/lib/kubelet/pods /iflytek/kubelet/
cp -rf /var/lib/kubelet/pod-resources /iflytek/kubelet/
mv /var/lib/kubelet/pods{,.old}
mv /var/lib/kubelet/pod-resources{,.old}
```

```shell
KUBELET_EXTRA_ARGS="--root-dir=/data/kubelet"
```

```shell
systemctl daemon-reload && systemctl restart kubelet
systemctl status kubelet
```
