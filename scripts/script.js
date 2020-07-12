'use Strict';
// Сохраняю все объявления
// Получаю данные из localStorage или массив(без него будет null)
const dataBase = JSON.parse(localStorage.getItem('awito')) || [];   

const modalAdd = document.querySelector('.modal__add'); // добавляю модальное окно
const addAd = document.querySelector('.add__ad');   // Получаю кнопку
const modalBtnSubmit = document.querySelector('.modal__btn-submit'); // Получаю Отправить
const modalSubmit = document.querySelector('.modal__submit'); // Добавляю форму
const catalog = document.querySelector('.catalog');
const modalItem = document.querySelector('.modal__item');
const modalBtnWarning = document.querySelector('.modal__btn-warning');
const modalFileInput = document.querySelector('.modal__file-input');
const modalFileBtn = document.querySelector('.modal__file-btn');
const modalImageAdd = document.querySelector('.modal__image-add');
// Временная переменная для очистки span кнопки
const textFileBtn = modalFileBtn.textContent; // Получаю текст
const srcModalImage = modalImageAdd.src;      // Получаю данные их src
// Получаю отфильтрованную коллекцию элементов
const elementsModalSubmit = [...modalSubmit.elements]
  .filter((elem) => elem.tagName !== 'BUTTON' && elem.type !== 'submit');
// console.log(elementsModalSubmit);
// const elementsModalSubmit = modalSubmit.elements;
// console.log([...elementsModalSubmit].filter((elem) => {
//   return elem.tagName !== 'BUTTON' && elem.type !== 'submit';
// // }));

const infoPhoto = {};
// Сохраняю данные в localStorage
const saveDB = () => localStorage.setItem('awito', JSON.stringify(dataBase));

console.log(dataBase);

const checkForm = () => {
  // Валидация формы
  const validForm = elementsModalSubmit.every(elem => elem.value);
  modalBtnSubmit.disabled = !validForm; // Разблокирую кнопку
  modalBtnWarning.style.display = validForm ? 'none' : '';  // Убираю надпись и Разблокирую кнопку 
};
// Делегирование событий
// Закрываю мод.окно && Закрытие окна при нажатии Esc
const closeModal = (e) => {
  const target = e.target;
  
  if (target.closest('.modal__close') || 
      target.classList.contains('modal') || 
      e.code === 'Escape') {
    modalItem.classList.add('hide');
    modalAdd.classList.add('hide');
    // Удаляю событие(прослушку) когда оно закрывается
    document.removeEventListener('keydown', closeModal);
    modalSubmit.reset();    // Очищаю форму 
    modalImageAdd.src = srcModalImage;      // Очистка изображения
    modalFileBtn.textContent = textFileBtn; // Очистка текста кнопки
    checkForm();          // Очищаю форму 
  } 
  
};
// Вывожу карточки товара
const renderCard = () => {
  catalog.textContent = '';   // Очищаю каталог
  // Перебираю БД
  dataBase.forEach((item, i) => {
    catalog.insertAdjacentHTML('beforeend', `
      <li class="card" data-id="${i}">
        <img class="card__image" src="data:image/jpeg;base64,${item.image}" alt="test">
        <div class="card__description">
          <h3 class="card__header">${item.nameItem}</h3>
          <div class="card__price">${item.costItem}</div>
        </div>
      </li>
    `);
  });
};
// Добавление фото
// FileReader создаёт объект который помогает работать с файлом который получу после добавления
modalFileInput.addEventListener('change', (e) => {
  const target = e.target;
  
  const reader = new FileReader();
  // Получаю выбранный файл
  const file = target.files[0];
  // console.log('file: ', file);
  infoPhoto.fileName = file.name;
  infoPhoto.size = file.size;
  // Отслеживаю бинарный формат
  reader.readAsBinaryString(file);
  
  reader.addEventListener('load', (e) => {
    // Устанавливаю ограничение файла
    if (infoPhoto.size < 300000) {
      modalFileBtn.textContent = infoPhoto.fileName;  // Получаю название файла
      infoPhoto.base64 = btoa(e.target.result); // Конвертирую картинку в строку
      modalImageAdd.src = `data:image/jpeg;base64,${infoPhoto.base64}`; // Заменяю тестовую картинку на загруженую
    } else {
      modalFileBtn.textContent = 'Размер больше 300Кб запрещен ';
      modalFileInput.value = '';  // Запрет на отправку файла больше 300Кб
      checkForm();              // Очищаю форму('Заполните все поля') 
    }
  });

});
// Отслеживаю действия в форме на заполненные поля
modalSubmit.addEventListener('input', checkForm);
// Сохраняю объявления
modalSubmit.addEventListener('submit', (e) => {
  e.preventDefault();       // отменяю перезагрузку страницы
  const itemObj = {};
  for (const elem of elementsModalSubmit) {
    itemObj[elem.name] = elem.value;
    // console.log(elem.name); console.log(elem.value);
  }
  itemObj.image = infoPhoto.base64; // Добавляю фото в БД
  dataBase.push(itemObj);
  closeModal({ target: modalAdd });   // Очищаю форму после Отправления
  saveDB();                         // Сохраняю данные в localStorage
  renderCard();                   // Запускаю функцию при отправке
  // console.log(dataBase);            // Проверяю, отправляются ли данные
});

addAd.addEventListener('click', () => {
  modalAdd.classList.remove('hide');     // Удаляю класс при клике
  modalBtnSubmit.disabled = true;     //  Блокирую кнопку
  document.addEventListener('keydown', closeModal);
});

modalAdd.addEventListener('click', closeModal);
modalItem.addEventListener('click', closeModal);
// Делегирование событий
// Закрываю мод.окно Каталога
catalog.addEventListener('click', (e) => {
  const target = e.target;
  if (target.closest('.card')) {
    modalItem.classList.remove('hide');
    // Навешиваю событие когда открылось модалюокно(чтобы оно все время не висело)
    document.addEventListener('keydown', closeModal); 
  }
});

renderCard();

