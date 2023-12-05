import inquirer from 'inquirer';
import simpleGit from 'simple-git';


// Путь к вашему репозиторию
const repoPath = './';

// Создание экземпляра simple-git для работы с репозиторием по указанному пути
const git = simpleGit(repoPath);

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('ru-RU').split('/').reverse().join('.')

/**
 * Создание backup веток
 * @param branches
 * @returns {Promise<void>}
 */
const createBranches = async (branches) => {
    try {
        for (const branch of branches) {
            // Новое имя для копии ветки
            const newBranchName = `backup/${formattedDate}/${branch}`;

            // Переключение на исходную ветку
            await git.checkout(branch);

            // Создание копии ветки
            await git.checkoutLocalBranch(newBranchName);
            console.log(`Создан backup ${branch} => ${newBranchName}`);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

/**
 * Интерактивное подтверждение создания backup отфильтрованных веток
 * @returns {Promise<T>}
 */
const confirmation =() => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'confirmation',
            message: 'Вы действительно хотите создать backup этих веток ?',
            choices: [
                'Да',
                'Нет'
            ]
        }
    ]).then((answers) => answers.confirmation)
}

/**
 * Фильтруем ветки от которых будем делать backup
 * @param allBranches
 * @returns {*}
 */
const filtersBranch = (allBranches)=> {

    const newBackupBranches = allBranches.filter(item => !item.startsWith('backup'))

    console.log('Будут созданы следующие ветки Backup: \n')
    newBackupBranches.forEach(nameBranch => {
        console.log( `backup/${formattedDate}/${nameBranch}`)
    })

    console.log('----------')

    return newBackupBranches;
}


git.branchLocal((err) => {
    if (err) {
        console.error('Ошибка при получении списка веток:', err);
    }
}).then(resolve => {
        console.log(`Список всех веток: \n${resolve.all} \n---------------------`)
        return  resolve.all
    })
    .then(filtersBranch)
    .then(branches=> {
        confirmation().then(out => {
            if(out === 'Да') {
               void createBranches(branches)
            }
        })
    })