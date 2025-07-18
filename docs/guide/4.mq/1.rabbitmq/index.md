---
title: RabbitMQ
order: 1
---

# RabbitMQ

> 1. 坏盘怎么办，怎么伸缩
>
> Erlang语言最初在于交换机领域的架构模式，这样使得RabbitMQ在Broker之间进行数据交互的性能是非常优秀的
>
> Erlang的优点: Erlang有着和原生Socket一样的延迟
>

![](/assets/image/4.mq/1.rabbitmq/index/1.index.png)

## 集群
### 主备模式

warren (兔子窝)，一个主/备方案（主节点如果挂了，从节点提供服务，和ActiveMQ利用Zookeeper做主/备一样）

![](/assets/image/4.mq/1.rabbitmq/index/2.index.png)

### 远程模式

远距离通信和复制，可以实现双活的一种模式，简称**Shovel模式**

所谓Shovel就是我们可以把消息进行不同数据中心的复制工作，可以跨地域的让两个mq集群互联

![](/assets/image/4.mq/1.rabbitmq/index/3.index.png)

### 镜像模式

集群模式非常经典的就是Mirror镜像模式，保证100%数据不丢失

![](/assets/image/4.mq/1.rabbitmq/index/4.index.png)

### 多活模式

> 热伸缩
>

这种模式也是实现异地数据复制的主流模式，因为Shovel模式配置比较复杂，所以一-般来说实现异地集群都是使用这种双活或者多活模型来实现的

这种模型需要依赖RabbitMQ的**federation插件**，可以实现持续的可靠的**AMQP**数据通信，多活模式实际配置与应用非常简单

+ Federation插件是一个不需要构建Cluster,而在Brokers之间传输消息的高性能插件，Federation 插件可以在Brokers或者Cluster之间传输消息，连接的双方可以使用不同的users和virtual hosts,双方也可以使用版本不同的RabbitMQ和Erlang。Federation 插件使用**AMQP**协议通讯，可以接受不连续的传输
+ Federation Exchanges,可以看成Downstream从Upstream主动拉取消息，但并不是拉取所有消息，必须是在Downstream上已经明确定义Bindings关系的Exchange,也就是有实际的物理Queue来接收消息，才会从Upstream拉取消息到Downstream。使用AMQP协议实施代理间通信，Downstream 会将绑定关系组合在一起，绑定/解除绑定命令将发送到Upstream交换机。因此，FederationExchange只接收具有订阅的消息,本处贴出官方图来说明;

## 可靠性

> 保障消息的成功发出
>
> 保障MQ节点的成功接收
>
> 发送端收到MQ节点(Broker) 确认应答
>
> 完善的消息进行补偿机制
>

### 可靠性投递

消息落库，对消息状态打标

![](/assets/image/4.mq/1.rabbitmq/index/5.index.png)

消息延迟投递，做二次确认，回调确认

+ 通过二次延迟队列进行检查，如果没有结果，则重新告诉生产者发送新的任务

![](/assets/image/4.mq/1.rabbitmq/index/6.index.png)

### 幂等性
极端情况下AB两个线程同时对一个商品进行操作，此时版本号为1，当其中一个线程获取到商品操作后，将版本号+1，这样B线程就会失败，保证单次消费

消费端实现幂等性，就意味着,我们的消息永远不会消费多次，即时我们收到了多条一-样的消息

![](/assets/image/4.mq/1.rabbitmq/index/7.index.png)

#### 主流实现

唯一ID +指纹码机制，利用数据库主键去重

+ SELECT COUNT(1) FROM T ORDER WHERE ID =唯- -ID +指纹码
+ 好处：实现简单
+ 坏处：高并发下有数据库写入的性能瓶颈
+ 解决方案：跟进ID进行分库分表进行算法路由

利用Redis的原子性去实现

## DeadLetter

## QOS流控

TTL

## 常见场景

### 分布式

+ 普通集群：不同步数据，每个节点存储自己的消息队列，如果发生宕机，则不可用

### 消息发送

#### Topic模式

采用Topic Exchange交换数据，其Exchange下绑定多个消息队列，通过routingKey转发到指定队列

### 消费者

#### 并发

RabbitListener注解的concurrency可以设置并发度

#### 模式

push/pull

### 消息丢失

生产者和消费者都可以开启确认机制

+ 生产者
    - 
+ 消费者
    - 开启手动ack，但是无法自动重试

### 重试

+ 方案一：使用自动ACK + RabbitMQ重试机制
    - 使用自动ACK存在消息丢失风险
    - 重试一定次数以后会丢到DeadLetter中，可以指定其它队列
    - 需要显示的抛出异常
    - 重试机制依赖于spring-retry
    - 重试过程会阻塞
+ 方案二：使用手动ACK + 手动重试机制
    - 第一种：通过代码方式记录重试次数，超过重试次数以后将其丢入DeadLetter
    - 第二种：确认消费消息，但是把消息重试次数+1，再次放入队列（因为ack机制无法修改数据），超过重试次数以后将其丢入DeadLetter
    - nack会把数据丢到队头

### 对象传输

```java
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
```

## 异步调用

+ 异步调用常见实现就是事件驱动模式

![](/assets/image/4.mq/1.rabbitmq/index/8.index.png)

+ 异步通信的优点
    - 耦合度低
    - 吞吐量提升
    - 故障隔离
    - 流量削峰
+ 异步通信的缺点
    - 依赖于roker的可靠性、安全性、吞吐能力
    - 架构复杂了,业务没有明显的流程线，不好追踪管理

## 对比

|  | **RabbitMQ** | **ActiveMQ** | **RocketMQ** | **Kafka** |
| --- | :---: | --- | :---: | :---: |
| 公司/社区 | Rabbit | Apache | 阿里 | Apache |
| 开发语言 | Erlang | Java | Java | Scala&java |
| 协议支持 | AMQP，XMPP，SMTP，STOMP | OpenWire，STOMP<br/>REST,XMPP,AMQP | 自定义协议 | 自定义协议 |
| 可用性 | 高 | 一般 | 高 | 高 |
| 单机吞吐量 | 一般 | 差 | 高 | 非常高 |
| 消息延迟 | 微秒级 | 毫秒级 | 毫秒级 | 毫秒以内 |
| 消息可靠性 | 高 |  | 高 | 一般 |
