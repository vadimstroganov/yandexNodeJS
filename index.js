let myForm = document.getElementById('myForm');
let resultContainer = document.getElementById('resultContainer');

myForm.validate = function () {
    let inputs = document.getElementsByTagName('input');
    let errors = [];
    let isValid = true;

    for (let input of inputs) {
        let validateResult;

        if (!input.hasAttribute('data-validate-type')) {
            continue;
        }

        switch(input.dataset.validateType) {
            case 'fio':
                validateResult = validateFio(input.value);
                break;
            case 'email':
                validateResult = validateEmail(input.value);
                break;
            case 'phone':
                validateResult = validatePhone(input.value);
                break;
            default:
                continue;
        }

        elementSetError(input, validateResult);

        if (!validateResult) {
            isValid = false;
            errors.push(input.name);
        }
    }

    return { isValid: isValid, errorFields: errors };
};

myForm.getData = function () {
    let inputs = this.getElementsByTagName('input');
    let object = {};

    for (let input of inputs) {
        object[input.name] = input.value;
    }

    return object;
};

myForm.setData = function (object) {
    const allowedElementNames = ['fio', 'email', 'phone'];

    for (let elName in object) {
        if (allowedElementNames.includes(elName)) {
            let el = document.getElementsByName(elName)[0];
            el.value = object[elName];
        }
    }
};

myForm.submit = function () {
    function sendXhr(requestMethod, requestAction) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(requestMethod, requestAction);

            xhr.onload = function () {
                xhr.status === 200 ? resolve(xhr.response) : reject();
            };

            xhr.onerror = function () {
                reject(new Error("Error"));
            };

            xhr.send();
        });
    }

    function processRequest(requestMethod, requestAction) {
        sendXhr(requestMethod, requestAction).then(function (results) {
            let result = JSON.parse(results);

            switch(result.status) {
                case 'success':
                    resultContainer.classList.remove();
                    resultContainer.classList.add('success');
                    resultContainer.textContent = 'Success';
                    break;
                case 'error':
                    resultContainer.classList.remove();
                    resultContainer.classList.add('error');
                    resultContainer.textContent = result.reason;
                    break;
                default:
                    resultContainer.classList.remove();
                    resultContainer.classList.add('progress');

                    setTimeout(function () {
                        processRequest(requestMethod, requestAction);
                    }, result.timeout);

                    break;
            }
        }).catch(function (e) {
            resultContainer.classList.remove();
            resultContainer.classList.add('error');
            resultContainer.textContent = e;
        })
    }

    let validateResult = this.validate();

    if (validateResult.isValid) {
        document.getElementById("submitButton").disabled = true;
        processRequest(this.method, this.action);
    }
};

// кастомный обработчик формы
myForm.addEventListener('submit', function (e) {
    e.preventDefault();
    this.submit();
});

// функции для валидации полей формы
function validateFio(value) {
    let numberOfWords = value.trim().split(' ').length;
    return numberOfWords === 3;
}

function validateEmail(value) {
    let allowDomains = ["ya.ru", "yandex.ru", "yandex.ua", "yandex.by", "yandex.kz", "yandex.com"];
    let pattern = `[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+.)?[a-zA-Z]+.)?(${allowDomains.join('|')}$)`;
    let regex = new RegExp(pattern);

    return regex.test(value);
}

function validatePhone(value) {
    const maxSumOfNumbers = 30;
    let regex = /^\+7[(]([0-9]){3}[)]([0-9]){3}-([0-9]){2}-([0-9]){2}$/;
    let sumOfNumbers = value.replace(/[^0-9]/g,'').split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);

    return regex.test(value) && sumOfNumbers <= maxSumOfNumbers;
}

// функция для управления классом ошибки поля
function elementSetError(element, bool) {
    if (bool) {
        element.classList.remove('error');
    } else {
        element.classList.add('error');
    }
}
