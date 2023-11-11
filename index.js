const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單

let currentPage = 1
const MOVIES_PER_PAGE = 12  //新增這行

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') //新增這裡
const paginator = document.querySelector('#paginator')
const modalTitle = document.querySelector('#movie-modal-title')
const modalImage = document.querySelector('#movie-modal-image')
const modalDate = document.querySelector('#movie-modal-date')
const modalDescription = document.querySelector('#movie-modal-description')
const changeButton = document.querySelector('.change-button')

function renderMovieList(data) {
  let rawHTML = ''

  if (dataPanel.classList.contains('card-mode')) {

    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card ">
            <img src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button type="button" class="btn btn-info btn-add-favorite" role="button" data-bs-toggle="button" aria-pressed="true" data-id="${item.id}"><i class="fa-solid fa-heart"></i></button>
          </div>
        </div>
      </div>
    </div>`
    }); // 卡片模式html

  } else {

    //processing
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `
    <div class="col-12">
    <hr>
      <div class="list row align-items-center">
        <div class="list-card col-10">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="col-2">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button type="button" class="btn btn-info btn-add-favorite" role="button" data-bs-toggle="button" aria-pressed="true" data-id="${item.id}"><i class="fa-solid fa-heart"></i></button>
        </div>
      </div>
    </div>`
    }); // 列表模式html

  }

  dataPanel.innerHTML = rawHTML

}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  //新增這裡
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列 //修改這裡
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  // get elements

  // send request to show api
  axios.get(INDEX_URL + id).then(response => {
    // response.data.results
    const data = response.data.results

    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img
              src="${POSTER_URL + data.image}"
              alt="movie-poster" class="img-fluid">`
  })
}

//新增函式
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie => movie.id === id))) {
    return alert('此電影已經在收藏清單中!')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)  // 修改這裡
  } else if (event.target.matches('.btn-add-favorite')) { //新增以下
    addToFavorite(Number(event.target.dataset.id))
  }
})



//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件,預防瀏覽器預設行為 (重新導向目前頁面)
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //儲存符合篩選條件的項目

  //錯誤處理：輸入無效字串
  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }

  //條件篩選

  //【作法二】用條件來迭代：filter
  //map, filter, reduce
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  //【作法一】用迴圈迭代：for-of
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  currentPage = 1
  //重製分頁器
  renderPaginator(filteredMovies.length)  //新增這裡
  //重新輸出至畫面
  renderMovieList(getMoviesByPage(currentPage))  //修改這裡
})

// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  currentPage = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(currentPage))
})

// 切換閱讀模式
changeButton.addEventListener('click', function changeButtonClicked(event) {
  if (event.target.classList.contains('list-style-button')) {
    dataPanel.classList.remove('card-mode')
  } else if (event.target.classList.contains('card-style-button')) {
    dataPanel.classList.add('card-mode')
  }
  renderMovieList(getMoviesByPage(currentPage))
})

axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length) //新增這裡
    renderMovieList(getMoviesByPage(currentPage)) //修改這裡
  })
  .catch((err) => console.log(err))

