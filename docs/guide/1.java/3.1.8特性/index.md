---
title: 1.8 特性
order: 3
---

# 1.8 特性

## 接口的默认方法
+ Lambda 是访问不到默认的方法的

```java
pubilc interface Demo {
    default Demo getCurrent(){
        return this;
    }
}
```

## Lambda
1. 1.8 之前的做法

```java
List<Integer> integerList = new ArrayList<>();
integerList.sort(new Comparator<Integer>() {
    @Override
    public int compare(Integer o1, Integer o2) {
        return o1.compareTo(o2);
    }
});
```

2. 1.8 的做法

```java
List<Integer> integerList = new ArrayList<>();
integerList.sort((o1, o2) -> o1.compareTo(o2));

// 1.8 支持直接通过 :: 引用静态方法
integerList.sort(Integer::compareTo);
```

## 函数式接口
### 如何声明
1. 声明一个函数式接口
+ 可以通过注解 @FunctionInterface 标志这是一个函数式接口
+ 如果不标注，里面只写一个方法也可以，如果标注了，里面只能写一个方法

```java
@FunctionalInterface
interface Function<T, F> {
    T toType(F f);
}
```

2. 1.8 很多接口都加了 @FunctionInterface 注解，如：Runnable、Comparator

### <font style="color:rgb(51,51,51);">Predicate</font>
### Function
### <font style="color:rgb(51,51,51);">Supplier</font>
### <font style="color:rgb(51,51,51);">Consumer</font>
### <font style="color:rgb(51,51,51);">Comparator</font>
### <font style="color:rgb(51,51,51);">Optional</font>
### Stream
#### 普通 Stream
```java
values.stream().sorted().count();
```

#### 并行 Stream
```java
values.parallelStream().sorted().count();
```

### Filter
### Sort
....

## 方法和构造函数的应用
1. JDK 1.8 中允许使用 **::** 关键字，来引用构造函数、对象方法、静态方法

```java
class P {
    private String username;
    private String password;

    public P(String username, String password) {
        this.username = username;
        this.password = password;
    }
}

@FunctionalInterface
interface BeanFactor {
    P create(String username, String password);
}
```

```java
BeanFactor beanFactor = P::new;
beanFactor.create("a", "s");
```

## 多重注解
可以通过注解 @Repeatable 标注这是一个多重注解

```java
@Retention(RetentionPolicy.RUNTIME)
@interface Auths {
    Auth[] value();
}
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(Auths.class)
@interface Auth {
    String value();
}

```

编译时，编译器会隐性的帮定义一个 @Auths 注解

```java
@Auth("1")
@Auth("2")
public class Main {
    public static void main(String[] args) {
        // result: 2
        System.out.println(TestMain.class.getAnnotationsByType(Auth.class).length);
        // result: 2
        System.out.println(TestMain.class.getAnnotation(Auths.class).value().length);
        // result: null
        System.out.println(TestMain.class.getAnnotation(Auth.class));
    }
}
```

## 日期API
### Clock
### <font style="color:rgb(51,51,51);">Timezones</font>
### LocalDateTime
### LocalDate
### Localtime
