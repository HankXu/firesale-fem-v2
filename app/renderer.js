const path = require('path');
const marked = require('marked');
const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main.js');
const currentWindow = remote.getCurrentWindow();

const CONST_VARIABLES = {
  TITLE: 'mars editor'
};

const APP_STATES = {
  title: CONST_VARIABLES.TITLE,
  isEdited: false,
  originalContent: '',
  currentContent: '',
  file: null
};



const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const updateInterface = (currWindow) => {
  currWindow.setTitle(APP_STATES.title);
  // 按钮可用性修改
  saveMarkdownButton.disabled = !APP_STATES.isEdited;
  revertButton.disabled = !APP_STATES.isEdited;

  APP_STATES.file && currWindow.setRepresentedFilename(APP_STATES.file);
  currWindow.setDocumentEdited(APP_STATES.isEdited);
};

const updateStates = action => {
  const { key, value } = action;
  if (typeof key === 'string') return APP_STATES[key] = value;

  if (key.slice && key.forEach) {
    return key.forEach((keyItem, index) => APP_STATES[keyItem] = value[index]);
  }
};

const editedTitleCal = isEdited => {
  if (!isEdited) return APP_STATES.title.replace('  ●', '');
  if (APP_STATES.title.includes('●')) return APP_STATES.title;
  return `${APP_STATES.title}  ●`;
};

const cleanDragDropTipsClass = () => {
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');
};

const fileTypeSupported = file => {
  // 拖拽方法无法识别到 md 文件的类型，预期可以获得 'text/markdown'
  return ['text/plain', ''].includes(file.type);
};

const getDraggedFile = event => {
  return event.dataTransfer.items[0];
};

const getDroppedFile = event => {
  return event.dataTransfer.items[0].getAsFile();
};

/** view events **/
markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;
  const isEdited = currentContent !== APP_STATES.originalContent;

  renderMarkdownToHtml(currentContent);
  updateStates({
    key: ['isEdited', 'title', 'currentContent'],
    value: [isEdited, editedTitleCal(isEdited), currentContent]
  });
  updateInterface(currentWindow);
});


openFileButton.addEventListener('click', event => {
  mainProcess.getFileFromUser();
})

saveMarkdownButton.addEventListener('click', () => {
  const { file, currentContent } = APP_STATES;
  mainProcess.saveMarkdownFile(file, currentContent);
})

saveHtmlButton.addEventListener('click', () => {
  const htmlContent = htmlView.innerHTML;
  mainProcess.saveHtml(htmlContent);
})

/** stopProopagtion for document **/
document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

markdownView.addEventListener('dragover', event => {
  const file = getDraggedFile(event);
  
  const supported = fileTypeSupported(file);
  if (supported) {
    markdownView.classList.add('drag-over');
  } else {
    markdownView.classList.add('drag-error');
  }
})

markdownView.addEventListener('dragleave', event => {
  cleanDragDropTipsClass();
})

markdownView.addEventListener('drop', event => {
  const file = getDroppedFile(event);

  cleanDragDropTipsClass();
  mainProcess.openFile(file.path);

})


/** main proecess events **/
ipcRenderer.on('file-opened', (event, file, content) => {
  markdownView.value = content;
  renderMarkdownToHtml(content);

  const title =`${path.basename(file)} - ${CONST_VARIABLES.TITLE}`;
  updateStates({
    key: ['originalContent', 'title', 'file', 'isEdited'],
    value: [content, title, file, false]
  });
  updateInterface(currentWindow);
});
