---
title: MySQL 
order: 1
---
# MySQL

## ✅ 什么是 MySQL？

**MySQL** 是一个开源的关系型数据库管理系统（RDBMS），由 Oracle 公司维护。它常用于网站开发、企业数据存储、数据分析等场景。

---

## 💡 MySQL 的主要特点

* **关系型数据库**：数据存储在表中，可以使用 SQL（结构化查询语言）进行操作。
* **开源免费**：MySQL 社区版本是免费且开源的。
* **跨平台**：支持 Windows、Linux、macOS 等操作系统。
* **高性能**：对读操作优化得很好，适合中小型项目和互联网应用。
* **支持事务**：使用 InnoDB 存储引擎时，支持 ACID 事务。
* **广泛应用**：几乎所有主流编程语言（Java、Python、PHP、Node.js等）都能与 MySQL 集成。

---

## 📦 MySQL 的典型使用场景

* 搭建网站后台（如 WordPress）
* 企业管理系统（ERP、CRM 等）
* 数据分析（配合 ETL 工具）
* 和大型开源项目配合（如 LAMP 架构中的 “M” 就是 MySQL）

---

## 🛠 常用命令示例

```sql
-- 创建数据库
CREATE DATABASE mydb;

-- 使用数据库
USE mydb;

-- 创建表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

-- 插入数据
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

-- 查询数据
SELECT * FROM users;
```
