
const APP_NAME = exports.APP_NAME = 'Mars Editor';

const BASE_MENU = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open...',
                accelerator: 'CmdOrCtrl+O'
            },
            { type: 'separator' },
            {
                label: 'Save...',
                accelerator: 'CmdOrCtrl+S'
            },
            {
                label: 'Save Html',
                accelerator: 'CmdOrCtrl+Alt+S'
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            }
        ]
    }
];


const MAC_APP = {
    label: APP_NAME,
    submenu: [
        {
            label: `Abaout ${APP_NAME}`,
            role: 'about'
        },
        { type: 'separator' },
        {
            label: `Quit`,
            accelerator: 'CmdOrCtrl+Q',
            role: 'quit'
        }
    ]
};



exports.getMenuTemplate = (platform) => {
    const menu = [...BASE_MENU];
    if (platform === 'darwin') {
        menu.unshift(MAC_APP)
    }
    return menu;
};