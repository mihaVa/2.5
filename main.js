const fs = require('fs');
const readline = require('readline');
const colors = require('colors')
const {readdir, stat} = require("fs/promises");
const path = require('path')
const { EventEmitter } = require("events");
let cd = path.join(__dirname) + "\\"
const commands = new EventEmitter();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function showMenu() {
    console.log('Ви зараз перебуваєте: ' + cd.red);
    console.log('Оберіть дію: \n' + 'see'.red + ' - Переглянути вміст каталогу \n' + 'cd'.red + ' - Перехід між каталогами \n' + 'create'.red + ' - Створення файлів і каталогів \n' + 'delete'.red + ' - Видалення файлів і каталогів \n' + 'read'.red + ' - Перегляд файлу \n' + 'change'.red + ' - Редагувати файл \n' + 'rename'.red + ' - Перейменування файлів або каталогів \n' + 'info'.red + ' - Перегляд інфорамції про файл або каталог \n' + 'exit'.red + ' - Вихід з програми \n ')
}
function showDirectory() {
    fs.readdir(cd, (err, files) => {
        if (err) {
            console.log(`Помилка: ${err}`);
            return;
        }
        console.log(`Files in directory: `);
        files.forEach(file => {
            console.log(file.green)

        })
        showMenu();
    });
}
function goCd() {
    rl.question('Введіть точний шлях до директорії: ', (answer) => {
        cd = answer;
        showMenu();
    });
}
function createDirectoryOrFile() {
    rl.question('Хочете створити папку' + '(1)'.red + 'чи файл' + '(2)'.red + ': ', (answer) => {
        switch (answer) {
            case '1':
                rl.question('Введіть назву' + ' папки'.magenta + ": ", (folderName) => {
                    fs.mkdir(cd + folderName, (err) => {
                        if (err) throw err;
                        console.log(`Папку ${folderName} створено`);
                    });
                })
                break;
            case '2':
                const content = 'Це вміст нового файлу!';

                rl.question('Введіть назву' + ' файлу.txt'.magenta + ": ", (answer) => {
                    fs.writeFile(cd + answer, content, err => {
                        if (err) throw err;
                        console.log('Файл створений та записаний успішно!');

                    });
                });
                break;
            default:
                console.log('Невірна команда'.rainbow);
        }
    });
}
function readFile() {
    rl.question('Введіть назву файлу:', (answer) => {
        fs.readFile(cd + answer, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data.gray);
            showMenu()
        });
    })
}
function changeFile() {
    let cdd = '1'
    let content = '1';
    rl.question('Введіть назву файлу:', (answer) => {
        rl.question('Введіть текст для файлу:', (text) => {
            fs.writeFile(cd + answer, text, (err) => {
                if (err) {
                    console.log('Ви не може редагувати цей файл!')
                    return;
                }
                console.log('Текст змінено!')

            });

        });
    });
}
function deleteDorF() {
    rl.question('Введіть назву файлу або папки, яку потрібно видалити: ', (fileName) => {
        fs.stat(cd + fileName, (err, stats) => {
            if (err) {
                console.log(`Файл або папку ${fileName} не знайдено`);
                showMenu();
            } else {
                if (stats.isDirectory()) {
                    fs.rmdir(fileName, (err) => {
                        if (err) throw err;
                        console.log(`Папку ${fileName} видалено`);
                        showMenu();
                    });
                } else {
                    fs.unlink(fileName, (err) => {
                        if (err) throw err;
                        console.log(`Файл ${fileName} видалено`);
                        showMenu();
                    });
                }
            }
        });
    });
}
function renameFileOrDirectory() {
    rl.question('Введіть стару назву файлу:', (answer) => {
        rl.question('Введіть нову назву для файлу:', (text) => {
            fs.rename(cd + answer, cd + text, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Папку/Файл успішно перейменовано!');
                }
            });

        });
    });
}
function infoAboutFileOrDirectory() {
    rl.question('Введіть назву файлу:', (name) => {
        fs.stat(cd+name, async (err, stats) => {
            if (err) {
                console.log(`Ви не можете подивитися інформацію про ${colors.red(name)}!`)
                return;
            }
            if (stats.isFile()) {
                console.log(`Інформація про ${colors.green(name)}:`)
                console.log(`Розмір: ${convertSize(stats.size)}`)
                console.log(`Власник: ${stats.uid}`)
                console.log(`Права доступу: ${stats.mode.toString(8).slice(-3)}`)
            } else if (stats.isDirectory()) {
                console.log(`Інформація про ${colors.blue(name)}:`)
                await dirSize(cd+name).then(size => console.log(`Розмір: ${convertSize(size)}`))
                console.log(`Власник: ${stats.uid}`)
                console.log(`Права доступу: ${stats.mode.toString(8).slice(-3)}`)
            }
        })
    })
}
const dirSize = async (dir) => {
    const files = await readdir(dir, {withFileTypes: true})

    const paths = files.map(async (file) => {
        const pth = path.join(dir, file.name)

        if (file.isDirectory()) return await dirSize(pth)
        if (file.isFile()) {
            const {size} = await stat(pth)
            return size
        }

        return 0
    })

    return (await Promise.all(paths)).flat(Infinity).reduce((i, size) => i + size, 0)
}
const convertSize = (size) => {
    let result = ''

    if (size < 1024) {
        result = `${size} Bytes`
    }
    if (size > 1024) {
        size /= 1024
        result = `${size.toFixed(3)} KB`
    }
    if (size > 1024) {
        size /= 1024
        result = `${size.toFixed(3)} MB`
    }
    if (size > 1024) {
        size /= 1024
        result = `${size.toFixed(3)} GB`
    }

    return result;
}

rl.on('line', (line) => {
    let command
    if (line.indexOf(" ") !== -1) {
        command = line.slice(0, line.indexOf(" "))
    } else {
        command = line
    }
    switch (command) {
        case 'see':
            commands.emit('see')
            break
        case 'cd':
            commands.emit('cd');
            break
        case 'create':
            commands.emit('create')
            break
        case 'read':
            commands.emit('read')
            break
        case 'change':
            commands.emit('change')
            break
        case 'rename':
            commands.emit('rename')
            break
        case 'delete':
            commands.emit('delete')
            break
        case 'info':
            commands.emit('info')
            break
        case 'menu':
            commands.emit('menu')
            break
        case 'exit':
            rl.close()
            break
        default:
            console.log(colors.yellow(`Перш ніж використовувати программу прошу вас ознайомитись з командами , які вам потрібно буде писати у чат!\nПодивитись як їх використовувати можливо написавши команду ${colors.bgWhite('help').white}`))
    }
})
commands.on('see', () => showDirectory())
commands.on('cd', () => goCd())
commands.on('create', () => createDirectoryOrFile())
commands.on('read', () => readFile())
commands.on('change', () => changeFile())
commands.on('menu', () => showMenu())
commands.on('delete', () => deleteDorF())
commands.on('rename', () => renameFileOrDirectory())
commands.on('info', () => infoAboutFileOrDirectory())



showMenu();
