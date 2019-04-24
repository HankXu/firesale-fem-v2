const fs = require('fs');

const { app, BrowserWindow, dialog } = require('electron');

let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({ show: false });

    mainWindow.loadFile(`${__dirname}/index.html`);

    // getFileFromUser();

    mainWindow.once('ready-to-show', () => mainWindow.show());
})

exports.getFileFromUser = () => {
    const files = dialog.showOpenDialog({
        properties: ['openFile'],
        buttonLabel: '打开',
        filters: [
            { name: 'Markdown File', extensions: ['md', 'mdown', 'markdown', 'marcdown']}
        ]
    });

    if (!files) return;

    const file = files[0];
    
    openFile(file);
}

exports.saveMarkdownFile = (file, content) => {
    // 无文件路径则认为是新建文件
    if (!file) {
        file = dialog.showSaveDialog({
            title: 'Save File',
            defaultPath: app.getPath('documents'),
            filters: [
                {
                    name: 'Save Markdowm',
                    extensions: ['md', 'mdown', 'markdown', 'marcdown']
                }
            ]
        })
    }

    // 没有选择存储路径
    if (!file) return;

    // 写入新文件
    fs.writeFileSync(file, content);
    
    // 打开新文件
    openFile(file);

    // 返回新建文件的目录
    return file;
}

const openFile = (file) => {
    const content = fs.readFileSync(file).toString();

    // 添加打开过的文件到历史记录里
    app.addRecentDocument(file);
    // 向渲染进程发送文件打开事件
    mainWindow.webContents.send('file-opened', file, content);
}

