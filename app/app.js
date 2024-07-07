import "regenerator-runtime/runtime";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";
//const BASE_URL = "https://api.bibliob.us";

const DeviceLogin = async (token) => {
  const request = await fetch(
    `${BASE_URL}/device-login?device_token=${token}`,
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
  return response.access_token;
};

const getDevice = async () => {
  const request = await fetch(`${BASE_URL}/device-discover/YmlidXMtMDAwMi0wMzA5Mg==`, 
    {
      //headers: {"Referrer-Policy": "strict-origin-when-cross-origin"},
    })
  const response = await request.json();
  return response;
};

const getBookshelf = async(access_token) => {
  const request = await fetch(`${BASE_URL}/bookshelf?numshelf=1`, {
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

const createDeviceElement = (item) => {
  const deviceElement = document.createElement("li");
  deviceElement.appendChild(
    document.createTextNode(item.device.arduino_name + " / ID:" + item.device.id_ble + " ")
  );
  // add button to simulate BLE connexion
  const button = document.createElement('button');
  button.innerHTML = 'Connect to device';
  button.onclick = async function(){
    clearBookList()
    const access_token = await DeviceLogin(item.device_token)
    if(access_token) {
      updateBookList(await getBookshelf(access_token))
    }
  };
  deviceElement.appendChild(button);
  return deviceElement;
};

const updateDeviceList = (deviceItems) => {
  const todoList = document.querySelector("ol");
  todoList.appendChild(createDeviceElement(deviceItems));
};

const clearDeviceList = () => {
  const deviceList = document.querySelector("ol");
  deviceList.innerHTML = ''
}


const createBookElement = (book) => {
  const bookElement = document.createElement("li");
  bookElement.appendChild(
    document.createTextNode(book.author + ' - ' + book.title)
  );
  return bookElement;
}

const updateBookList = (bookshelf) => {
  const bookList = document.querySelector("ul");
  for (const numshelf in bookshelf.stored_books) {
    const shelf = bookshelf.stored_books[numshelf]
    for (const led in shelf) {
      const book = shelf[led][1]
      if (book.item_type=='book') {
        //console.log(book)
        bookList.appendChild(createBookElement(book)); 
      }
    }
  }
}

const clearBookList = () => {
  const bookList = document.querySelector("ul");
  bookList.innerHTML = ''
}

const main = async () => {
  updateDeviceList(await getDevice())
}

main();
