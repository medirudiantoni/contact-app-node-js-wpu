const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const dirPath = "./data";
const dataPath = "./data/contacts.json";

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

const loadContact = () => {
  const file = fs.readFileSync("data/contacts.json");
  const contacts = JSON.parse(file);
  return contacts;
}

const findContact = (nama) => {
    const contacts = loadContact();
    const contact = contacts.find(contact => contact.nama.toLowerCase() === nama.toLowerCase());
    return contact;
}

// menimpa file kontak json dengan data baru
const saveContacts = (contacts => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
});


// menambahkan data kontak baru
const addContact = (contact) => {
  const contacts = loadContact();
  contacts.push(contact);
  saveContacts(contacts);
};


// cek nama duplikat
const cekDuplikat = (nama) => {
  const contacts = loadContact();
  return contacts.find( contact => contact.nama === nama )
}


//hapus kontak
const deleteContact = (nama) => {
  const contacts = loadContact();
  const newContacts = contacts.filter( contact => contact.nama !== nama );
  saveContacts(newContacts);
};

// const updateContacts = (newContact) => {
//   const contacts = loadContact();
//   const contact = contacts.filter(contact => contact.nama !== newContact.oldNama);
//   delete newContact.oldNama;
//   contact.unshift(newContact);
//   saveContacts(contact);
// }

const updateContacts = (newContact) => {
  const contacts = loadContact();
  const index = contacts.findIndex(contact => contact.nama === newContact.oldNama);

  if (index !== -1) {
    delete newContact.oldNama;
    contacts.splice(index, 1, newContact); 
    saveContacts(contacts);
  } else {
    console.log('Kontak tidak ditemukan');
  }
}


module.exports = { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts }