const express = require('express')
const sqlite3 = require('sqlite3')
const bp = require('body-parser')
const http = require('http')
const url = require ('url')
const fs = require('fs')
const querystring = require('querystring')
let db = new sqlite3.Database('devoirs.db')
let app = express()
var session	= require('express-session')
var sess

// Déclarer session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
//Les Statiques
app.use('/assets',express.static('public'))

    .use(bp.urlencoded({extended:true}))

    // Les routes
    .get('/', (req, res)=>{
        res.setHeader('Content-Type', 'text/html')
        sess=req.session
        res.render('index.pug')
    })

    .get('/collection', (req, res)=>{
        res.setHeader('Content-Type', 'text/html')
        sess=req.session
        db.all("SELECT id, libelle FROM collection", (err,lescollections)=>{
            let menu = {'collections':lescollections}
            res.render("collection.pug",menu)
        })
    })
    .post('/collection/suppconfirmation', function(req, res) {
        sess=req.session
        res.setHeader('Content-Type', 'text/plain')

        let id = req.body.delcol
        console.log(req.body.delcol)
        db.each('SELECT permanente FROM collection WHERE id='+id, (err, possible)=>{
            console.log(possible.permanente)
            if (possible.permanente==0) {
                db.run(`DELETE FROM collection WHERE id=?`, id, function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log(`Row(s) deleted ${this.changes}`);
                    res.setHeader('Content-Type', 'text/html')
                    var lemessage= "Votre collection a bien été supprimé"
                    var message = {'message':lemessage}

                    res.render('confirmation.pug', message)
                });
            }else{
                res.setHeader('Content-Type', 'text/html')
                var lemessage = "Votre collection ne peut pas être supprimé si elle est permanente"
                var message = {'message':lemessage}
                res.render('confirmation.pug', message)
            }
        })

        /* db.run("DELETE FROM collection WHERE id="+req.body.delcol, (result, err)=>{
             res.redirect('/collection')
         })*/
        /*let message="Votre message a bien été supprimé"
        let requete = db.prepare("DELETE FROM collection WHERE id=?")
        console.log(req.body.delcol)
        requete.run(req.body.delcol)
        requete.finalize()
        res.render('confirmation.pug',message)*/
    })
    .get('/collection/supprimer', function(req, res) {
        sess=req.session
        db.all("SELECT id, libelle FROM collection", (err,lescollections2)=>{
            let menudel = {'delcollections':lescollections2}
            res.render("del_collection.pug",menudel)
        })
    })
    .get('/collection/:id', (req, res)=>{
        res.setHeader('Content-Type', 'text/html')
        sess=req.session
        /*db.all("SELECT id, titre, id_collection, id_categorie FROM oeuvre WHERE id_collection="+req.params.id, (err,lesoeuvres)=>{
            let lesoeuvres_menu = {'oeuvres':lesoeuvres}
            res.render("liste_oeuvre.pug",lesoeuvres_menu)
        })*/

        db.all("SELECT oeuvre.id AS id, oeuvre.titre AS titre, oeuvre.id_collection, oeuvre.id_categorie, categories.libelle AS libelle FROM oeuvre JOIN categories ON categories.id = oeuvre.id_categorie WHERE oeuvre.id_collection="+req.params.id, (err,lesoeuvres)=>{
                db.each("SELECT libelle FROM collection WHERE id="+req.params.id,
                    (err,rowcat)=>{
                        console.log(err)
                        let categouevre = {"lacateg":rowcat, "oeuvres":lesoeuvres}
                        res.render("liste_oeuvre.pug", categouevre)
                    })
            })
    })
    .get('/oeuvre/ajouter', (req, res)=>{
        res.setHeader('Content-Type', 'text/html')
        sess=req.session
        db.all("SELECT id, libelle FROM collection",
            (err,rowscollection)=>{
                db.all("SELECT id, libelle FROM categories ",
                    (err,rowscat)=>{
                        let aAfficher = {"categorie":rowscat, "collections":rowscollection}
                        res.render("add_oeuvre.pug", aAfficher)
                    })
            })
    })
    .post('/oeuvre/add/new', (req, res)=>{
        db.all("SELECT * FROM oeuvre", (err, rows)=>{
            if(err){
                res.redirect('/collection')

            }else{
                let id = rows.length+1
                console.log('new article ')
                console.log(req.body.selectcollection)
                let requete = db.prepare("INSERT INTO oeuvre VALUES (?,?,?,?)")
                requete.run(id, req.body.titre, req.body.selectcollection, req.body.selectcategorie)
                requete.finalize()
                res.redirect('/collection')
            }
        })
    })



    .use(function(req, res, next){
        res.setHeader('Content-Type', 'text/plain')
        res.status(404).send('Page introuvable !')
    })

    .listen(8080)