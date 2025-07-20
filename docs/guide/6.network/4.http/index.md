---
title: HTTP
order: 4
---

## 结构

### 请求

```http
POST /java-api/user/login HTTP/1.1
Accept: application/json, text/plain, */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7
Authorization: null
Cache-Control: no-cache
Connection: keep-alive
Content-Length: 117    # 标志HTTP请求体的内容长度
Content-Type: application/json;charset=UTF-8
Cookie: Hm_lvt_c9edf8116a6bfc643a3fa21746b06aa3=1650417225; _ga=GA1.2.554841278.1650423111
Host: im.lopr.cn
Origin: https://im.lopr.cn
Pragma: no-cache
Referer: https://im.lopr.cn/login
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36
sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
```

```json
{
    "account": "123",
    "password": "34ze62C6M2Y=",
    "ip": "61.191.24.236",
    "country": "安徽省合肥市",
    "rTime": 1653226666360
}
```

### 响应

```http
HTTP/1.1 200
Server: nginx
Date: Sun, 22 May 2022 13:37:46 GMT
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive
Authorization: IMeyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxNDc5NzEwMzk4NzcyMTIxNjAwIiwic3ViIjoiMTIzIiwiaWF0IjoxNjUzMjI2NjY2LCJyb2xlcyI6InVzZXIiLCJleHAiOjE2NTY4MjY2NjZ9.YEoWapNDExVlbGCBALnQFRBD4936KJSAkC4FkPjlOas
X-Frame-Options: SAMEORIGIN
```

## 长连接短链接

当浏览器访问一个包含多张图片的 HTML 页面时，除了请求访问的 HTML 页面资源，还会请求图片资源。如果每进行一次 HTTP 通信就要新建一个 TCP 连接，那么开销会很大。

长连接只需要建立一次 TCP 连接就能进行多次 HTTP 通信。

+ 从 HTTP/1.1 开始默认是长连接的，如果要断开连接，需要由客户端或者服务器端提出断开，使用 Connection : close；
+ 在 HTTP/1.1 之前默认是短连接的，如果需要使用长连接，则使用 Connection : Keep-Alive

## 1.0 1.1 2.0
### 1.0 缺陷

HTTP/1.x 实现简单是以牺牲性能为代价的：

+ 短链接
+ 客户端需要使用多个连接才能实现并发和缩短延迟；
+ 不会压缩请求和响应首部，从而导致不必要的网络流量；
+ 不支持有效的资源优先级，致使底层 TCP 连接的利用率低下。

### 2.0 压缩

HTTP/1.1 的首部带有大量信息，而且每次都要重复发送。

HTTP/2.0 要求客户端和服务器同时维护和更新一个包含之前见过的首部字段表，从而避免了重复传输。

不仅如此，HTTP/2.0 也使用 Huffman 编码对首部字段进行压缩。

### 1.1 特性

+ 默认是长连接
+ 支持流水线
+ 支持同时打开多个 TCP 连接
+ 支持虚拟主机
+ 新增状态码 100
+ 支持分块传输编码
+ 新增缓存处理指令 max-age

## HTTPS
HTTP 有以下安全性问题：

+ 使用明文进行通信，内容可能会被窃听；
+ 不验证通信方的身份，通信方的身份有可能遭遇伪装；
+ 无法证明报文的完整性，报文有可能遭篡改。

HTTPS 并不是新协议，**而是让 HTTP 先和 SSL（Secure Sockets Layer）通信，再由 SSL 和 TCP 通信，也就是说 HTTPS 使用了隧道进行通信。**

通过使用 SSL，HTTPS 具有了加密（防窃听）、认证（防伪装）和完整性保护（防篡改）。

### 非对称加密

非对称密钥加密，又称公开密钥加密（Public-Key Encryption），加密和解密使用不同的密钥。

公开密钥所有人都可以获得，通信发送方获得接收方的公开密钥之后，就可以使用公开密钥进行加密，接收方收到通信内容后使用私有密钥解密。

非对称密钥除了用来加密，还可以用来进行签名。因为私有密钥无法被其他人获取，因此通信发送方使用其私有密钥进行签名，通信接收方使用发送方的公开密钥对签名进行解密，就能判断这个签名是否正确。

+ 优点：可以更安全地将公开密钥传输给通信发送方；
+ 缺点：运算速度慢。

### 对称加密

对称密钥加密（Symmetric-Key Encryption），加密和解密使用同一密钥。

+ 优点：运算速度快；
+ 缺点：无法安全地将密钥传输给通信方。

### HTTPS 采用的加密

上面提到对称密钥加密方式的传输效率更高，但是无法安全地将密钥 Secret Key 传输给通信方。而非对称密钥加密方式可以保证传输的安全性，因此我们可以利用非对称密钥加密方式将 Secret Key 传输给通信方。HTTPS 采用混合的加密机制，正是利用了上面提到的方案：

+ **使用非对称密钥加密方式，传输对称密钥加密方式所需要的 Secret Key，从而保证安全性;**
+ **获取到 Secret Key 后，再使用对称密钥加密方式进行通信，从而保证效率。（下图中的 Session Key 就是 Secret Key）**

### 认证

