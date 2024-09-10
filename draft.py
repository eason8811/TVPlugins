# 简单的记：for   是当你知道一共要循环多少次的时候用
#         while 是当你不知道循环多少次的时候用

# for: 比如循环取出一个列表中的值（遍历）就可以使用for循环，因为你知道列表的长度
lst = [2, 3, 4, 5, 6, 7, 8, 9]  # 这是一个你设定的列表，列表中有8个元素

for i in lst:    # 循环取出列表中的值，每次从lst中取出一个值赋值给i
    print(i)    # 打印i的值

# 输出：
# 2
# 3
# 4
# 5
# 6
# 7
# 8
# 9

# while: 循环的条件是不确定的，比如你要循环直到某一条件满足才退出循环，就可以使用while循环
# 比如以下要实现的功能：用户输入一个数字 x，程序输出 x 次 "梁岩我爱你"
x_input = input("请输入一个数字：")   # 用户输入一个数字
x = int(x_input)   # 将用户输入的字符串转换为整数

i = 0   # 循环计数器
while i < x:   # 循环条件是 i 小于 x
    print("梁岩我爱你")   # 输出 "梁岩我爱你"
    i += 1   # 计数器加1

# 输入：
# 请输入一个数字：10

# 输出:
# 梁岩我爱你
# 梁岩我爱你
# 梁岩我爱你
# 梁岩我爱你
# 梁岩我爱你
# 梁岩我爱你
# 梁岩我爱你
# 梁岩我爱你
# 梁岩我爱你
# 梁岩我爱你

