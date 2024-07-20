import "regenerator-runtime/runtime";
//import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";
//const BASE_URL = "https://api.bibliob.us";
const uuid = "YmlidXMtMDAwMi0wMzA5Mg==";
//Demo YmlidXMtMDAwMi0wMzA5Mg== 
//BT YmlidXMtMDAwMy0wMzA0Nw==
//B1 YmlidXMwMDAx

const getDevice = async () => {
  const request = await fetch(`${BASE_URL}/devices/discover/${uuid}`, 
    {
      //headers: {"Referrer-Policy": "strict-origin-when-cross-origin"},
    })
  console.log('uuid', uuid)
  const response = await request.json();
  return response;
};

const DeviceLogin = async (token) => {
  const request = await fetch(
    `${BASE_URL}/devices/login?device_token=${token}`,
    {
      body: "",
      method: "POST",
    }
  );
  if (!request.ok) {
    if(request.status == 401) {
      alert('Refresh device token')
      console.log('get new device token')
      clearDeviceList()
      clearBookList()
      return updateDeviceList(await getDevice())
    }
    //alert(`Response status: ${request.status}`)
    //throw new Error(`Response status: ${request.status}`);
  }  
  const response = await request.json();
  console.log('device_token', token)
  console.log(response.access_token)
  return response.access_token;
};

const createDeviceElement = (device) => {
  const deviceElement = document.createElement("li");
  deviceElement.appendChild(
    document.createTextNode(device.arduino_name + " / ID:" + device.id_ble + " ")
  );
  // add button to simulate BLE connexion
  const button = document.createElement('button');
  button.innerHTML = 'Connect to device';
  button.onclick = async function(){
    clearBookList()
    const access_token = await DeviceLogin(device.login.device_token)
    if(access_token) {
      updateBookList(await getBookshelf(access_token))
    }
  };
  deviceElement.appendChild(button);
  return deviceElement;
};

const updateDeviceList = (deviceItems) => {
  const todoList = document.getElementById("deviceList");
  todoList.appendChild(createDeviceElement(deviceItems));
};

const clearDeviceList = () => {
  const deviceList = document.getElementById("deviceList");
  deviceList.innerHTML = ''
}

const getBookshelf = async(access_token) => {
  const request = await fetch(`${BASE_URL}/books/shelf`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
  });
  const response = await request.json();
  //console.log(response)
  return response;
}

const createBookList = (booksForShelf) => {
  const bookList = document.createElement("ul");
    for (const i in booksForShelf) {
      //console.log('books', booksForShelf[i])
      const led_column = booksForShelf[i].led_column
      const book = booksForShelf[i].book
      bookList.appendChild(createBookElement(book)); 
  }
  return bookList
}

const createBookElement = (book) => {
  const bookElement = document.createElement("li");
  bookElement.appendChild(
    document.createTextNode(book.author + ' - ' + book.title)
  );
  return bookElement;
}

const createShelfElement = (numshelf) => {
  const shelfList = document.createElement("ul");
  const shelfElement = document.createElement("li");
  shelfElement.appendChild(
    document.createTextNode(`shelf n°: ${numshelf}`)
  );
  shelfList.appendChild(shelfElement);
  return shelfList;
}

const updateBookList = (bookshelf) => {
  const bookShelfList = document.getElementById("bookShelf");
  for (const i in bookshelf.books) {
    const numshelf = bookshelf.books[i].numshelf
    const booksForShelf = bookshelf.books[i].items
    // create list for shelves
    const shelfList = createShelfElement(numshelf)
    // create list for books in shelves
    const bookList = createBookList(booksForShelf) 
    shelfList.appendChild(bookList)
    bookShelfList.appendChild(shelfList)
  }
}

const clearBookList = () => {
  const bookShelfList = document.getElementById("bookShelf");
  bookShelfList.innerHTML = ''
}

const main = async () => {
  updateDeviceList(await getDevice())
}

main();
