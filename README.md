##  Репозиторий для создания Backup веток git

### backup-script.js
```js
//обязательно указваем путь к git репозиторию        
const repoPath = './'; //путь к репозиторию текущего проекта

const filtersBranch = (allBranches) => {
    //тут отфильтровываем ветки от которых надо создать backup 
    ...
    return newFilterBranch
}
```