// keepalive-worker.js
// 在后台持续运行的 Web Worker，保持页面活跃

console.log('🧠 Keepalive Worker 已启动');

// 每 15 秒发送一次心跳到主线程
setInterval(() => {
    self.postMessage({ 
        type: 'heartbeat', 
        time: Date.now() 
    });
}, 15000);

// 监听主线程消息
self.onmessage = (event) => {
    const data = event.data;
    
    if (data.type === 'ping') {
        self.postMessage({ 
            type: 'pong', 
            time: Date.now() 
        });
    }
    
    if (data.type === 'getStatus') {
        self.postMessage({ 
            type: 'status', 
            status: 'running',
            time: Date.now() 
        });
    }
};

// 错误处理
self.onerror = (error) => {
    console.error('Worker 错误:', error);
    // 继续运行
    return true;
};

console.log('✅ Keepalive Worker 初始化完成');