通过使用 **证书** 来对通信方进行认证。

数字证书认证机构（CA，Certificate Authority）是客户端与服务器双方都可信赖的第三方机构。

服务器的运营人员向 CA 提出公开密钥的申请，CA 在判明提出申请者的身份之后，会对已申请的公开密钥做数字签名，然后分配这个已签名的公开密钥，并将该公开密钥放入公开密钥证书后绑定在一起。

进行 HTTPS 通信时，服务器会把证书发送给客户端。客户端取得其中的公开密钥之后，先使用数字签名进行验证，如果验证通过，就可以开始通信了。

### 缺点

+ 多了加密解密过程，会更慢
+ 需要购买证书

## 常见请求方法

> GET POST HAED PUT TRACE DELETE OPTIONS

## GET

```java
public static void main(String[] args) {
    try {
        Socket socket = new Socket("im.lopr.cn", 80);
        StringBuffer sb = new StringBuffer("GET / HTTP/1.1/r/n");
        sb.append("Host: im.lopr.cn/r/n");
        OutputStream socketOut = socket.getOutputStream();
        socketOut.write(sb.toString().getBytes());
        socket.shutdownOutput(); // 关闭输出流
        System.out.println(socket);
        InputStream socketIn = socket.getInputStream();
        BufferedReader br = new BufferedReader(new InputStreamReader(socketIn));
        String data;
        while ((data = br.readLine()) != null) {
            System.out.println(data);
        }
        socket.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

### HEAD

1. 和GET基本一致，只判断内容是否存在

```http
HEAD / HTTP/1.1
Host: im.lopr.cn
```

```properties
HTTP/1.1 301 Moved Permanently
Server: nginx
Date: Sun, 22 May 2022 13:45:11 GMT
Content-Type: text/html
Content-Length: 162
Connection: keep-alive
Location: https://im.lopr.cn/
```

### TRACE

是你用了代理上网，比如用代理访问news.163.com ,你想看看代理有没有修改你的HTTP请求.可以用TRACE来测试一下， 163.com的服务器就会把最后收到的请求返回给你。

### OPTIONS

返回服务器可用的请求方法。

## 状态码

| 状态码 | 定义 |
| --- | --- |
| 1XX | 接收到请求继续处理 |
| 2XX | 成功 |
| 3XX | 重定向  |
| 4XX | 客户端错误 |
| 5XX | 服务端错误 |

### 3XX

301/302 永久/ 临时重定向

#### 304

## referer 防盗链

## 缓存

|  | **强缓存** | **协商缓存** |
| --- | --- | --- |
| **位置** | 浏览器 | 浏览器 |
| **http状态码** | 200 | 304 |
| **谁来决定** | Pragma<br/>Cache-Control<br/>Expires | ETag/If-Not-Match<br/>Last-Modified/If-Modified-Since |
| **是否有效** | 1、Ctrl+ F5强制刷新--无效<br/>2、F5刷新--无效<br/>3、地址栏回车--有效<br/>4、页面链接跳转 --有效<br/>5、新开窗口 --有效<br/>6、前进、后退--有效 | 1、Ctrl+ F5强制刷新--无效<br/>2、F5刷新--有效<br/>3、地址栏回车--有效<br/>4、页面链接跳转--有效<br/>5、新开窗口--有效<br/>6.前进、后退--有效 |

### 协商缓存 no-cache

协商缓存每次都需要向服务器发送请求，只不过不是请求数据，而是验证缓存是否失效，如果缓存不失效，就使用缓存，如果缓存失效，服务器就重新发送数据。

+ 请求
    -  Etag 和 Last-Modified 
    - Cache-Control
        * max-age
        * no-store must-revalidate


+ 响应

### 强缓存

强制缓存的做法是只要缓存还有效，就直接使用缓存，不会向服务器请求缓存对应的数据是否发生变换。  
如果过了有效期，就去服务器服务器验证。如果缓存不可用就更新浏览器中的缓存；如果能用，就直接使用缓存。

## 内容压缩

> 消耗CPU资源，一般压缩文本格式的资源

+ Content-Encoding: gzip
+ 常见压缩格式
    - gzip
    - deflate
    - compress
    - sdch

```nginx
    gzip on;   #开启压缩
    gzip_comp_level 5; #压缩比，默认3-5即可，越大CPU负载越高
    gzip_http_version  1.1;
    gzip_min_length 1k;  #低于1k的不压缩
    gzip_types text/css;  # 对哪些mine资源
    gzip_vary on;       #是否在响应报文首部插入“Vary: Accept-Encoding”
```

## 反向Ajax

> 反向 ajax 又叫 comet, server push，服务器推技术。
>
> 原理：HTTP协议的特点，连接<->断开。


+ 具体什么时间断开
    - 服务器响应content-length收到到指定length 长度的内容时，也就断开了



在 http1.1 协议中，允许你不写 content- length，这时需要一个特殊的 Transfer-Encoding: chunked

+ 分块传输的原理是这样的：
    - 123H \r\n
        * 123H个长度的内容传输给给客户端\r\n
    - 41H\r\n
        * 浏览器继续接收41H长度的内容\r\n
    - 0\r\n
        * 消息发送结束
