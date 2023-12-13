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

            //push
            await git.push('origin', newBranchName);

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

/**
 * Получаем все ветки с репозитория
 * @returns {Promise<void>}
 */
async function fetchAllBranches() {
    try {
        // Получаем все изменения из удаленного репозитория
        await git.fetch();

        // Получаем список всех удаленных веток
        const remoteBranches = await git.branch(['-r']);
        const remoteBranchNames = remoteBranches.all;

        // Получаем список всех локальных веток
        const localBranches = await git.branchLocal();
        const localBranchNames = localBranches.all;

        // Создаем локальные ветки на основе удаленных (если их еще нет локально)
        for (const remoteBranch of remoteBranchNames) {
            const branchName = remoteBranch.replace('origin/', '');
            if (!localBranchNames.includes(branchName)) {
                await git.checkoutBranch(branchName, remoteBranch);
                console.log(`Создана локальная ветка ${branchName} от удаленной ${remoteBranch}`);
            } else {
                console.log(`Локальная ветка ${branchName} уже существует.`);
            }
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

await fetchAllBranches(); //стягиваем все ветки и создаем локальные копии если таких нет
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