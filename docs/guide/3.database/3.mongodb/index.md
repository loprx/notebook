---
title: MongoDB
order: 3
---

# MongoDB

**MongoDB** 是一种 **面向文档的 NoSQL 数据库系统**，以高性能、高可用和易扩展著称。它不使用传统的表结构，而是使用类似 JSON 的 **BSON 文档** 来存储数据。

## ✅ 简单解释

> **MongoDB 是一个非关系型数据库**，数据以“文档”形式存储，结构灵活，特别适合存储复杂、不规则或快速变化的数据。

## 🧠 核心概念对比

| 概念   | 关系型数据库（如 MySQL） | MongoDB（非关系型） |
| ------ | ------------------------ | ------------------- |
| 数据库 | database                 | database            |
| 表     | table                    | collection（集合）  |
| 行     | row                      | document（文档）    |
| 列     | column                   | field（字段）       |

## 📦 MongoDB 的主要特点

| 特性                       | 说明                                        |
| -------------------------- | ------------------------------------------- |
| 🧾**文档模型**       | 数据以 BSON 文档格式存储，结构灵活类似 JSON |
| ⚡**高性能**         | 读写速度快，适合大数据量场景                |
| 📐**模式自由**       | 不需要定义表结构，可以存储不同结构的文档    |
| 🌐**支持分布式**     | 天生支持分片、复制、自动故障转移            |
| 🔍**强大的查询语言** | 支持复杂查询、聚合、索引、多条件筛选        |

## 🔤 示例数据（一个用户文档）

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Alice",
  "email": "alice@example.com",
  "age": 30,
  "tags": ["user", "admin"],
  "profile": {
    "city": "Beijing",
    "bio": "Software developer"
  }
}
```

## 🛠 常用操作命令（Mongo Shell 或 MongoDB Driver）

```js
// 切换数据库
use mydb

// 插入文档
db.users.insertOne({ name: "Bob", age: 25 })

// 查询文档
db.users.find({ age: { $gt: 20 } })

// 更新文档
db.users.updateOne({ name: "Bob" }, { $set: { age: 26 } })

// 删除文档
db.users.deleteOne({ name: "Bob" })
```

## 💬 MongoDB 的典型使用场景

* 实时数据分析
* 内容管理系统（CMS）
* IoT 设备数据采集
* 电商平台的商品数据
* 用户行为日志、评论、帖子等非结构化数据

## 📚 MongoDB vs MySQL（简要对比）

| 特性     | MongoDB                       | MySQL               |
| -------- | ----------------------------- | ------------------- |
| 类型     | NoSQL（文档数据库）           | SQL（关系型数据库） |
| 数据结构 | JSON/BSON 文档                | 表格/字段/行        |
| 灵活性   | 高，结构可变                  | 严格，需定义结构    |
| 扩展性   | 易于水平扩展（分片）          | 相对较差            |
| 事务支持 | 有（4.0+ 开始支持多文档事务） | 强，原生支持        |
