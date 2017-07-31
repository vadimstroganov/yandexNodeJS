let myForm = document.getElementById('myForm');
let resultContainer = document.getElementById('resultContainer');

myForm.validate = function () {
    let inputs = document.getElementsByTagName('input');
    let errors = [];
    let isValid = true;

    for (let inputName in inputs) {
        let input = inputs[inputName];
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
            errors.push(inputName);
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

};

myForm.submit = function () {
    function sendXhr(requestMethod, requestAction) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(requestMethod, requestAction);
            xhr.send();
            xhr.addEventListener('load', function () {
                resolve(xhr.response);
            });
        });
    }

    function sendRequest(requestMethod, requestAction) {
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
                        sendRequest(requestMethod, requestAction);
                    }, result.timeout);

                    break;
            }
        })
    }

    let validateResult = this.validate();

    if (validateResult.isValid) {
        sendRequest(this.method, this.action);
    }
};

// кастомный обработчик формы
myForm.addEventListener('submit', function (e) {
    e.preventDefault();
    this.submit();
});

// функции для валидации полей формы
function validateFio(value) {
    let numberOfWords = value.split(' ').length;
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
