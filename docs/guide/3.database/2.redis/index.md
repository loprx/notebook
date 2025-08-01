---
title: Redis
order: 2
---

# Redis

**Redis**（全称：**Remote Dictionary Server**）是一个**开源的内存数据结构存储系统**，常被用作：

* **缓存（Cache）**
* **消息队列（Message Queue）**
* **NoSQL 数据库**
* **实时排行榜、会话管理等场景**

---

## ✅ Redis 是什么？

> Redis 是一个**基于内存、可持久化**的键值对（key-value）数据库，支持多种丰富的数据类型。

---

## 💡 Redis 的核心特点

| 特性               | 说明                                   |
| ---------------- | ------------------------------------ |
| 🔥 **极快的访问速度**   | 所有数据都保存在内存中，读写速度非常快（通常在微秒级）          |
| 🧠 **丰富的数据结构**   | 支持字符串、列表、哈希、集合、有序集合、位图、HyperLogLog 等 |
| 💾 **可持久化**      | 虽然是内存数据库，但可以配置将数据保存到硬盘               |
| 🧱 **支持事务**      | 支持基本的事务操作（MULTI / EXEC / WATCH）      |
| ⚙️ **内置发布/订阅功能** | 可用作消息队列或通知系统                         |
| 📡 **主从复制和高可用**  | 支持主从架构、哨兵机制、集群模式                     |

---

## 📦 Redis 使用场景举例

1. **缓存系统**（如缓存数据库查询结果、页面片段、Token）
2. **分布式锁**
3. **消息队列**（基于 List 的 `LPUSH` + `BRPOP`）
4. **实时计数器、排行榜**（利用 Sorted Set）
5. **会话存储（Session）**
6. **防刷限流、验证码存储**

---

## 🔤 常用命令示例

```bash
# 启动 Redis 服务器
redis-server

# 连接 Redis
redis-cli
```

```bash
# 设置键值
SET name "Alice"

# 获取键值
GET name

# 设置带过期时间的键（10 秒）
SETEX temp_key 10 "temp value"

# 自增一个数值
INCR counter

# 操作列表
LPUSH mylist "item1"
RPUSH mylist "item2"
LRANGE mylist 0 -1
```

---

## 📚 Redis 和 MySQL 的区别（对比）

| 特性    | Redis        | MySQL         |
| ----- | ------------ | ------------- |
| 类型    | 内存型 NoSQL    | 磁盘型关系型数据库     |
| 存储结构  | 键值对 + 多种数据结构 | 表结构（关系模型）     |
| 数据持久化 | 可选（RDB/AOF）  | 默认持久化         |
| 适用场景  | 高速缓存、临时数据、队列 | 复杂查询、事务、结构化数据 |
| 查询能力  | 基于 key 查询    | SQL 多条件查询、聚合等 |

