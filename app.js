const { Socket } = require('dgram')

var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
// 记录登陆过的 用户
const users = []

app.get('/', function(req, res){
    // res.sendFile(__dirname + '/index.html')
    res.redirect('./index.html')
})

// 设置静态资源目录
app.use(require('express').static('public'))

io.on('connect', socket => {
    socket.on('login', (data) => {
        const user =  users.find(item => item.username === data.username)
        if (user) {
            socket.emit('loginError',{ msg: '登录失败' })
        } else {
            users.push(data)
            socket.emit('loginSuccess', data)

            // 广播功能，告诉所有人
            io.emit('addUser', data)
            // 更新用户列表
            io.emit('userList', users)

            //存储登录成功的用户
            socket.username = data.username
            socket.avatar = data.avatar
        }
    })

    //用户断开连接
    socket.on('disconnect', () => {
        // 遍历用户表删除断开连接的用户
        const id = users.findIndex(item => item.username === socket.username)
        users.splice(id,1)
        // 广播告诉所有人用户离开了
        io.emit('delUser', { username: socket.username, avatar: socket.avatar })
        // 更新用户表
        io.emit('userList', users)
    })

    // 聊天功能
    socket.on('sendMessage', data=>{
        console.log(data)
        io.emit('recieveMessage', data)
    })

    //接收图片
    socket.on('sendImage', data => {
        console.log(data.username)
        io.emit('receiveImage', data)
    })
})



http.listen(3000, () => {
    console.log('服务器启动成功: http://localhost:3000')
})
