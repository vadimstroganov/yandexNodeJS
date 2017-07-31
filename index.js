let myForm = document.getElementById('myForm');

myForm.validate = function () {
    let inputs = this.getData();
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
        object[input.name] = input;
    }

    return object;
};

myForm.setData = function (object) {

};

myForm.submit = function () {

};

// кастомный обработчик формы
myForm.addEventListener('submit', function (e) {
    let validateResult = this.validate();
    if (validateResult.isValid) {
        // code
    } else {
        e.preventDefault();
        // code
    }
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
