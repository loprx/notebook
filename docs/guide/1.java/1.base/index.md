---
title: 基础
order: 1
---
# 基础

## 枚举
## 异常
异常是指由于各种不期而至的情况，导致程序中断运行的一种指令流，如:文件找不到、非法参数、网络超时等。为了保证程序正常运行，在设计程序时必须考虑到各种异常情况，并正确的对异常进行处理。



![](/assets/image/1.java/1.base/1.base.png)

### error
Error 是程序中无法处理的错误，只能事先避免。表示运行应用程序中出现了严重的错误。此类错误一般表示代码运行时 JVM 出现问题，错误发生时，JVM 将终止线程。如 OutOfMemoryError 内存溢出、StackOverflowError栈溢出等。

### exception
**编译时异常**

也叫检查时异常。Exception中除去运行时异常及其子类之外的异常。如果程序中出现此类异常，比如说IOException，必须对该异常进行处理，否则编译不通过。在程序中，通常不会自定义该类异常，而是直接使用系统提供的异常类。

+ FileNotFoundException
+ ParseException
+ IOException
+ ClassNotFoundException

**运行时异常**

也叫非检查时异常。RuntimeException类及其子类表示JVM在运行期间可能出现的错误。此类异常一般是由程序逻辑错误引起的，在程序中可以选择捕获处理，也可以不处理。

+ IndexOutOfBoundsException
+ NumberFormatException
+ NullPointException
+ ClassCaseException
+ ArithmeticException
+ IllegeArguementException

## 关键字
### final
### transient
+ 此关键字标志此属性不被序列化，被此关键字修饰的字段，只会作用于内存，不会序列化到磁盘。

### volatile
> [更好的解析](https://www.cnblogs.com/dolphin0520/p/3920373.html)
>

+ 保证这个变量在多线程操作时的可见性，当某一线程更新了它的值，新值对于其他线程都是立即可见
+ 禁止指令重新排序

### native


## 命令
### jps
查看所有的 Java 进程

### javap
对编译后 class 文件进行操作

### jstack
查看某个 Java 进程的（PID）的所有线程状态

### jconsole
+ 查看某个 Java 进程的线程运行情况
+ 通过图形化界面连接
+ 可以远程连接

```shell
java -Djava.rmi.server.hostname=`ip地址` -Dcom.sun.management.jmxremote -
Dcom.sun.management.jmxremote.port=`连接端口` -Dcom.sun.management.jmxremote.ssl=是否安全连接 -
Dcom.sun.management.jmxremote.authenticate=是否认证 java类
```

