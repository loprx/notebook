---
title: MinIO
order: 1
---

# MinIO

## 场景

非结构化数据存储需求

## 基本概念

+ **Object**：存储到 Minio 的基本对象，如文件、字节流，Anything... 
+ **Bucket**：用来存储 Object 的逻辑空间。每个 Bucket 之间的数据是相互隔离的。对于客户端而言，就相当于一个存放文件的顶层文件夹。 
+ **Drive**：即存储数据的磁盘，在 MinIO 启动时，以参数的方式传入。Minio 中所有的对象数据都会存储在 Drive 里。 
+ **Set**：即一组 Drive 的集合，分布式部署根据集群规模自动划分一个或多个 Set ，每个 Set 中的 Drive 分布在不同位置。一个对象存储在一个 Set 上。（For example: {1...64} is divided into 4 sets each of size 16） 
  - 一个对象存储在一个Set上 
  - 一个集群划分为多个Set 
  - 一个Set包含的Drive数量是固定的，默认由系统根据集群规模自动计算得出 
  - 一个SET中的Drive尽可能分布在不同的节点上

## 搭建

### 单机

> 单机直接指定挂载盘即可

```shell
# 版本差异大，具体参数 --help
minio server /mnt/data --console-address :9090
```

```shell
docker run --name minio \
-p 9001:9000 -p 9091:9090 -d --restart=always  \
-e "MINIO_ROOT_USER=minioadmin"  \
-e "MINIO_ROOT_PASSWORD=minioadmin"  \
-v /data/cifs_share/minio:/data \
-v /home/minio/config:/root/.minio  \
minio/minio:RELEASE.2022-05-04T07-45-27Z server /data --console-address '0.0.0.0:9090'
```

### 纠删码模式部署

> 至少4个磁盘

MinIO 使用纠删码机制来保证高可靠性，使用 highwayhash 来处理数据损坏（ Bit Rot Protection ）。

关于纠删码，简单来说就是可以通过数学计算，把丢失的数据进行还原，它可以将n份原始数据，增加m份数据，并能通过n+m份中的任意n份数据，还原为原始数据。即如果有任意小于等于m份的数据失效，仍然能通过剩下的数据还原出来。

Minio使用纠删码 erasure code 和校验和 checksum 来保护数据免受硬件故障和无声数据损坏。 即便**您丢失一半数量（N/2）的硬盘，您仍然可以恢复数据。此时只可读。**

纠删码是一种恢复丢失和损坏数据的数学算法， Minio采用Reed-Solomon code将对象拆分成N/2 数据和N/2 奇偶校验块。 这就意味着如果是12块盘，一个对象会被分成6个数据块、6个奇偶校验块，你可以丢失任意6块盘（不管其是存放的数据块还是奇偶校验块），你仍可以从剩下的盘中的数据进行恢复。

```shell
.\minio.exe  server F:\share\minio1 F:\share\minio2 F:\share\minio3 F:\share\minio4 F:\share\minio5 F:\share\minio6 F:\share\minio7 F:\share\minio8 --console-address :9090
.\minio.exe  server F:\share\minio{1...8} --console-address :9090
```

### 分布式

![](/assets/image/5.storage/1.minio/1.index.png)

+  **数据保护**
    - 分布式Minio采用 纠删码来防范多个节点宕机和位衰减 bit rot 。
    -  分布式Minio至少需要4个硬盘，使用分布式Minio自动引入了纠删码功能。
+  **高可用**
    - 单机Minio服务存在单点故障，相反，如果是一个有N块硬盘的分布式Minio,只要有N/2硬盘在线，你的 数据就是安全的。不过你需要至少有N/2+1个硬盘来创建新的对象。
    -  例如，一个16节点的Minio集群，每个节点16块硬盘，就算8台服務器宕机，这个集群仍然是可读的，不 过你需要9台服務器才能写数据。 
+ **一致性 **
    - Minio在分布式和单机模式下，所有读写操作都严格遵守read-after-write一致性模型。  

#### 注意事项

启动一个分布式Minio实例，你只需要把硬盘位置做为参数传给minio server命令即可，然后，你需要在 所有其它节点运行同样的命令。 

+ 分布式Minio里所有的节点需要有同样的access秘钥和secret秘钥，这样这些节点才能建立联接。 为了实现这个，你需要在执行minio server命令之前，先将access秘钥和secret秘钥export成环境 变量。新版本使用MINIO_ROOT_USER&MINIO_ROOT_PASSWORD。 
+ 分布式Minio使用的磁盘里必须是干净的，里面没有数据。 
+ 分布式Minio里的节点时间差不能超过3秒，你可以使用NTP 来保证时间一致。 
+ 在Windows下运行分布式Minio处于实验阶段，请悠着点使用。  

## 命令

```shell
ls 列出文件和文件夹。
mb 创建一个存储桶或一个文件夹。
cat 显示文件和对象内容。
pipe 将一个STDIN重定向到一个对象或者文件或者STDOUT。
share 生成用于共享的URL。
cp 拷贝文件和对象。
mirror 给存储桶和文件夹做镜像。
find 基于参数查找文件。
diff 对两个文件夹或者存储桶比较差异。
rm 删除文件和对象。
events 管理对象通知。
watch 监视文件和对象的事件。
policy 管理访问策略。
config 管理mc配置文件。
update 检查软件更新。
version 输出版本信息。
```

```shell
# 查询mc host配置
mc config host ls
# 添加minio服务
mc config host add minio-server http://192.168.3.14:9000 admin 12345678
# 删除host
mc config host remove minio-server
```

```shell
# 查询minio服务上的所有buckets(文件和文件夹)
mc ls minio-server
# 下载文件
mc cp minio-server/tulingmall/fox/fox.jpg /tmp/
#删除文件
mc rm minio-server/tulingmall/fox/fox.jpg
#上传文件
mc cp zookeeper.out minio-server/tulingmall/
```

```shell
# 创建bucket
mc mb minio-server/bucket01
# 删除bucket
mc rb minio-server/bucket02
# bucket不为空，可以强制删除 慎用
mc rb --force minio-server/bucket01
```

## 通知

> 可以对存储桶的 Get Put Delete 进行监控，当发生变化可以通过 Redis、Kafka、MySQL进行存储通知。

## 权限

> 根据 S3 存储桶标准，配置存储桶权限

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketLocation",
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::test2"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::test2/*"
            ]
        }
    ]
}
```

## 多版本

> 需要分布式

## Java API

> 官方[Java API](https://docs.min.io/docs/java-client-quickstart-guide.html)
