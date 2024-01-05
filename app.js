const expressLayouts = require('express-ejs-layouts');
const express = require('express');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts } = require('./utils/contacts');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// konfigurasi
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.render('index', { 
        layout: 'layouts/main-layout',
        nama: 'Medi Rudiant', 
        title: 'Home page',
    });
});

app.get('/about', (req, res) => {
    res.render('about', { 
        layout: 'layouts/main-layout',
        title: 'about page' 
    });
});

app.get('/contact', (req, res) => {
    const contacts = loadContact();
    const successMessage = req.session.successMessage;
    const successDelete = req.session.successDelete;
    req.session.successMessage = undefined;
    req.session.successDelete = undefined;
    res.render('contact', { 
        layout: 'layouts/main-layout',
        title: 'contact page' ,
        contacts,
        successMessage: successMessage,
        successDelete: successDelete,
        // msg: req.flash('msg'),
    });
});

app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        layout: 'layouts/main-layout',
        title: 'Detail Kontak',
    })
});

const validationPhase = [
    body('nama').custom(value => {
        const duplikat = cekDuplikat(value);
        if(duplikat){
            throw new Error('Nama sudah digunakan')
        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('noHp', 'No Hp tidak valid').isMobilePhone('id-ID'),
]

// proses data kontak
app.post('/contact', validationPhase, (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.render('add-contact', {
            layout: 'layouts/main-layout',
            title: 'Detail Kontak',
            errors: errors.array(),
        })
    } else {
        addContact(req.body);
        req.session.successMessage = 'Berhasil menambahkan kontak baru';
        res.redirect('/contact');
    }
});

app.get('/contact/edit/:nama', (req, res) => {
    const contact = findContact(req.params.nama);
    res.render('edit', {
        layout: 'layouts/main-layout',
        title: 'Edit Kontak',
        contact,
    });
});

const updateValidationPhase = [
    body('nama').custom((value, {req}) => {
        const duplikat = cekDuplikat(value);
        if(value !== req.body.oldNama && duplikat){
            throw new Error('Nama sudah digunakan')
        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('noHp', 'No Hp tidak valid').isMobilePhone('id-ID'),
]

app.post('/contact/update', updateValidationPhase, (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('edit', {
            layout: 'layouts/main-layout',
            title: 'Edit Kontak',
            errors: errors.array(),
            contact: req.body,
        });
    } else {
        updateContacts(req.body);
        req.session.successUpdate = `Berhasil mengubah data kontak ${req.body.nama} 😊`;
        res.redirect(`/contact/${req.body.nama}`);
    }
})

app.get('/contact/delete/:nama', (req, res) => {
    const contact = findContact(req.params.nama);

    if(!contact){
        res.status(404).send('kontak tidak ditemukan')
    } else {
        deleteContact(req.params.nama);
        req.session.successDelete = 'Kontak Berhasil dihapus! 😁';
        res.redirect('/contact')
    }
})

app.get('/contact/:nama', (req, res) => {
    const contact = findContact(req.params.nama);const successUpdate = req.session.successUpdate;
    req.session.successUpdate = undefined;
    res.render('mydetail', {
        layout: 'layouts/main-layout',
        title: 'Detail Kontak',
        contact,
        successUpdate,
    })
})

app.use('/', (req, res) => {
    res.status(404)
    res.send('404 not found')
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});


