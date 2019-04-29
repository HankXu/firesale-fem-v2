const fs = require('fs');

const { app, BrowserWindow, dialog, Menu } = require('electron');

const { getMenuTemplate } = require('./menu.model');

let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({ show: false });

    mainWindow.loadFile(`${__dirname}/index.html`);

    const menuTempl = getMenuTemplate(process.platform);
    setMenuClick(menuTempl);
    const appMenuTempl = Menu.buildFromTemplate(menuTempl);
    Menu.setApplicationMenu(appMenuTempl);
    mainWindow.once('ready-to-show', () => mainWindow.show());
});

exports.getMainWindow = () => {
    return this.mainWindow;
}
exports.getFileFromUser = () => {
    const files = dialog.showOpenDialog(mainWindow, {
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
        file = dialog.showSaveDialog(mainWindow, {
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
};

exports.saveHtml = (htmlContent) => {
    const filePath = dialog.showSaveDialog(mainWindow, {
        title: 'Save Html',
        defaultPath: app.getPath('documents'),
        filters: [{ name: 'Html Files', extensions: ['htm', 'html']}]
    })
    if (!filePath) return ;

    fs.writeFileSync(filePath, htmlContent)
    return filePath;
};

const openFile = (exports.openFile = (file) => {
    const content = fs.readFileSync(file).toString();

    // 添加打开过的文件到历史记录里
    app.addRecentDocument(file);
    // 向渲染进程发送文件打开事件
    mainWindow.webContents.send('file-opened', file, content);
});

setMenuClick = (menus) => {
    menus.forEach(item => {
        if (item.submenu) {
            item.submenu.forEach(item => {
                if (typeof menuClickFunc[item.label] === 'function') {
                    item.click = menuClickFunc[item.label];
                }
            })
        }
    })
}

const menuClickFunc = {
    'Open...': () => {
        this.getFileFromUser();
    },
    'Save...': () => {
        mainWindow.webContents.send('save-markdown');
    },
    'Save Html': () => {
        mainWindow.webContents.send('save-html')
    }
}