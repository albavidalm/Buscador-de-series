"use strict";

const userSearch = document.querySelector(".js-userInput");
const buttonSearch = document.querySelector(".js-buttonSearch");
const resultContainer = document.querySelector(".js-searchResult");
const resultFavorites = document.querySelector(".js-favorites");
const defaultImage =
  "https://via.placeholder.com/210x295/ffffff/666666/?text=TV";
const backgroundFavCard = document.querySelector(".js-page");
const reset = document.querySelector(".js-resetButton");
let seriesData = [];
let favoritesData = [];

/* Sólo arrancar la página debemos cargar los datos:
A) Hacemos el fetch y le combinamos los parámetros de búsqueda de la usuaria.
Llenamos nuestro array seriesData con los valores de (data) para poder trabajar con ellos fuera de la función en un futuro.
B) (En un futuro paso creamos la función createCard)
C) Invocamos a createCard y le pasamos como parámetro nuestro array de datos seriesData _____________________________*/

function getApi() {
  const userSearchValue = userSearch.value;
  // console.log(userSearchValue); Input recogido OK
  fetch(`//api.tvmaze.com/search/shows?q=${userSearchValue}`)
    .then((response) => response.json())
    .then((data) => {
      seriesData = data;
      createCard(seriesData);
      createCardFavorite(favoritesData);
    });
}

//AL ARRANCAR LA PÁGINA
getLocalStorage();

//LocalStorage
function setLocalStorage() {
  localStorage.setItem("localListFavorites", JSON.stringify(favoritesData));
}

function getLocalStorage() {
  favoritesData = JSON.parse(localStorage.getItem("localListFavorites"));

  if (localStorage.getItem("localListFavorites") != null) {
    createCardFavorite(favoritesData);
    return favoritesData;
  } else {
    favoritesData = [];
    //const data = JSON.parse(localStorage.getItem("LocalListFavorites"));
    //console.log(data);
  }
}

/* Una vez obtenidos nuestros datos de la API deberemos crear nuestras fichas de series, para ello necesitamos un contenido HTML con los datos que nos interesan del objeto recibido para poder pintar posteriormente su contenido en nuestra página.
Como parámetro le paso (allInfo) que es cualquier nombre que le quiera dar en este caso pero que contiene la información de seriesData que se encunentra en la función superior y que a su vez es el Array vacío que hemos llenado en getAPI __________*/
function createCard(allInfo) {
  let htmlCardSerie = "";
  for (const serie of allInfo) {
    const isFav = false;
    if (isFav) {
      htmlCardSerie += `<li class="serie__card js-serie-card favorite" data-id= ${serie.show.id}>`;
    } else {
      htmlCardSerie += `<li class="serie__card js-serie-card" data-id= ${serie.show.id}>`;
    }

    if (serie.show.image === null) {
      htmlCardSerie += `<img class="serie__card--img" src="${defaultImage}" alt="Without cover" title="Without cover"/>`;
    } else {
      htmlCardSerie += `<img class="serie__card--img" src="${serie.show.image.medium}" alt="${serie.show.name} cover" title="${serie.show.name} cover" />`;
    }
    htmlCardSerie += `<h2 class="serie__card--title">${serie.show.name}</h2>`;
    htmlCardSerie += `</li>`;
  }
  resultContainer.innerHTML = htmlCardSerie; // Creo el html con el contenido superior
  addListernerstoCard(); // la llamamos aquí xq es cuando creamos las fichas y existen
}

//PAINT FAVORITES
function createCardFavorite(allFavs) {
  let htmlCardSerie = "";
  for (const serie of allFavs) {
    htmlCardSerie += `<li class="serie__card favorite js-serie-card" data-id= ${serie.show.id}>`;
    if (serie.show.image === null) {
      htmlCardSerie += `<img class="serie__card--img" src="${defaultImage}" alt="Without cover" title="Without cover"/>`;
    } else {
      htmlCardSerie += `<img class="serie__card--img" src="${serie.show.image.medium}" alt="${serie.show.name} cover" title="${serie.show.name} cover" />`;
    }
    htmlCardSerie += `<h2 class="serie__card--title-fav">${serie.show.name}</h2>`;
    htmlCardSerie += `</li>`;
  }
  resultFavorites.innerHTML = htmlCardSerie; // Creo el html con el contenido superior
  addListernerstoCard(); // la llamamos aquí xq es cuando creamos las fichas y existen
}

//____________________________________

buttonSearch.addEventListener("click", getApi);

//EVITAR QUE EL FORMULARIO SE ENVÍE VACÍO SI LA USUARIA LE DA A INTRO
const form = document.querySelector(".js-form");
function handleSubmit(event) {
  event.preventDefault();
  form.addEventListener("submit", handleSubmit);
}

/* FAVORITOS 
A) Tenemos que saber que recoger los elementos sobre los que queremos actuar (les hemos puesto la misma clase) y los guardamos en una constante.
Como son varios necesitamos recorrerlos para eso aplicamos el for.
En cada iteración se le añade el addEventListener al alemento.
B) Podemos invocar a la función en la función createCard
*/
function addListernerstoCard() {
  const allCards = document.querySelectorAll(".js-serie-card");
  for (const card of allCards) {
    card.addEventListener("click", favoriteClick);
  }
}

/* Clicar favoritos: Es un evento que necesita de un currentTarget xq necesitamos saber cuando se actua sobre el elemento para luego poder aplicar un toggle de cambio de color */
function favoriteClick(event) {
  const cardLiClicked = event.currentTarget; //añadimos al elemento q escuchamos q es la tarjeta y con el current escucha al elemento madre donde ha sucedido el evento. Si quisiéramos exactamente donde hemos pinchado sería target
  // console.log("li", cardLiClicked); //Visualizar ID

  const cardId = parseInt(cardLiClicked.dataset.id);
  //console.log("me han clickado", cardId);
  //console.log(cardId); Recoge OK la ID de la ficha
  // console.log("cardId", cardId); // ID recogido OK
  const isFav = favoritesData.find((favorite) => {
    //   console.log(favorite, cardId);
    return favorite.show.id === cardId;
  });

  if (isFav === undefined) {
    //En esta indexación si esa ID clicada no está en mi array de favoritos súbemela
    const serieClicked = seriesData.find((serie) => {
      //console.log(serie.show.id, cardId);
      return serie.show.id === cardId;
    });
    favoritesData.push(serieClicked);
  } else {
    favoritesData = favoritesData.filter((serie) => serie.show.id !== cardId);
  }
  //console.log(favoritesData); //Nuevo favoritesData guardado OK & nueva búsqueda

  createCard(seriesData);
  createCardFavorite(favoritesData);
  setLocalStorage();
}

//BOTÓN BORRAR LOCALSTORAGE
function eraseLocalStorage() {
  //console.log("Clicado");
  localStorage.removeItem("favoritesData");
  favoritesData = [];
  setLocalStorage();
  createCardFavorite(favoritesData);
}
reset.addEventListener("click", eraseLocalStorage);
